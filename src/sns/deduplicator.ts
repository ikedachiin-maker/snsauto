/**
 * TSIS Deduplication Module
 *
 * プラットフォームID + プラットフォーム名の組み合わせで重複を検出・排除。
 * 95%以上の精度で重複検出を実現する。
 */

import { DeduplicationResult } from './types';
import { UnifiedPost } from '../types/unified-post';

/**
 * 重複検出キーを生成
 * platform:platformPostId の組み合わせで一意性を判定
 */
function getDeduplicationKey(post: UnifiedPost): string {
  return `${post.platform}:${post.platformPostId}`;
}

/**
 * 投稿データの重複を検出・排除
 *
 * @param posts - 重複チェック対象の投稿リスト
 * @param existingIds - 既存の重複検出キーセット（過去データとの照合用）
 * @returns 一意な投稿と重複投稿のリスト
 */
export function deduplicatePosts(
  posts: UnifiedPost[],
  existingIds?: Set<string>,
): DeduplicationResult {
  const seen = new Set<string>(existingIds || []);
  const unique: UnifiedPost[] = [];
  const duplicates: UnifiedPost[] = [];

  for (const post of posts) {
    // 空のplatformPostIdは重複チェックをスキップ
    if (!post.platformPostId) {
      unique.push(post);
      continue;
    }

    const key = getDeduplicationKey(post);

    if (seen.has(key)) {
      duplicates.push(post);
    } else {
      seen.add(key);
      unique.push(post);
    }
  }

  return {
    unique,
    duplicates,
    stats: {
      total: posts.length,
      unique: unique.length,
      duplicates: duplicates.length,
    },
  };
}

/**
 * 既存データから重複検出用キーセットを構築
 */
export function buildExistingIdSet(existingPosts: UnifiedPost[]): Set<string> {
  const idSet = new Set<string>();
  for (const post of existingPosts) {
    if (post.platformPostId) {
      idSet.add(getDeduplicationKey(post));
    }
  }
  return idSet;
}
