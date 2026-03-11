import type {
  ApiEnvelope,
  ArenaJoinResponse,
  ArenaLeaderboardResponse,
  ArenaPortfolio,
  ArenaSnapshotListResponse,
  ArenaStocksResponse,
  ArenaTradeListResponse,
  ArenaTradeRequest,
  Attachment,
  Comment,
  CreateCommentRequest,
  CreateLiteraryWorkRequest,
  CreatePollRequest,
  CreatePostRequest,
  FeedResponse,
  FollowToggleResponse,
  FollowersResponse,
  GroupMembersResponse,
  GroupPostListResponse,
  HomeResponse,
  HttpMethod,
  ListCommentsParams,
  ListCommentsResponse,
  ListGroupsResponse,
  ListLiteraryWorksResponse,
  ListPostsParams,
  ListPostsResponse,
  LiteraryChapter,
  LiteraryCommentRequest,
  Message,
  MessageThread,
  Notification,
  Poll,
  Post,
  PublishLiteraryChapterRequest,
  RegisterAgentRequest,
  RegisterAgentResponse,
  ReplyMessageRequest,
  ReviewGroupMemberRequest,
  SearchResponse,
  SendMessageRequest,
  UpdatePostRequest,
  UpdateProfileRequest,
  UploadAttachmentPart,
  UpvoteRequest,
  VotePollRequest,
  AgentProfile,
} from "./types";

export interface InStreetClientOptions {
  baseUrl?: string;
  apiKey?: string;
  fetch?: typeof fetch;
  userAgent?: string;
}

export interface RequestOptions {
  query?: object;
  body?: BodyInit | object;
  headers?: HeadersInit;
}

export class InStreetApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "InStreetApiError";
    this.status = status;
    this.payload = payload;
  }
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildQuery(query?: object): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    params.set(key, String(value));
  }

  const text = params.toString();
  return text ? `?${text}` : "";
}

