/**
 * SNS Collector Tools
 *
 * SNSデータ収集パイプラインをproxy-mcpツールとして公開。
 * Minimal Output Principle: サマリー+refIdを返し、全データはメモリに保存。
 *
 * 提供ツール:
 * - sns.collect   - SNSデータ収集＆正規化
 * - sns.normalize - 生データの正規化
 * - sns.trends    - トレンドデータ取得
 * - sns.status    - 収集状態確認
 */

import { ToolResult } from '../types';
import {
  loadActorConfigs,
  filterByPriority,
  sortByPriority,
  collectAndNormalize,
  buildCollectionSummary,
  getSupportedPlatforms,
  normalizeRawData,
  normalizeTrendData,
  buildTrendSummary,
  RawPlatformData,
} from '../../sns';
import { Platform } from '../../types/unified-post';
import { randomUUID } from 'crypto';

/**
 * sns.collect - SNSデータ収集ツール
 *
 * 指定プラットフォームからデータを収集し、UnifiedPost形式に正規化。
 * Minimal Output Principle: サマリーを返し、詳細データはoutput/sns/に保存。
 */
export async function snsCollect(params: {
  platforms?: Platform[];
  keywords?: string[];
  priority?: 'P1' | 'P2' | 'P3' | 'all';
}): Promise<ToolResult> {
  try {
    const configs = loadActorConfigs();
    const priority = params.priority || 'all';

    // 収集対象プラットフォームを決定
    let targetPlatforms: Platform[];
    if (params.platforms?.length) {
      targetPlatforms = params.platforms;
    } else {
      targetPlatforms = filterByPriority(priority, configs);
    }

    targetPlatforms = sortByPriority(targetPlatforms, configs);

    return {
      success: true,
      data: {
        action: 'sns.collect',
        targetPlatforms,
        actorConfigs: targetPlatforms.map((p) => ({
          platform: p,
          actorId: configs[p]?.actorId || 'not_configured',
          priority: configs[p]?.priority || 'unknown',
        })),
        keywords: params.keywords || [],
        instructions: [
          'Apify MCPの call-actor ツールを使用して各プラットフォームのActorを実行してください。',
          '各Actorの実行結果（JSON配列）を取得し、sns.normalize で正規化してください。',
          '正規化結果は output/sns/normalized/ に保存してください。',
        ],
      },
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * sns.normalize - 生データの正規化ツール
 *
 * Apify Actor出力の生データをUnifiedPost形式に変換。
 */
export async function snsNormalize(params: {
  platform: Platform;
  rawData: unknown[];
  actorId?: string;
}): Promise<ToolResult> {
  try {
    const rawPlatformData: RawPlatformData = {
      platform: params.platform,
      actorId: params.actorId || '',
      rawItems: params.rawData,
      collectedAt: new Date().toISOString(),
      inputParams: {},
    };

    const result = normalizeRawData(rawPlatformData);

    return {
      success: true,
      data: {
        action: 'sns.normalize',
        platform: params.platform,
        stats: result.stats,
        samplePost: result.posts[0] ? {
          id: result.posts[0].id,
          platform: result.posts[0].platform,
          author: result.posts[0].author.username,
          textPreview: result.posts[0].content.text.slice(0, 100),
          engagement: result.posts[0].engagement,
        } : null,
        errors: result.errors.length > 0 ? result.errors.slice(0, 5) : [],
      },
      referenceId: `sns-norm-${params.platform}-${randomUUID().slice(0, 8)}`,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * sns.trends - トレンドデータ取得ツール
 *
 * What's Trending MCPの出力を正規化してスコアリング。
 */
export async function snsTrends(params?: {
  rawTrends?: unknown[];
  category?: string;
}): Promise<ToolResult> {
  try {
    if (params?.rawTrends?.length) {
      const topics = normalizeTrendData(params.rawTrends);
      const summary = buildTrendSummary(topics, topics.length);

      return {
        success: true,
        data: {
          action: 'sns.trends',
          topicCount: summary.topics.length,
          sources: summary.sources,
          topTopics: summary.topics.slice(0, 10).map((t) => ({
            title: t.title,
            score: t.trendScore,
            source: t.source,
            category: t.category,
          })),
          collectedAt: summary.collectedAt,
        },
        referenceId: `sns-trends-${randomUUID().slice(0, 8)}`,
      };
    }

    // トレンドデータが未提供の場合はWhat's Trending MCP使用を案内
    return {
      success: true,
      data: {
        action: 'sns.trends',
        instructions: [
          'What\'s Trending MCPのツールを使用してトレンドデータを取得してください。',
          '取得した生データを sns.trends の rawTrends パラメータに渡して正規化できます。',
        ],
      },
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * sns.status - 収集状態確認ツール
 *
 * 対応プラットフォーム、Actor設定、直近の収集状態を返す。
 */
export async function snsStatus(): Promise<ToolResult> {
  try {
    const configs = loadActorConfigs();
    const supportedPlatforms = getSupportedPlatforms();

    const platformStatus = supportedPlatforms.map((p) => ({
      platform: p,
      configured: !!configs[p],
      actorId: configs[p]?.actorId || 'not_configured',
      priority: configs[p]?.priority || 'unknown',
    }));

    return {
      success: true,
      data: {
        action: 'sns.status',
        totalPlatforms: supportedPlatforms.length,
        configuredPlatforms: platformStatus.filter((p) => p.configured).length,
        platforms: platformStatus,
        configPath: 'config/sns-collection/actors.json',
      },
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
