/**
 * TSIS Distribution Module - Video Script Generator (Phase 5)
 *
 * 記事コンテンツからショート動画台本を生成。
 * 7種類のフックパターン、3プラットフォーム対応。
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ArticleDraft,
  VideoScript,
  VideoScriptPlatform,
  VideoHook,
  VideoMainPoint,
  VideoCTA,
  HookPattern,
  VideoCTAType,
  DistributionConfig,
} from './types';
import { loadDistributionConfig } from './sns-repurposer';

// ============================================
// Constants
// ============================================

/** 動画構成（秒） */
const VIDEO_STRUCTURE = {
  totalDuration: 60,
  hookDuration: 5,
  mainPointDuration: 15, // 各ポイント
  ctaDuration: 10,
  mainPointCount: 3,
};

/** プラットフォーム別設定 */
const PLATFORM_CONFIG: Record<VideoScriptPlatform, {
  maxDuration: number;
  hashtags: number;
  style: string;
}> = {
  instagram_reels: {
    maxDuration: 90,
    hashtags: 30,
    style: 'トレンディ・視覚重視',
  },
  tiktok: {
    maxDuration: 60,
    hashtags: 5,
    style: 'カジュアル・テンポ重視',
  },
  youtube_shorts: {
    maxDuration: 60,
    hashtags: 3,
    style: 'プロフェッショナル・情報密度重視',
  },
};

// ============================================
// Main Generation Functions
// ============================================

/**
 * 記事から動画台本を生成
 */
