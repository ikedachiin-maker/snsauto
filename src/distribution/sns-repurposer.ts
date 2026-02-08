/**
 * TSIS Distribution Module - SNS Repurposer (Phase 5)
 *
 * 記事コンテンツをプラットフォーム別のSNS投稿に変換。
 * 各プラットフォームの制約・特性に合わせて最適化。
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import {
  Platform,
  PostType,
  ArticleDraft,
  SNSRepurposedPost,
  SNSPostContent,
  PlatformConstraints,
  PlatformConstraintsMap,
  DistributionConfig,
} from './types';

// ============================================
// Constants
// ============================================

const CONSTRAINTS_PATH = path.resolve(
  process.cwd(),
  'config/distribution/platform-constraints.json'
);

const CONFIG_PATH = path.resolve(
  process.cwd(),
  'config/distribution/distribution-config.json'
);

// ============================================
// Config Loading
// ============================================

/**
 * プラットフォーム制約をロード
 */
export function loadPlatformConstraints(): PlatformConstraintsMap {
  try {
    if (!fs.existsSync(CONSTRAINTS_PATH)) {
      return getDefaultConstraints();
    }
    const content = fs.readFileSync(CONSTRAINTS_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.platforms as PlatformConstraintsMap;
  } catch (error) {
    console.error('Failed to load platform constraints:', error);
    return getDefaultConstraints();
  }
}

/**
 * 配信設定をロード
 */
export function loadDistributionConfig(): DistributionConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return getDefaultConfig();
    }
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(content) as DistributionConfig;
  } catch (error) {
    console.error('Failed to load distribution config:', error);
    return getDefaultConfig();
  }
}

function getDefaultConstraints(): PlatformConstraintsMap {
  return {
    twitter: { maxLength: 280, maxHashtags: 3, mediaRequired: false, linkAllowed: true },
    instagram: { maxLength: 2200, maxHashtags: 30, mediaRequired: true, linkAllowed: false },
    linkedin: { maxLength: 3000, maxHashtags: 5, mediaRequired: false, linkAllowed: true },
    facebook: { maxLength: 63206, maxHashtags: 10, mediaRequired: false, linkAllowed: true },
    threads: { maxLength: 500, maxHashtags: 5, mediaRequired: false, linkAllowed: true },
    tiktok: { maxLength: 150, maxHashtags: 5, mediaRequired: true, linkAllowed: false },
    youtube: { maxLength: 5000, maxHashtags: 15, mediaRequired: true, linkAllowed: true },
    pinterest: { maxLength: 500, maxHashtags: 20, mediaRequired: true, linkAllowed: true },
    reddit: { maxLength: 40000, maxHashtags: 0, mediaRequired: false, linkAllowed: true },
    bluesky: { maxLength: 300, maxHashtags: 5, mediaRequired: false, linkAllowed: true },
  };
}

function getDefaultConfig(): DistributionConfig {
  return {
    version: '1.0.0',
    defaultPlatforms: ['twitter', 'instagram', 'linkedin', 'threads'],
    defaultVideoFormats: ['instagram_reels', 'tiktok', 'youtube_shorts'],
    schedule: {
      defaultStrategy: 'staggered',
      defaultTimezone: 'Asia/Tokyo',
      staggeredInterval: 60,
    },
    hooks: {
      patterns: ['question', 'prohibition', 'shocking', 'number', 'empathy', 'contrast', 'authority'],
      defaultPattern: 'question',
    },
    cta: {
      types: ['follow', 'save', 'comment', 'share', 'profile', 'link'],
      defaultType: 'follow',
    },
  };
}

// ============================================
// Main Repurpose Functions
// ============================================

/**
 * 記事を特定プラットフォーム向けに変換
 */
export function repurposeForPlatform(
  article: ArticleDraft,
  platform: Platform
): SNSRepurposedPost {
  const constraints = loadPlatformConstraints()[platform];
  const content = generatePlatformContent(article, platform, constraints);

  return {
    id: uuidv4(),
    articleId: article.id,
    platform,
    postType: determinePostType(platform),
    content,
    constraints,
    generatedAt: new Date().toISOString(),
    status: 'draft',
  };
}

