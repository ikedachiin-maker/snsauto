/**
 * TSIS Distribution Module - Type Definitions (Phase 5)
 *
 * マルチチャネル配信パイプライン固有の型定義。
 * SNS投稿リパーパス、ショート動画台本生成、配信スケジューリング。
 */

import { Platform, PostType } from '../types/unified-post';
import { ArticleDraft } from '../content/types';

// Re-export for convenience
export type { Platform, PostType, ArticleDraft };

// ============================================
// Distribution Status
// ============================================

export type DistributionStatus =
  | 'draft'
  | 'optimized'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed';

// ============================================
// Platform Constraints
// ============================================

/**
 * プラットフォーム制約
 */
export interface PlatformConstraints {
  /** 最大文字数 */
  maxLength: number;
  /** 最大ハッシュタグ数 */
  maxHashtags?: number;
  /** 最大メンション数 */
  maxMentions?: number;
  /** メディア必須 */
  mediaRequired: boolean;
  /** リンク許可 */
  linkAllowed: boolean;
}

/**
 * プラットフォーム制約マップ
 */
export type PlatformConstraintsMap = Record<Platform, PlatformConstraints>;

// ============================================
// SNS Repurposed Post
// ============================================

/**
 * リパーパスされたSNS投稿
 */
export interface SNSRepurposedPost {
  /** 投稿ID（UUID） */
  id: string;
  /** 元記事ID */
  articleId: string;
  /** 対象プラットフォーム */
  platform: Platform;
  /** 投稿タイプ */
  postType: PostType;
  /** コンテンツ */
  content: SNSPostContent;
  /** 適用された制約 */
  constraints: PlatformConstraints;
  /** 生成日時（ISO 8601） */
  generatedAt: string;
  /** ステータス */
  status: DistributionStatus;
}

/**
 * SNS投稿コンテンツ
 */
export interface SNSPostContent {
  /** 投稿テキスト */
  text: string;
  /** ハッシュタグ */
  hashtags: string[];
  /** メンション */
  mentions?: string[];
  /** メディアURL */
  mediaUrls?: string[];
  /** リンクURL */
  linkUrl?: string;
}

// ============================================
// Video Script Types
// ============================================

/**
 * ショート動画プラットフォーム
 */
export type VideoScriptPlatform = 'instagram_reels' | 'tiktok' | 'youtube_shorts';

/**
 * フックパターン（7種類）
 */
export type HookPattern =
  | 'question'      // 疑問形
  | 'prohibition'   // 禁止形
  | 'shocking'      // 衝撃事実
  | 'number'        // 数字訴求
  | 'empathy'       // 共感型
  | 'contrast'      // 対比
  | 'authority';    // 権威性

/**
 * 動画CTA種別
 */
export type VideoCTAType =
  | 'follow'
  | 'save'
  | 'comment'
  | 'share'
  | 'profile'
  | 'link';

/**
 * ショート動画台本
 */
export interface VideoScript {
  /** 台本ID（UUID） */
  id: string;
  /** 元記事ID */
  articleId: string;
  /** 対象プラットフォーム */
  platform: VideoScriptPlatform;
  /** 動画タイトル */
  title: string;
  /** 総尺（秒） */
  duration: number;
  /** フック部分 */
  hook: VideoHook;
  /** 本編ポイント */
  mainPoints: VideoMainPoint[];
  /** CTA部分 */
  cta: VideoCTA;
  /** ハッシュタグ */
  hashtags: string[];
  /** 生成日時（ISO 8601） */
  generatedAt: string;
}

/**
 * 動画フック
 */
export interface VideoHook {
  /** パターン */
  pattern: HookPattern;
  /** テキスト */
  text: string;
  /** 尺（秒） */
  duration: number;
}

/**
 * 動画本編ポイント
 */
export interface VideoMainPoint {
  /** ポイント番号 */
  index: number;
  /** テキスト */
  text: string;
  /** 尺（秒） */
  duration: number;
  /** テロップオーバーレイ */
  overlay?: string;
}

