/**
 * TSIS Analysis Module - Competitor Analyzer (Phase 3)
 *
 * 競合分析: プロフィールロード、メトリクス比較、ギャップ・機会検出。
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Platform,
  UnifiedPost,
  PlatformMetrics,
  CompetitorProfile,
  CompetitorComparison,
} from '../../types/unified-post';
import { CompetitorsConfig, CompetitorAnalysisResult } from './types';
import { calculatePlatformMetrics } from './performance';

// ============================================
// Constants
// ============================================

const COMPETITORS_CONFIG_PATH = path.resolve(
  process.cwd(),
  'config/sns-collection/competitors.json'
);

// ============================================
// Config Loading
// ============================================

/**
 * 競合設定ファイルをロード
 */
export function loadCompetitorProfiles(): CompetitorsConfig {
  try {
    if (!fs.existsSync(COMPETITORS_CONFIG_PATH)) {
      return {
        version: '1.0.0',
        maxPerPlatform: 20,
        competitors: [],
      };
    }

    const content = fs.readFileSync(COMPETITORS_CONFIG_PATH, 'utf-8');
    return JSON.parse(content) as CompetitorsConfig;
  } catch (error) {
    console.error('Failed to load competitors config:', error);
    return {
      version: '1.0.0',
      maxPerPlatform: 20,
      competitors: [],
    };
  }
}

/**
 * 競合設定を保存
 */
export function saveCompetitorProfiles(config: CompetitorsConfig): void {
  const dir = path.dirname(COMPETITORS_CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    COMPETITORS_CONFIG_PATH,
    JSON.stringify(config, null, 2),
    'utf-8'
  );
}

/**
 * 競合を追加
 */
export function addCompetitor(
  config: CompetitorsConfig,
  profile: CompetitorProfile
): CompetitorsConfig {
  // 既存チェック
  const existing = config.competitors.find((c) => c.name === profile.name);
  if (existing) {
    // 更新
    Object.assign(existing, profile);
  } else {
    config.competitors.push(profile);
  }
  return config;
}

/**
 * 競合を削除
 */
export function removeCompetitor(
  config: CompetitorsConfig,
  name: string
): CompetitorsConfig {
  config.competitors = config.competitors.filter((c) => c.name !== name);
  return config;
}

// ============================================
// Competitor Analysis
// ============================================

/**
 * 競合分析を実行
 * @param selfPosts 自社投稿データ
 * @param competitorPostsMap 競合名 -> 競合投稿データ のマップ
 * @param profiles 競合プロフィール一覧
 */
