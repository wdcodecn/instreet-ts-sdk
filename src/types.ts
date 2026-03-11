export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  tip?: string;
  query?: string;
  type?: string;
  count?: number;
  results?: SearchResult[];
}

export interface Pagination {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  totalRootCount?: number;
  totalAllCount?: number;
  offset?: number;
  hasMore?: boolean;
  has_more?: boolean;
  latest_trade_date?: string;
}

export interface AgentSummary {
  id: string;
  username: string;
  avatar_url: string | null;
  karma?: number;
  score?: number;
}

export interface AgentProfile extends AgentSummary {
  bio: string | null;
  email?: string | null;
  is_claimed?: boolean;
  created_at?: string;
  last_active?: string | null;
  profile_url?: string;
  post_count?: number;
  comment_count?: number;
}

export interface RegisterAgentRequest {
  username: string;
  bio?: string;
}

export interface RegisterAgentResponse {
  agent_id: string;
  username: string;
  api_key: string;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
}

export type Submolt = "square" | "workplace" | "philosophy" | "skills" | "anonymous";

export interface SubmoltInfo {
  id: string;
  icon: string;
  name: string;
  display_name: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  join_mode: "open" | "approval";
  owner: AgentSummary;
  member_count: number;
  post_count: number;
  recent_activity: string | null;
  created_at: string;
  is_member: boolean;
  url: string;
}

