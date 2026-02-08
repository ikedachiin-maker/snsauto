/**
 * TSIS Analysis Module - Performance Analyzer (Phase 3)
 *
 * パフォーマンス分析: TOP投稿抽出、時間帯分析、バズ検出、コンテンツタイプ比較。
 */

import {
  Platform,
  PostType,
  UnifiedPost,
  PlatformMetrics,
  TimeSlot,
} from '../../types/unified-post';
import {
  ContentTypeMetrics,
  PerformanceAnalysisResult,
  PerformanceAnalysisOptions,
} from './types';

// ============================================
// Platform Metrics Calculation
// ============================================

/**
 * プラットフォーム別メトリクスを集計
 */
export function calculatePlatformMetrics(posts: UnifiedPost[]): PlatformMetrics[] {
  const platformGroups = groupByPlatform(posts);
  const results: PlatformMetrics[] = [];

  for (const [platform, platformPosts] of Object.entries(platformGroups)) {
    if (platformPosts.length === 0) continue;

    const totalEngagement = platformPosts.reduce(
      (sum, p) =>
        sum +
        p.engagement.likes +
        p.engagement.comments +
        p.engagement.shares +
        p.engagement.saves,
      0
    );

    const avgEngagementRate =
      platformPosts.reduce((sum, p) => sum + p.engagement.engagementRate, 0) /
      platformPosts.length;

    // 最も多い投稿タイプを特定
    const topPostType = findTopPostType(platformPosts);

    // フォロワー成長（投稿データからは直接取得できないので0とする）
    // 実際の成長率は外部データソースから取得する必要がある
    const followerGrowth = 0;

    results.push({
      platform: platform as Platform,
      totalPosts: platformPosts.length,
      totalEngagement,
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(4)),
      followerGrowth,
      topPostType,
    });
  }

  // エンゲージメント率でソート（降順）
  return results.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
}

/**
 * プラットフォーム別にグループ化
 */
function groupByPlatform(posts: UnifiedPost[]): Record<Platform, UnifiedPost[]> {
  const groups: Record<string, UnifiedPost[]> = {};

  for (const post of posts) {
    if (!groups[post.platform]) {
      groups[post.platform] = [];
    }
    groups[post.platform].push(post);
  }

  return groups as Record<Platform, UnifiedPost[]>;
}

/**
 * 最も多い投稿タイプを特定
 */
function findTopPostType(posts: UnifiedPost[]): PostType {
  const typeCounts: Record<string, number> = {};

  for (const post of posts) {
    const type = post.metadata.postType;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }

  let maxType: PostType = 'text';
  let maxCount = 0;

  for (const [type, count] of Object.entries(typeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxType = type as PostType;
    }
  }

  return maxType;
}

// ============================================
// Top Posts Extraction
// ============================================

/**
 * エンゲージメント上位の投稿を抽出
 */
export function extractTopPosts(posts: UnifiedPost[], count = 10): UnifiedPost[] {
  // 総エンゲージメントでソート（降順）
  const sorted = [...posts].sort((a, b) => {
    const engA =
      a.engagement.likes +
      a.engagement.comments +
      a.engagement.shares +
      a.engagement.saves;
    const engB =
      b.engagement.likes +
      b.engagement.comments +
      b.engagement.shares +
      b.engagement.saves;
    return engB - engA;
  });

  return sorted.slice(0, count);
}

// ============================================
// Time Slot Analysis
// ============================================

/**
 * 曜日×時間帯ごとの平均エンゲージメントを計算
 * TimeSlot配列を返す（168スロット = 7曜日 × 24時間）
 */
