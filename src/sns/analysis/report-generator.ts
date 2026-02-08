/**
 * TSIS Analysis Module - Report Generator (Phase 3)
 *
 * レポート生成: AnalysisReport構築、Markdownレポート生成、改善提案。
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Platform,
  UnifiedPost,
  AnalysisReport,
  TrendingHashtag,
  TimeSlot,
  PlatformMetrics,
  SentimentLabel,
} from '../../types/unified-post';
import {
  PerformanceAnalysisResult,
  HashtagAnalysisResult,
  CompetitorAnalysisResult,
} from './types';
import { extractBestTimeSlots } from './performance';

// ============================================
// Report Building
// ============================================

/**
 * 分析レポートを構築
 */
export function buildAnalysisReport(
  posts: UnifiedPost[],
  performance: PerformanceAnalysisResult,
  hashtags: HashtagAnalysisResult,
  competitors?: CompetitorAnalysisResult
): AnalysisReport {
  // 期間を算出
  const period = calculatePeriod(posts);

  // プラットフォーム一覧
  const platforms = [...new Set(posts.map((p) => p.platform))];

  // サマリー計算
  const summary = calculateSummary(posts);

  // 改善提案を生成
  const recommendations = generateRecommendations(
    performance,
    hashtags,
    competitors
  );

  // ベスト投稿時間帯
  const bestTimeSlots = extractBestTimeSlots(performance.timeSlots, 10);

  return {
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    period,
    platforms,
    summary,
    topPosts: performance.topPosts.slice(0, 10),
    trendingHashtags: hashtags.hashtags.slice(0, 20),
    bestTimeSlots,
    platformComparison: performance.platformMetrics,
    recommendations,
  };
}

/**
 * 分析期間を計算
 */
