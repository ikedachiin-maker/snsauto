/**
 * TSIS Content Generation Module - Orchestrator & Barrel Exports (Phase 4)
 *
 * コンテンツ生成パイプラインオーケストレーター。
 * ブリーフ生成→記事執筆→SEO最適化→CMS公開を統合実行。
 */

import {
  ContentBrief,
  ArticleDraft,
  SEOCheckResult,
  SEOMetadata,
  PublishResult,
  ContentPipelineOptions,
  ContentPipelineResult,
  TrendTopic,
} from './types';
import {
  generateBriefFromTrend,
  generateBriefFromKeyword,
  loadContentConfig,
} from './brief-generator';
import { writeArticleFromBrief } from './article-writer';
import {
  checkSEOScore,
  generateSEOMetadata,
  optimizeArticle,
  suggestImprovements,
} from './seo-optimizer';

// ============================================
// Re-exports
// ============================================

// Types
export * from './types';

// Brief Generator
export {
  generateBriefFromTrend,
  generateBriefFromKeyword,
  loadContentConfig,
  buildOutline,
  extractSNSInsights,
  suggestDifferentiators,
} from './brief-generator';

// Article Writer
export {
  writeArticleFromBrief,
  generateHook,
  expandOutline,
  insertCitation,
  generateCTA,
  countWords,
  improveReadability,
} from './article-writer';

// SEO Optimizer
export {
  checkSEOScore,
  generateSEOMetadata,
  optimizeArticle,
  generateSchema,
  suggestImprovements,
} from './seo-optimizer';

// ============================================
// Pipeline Orchestrator
// ============================================

/**
 * コンテンツパイプラインを実行
 */
export async function runContentPipeline(
  options: ContentPipelineOptions
): Promise<ContentPipelineResult> {
  const config = loadContentConfig();
  const errors: string[] = [];

  let brief: ContentBrief | undefined;
  let article: ArticleDraft | undefined;
  let seoCheck: SEOCheckResult | undefined;
  let seoMetadata: SEOMetadata | undefined;
  let publishResult: PublishResult | undefined;

  try {
    // Phase 1: ブリーフ生成
    brief = await phase1GenerateBrief(options);

    if (!brief) {
      return {
        success: false,
        errors: ['ブリーフの生成に失敗しました'],
      };
    }

    // Phase 2: 記事執筆
    article = await phase2WriteArticle(brief, options);

    if (!article) {
      return {
        success: false,
        brief,
        errors: ['記事の生成に失敗しました'],
      };
    }

    // Phase 3: SEO最適化
    const seoResult = await phase3OptimizeSEO(article, brief, options);
    article = seoResult.article;
    seoCheck = seoResult.seoCheck;
    seoMetadata = seoResult.seoMetadata;

    // SEOスコアチェック
    const threshold = options.seoScoreThreshold || config.seo.scoreThreshold;
    if (!seoCheck.passed) {
      errors.push(
        `SEOスコアが閾値を下回っています（${seoCheck.score}/${threshold}）`
      );
      // 改善提案を追加
      errors.push(...suggestImprovements(seoCheck));
    }

    // Phase 4: CMS公開（autoPublish=true時のみ）
    if (options.autoPublish && seoCheck.passed) {
      publishResult = await phase4Publish(article, seoMetadata);
    }

    return {
      success: seoCheck.passed,
      brief,
      article,
      seoCheck,
      seoMetadata,
      publishResult,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      brief,
      article,
      seoCheck,
      seoMetadata,
      publishResult,
      errors: [
        ...errors,
        error instanceof Error ? error.message : String(error),
      ],
    };
  }
}

// ============================================
// Individual Phases
// ============================================

/**
 * Phase 1: ブリーフ生成
 */
export async function phase1GenerateBrief(
  options: ContentPipelineOptions
): Promise<ContentBrief | undefined> {
  // トレンドトピックから生成
  if (options.trendTopics && options.trendTopics.length > 0) {
    // 最もスコアの高いトピックを選択
    const topTrend = options.trendTopics.sort(
      (a, b) => b.trendScore - a.trendScore
    )[0];

    return generateBriefFromTrend(topTrend, {
      analysisResult: options.analysisResult,
    });
  }

  // 手動トピックから生成
  if (options.manualTopic) {
    return generateBriefFromKeyword(options.manualTopic.keyword, {
      analysisResult: options.analysisResult,
    });
  }

  return undefined;
}

/**
 * Phase 2: 記事執筆
 */
