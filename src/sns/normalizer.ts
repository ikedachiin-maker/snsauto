/**
 * TSIS Data Normalization Pipeline
 *
 * 生データ → UnifiedPost への変換オーケストレーター。
 * 各プラットフォームのノーマライザーを呼び出し、
 * エンゲージメント率の統一計算を適用する。
 */

import { RawPlatformData, NormalizationResult, NormalizationError } from './types';
import { getNormalizer } from './platforms';
import { UnifiedPost, calculateEngagementRate } from '../types/unified-post';

/**
 * 単一プラットフォームの生データをUnifiedPost形式に正規化
 */
export function normalizeRawData(rawData: RawPlatformData): NormalizationResult {
  const normalizer = getNormalizer(rawData.platform);
  if (!normalizer) {
    return {
      posts: [],
      errors: [{
        platform: rawData.platform,
        rawItem: null,
        error: `No normalizer found for platform: ${rawData.platform}`,
      }],
      stats: { total: rawData.rawItems.length, success: 0, failed: rawData.rawItems.length, duplicates: 0 },
    };
  }

  const posts: UnifiedPost[] = [];
  const errors: NormalizationError[] = [];

  for (const item of rawData.rawItems) {
    try {
      const normalized = normalizer.normalize([item]);
      for (const post of normalized) {
        // エンゲージメント率を統一計算式で再計算
        post.engagement.engagementRate = calculateEngagementRate(
          {
            likes: post.engagement.likes,
            comments: post.engagement.comments,
            shares: post.engagement.shares,
            saves: post.engagement.saves,
          },
          post.author.followers,
        );
        posts.push(post);
      }
    } catch (e) {
      errors.push({
        platform: rawData.platform,
        rawItem: item,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return {
    posts,
    errors,
    stats: {
      total: rawData.rawItems.length,
      success: posts.length,
      failed: errors.length,
      duplicates: 0,
    },
  };
}

/**
 * 複数プラットフォームの生データをバッチ正規化
 */
export function normalizeBatch(rawDataList: RawPlatformData[]): NormalizationResult {
  const allPosts: UnifiedPost[] = [];
  const allErrors: NormalizationError[] = [];
  let totalItems = 0;

  for (const rawData of rawDataList) {
    const result = normalizeRawData(rawData);
    allPosts.push(...result.posts);
    allErrors.push(...result.errors);
    totalItems += result.stats.total;
  }

  return {
    posts: allPosts,
    errors: allErrors,
    stats: {
      total: totalItems,
      success: allPosts.length,
      failed: allErrors.length,
      duplicates: 0,
    },
  };
}