function calculatePeriod(posts: UnifiedPost[]): { start: string; end: string } {
  if (posts.length === 0) {
    const now = new Date().toISOString().split('T')[0];
    return { start: now, end: now };
  }

  const dates = posts.map((p) => new Date(p.metadata.publishedAt).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  return {
    start: minDate.toISOString().split('T')[0],
    end: maxDate.toISOString().split('T')[0],
  };
}

/**
 * サマリーを計算
 */
function calculateSummary(posts: UnifiedPost[]): {
  totalPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  sentimentBreakdown: Record<SentimentLabel, number>;
} {
  const totalPosts = posts.length;

  const totalEngagement = posts.reduce(
    (sum, p) =>
      sum +
      p.engagement.likes +
      p.engagement.comments +
      p.engagement.shares +
      p.engagement.saves,
    0
  );

  const avgEngagementRate =
    posts.length > 0
      ? posts.reduce((sum, p) => sum + p.engagement.engagementRate, 0) /
        posts.length
      : 0;

  // センチメント内訳
  const sentimentBreakdown: Record<SentimentLabel, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  for (const post of posts) {
    if (post.analysis?.sentiment) {
      sentimentBreakdown[post.analysis.sentiment.label] += 1;
    } else {
      sentimentBreakdown.neutral += 1;
    }
  }

  return {
    totalPosts,
    totalEngagement,
    avgEngagementRate: parseFloat(avgEngagementRate.toFixed(4)),
    sentimentBreakdown,
  };
}

// ============================================
// Recommendations
// ============================================

/**
 * 改善提案を生成
 */
export function generateRecommendations(
  performance: PerformanceAnalysisResult,
  hashtags: HashtagAnalysisResult,
  competitors?: CompetitorAnalysisResult
): string[] {
  const recommendations: string[] = [];

  // パフォーマンスベースの提案
  recommendations.push(...generatePerformanceRecommendations(performance));

  // ハッシュタグベースの提案
  recommendations.push(...generateHashtagRecommendations(hashtags));

  // 競合ベースの提案
  if (competitors) {
    recommendations.push(...generateCompetitorRecommendations(competitors));
  }

  return recommendations.slice(0, 10);
}

/**
 * パフォーマンスベースの提案
 */
function generatePerformanceRecommendations(
  performance: PerformanceAnalysisResult
): string[] {
  const recommendations: string[] = [];

  // バズ投稿の分析
  if (performance.buzzPosts.length > 0) {
    const buzzTypes = performance.buzzPosts.map(
      (p) => p.metadata.postType
    );
    const mostCommonBuzzType = findMostCommon(buzzTypes);
    recommendations.push(
      `バズ投稿は${mostCommonBuzzType}タイプが多い傾向。このタイプの投稿を増やすことを検討`
    );
  }

  // コンテンツタイプ比較
  if (performance.contentTypeComparison.length > 1) {
    const best = performance.contentTypeComparison[0];
    recommendations.push(
      `最もエンゲージメント率が高いのは${best.postType}タイプ（${best.avgEngagementRate.toFixed(2)}%）`
    );
  }

  // 最適投稿時間帯
  const bestSlots = extractBestTimeSlots(performance.timeSlots, 3);
  if (bestSlots.length > 0) {
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const slotDescriptions = bestSlots.map(
      (s) => `${dayNames[s.dayOfWeek]}曜${s.hour}時`
    );
    recommendations.push(
      `最適投稿時間帯: ${slotDescriptions.join(', ')}`
    );
  }

  return recommendations;
}

/**
 * ハッシュタグベースの提案
 */
function generateHashtagRecommendations(
  hashtags: HashtagAnalysisResult
): string[] {
  const recommendations: string[] = [];

  // 急上昇ハッシュタグ
  const risingTags = hashtags.hashtags.filter(
    (h) => h.trendDirection === 'rising'
  );
  if (risingTags.length > 0) {
    const topRising = risingTags.slice(0, 3).map((h) => `#${h.tag}`);
    recommendations.push(
      `急上昇ハッシュタグを活用: ${topRising.join(', ')}`
    );
  }

  // クロスプラットフォームハッシュタグ
  if (hashtags.crossPlatformHashtags.length > 0) {
    const topCross = hashtags.crossPlatformHashtags
      .slice(0, 3)
      .map((h) => `#${h.tag}`);
    recommendations.push(
      `複数プラットフォームで効果的なハッシュタグ: ${topCross.join(', ')}`
    );
  }

  return recommendations;
}

/**
 * 競合ベースの提案
 */
function generateCompetitorRecommendations(
  competitors: CompetitorAnalysisResult
): string[] {
  const recommendations: string[] = [];

  // ギャップから提案
  for (const gap of competitors.summaryGaps.slice(0, 2)) {
    recommendations.push(gap);
  }

  // 機会から提案
  for (const opp of competitors.summaryOpportunities.slice(0, 2)) {
    recommendations.push(opp);
  }

  return recommendations;
}

/**
 * 最頻出要素を取得
 */
function findMostCommon<T>(items: T[]): T | undefined {
  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  let maxItem: T | undefined;
  let maxCount = 0;
  for (const [item, count] of counts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      maxItem = item;
    }
  }
  return maxItem;
}

// ============================================
// Markdown Report Generation
// ============================================

/**
 * Markdownレポートを生成
 */
