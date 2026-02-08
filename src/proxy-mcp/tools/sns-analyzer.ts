/**
 * SNS Analyzer Tools (Phase 3)
 *
 * SNS分析パイプラインをproxy-mcpツールとして公開。
 * Minimal Output Principle: サマリー+refIdを返し、全データはメモリに保存。
 *
 * 提供ツール:
 * - sns.analyze    - 全分析オーケストレーター
 * - sns.sentiment  - センチメント分析
 * - sns.report     - レポート生成
 * - sns.competitors - 競合分析
 */

import { ToolResult } from '../types';
import {
  runFullAnalysis,
  analyzePostsBatch,
  analyzePerformance,
  analyzeHashtags,
  buildAnalysisReport,
  generateMarkdownReport,
  loadCompetitorProfiles,
  analyzeCompetitors,
  getAnalysisSummary,
  AnalysisOptions,
  SentimentAnalyzerOptions,
} from '../../sns/analysis';
import { Platform, UnifiedPost } from '../../types/unified-post';
import { randomUUID } from 'crypto';

/**
 * sns.analyze - 全分析オーケストレーター
 *
 * センチメント・パフォーマンス・ハッシュタグ・競合分析を統合実行。
 * Minimal Output Principle: サマリーを返し、詳細データはoutput/sns/analysisに保存。
 */
