/**
 * TSIS (TAISUN SNS Intelligence System) - Unified Post Schema
 *
 * 全10 SNSプラットフォームのデータを統一フォーマットで格納するための型定義。
 * プラットフォーム間の比較分析を可能にする。
 */

// ============================================
// Platform & Post Type Enums
// ============================================

export type Platform =
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'linkedin'
  | 'reddit'
  | 'pinterest'
  | 'threads'
  | 'bluesky';

export type PostType =
  | 'text'
  | 'image'
  | 'video'
  | 'reel'
  | 'story'
  | 'thread'
  | 'short'
  | 'pin'
  | 'article'
  | 'poll'
  | 'carousel';

export type MediaType = 'image' | 'video' | 'gif' | 'audio';

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export type EmotionLabel =
  | 'anger'
  | 'disgust'
  | 'fear'
  | 'joy'
  | 'sadness'
  | 'surprise';

// ============================================
// Sub-types
// ============================================

export interface MediaItem {
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // seconds (for video/audio)
  altText?: string;
}

export interface Author {
  username: string;
  displayName: string;
  followers: number;
  following?: number;
  verified: boolean;
  profileUrl: string;
  avatarUrl?: string;
  bio?: string;
}

export interface PostContent {
  text: string;
  media: MediaItem[];
  hashtags: string[];
  mentions: string[];
  urls: string[];
  language: string; // ISO 639-1 (e.g., "ja", "en")
  transcript?: string; // Video subtitle/transcript
}

export interface Engagement {
  likes: number;
  shares: number;       // RT / repost / share
  comments: number;
  views: number;
  engagementRate: number; // Unified formula: (likes+comments+shares+saves) / followers * 100
  saves: number;         // Bookmark / save
  clicks?: number;
  replies?: number;
  quotes?: number;       // Quote tweets
  reactions?: Record<string, number>; // Platform-specific reactions
}

export interface PostMetadata {
  publishedAt: string;  // ISO 8601 (JST)
  collectedAt: string;  // ISO 8601 (JST)
  postType: PostType;
  permalink: string;
  isSponsored?: boolean;
  isPinned?: boolean;
  isReply?: boolean;
  parentPostId?: string;
}

export interface SentimentResult {
  label: SentimentLabel;
  score: number;        // -1.0 to +1.0
  emotions?: Partial<Record<EmotionLabel, number>>; // 0.0 to 1.0
  confidence: number;   // 0.0 to 1.0
}

export interface PostAnalysis {
  sentiment: SentimentResult;
  topics: string[];
  trendScore: number;   // 0-100
  viralityScore?: number; // 0-100
  contentCategory?: string;
}

// ============================================
// Main Type: UnifiedPost
// ============================================

export interface UnifiedPost {
  /** Internal management ID (UUID) */
  id: string;

  /** SNS platform identifier */
  platform: Platform;

  /** Platform-specific post ID */
  platformPostId: string;

  /** Author information */
  author: Author;

  /** Post content */
  content: PostContent;

  /** Engagement metrics */
  engagement: Engagement;

  /** Post metadata */
  metadata: PostMetadata;

  /** Analysis results (populated after analysis phase) */
  analysis?: PostAnalysis;
}

// ============================================
// Collection & Report Types
// ============================================

export interface CollectionResult {
  platform: Platform;
  collectedAt: string;
  totalPosts: number;
  posts: UnifiedPost[];
  errors: CollectionError[];
}

export interface CollectionError {
  platform: Platform;
  errorCode: string;
  message: string;
  timestamp: string;
  retryable: boolean;
}

export interface AnalysisReport {
  id: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  platforms: Platform[];
  summary: {
    totalPosts: number;
    totalEngagement: number;
    avgEngagementRate: number;
    sentimentBreakdown: Record<SentimentLabel, number>;
  };
  topPosts: UnifiedPost[];
  trendingHashtags: TrendingHashtag[];
  bestTimeSlots: TimeSlot[];
  platformComparison: PlatformMetrics[];
  recommendations: string[];
}

export interface TrendingHashtag {
  tag: string;
  platforms: Platform[];
  postCount: number;
  avgEngagement: number;
  trendDirection: 'rising' | 'stable' | 'declining';
}

export interface TimeSlot {
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  hour: number;      // 0-23 (JST)
  avgEngagement: number;
  postCount: number;
}

export interface PlatformMetrics {
  platform: Platform;
  totalPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  followerGrowth: number;
  topPostType: PostType;
}

// ============================================
// Competitor Analysis Types
// ============================================

export interface CompetitorProfile {
  name: string;
  accounts: Record<Platform, string>; // platform -> username
  registeredAt: string;
}

export interface CompetitorComparison {
  self: PlatformMetrics;
  competitors: Array<{
    profile: CompetitorProfile;
    metrics: PlatformMetrics;
  }>;
  gaps: string[];  // Content gaps identified
  opportunities: string[];
}

// ============================================
// Utility Functions (Type Guards)
// ============================================

export function isValidPlatform(value: string): value is Platform {
  const platforms: Platform[] = [
    'twitter', 'instagram', 'youtube', 'tiktok', 'facebook',
    'linkedin', 'reddit', 'pinterest', 'threads', 'bluesky',
  ];
  return platforms.includes(value as Platform);
}

export function isValidPostType(value: string): value is PostType {
  const types: PostType[] = [
    'text', 'image', 'video', 'reel', 'story', 'thread',
    'short', 'pin', 'article', 'poll', 'carousel',
  ];
  return types.includes(value as PostType);
}

/**
 * Calculate unified engagement rate across platforms
 */
export function calculateEngagementRate(
  engagement: Pick<Engagement, 'likes' | 'comments' | 'shares' | 'saves'>,
  followers: number,
): number {
  if (followers === 0) return 0;
  const total = engagement.likes + engagement.comments + engagement.shares + engagement.saves;
  return parseFloat(((total / followers) * 100).toFixed(4));
}