export function generateMarkdownReport(report: AnalysisReport): string {
  const lines: string[] = [];

  // ヘッダー
  lines.push('# SNS Analysis Report');
  lines.push('');
  lines.push(`生成日時: ${report.generatedAt}`);
  lines.push('');

  // サマリー
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **分析期間**: ${report.period.start} 〜 ${report.period.end}`);
  lines.push(`- **対象プラットフォーム**: ${report.platforms.join(', ')}`);
  lines.push(`- **総投稿数**: ${report.summary.totalPosts.toLocaleString()}件`);
  lines.push(`- **総エンゲージメント**: ${report.summary.totalEngagement.toLocaleString()}`);
  lines.push(`- **平均エンゲージメント率**: ${report.summary.avgEngagementRate.toFixed(2)}%`);
  lines.push('');

  // センチメント概要
  lines.push('## Sentiment Overview');
  lines.push('');
  lines.push('| Sentiment | 件数 | 割合 |');
  lines.push('|-----------|------|------|');
  const total = report.summary.totalPosts || 1;
  for (const [label, count] of Object.entries(report.summary.sentimentBreakdown)) {
    const percent = ((count / total) * 100).toFixed(1);
    lines.push(`| ${label} | ${count} | ${percent}% |`);
  }
  lines.push('');

  // TOP投稿
  lines.push('## Top Posts');
  lines.push('');
  lines.push('| # | Platform | Author | Engagement | Type | Link |');
  lines.push('|---|----------|--------|------------|------|------|');
  report.topPosts.slice(0, 10).forEach((post, i) => {
    const engagement =
      post.engagement.likes +
      post.engagement.comments +
      post.engagement.shares +
      post.engagement.saves;
    const shortLink = post.metadata.permalink.length > 40
      ? post.metadata.permalink.substring(0, 40) + '...'
      : post.metadata.permalink;
    lines.push(
      `| ${i + 1} | ${post.platform} | @${post.author.username} | ${engagement.toLocaleString()} | ${post.metadata.postType} | [Link](${post.metadata.permalink}) |`
    );
  });
  lines.push('');

  // トレンディングハッシュタグ
  lines.push('## Trending Hashtags');
  lines.push('');
  lines.push('| # | Hashtag | Platforms | Posts | Avg Engagement | Trend |');
  lines.push('|---|---------|-----------|-------|----------------|-------|');
  report.trendingHashtags.slice(0, 20).forEach((tag, i) => {
    const trendIcon =
      tag.trendDirection === 'rising'
        ? '↑'
        : tag.trendDirection === 'declining'
        ? '↓'
        : '→';
    lines.push(
      `| ${i + 1} | #${tag.tag} | ${tag.platforms.join(', ')} | ${tag.postCount} | ${tag.avgEngagement.toLocaleString()} | ${trendIcon} |`
    );
  });
  lines.push('');

  // 最適投稿時間帯
  lines.push('## Best Posting Times');
  lines.push('');
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  lines.push('| 曜日 | 時間 | 平均Engagement | 投稿数 |');
  lines.push('|------|------|----------------|--------|');
  report.bestTimeSlots.slice(0, 10).forEach((slot) => {
    lines.push(
      `| ${dayNames[slot.dayOfWeek]} | ${slot.hour}:00 | ${slot.avgEngagement.toLocaleString()} | ${slot.postCount} |`
    );
  });
  lines.push('');

  // プラットフォーム比較
  lines.push('## Platform Comparison');
  lines.push('');
  lines.push('| Platform | Posts | Total Engagement | Avg ER | Top Type |');
  lines.push('|----------|-------|------------------|--------|----------|');
  for (const metrics of report.platformComparison) {
    lines.push(
      `| ${metrics.platform} | ${metrics.totalPosts} | ${metrics.totalEngagement.toLocaleString()} | ${metrics.avgEngagementRate.toFixed(2)}% | ${metrics.topPostType} |`
    );
  }
  lines.push('');

  // 改善提案
  lines.push('## Recommendations');
  lines.push('');
  report.recommendations.forEach((rec, i) => {
    lines.push(`${i + 1}. ${rec}`);
  });
  lines.push('');

  // フッター
  lines.push('---');
  lines.push('');
  lines.push('*Generated by TSIS (TAISUN SNS Intelligence System)*');

  return lines.join('\n');
}

// ============================================
// Exports
// ============================================

export {
  calculatePeriod,
  calculateSummary,
  generatePerformanceRecommendations,
  generateHashtagRecommendations,
  generateCompetitorRecommendations,
};
