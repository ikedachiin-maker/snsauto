/**
 * TSIS Distribution Module - Pipeline Orchestrator (Phase 5)
 *
 * マルチチャネル配信パイプラインのオーケストレーション。
 * 記事→SNS投稿→動画台本→最適化→配信の全フローを統合。
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import {
  Platform,
  ArticleDraft,
  SNSRepurposedPost,
  VideoScript,
  VideoScriptPlatform,
  MultiChannelDistribution,
  DistributionSchedule,
  DistributionResult,
  DistributionMetrics,
  ChannelResult,
  DistributionOptions,
  DistributionStrategy,
  HookPattern,
  VideoCTAType,
  ValidationResult,
} from './types';

import {
  repurposeForPlatform,
  repurposeForAllPlatforms,
  loadDistributionConfig,
  loadPlatformConstraints,
  generateRepurposeSummary,
} from './sns-repurposer';

import {
  generateVideoScript,
  generateAllVideoScripts,
  selectHookPattern,
  generateScriptSummary,
  scriptToMarkdown,
} from './video-script-generator';

import {
  validateConstraints,
  optimizeForChannel,
  optimizeAllPosts,
  suggestImprovements,
  calculateContentScore,
  validateVideoScript,
  validateAllPosts,
  validateAllScripts,
  generateValidationSummary,
} from './channel-optimizer';

// ============================================
// Re-exports
// ============================================

export * from './types';
export {
  repurposeForPlatform,
  repurposeForAllPlatforms,
  loadDistributionConfig,
  loadPlatformConstraints,
  generateRepurposeSummary,
} from './sns-repurposer';

export {
  generateVideoScript,
  generateAllVideoScripts,
  selectHookPattern,
  generateScriptSummary,
  scriptToMarkdown,
} from './video-script-generator';

export {
  validateConstraints,
  optimizeForChannel,
  optimizeAllPosts,
  suggestImprovements,
  calculateContentScore,
  validateVideoScript,
  validateAllPosts,
  validateAllScripts,
  generateValidationSummary,
} from './channel-optimizer';

// ============================================
// Constants
// ============================================

const OUTPUT_DIR = path.resolve(process.cwd(), 'output/distribution');

// ============================================
// Pipeline Orchestration
// ============================================

/**
 * 配信パイプライン全体を実行
 */
export async function runDistributionPipeline(
  article: ArticleDraft,
  options?: DistributionOptions
): Promise<MultiChannelDistribution> {
  const config = loadDistributionConfig();

  // Phase 1: SNS投稿生成
  const snsPosts = phase1RepurposeSNS(
    article,
    options?.platforms || config.defaultPlatforms
  );

  // Phase 2: 動画台本生成
  const videoScripts = phase2GenerateVideoScripts(
    article,
    options?.videoFormats || config.defaultVideoFormats,
    {
      hookPattern: options?.hookPattern,
      ctaType: options?.ctaType,
    }
  );

  // Phase 3: チャネル最適化
  const { optimizedPosts, optimizedScripts } = phase3OptimizeChannels(
    snsPosts,
    videoScripts
  );

  // Phase 4: スケジュール設定
  const schedule = phase4Schedule(options?.scheduleStrategy);

  // 配信オブジェクトを生成
  const distribution: MultiChannelDistribution = {
    id: uuidv4(),
    articleId: article.id,
    snsPosts: optimizedPosts,
    videoScripts: optimizedScripts,
    schedule,
    status: 'optimized',
    createdAt: new Date().toISOString(),
  };

  // 結果を保存
  await saveDistribution(distribution);

  return distribution;
}

// ============================================
// Phase Functions
// ============================================

/**
 * Phase 1: SNS投稿生成
 */
export function phase1RepurposeSNS(
  article: ArticleDraft,
  platforms: Platform[]
): SNSRepurposedPost[] {
  return platforms.map(platform => repurposeForPlatform(article, platform));
}

/**
 * Phase 2: 動画台本生成
 */
export function phase2GenerateVideoScripts(
  article: ArticleDraft,
  formats: VideoScriptPlatform[],
  options?: {
    hookPattern?: HookPattern;
    ctaType?: VideoCTAType;
  }
): VideoScript[] {
  return formats.map(platform =>
    generateVideoScript(article, platform, options)
  );
}

/**
 * Phase 3: チャネル最適化
 */
export function phase3OptimizeChannels(
  posts: SNSRepurposedPost[],
  scripts: VideoScript[]
): {
  optimizedPosts: SNSRepurposedPost[];
  optimizedScripts: VideoScript[];
  postValidation: Map<string, ValidationResult>;
  scriptValidation: Map<string, ValidationResult>;
} {
  // 投稿を最適化
  const optimizedPosts = optimizeAllPosts(posts);

  // 検証
  const postValidation = validateAllPosts(optimizedPosts);
  const scriptValidation = validateAllScripts(scripts);

  return {
    optimizedPosts,
    optimizedScripts: scripts, // 動画台本は最適化不要
    postValidation,
    scriptValidation,
  };
}

/**
 * Phase 4: スケジュール設定
 */
export function phase4Schedule(
  strategy?: DistributionStrategy
): DistributionSchedule {
  const config = loadDistributionConfig();

  return {
    strategy: strategy || config.schedule.defaultStrategy,
    timezone: config.schedule.defaultTimezone,
    startDate: new Date().toISOString(),
    interval: strategy === 'staggered' ? config.schedule.staggeredInterval : undefined,
  };
}