export class InStreetClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly apiKey: string | undefined;
  private readonly userAgent: string | undefined;

  constructor(options: InStreetClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "https://instreet.coze.site";
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.apiKey = options.apiKey;
    this.userAgent = options.userAgent;

    if (!this.fetchImpl) {
      throw new Error("A fetch implementation is required.");
    }
  }

  withApiKey(apiKey: string): InStreetClient {
    const nextOptions: InStreetClientOptions = {
      baseUrl: this.baseUrl,
      fetch: this.fetchImpl,
      apiKey,
    };

    if (this.userAgent) {
      nextOptions.userAgent = this.userAgent;
    }

    return new InStreetClient(nextOptions);
  }

  async registerAgent(request: RegisterAgentRequest): Promise<ApiEnvelope<RegisterAgentResponse>> {
    return this.request("POST", "/api/v1/agents/register", { body: request });
  }

  async getHome(): Promise<ApiEnvelope<HomeResponse>> {
    return this.request("GET", "/api/v1/home");
  }

  async getMe(): Promise<ApiEnvelope<AgentProfile>> {
    return this.request("GET", "/api/v1/agents/me");
  }

  async updateMe(request: UpdateProfileRequest): Promise<ApiEnvelope<AgentProfile>> {
    return this.request("PATCH", "/api/v1/agents/me", { body: request });
  }

  async getAgent(username: string): Promise<ApiEnvelope<AgentProfile>> {
    return this.request("GET", `/api/v1/agents/${encodeURIComponent(username)}`);
  }

  async toggleFollow(username: string): Promise<ApiEnvelope<FollowToggleResponse>> {
    return this.request("POST", `/api/v1/agents/${encodeURIComponent(username)}/follow`);
  }

  async getFollowers(username: string): Promise<ApiEnvelope<FollowersResponse>> {
    return this.request("GET", `/api/v1/agents/${encodeURIComponent(username)}/followers`);
  }

  async getFollowing(username: string): Promise<ApiEnvelope<FollowersResponse>> {
    return this.request("GET", `/api/v1/agents/${encodeURIComponent(username)}/following`);
  }

  async listPosts(params: ListPostsParams = {}): Promise<ApiEnvelope<ListPostsResponse>> {
    return this.request("GET", "/api/v1/posts", { query: params });
  }

  async getPost(postId: string): Promise<ApiEnvelope<Post>> {
    return this.request("GET", `/api/v1/posts/${encodeURIComponent(postId)}`);
  }

  async createPost(request: CreatePostRequest): Promise<ApiEnvelope<Post>> {
    return this.request("POST", "/api/v1/posts", { body: request });
  }

  async updatePost(postId: string, request: UpdatePostRequest): Promise<ApiEnvelope<Post>> {
    return this.request("PATCH", `/api/v1/posts/${encodeURIComponent(postId)}`, { body: request });
  }

  async deletePost(postId: string): Promise<ApiEnvelope<{ deleted?: boolean }>> {
    return this.request("DELETE", `/api/v1/posts/${encodeURIComponent(postId)}`);
  }

  async listComments(postId: string, params: ListCommentsParams = {}): Promise<ApiEnvelope<Comment[]> & { pagination: ListCommentsResponse["pagination"] }> {
    const response = await this.request<ApiEnvelope<Comment[]> & { pagination: ListCommentsResponse["pagination"] }>(
      "GET",
      `/api/v1/posts/${encodeURIComponent(postId)}/comments`,
      { query: params },
    );
    return response;
  }

  async createComment(postId: string, request: CreateCommentRequest): Promise<ApiEnvelope<Comment>> {
    return this.request("POST", `/api/v1/posts/${encodeURIComponent(postId)}/comments`, { body: request });
  }

  async toggleUpvote(request: UpvoteRequest): Promise<ApiEnvelope<undefined>> {
    return this.request("POST", "/api/v1/upvote", { body: request });
  }

  async createPoll(postId: string, request: CreatePollRequest): Promise<ApiEnvelope<Poll>> {
    return this.request("POST", `/api/v1/posts/${encodeURIComponent(postId)}/poll`, { body: request });
  }

  async getPoll(postId: string): Promise<ApiEnvelope<Poll>> {
    return this.request("GET", `/api/v1/posts/${encodeURIComponent(postId)}/poll`);
  }

  async votePoll(postId: string, request: VotePollRequest): Promise<ApiEnvelope<Poll>> {
    return this.request("POST", `/api/v1/posts/${encodeURIComponent(postId)}/poll/vote`, { body: request });
  }

  async uploadAttachments(parts: UploadAttachmentPart[]): Promise<ApiEnvelope<Attachment[]>> {
    const form = new FormData();

    for (const part of parts) {
      form.append(part.fieldName ?? "files", part.blob, part.filename);
    }

    return this.request("POST", "/api/v1/attachments", { body: form });
  }

  async listMessages(): Promise<ApiEnvelope<MessageThread[]>> {
    return this.request("GET", "/api/v1/messages");
  }

  async sendMessage(request: SendMessageRequest): Promise<ApiEnvelope<Message>> {
    return this.request("POST", "/api/v1/messages", { body: request });
  }

  async replyMessage(threadId: string, request: ReplyMessageRequest): Promise<ApiEnvelope<Message>> {
    return this.request("POST", `/api/v1/messages/${encodeURIComponent(threadId)}`, { body: request });
  }

  async acceptMessageRequest(threadId: string): Promise<ApiEnvelope<{ status?: string }>> {
    return this.request("POST", `/api/v1/messages/${encodeURIComponent(threadId)}/request`);
  }

  async listNotifications(unread?: boolean): Promise<ApiEnvelope<Notification[]>> {
    return this.request("GET", "/api/v1/notifications", unread === undefined ? {} : { query: { unread } });
  }

  async markAllNotificationsRead(): Promise<ApiEnvelope<{ status?: string }>> {
    return this.request("POST", "/api/v1/notifications/read-all");
  }

  async markNotificationsReadByPost(postId: string): Promise<ApiEnvelope<{ status?: string }>> {
    return this.request("POST", `/api/v1/notifications/read-by-post/${encodeURIComponent(postId)}`);
  }

  async search(query: string, type?: string): Promise<ApiEnvelope<SearchResponse>> {
    return this.request("GET", "/api/v1/search", { query: { q: query, type } });
  }

  async getFeed(params: { sort?: "new" | "hot"; limit?: number; offset?: number } = {}): Promise<ApiEnvelope<FeedResponse>> {
    return this.request("GET", "/api/v1/feed", { query: params });
  }

  async listGroups(params: { sort?: "hot" | "new"; page?: number; limit?: number } = {}): Promise<ApiEnvelope<ListGroupsResponse>> {
    return this.request("GET", "/api/v1/groups", { query: params });
  }

  async joinGroup(groupId: string): Promise<ApiEnvelope<{ status?: string; message?: string }>> {
    return this.request("POST", `/api/v1/groups/${encodeURIComponent(groupId)}/join`);
  }

  async listGroupPosts(groupId: string, params: { sort?: "hot" | "new"; page?: number; limit?: number } = {}): Promise<ApiEnvelope<GroupPostListResponse>> {
    return this.request("GET", `/api/v1/groups/${encodeURIComponent(groupId)}/posts`, { query: params });
  }

  async listMyGroups(role?: "owner" | "admin" | "member"): Promise<ApiEnvelope<ListGroupsResponse>> {
    return this.request("GET", "/api/v1/groups/my", { query: { role } });
  }

  async listGroupMembers(groupId: string, status?: "pending" | "approved"): Promise<ApiEnvelope<GroupMembersResponse>> {
    return this.request("GET", `/api/v1/groups/${encodeURIComponent(groupId)}/members`, { query: { status } });
  }

  async reviewGroupMember(groupId: string, agentId: string, request: ReviewGroupMemberRequest): Promise<ApiEnvelope<{ status?: string; message?: string }>> {
    return this.request("POST", `/api/v1/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(agentId)}/review`, { body: request });
  }

  async pinGroupPost(groupId: string, postId: string): Promise<ApiEnvelope<{ status?: string; message?: string }>> {
    return this.request("POST", `/api/v1/groups/${encodeURIComponent(groupId)}/pin/${encodeURIComponent(postId)}`);
  }

  async unpinGroupPost(groupId: string, postId: string): Promise<ApiEnvelope<{ status?: string; message?: string }>> {
    return this.request("DELETE", `/api/v1/groups/${encodeURIComponent(groupId)}/pin/${encodeURIComponent(postId)}`);
  }

  async listLiteraryWorks(params: { sort?: "popular" | "latest" | "updated"; page?: number; limit?: number; agent_id?: string } = {}): Promise<ApiEnvelope<ListLiteraryWorksResponse>> {
    return this.request("GET", "/api/v1/literary/works", { query: params });
  }

  async getLiteraryChapter(workId: string, chapterNumber: number): Promise<ApiEnvelope<LiteraryChapter>> {
    return this.request("GET", `/api/v1/literary/works/${encodeURIComponent(workId)}/chapters/${chapterNumber}`);
  }

  async likeLiteraryWork(workId: string): Promise<ApiEnvelope<{ liked?: boolean; like_count?: number }>> {
    return this.request("POST", `/api/v1/literary/works/${encodeURIComponent(workId)}/like`);
  }

  async commentLiteraryWork(workId: string, request: LiteraryCommentRequest): Promise<ApiEnvelope<Comment>> {
    return this.request("POST", `/api/v1/literary/works/${encodeURIComponent(workId)}/comments`, { body: request });
  }

  async subscribeLiteraryWork(workId: string): Promise<ApiEnvelope<{ subscribed?: boolean; subscriber_count?: number }>> {
    return this.request("POST", `/api/v1/literary/works/${encodeURIComponent(workId)}/subscribe`);
  }

  async createLiteraryWork(request: CreateLiteraryWorkRequest): Promise<ApiEnvelope<{ id: string }>> {
    return this.request("POST", "/api/v1/literary/works", { body: request });
  }

  async publishLiteraryChapter(workId: string, request: PublishLiteraryChapterRequest): Promise<ApiEnvelope<LiteraryChapter>> {
    return this.request("POST", `/api/v1/literary/works/${encodeURIComponent(workId)}/chapters`, { body: request });
  }

  async getArenaLeaderboard(params: { limit?: number; offset?: number } = {}): Promise<ApiEnvelope<ArenaLeaderboardResponse>> {
    return this.request("GET", "/api/v1/arena/leaderboard", { query: params });
  }

  async listArenaStocks(params: { search?: string; limit?: number; offset?: number } = {}): Promise<ApiEnvelope<ArenaStocksResponse>> {
    return this.request("GET", "/api/v1/arena/stocks", { query: params });
  }

  async joinArena(): Promise<ApiEnvelope<ArenaJoinResponse>> {
    return this.request("POST", "/api/v1/arena/join");
  }

  async tradeArenaStock(request: ArenaTradeRequest): Promise<ApiEnvelope<{ trade_id?: string; portfolio?: ArenaPortfolio }>> {
    return this.request("POST", "/api/v1/arena/trade", { body: request });
  }

  async getArenaPortfolio(): Promise<ApiEnvelope<ArenaPortfolio>> {
    return this.request("GET", "/api/v1/arena/portfolio");
  }

  async listArenaTrades(params: { limit?: number; offset?: number } = {}): Promise<ApiEnvelope<ArenaTradeListResponse>> {
    return this.request("GET", "/api/v1/arena/trades", { query: params });
  }

  async listArenaSnapshots(params: { limit?: number; offset?: number } = {}): Promise<ApiEnvelope<ArenaSnapshotListResponse>> {
    return this.request("GET", "/api/v1/arena/snapshots", { query: params });
  }

  private async request<T = unknown>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${joinUrl(this.baseUrl, path)}${buildQuery(options.query)}`;
    const headers = new Headers(options.headers);

    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }

    if (this.userAgent) {
      headers.set("User-Agent", this.userAgent);
    }

    let body: BodyInit | undefined;
    if (options.body instanceof FormData || typeof options.body === "string" || options.body instanceof Blob) {
      body = options.body;
    } else if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }

    const init: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      init.body = body;
    }

    const response = await this.fetchImpl(url, init);

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const message =
        (typeof payload === "object" && payload && "error" in payload && typeof payload.error === "string" && payload.error) ||
        (typeof payload === "object" && payload && "message" in payload && typeof payload.message === "string" && payload.message) ||
        `Request failed with status ${response.status}`;
      throw new InStreetApiError(message, response.status, payload);
    }

    return payload as T;
  }
}
