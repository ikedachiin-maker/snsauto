/**
 * Content Generator Tools (Phase 4)
 *
 * コンテンツ生成パイプラインをproxy-mcpツールとして公開。
 * Minimal Output Principle: サマリー+refIdを返し、全データはメモリに保存。
 *
 * 提供ツール:
 * - content.brief   - ブリーフ生成
 * - content.write   - 記事執筆
 * - content.seo     - SEO最適化
 * - content.publish - CMS公開
 */

import { ToolResult } from '../types';
import {
  runContentPipeline,
  generateBriefFromKeyword,
  generateBriefFromTrend,
  writeArticleFromBrief,
  checkSEOScore,
  generateSEOMetadata,
  optimizeArticle,
  getPipelineSummary,
  briefToMarkdown,
  ContentBrief,
  ArticleDraft,
  TrendTopic,
  HookStrategy,
  CTAType,
} from '../../content';
import { FullAnalysisResult } from '../../sns/analysis';
import { randomUUID } from 'crypto';

/**
 * content.brief - ブリーフ生成ツール
 *
 * トレンドトピックまたはキーワードからコンテンツブリーフを生成。
 */
export async function contentBrief(params: {
  keyword?: string;
  trendTopic?: TrendTopic;
  analysisResult?: FullAnalysisResult;
  suggestedKeywords?: string[];
}): Promise<ToolResult> {
  try {
    if (!params.keyword && !params.trendTopic) {
      return {
        success: false,
        error: 'keyword または trendTopic のいずれかを指定してください。',
      };
    }

    let brief: ContentBrief;

    if (params.trendTopic) {
      brief = generateBriefFromTrend(params.trendTopic, {
        analysisResult: params.analysisResult,
        suggestedKeywords: params.suggestedKeywords,
      });
    } else {
      brief = generateBriefFromKeyword(params.keyword!, {
        analysisResult: params.analysisResult,
        suggestedKeywords: params.suggestedKeywords,
      });
    }

    const refId = `content-brief-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'content.brief',
        briefId: brief.id,
        title: brief.title,
        targetKeyword: brief.targetKeyword,
        secondaryKeywords: brief.secondaryKeywords,
        outlineCount: brief.outline.length,
        differentiatorCount: brief.differentiators.length,
        snsInsightCount: brief.snsInsights.length,
        seoRequirements: {
          wordCount: `${brief.seoRequirements.minWordCount}-${brief.seoRequirements.maxWordCount}`,
          internalLinks: brief.seoRequirements.internalLinks,
          externalLinks: brief.seoRequirements.externalLinks,
        },
        markdownPreview: briefToMarkdown(brief).slice(0, 500) + '...',
      },
      referenceId: refId,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * content.write - 記事執筆ツール
 *
 * ブリーフから記事を生成。
 */
export async function contentWrite(params: {
  brief: ContentBrief;
  hookStrategy?: HookStrategy;
  ctaType?: CTAType;
}): Promise<ToolResult> {
  try {
    if (!params.brief) {
      return {
        success: false,
        error: 'brief パラメータが必要です。content.brief で生成したブリーフを渡してください。',
      };
    }

    const article = writeArticleFromBrief(params.brief, {
      hookStrategy: params.hookStrategy,
      ctaType: params.ctaType,
    });

    const refId = `content-article-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'content.write',
        articleId: article.id,
        briefId: article.briefId,
        title: article.title,
        wordCount: article.wordCount,
        status: article.status,
        sourceCount: article.sources.length,
        contentPreview: article.content.slice(0, 500) + '...',
        savePath: `output/content/articles/${article.id}.md`,
      },
      referenceId: refId,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * content.seo - SEO最適化ツール
 *
 * 記事のSEOスコアをチェックし、最適化を適用。
 */
export async function contentSEO(params: {
  article: ArticleDraft;
  targetKeyword: string;
  secondaryKeywords?: string[];
  scoreThreshold?: number;
}): Promise<ToolResult> {
  try {
    if (!params.article) {
      return {
        success: false,
        error: 'article パラメータが必要です。content.write で生成した記事を渡してください。',
      };
    }

    // SEOスコアチェック
    const seoCheck = checkSEOScore(params.article);

    // 最適化を適用
    const optimizedArticle = optimizeArticle(params.article, {
      targetKeyword: params.targetKeyword,
      secondaryKeywords: params.secondaryKeywords,
      scoreThreshold: params.scoreThreshold,
    });

    // メタデータ生成
    const seoMetadata = generateSEOMetadata(optimizedArticle, {
      targetKeyword: params.targetKeyword,
      secondaryKeywords: params.secondaryKeywords,
    });

    const refId = `content-seo-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'content.seo',
        articleId: params.article.id,
        seoScore: seoCheck.score,
        passed: seoCheck.passed,
        checks: seoCheck.checks.map(c => ({
          name: c.name,
          passed: c.passed,
          score: c.score,
        })),
        suggestions: seoCheck.suggestions.slice(0, 5),
        metadata: {
          metaTitle: seoMetadata.metaTitle,
          metaDescription: seoMetadata.metaDescription.slice(0, 100) + '...',
          keywordCount: seoMetadata.keywords.length,
        },
        optimizedStatus: optimizedArticle.status,
      },
      referenceId: refId,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * content.publish - CMS公開ツール
 *
 * Ghost CMSに記事を公開（ドラフトとして保存）。
 * 注意: 実際の公開はGhost CMS MCPを使用。
 */
export async function contentPublish(params: {
  article: ArticleDraft;
  seoMetadata: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  publishAs?: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
}): Promise<ToolResult> {
  try {
    if (!params.article) {
      return {
        success: false,
        error: 'article パラメータが必要です。',
      };
    }

    // Ghost CMS MCPへの橋渡し
    // 実際の公開処理はMCPツールを使用する必要がある
    const refId = `content-publish-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'content.publish',
        articleId: params.article.id,
        title: params.article.title,
        wordCount: params.article.wordCount,
        publishAs: params.publishAs || 'draft',
        scheduledAt: params.scheduledAt,
        instructions: [
          'Ghost CMS MCPの create_post ツールを使用して公開してください。',
          '以下のデータを渡してください:',
          `  - title: "${params.article.title}"`,
          `  - html: (Markdown→HTML変換後)`,
          `  - meta_title: "${params.seoMetadata.metaTitle}"`,
          `  - meta_description: "${params.seoMetadata.metaDescription}"`,
          `  - status: "${params.publishAs || 'draft'}"`,
        ],
        savePath: `output/content/publish/${params.article.id}.json`,
      },
      referenceId: refId,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * content.pipeline - パイプライン一括実行ツール
 *
 * ブリーフ生成→記事執筆→SEO最適化を一括実行。
 */
export async function contentPipeline(params: {
  keyword?: string;
  trendTopic?: TrendTopic;
  analysisResult?: FullAnalysisResult;
  hookStrategy?: HookStrategy;
  ctaType?: CTAType;
  seoScoreThreshold?: number;
  autoPublish?: boolean;
}): Promise<ToolResult> {
  try {
    if (!params.keyword && !params.trendTopic) {
      return {
        success: false,
        error: 'keyword または trendTopic のいずれかを指定してください。',
      };
    }

    const result = await runContentPipeline({
      manualTopic: params.keyword
        ? { title: params.keyword, keyword: params.keyword }
        : undefined,
      trendTopics: params.trendTopic ? [params.trendTopic] : undefined,
      analysisResult: params.analysisResult,
      hookStrategy: params.hookStrategy,
      ctaType: params.ctaType,
      seoScoreThreshold: params.seoScoreThreshold,
      autoPublish: params.autoPublish,
    });

    const refId = `content-pipeline-${randomUUID().slice(0, 8)}`;

    return {
      success: result.success,
      data: {
        action: 'content.pipeline',
        summary: getPipelineSummary(result),
        brief: result.brief
          ? {
              id: result.brief.id,
              title: result.brief.title,
              keyword: result.brief.targetKeyword,
            }
          : null,
        article: result.article
          ? {
              id: result.article.id,
              wordCount: result.article.wordCount,
              status: result.article.status,
            }
          : null,
        seo: result.seoCheck
          ? {
              score: result.seoCheck.score,
              passed: result.seoCheck.passed,
            }
          : null,
        publish: result.publishResult
          ? {
              success: result.publishResult.success,
              url: result.publishResult.url,
            }
          : null,
        errors: result.errors,
      },
      referenceId: refId,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
