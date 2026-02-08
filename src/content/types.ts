/**
 * TSIS Content Generation Module - Type Definitions (Phase 4)
 *
 * コンテンツ生成パイプライン固有の型定義。
 * ブリーフ生成、記事執筆、SEO最適化、CMS公開に関する型。
 */

import { Platform } from '../types/unified-post';
import { TrendTopic } from '../sns/types';
import { FullAnalysisResult } from '../sns/analysis';

// Re-export for convenience
export type { TrendTopic };

// ============================================
// Brief Types
// ============================================

/**
 * コンテンツブリーフ（記事企画）
 */
export interface ContentBrief {
  /** ブリーフID（UUID） */
  id: string;
  /** 生成日時（ISO 8601） */
  generatedAt: string;
  /** 記事タイトル案 */
  title: string;
  /** メインターゲットキーワード */
  targetKeyword: string;
  /** サブキーワード */
  secondaryKeywords: string[];
  /** 記事構成（見出し一覧） */
  outline: BriefOutline[];
  /** 参考URL */
  references: Reference[];
  /** SNSからの洞察 */
  snsInsights: SNSInsight[];
  /** 差別化ポイント */
  differentiators: string[];
  /** SEO要件 */
  seoRequirements: SEORequirements;
}

/**
 * ブリーフの見出し構成
 */
export interface BriefOutline {
  /** 見出しテキスト */
  heading: string;
  /** 見出しレベル（1=H1, 2=H2, 3=H3） */
  level: number;
  /** 含めるべきキーポイント */
  keyPoints: string[];
  /** 推奨文字数 */
  suggestedWordCount: number;
}

/**
 * 参考URL
 */
export interface Reference {
  /** URL */
  url: string;
  /** ページタイトル */
  title: string;
  /** 要約 */
  summary: string;
  /** 関連度スコア（0-1） */
  relevanceScore: number;
}

/**
 * SNSからの洞察
 */
export interface SNSInsight {
  /** プラットフォーム */
  platform: Platform;
  /** 洞察内容 */
  insight: string;
  /** 元投稿ID */
  sourcePostId?: string;
  /** エンゲージメント数 */
  engagement?: number;
}

/**
 * 見出し要件
 */
export interface HeadingRequirement {
  /** 見出しレベル */
  level: number;
  /** 最小数 */
  min: number;
  /** 最大数 */
  max?: number;
}

/**
 * SEO要件
 */
export interface SEORequirements {
  /** 最小文字数 */
  minWordCount: number;
  /** 最大文字数 */
  maxWordCount: number;
  /** キーワード密度（%） */
  keywordDensity: { min: number; max: number };
  /** 見出し要件 */
  headingRequirements: HeadingRequirement[];
  /** 内部リンク数 */
  internalLinks: number;
  /** 外部リンク数 */
  externalLinks: number;
}

// ============================================
// Article Types
// ============================================

/**
 * 記事ドラフト
 */
export interface ArticleDraft {
  /** 記事ID（UUID） */
  id: string;
  /** 関連ブリーフID */
  briefId: string;
  /** 生成日時（ISO 8601） */
  generatedAt: string;
  /** 記事タイトル */
  title: string;
  /** 記事本文（Markdown） */
  content: string;
  /** 文字数 */
  wordCount: number;
  /** 引用元 */
  sources: ArticleSource[];
  /** ステータス */
  status: ArticleStatus;
}

export type ArticleStatus = 'draft' | 'reviewed' | 'optimized' | 'published';

/**
 * 記事引用元
 */
export interface ArticleSource {
  /** URL */
  url: string;
  /** ページタイトル */
  title: string;
  /** 引用箇所のアンカー */
  citedAt: string[];
}

// ============================================
// SEO Types
// ============================================

/**
 * SEOメタデータ
 */
export interface SEOMetadata {
  /** メタタイトル */
  metaTitle: string;
  /** メタディスクリプション */
  metaDescription: string;
  /** カノニカルURL */
  canonicalUrl?: string;
  /** OG画像URL */
  ogImage?: string;
  /** JSON-LD構造化データ */
  schema: Record<string, unknown>;
  /** キーワード一覧 */
  keywords: string[];
}

/**
 * SEOチェック結果
 */
export interface SEOCheckResult {
  /** 総合スコア（0-100） */
  score: number;
  /** 合格判定（score >= threshold） */
  passed: boolean;
  /** 個別チェック結果 */
  checks: SEOCheck[];
  /** 改善提案 */
  suggestions: string[];
}