export function analyzeCompetitors(
  selfPosts: UnifiedPost[],
  competitorPostsMap: Map<string, UnifiedPost[]>,
  profiles: CompetitorProfile[]
): CompetitorAnalysisResult {
  if (selfPosts.length === 0 || profiles.length === 0) {
    return {
      comparisons: [],
      summaryGaps: [],
      summaryOpportunities: [],
    };
  }

  // 自社メトリクス計算
  const selfMetrics = calculatePlatformMetrics(selfPosts);

  // プラットフォーム別に比較結果を構築
  const comparisons: CompetitorComparison[] = [];
  const allGaps: string[] = [];
  const allOpportunities: string[] = [];

  // 各プラットフォームごとに比較
  const platforms = [...new Set(selfPosts.map((p) => p.platform))];

  for (const platform of platforms) {
    const selfPlatformMetrics = selfMetrics.find(
      (m) => m.platform === platform
    );
    if (!selfPlatformMetrics) continue;

    const competitorResults: Array<{
      profile: CompetitorProfile;
      metrics: PlatformMetrics;
    }> = [];

    for (const profile of profiles) {
      // 競合がこのプラットフォームを持っているか確認
      if (!profile.accounts[platform]) continue;

      const competitorPosts = competitorPostsMap.get(profile.name);
      if (!competitorPosts || competitorPosts.length === 0) continue;

      // 該当プラットフォームの投稿のみ
      const platformPosts = competitorPosts.filter(
        (p) => p.platform === platform
      );
      if (platformPosts.length === 0) continue;

      const competitorMetrics = calculatePlatformMetrics(platformPosts);
      const platformMetrics = competitorMetrics.find(
        (m) => m.platform === platform
      );
      if (platformMetrics) {
        competitorResults.push({
          profile,
          metrics: platformMetrics,
        });
      }
    }

    if (competitorResults.length === 0) continue;

    // ギャップと機会を検出
    const selfPostsForPlatform = selfPosts.filter(
      (p) => p.platform === platform
    );
    const competitorPostsForPlatform = competitorResults.flatMap((c) =>
      (competitorPostsMap.get(c.profile.name) || []).filter(
        (p) => p.platform === platform
      )
    );

    const gaps = findContentGaps(
      selfPostsForPlatform,
      competitorPostsForPlatform
    );
    const opportunities = findOpportunities(
      selfPlatformMetrics,
      competitorResults.map((c) => c.metrics)
    );

    allGaps.push(...gaps.map((g) => `[${platform}] ${g}`));
    allOpportunities.push(...opportunities.map((o) => `[${platform}] ${o}`));

    comparisons.push({
      self: selfPlatformMetrics,
      competitors: competitorResults,
      gaps,
      opportunities,
    });
  }

  return {
    comparisons,
    summaryGaps: [...new Set(allGaps)].slice(0, 10),
    summaryOpportunities: [...new Set(allOpportunities)].slice(0, 10),
  };
}

// ============================================
// Gap & Opportunity Detection
// ============================================

/**
 * コンテンツギャップを検出
 * 競合が使用しているが自社が使用していないハッシュタグ・トピック
 */
