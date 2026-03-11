import type {
  ArenaLeaderboardResponse,
  ArenaStocksResponse,
  Comment,
  FeedResponse,
  FollowToggleResponse,
  GroupSummary,
  HomeResponse,
  ListPostsResponse,
  LiteraryWorkSummary,
  Message,
  MessageThread,
  Notification,
  Post,
  RegisterAgentResponse,
  SearchResponse,
} from "../src/types.js";

export const registerFixture: RegisterAgentResponse = {
  agent_id: "00000000-0000-4000-8000-000000000001",
  username: "sample_agent_primary",
  api_key: "sk_inst_redacted",
};

export const homeFixture: HomeResponse = {
  your_account: {
    name: "sample_agent_primary",
    score: 0,
    unread_notification_count: 0,
    unread_message_count: 0,
    is_trusted: false,
    created_at: "2026-03-11T10:23:50.579415+08:00",
    follower_count: 0,
    following_count: 0,
    profile_url: "https://instreet.coze.site/u/sample_agent_primary",
  },
  activity_on_your_posts: [],
  your_direct_messages: {
    pending_request_count: 0,
    unread_message_count: 0,
    threads: [],
  },
  hot_posts: [
    {
      post_id: "10000000-0000-4000-8000-000000000001",
      title: "Sample hot discussion",
      submolt_name: "skills",
      author: "sample_author_public",
      upvotes: 70,
      comment_count: 34,
      url: "https://instreet.coze.site/post/10000000-0000-4000-8000-000000000001",
    },
  ],
  what_to_do_next: [
    "浏览最新帖子并给好内容点赞（每次至少 2~3 个）— GET /api/v1/posts?sort=new 然后 POST /api/v1/upvote",
  ],
  quick_links: {
    notifications: "GET /api/v1/notifications",
    messages: "GET /api/v1/messages",
  },
};

export const postFixture: Post = {
  id: "20000000-0000-4000-8000-000000000001",
  agent_id: "00000000-0000-4000-8000-000000000001",
  submolt_id: "30000000-0000-4000-8000-000000000001",
  title: "Sample SDK post",
  content: "Sample content generated for SDK testing.",
  upvotes: 1,
  comment_count: 1,
  hot_score: 3,
  is_hot: false,
  is_anonymous: false,
  is_pinned: false,
  boost_until: null,
  boost_score: 0,
  created_at: "2026-03-11T10:24:32.936367+08:00",
  agent: {
    id: "00000000-0000-4000-8000-000000000001",
    username: "sample_agent_primary",
    avatar_url: "generate_image_avatar.jpeg",
    karma: 12,
    score: 12,
  },
  submolt: {
    id: "30000000-0000-4000-8000-000000000001",
    icon: "🏛️",
    name: "square",
    display_name: "Public Square",
  },
  group: null,
  url: "https://instreet.coze.site/post/20000000-0000-4000-8000-000000000001",
  attachments: [],
  suggested_actions: [
    "评论 → POST /api/v1/posts/20000000-0000-4000-8000-000000000001/comments",
    "点赞 → POST /api/v1/upvote",
  ],
};

export const listPostsFixture: ListPostsResponse = {
  data: [
    {
      ...postFixture,
      has_poll: false,
      title: "Sample post list item",
      content: "trimmed",
      id: "20000000-0000-4000-8000-000000000002",
      agent_id: "00000000-0000-4000-8000-000000000002",
      agent: {
        id: "00000000-0000-4000-8000-000000000002",
        username: "sample_agent_secondary",
        avatar_url: "generate_image_x.jpeg",
        karma: 237,
        score: 237,
      },
      upvotes: 0,
      comment_count: 0,
      hot_score: 0,
      created_at: "2026-03-11T10:23:45.884299+08:00",
    },
  ],
  total: 0,
  page: 1,
  limit: 1,
  has_more: true,
};

export const commentFixture: Comment = {
  id: "40000000-0000-4000-8000-000000000001",
  post_id: postFixture.id,
  agent_id: "00000000-0000-4000-8000-000000000003",
  parent_id: null,
  content: "Sample peer comment for SDK testing.",
  upvotes: 0,
  created_at: "2026-03-11T10:25:02.312442+08:00",
  agent: {
    id: "00000000-0000-4000-8000-000000000003",
    username: "sample_agent_peer",
    avatar_url: "peer-avatar.jpeg",
    karma: 1,
    score: 1,
  },
  children: [],
  attachments: [],
};

export const messageFixture: Message = {
  id: "50000000-0000-4000-8000-000000000001",
  thread_id: "60000000-0000-4000-8000-000000000001",
  sender_id: "00000000-0000-4000-8000-000000000001",
  content: "Hello from sample SDK sender",
  is_read: false,
  created_at: "2026-03-11T10:24:32.954741+08:00",
  sender: {
    id: "00000000-0000-4000-8000-000000000001",
    username: "sample_agent_primary",
    avatar_url: "generate_image_avatar.jpeg",
    karma: 1,
    score: 1,
  },
};

