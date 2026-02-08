/**
 * Distribution Tools (Phase 5)
 *
 * マルチチャネル配信パイプラインをproxy-mcpツールとして公開。
 * Minimal Output Principle: サマリー+refIdを返し、全データはファイルに保存。
 *
 * 提供ツール:
 * - distribution.repurpose  - 記事→SNS投稿+動画台本変換
 * - distribution.optimize   - チャネル最適化
 * - distribution.schedule   - 配信スケジュール設定
 * - distribution.publish    - MCP経由で配信実行
 */

import { ToolResult } from '../types';
import {
  runDistributionPipeline,
  repurposeForAllPlatforms,
  generateAllVideoScripts,
  optimizeAllPosts,
  validateAllPosts,
  validateAllScripts,
  generateValidationSummary,
  generateMinimalSummary,
  loadDistribution,
  executeDistribution,
  phase4Schedule,
  ArticleDraft,
  Platform,
  VideoScriptPlatform,
  HookPattern,
  VideoCTAType,
  DistributionStrategy,
  SNSRepurposedPost,
  VideoScript,
  MultiChannelDistribution,
} from '../../distribution';
import { randomUUID } from 'crypto';

/**
 * distribution.repurpose - 記事変換ツール
 *
 * 記事からSNS投稿テキストとショート動画台本を生成。
 */
