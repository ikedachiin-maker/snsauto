/**
 * TSIS Distribution Module - Channel Optimizer (Phase 5)
 *
 * プラットフォーム制約に基づいてコンテンツを最適化・検証。
 * 文字数、ハッシュタグ数、メディア要件のチェックと自動修正。
 */

import {
  Platform,
  SNSRepurposedPost,
  SNSPostContent,
  PlatformConstraints,
  VideoScript,
  ValidationResult,
} from './types';
import { loadPlatformConstraints, truncateWithEllipsis } from './sns-repurposer';

// ============================================
// Validation
// ============================================

/**
 * 投稿の制約検証
 */
export function validateConstraints(
  post: SNSRepurposedPost
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  const constraints = post.constraints;
  const content = post.content;

  // 文字数チェック
  if (content.text.length > constraints.maxLength) {
    errors.push(`文字数超過: ${content.text.length}/${constraints.maxLength}`);
    score -= 30;
  } else if (content.text.length > constraints.maxLength * 0.95) {
    warnings.push(`文字数が上限に近い: ${content.text.length}/${constraints.maxLength}`);
    score -= 5;
  }

  // ハッシュタグ数チェック
  if (constraints.maxHashtags !== undefined) {
    if (content.hashtags.length > constraints.maxHashtags) {
      errors.push(`ハッシュタグ超過: ${content.hashtags.length}/${constraints.maxHashtags}`);
      score -= 20;
    }
  }

  // メンション数チェック
  if (constraints.maxMentions !== undefined && content.mentions) {
    if (content.mentions.length > constraints.maxMentions) {
      errors.push(`メンション超過: ${content.mentions.length}/${constraints.maxMentions}`);
      score -= 15;
    }
  }

  // メディア必須チェック
  if (constraints.mediaRequired) {
    if (!content.mediaUrls || content.mediaUrls.length === 0) {
      warnings.push('メディアが必須ですが、設定されていません');
      score -= 10;
    }
  }

  // リンク許可チェック
  if (!constraints.linkAllowed && content.linkUrl) {
    errors.push('このプラットフォームではリンクは許可されていません');
    score -= 15;
  }

  // コンテンツ品質チェック
  const qualityIssues = checkContentQuality(content, post.platform);
  warnings.push(...qualityIssues);
  score -= qualityIssues.length * 3;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * コンテンツ品質チェック
 */
function checkContentQuality(content: SNSPostContent, platform: Platform): string[] {
  const warnings: string[] = [];

  // 短すぎるテキスト
  if (content.text.length < 50) {
    warnings.push('テキストが短すぎる可能性があります');
  }

  // ハッシュタグが少ない（Instagram向け）
  if (platform === 'instagram' && content.hashtags.length < 10) {
    warnings.push('Instagramではハッシュタグを増やすと効果的');
  }

  // 改行が多すぎる
  const newlineCount = (content.text.match(/\n/g) || []).length;
  if (newlineCount > 10) {
    warnings.push('改行が多すぎる可能性があります');
  }

  // 絵文字チェック（LinkedIn向け）
  if (platform === 'linkedin') {
    const emojiPattern = /[\u{1F600}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojiCount = (content.text.match(emojiPattern) || []).length;
    if (emojiCount > 3) {
      warnings.push('LinkedInでは絵文字を控えめにすると効果的');
    }
  }

  return warnings;
}

// ============================================
// Optimization
// ============================================

/**
 * 投稿をチャネル向けに最適化
 */
export function optimizeForChannel(
  post: SNSRepurposedPost
): SNSRepurposedPost {
  const constraints = post.constraints;
  let content = { ...post.content };

  // 文字数調整
  if (content.text.length > constraints.maxLength) {
    content = {
      ...content,
      text: truncateWithEllipsis(content.text, constraints.maxLength),
    };
  }

  // ハッシュタグ数調整
  if (constraints.maxHashtags !== undefined &&
      content.hashtags.length > constraints.maxHashtags) {
    content = {
      ...content,
      hashtags: content.hashtags.slice(0, constraints.maxHashtags),
    };
  }

  // メンション数調整
  if (constraints.maxMentions !== undefined &&
      content.mentions &&
      content.mentions.length > constraints.maxMentions) {
    content = {
      ...content,
      mentions: content.mentions.slice(0, constraints.maxMentions),
    };
  }

  // リンク削除（許可されていない場合）
  if (!constraints.linkAllowed && content.linkUrl) {
    content = {
      ...content,
      linkUrl: undefined,
    };
  }

  return {
    ...post,
    content,
    status: 'optimized',
  };
}

/**
 * 複数投稿を一括最適化
 */
export function optimizeAllPosts(
  posts: SNSRepurposedPost[]
): SNSRepurposedPost[] {
  return posts.map(post => optimizeForChannel(post));
}

// ============================================
// Suggestions
// ============================================

/**
 * 改善提案を生成
 */
export function suggestImprovements(
  post: SNSRepurposedPost
): string[] {
  const suggestions: string[] = [];
  const content = post.content;
  const platform = post.platform;

  // プラットフォーム別の提案
  switch (platform) {
    case 'twitter':
      suggestions.push(...suggestTwitterImprovements(content));
      break;
    case 'instagram':
      suggestions.push(...suggestInstagramImprovements(content));
      break;
    case 'linkedin':
      suggestions.push(...suggestLinkedInImprovements(content));
      break;
    case 'threads':
      suggestions.push(...suggestThreadsImprovements(content));
      break;
    case 'tiktok':
      suggestions.push(...suggestTikTokImprovements(content));
      break;
  }

  // 共通の提案
  suggestions.push(...suggestCommonImprovements(content));

  return suggestions;
}

function suggestTwitterImprovements(content: SNSPostContent): string[] {
  const suggestions: string[] = [];

  // スレッド化の提案
  if (content.text.length > 250) {
    suggestions.push('長文はスレッド形式に分割すると読みやすい');
  }

  // エンゲージメント促進
  if (!content.text.includes('?') && !content.text.includes('？')) {
    suggestions.push('質問を含めるとエンゲージメントが向上');
  }

  // ハッシュタグ位置
  if (content.hashtags.length > 0 && !content.text.endsWith('\n')) {
    suggestions.push('ハッシュタグは改行後に配置すると見やすい');
  }

  return suggestions;
}

function suggestInstagramImprovements(content: SNSPostContent): string[] {
  const suggestions: string[] = [];

  // ハッシュタグ数
  if (content.hashtags.length < 15) {
    suggestions.push('ハッシュタグを15〜25個に増やすとリーチ向上');
  }

  // CTA
  if (!content.text.includes('保存') && !content.text.includes('📌')) {
    suggestions.push('「保存してね」CTAを追加すると保存率向上');
  }

  // 改行
  if (content.text.length > 500 && !content.text.includes('\n\n')) {
    suggestions.push('段落を分けて読みやすくする');
  }

  return suggestions;
}

function suggestLinkedInImprovements(content: SNSPostContent): string[] {
  const suggestions: string[] = [];

  // フック
  if (!content.text.startsWith('**') && content.text.length > 100) {
    suggestions.push('冒頭に太字のフックを追加すると注目度UP');
  }

  // 専門性
  if (content.hashtags.length > 5) {
    suggestions.push('LinkedInではハッシュタグは3〜5個が最適');
  }

  // CTA
  if (!content.text.includes('コメント')) {
    suggestions.push('「ご意見をコメントで」を追加するとエンゲージメント向上');
  }

  return suggestions;
}

function suggestThreadsImprovements(content: SNSPostContent): string[] {
  const suggestions: string[] = [];

  // 会話調
  if (content.text.includes('です。') || content.text.includes('ます。')) {
    suggestions.push('カジュアルな語尾にするとThreadsらしさUP');
  }

  return suggestions;
}

function suggestTikTokImprovements(content: SNSPostContent): string[] {
  const suggestions: string[] = [];

  // 短さ
  if (content.text.length > 100) {
    suggestions.push('TikTokではキャプションを極力短く');
  }

  return suggestions;
}

function suggestCommonImprovements(content: SNSPostContent): string[] {
  const suggestions: string[] = [];

  // CTA存在チェック
  const ctaKeywords = ['フォロー', 'いいね', 'コメント', 'シェア', '保存', 'プロフィール'];
  const hasCTA = ctaKeywords.some(kw => content.text.includes(kw));
  if (!hasCTA) {
    suggestions.push('CTAを追加するとアクション率向上');
  }

  // ハッシュタグの多様性
  if (content.hashtags.length > 5) {
    const uniqueFirstChars = new Set(content.hashtags.map(t => t[0]));
    if (uniqueFirstChars.size < 3) {
      suggestions.push('ハッシュタグにバリエーションを持たせる');
    }
  }

  return suggestions;
}

// ============================================
// Content Scoring
// ============================================

/**
 * コンテンツスコアを計算
 */
export function calculateContentScore(post: SNSRepurposedPost): number {
  let score = 100;
  const content = post.content;
  const platform = post.platform;

  // 検証結果から減点
  const validation = validateConstraints(post);
  score = validation.score;

  // プラットフォーム最適化ボーナス
  score += calculatePlatformBonus(content, platform);

  // エンゲージメント要素ボーナス
  score += calculateEngagementBonus(content);

  return Math.min(100, Math.max(0, score));
}

/**
 * プラットフォーム最適化ボーナス
 */
function calculatePlatformBonus(content: SNSPostContent, platform: Platform): number {
  let bonus = 0;

  switch (platform) {
    case 'instagram':
      if (content.hashtags.length >= 15) bonus += 5;
      if (content.text.includes('📌') || content.text.includes('保存')) bonus += 3;
      break;
    case 'twitter':
      if (content.text.length <= 200) bonus += 5;
      if (content.hashtags.length <= 3) bonus += 3;
      break;
    case 'linkedin':
      if (content.text.length >= 500) bonus += 5;
      if (content.hashtags.length <= 5) bonus += 3;
      break;
    case 'threads':
      if (content.text.length <= 400) bonus += 5;
      break;
  }

  return bonus;
}

/**
 * エンゲージメント要素ボーナス
 */
function calculateEngagementBonus(content: SNSPostContent): number {
  let bonus = 0;

  // 質問形式
  if (content.text.includes('?') || content.text.includes('？')) {
    bonus += 3;
  }

  // 数字の使用
  if (/\d+/.test(content.text)) {
    bonus += 2;
  }

  // 改行による読みやすさ
  const lineCount = content.text.split('\n').length;
  if (lineCount >= 3 && lineCount <= 10) {
    bonus += 3;
  }

  // ハッシュタグ存在
  if (content.hashtags.length > 0) {
    bonus += 2;
  }

  return bonus;
}

// ============================================
// Video Script Validation
// ============================================

/**
 * 動画台本を検証
 */
export function validateVideoScript(script: VideoScript): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 総尺チェック
  const actualDuration = script.hook.duration +
    script.mainPoints.reduce((sum, p) => sum + p.duration, 0) +
    script.cta.duration;

  if (actualDuration > script.duration + 5) {
    errors.push(`総尺超過: ${actualDuration}秒 > ${script.duration}秒`);
    score -= 20;
  }

  // フックチェック
  if (script.hook.text.length > 100) {
    warnings.push('フックが長すぎる可能性');
    score -= 5;
  }

  // 本編ポイント数チェック
  if (script.mainPoints.length < 2) {
    warnings.push('本編ポイントが少なすぎる');
    score -= 10;
  }
  if (script.mainPoints.length > 5) {
    warnings.push('本編ポイントが多すぎる可能性');
    score -= 5;
  }

  // CTAチェック
  if (script.cta.text.length < 10) {
    warnings.push('CTAが短すぎる');
    score -= 5;
  }

  // ハッシュタグチェック
  if (script.hashtags.length === 0) {
    warnings.push('ハッシュタグがありません');
    score -= 5;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score),
  };
}