export function findContentGaps(
  selfPosts: UnifiedPost[],
  competitorPosts: UnifiedPost[]
): string[] {
  const gaps: string[] = [];

  // ハッシュタグギャップ
  const selfHashtags = new Set<string>();
  for (const post of selfPosts) {
    for (const tag of post.content.hashtags) {
      selfHashtags.add(tag.toLowerCase().replace(/^#/, ''));
    }
  }

  const competitorHashtags = new Map<string, number>();
  for (const post of competitorPosts) {
    for (const tag of post.content.hashtags) {
      const normalized = tag.toLowerCase().replace(/^#/, '');
      competitorHashtags.set(
        normalized,
        (competitorHashtags.get(normalized) || 0) + 1
      );
    }
  }

  // 競合で頻出だが自社未使用のハッシュタグ
  const sortedCompetitorTags = [...competitorHashtags.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  for (const [tag, count] of sortedCompetitorTags) {
    if (!selfHashtags.has(tag) && count >= 3) {
      gaps.push(`未使用の人気ハッシュタグ: #${tag} (競合${count}件使用)`);
    }
    if (gaps.length >= 5) break;
  }

  // 投稿タイプギャップ
  const selfTypes = new Set(selfPosts.map((p) => p.metadata.postType));
  const competitorTypes = new Map<string, number>();
  for (const post of competitorPosts) {
    const type = post.metadata.postType;
    competitorTypes.set(type, (competitorTypes.get(type) || 0) + 1);
  }

  for (const [type, count] of competitorTypes.entries()) {
    if (!selfTypes.has(type as any) && count >= 5) {
      gaps.push(`未活用の投稿タイプ: ${type} (競合${count}件)`);
    }
  }

  return gaps.slice(0, 10);
}

/**
 * 機会を検出
 * 自社が競合より優位な領域、または改善余地がある領域
 */
export function findOpportunities(
  selfMetrics: PlatformMetrics,
  competitorMetrics: PlatformMetrics[]
): string[] {
  const opportunities: string[] = [];

  if (competitorMetrics.length === 0) {
    return opportunities;
  }

  // 競合平均を計算
  const avgCompetitorEngagementRate =
    competitorMetrics.reduce((sum, m) => sum + m.avgEngagementRate, 0) /
    competitorMetrics.length;
  const avgCompetitorTotalPosts =
    competitorMetrics.reduce((sum, m) => sum + m.totalPosts, 0) /
    competitorMetrics.length;

  // エンゲージメント率比較
  if (selfMetrics.avgEngagementRate > avgCompetitorEngagementRate * 1.2) {
    opportunities.push(
      `エンゲージメント率が競合平均を20%以上上回る（${selfMetrics.avgEngagementRate.toFixed(2)}% vs ${avgCompetitorEngagementRate.toFixed(2)}%）`
    );
  } else if (selfMetrics.avgEngagementRate < avgCompetitorEngagementRate * 0.8) {
    opportunities.push(
      `エンゲージメント率改善の余地あり（現在${selfMetrics.avgEngagementRate.toFixed(2)}% / 競合平均${avgCompetitorEngagementRate.toFixed(2)}%）`
    );
  }

  // 投稿頻度比較
  if (selfMetrics.totalPosts < avgCompetitorTotalPosts * 0.5) {
    opportunities.push(
      `投稿頻度が競合の半分以下（${selfMetrics.totalPosts}件 vs 競合平均${avgCompetitorTotalPosts.toFixed(0)}件）`
    );
  }

  // TOP投稿タイプ比較
  const competitorTopTypes = competitorMetrics.map((m) => m.topPostType);
  const typeCount = new Map<string, number>();
  for (const type of competitorTopTypes) {
    typeCount.set(type, (typeCount.get(type) || 0) + 1);
  }

  const mostCommonType = [...typeCount.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (mostCommonType && mostCommonType[0] !== selfMetrics.topPostType) {
    opportunities.push(
      `競合は${mostCommonType[0]}投稿が主流（自社は${selfMetrics.topPostType}）`
    );
  }

  return opportunities.slice(0, 5);
}

// ============================================
// Competitor Performance Summary
// ============================================

/**
 * 競合パフォーマンスサマリーを生成
 */
export function generateCompetitorSummary(
  result: CompetitorAnalysisResult
): string {
  const lines: string[] = [];

  lines.push('## 競合分析サマリー');
  lines.push('');

  if (result.comparisons.length === 0) {
    lines.push('競合データがありません。');
    return lines.join('\n');
  }

  // 全体比較
  lines.push('### プラットフォーム別比較');
  lines.push('');

  for (const comparison of result.comparisons) {
    lines.push(`#### ${comparison.self.platform}`);
    lines.push('');
    lines.push(
      `| アカウント | 投稿数 | 総エンゲージメント | 平均ER |`
    );
    lines.push(`|------------|--------|-------------------|--------|`);
    lines.push(
      `| 自社 | ${comparison.self.totalPosts} | ${comparison.self.totalEngagement.toLocaleString()} | ${comparison.self.avgEngagementRate.toFixed(2)}% |`
    );

    for (const comp of comparison.competitors) {
      lines.push(
        `| ${comp.profile.name} | ${comp.metrics.totalPosts} | ${comp.metrics.totalEngagement.toLocaleString()} | ${comp.metrics.avgEngagementRate.toFixed(2)}% |`
      );
    }
    lines.push('');
  }

  // ギャップ
  if (result.summaryGaps.length > 0) {
    lines.push('### コンテンツギャップ');
    lines.push('');
    for (const gap of result.summaryGaps) {
      lines.push(`- ${gap}`);
    }
    lines.push('');
  }

  // 機会
  if (result.summaryOpportunities.length > 0) {
    lines.push('### 機会');
    lines.push('');
    for (const opp of result.summaryOpportunities) {
      lines.push(`- ${opp}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================
// Exports
// ============================================

export {
  COMPETITORS_CONFIG_PATH,
};