// ============================================
// Distribution Execution
// ============================================

/**
 * 配信を実行（MCPを通じて）
 */
export async function executeDistribution(
  distribution: MultiChannelDistribution
): Promise<DistributionResult> {
  const results: ChannelResult[] = [];

  // SNS投稿を配信
  for (const post of distribution.snsPosts) {
    const result = await publishToChannel(post);
    results.push(result);
  }

  // メトリクスを計算
  const metrics = calculateDistributionMetrics(results, distribution);

  const distributionResult: DistributionResult = {
    distributionId: distribution.id,
    results,
    metrics,
    completedAt: new Date().toISOString(),
  };

  // 結果を保存
  await saveDistributionResult(distributionResult);

  return distributionResult;
}

/**
 * 単一チャネルへの配信
 */
async function publishToChannel(post: SNSRepurposedPost): Promise<ChannelResult> {
  // 実際の実装ではMCPを呼び出す
  // ここではスタブとして成功を返す
  return {
    channel: post.platform,
    success: true,
    postId: `mock_${uuidv4().slice(0, 8)}`,
    postUrl: `https://${post.platform}.com/post/${post.id}`,
    publishedAt: new Date().toISOString(),
  };
}

/**
 * 配信メトリクスを計算
 */
function calculateDistributionMetrics(
  results: ChannelResult[],
  distribution: MultiChannelDistribution
): DistributionMetrics {
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  // コンテンツスコア平均
  const scores = distribution.snsPosts.map(post => calculateContentScore(post));
  const contentScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    totalChannels: results.length,
    successCount,
    failureCount,
    contentScore: Math.round(contentScore * 10) / 10,
  };
}

// ============================================
// File Operations
// ============================================

/**
 * 配信オブジェクトを保存
 */
async function saveDistribution(
  distribution: MultiChannelDistribution
): Promise<string> {
  ensureOutputDir();

  const filename = `distribution_${distribution.id}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(distribution, null, 2), 'utf-8');

  // 動画台本をMarkdown形式でも保存
  for (const script of distribution.videoScripts) {
    const mdFilename = `script_${script.id}.md`;
    const mdFilepath = path.join(OUTPUT_DIR, mdFilename);
    fs.writeFileSync(mdFilepath, scriptToMarkdown(script), 'utf-8');
  }

  return filepath;
}

/**
 * 配信結果を保存
 */
async function saveDistributionResult(
  result: DistributionResult
): Promise<string> {
  ensureOutputDir();

  const filename = `result_${result.distributionId}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf-8');

  return filepath;
}

/**
 * 出力ディレクトリを確保
 */
function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

// ============================================
// Summary Generation
// ============================================

/**
 * 配信サマリーを生成
 */
export function generateDistributionSummary(
  distribution: MultiChannelDistribution
): {
  id: string;
  articleId: string;
  snsSummary: ReturnType<typeof generateRepurposeSummary>;
  videoSummary: ReturnType<typeof generateScriptSummary>;
  schedule: DistributionSchedule;
  status: string;
} {
  return {
    id: distribution.id,
    articleId: distribution.articleId,
    snsSummary: generateRepurposeSummary(distribution.snsPosts),
    videoSummary: generateScriptSummary(distribution.videoScripts),
    schedule: distribution.schedule,
    status: distribution.status,
  };
}

/**
 * 最小出力形式でサマリーを生成（Minimal Output Principle準拠）
 */
export function generateMinimalSummary(
  distribution: MultiChannelDistribution
): {
  distributionId: string;
  articleId: string;
  snsPostCount: number;
  videoScriptCount: number;
  platforms: string[];
  videoFormats: string[];
  status: string;
  referenceFile: string;
} {
  return {
    distributionId: distribution.id,
    articleId: distribution.articleId,
    snsPostCount: distribution.snsPosts.length,
    videoScriptCount: distribution.videoScripts.length,
    platforms: distribution.snsPosts.map(p => p.platform),
    videoFormats: distribution.videoScripts.map(s => s.platform),
    status: distribution.status,
    referenceFile: `output/distribution/distribution_${distribution.id}.json`,
  };
}

// ============================================
// Load Functions
// ============================================

/**
 * 保存された配信を読み込み
 */
export function loadDistribution(distributionId: string): MultiChannelDistribution | null {
  const filepath = path.join(OUTPUT_DIR, `distribution_${distributionId}.json`);

  if (!fs.existsSync(filepath)) {
    return null;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content) as MultiChannelDistribution;
}

/**
 * 保存された配信結果を読み込み
 */
export function loadDistributionResult(distributionId: string): DistributionResult | null {
  const filepath = path.join(OUTPUT_DIR, `result_${distributionId}.json`);

  if (!fs.existsSync(filepath)) {
    return null;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content) as DistributionResult;
}

/**
 * 全ての配信一覧を取得
 */
export function listDistributions(): string[] {
  ensureOutputDir();

  const files = fs.readdirSync(OUTPUT_DIR);
  return files
    .filter(f => f.startsWith('distribution_') && f.endsWith('.json'))
    .map(f => f.replace('distribution_', '').replace('.json', ''));
}