/**
 * 動画CTA
 */
export interface VideoCTA {
  /** CTA種別 */
  type: VideoCTAType;
  /** テキスト */
  text: string;
  /** 尺（秒） */
  duration: number;
}

// ============================================
// Distribution Schedule
// ============================================

/**
 * 配信戦略
 */
export type DistributionStrategy = 'immediate' | 'staggered' | 'optimized';

/**
 * 配信スケジュール
 */
export interface DistributionSchedule {
  /** 配信戦略 */
  strategy: DistributionStrategy;
  /** タイムゾーン */
  timezone: string;
  /** 開始日時（ISO 8601） */
  startDate: string;
  /** 間隔（分）- staggered時のみ */
  interval?: number;
  /** 終了日時（ISO 8601） */
  endDate?: string;
}

// ============================================
// Multi-Channel Distribution
// ============================================

/**
 * マルチチャネル配信
 */
export interface MultiChannelDistribution {
  /** 配信ID（UUID） */
  id: string;
  /** 元記事ID */
  articleId: string;
  /** SNS投稿一覧 */
  snsPosts: SNSRepurposedPost[];
  /** 動画台本一覧 */
  videoScripts: VideoScript[];
  /** スケジュール */
  schedule: DistributionSchedule;
  /** ステータス */
  status: DistributionStatus;
  /** 作成日時（ISO 8601） */
  createdAt: string;
}

// ============================================
// Distribution Result
// ============================================

/**
 * チャネル配信結果
 */
export interface ChannelResult {
  /** チャネル */
  channel: Platform | VideoScriptPlatform;
  /** 成功判定 */
  success: boolean;
  /** 投稿ID（プラットフォーム側） */
  postId?: string;
  /** 投稿URL */
  postUrl?: string;
  /** エラーメッセージ */
  error?: string;
  /** 配信日時（ISO 8601） */
  publishedAt?: string;
}

/**
 * 配信メトリクス
 */
export interface DistributionMetrics {
  /** 総チャネル数 */
  totalChannels: number;
  /** 成功数 */
  successCount: number;
  /** 失敗数 */
  failureCount: number;
  /** 予想リーチ */
  expectedReach?: number;
  /** コンテンツスコア */
  contentScore?: number;
}

/**
 * 配信結果
 */
export interface DistributionResult {
  /** 配信ID */
  distributionId: string;
  /** 各チャネル結果 */
  results: ChannelResult[];
  /** メトリクス */
  metrics: DistributionMetrics;
  /** 完了日時（ISO 8601） */
  completedAt: string;
}

// ============================================
// Pipeline Options
// ============================================

/**
 * 配信パイプラインオプション
 */
export interface DistributionOptions {
  /** 対象プラットフォーム */
  platforms?: Platform[];
  /** 動画フォーマット */
  videoFormats?: VideoScriptPlatform[];
  /** フックパターン */
  hookPattern?: HookPattern;
  /** CTA種別 */
  ctaType?: VideoCTAType;
  /** 配信戦略 */
  scheduleStrategy?: DistributionStrategy;
  /** 自動公開 */
  autoPublish?: boolean;
}

/**
 * 検証結果
 */
export interface ValidationResult {
  /** 検証通過 */
  valid: boolean;
  /** エラー一覧 */
  errors: string[];
  /** 警告一覧 */
  warnings: string[];
  /** スコア（0-100） */
  score: number;
}

// ============================================
// Config Types
// ============================================

/**
 * 配信設定
 */
export interface DistributionConfig {
  version: string;
  description?: string;
  defaultPlatforms: Platform[];
  defaultVideoFormats: VideoScriptPlatform[];
  schedule: {
    defaultStrategy: DistributionStrategy;
    defaultTimezone: string;
    staggeredInterval: number;
  };
  hooks: {
    patterns: HookPattern[];
    defaultPattern: HookPattern;
  };
  cta: {
    types: VideoCTAType[];
    defaultType: VideoCTAType;
  };
}