// ============================================
// Batch Validation
// ============================================

/**
 * 複数投稿を一括検証
 */
export function validateAllPosts(
  posts: SNSRepurposedPost[]
): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  for (const post of posts) {
    results.set(post.id, validateConstraints(post));
  }

  return results;
}

/**
 * 複数動画台本を一括検証
 */
export function validateAllScripts(
  scripts: VideoScript[]
): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  for (const script of scripts) {
    results.set(script.id, validateVideoScript(script));
  }

  return results;
}

/**
 * 検証サマリーを生成
 */
export function generateValidationSummary(
  results: Map<string, ValidationResult>
): {
  total: number;
  valid: number;
  invalid: number;
  averageScore: number;
  commonErrors: string[];
  commonWarnings: string[];
} {
  const allResults = Array.from(results.values());
  const total = allResults.length;
  const valid = allResults.filter(r => r.valid).length;
  const averageScore = allResults.reduce((sum, r) => sum + r.score, 0) / total;

  // 共通エラー・警告を集計
  const errorCounts = new Map<string, number>();
  const warningCounts = new Map<string, number>();

  for (const result of allResults) {
    for (const error of result.errors) {
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
    }
    for (const warning of result.warnings) {
      warningCounts.set(warning, (warningCounts.get(warning) || 0) + 1);
    }
  }

  const commonErrors = Array.from(errorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([error]) => error);

  const commonWarnings = Array.from(warningCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([warning]) => warning);

  return {
    total,
    valid,
    invalid: total - valid,
    averageScore: Math.round(averageScore * 10) / 10,
    commonErrors,
    commonWarnings,
  };
}
