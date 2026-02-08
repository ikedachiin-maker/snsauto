/**
 * TSIS Analysis Module - Hashtag Analyzer (Phase 3)
 *
 * ハッシュタグ分析: ランキング、クロスプラットフォーム検出、トレンド方向判定。
 */

import {
  Platform,
  UnifiedPost,
  TrendingHashtag,
} from '../../types/unified-post';
import { HashtagAnalysisResult } from './types';

// ============================================
// Types
// ============================================

interface HashtagStats {
  tag: string;
  platforms: Set<Platform>;
  postCount: number;
  totalEngagement: number;
  posts: UnifiedPost[];
}

// ============================================
// Hashtag Analysis
// ============================================

/**
 * ハッシュタグ分析を実行
 * @param posts 現在期間の投稿
 * @param previousPeriodPosts 前期間の投稿（トレンド方向判定用、オプション）
 */
export function analyzeHashtags(
  posts: UnifiedPost[],
  previousPeriodPosts?: UnifiedPost[]
): HashtagAnalysisResult {
  if (posts.length === 0) {
    return {
      hashtags: [],
      totalUniqueHashtags: 0,
      crossPlatformHashtags: [],
    };
  }

  // ハッシュタグ統計を集計
  const hashtagStats = collectHashtagStats(posts);
  const previousStats = previousPeriodPosts
    ? collectHashtagStats(previousPeriodPosts)
    : new Map<string, HashtagStats>();

  // TrendingHashtag配列に変換
  const hashtags: TrendingHashtag[] = [];

  for (const [tag, stats] of hashtagStats.entries()) {
    const avgEngagement =
      stats.totalEngagement / stats.postCount;

    // トレンド方向を判定
    const trendDirection = determineTrendDirection(
      tag,
      stats,
      previousStats.get(tag)
    );

    hashtags.push({
      tag,
      platforms: Array.from(stats.platforms),
      postCount: stats.postCount,
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      trendDirection,
    });
  }

  // 投稿数でソート（降順）
  hashtags.sort((a, b) => b.postCount - a.postCount);

  // クロスプラットフォームハッシュタグを抽出（2+プラットフォームに出現）
  const crossPlatformHashtags = hashtags.filter(
    (h) => h.platforms.length >= 2
  );

  return {
    hashtags,
    totalUniqueHashtags: hashtags.length,
    crossPlatformHashtags,
  };
}

/**
 * ハッシュタグ統計を収集
 */
function collectHashtagStats(posts: UnifiedPost[]): Map<string, HashtagStats> {
  const statsMap = new Map<string, HashtagStats>();

  for (const post of posts) {
    const hashtags = post.content.hashtags;
    const engagement =
      post.engagement.likes +
      post.engagement.comments +
      post.engagement.shares +
      post.engagement.saves;

    for (const tag of hashtags) {
      // ハッシュタグを正規化（小文字化、#除去）
      const normalizedTag = normalizeHashtag(tag);
      if (!normalizedTag) continue;

      let stats = statsMap.get(normalizedTag);
      if (!stats) {
        stats = {
          tag: normalizedTag,
          platforms: new Set(),
          postCount: 0,
          totalEngagement: 0,
          posts: [],
        };
        statsMap.set(normalizedTag, stats);
      }

      stats.platforms.add(post.platform);
      stats.postCount += 1;
      stats.totalEngagement += engagement;
      stats.posts.push(post);
    }
  }

  return statsMap;
}

/**
 * ハッシュタグを正規化
 */
function normalizeHashtag(tag: string): string {
  // #を除去し、小文字化
  let normalized = tag.replace(/^#/, '').toLowerCase().trim();

  // 空文字や1文字は除外
  if (normalized.length < 2) {
    return '';
  }

  return normalized;
}

/**
 * トレンド方向を判定
 */
function determineTrendDirection(
  tag: string,
  current: HashtagStats,
  previous?: HashtagStats
): 'rising' | 'stable' | 'declining' {
  if (!previous) {
    // 前期データなし → 新規出現 = rising
    return 'rising';
  }

  const currentCount = current.postCount;
  const previousCount = previous.postCount;

  // 20%以上増加 → rising
  if (currentCount > previousCount * 1.2) {
    return 'rising';
  }

  // 20%以上減少 → declining
  if (currentCount < previousCount * 0.8) {
    return 'declining';
  }

  // それ以外 → stable
  return 'stable';
}

// ============================================
// Top Hashtags Extraction
// ============================================

/**
 * 上位ハッシュタグを抽出
 */
export function extractTopHashtags(
  hashtags: TrendingHashtag[],
  count = 20
): TrendingHashtag[] {
  return hashtags.slice(0, count);
}

/**
 * エンゲージメント上位のハッシュタグを抽出
 */
export function extractHighEngagementHashtags(
  hashtags: TrendingHashtag[],
  count = 20
): TrendingHashtag[] {
  const sorted = [...hashtags].sort(
    (a, b) => b.avgEngagement - a.avgEngagement
  );
  return sorted.slice(0, count);
}

/**
 * 急上昇ハッシュタグを抽出
 */
export function extractRisingHashtags(
  hashtags: TrendingHashtag[]
): TrendingHashtag[] {
  return hashtags.filter((h) => h.trendDirection === 'rising');
}

// ============================================
// Platform-specific Analysis
// ============================================

/**
 * プラットフォーム別のトップハッシュタグを取得
 */
export function getHashtagsByPlatform(
  posts: UnifiedPost[],
  platform: Platform,
  count = 10
): TrendingHashtag[] {
  const platformPosts = posts.filter((p) => p.platform === platform);
  const result = analyzeHashtags(platformPosts);
  return result.hashtags.slice(0, count);
}

/**
 * 特定ハッシュタグの使用状況を取得
 */
export function getHashtagUsage(
  posts: UnifiedPost[],
  tag: string
): {
  totalPosts: number;
  platforms: Platform[];
  avgEngagement: number;
  topPosts: UnifiedPost[];
} {
  const normalizedTag = normalizeHashtag(tag);
  const matchingPosts = posts.filter((p) =>
    p.content.hashtags.some(
      (h) => normalizeHashtag(h) === normalizedTag
    )
  );

  if (matchingPosts.length === 0) {
    return {
      totalPosts: 0,
      platforms: [],
      avgEngagement: 0,
      topPosts: [],
    };
  }

  const platforms = [...new Set(matchingPosts.map((p) => p.platform))];
  const totalEngagement = matchingPosts.reduce(
    (sum, p) =>
      sum +
      p.engagement.likes +
      p.engagement.comments +
      p.engagement.shares +
      p.engagement.saves,
    0
  );

  // TOP投稿を抽出
  const topPosts = [...matchingPosts]
    .sort((a, b) => {
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
    })
    .slice(0, 5);

  return {
    totalPosts: matchingPosts.length,
    platforms,
    avgEngagement: parseFloat(
      (totalEngagement / matchingPosts.length).toFixed(2)
    ),
    topPosts,
  };
}

// ============================================
// Exports
// ============================================

export {
  normalizeHashtag,
  collectHashtagStats,
  determineTrendDirection,
};
