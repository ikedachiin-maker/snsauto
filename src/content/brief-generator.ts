/**
 * TSIS Content Generation Module - Brief Generator (Phase 4)
 *
 * ブリーフ生成: トレンドトピックやキーワードから記事企画を作成。
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import {
  ContentBrief,
  BriefOutline,
  Reference,
  SNSInsight,
  SEORequirements,
  HeadingRequirement,
  BriefGenerationOptions,
  ContentConfig,
  TrendTopic,
} from './types';
import { Platform, AnalysisReport, UnifiedPost } from '../types/unified-post';
import { FullAnalysisResult } from '../sns/analysis';

// ============================================
// Constants
// ============================================

const CONFIG_PATH = path.resolve(
  process.cwd(),
  'config/content-generation/content-config.json'
);

// デフォルトSEO要件
const DEFAULT_SEO_REQUIREMENTS: SEORequirements = {
  minWordCount: 3000,
  maxWordCount: 8000,
  keywordDensity: { min: 0.5, max: 2.5 },
  headingRequirements: [
    { level: 1, min: 1, max: 1 },
    { level: 2, min: 3 },
    { level: 3, min: 2 },
  ],
  internalLinks: 2,
  externalLinks: 3,
};

// ============================================
// Config Loading
// ============================================

/**
 * コンテンツ設定をロード
 */
export function loadContentConfig(): ContentConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return getDefaultConfig();
    }
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(content) as ContentConfig;
  } catch (error) {
    console.error('Failed to load content config:', error);
    return getDefaultConfig();
  }
}

function getDefaultConfig(): ContentConfig {
  return {
    version: '1.0.0',
    brief: {
      minOutlines: 5,
      maxOutlines: 12,
      minReferences: 3,
      snsInsightMin: 2,
    },
    article: {
      wordCountTarget: 5000,
      wordCountMin: 3000,
      wordCountMax: 8000,
      hookStrategies: ['problem-statement', 'statistic', 'story', 'question'],
      ctaTypes: ['newsletter', 'product', 'consultation', 'download'],
    },
    seo: {
      scoreThreshold: 80,
      keywordDensity: { min: 0.5, max: 2.5 },
      requiredHeadings: ['H1', 'H2', 'H2', 'H2'],
      minInternalLinks: 2,
      minExternalLinks: 3,
      maxMetaTitleLength: 60,
      maxMetaDescriptionLength: 160,
    },
    publish: {
      defaultStatus: 'draft',
      autoSchedule: false,
    },
  };
}

// ============================================
// Brief Generation
// ============================================

/**
 * トレンドトピックからブリーフを生成
 */
export function generateBriefFromTrend(
  trendTopic: TrendTopic,
  options?: BriefGenerationOptions
): ContentBrief {
  const config = loadContentConfig();

  // タイトルとキーワードを決定
  const title = generateTitle(trendTopic.title);
  const targetKeyword = extractMainKeyword(trendTopic.title);

  // サブキーワードを生成
  const secondaryKeywords = options?.suggestedKeywords ||
    generateSecondaryKeywords(trendTopic);

  // SNSインサイトを抽出
  const snsInsights = options?.analysisResult
    ? extractSNSInsights(options.analysisResult)
    : [];

  // 参考URLを生成
  const references = options?.suggestedReferences?.map(url => ({
    url,
    title: '',
    summary: '',
    relevanceScore: 0.5,
  })) || [];

  // 見出し構成を生成
  const outline = buildOutline(title, targetKeyword, config.brief);

  // 差別化ポイントを生成
  const differentiators = options?.suggestedDifferentiators ||
    suggestDifferentiators(trendTopic, snsInsights);

  // SEO要件を設定
  const seoRequirements = buildSEORequirements(config);

  return {
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    title,
    targetKeyword,
    secondaryKeywords,
    outline,
    references,
    snsInsights,
    differentiators,
    seoRequirements,
  };
}

/**
 * キーワードからブリーフを生成
 */
