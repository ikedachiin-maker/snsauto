/**
 * TSIS Analysis Module - Type Definitions (Phase 3)
 *
 * 分析固有の型定義。
 * unified-post.ts の既存型（PostAnalysis, SentimentResult, AnalysisReport 等）は
 * インポートのみ行い、再定義しない。
 */

import {
  Platform,
  PostType,
  UnifiedPost,
  PostAnalysis,
  SentimentResult,
  SentimentLabel,
  EmotionLabel,
  AnalysisReport,
  TrendingHashtag,
  TimeSlot,
  PlatformMetrics,
  CompetitorProfile,
  CompetitorComparison,
} from '../../types/unified-post';

// Re-export for convenience
export type {
  Platform,
  PostType,
  UnifiedPost,
  PostAnalysis,
  SentimentResult,
  SentimentLabel,
  EmotionLabel,
  AnalysisReport,
  TrendingHashtag,
  TimeSlot,
  PlatformMetrics,
  CompetitorProfile,
  CompetitorComparison,
};

// ============================================
// Sentiment Analyzer Types
// ============================================

/**
 * センチメント分析オプション
 */
export interface SentimentAnalyzerOptions {
  /** 言語指定（'auto'で自動検出） */
  language?: string;
  /** 6感情検出を有効化 */
  enableEmotions?: boolean;
  /** カスタムキーワード重み付け（word -> weight） */
  customKeywords?: Record<string, number>;
}

// ============================================
// Performance Analyzer Types
// ============================================

/**
 * コンテンツタイプ別メトリクス
 */
export interface ContentTypeMetrics {
  postType: PostType;
  count: number;
  avgEngagement: number;
  avgEngagementRate: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalViews: number;
}

/**
 * パフォーマンス分析結果
 */
export interface PerformanceAnalysisResult {
  platformMetrics: PlatformMetrics[];
  topPosts: UnifiedPost[];
  timeSlots: TimeSlot[];
  contentTypeComparison: ContentTypeMetrics[];
  buzzPosts: UnifiedPost[];
}

/**
 * パフォーマンス分析オプション
 */
export interface PerformanceAnalysisOptions {
  /** TOP投稿の取得件数（デフォルト: 10） */
  topPostsCount?: number;
  /** バズ判定閾値（プラットフォーム平均の何倍か、デフォルト: 3.0） */
  buzzThreshold?: number;
}

// ============================================
// Hashtag Analyzer Types
// ============================================

/**
 * ハッシュタグ分析結果
 */
export interface HashtagAnalysisResult {
  hashtags: TrendingHashtag[];
  totalUniqueHashtags: number;
  crossPlatformHashtags: TrendingHashtag[];
}

// ============================================
// Competitor Analyzer Types
// ============================================

/**
 * 競合設定ファイル構造
 */
export interface CompetitorsConfig {
  version: string;
  description?: string;
  maxPerPlatform: number;
  competitors: CompetitorProfile[];
}

/**
 * 競合分析結果
 */
export interface CompetitorAnalysisResult {
  comparisons: CompetitorComparison[];
  summaryGaps: string[];
  summaryOpportunities: string[];
}

// ============================================
// Analysis Orchestrator Types
// ============================================

/**
 * 分析オーケストレーターオプション
 */
export interface AnalysisOptions {
  /** 分析対象期間 */
  period?: { start: string; end: string };
  /** 対象プラットフォーム */
  platforms?: Platform[];
  /** TOP投稿件数（デフォルト: 10） */
  topPostsCount?: number;
  /** バズ検出閾値（デフォルト: 3.0） */
  buzzThreshold?: number;
  /** センチメント分析を有効化（デフォルト: true） */
  enableSentiment?: boolean;
  /** 競合分析を有効化（デフォルト: true） */
  enableCompetitors?: boolean;
  /** センチメント分析オプション */
  sentimentOptions?: SentimentAnalyzerOptions;
}

/**
 * 全分析結果
 */
export interface FullAnalysisResult {
  /** 分析レポート */
  report: AnalysisReport;
  /** analysis フィールドが populate された投稿リスト */
  analyzedPosts: UnifiedPost[];
  /** パフォーマンス分析結果 */
  performance: PerformanceAnalysisResult;
  /** ハッシュタグ分析結果 */
  hashtags: HashtagAnalysisResult;
  /** 競合分析結果（有効時のみ） */
  competitors?: CompetitorAnalysisResult;
  /** Markdownレポート */
  markdownReport: string;
}