export async function distributionRepurpose(params: {
  article: ArticleDraft;
  platforms?: Platform[];
  videoFormats?: VideoScriptPlatform[];
  hookPattern?: HookPattern;
  ctaType?: VideoCTAType;
  scheduleStrategy?: DistributionStrategy;
  autoOptimize?: boolean;
}): Promise<ToolResult> {
  try {
    if (!params.article) {
      return {
        success: false,
        error: 'article パラメータが必要です。content.write で生成した記事を渡してください。',
      };
    }

    // パイプライン実行
    const distribution = await runDistributionPipeline(params.article, {
      platforms: params.platforms,
      videoFormats: params.videoFormats,
      hookPattern: params.hookPattern,
      ctaType: params.ctaType,
      scheduleStrategy: params.scheduleStrategy,
    });

    const refId = `distribution-${randomUUID().slice(0, 8)}`;

    // Minimal Output形式でサマリー生成
    const summary = generateMinimalSummary(distribution);

    return {
      success: true,
      data: {
        action: 'distribution.repurpose',
        distributionId: distribution.id,
        articleId: distribution.articleId,
        snsPosts: {
          count: distribution.snsPosts.length,
          platforms: distribution.snsPosts.map(p => p.platform),
          preview: distribution.snsPosts.slice(0, 2).map(p => ({
            platform: p.platform,
            textPreview: p.content.text.slice(0, 100) + '...',
            hashtagCount: p.content.hashtags.length,
          })),
        },
        videoScripts: {
          count: distribution.videoScripts.length,
          formats: distribution.videoScripts.map(s => s.platform),
          preview: distribution.videoScripts.map(s => ({
            platform: s.platform,
            title: s.title,
            hookPattern: s.hook.pattern,
            duration: s.duration,
          })),
        },
        schedule: distribution.schedule,
        status: distribution.status,
        savePath: summary.referenceFile,
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
 * distribution.optimize - チャネル最適化ツール
 *
 * 生成されたSNS投稿と動画台本を検証・最適化。
 */
export async function distributionOptimize(params: {
  distributionId?: string;
  snsPosts?: SNSRepurposedPost[];
  videoScripts?: VideoScript[];
  autoFix?: boolean;
}): Promise<ToolResult> {
  try {
    let posts: SNSRepurposedPost[];
    let scripts: VideoScript[];

    // distributionIdが渡された場合は読み込み
    if (params.distributionId) {
      const distribution = loadDistribution(params.distributionId);
      if (!distribution) {
        return {
          success: false,
          error: `Distribution ID ${params.distributionId} が見つかりません。`,
        };
      }
      posts = distribution.snsPosts;
      scripts = distribution.videoScripts;
    } else if (params.snsPosts || params.videoScripts) {
      posts = params.snsPosts || [];
      scripts = params.videoScripts || [];
    } else {
      return {
        success: false,
        error: 'distributionId または snsPosts/videoScripts が必要です。',
      };
    }

    // 自動修正
    const optimizedPosts = params.autoFix ? optimizeAllPosts(posts) : posts;

    // 検証
    const postValidation = validateAllPosts(optimizedPosts);
    const scriptValidation = validateAllScripts(scripts);

    // サマリー生成
    const postSummary = generateValidationSummary(postValidation);
    const scriptSummary = generateValidationSummary(scriptValidation);

    const refId = `distribution-optimize-${randomUUID().slice(0, 8)}`;

    return {
      success: true,
      data: {
        action: 'distribution.optimize',
        snsPosts: {
          total: postSummary.total,
          valid: postSummary.valid,
          invalid: postSummary.invalid,
          averageScore: postSummary.averageScore,
          commonErrors: postSummary.commonErrors.slice(0, 3),
          commonWarnings: postSummary.commonWarnings.slice(0, 3),
        },
        videoScripts: {
          total: scriptSummary.total,
          valid: scriptSummary.valid,
          invalid: scriptSummary.invalid,
          averageScore: scriptSummary.averageScore,
          commonErrors: scriptSummary.commonErrors.slice(0, 3),
          commonWarnings: scriptSummary.commonWarnings.slice(0, 3),
        },
        autoFixed: params.autoFix || false,
        overallStatus: postSummary.invalid === 0 && scriptSummary.invalid === 0
          ? 'all_valid'
          : 'has_issues',
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
 * distribution.schedule - 配信スケジュール設定ツール
 *
 * 配信戦略とスケジュールを設定。
 */
export async function distributionSchedule(params: {
  distributionId: string;
  strategy?: DistributionStrategy;
  startDate?: string;
  interval?: number;
  timezone?: string;
}): Promise<ToolResult> {
  try {
    if (!params.distributionId) {
      return {
        success: false,
        error: 'distributionId パラメータが必要です。',
      };
    }

    const distribution = loadDistribution(params.distributionId);
    if (!distribution) {
      return {
        success: false,
        error: `Distribution ID ${params.distributionId} が見つかりません。`,
      };
    }

    // スケジュールを生成
    const schedule = phase4Schedule(params.strategy);

    // パラメータで上書き
    if (params.startDate) {
      schedule.startDate = params.startDate;
    }
    if (params.interval) {
      schedule.interval = params.interval;
    }
    if (params.timezone) {
      schedule.timezone = params.timezone;
    }

    const refId = `distribution-schedule-${randomUUID().slice(0, 8)}`;

    // 配信予定を計算
    const scheduledTimes = calculateScheduledTimes(
      distribution.snsPosts.length,
      schedule.startDate,
      schedule.interval || 60
    );

    return {
      success: true,
      data: {
        action: 'distribution.schedule',
        distributionId: params.distributionId,
        schedule: {
          strategy: schedule.strategy,
          timezone: schedule.timezone,
          startDate: schedule.startDate,
          interval: schedule.interval,
        },
        scheduledPosts: distribution.snsPosts.map((post, i) => ({
          platform: post.platform,
          scheduledAt: scheduledTimes[i],
        })),
        totalChannels: distribution.snsPosts.length + distribution.videoScripts.length,
        instructions: schedule.strategy === 'immediate'
          ? ['distribution.publish を実行して即時配信します。']
          : [
              `${schedule.strategy} 戦略で配信をスケジュールしました。`,
              '配信開始: ' + schedule.startDate,
              schedule.interval ? `間隔: ${schedule.interval}分` : '',
            ].filter(Boolean),
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
 * distribution.publish - 配信実行ツール
 *
 * MCP経由で各プラットフォームへ配信。
 */
export async function distributionPublish(params: {
  distributionId: string;
  dryRun?: boolean;
  platforms?: Platform[];
}): Promise<ToolResult> {
  try {
    if (!params.distributionId) {
      return {
        success: false,
        error: 'distributionId パラメータが必要です。',
      };
    }

    const distribution = loadDistribution(params.distributionId);
    if (!distribution) {
      return {
        success: false,
        error: `Distribution ID ${params.distributionId} が見つかりません。`,
      };
    }

    const refId = `distribution-publish-${randomUUID().slice(0, 8)}`;

    if (params.dryRun) {
      // ドライラン: 実際には配信しない
      return {
        success: true,
        data: {
          action: 'distribution.publish',
          mode: 'dry_run',
          distributionId: params.distributionId,
          wouldPublish: {
            snsPosts: distribution.snsPosts.map(p => ({
              platform: p.platform,
              textLength: p.content.text.length,
              hashtagCount: p.content.hashtags.length,
            })),
            videoScripts: distribution.videoScripts.map(s => ({
              platform: s.platform,
              title: s.title,
              duration: s.duration,
            })),
          },
          instructions: [
            'ドライランモードです。実際の配信は行われていません。',
            'dryRun: false で実行すると配信が開始されます。',
          ],
        },
        referenceId: refId,
      };
    }

    // 実際の配信を実行
    const result = await executeDistribution(distribution);

    return {
      success: true,
      data: {
        action: 'distribution.publish',
        mode: 'live',
        distributionId: params.distributionId,
        results: {
          total: result.metrics.totalChannels,
          success: result.metrics.successCount,
          failed: result.metrics.failureCount,
          contentScore: result.metrics.contentScore,
        },
        channelResults: result.results.map(r => ({
          channel: r.channel,
          success: r.success,
          postUrl: r.postUrl,
          error: r.error,
        })),
        completedAt: result.completedAt,
        resultFile: `output/distribution/result_${params.distributionId}.json`,
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

// ============================================
// Helper Functions
// ============================================

/**
 * スケジュール時刻を計算
 */
function calculateScheduledTimes(
  count: number,
  startDate: string,
  intervalMinutes: number
): string[] {
  const times: string[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const scheduled = new Date(start.getTime() + i * intervalMinutes * 60 * 1000);
    times.push(scheduled.toISOString());
  }

  return times;
}