export function calculateTimeSlots(posts: UnifiedPost[]): TimeSlot[] {
  // 各スロットのデータを集計
  const slotData: Record<string, { totalEngagement: number; count: number }> = {};

  for (const post of posts) {
    const publishedAt = new Date(post.metadata.publishedAt);
    const dayOfWeek = publishedAt.getDay(); // 0=Sunday
    const hour = publishedAt.getHours(); // 0-23

    const key = `${dayOfWeek}-${hour}`;
    const engagement =
      post.engagement.likes +
      post.engagement.comments +
      post.engagement.shares +
      post.engagement.saves;

    if (!slotData[key]) {
      slotData[key] = { totalEngagement: 0, count: 0 };
    }
    slotData[key].totalEngagement += engagement;
    slotData[key].count += 1;
  }

  // TimeSlot配列に変換
  const timeSlots: TimeSlot[] = [];

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${dayOfWeek}-${hour}`;
      const data = slotData[key];

      timeSlots.push({
        dayOfWeek,
        hour,
        avgEngagement: data ? parseFloat((data.totalEngagement / data.count).toFixed(2)) : 0,
        postCount: data?.count || 0,
      });
    }
  }

  return timeSlots;
}

/**
 * 最適な投稿時間帯（TOP N）を抽出
 */
export function extractBestTimeSlots(timeSlots: TimeSlot[], count = 10): TimeSlot[] {
  // 投稿が存在し、エンゲージメントが高いスロットのみ対象
  const validSlots = timeSlots.filter((s) => s.postCount > 0);

  // 平均エンゲージメントでソート（降順）
  const sorted = [...validSlots].sort((a, b) => b.avgEngagement - a.avgEngagement);

  return sorted.slice(0, count);
}

// ============================================
// Content Type Comparison
// ============================================

/**
 * 投稿タイプ別のメトリクスを比較
 */
export function compareContentTypes(posts: UnifiedPost[]): ContentTypeMetrics[] {
  const typeGroups: Record<string, UnifiedPost[]> = {};

  // タイプ別にグループ化
  for (const post of posts) {
    const type = post.metadata.postType;
    if (!typeGroups[type]) {
      typeGroups[type] = [];
    }
    typeGroups[type].push(post);
  }

  const results: ContentTypeMetrics[] = [];

  for (const [postType, typePosts] of Object.entries(typeGroups)) {
    const totalLikes = typePosts.reduce((sum, p) => sum + p.engagement.likes, 0);
    const totalShares = typePosts.reduce((sum, p) => sum + p.engagement.shares, 0);
    const totalComments = typePosts.reduce((sum, p) => sum + p.engagement.comments, 0);
    const totalViews = typePosts.reduce((sum, p) => sum + p.engagement.views, 0);

    const totalEngagement = totalLikes + totalShares + totalComments;
    const avgEngagement = totalEngagement / typePosts.length;
    const avgEngagementRate =
      typePosts.reduce((sum, p) => sum + p.engagement.engagementRate, 0) / typePosts.length;

    results.push({
      postType: postType as PostType,
      count: typePosts.length,
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      avgEngagementRate: parseFloat(avgEngagementRate.toFixed(4)),
      totalLikes,
      totalShares,
      totalComments,
      totalViews,
    });
  }

  // 平均エンゲージメント率でソート（降順）
  return results.sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
}

// ============================================
// Buzz Detection
// ============================================

/**
 * バズ投稿を検出
 * プラットフォーム別の平均エンゲージメントのthreshold倍以上をバズと判定
 */
export function detectBuzzPosts(posts: UnifiedPost[], threshold = 3.0): UnifiedPost[] {
  const platformGroups = groupByPlatform(posts);

  // プラットフォーム別の平均エンゲージメントを計算
  const platformAvgEngagement: Record<Platform, number> = {} as Record<Platform, number>;

  for (const [platform, platformPosts] of Object.entries(platformGroups)) {
    if (platformPosts.length === 0) continue;

    const avgEngagement =
      platformPosts.reduce(
        (sum, p) =>
          sum +
          p.engagement.likes +
          p.engagement.comments +
          p.engagement.shares +
          p.engagement.saves,
        0
      ) / platformPosts.length;

    platformAvgEngagement[platform as Platform] = avgEngagement;
  }

  // threshold倍以上のエンゲージメントを持つ投稿を抽出
  const buzzPosts: UnifiedPost[] = [];

  for (const post of posts) {
    const avgEngagement = platformAvgEngagement[post.platform] || 0;
    if (avgEngagement === 0) continue;

    const postEngagement =
      post.engagement.likes +
      post.engagement.comments +
      post.engagement.shares +
      post.engagement.saves;

    if (postEngagement >= avgEngagement * threshold) {
      buzzPosts.push(post);
    }
  }

  // エンゲージメントでソート（降順）
  return buzzPosts.sort((a, b) => {
    const engA =
      a.engagement.likes + a.engagement.comments + a.engagement.shares + a.engagement.saves;
    const engB =
      b.engagement.likes + b.engagement.comments + b.engagement.shares + b.engagement.saves;
    return engB - engA;
  });
}

/**
 * プラットフォーム別の平均エンゲージメントを取得
 */
export function getPlatformAvgEngagement(posts: UnifiedPost[]): Record<Platform, number> {
  const platformGroups = groupByPlatform(posts);
  const result: Record<string, number> = {};

  for (const [platform, platformPosts] of Object.entries(platformGroups)) {
    if (platformPosts.length === 0) continue;

    result[platform] =
      platformPosts.reduce(
        (sum, p) =>
          sum +
          p.engagement.likes +
          p.engagement.comments +
          p.engagement.shares +
          p.engagement.saves,
        0
      ) / platformPosts.length;
  }

  return result as Record<Platform, number>;
}

// ============================================
// Full Performance Analysis
// ============================================

const DEFAULT_OPTIONS: PerformanceAnalysisOptions = {
  topPostsCount: 10,
  buzzThreshold: 3.0,
};

/**
 * 全パフォーマンス分析を実行
 */
export function analyzePerformance(
  posts: UnifiedPost[],
  options?: PerformanceAnalysisOptions
): PerformanceAnalysisResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (posts.length === 0) {
    return {
      platformMetrics: [],
      topPosts: [],
      timeSlots: [],
      contentTypeComparison: [],
      buzzPosts: [],
    };
  }

  const platformMetrics = calculatePlatformMetrics(posts);
  const topPosts = extractTopPosts(posts, opts.topPostsCount);
  const timeSlots = calculateTimeSlots(posts);
  const contentTypeComparison = compareContentTypes(posts);
  const buzzPosts = detectBuzzPosts(posts, opts.buzzThreshold);

  return {
    platformMetrics,
    topPosts,
    timeSlots,
    contentTypeComparison,
    buzzPosts,
  };
}

// ============================================
// Utility Exports
// ============================================

export {
  groupByPlatform,
  findTopPostType,
};
