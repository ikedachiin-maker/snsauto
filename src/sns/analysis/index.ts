/**
 * TSIS Analysis Module - Orchestrator & Barrel Exports (Phase 3)
 *
 * 分析オーケストレーター: 全分析を統合実行し、FullAnalysisResultを返却。
 */

import {
  Platform,
  UnifiedPost,
} from '../../types/unified-post';
import {
  AnalysisOptions,
  FullAnalysisResult,
  SentimentAnalyzerOptions,
} from './types';
import { analyzePostsBatch } from './sentiment';
import { analyzePerformance, getPlatformAvgEngagement } from './performance';
import { analyzeHashtags } from './hashtags';
import {
  loadCompetitorProfiles,
  analyzeCompetitors,
} from './competitor';
import {
  buildAnalysisReport,
  generateMarkdownReport,
} from './report-generator';

// ============================================
// Re-exports
// ============================================

// Types
export * from './types';

// Sentiment
export {
  analyzeSentiment,
  analyzePost,
  analyzePostsBatch,
} from './sentiment';

// Performance
export {
  calculatePlatformMetrics,
  extractTopPosts,
  calculateTimeSlots,
  extractBestTimeSlots,
  compareContentTypes,
  detectBuzzPosts,
  analyzePerformance,
  getPlatformAvgEngagement,
} from './performance';

// Hashtags
export {
  analyzeHashtags,
  extractTopHashtags,
  extractHighEngagementHashtags,
  extractRisingHashtags,
  getHashtagsByPlatform,
  getHashtagUsage,
} from './hashtags';

// Competitor
export {
  loadCompetitorProfiles,
  saveCompetitorProfiles,
  addCompetitor,
  removeCompetitor,
  analyzeCompetitors,
  findContentGaps,
  findOpportunities,
  generateCompetitorSummary,
} from './competitor';

// Report
export {
  buildAnalysisReport,
  generateMarkdownReport,
  generateRecommendations,
} from './report-generator';

// ============================================
// Default Options
// ============================================

const DEFAULT_OPTIONS: AnalysisOptions = {
  topPostsCount: 10,
  buzzThreshold: 3.0,
  enableSentiment: true,
  enableCompetitors: true,
};

// ============================================
// Main Orchestrator
// ============================================

/**
 * 全分析を実行
 * @param posts 分析対象の投稿データ
 * @param options 分析オプション
 * @param competitorPostsMap 競合投稿データ（オプション）
 */
export async function runFullAnalysis(
  posts: UnifiedPost[],
  options?: AnalysisOptions,
  competitorPostsMap?: Map<string, UnifiedPost[]>
): Promise<FullAnalysisResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 1. 期間・プラットフォームフィルタ
  let filteredPosts = filterPosts(posts, opts);

  // 2. センチメント分析（有効時）
  let analyzedPosts: UnifiedPost[];
  if (opts.enableSentiment) {
    analyzedPosts = analyzePostsBatch(filteredPosts, opts.sentimentOptions);
  } else {
    analyzedPosts = filteredPosts;
  }

  // 3. パフォーマンス分析
  const performance = analyzePerformance(analyzedPosts, {
    topPostsCount: opts.topPostsCount,
    buzzThreshold: opts.buzzThreshold,
  });

  // 4. ハッシュタグ分析
  const hashtags = analyzeHashtags(analyzedPosts);

  // 5. 競合分析（有効時）
  let competitors;
  if (opts.enableCompetitors && competitorPostsMap && competitorPostsMap.size > 0) {
    const competitorConfig = loadCompetitorProfiles();
    competitors = analyzeCompetitors(
      analyzedPosts,
      competitorPostsMap,
      competitorConfig.competitors
    );
  }

  // 6. レポート構築
  const report = buildAnalysisReport(
    analyzedPosts,
    performance,
    hashtags,
    competitors
  );

  // 7. Markdownレポート生成
  const markdownReport = generateMarkdownReport(report);

  return {
    report,
    analyzedPosts,
    performance,
    hashtags,
    competitors,
    markdownReport,
  };
}

/**
 * 投稿をフィルタリング
 */
function filterPosts(posts: UnifiedPost[], options: AnalysisOptions): UnifiedPost[] {
  let filtered = posts;

  // 期間フィルタ
  if (options.period) {
    const startDate = new Date(options.period.start);
    const endDate = new Date(options.period.end);
    endDate.setHours(23, 59, 59, 999);

    filtered = filtered.filter((p) => {
      const publishedAt = new Date(p.metadata.publishedAt);
      return publishedAt >= startDate && publishedAt <= endDate;
    });
  }

  // プラットフォームフィルタ
  if (options.platforms && options.platforms.length > 0) {
    const platformSet = new Set(options.platforms);
    filtered = filtered.filter((p) => platformSet.has(p.platform));
  }

  return filtered;
}

// ============================================
// Quick Analysis Functions
// ============================================

/**
 * クイックセンチメント分析
 */
export function quickSentimentAnalysis(
  posts: UnifiedPost[],
  options?: SentimentAnalyzerOptions
): UnifiedPost[] {
  return analyzePostsBatch(posts, options);
}

/**
 * クイックパフォーマンス分析
 */
export function quickPerformanceAnalysis(posts: UnifiedPost[]) {
  return analyzePerformance(posts);
}

/**
 * クイックハッシュタグ分析
 */
export function quickHashtagAnalysis(posts: UnifiedPost[]) {
  return analyzeHashtags(posts);
}

// ============================================
// Utility
// ============================================

/**
 * 分析サマリーを簡易文字列で取得
 */
export function getAnalysisSummary(result: FullAnalysisResult): string {
  const r = result.report;
  return [
    `期間: ${r.period.start} 〜 ${r.period.end}`,
    `プラットフォーム: ${r.platforms.join(', ')}`,
    `総投稿数: ${r.summary.totalPosts}`,
    `総エンゲージメント: ${r.summary.totalEngagement.toLocaleString()}`,
    `平均ER: ${r.summary.avgEngagementRate.toFixed(2)}%`,
    `センチメント: P=${r.summary.sentimentBreakdown.positive} / N=${r.summary.sentimentBreakdown.neutral} / Neg=${r.summary.sentimentBreakdown.negative}`,
    `バズ投稿: ${result.performance.buzzPosts.length}件`,
    `ハッシュタグ: ${result.hashtags.totalUniqueHashtags}種類`,
  ].join('\n');
}