/**
 * 記事を複数プラットフォーム向けに一括変換
 */
export function repurposeForAllPlatforms(
  article: ArticleDraft,
  platforms?: Platform[]
): SNSRepurposedPost[] {
  const config = loadDistributionConfig();
  const targetPlatforms = platforms || config.defaultPlatforms;

  return targetPlatforms.map(platform => repurposeForPlatform(article, platform));
}

// ============================================
// Content Generation
// ============================================

/**
 * プラットフォーム別コンテンツ生成
 */
function generatePlatformContent(
  article: ArticleDraft,
  platform: Platform,
  constraints: PlatformConstraints
): SNSPostContent {
  const keyPoints = extractKeyPoints(article);
  const hashtags = generateHashtags(article, platform, constraints.maxHashtags);

  let text: string;

  switch (platform) {
    case 'twitter':
      text = generateTwitterContent(article, keyPoints, constraints);
      break;
    case 'instagram':
      text = generateInstagramContent(article, keyPoints, constraints);
      break;
    case 'linkedin':
      text = generateLinkedInContent(article, keyPoints, constraints);
      break;
    case 'threads':
      text = generateThreadsContent(article, keyPoints, constraints);
      break;
    case 'facebook':
      text = generateFacebookContent(article, keyPoints, constraints);
      break;
    case 'bluesky':
      text = generateBlueskyContent(article, keyPoints, constraints);
      break;
    default:
      text = generateGenericContent(article, keyPoints, constraints);
  }

  return {
    text,
    hashtags,
    linkUrl: constraints.linkAllowed ? generateArticleLink(article) : undefined,
  };
}

/**
 * Twitter/X向けコンテンツ（280文字・簡潔・CTA重視）
 */
function generateTwitterContent(
  article: ArticleDraft,
  keyPoints: string[],
  constraints: PlatformConstraints
): string {
  const title = article.title.replace(/【.*?】/g, '').trim();
  const mainPoint = keyPoints[0] || '';

  // 簡潔なフォーマット
  let content = `${title}\n\n${mainPoint}`;

  // CTA追加
  const cta = '\n\n詳しくは↓';

  // 文字数調整（ハッシュタグ・リンク分を考慮）
  const reservedLength = 50; // ハッシュタグ・リンク用
  const maxContentLength = constraints.maxLength - reservedLength;

  if (content.length + cta.length > maxContentLength) {
    content = truncateWithEllipsis(content, maxContentLength - cta.length);
  }

  return content + cta;
}

/**
 * Instagram向けコンテンツ（2200文字・詳細・ハッシュタグ多め）
 */
function generateInstagramContent(
  article: ArticleDraft,
  keyPoints: string[],
  constraints: PlatformConstraints
): string {
  const title = article.title;

  // 詳細なフォーマット
  const parts: string[] = [
    `✨ ${title}`,
    '',
    '━━━━━━━━━━━━━━━',
    '',
  ];

  // キーポイントを番号付きで追加
  keyPoints.slice(0, 5).forEach((point, index) => {
    parts.push(`${index + 1}. ${point}`);
  });

  parts.push('');
  parts.push('━━━━━━━━━━━━━━━');
  parts.push('');
  parts.push('📌 保存して後で読み返してね！');
  parts.push('');
  parts.push('💬 感想をコメントで教えてください');

  return parts.join('\n');
}

/**
 * LinkedIn向けコンテンツ（3000文字・プロフェッショナル）
 */
