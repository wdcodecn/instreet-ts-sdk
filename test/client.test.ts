import { beforeEach, describe, expect, it, vi } from "vitest";

import { InStreetApiError, InStreetClient } from "../src/client.js";
import type { ApiEnvelope } from "../src/types.js";
import {
  arenaLeaderboardFixture,
  arenaStocksFixture,
  commentFixture,
  feedFixture,
  followFixture,
  groupsFixture,
  homeFixture,
  listPostsFixture,
  literaryFixture,
  messageFixture,
  notificationFixture,
  postFixture,
  registerFixture,
  searchFixture,
  threadFixture,
} from "./fixtures.js";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("InStreetClient", () => {
  const fetchMock = vi.fn<typeof fetch>();
  let client: InStreetClient;

  beforeEach(() => {
    fetchMock.mockReset();
    client = new InStreetClient({
      apiKey: "sk_inst_test",
      fetch: fetchMock,
      userAgent: "instreet-sdk-test",
    });
  });

  it("registers an agent without requiring an API key override", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: registerFixture }, 201));

    const response = await new InStreetClient({ fetch: fetchMock }).registerAgent({
      username: "sample_agent_primary",
      bio: "TypeScript SDK verification bot",
    });

    expect(response.data.username).toBe("sample_agent_primary");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://instreet.coze.site/api/v1/agents/register",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("sends authorization and user agent headers for authenticated requests", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: homeFixture }));

    await client.getHome();

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);

    expect(headers.get("Authorization")).toBe("Bearer sk_inst_test");
    expect(headers.get("User-Agent")).toBe("instreet-sdk-test");
  });

  it("supports client cloning with a new api key", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: homeFixture }));

    const cloned = client.withApiKey("sk_inst_other");
    await cloned.getHome();

    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get("Authorization")).toBe("Bearer sk_inst_other");
  });

  it("wraps profile endpoints", async () => {
    const profileFixture = {
      id: "00000000-0000-4000-8000-000000000001",
      username: "sample_agent_primary",
      avatar_url: "generate_image_avatar.jpeg",
      bio: "TypeScript SDK verification bot",
      email: null,
      is_claimed: true,
      score: 12,
      created_at: "2026-03-11T10:23:50.579415+08:00",
      last_active: null,
      profile_url: "https://instreet.coze.site/u/sample_agent_primary",
    };

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: profileFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: profileFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: profileFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { followers: [profileFixture], total: 1, page: 1, limit: 20 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { following: [profileFixture], total: 1, page: 1, limit: 20 } }));

    const me = await client.getMe();
    const updated = await client.updateMe({ bio: "Updated bio" });
    const other = await client.getAgent("sample_agent_primary");
    const followers = await client.getFollowers("sample_agent_primary");
    const following = await client.getFollowing("sample_agent_primary");

    expect(me.data.username).toBe("sample_agent_primary");
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ bio: "Updated bio" });
    expect(other.data.profile_url).toContain("/u/");
    expect(followers.data.followers?.[0]?.username).toBe("sample_agent_primary");
    expect(following.data.following?.[0]?.username).toBe("sample_agent_primary");
  });

  it("serializes post list query params and preserves live nested list shapes", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: listPostsFixture }));

    const response = await client.listPosts({ sort: "new", limit: 1 });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://instreet.coze.site/api/v1/posts?sort=new&limit=1");
    expect(response.data.data[0]?.id).toBe("20000000-0000-4000-8000-000000000002");
    expect(response.data.has_more).toBe(true);
  });

  it("creates and updates posts with JSON payloads", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: postFixture }, 201))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: postFixture, message: "Post updated successfully" }));

    const created = await client.createPost({
      title: "SDK probe post",
      content: "Created by curl for SDK verification.",
      submolt: "square",
    });
    const updated = await client.updatePost(postFixture.id, {
      content: "Edited by curl for SDK verification.",
    });

    const createInit = fetchMock.mock.calls[0]?.[1];
    const updateInit = fetchMock.mock.calls[1]?.[1];

    expect(JSON.parse(String(createInit?.body))).toEqual({
      title: "SDK probe post",
      content: "Created by curl for SDK verification.",
      submolt: "square",
    });
    expect(JSON.parse(String(updateInit?.body))).toEqual({
      content: "Edited by curl for SDK verification.",
    });
    expect(created.data.url).toContain("/post/");
    expect(updated.message).toBe("Post updated successfully");
  });

  it("gets and deletes a single post", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: postFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { deleted: true } }));

    const post = await client.getPost(postFixture.id);
    const deleted = await client.deletePost(postFixture.id);

    expect(post.data.id).toBe(postFixture.id);
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: "DELETE" });
    expect(deleted.data.deleted).toBe(true);
  });

  it("lists and creates comments, including parent_id replies", async () => {
    const replyFixture = {
      ...commentFixture,
      id: "40000000-0000-4000-8000-000000000002",
      agent_id: "00000000-0000-4000-8000-000000000001",
      parent_id: commentFixture.id,
      content: "Reply with parent_id from primary bot.",
      agent: {
        id: "00000000-0000-4000-8000-000000000001",
        username: "sample_agent_primary",
        avatar_url: "generate_image_avatar.jpeg",
        karma: 12,
        score: 12,
      },
    };

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: [commentFixture],
          pagination: {
            page: 1,
            limit: 25,
            totalRootCount: 1,
            totalAllCount: 1,
            totalPages: 1,
            hasMore: false,
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ success: true, data: replyFixture, message: "Comment published successfully! 🎉" }, 201));

    const listed = await client.listComments(postFixture.id, { sort: "latest", page: 1, limit: 25 });
    const created = await client.createComment(postFixture.id, {
      content: "Reply with parent_id from primary bot.",
      parent_id: commentFixture.id,
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `https://instreet.coze.site/api/v1/posts/${postFixture.id}/comments?sort=latest&page=1&limit=25`,
    );
    expect(listed.pagination.totalAllCount).toBe(1);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      content: "Reply with parent_id from primary bot.",
      parent_id: commentFixture.id,
    });
    expect(created.data.parent_id).toBe(commentFixture.id);
  });

  it("toggles upvotes and exposes follow hints from the API envelope", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        message: "Upvoted successfully",
        author: {
          name: "sample_author_public",
          already_following: false,
        },
        tip: "You upvoted @sample_author_public's content. Follow them to see their future posts in your feed",
      }),
    );

    const response = await client.toggleUpvote({
      target_type: "post",
      target_id: "80000000-0000-4000-8000-000000000001",
    });

    expect(response.message).toBe("Upvoted successfully");
    expect(response.tip).toContain("Follow");
  });

  it("wraps poll endpoints", async () => {
    const pollFixture = {
      id: "poll-1",
      question: "Which option?",
      allow_multiple: false,
      total_votes: 1,
      options: [
        { id: "opt-1", text: "A", vote_count: 1, percentage: 100 },
        { id: "opt-2", text: "B", vote_count: 0, percentage: 0 },
      ],
      has_voted: true,
    };

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: pollFixture }, 201))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: pollFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: pollFixture }));

    const created = await client.createPoll(postFixture.id, {
      question: "Which option?",
      options: ["A", "B"],
    });
    const fetched = await client.getPoll(postFixture.id);
    const voted = await client.votePoll(postFixture.id, { option_ids: ["opt-1"] });

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      question: "Which option?",
      options: ["A", "B"],
    });
    expect(created.data.options).toHaveLength(2);
    expect(fetched.data.question).toBe("Which option?");
    expect(voted.data.has_voted).toBe(true);
  });

  it("sends multipart attachment uploads without forcing JSON content type", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: [{ id: "attachment-1" }] }));

    await client.uploadAttachments([
      {
        blob: new Blob(["hello"], { type: "text/plain" }),
        filename: "hello.txt",
      },
    ]);

    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);

    expect(init?.body).toBeInstanceOf(FormData);
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("wraps messaging endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [threadFixture] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: messageFixture, message: "Message sent successfully" }, 201))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: messageFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: "accepted" } }));

    const threads = await client.listMessages();
    const sent = await client.sendMessage({
      recipient_username: "sample_agent_peer",
      content: "Hello from sample SDK sender",
    });
    const reply = await client.replyMessage(threadFixture.id, { content: "reply" });
    const accepted = await client.acceptMessageRequest(threadFixture.id);

    expect(threads.data[0]?.unread_count).toBe(1);
    expect(sent.data.thread_id).toBe(threadFixture.id);
    expect(reply.data.content).toBe(messageFixture.content);
    expect(accepted.data.status).toBe("accepted");
  });

  it("lists notifications and marks them read", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [notificationFixture] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, message: "Notifications marked as read" }))
      .mockResolvedValueOnce(jsonResponse({ success: true, message: "Notifications for this post marked as read" }));

    const listed = await client.listNotifications(true);
    const markedAll = await client.markAllNotificationsRead();
    const markedPost = await client.markNotificationsReadByPost(postFixture.id);

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://instreet.coze.site/api/v1/notifications?unread=true");
    expect(listed.data[0]?.type).toBe("comment");
    expect(markedAll.message).toContain("read");
    expect(markedPost.message).toContain("read");
  });

  it("supports search, follow, and feed endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: searchFixture, query: "skill", type: "posts", results: searchFixture.results, count: 1 }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: followFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: feedFixture }));

    const search = await client.search("skill", "posts");
    const follow = await client.toggleFollow("sample_agent_peer");
    const feed = await client.getFeed({ sort: "new", limit: 5 });

    expect(search.data.results[0]?.post_id).toBe("80000000-0000-4000-8000-000000000001");
    expect(follow.data.action).toBe("followed");
    expect(feed.data.following_count).toBe(1);
  });

  it("wraps group endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { groups: groupsFixture, total: 44, page: 1, limit: 20 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: "joined" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { posts: [postFixture], total: 1, page: 1, limit: 20 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { groups: groupsFixture, total: 1, page: 1, limit: 20 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { members: [groupsFixture[0]!.owner], total: 1, page: 1, limit: 20 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: "approved" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: "pinned" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { status: "unpinned" } }));

    const listed = await client.listGroups({ sort: "hot" });
    const joined = await client.joinGroup(groupsFixture[0]!.id);
    const posts = await client.listGroupPosts(groupsFixture[0]!.id, { sort: "hot" });
    const mine = await client.listMyGroups("owner");
    const members = await client.listGroupMembers(groupsFixture[0]!.id, "pending");
    const reviewed = await client.reviewGroupMember(groupsFixture[0]!.id, "agent-1", { action: "approve" });
    const pinned = await client.pinGroupPost(groupsFixture[0]!.id, postFixture.id);
    const unpinned = await client.unpinGroupPost(groupsFixture[0]!.id, postFixture.id);

    expect(listed.data.groups[0]?.display_name).toBe("Sample Group");
    expect(joined.data.status).toBe("joined");
    expect(posts.data.posts[0]?.id).toBe(postFixture.id);
    expect(mine.data.total).toBe(1);
    expect(members.data.total).toBe(1);
    expect(reviewed.data.status).toBe("approved");
    expect(pinned.data.status).toBe("pinned");
    expect(unpinned.data.status).toBe("unpinned");
  });

  it("wraps literary endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { works: [literaryFixture], page: 1, limit: 20 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { work_id: literaryFixture.id, chapter_number: 1, content: "chapter" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { liked: true, like_count: 168 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: commentFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { subscribed: true, subscriber_count: 79 } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: literaryFixture.id } }, 201))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { work_id: literaryFixture.id, chapter_number: 63, content: "new chapter" } }, 201));

    const works = await client.listLiteraryWorks({ sort: "popular" });
    const chapter = await client.getLiteraryChapter(literaryFixture.id, 1);
    const liked = await client.likeLiteraryWork(literaryFixture.id);
    const commented = await client.commentLiteraryWork(literaryFixture.id, { content: "Great work" });
    const subscribed = await client.subscribeLiteraryWork(literaryFixture.id);
    const created = await client.createLiteraryWork({
      title: "SDK novel",
      synopsis: "sync",
      genre: "sci-fi",
    });
    const published = await client.publishLiteraryChapter(literaryFixture.id, {
      title: "Ch 63",
      content: "new chapter",
    });

    expect(works.data.works[0]?.title).toBe("Sample serialized story");
    expect(chapter.data.chapter_number).toBe(1);
    expect(liked.data.like_count).toBe(168);
    expect(commented.data.content).toBe(commentFixture.content);
    expect(subscribed.data.subscriber_count).toBe(79);
    expect(created.data.id).toBe(literaryFixture.id);
    expect(published.data.chapter_number).toBe(63);
  });

  it("wraps arena endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: true, data: arenaLeaderboardFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: arenaStocksFixture }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { message: "成功加入虚拟炒股竞技场！", portfolio: { cash: 1000000, total_value: 1000000, return_rate: 0 } } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { trade_id: "trade-1", portfolio: { cash: 950000, total_value: 1000000, return_rate: 0 } } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { cash: 950000, total_value: 1000000, return_rate: 0, holdings: [] } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { trades: [{ id: "trade-1", symbol: "sh600000", stock_name: "浦发银行", action: "buy", shares: 100, price: 9.95, amount: 995, fee: 0.5, executed_at: "2026-03-11T10:00:00.308+08:00" }] } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { snapshots: [{ timestamp: "2026-03-11T10:00:00.308+08:00", total_value: 1000000, cash: 950000 }] } }));

    const leaderboard = await client.getArenaLeaderboard();
    const stocks = await client.listArenaStocks({ limit: 3 });
    const joined = await client.joinArena();
    const traded = await client.tradeArenaStock({ symbol: "sh600000", action: "buy", shares: 100 });
    const portfolio = await client.getArenaPortfolio();
    const trades = await client.listArenaTrades();
    const snapshots = await client.listArenaSnapshots();

    expect(leaderboard.data.stats.participants).toBe(1459);
    expect(stocks.data.stocks[0]?.symbol).toBe("sh600000");
    expect(joined.data.portfolio.cash).toBe(1000000);
    expect(traded.data.trade_id).toBe("trade-1");
    expect(portfolio.data.holdings).toEqual([]);
    expect(trades.data.trades[0]?.stock_name).toBe("浦发银行");
    expect(snapshots.data.snapshots[0]?.cash).toBe(950000);
  });

  it("throws a structured error for non-2xx responses", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: "Missing or invalid Authorization header",
        },
        401,
      ),
    );

    const promise = new InStreetClient({ fetch: fetchMock }).getHome();

    await expect(promise).rejects.toBeInstanceOf(InStreetApiError);
    await expect(promise).rejects.toMatchObject({
      status: 401,
      message: "Missing or invalid Authorization header",
    });
  });

  it("preserves response typing for downstream consumers", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, data: homeFixture }));

    const response = await client.getHome();
    const typed: ApiEnvelope<typeof homeFixture> = response;

    expect(typed.data.quick_links.messages).toBe("GET /api/v1/messages");
  });
});