export async function snsAnalyze(params: {
  posts: UnifiedPost[];
  period?: { start: string; end: string };
  platforms?: Platform[];
  topPostsCount?: number;
  buzzThreshold?: number;
  enableSentiment?: boolean;
  enableCompetitors?: boolean;
  competitorPosts?: Record<string, UnifiedPost[]>;
}): Promise<ToolResult> {
  try {
    if (!params.posts || params.posts.length === 0) {
      return {
        success: false,
        error: 'posts パラメータが空です。分析対象の投稿データを提供してください。',
      };
    }

    const options: AnalysisOptions = {
      period: params.period,
      platforms: params.platforms,
      topPostsCount: params.topPostsCount ?? 10,
      buzzThreshold: params.buzzThreshold ?? 3.0,
      enableSentiment: params.enableSentiment ?? true,
      enableCompetitors: params.enableCompetitors ?? false,
    };

    // 競合投稿データをMapに変換
    let competitorPostsMap: Map<string, UnifiedPost[]> | undefined;
    if (params.competitorPosts) {
      competitorPostsMap = new Map(Object.entries(params.competitorPosts));
    }

    const result = await runFullAnalysis(
      params.posts,
      options,
      competitorPostsMap
    );

    const refId = `sns-analysis-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'sns.analyze',
        summary: getAnalysisSummary(result),
        reportId: result.report.id,
        period: result.report.period,
        platforms: result.report.platforms,
        stats: {
          totalPosts: result.report.summary.totalPosts,
          totalEngagement: result.report.summary.totalEngagement,
          avgEngagementRate: result.report.summary.avgEngagementRate,
          sentimentBreakdown: result.report.summary.sentimentBreakdown,
          buzzPostCount: result.performance.buzzPosts.length,
          uniqueHashtagCount: result.hashtags.totalUniqueHashtags,
        },
        topPosts: result.performance.topPosts.slice(0, 5).map((p) => ({
          platform: p.platform,
          author: p.author.username,
          engagement:
            p.engagement.likes +
            p.engagement.comments +
            p.engagement.shares +
            p.engagement.saves,
          postType: p.metadata.postType,
        })),
        recommendations: result.report.recommendations.slice(0, 5),
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
 * sns.sentiment - センチメント分析ツール
 *
 * 投稿のセンチメント（感情極性）を分析。
 */
export async function snsSentiment(params: {
  posts: UnifiedPost[];
  language?: string;
  enableEmotions?: boolean;
}): Promise<ToolResult> {
  try {
    if (!params.posts || params.posts.length === 0) {
      return {
        success: false,
        error: 'posts パラメータが空です。',
      };
    }

    const options: SentimentAnalyzerOptions = {
      language: params.language,
      enableEmotions: params.enableEmotions ?? true,
    };

    const analyzedPosts = analyzePostsBatch(params.posts, options);

    // センチメント集計
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    for (const post of analyzedPosts) {
      if (post.analysis?.sentiment) {
        sentimentCounts[post.analysis.sentiment.label] += 1;
      }
    }

    const refId = `sns-sentiment-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'sns.sentiment',
        totalAnalyzed: analyzedPosts.length,
        sentimentBreakdown: sentimentCounts,
        percentages: {
          positive: ((sentimentCounts.positive / analyzedPosts.length) * 100).toFixed(1),
          neutral: ((sentimentCounts.neutral / analyzedPosts.length) * 100).toFixed(1),
          negative: ((sentimentCounts.negative / analyzedPosts.length) * 100).toFixed(1),
        },
        sampleResults: analyzedPosts.slice(0, 5).map((p) => ({
          platform: p.platform,
          textPreview: p.content.text.slice(0, 80),
          sentiment: p.analysis?.sentiment?.label,
          score: p.analysis?.sentiment?.score,
          emotions: p.analysis?.sentiment?.emotions,
        })),
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
 * sns.report - レポート生成ツール
 *
 * 分析結果からMarkdownレポートを生成。
 */
export async function snsReport(params: {
  posts: UnifiedPost[];
  topPostsCount?: number;
  buzzThreshold?: number;
}): Promise<ToolResult> {
  try {
    if (!params.posts || params.posts.length === 0) {
      return {
        success: false,
        error: 'posts パラメータが空です。',
      };
    }

    // センチメント分析
    const analyzedPosts = analyzePostsBatch(params.posts);

    // パフォーマンス分析
    const performance = analyzePerformance(analyzedPosts, {
      topPostsCount: params.topPostsCount ?? 10,
      buzzThreshold: params.buzzThreshold ?? 3.0,
    });

    // ハッシュタグ分析
    const hashtags = analyzeHashtags(analyzedPosts);

    // レポート構築
    const report = buildAnalysisReport(analyzedPosts, performance, hashtags);

    // Markdownレポート生成
    const markdownReport = generateMarkdownReport(report);

    const refId = `sns-report-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'sns.report',
        reportId: report.id,
        generatedAt: report.generatedAt,
        period: report.period,
        platforms: report.platforms,
        stats: {
          totalPosts: report.summary.totalPosts,
          totalEngagement: report.summary.totalEngagement,
          avgEngagementRate: report.summary.avgEngagementRate,
        },
        markdownPreview: markdownReport.slice(0, 1000) + '...',
        fullReportLength: markdownReport.length,
        savePath: `output/sns/reports/sns-analysis-${report.period.start}-${report.period.end}.md`,
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
 * sns.competitors - 競合分析ツール
 *
 * 自社と競合のパフォーマンスを比較分析。
 */
export async function snsCompetitors(params: {
  selfPosts: UnifiedPost[];
  competitorPosts: Record<string, UnifiedPost[]>;
}): Promise<ToolResult> {
  try {
    if (!params.selfPosts || params.selfPosts.length === 0) {
      return {
        success: false,
        error: 'selfPosts パラメータが空です。',
      };
    }

    if (!params.competitorPosts || Object.keys(params.competitorPosts).length === 0) {
      return {
        success: false,
        error: 'competitorPosts パラメータが空です。競合の投稿データを提供してください。',
      };
    }

    const competitorConfig = loadCompetitorProfiles();
    const competitorPostsMap = new Map(Object.entries(params.competitorPosts));

    const result = analyzeCompetitors(
      params.selfPosts,
      competitorPostsMap,
      competitorConfig.competitors
    );

    const refId = `sns-competitors-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'sns.competitors',
        comparisonCount: result.comparisons.length,
        competitorNames: [...competitorPostsMap.keys()],
        summaryGaps: result.summaryGaps,
        summaryOpportunities: result.summaryOpportunities,
        platformComparisons: result.comparisons.map((c) => ({
          platform: c.self.platform,
          selfMetrics: {
            totalPosts: c.self.totalPosts,
            avgEngagementRate: c.self.avgEngagementRate,
          },
          competitorCount: c.competitors.length,
          gaps: c.gaps.slice(0, 3),
          opportunities: c.opportunities.slice(0, 3),
        })),
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