function generateLinkedInContent(
  article: ArticleDraft,
  keyPoints: string[],
  constraints: PlatformConstraints
): string {
  const title = article.title.replace(/【.*?】/g, '').trim();

  const parts: string[] = [
    title,
    '',
    '---',
    '',
  ];

  // ビジネス視点での導入
  parts.push('ビジネスの現場で活用できる知見をシェアします。');
  parts.push('');

  // キーポイント
  parts.push('【ポイント】');
  keyPoints.slice(0, 4).forEach((point) => {
    parts.push(`・${point}`);
  });

  parts.push('');
  parts.push('---');
  parts.push('');
  parts.push('詳細は記事をご覧ください。');
  parts.push('');
  parts.push('この投稿が参考になったら、いいね・コメントをお願いします。');

  return parts.join('\n');
}

/**
 * Threads向けコンテンツ（500文字・カジュアル・会話調）
 */
function generateThreadsContent(
  article: ArticleDraft,
  keyPoints: string[],
  constraints: PlatformConstraints
): string {
  const title = article.title.replace(/【.*?】/g, '').trim();

  // カジュアルなフォーマット
  let content = `${title}について書きました！\n\n`;

  // 主要ポイント1つ
  if (keyPoints.length > 0) {
    content += `一番大事なのは「${keyPoints[0]}」ってこと。\n\n`;
  }

  content += '気になったら読んでみてね 👀';

  // 文字数制限
  if (content.length > constraints.maxLength) {
    content = truncateWithEllipsis(content, constraints.maxLength);
  }

  return content;
}

/**
 * Facebook向けコンテンツ
 */
function generateFacebookContent(
  article: ArticleDraft,
  keyPoints: string[],
  constraints: PlatformConstraints
): string {
  const title = article.title;

  const parts: string[] = [
    `📝 ${title}`,
    '',
  ];

  // 詳細な説明
  parts.push('新しい記事を公開しました！');
  parts.push('');

  if (keyPoints.length > 0) {
    parts.push('【この記事でわかること】');
    keyPoints.slice(0, 5).forEach((point) => {
      parts.push(`✅ ${point}`);
    });
  }

  parts.push('');
  parts.push('ぜひチェックしてみてください！');

  return parts.join('\n');
}

/**
 * Bluesky向けコンテンツ（300文字）
 */
function generateBlueskyContent(
  article: ArticleDraft,
  keyPoints: string[],
  constraints: PlatformConstraints
): string {
  const title = article.title.replace(/【.*?】/g, '').trim();

  let content = `${title}\n\n`;

  if (keyPoints.length > 0) {
    content += `${keyPoints[0]}\n\n`;
  }

  content += '詳しくはリンクから↓';

  if (content.length > constraints.maxLength) {
    content = truncateWithEllipsis(content, constraints.maxLength);
  }

  return content;
}

/**
 * 汎用コンテンツ生成
 */
function generateGenericContent(
  article: ArticleDraft,
  keyPoints: string[],
  constraints: PlatformConstraints
): string {
  const title = article.title;
  let content = `${title}\n\n`;

  if (keyPoints.length > 0) {
    content += keyPoints.slice(0, 3).join('\n');
  }

  if (content.length > constraints.maxLength) {
    content = truncateWithEllipsis(content, constraints.maxLength);
  }

  return content;
}

// ============================================
// Key Point Extraction
// ============================================

/**
 * 記事からキーポイントを抽出
 */