export function generateBriefFromKeyword(
  keyword: string,
  options?: BriefGenerationOptions
): ContentBrief {
  const config = loadContentConfig();

  // タイトルを生成
  const title = generateTitleFromKeyword(keyword);

  // サブキーワードを生成
  const secondaryKeywords = options?.suggestedKeywords ||
    generateSecondaryKeywordsFromMain(keyword);

  // SNSインサイトを抽出
  const snsInsights = options?.analysisResult
    ? extractSNSInsights(options.analysisResult)
    : [];

  // 見出し構成を生成
  const outline = buildOutline(title, keyword, config.brief);

  // 差別化ポイントを生成
  const differentiators = options?.suggestedDifferentiators ||
    suggestDifferentiatorsFromKeyword(keyword, snsInsights);

  // SEO要件を設定
  const seoRequirements = buildSEORequirements(config);

  return {
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    title,
    targetKeyword: keyword,
    secondaryKeywords,
    outline,
    references: [],
    snsInsights,
    differentiators,
    seoRequirements,
  };
}

// ============================================
// Title Generation
// ============================================

/**
 * トレンドトピックからタイトルを生成
 */
function generateTitle(topicTitle: string): string {
  // タイトルテンプレート
  const templates = [
    `【2026年最新】${topicTitle}完全ガイド`,
    `${topicTitle}とは？初心者向け徹底解説`,
    `プロが教える${topicTitle}の始め方`,
    `${topicTitle}で成功する7つの秘訣`,
    `今すぐ使える！${topicTitle}実践テクニック`,
  ];

  // ランダムに選択（実際はAI生成に置き換え可能）
  return templates[0];
}

/**
 * キーワードからタイトルを生成
 */
function generateTitleFromKeyword(keyword: string): string {
  return `【完全版】${keyword}の始め方・活用法を徹底解説`;
}

// ============================================
// Keyword Extraction
// ============================================

/**
 * メインキーワードを抽出
 */
