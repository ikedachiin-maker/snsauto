/**
 * TSIS SNS Collection Pipeline - Type Definitions
 *
 * データ収集パイプライン固有の型定義。
 * UnifiedPost型（src/types/unified-post.ts）をインポートして使用。
 */

import {
  Platform,
  UnifiedPost,
  CollectionResult,
  CollectionError,
} from '../types/unified-post';

// ============================================
// Actor Configuration Types
// ============================================

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
}

export interface ActorConfig {
  actorId: string;
  defaultInput: Record<string, unknown>;
  priority: 'P1' | 'P2' | 'P3';
  rateLimit?: RateLimitConfig;
}

export interface ActorsConfig {
  version: string;
  description: string;
  actors: Record<string, ActorConfig>;
}

// ============================================
// Collection Types
// ============================================

export interface CollectionConfig {
  keywords: string[];
  accounts: Record<string, string[]>;
  competitors: string[];
  schedule: {
    defaultCron: string;
    timezone: string;
  };
  collection: {
    maxRetries: number;
    retryDelayMs: number;
    rateLimitDelayMs: number;
    timeoutMs: number;
    priorityOrder: string[];
  };
  normalization: {
    defaultLanguage: string;
    timestampTimezone: string;
  };
  deduplication: {
    strategy: string;
    lookbackDays: number;
  };
  output: {
    rawDataDir: string;
    normalizedDir: string;
    trendsDir: string;
    reportsDir: string;
  };
}

/**
 * プラットフォーム固有の生データ
 * Apify Actor出力をそのまま格納する
 */
export interface RawPlatformData {
  platform: Platform;
  actorId: string;
  actorRunId?: string;
  rawItems: unknown[];
  collectedAt: string;
  inputParams: Record<string, unknown>;
}

/**
 * 正規化エラー
 */
export interface NormalizationError {
  platform: Platform;
  rawItem: unknown;
  error: string;
  field?: string;
}

/**
 * 正規化結果
 */
export interface NormalizationResult {
  posts: UnifiedPost[];
  errors: NormalizationError[];
  stats: {
    total: number;
    success: number;
    failed: number;
    duplicates: number;
  };
}

/**
 * 重複排除結果
 */
export interface DeduplicationResult {
  unique: UnifiedPost[];
  duplicates: UnifiedPost[];
  stats: {
    total: number;
    unique: number;
    duplicates: number;
  };
}

/**
 * プラットフォーム別ノーマライザーインターフェース
 */
export interface PlatformNormalizer {
  platform: Platform;
  normalize(rawItems: unknown[]): UnifiedPost[];
}

/**
 * 収集ジョブ結果
 */
export interface CollectionJobResult {
  jobId: string;
  startedAt: string;
  completedAt: string;
  platforms: CollectionResult[];
  totalPosts: number;
  deduplicatedPosts: number;
  errors: CollectionError[];
}

/**
 * 収集オプション
 */
export interface CollectorOptions {
  platforms?: Platform[];
  keywords?: string[];
  accounts?: Record<string, string[]>;
  maxRetries?: number;
  priority?: 'P1' | 'P2' | 'P3' | 'all';
}

// ============================================
// Trend Types
// ============================================

/**
 * トレンドトピック
 */
export interface TrendTopic {
  title: string;
  source: string;
  category?: string;
  trendScore: number;
  url?: string;
  relatedKeywords: string[];
  detectedAt: string;
}

/**
 * トレンド監視結果
 */
export interface TrendMonitorResult {
  topics: TrendTopic[];
  sources: number;
  collectedAt: string;
}