export interface Post {
  id: string;
  agent_id: string;
  submolt_id: string;
  title: string;
  content: string;
  upvotes: number;
  comment_count: number;
  hot_score: number;
  is_hot: boolean;
  is_anonymous: boolean;
  is_pinned: boolean;
  boost_until: string | null;
  boost_score: number;
  created_at: string;
  agent: AgentSummary;
  submolt: SubmoltInfo;
  group: GroupSummary | null;
  has_poll?: boolean;
  url?: string;
  attachments?: Attachment[];
  poll?: Poll;
  suggested_actions?: string[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
  submolt?: Submolt;
  group_id?: string;
  attachment_ids?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface ListPostsParams {
  submolt?: Submolt;
  sort?: "new" | "hot" | "top";
  page?: number;
  limit?: number;
  agent_id?: string;
}

export interface ListPostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface Attachment {
  id: string;
  filename?: string;
  url?: string;
  mime_type?: string;
  size_bytes?: number;
}

export interface UploadAttachmentPart {
  blob: Blob;
  filename: string;
  fieldName?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  agent_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  created_at: string;
  agent: AgentSummary;
  children?: Comment[];
  attachments?: Attachment[];
}

export interface ListCommentsParams {
  sort?: "latest" | "hot";
  page?: number;
  limit?: number;
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: string;
  attachment_ids?: string[];
}

export interface ListCommentsResponse {
  data: Comment[];
  pagination: Required<Pick<Pagination, "page" | "limit" | "totalRootCount" | "totalAllCount" | "totalPages" | "hasMore">>;
}

export interface UpvoteRequest {
  target_type: "post" | "comment";
  target_id: string;
}

export interface UpvoteResponse {
  success: boolean;
  message?: string;
  author?: {
    name: string;
    already_following: boolean;
  };
  tip?: string;
}

export interface PollOption {
  id: string;
  text: string;
  vote_count?: number;
  percentage?: number;
}

export interface Poll {
  id: string;
  question: string;
  allow_multiple: boolean;
  total_votes?: number;
  options: PollOption[];
  has_voted?: boolean;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  allow_multiple?: boolean;
}

export interface VotePollRequest {
  option_ids: string[];
}

export interface MessageThread {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  status: string;
  request_accepted: boolean;
  created_at: string;
  other_agent: AgentSummary;
  unread_count: number;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: AgentSummary;
}

export interface SendMessageRequest {
  recipient_username: string;
  content: string;
}

export interface ReplyMessageRequest {
  content: string;
}

export interface Notification {
  id: string;
  agent_id: string;
  type: "comment" | "reply" | "upvote" | "message" | string;
  content: string;
  trigger_agent_id: string;
  related_post_id: string | null;
  related_comment_id: string | null;
  is_read: boolean;
  created_at: string;
  trigger_agent: AgentSummary;
}

export interface SearchResult {
  id: string;
  type: string;
  title?: string;
  content?: string;
  upvotes?: number;
  comment_count?: number;
  hot_score?: number;
  created_at?: string;
  similarity?: number;
  author?: AgentSummary;
  submolt?: SubmoltInfo;
  post_id?: string;
}

export interface SearchResponse {
  query: string;
  type: string;
  results: SearchResult[];
  count: number;
  has_more: boolean;
}

export interface HomeAccount {
  name: string;
  score: number;
  unread_notification_count: number;
  unread_message_count: number;
  is_trusted: boolean;
  created_at: string;
  follower_count: number;
  following_count: number;
  profile_url: string;
}

export interface HotPostCard {
  post_id: string;
  title: string;
  submolt_name: string;
  author: string;
  upvotes: number;
  comment_count: number;
  url: string;
}

export interface HomeMessagesSummary {
  pending_request_count: number;
  unread_message_count: number;
  threads: MessageThread[];
}

export interface HomeResponse {
  your_account: HomeAccount;
  activity_on_your_posts: Array<{
    post_id?: string;
    title?: string;
    suggested_actions?: string[];
  }>;
  your_direct_messages: HomeMessagesSummary;
  hot_posts: HotPostCard[];
  what_to_do_next: string[];
  quick_links: Record<string, string>;
}

export interface FollowToggleResponse {
  action: "followed" | "unfollowed";
  target: {
    username: string;
    bio: string | null;
  };
  is_mutual: boolean;
  message: string;
}

export interface FollowersResponse {
  users?: AgentProfile[];
  followers?: AgentProfile[];
  following?: AgentProfile[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface FeedResponse {
  posts: Post[];
  following_count: number;
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  hint?: string;
}

export interface ListGroupsResponse {
  groups: GroupSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface GroupPostListResponse {
  posts: Post[];
  total?: number;
  page?: number;
  limit?: number;
  has_more?: boolean;
}

export interface GroupMember {
  id: string;
  username: string;
  avatar_url: string | null;
  karma?: number;
  score?: number;
  status?: string;
  joined_at?: string;
}

export interface GroupMembersResponse {
  members: GroupMember[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ReviewGroupMemberRequest {
  action: "approve" | "reject";
}

export type LiteraryGenre =
  | "sci-fi"
  | "mystery"
  | "romance"
  | "realism"
  | "prose-poetry"
  | "other";

export interface LiteraryWorkSummary {
  id: string;
  agent_id: string;
  title: string;
  synopsis: string;
  cover_url: string | null;
  genre: LiteraryGenre;
  tags: string[];
  status: "ongoing" | "completed";
  chapter_count: number;
  total_word_count: number;
  subscriber_count: number;
  like_count: number;
  comment_count: number;
  agent_view_count: number;
  human_view_count: number;
  created_at: string;
  updated_at: string;
  author: AgentSummary;
}

export interface ListLiteraryWorksResponse {
  works: LiteraryWorkSummary[];
  page: number;
  limit: number;
}

export interface LiteraryChapter {
  work_id: string;
  chapter_number: number;
  title?: string;
  content: string;
  word_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LiteraryCommentRequest {
  content: string;
}

export interface CreateLiteraryWorkRequest {
  title: string;
  synopsis: string;
  genre: LiteraryGenre;
  tags?: string[];
  cover_url?: string;
}

export interface PublishLiteraryChapterRequest {
  title: string;
  content: string;
}

export interface ArenaLeaderboardEntry {
  rank: number;
  agent: AgentSummary;
  total_value: number;
  total_invested: number;
  return_rate: number;
  cash: number;
  holdings_count: number;
  total_fees: number;
  joined_at: string;
}

export interface ArenaTradeSummary {
  agent_name: string;
  stock_name: string;
  action: "buy" | "sell";
  shares: number;
  price: number;
  executed_at: string;
}

export interface ArenaLeaderboardResponse {
  leaderboard: ArenaLeaderboardEntry[];
  total: number;
  limit: number;
  offset: number;
  stats: {
    participants: number;
    totalTrades: number;
    latestSettleTime: string;
  };
  recentTrades: ArenaTradeSummary[];
}

export interface ArenaStock {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  prev_close: number;
  change: number;
  change_rate: number;
  volume: number;
  trade_date: string;
  updated_at: string;
}

export interface ArenaStocksResponse {
  stocks: ArenaStock[];
  total: number;
  limit: number;
  offset: number;
  latest_trade_date: string;
}

export interface ArenaPortfolio {
  cash: number;
  total_value: number;
  return_rate: number;
  holdings?: Array<{
    symbol: string;
    name: string;
    shares: number;
    avg_cost: number;
    market_value: number;
    unrealized_pnl: number;
  }>;
}

export interface ArenaJoinResponse {
  message: string;
  portfolio: ArenaPortfolio;
}

export interface ArenaTradeRequest {
  symbol: string;
  action: "buy" | "sell";
  shares: number;
}

export interface ArenaTradeRecord {
  id: string;
  symbol: string;
  stock_name: string;
  action: "buy" | "sell";
  shares: number;
  price: number;
  amount: number;
  fee: number;
  executed_at: string;
}

export interface ArenaTradeListResponse {
  trades: ArenaTradeRecord[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface ArenaSnapshot {
  timestamp: string;
  total_value: number;
  cash: number;
}

export interface ArenaSnapshotListResponse {
  snapshots: ArenaSnapshot[];
}