export async function phase2WriteArticle(
  brief: ContentBrief,
  options: ContentPipelineOptions
): Promise<ArticleDraft> {
  return writeArticleFromBrief(brief, {
    hookStrategy: options.hookStrategy,
    ctaType: options.ctaType,
  });
}

/**
 * Phase 3: SEO最適化
 */
export async function phase3OptimizeSEO(
  article: ArticleDraft,
  brief: ContentBrief,
  options: ContentPipelineOptions
): Promise<{
  article: ArticleDraft;
  seoCheck: SEOCheckResult;
  seoMetadata: SEOMetadata;
}> {
  // SEOスコアチェック
  const seoCheck = checkSEOScore(article, brief.seoRequirements);

  // スコアが低い場合は最適化を適用
  let optimizedArticle = article;
  if (!seoCheck.passed) {
    optimizedArticle = optimizeArticle(article, {
      targetKeyword: brief.targetKeyword,
      secondaryKeywords: brief.secondaryKeywords,
      scoreThreshold: options.seoScoreThreshold,
    });
  }

  // メタデータ生成
  const seoMetadata = generateSEOMetadata(optimizedArticle, {
    targetKeyword: brief.targetKeyword,
    secondaryKeywords: brief.secondaryKeywords,
  });

  return {
    article: optimizedArticle,
    seoCheck,
    seoMetadata,
  };
}

/**
 * Phase 4: CMS公開
 */
export async function phase4Publish(
  article: ArticleDraft,
  metadata: SEOMetadata
): Promise<PublishResult> {
  // Ghost CMS MCPとの統合
  // 実際の実装ではMCPツールを呼び出す
  // ここではプレースホルダーを返す

  return {
    success: false,
    error: 'CMS公開はMCPツール経由で実行してください',
  };
}

// ============================================
// Quick Pipeline Functions
// ============================================

/**
 * クイックブリーフ生成
 */
export function quickGenerateBrief(
  keyword: string
): ContentBrief {
  return generateBriefFromKeyword(keyword);
}

/**
 * クイック記事生成
 */
export function quickWriteArticle(
  keyword: string
): ArticleDraft {
  const brief = generateBriefFromKeyword(keyword);
  return writeArticleFromBrief(brief);
}

/**
 * クイックSEOチェック
 */
export function quickSEOCheck(
  article: ArticleDraft
): SEOCheckResult {
  return checkSEOScore(article);
}

// ============================================
// Utility Functions
// ============================================

/**
 * パイプライン結果のサマリーを取得
 */
export function getPipelineSummary(result: ContentPipelineResult): string {
  const lines: string[] = [];

  lines.push(`成功: ${result.success ? 'はい' : 'いいえ'}`);

  if (result.brief) {
    lines.push(`ブリーフ: ${result.brief.title}`);
    lines.push(`キーワード: ${result.brief.targetKeyword}`);
  }

  if (result.article) {
    lines.push(`記事: ${result.article.wordCount}文字`);
    lines.push(`ステータス: ${result.article.status}`);
  }

  if (result.seoCheck) {
    lines.push(`SEOスコア: ${result.seoCheck.score}/100`);
    lines.push(`SEO合格: ${result.seoCheck.passed ? 'はい' : 'いいえ'}`);
  }

  if (result.publishResult?.success) {
    lines.push(`公開URL: ${result.publishResult.url}`);
  }

  if (result.errors.length > 0) {
    lines.push(`エラー: ${result.errors.length}件`);
  }

  return lines.join('\n');
}

/**
 * ブリーフをMarkdown形式で出力
 */
export function briefToMarkdown(brief: ContentBrief): string {
  const lines: string[] = [];

  lines.push(`# ${brief.title}`);
  lines.push('');
  lines.push(`**キーワード**: ${brief.targetKeyword}`);
  lines.push(`**サブキーワード**: ${brief.secondaryKeywords.join(', ')}`);
  lines.push('');
  lines.push('## 記事構成');
  lines.push('');

  for (const outline of brief.outline) {
    const prefix = '  '.repeat(outline.level - 1);
    lines.push(`${prefix}- ${outline.heading} (${outline.suggestedWordCount}文字)`);
    for (const point of outline.keyPoints) {
      lines.push(`${prefix}  - ${point}`);
    }
  }

  lines.push('');
  lines.push('## 差別化ポイント');
  lines.push('');
  for (const diff of brief.differentiators) {
    lines.push(`- ${diff}`);
  }

  if (brief.snsInsights.length > 0) {
    lines.push('');
    lines.push('## SNSインサイト');
    lines.push('');
    for (const insight of brief.snsInsights) {
      lines.push(`- [${insight.platform}] ${insight.insight}`);
    }
  }

  return lines.join('\n');
}
