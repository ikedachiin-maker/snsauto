/**
 * TSIS SNS Collection Module - Public API
 *
 * SNSデータ収集パイプラインの公開インターフェース。
 * 収集・正規化・重複排除・トレンド監視の各機能をエクスポート。
 */

// Types
export type {
  RawPlatformData,
  NormalizationResult,
  NormalizationError,
  DeduplicationResult,
  PlatformNormalizer,
  CollectionJobResult,
  CollectorOptions,
  ActorConfig,
  ActorsConfig,
  CollectionConfig,
  TrendTopic,
  TrendMonitorResult,
} from './types';

// Collector
export {
  loadActorConfigs,
  getActorConfig,
  sortByPriority,
  filterByPriority,
  collectAndNormalize,
  buildCollectionSummary,
  buildExistingIdSet,
} from './collector';

// Normalizer
export {
  normalizeRawData,
  normalizeBatch,
} from './normalizer';

// Deduplicator
export {
  deduplicatePosts,
} from './deduplicator';

// Trend Monitor
export {
  normalizeTrendData,
  calculateTrendScore,
  sortByTrendScore,
  filterByCategory,
  buildTrendSummary,
} from './trend-monitor';

// Platforms
export {
  getNormalizer,
  getSupportedPlatforms,
  getAllNormalizers,
} from './platforms';

// Utils
export {
  toJST,
  extractUrlsFromText,
  stripHtml,
  truncateText,
} from './utils';

// Analysis (Phase 3)
export * from './analysis';