function extractMainKeyword(topicTitle: string): string {
  // 簡易実装：最初の名詞句をキーワードとする
  // 実際はMeCab等の形態素解析や外部API活用
  return topicTitle
    .replace(/【.*?】/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')[0] || topicTitle;
}

/**
 * トレンドトピックからサブキーワードを生成
 */
function generateSecondaryKeywords(trendTopic: TrendTopic): string[] {
  const baseKeyword = extractMainKeyword(trendTopic.title);

  // 一般的な関連キーワードパターン
  return [
    `${baseKeyword} やり方`,
    `${baseKeyword} 初心者`,
    `${baseKeyword} おすすめ`,
    `${baseKeyword} 比較`,
    `${baseKeyword} メリット`,
  ];
}

/**
 * メインキーワードからサブキーワードを生成
 */
function generateSecondaryKeywordsFromMain(keyword: string): string[] {
  return [
    `${keyword} 始め方`,
    `${keyword} コツ`,
    `${keyword} 注意点`,
    `${keyword} 選び方`,
    `${keyword} 2026`,
  ];
}

// ============================================
// Outline Building
// ============================================

/**
 * 見出し構成を生成
 */
export function buildOutline(
  title: string,
  keyword: string,
  config: { minOutlines: number; maxOutlines: number }
): BriefOutline[] {
  const outlines: BriefOutline[] = [];

  // H1: タイトル
  outlines.push({
    heading: title,
    level: 1,
    keyPoints: [`${keyword}の基本概念`, '読者が得られるメリット'],
    suggestedWordCount: 200,
  });

  // H2: 導入
  outlines.push({
    heading: `${keyword}とは？基本を理解しよう`,
    level: 2,
    keyPoints: ['定義の明確化', '歴史・背景', '重要性の説明'],
    suggestedWordCount: 500,
  });

  // H2: メリット・特徴
  outlines.push({
    heading: `${keyword}の5つのメリット`,
    level: 2,
    keyPoints: ['メリット1〜5のリスト', '具体例・数字', '他との比較'],
    suggestedWordCount: 800,
  });

  // H2: 始め方
  outlines.push({
    heading: `${keyword}の始め方【ステップバイステップ】`,
    level: 2,
    keyPoints: ['準備するもの', '具体的な手順', '初心者向けのコツ'],
    suggestedWordCount: 1000,
  });

  // H2: 活用法・応用
  outlines.push({
    heading: `${keyword}を最大限活用する方法`,
    level: 2,
    keyPoints: ['上級テクニック', '事例紹介', '効果測定方法'],
    suggestedWordCount: 800,
  });

  // H2: 注意点
  outlines.push({
    heading: `${keyword}の注意点・よくある失敗`,
    level: 2,
    keyPoints: ['よくある間違い', '回避方法', 'トラブル対処'],
    suggestedWordCount: 600,
  });

  // H2: まとめ
  outlines.push({
    heading: 'まとめ：今日から始めよう',
    level: 2,
    keyPoints: ['要点の振り返り', '次のアクション', 'CTA'],
    suggestedWordCount: 300,
  });

  return outlines;
}

// ============================================
// SNS Insights Extraction
// ============================================

/**
 * 分析結果からSNSインサイトを抽出
 */
export function extractSNSInsights(
  analysisResult: FullAnalysisResult
): SNSInsight[] {
  const insights: SNSInsight[] = [];

  // バズ投稿からインサイト抽出
  if (analysisResult.performance.buzzPosts.length > 0) {
    for (const post of analysisResult.performance.buzzPosts.slice(0, 3)) {
      insights.push({
        platform: post.platform,
        insight: `高エンゲージメント投稿: "${post.content.text.slice(0, 100)}..."`,
        sourcePostId: post.platformPostId,
        engagement:
          post.engagement.likes +
          post.engagement.comments +
          post.engagement.shares,
      });
    }
  }

  // トップハッシュタグからインサイト
  if (analysisResult.hashtags.hashtags.length > 0) {
    const topTags = analysisResult.hashtags.hashtags.slice(0, 3);
    for (const tag of topTags) {
      insights.push({
        platform: tag.platforms[0],
        insight: `トレンドハッシュタグ #${tag.tag} (${tag.postCount}件の投稿)`,
      });
    }
  }

  // センチメント分析からインサイト
  const sentimentBreakdown = analysisResult.report.summary.sentimentBreakdown;
  const positiveRatio =
    (sentimentBreakdown.positive / analysisResult.report.summary.totalPosts) * 100;

  if (positiveRatio > 60) {
    insights.push({
      platform: analysisResult.report.platforms[0],
      insight: `ポジティブな反応が多い（${positiveRatio.toFixed(1)}%）`,
    });
  }

  return insights;
}

// ============================================
// Differentiators
// ============================================

/**
 * 差別化ポイントを提案
 */
export function suggestDifferentiators(
  trendTopic: TrendTopic,
  snsInsights: SNSInsight[]
): string[] {
  const differentiators: string[] = [];

  // トレンドスコアが高い場合
  if (trendTopic.trendScore > 70) {
    differentiators.push('最新トレンドを反映した情報');
  }

  // SNSインサイトが多い場合
  if (snsInsights.length >= 3) {
    differentiators.push('実際のSNS投稿データに基づく分析');
  }

  // デフォルトの差別化ポイント
  differentiators.push(
    '初心者にもわかりやすいステップバイステップ解説',
    '専門家の視点を含む実践的なアドバイス',
    '2026年最新の情報を網羅'
  );

  return differentiators.slice(0, 5);
}

/**
 * キーワードから差別化ポイントを提案
 */
function suggestDifferentiatorsFromKeyword(
  keyword: string,
  snsInsights: SNSInsight[]
): string[] {
  return [
    `${keyword}の最新動向を徹底調査`,
    '図解・具体例を多数掲載',
    '実践者の声を反映',
    'よくある失敗パターンと回避策',
    'すぐに使えるテンプレート付き',
  ];
}

// ============================================
// SEO Requirements
// ============================================

/**
 * SEO要件を構築
 */
function buildSEORequirements(config: ContentConfig): SEORequirements {
  return {
    minWordCount: config.article.wordCountMin,
    maxWordCount: config.article.wordCountMax,
    keywordDensity: config.seo.keywordDensity,
    headingRequirements: [
      { level: 1, min: 1, max: 1 },
      { level: 2, min: 3 },
      { level: 3, min: 2 },
    ],
    internalLinks: config.seo.minInternalLinks,
    externalLinks: config.seo.minExternalLinks,
  };
}

// ============================================
// Exports
// ============================================

export {
  generateTitle,
  extractMainKeyword,
  buildSEORequirements,
  DEFAULT_SEO_REQUIREMENTS,
};