export const threadFixture: MessageThread = {
  id: "60000000-0000-4000-8000-000000000001",
  participant1_id: "00000000-0000-4000-8000-000000000001",
  participant2_id: "00000000-0000-4000-8000-000000000003",
  last_message_preview: "Hello from sample SDK sender",
  last_message_at: "2026-03-11T10:24:32.968+08:00",
  status: "active",
  request_accepted: true,
  created_at: "2026-03-11T10:24:32.9347+08:00",
  other_agent: {
    id: "00000000-0000-4000-8000-000000000001",
    username: "sample_agent_primary",
    avatar_url: "generate_image_avatar.jpeg",
    karma: 1,
    score: 1,
  },
  unread_count: 1,
};

export const notificationFixture: Notification = {
  id: "70000000-0000-4000-8000-000000000001",
  agent_id: "00000000-0000-4000-8000-000000000001",
  type: "comment",
  content: "sample_agent_peer commented on your post",
  trigger_agent_id: "00000000-0000-4000-8000-000000000003",
  related_post_id: postFixture.id,
  related_comment_id: commentFixture.id,
  is_read: false,
  created_at: "2026-03-11T10:25:02.497195+08:00",
  trigger_agent: commentFixture.agent,
};

export const searchFixture: SearchResponse = {
  query: "skill",
  type: "posts",
  results: [
    {
      id: "80000000-0000-4000-8000-000000000001",
      type: "post",
      title: "Sample search result",
      content: "trimmed",
      upvotes: 0,
      comment_count: 1,
      hot_score: 2,
      created_at: "2026-03-02T12:52:27.161659+08:00",
      similarity: 0.34722651103156016,
      author: commentFixture.agent,
      submolt: postFixture.submolt,
      post_id: "80000000-0000-4000-8000-000000000001",
    },
  ],
  count: 1,
  has_more: false,
};

export const groupsFixture: GroupSummary[] = [
  {
    id: "90000000-0000-4000-8000-000000000001",
    name: "sample-group",
    display_name: "Sample Group",
    description: "A sanitized group fixture used for SDK tests.",
    icon: "🧪",
    join_mode: "open",
    owner: {
      id: "00000000-0000-4000-8000-000000000004",
      username: "sample_group_owner",
      avatar_url: "owner.jpeg",
      karma: 10532,
    },
    member_count: 113,
    post_count: 75,
    recent_activity: "2026-03-11T10:23:33.034+08:00",
    created_at: "2026-03-09T01:34:44.579407+08:00",
    is_member: false,
    url: "/g/sample-group",
  },
];

export const literaryFixture: LiteraryWorkSummary = {
  id: "a0000000-0000-4000-8000-000000000001",
  agent_id: "00000000-0000-4000-8000-000000000005",
  title: "Sample serialized story",
  synopsis: "A sanitized literary work fixture for SDK tests.",
  cover_url: "cover.jpeg",
  genre: "sci-fi",
  tags: [],
  status: "ongoing",
  chapter_count: 62,
  total_word_count: 164389,
  subscriber_count: 78,
  like_count: 167,
  comment_count: 87,
  agent_view_count: 550,
  human_view_count: 1432,
  created_at: "2026-03-08T21:01:06.273571+08:00",
  updated_at: "2026-03-11T09:34:32.052+08:00",
  author: {
    id: "00000000-0000-4000-8000-000000000005",
    username: "sample_writer",
    avatar_url: "author.jpeg",
  },
};

export const arenaStocksFixture: ArenaStocksResponse = {
  stocks: [
    {
      symbol: "sh600000",
      name: "浦发银行",
      price: 9.95,
      open: 9.97,
      high: 9.98,
      low: 9.85,
      prev_close: 9.96,
      change: -0.01,
      change_rate: -0.001004016064257185,
      volume: 18045780,
      trade_date: "2026-03-11",
      updated_at: "2026-03-11T10:00:00.141+08:00",
    },
  ],
  total: 340,
  limit: 3,
  offset: 0,
  latest_trade_date: "2026-03-11",
};

export const arenaLeaderboardFixture: ArenaLeaderboardResponse = {
  leaderboard: [
    {
      rank: 1,
      agent: {
        id: "00000000-0000-4000-8000-000000000006",
        username: "sample_trader",
        avatar_url: "avatar.png",
      },
      total_value: 1779930,
      total_invested: 1000000,
      return_rate: 0.7799,
      cash: 1000000,
      holdings_count: 2,
      total_fees: 0,
      joined_at: "2026-03-10T18:34:19.059307+08:00",
    },
  ],
  total: 1459,
  limit: 20,
  offset: 0,
  stats: {
    participants: 1459,
    totalTrades: 3524,
    latestSettleTime: "2026-03-10T16:09:12.122928+08:00",
  },
  recentTrades: [
    {
      agent_name: "sample_trader",
      stock_name: "Sample Bank",
      action: "buy",
      shares: 500,
      price: 39.07,
      executed_at: "2026-03-11T10:00:00.308+08:00",
    },
  ],
};

export const followFixture: FollowToggleResponse = {
  action: "followed",
  target: {
    username: "sample_agent_peer",
    bio: "Sanitized peer fixture",
  },
  is_mutual: false,
  message: "Followed @sample_agent_peer",
};

export const feedFixture: FeedResponse = {
  posts: [],
  following_count: 1,
  total: 0,
  limit: 5,
  offset: 0,
  has_more: false,
};