export function generateVideoScript(
  article: ArticleDraft,
  platform: VideoScriptPlatform,
  options?: {
    hookPattern?: HookPattern;
    ctaType?: VideoCTAType;
    duration?: number;
  }
): VideoScript {
  const config = loadDistributionConfig();
  const platformConfig = PLATFORM_CONFIG[platform];

  // フックパターンを決定
  const hookPattern = options?.hookPattern ||
    selectHookPattern(article) ||
    config.hooks.defaultPattern;

  // CTA種別を決定
  const ctaType = options?.ctaType || config.cta.defaultType;

  // 動画尺を決定
  const duration = options?.duration || VIDEO_STRUCTURE.totalDuration;

  // 本編ポイントを抽出
  const mainPoints = extractMainPoints(article, VIDEO_STRUCTURE.mainPointCount);

  // 各パートを生成
  const hook = generateHook(article, hookPattern);
  const videoMainPoints = generateMainPoints(mainPoints, platform);
  const cta = generateCTA(ctaType, article.title);

  // ハッシュタグを生成
  const hashtags = generateVideoHashtags(article, platform, platformConfig.hashtags);

  return {
    id: uuidv4(),
    articleId: article.id,
    platform,
    title: generateVideoTitle(article.title),
    duration,
    hook,
    mainPoints: videoMainPoints,
    cta,
    hashtags,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * 全プラットフォーム向け動画台本を一括生成
 */
export function generateAllVideoScripts(
  article: ArticleDraft,
  options?: {
    hookPattern?: HookPattern;
    ctaType?: VideoCTAType;
  }
): VideoScript[] {
  const config = loadDistributionConfig();
  const platforms = config.defaultVideoFormats;

  return platforms.map(platform =>
    generateVideoScript(article, platform, options)
  );
}

// ============================================
// Hook Generation (7 Patterns)
// ============================================

/**
 * 記事内容に基づいてフックパターンを自動選択
 */
export function selectHookPattern(article: ArticleDraft): HookPattern {
  const content = article.content.toLowerCase();
  const title = article.title;

  // パターンマッチング
  if (title.includes('絶対') || title.includes('やってはいけない')) {
    return 'prohibition';
  }
  if (/\d+/.test(title)) {
    return 'number';
  }
  if (title.includes('専門家') || title.includes('プロ') || title.includes('エキスパート')) {
    return 'authority';
  }
  if (title.includes('悩み') || title.includes('困って')) {
    return 'empathy';
  }
  if (content.includes('実は') || content.includes('知らない')) {
    return 'shocking';
  }
  if (title.includes('vs') || title.includes('比較')) {
    return 'contrast';
  }

  // デフォルト
  return 'question';
}

/**
 * フックパート生成
 */
function generateHook(article: ArticleDraft, pattern: HookPattern): VideoHook {
  const keyword = extractKeyword(article.title);
  const text = generateHookText(pattern, keyword);

  return {
    pattern,
    text,
    duration: VIDEO_STRUCTURE.hookDuration,
  };
}

/**
 * パターン別フックテキスト生成
 */
function generateHookText(pattern: HookPattern, keyword: string): string {
  const templates: Record<HookPattern, string[]> = {
    question: [
      `${keyword}って知ってる？`,
      `${keyword}、まだやってないの？`,
      `なぜ${keyword}が今アツいのか`,
    ],
    prohibition: [
      `絶対やってはいけない${keyword}`,
      `${keyword}でこれだけは避けて`,
      `${keyword}の落とし穴を暴露`,
    ],
    shocking: [
      `実は${keyword}は間違いだった`,
      `${keyword}の真実がヤバすぎた`,
      `知らないと損する${keyword}`,
    ],
    number: [
      `たった3分で分かる${keyword}`,
      `${keyword}で成功する5つの法則`,
      `${keyword}を始める3ステップ`,
    ],
    empathy: [
      `${keyword}で悩んでいませんか？`,
      `${keyword}が上手くいかない人へ`,
      `私も${keyword}で失敗しました`,
    ],
    contrast: [
      `成功する人と失敗する人の${keyword}の違い`,
      `${keyword}のプロとアマの差`,
      `できる人は${keyword}をこうやる`,
    ],
    authority: [
      `専門家が教える${keyword}`,
      `プロが実践する${keyword}のコツ`,
      `業界人が明かす${keyword}の秘訣`,
    ],
  };

  const options = templates[pattern];
  return options[0]; // 実際はランダム or AI選択
}

// ============================================
// Main Points Generation
// ============================================

/**
 * 記事から本編ポイントを抽出
 */
export function extractMainPoints(article: ArticleDraft, count: number): string[] {
  const content = article.content;
  const points: string[] = [];

  // H2見出しを抽出
  const h2Matches = content.match(/^## .+$/gm);
  if (h2Matches) {
    for (const match of h2Matches) {
      const heading = match.replace(/^## /, '').trim();
      // まとめ系は除外
      if (!heading.includes('まとめ') &&
          !heading.includes('次のステップ') &&
          !heading.includes('おわりに')) {
        points.push(heading);
      }
    }
  }

  // 足りない場合はリストから補完
  if (points.length < count) {
    const listMatches = content.match(/^- .+$/gm);
    if (listMatches) {
      for (const match of listMatches) {
        if (points.length >= count) break;
        const item = match.replace(/^- /, '').trim();
        if (item.length > 5 && item.length < 50) {
          points.push(item);
        }
      }
    }
  }

  return points.slice(0, count);
}

/**
 * 本編ポイントを動画用に変換
 */
function generateMainPoints(
  points: string[],
  platform: VideoScriptPlatform
): VideoMainPoint[] {
  const pointDuration = VIDEO_STRUCTURE.mainPointDuration;

  return points.map((text, index) => ({
    index: index + 1,
    text: formatPointForVideo(text, platform),
    duration: pointDuration,
    overlay: generateOverlayText(text, index + 1),
  }));
}

/**
 * ポイントを動画用にフォーマット
 */
function formatPointForVideo(text: string, platform: VideoScriptPlatform): string {
  const config = PLATFORM_CONFIG[platform];

  // プラットフォームに応じた調整
  let formatted = text;

  switch (platform) {
    case 'tiktok':
      // カジュアル・短め
      formatted = text.replace(/です。/g, '!').replace(/ます。/g, '!');
      break;
    case 'instagram_reels':
      // 視覚訴求を追加
      formatted = `✨ ${text}`;
      break;
    case 'youtube_shorts':
      // 情報密度維持
      formatted = text;
      break;
  }

  // 長すぎる場合は切り詰め
  if (formatted.length > 60) {
    formatted = formatted.slice(0, 57) + '...';
  }

  return formatted;
}

/**
 * オーバーレイテキスト生成
 */
function generateOverlayText(text: string, index: number): string {
  // 短いテキストをオーバーレイ用に生成
  const shortText = text.length > 20 ? text.slice(0, 17) + '...' : text;
  return `Point ${index}: ${shortText}`;
}

// ============================================
// CTA Generation
// ============================================

/**
 * CTA生成
 */
export function generateCTA(type: VideoCTAType, title: string): VideoCTA {
  const keyword = extractKeyword(title);

  const templates: Record<VideoCTAType, string> = {
    follow: 'フォローして続きをチェック！',
    save: '保存して後で見返してね📌',
    comment: '感想をコメントで教えて！',
    share: '友達にもシェアしてね！',
    profile: 'プロフィールのリンクから詳細へ🔗',
    link: 'リンクから詳しく見てね！',
  };

  return {
    type,
    text: templates[type],
    duration: VIDEO_STRUCTURE.ctaDuration,
  };
}

// ============================================
// Hashtag Generation
// ============================================

/**
 * 動画用ハッシュタグ生成
 */
function generateVideoHashtags(
  article: ArticleDraft,
  platform: VideoScriptPlatform,
  maxCount: number
): string[] {
  const hashtags: string[] = [];

  // プラットフォーム必須タグ
  switch (platform) {
    case 'tiktok':
      hashtags.push('fyp', 'おすすめ', 'TikTok');
      break;
    case 'instagram_reels':
      hashtags.push('reels', 'リール', 'インスタ');
      break;
    case 'youtube_shorts':
      hashtags.push('shorts', 'ショート');
      break;
  }

  // 記事タイトルからキーワード抽出
  const keyword = extractKeyword(article.title);
  if (keyword) {
    hashtags.push(keyword);
  }

  // 汎用タグ
  hashtags.push('学び', '知識', '情報');

  // 重複除去・制限
  const uniqueTags = [...new Set(hashtags)];
  return uniqueTags.slice(0, maxCount);
}

// ============================================
// Utilities
// ============================================

/**
 * 動画タイトル生成
 */
function generateVideoTitle(articleTitle: string): string {
  // 【】を除去して短縮
  let title = articleTitle.replace(/【.*?】/g, '').trim();

  // 60文字以内に
  if (title.length > 60) {
    title = title.slice(0, 57) + '...';
  }

  return title;
}

/**
 * タイトルからキーワード抽出
 */
function extractKeyword(title: string): string {
  // 【】内を除去
  const cleaned = title.replace(/【.*?】/g, '').trim();

  // 最初の意味のある単語を抽出
  const words = cleaned
    .split(/[\s・、。]/g)
    .filter(w => w.length >= 2 && w.length <= 15)
    .filter(w => !['とは', 'について', 'ための', 'できる', '方法', 'やり方'].includes(w));

  return words[0] || cleaned.slice(0, 10);
}

// ============================================
// Batch Operations
// ============================================

/**
 * 複数記事から動画台本を一括生成
 */
export function generateVideoScriptsBatch(
  articles: ArticleDraft[],
  platforms?: VideoScriptPlatform[]
): Map<string, VideoScript[]> {
  const config = loadDistributionConfig();
  const targetPlatforms = platforms || config.defaultVideoFormats;

  const result = new Map<string, VideoScript[]>();

  for (const article of articles) {
    const scripts = targetPlatforms.map(platform =>
      generateVideoScript(article, platform)
    );
    result.set(article.id, scripts);
  }

  return result;
}

/**
 * 台本サマリー生成
 */
export function generateScriptSummary(
  scripts: VideoScript[]
): {
  totalScripts: number;
  byPlatform: Record<string, number>;
  byHookPattern: Record<string, number>;
  totalDuration: number;
} {
  const byPlatform: Record<string, number> = {};
  const byHookPattern: Record<string, number> = {};
  let totalDuration = 0;

  for (const script of scripts) {
    byPlatform[script.platform] = (byPlatform[script.platform] || 0) + 1;
    byHookPattern[script.hook.pattern] = (byHookPattern[script.hook.pattern] || 0) + 1;
    totalDuration += script.duration;
  }

  return {
    totalScripts: scripts.length,
    byPlatform,
    byHookPattern,
    totalDuration,
  };
}

/**
 * 台本をMarkdown形式に変換
 */
export function scriptToMarkdown(script: VideoScript): string {
  const lines: string[] = [
    `# ${script.title}`,
    '',
    `**プラットフォーム**: ${script.platform}`,
    `**総尺**: ${script.duration}秒`,
    '',
    '---',
    '',
    '## フック（0:00-0:05）',
    '',
    `**パターン**: ${script.hook.pattern}`,
    '',
    `> ${script.hook.text}`,
    '',
    '---',
    '',
    '## 本編',
    '',
  ];

  let currentTime = 5;
  for (const point of script.mainPoints) {
    const endTime = currentTime + point.duration;
    lines.push(`### Point ${point.index}（${formatTime(currentTime)}-${formatTime(endTime)}）`);
    lines.push('');
    lines.push(point.text);
    if (point.overlay) {
      lines.push('');
      lines.push(`*テロップ: ${point.overlay}*`);
    }
    lines.push('');
    currentTime = endTime;
  }

  lines.push('---');
  lines.push('');
  lines.push(`## CTA（${formatTime(currentTime)}-${formatTime(currentTime + script.cta.duration)}）`);
  lines.push('');
  lines.push(`**タイプ**: ${script.cta.type}`);
  lines.push('');
  lines.push(`> ${script.cta.text}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## ハッシュタグ');
  lines.push('');
  lines.push(script.hashtags.map(tag => `#${tag}`).join(' '));
  lines.push('');

  return lines.join('\n');
}

/**
 * 秒数を時間形式に変換
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
