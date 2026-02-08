/**
 * TSIS Collection Orchestrator
 *
 * Apify MCP経由でActorを呼び出し、
 * 正規化→重複排除のパイプラインを実行する。
 *
 * 注: 実際のMCP呼び出しはproxy-mcp tools層で行い、
 * このモジュールはデータ変換ロジックに集中する。
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ActorConfig,
  ActorsConfig,
  CollectorOptions,
  RawPlatformData,
  NormalizationResult,
  CollectionJobResult,
} from './types';
import { normalizeRawData } from './normalizer';
import { deduplicatePosts, buildExistingIdSet } from './deduplicator';
import { Platform, UnifiedPost, CollectionResult, CollectionError } from '../types/unified-post';

const ACTORS_CONFIG_PATH = path.join(process.cwd(), 'config', 'sns-collection', 'actors.json');

/**
 * Actor設定をロード
 */
export function loadActorConfigs(): Record<string, ActorConfig> {
  try {
    const raw = fs.readFileSync(ACTORS_CONFIG_PATH, 'utf-8');
    const config: ActorsConfig = JSON.parse(raw);
    return config.actors;
  } catch {
    return {};
  }
}

/**
 * 指定プラットフォームのActor設定を取得
 */
export function getActorConfig(platform: Platform): ActorConfig | undefined {
  const configs = loadActorConfigs();
  return configs[platform];
}

/**
 * 優先度順にプラットフォームをソート
 * P1 → P2 → P3 の順
 */
export function sortByPriority(
  platforms: Platform[],
  configs: Record<string, ActorConfig>,
): Platform[] {
  const priorityOrder: Record<string, number> = { P1: 0, P2: 1, P3: 2 };

  return [...platforms].sort((a, b) => {
    const pa = priorityOrder[configs[a]?.priority || 'P3'] ?? 3;
    const pb = priorityOrder[configs[b]?.priority || 'P3'] ?? 3;
    return pa - pb;
  });
}

/**
 * 優先度でプラットフォームをフィルタ
 */
export function filterByPriority(
  priority: 'P1' | 'P2' | 'P3' | 'all',
  configs: Record<string, ActorConfig>,
): Platform[] {
  const allPlatforms = Object.keys(configs) as Platform[];
  if (priority === 'all') return allPlatforms;
  return allPlatforms.filter((p) => configs[p]?.priority === priority);
}

/**
 * 単一プラットフォームの生データを収集・正規化
 *
 * rawDataは外部（MCP呼び出し側）から渡される。
 * このメソッドは正規化→重複排除を担当。
 */
export function collectAndNormalize(
  rawData: RawPlatformData,
  existingIds?: Set<string>,
): NormalizationResult {
  const normalized = normalizeRawData(rawData);
  const deduped = deduplicatePosts(normalized.posts, existingIds);

  return {
    posts: deduped.unique,
    errors: normalized.errors,
    stats: {
      total: normalized.stats.total,
      success: deduped.stats.unique,
      failed: normalized.stats.failed,
      duplicates: deduped.stats.duplicates,
    },
  };
}

/**
 * バッチ収集結果のサマリーを生成
 */
export function buildCollectionSummary(
  results: Array<{ platform: Platform; result: NormalizationResult }>,
  jobId: string,
  startedAt: string,
): CollectionJobResult {
  const platforms: CollectionResult[] = [];
  const errors: CollectionError[] = [];
  let totalPosts = 0;
  let deduplicatedPosts = 0;

  for (const { platform, result } of results) {
    platforms.push({
      platform,
      collectedAt: new Date().toISOString(),
      totalPosts: result.stats.success,
      posts: result.posts,
      errors: result.errors.map((e) => ({
        platform,
        errorCode: 'NORMALIZATION_ERROR',
        message: e.error,
        timestamp: new Date().toISOString(),
        retryable: false,
      })),
    });

    totalPosts += result.stats.success;
    deduplicatedPosts += result.stats.duplicates;

    for (const e of result.errors) {
      errors.push({
        platform,
        errorCode: 'NORMALIZATION_ERROR',
        message: e.error,
        timestamp: new Date().toISOString(),
        retryable: false,
      });
    }
  }

  return {
    jobId,
    startedAt,
    completedAt: new Date().toISOString(),
    platforms,
    totalPosts,
    deduplicatedPosts,
    errors,
  };
}

export { buildExistingIdSet };