/**
 * 個別SEOチェック
 */
export interface SEOCheck {
  /** チェック名 */
  name: string;
  /** 合格判定 */
  passed: boolean;
  /** スコア（0-100） */
  score: number;
  /** メッセージ */
  message: string;
}

// ============================================
// Publish Types
// ============================================

/**
 * 公開結果
 */
export interface PublishResult {
  /** 成功判定 */
  success: boolean;
  /** CMS記事ID */
  articleId?: string;
  /** 公開URL */
  url?: string;
  /** 公開日時（ISO 8601） */
  publishedAt?: string;
  /** エラーメッセージ */
  error?: string;
}

// ============================================
// Pipeline Types
// ============================================

/**
 * フック戦略
 */
export type HookStrategy = 'problem-statement' | 'statistic' | 'story' | 'question' | 'controversy';

/**
 * CTA種別
 */
export type CTAType = 'newsletter' | 'product' | 'consultation' | 'download' | 'trial';

/**
 * コンテンツパイプラインオプション
 */
export interface ContentPipelineOptions {
  /** トレンドトピック（これから選択） */
  trendTopics?: TrendTopic[];
  /** 手動指定トピック */
  manualTopic?: { title: string; keyword: string };
  /** SNS分析結果（Phase 3出力） */
  analysisResult?: FullAnalysisResult;
  /** SEOスコア閾値（デフォルト: 80） */
  seoScoreThreshold?: number;
  /** 自動公開（デフォルト: false） */
  autoPublish?: boolean;
  /** 出力ディレクトリ */
  outputDir?: string;
  /** フック戦略 */
  hookStrategy?: HookStrategy;
  /** CTA種別 */
  ctaType?: CTAType;
}

/**
 * コンテンツパイプライン結果
 */
export interface ContentPipelineResult {
  /** 成功判定 */
  success: boolean;
  /** 生成されたブリーフ */
  brief?: ContentBrief;
  /** 生成された記事 */
  article?: ArticleDraft;
  /** SEOチェック結果 */
  seoCheck?: SEOCheckResult;
  /** SEOメタデータ */
  seoMetadata?: SEOMetadata;
  /** 公開結果 */
  publishResult?: PublishResult;
  /** エラー一覧 */
  errors: string[];
}

// ============================================
// Config Types
// ============================================

/**
 * コンテンツ生成設定
 */
export interface ContentConfig {
  version: string;
  description?: string;
  brief: BriefConfig;
  article: ArticleConfig;
  seo: SEOConfig;
  publish: PublishConfig;
}

export interface BriefConfig {
  minOutlines: number;
  maxOutlines: number;
  minReferences: number;
  snsInsightMin: number;
}

export interface ArticleConfig {
  wordCountTarget: number;
  wordCountMin: number;
  wordCountMax: number;
  hookStrategies: HookStrategy[];
  ctaTypes: CTAType[];
}

export interface SEOConfig {
  scoreThreshold: number;
  keywordDensity: { min: number; max: number };
  requiredHeadings: string[];
  minInternalLinks: number;
  minExternalLinks: number;
  maxMetaTitleLength: number;
  maxMetaDescriptionLength: number;
}

export interface PublishConfig {
  defaultStatus: ArticleStatus;
  autoSchedule: boolean;
}

// ============================================
// Brief Generation Options
// ============================================

/**
 * ブリーフ生成オプション
 */
export interface BriefGenerationOptions {
  /** 分析結果 */
  analysisResult?: FullAnalysisResult;
  /** サブキーワード候補 */
  suggestedKeywords?: string[];
  /** 参考URL候補 */
  suggestedReferences?: string[];
  /** 差別化ポイント候補 */
  suggestedDifferentiators?: string[];
}

/**
 * 記事執筆オプション
 */
export interface ArticleWritingOptions {
  /** フック戦略 */
  hookStrategy?: HookStrategy;
  /** CTA種別 */
  ctaType?: CTAType;
  /** 追加参考情報 */
  additionalReferences?: Reference[];
}

/**
 * SEO最適化オプション
 */
export interface SEOOptimizationOptions {
  /** ターゲットキーワード */
  targetKeyword: string;
  /** サブキーワード */
  secondaryKeywords?: string[];
  /** スコア閾値 */
  scoreThreshold?: number;
  /** Schema.orgタイプ */
  schemaType?: 'Article' | 'BlogPosting' | 'NewsArticle' | 'HowTo' | 'FAQ';
}