export function extractKeyPoints(article: ArticleDraft): string[] {
  const content = article.content;
  const points: string[] = [];

  // H2見出しを抽出
  const h2Matches = content.match(/^## .+$/gm);
  if (h2Matches) {
    for (const match of h2Matches.slice(0, 5)) {
      const heading = match.replace(/^## /, '').trim();
      if (!heading.includes('まとめ') && !heading.includes('次のステップ')) {
        points.push(heading);
      }
    }
  }

  // リストアイテムを抽出（補完用）
  if (points.length < 3) {
    const listMatches = content.match(/^- .+$/gm);
    if (listMatches) {
      for (const match of listMatches.slice(0, 5 - points.length)) {
        const item = match.replace(/^- /, '').trim();
        if (item.length > 10 && item.length < 100) {
          points.push(item);
        }
      }
    }
  }

  return points.slice(0, 5);
}

// ============================================
// Hashtag Generation
// ============================================

/**
 * プラットフォーム別ハッシュタグ生成
 */
export function generateHashtags(
  article: ArticleDraft,
  platform: Platform,
  maxHashtags?: number
): string[] {
  const limit = maxHashtags || 5;

  // 記事タイトルからキーワード抽出
  const titleKeywords = extractKeywordsFromTitle(article.title);

  // プラットフォーム別の汎用タグ
  const platformTags = getPlatformGenericTags(platform);

  // 組み合わせ
  const allTags = [...titleKeywords, ...platformTags];

  // 重複除去・制限
  const uniqueTags = [...new Set(allTags)];
  return uniqueTags.slice(0, limit);
}

/**
 * タイトルからキーワードを抽出
 */
function extractKeywordsFromTitle(title: string): string[] {
  // 【】内のテキストを除去
  const cleaned = title.replace(/【.*?】/g, '').trim();

  // 一般的な単語を抽出（簡易実装）
  const words = cleaned
    .split(/[\s・、。！？]/g)
    .filter(w => w.length >= 2 && w.length <= 20)
    .filter(w => !['とは', 'について', 'する', 'ための', 'できる'].includes(w));

  return words.slice(0, 3);
}

/**
 * プラットフォーム別汎用タグ
 */
function getPlatformGenericTags(platform: Platform): string[] {
  switch (platform) {
    case 'twitter':
      return ['tips', 'ノウハウ'];
    case 'instagram':
      return ['インスタ', '情報シェア', 'フォローしてね', '保存推奨'];
    case 'linkedin':
      return ['ビジネス', 'キャリア', '学び'];
    case 'threads':
      return ['threads日本', 'シェア'];
    case 'tiktok':
      return ['TikTok', 'おすすめ', 'fyp'];
    default:
      return ['情報', 'シェア'];
  }
}

// ============================================
// Utilities
// ============================================

/**
 * 文字数制限付きで切り詰め
 */
export function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // 最後の完全な文で切る試み
  const truncated = text.slice(0, maxLength - 3);
  const lastPeriod = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？'),
    truncated.lastIndexOf('\n')
  );

  if (lastPeriod > maxLength * 0.5) {
    return truncated.slice(0, lastPeriod + 1);
  }

  return truncated + '...';
}

/**
 * 投稿タイプを決定
 */
function determinePostType(platform: Platform): PostType {
  switch (platform) {
    case 'twitter':
      return 'text';
    case 'instagram':
      return 'image';
    case 'linkedin':
      return 'article';
    case 'facebook':
      return 'text';
    case 'threads':
      return 'thread';
    case 'tiktok':
      return 'video';
    case 'youtube':
      return 'video';
    default:
      return 'text';
  }
}

/**
 * 記事リンクを生成（プレースホルダー）
 */
function generateArticleLink(article: ArticleDraft): string {
  // 実際のCMSに合わせて変更
  return `https://example.com/articles/${article.id}`;
}

// ============================================
// Batch Operations
// ============================================

/**
 * 複数記事を一括変換
 */
export function repurposeBatch(
  articles: ArticleDraft[],
  platforms?: Platform[]
): Map<string, SNSRepurposedPost[]> {
  const result = new Map<string, SNSRepurposedPost[]>();

  for (const article of articles) {
    const posts = repurposeForAllPlatforms(article, platforms);
    result.set(article.id, posts);
  }

  return result;
}

/**
 * 変換結果のサマリーを生成
 */
export function generateRepurposeSummary(
  posts: SNSRepurposedPost[]
): {
  totalPosts: number;
  byPlatform: Record<string, number>;
  averageLength: number;
} {
  const byPlatform: Record<string, number> = {};
  let totalLength = 0;

  for (const post of posts) {
    byPlatform[post.platform] = (byPlatform[post.platform] || 0) + 1;
    totalLength += post.content.text.length;
  }

  return {
    totalPosts: posts.length,
    byPlatform,
    averageLength: posts.length > 0 ? Math.round(totalLength / posts.length) : 0,
  };
}
