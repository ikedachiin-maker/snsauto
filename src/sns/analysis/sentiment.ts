/**
 * TSIS Sentiment Analyzer (Phase 3)
 *
 * ヒューリスティクスベースのセンチメント分析。
 * 外部ML APIに依存せず、日英キーワード辞書と絵文字マップで分析。
 * 日本語テキストで80%以上の精度を目標。
 */

import {
  SentimentAnalyzerOptions,
  UnifiedPost,
  PostAnalysis,
  SentimentResult,
  SentimentLabel,
  EmotionLabel,
} from './types';

// ============================================
// Sentiment Keyword Dictionaries
// ============================================

const ENGLISH_POSITIVE: Record<string, number> = {
  love: 0.8, great: 0.7, amazing: 0.8, excellent: 0.8, awesome: 0.7,
  happy: 0.7, wonderful: 0.8, fantastic: 0.8, beautiful: 0.6, perfect: 0.9,
  best: 0.8, good: 0.5, nice: 0.5, thanks: 0.5, thank: 0.5,
  excited: 0.7, brilliant: 0.7, incredible: 0.8, outstanding: 0.8,
  superb: 0.8, delightful: 0.7, pleased: 0.6, glad: 0.6, enjoy: 0.5,
  impressive: 0.7, remarkable: 0.7, terrific: 0.7, fabulous: 0.7,
};

const ENGLISH_NEGATIVE: Record<string, number> = {
  hate: -0.8, terrible: -0.8, awful: -0.8, worst: -0.9, bad: -0.5,
  horrible: -0.8, disgusting: -0.8, disappointing: -0.6, disappointed: -0.6,
  angry: -0.7, sad: -0.6, upset: -0.6, annoyed: -0.5, frustrated: -0.6,
  poor: -0.5, ugly: -0.5, stupid: -0.6, boring: -0.5, useless: -0.6,
  pathetic: -0.7, dreadful: -0.7, miserable: -0.7, ridiculous: -0.5,
  unacceptable: -0.7, outrageous: -0.6, shameful: -0.6,
};

const JAPANESE_POSITIVE: Record<string, number> = {
  'すごい': 0.7, '最高': 0.9, '嬉しい': 0.7, 'ありがとう': 0.6, '素晴らしい': 0.8,
  '楽しい': 0.7, '美味しい': 0.6, 'かわいい': 0.6, '素敵': 0.7, '幸せ': 0.8,
  '感動': 0.8, '大好き': 0.8, '最強': 0.7, '神': 0.8, 'いいね': 0.5,
  '良い': 0.5, 'よい': 0.5, '好き': 0.6, 'おすすめ': 0.5, '完璧': 0.9,
  '優秀': 0.7, '面白い': 0.6, 'ワクワク': 0.7, 'うれしい': 0.7, '感謝': 0.6,
  '便利': 0.5, '快適': 0.6, '魅力': 0.6, '絶賛': 0.8, '称賛': 0.7,
  '成功': 0.6, '達成': 0.6, 'やった': 0.6, 'さすが': 0.6, '天才': 0.7,
};

const JAPANESE_NEGATIVE: Record<string, number> = {
  '最悪': -0.9, 'ひどい': -0.7, 'つまらない': -0.5, '残念': -0.6, '嫌い': -0.7,
  '怒り': -0.7, '悲しい': -0.6, 'ダメ': -0.5, '無理': -0.5, 'クソ': -0.8,
  '酷い': -0.7, '不満': -0.6, '失望': -0.7, '困る': -0.4, '嫌': -0.6,
  'うざい': -0.6, 'キモい': -0.7, 'ムカつく': -0.7, '腹立つ': -0.7, '許せない': -0.8,
  '気持ち悪い': -0.7, 'やばい': -0.3, '面倒': -0.4, '退屈': -0.5, '駄目': -0.5,
  '批判': -0.5, '非難': -0.6, '反対': -0.4, '問題': -0.3, '失敗': -0.5,
};

// ============================================
// Emoji Sentiment Map
// ============================================

const EMOJI_SENTIMENT: Record<string, number> = {
  '😊': 0.7, '😄': 0.7, '😃': 0.7, '😁': 0.6, '🙂': 0.4, '😍': 0.8,
  '🥰': 0.8, '❤️': 0.7, '💕': 0.7, '💖': 0.7, '👍': 0.5, '👏': 0.6,
  '🎉': 0.7, '✨': 0.5, '🔥': 0.5, '💪': 0.5, '🙏': 0.4, '😂': 0.5,
  '🤣': 0.5, '😆': 0.5, '🥳': 0.7, '🎊': 0.6,
  '😢': -0.5, '😭': -0.6, '😔': -0.5, '😞': -0.5, '😠': -0.6, '😡': -0.7,
  '🤬': -0.8, '💔': -0.6, '👎': -0.5, '😤': -0.5, '😩': -0.5, '😫': -0.5,
  '🙄': -0.3, '😒': -0.4, '😑': -0.2, '💀': -0.3, '☠️': -0.4,
};

// ============================================
// Emotion Keyword Dictionaries
// ============================================

const EMOTION_KEYWORDS: Record<EmotionLabel, Record<string, number>> = {
  anger: {
    '怒': 0.8, 'ムカつく': 0.8, '腹立つ': 0.8, '許せない': 0.9, 'イライラ': 0.7,
    angry: 0.8, furious: 0.9, mad: 0.7, outraged: 0.8, annoyed: 0.6,
  },
  disgust: {
    '気持ち悪い': 0.8, 'キモ': 0.7, 'うざ': 0.6, '嫌': 0.5, 'ゲロ': 0.8,
    disgusting: 0.8, gross: 0.7, nasty: 0.6, repulsive: 0.8, revolting: 0.8,
  },
  fear: {
    '怖い': 0.8, '恐': 0.7, '不安': 0.6, 'ヤバい': 0.5, '心配': 0.5,
    scared: 0.7, afraid: 0.7, terrified: 0.9, anxious: 0.6, worried: 0.5,
  },
  joy: {
    '嬉しい': 0.8, '楽しい': 0.8, '幸せ': 0.9, 'ワクワク': 0.7, '喜': 0.7,
    happy: 0.8, joyful: 0.8, delighted: 0.8, ecstatic: 0.9, thrilled: 0.8,
  },
  sadness: {
    '悲しい': 0.8, '泣': 0.7, '寂しい': 0.7, 'つらい': 0.7, '辛い': 0.7,
    sad: 0.7, depressed: 0.8, heartbroken: 0.9, miserable: 0.8, gloomy: 0.6,
  },
  surprise: {
    '驚': 0.7, 'びっくり': 0.7, 'まさか': 0.6, 'えー': 0.5, 'うそ': 0.5,
    surprised: 0.7, shocked: 0.8, amazed: 0.7, astonished: 0.8, stunned: 0.7,
  },
};

// ============================================
// Negation Patterns
// ============================================

const ENGLISH_NEGATIONS = ['not', "n't", 'no', 'never', 'neither', 'nobody', 'nothing'];
const JAPANESE_NEGATIONS = ['ない', 'なく', 'ません', 'じゃない', 'ではない'];

// ============================================
// Utility Functions
// ============================================

/**
 * テキストの言語を検出（CJK文字の有無で判定）
 */
function detectLanguage(text: string): string {
  const cjkPattern = /[\u3000-\u9FFF\uF900-\uFAFF]/;
  return cjkPattern.test(text) ? 'ja' : 'en';
}

/**
 * テキストからトークンを抽出
 */
function tokenize(text: string, language: string): string[] {
  const normalized = text.toLowerCase();
  if (language === 'ja') {
    // 日本語: スペース区切り + キーワードマッチング用にそのまま返す
    return [normalized]; // 部分文字列マッチングに使用
  }
  // 英語: 単語分割
  return normalized.split(/\s+/).filter(t => t.length > 0);
}

/**
 * キーワード辞書からスコアを計算
 */
function calculateKeywordScore(
  text: string,
  tokens: string[],
  language: string,
  customKeywords?: Record<string, number>,
): { score: number; matchedCount: number } {
  const positive = language === 'ja' ? JAPANESE_POSITIVE : ENGLISH_POSITIVE;
  const negative = language === 'ja' ? JAPANESE_NEGATIVE : ENGLISH_NEGATIVE;
  const allKeywords = { ...positive, ...negative, ...(customKeywords || {}) };

  let score = 0;
  let matchedCount = 0;

  if (language === 'ja') {
    // 日本語: 部分文字列マッチング
    for (const [keyword, weight] of Object.entries(allKeywords)) {
      if (text.includes(keyword)) {
        score += weight;
        matchedCount++;
      }
    }
    // 否定チェック
    for (const neg of JAPANESE_NEGATIONS) {
      if (text.includes(neg)) {
        score *= -0.5; // 否定による反転
        break;
      }
    }
  } else {
    // 英語: トークンマッチング
    let negationActive = false;
    for (const token of tokens) {
      if (ENGLISH_NEGATIONS.some(neg => token.includes(neg))) {
        negationActive = true;
        continue;
      }
      if (allKeywords[token] !== undefined) {
        const weight = negationActive ? -allKeywords[token] * 0.5 : allKeywords[token];
        score += weight;
        matchedCount++;
        negationActive = false;
      }
    }
  }

  return { score, matchedCount };
}

/**
 * 絵文字スコアを計算
 */
function calculateEmojiScore(text: string): { score: number; matchedCount: number } {
  let score = 0;
  let matchedCount = 0;
  for (const [emoji, weight] of Object.entries(EMOJI_SENTIMENT)) {
    const count = (text.match(new RegExp(emoji, 'g')) || []).length;
    if (count > 0) {
      score += weight * Math.min(count, 3); // 3回までカウント
      matchedCount += count;
    }
  }
  return { score, matchedCount };
}

/**
 * 6感情を検出
 */
function detectEmotions(text: string, language: string): Partial<Record<EmotionLabel, number>> {
  const emotions: Partial<Record<EmotionLabel, number>> = {};
  const normalizedText = text.toLowerCase();

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    let emotionScore = 0;
    for (const [keyword, weight] of Object.entries(keywords)) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        emotionScore = Math.max(emotionScore, weight);
      }
    }
    if (emotionScore > 0) {
      emotions[emotion as EmotionLabel] = emotionScore;
    }
  }

  return emotions;
}

/**
 * スコアをラベルに変換
 */
function scoreToLabel(score: number): SentimentLabel {
  if (score > 0.1) return 'positive';
  if (score < -0.1) return 'negative';
  return 'neutral';
}

/**
 * 信頼度を計算
 */
function calculateConfidence(
  matchedKeywords: number,
  matchedEmojis: number,
  textLength: number,
): number {
  const totalMatches = matchedKeywords + matchedEmojis;
  if (totalMatches === 0) return 0.3; // 低い信頼度

  // テキスト長に応じた調整
  const lengthFactor = Math.min(1, textLength / 100);
  const matchFactor = Math.min(1, totalMatches / 5);

  return Math.min(0.95, 0.4 + lengthFactor * 0.3 + matchFactor * 0.3);
}

// ============================================
// Main Analysis Functions
// ============================================

/**
 * テキストのセンチメントを分析
 */
export function analyzeSentiment(
  text: string,
  language?: string,
  options?: SentimentAnalyzerOptions,
): SentimentResult {
  if (!text || text.trim().length === 0) {
    return {
      label: 'neutral',
      score: 0,
      confidence: 0.1,
    };
  }

  const lang = language || options?.language || detectLanguage(text);
  const tokens = tokenize(text, lang);

  // キーワードスコア
  const keywordResult = calculateKeywordScore(text, tokens, lang, options?.customKeywords);

  // 絵文字スコア
  const emojiResult = calculateEmojiScore(text);

  // 総合スコア（-1.0 〜 +1.0 に正規化）
  const rawScore = keywordResult.score + emojiResult.score;
  const maxPossibleScore = Math.max(5, keywordResult.matchedCount + emojiResult.matchedCount);
  const normalizedScore = Math.max(-1, Math.min(1, rawScore / maxPossibleScore));

  // 信頼度
  const confidence = calculateConfidence(
    keywordResult.matchedCount,
    emojiResult.matchedCount,
    text.length,
  );

  // 感情検出
  const emotions = options?.enableEmotions !== false ? detectEmotions(text, lang) : undefined;

  return {
    label: scoreToLabel(normalizedScore),
    score: parseFloat(normalizedScore.toFixed(4)),
    emotions: Object.keys(emotions || {}).length > 0 ? emotions : undefined,
    confidence: parseFloat(confidence.toFixed(4)),
  };
}

/**
 * 投稿のPostAnalysisを生成
 */
export function analyzePost(
  post: UnifiedPost,
  platformAvgEngagement: number,
  options?: SentimentAnalyzerOptions,
): PostAnalysis {
  const sentiment = analyzeSentiment(
    post.content.text,
    post.content.language,
    options,
  );

  // トピック抽出（ハッシュタグ + 頻出キーワード）
  const topics = extractTopics(post.content.text, post.content.hashtags);

  // トレンドスコア（エンゲージメント比較）
  const totalEngagement = post.engagement.likes + post.engagement.comments +
    post.engagement.shares + post.engagement.saves;
  const trendScore = platformAvgEngagement > 0
    ? Math.min(100, Math.round((totalEngagement / platformAvgEngagement) * 50))
    : 50;

  // バイラリティスコア（シェア率とコメント率に基づく）
  const viralityScore = calculateViralityScore(post);

  return {
    sentiment,
    topics,
    trendScore,
    viralityScore,
  };
}

/**
 * 投稿バッチのセンチメント分析
 * UnifiedPost.analysis フィールドを populate する
 */
export function analyzePostsBatch(
  posts: UnifiedPost[],
  options?: SentimentAnalyzerOptions,
): UnifiedPost[] {
  if (posts.length === 0) return [];

  // プラットフォーム別平均エンゲージメントを計算
  const platformAvg = new Map<string, number>();
  const platformCounts = new Map<string, number>();

  for (const post of posts) {
    const total = post.engagement.likes + post.engagement.comments +
      post.engagement.shares + post.engagement.saves;
    platformAvg.set(
      post.platform,
      (platformAvg.get(post.platform) || 0) + total,
    );
    platformCounts.set(
      post.platform,
      (platformCounts.get(post.platform) || 0) + 1,
    );
  }

  for (const [platform, total] of platformAvg) {
    const count = platformCounts.get(platform) || 1;
    platformAvg.set(platform, total / count);
  }

  // 各投稿を分析
  return posts.map(post => ({
    ...post,
    analysis: analyzePost(post, platformAvg.get(post.platform) || 0, options),
  }));
}

// ============================================
// Helper Functions
// ============================================

/**
 * トピックを抽出
 */
function extractTopics(text: string, hashtags: string[]): string[] {
  const topics = new Set<string>(hashtags);

  // 頻出名詞を抽出（簡易版）
  const words = text.toLowerCase()
    .replace(/[^\w\s\u3000-\u9FFF]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);

  const wordFreq = new Map<string, number>();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }

  // 頻度上位5語をトピックに追加
  const sorted = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  for (const [word] of sorted) {
    topics.add(word);
  }

  return Array.from(topics).slice(0, 10);
}

/**
 * バイラリティスコアを計算
 */
function calculateViralityScore(post: UnifiedPost): number {
  const { likes, shares, comments, views } = post.engagement;

  // シェア率
  const shareRate = views > 0 ? shares / views : 0;
  // コメント率
  const commentRate = views > 0 ? comments / views : 0;
  // エンゲージメント密度
  const engagementDensity = post.author.followers > 0
    ? (likes + shares + comments) / post.author.followers
    : 0;

  // 重み付きスコア（0-100）
  const score = (shareRate * 40 + commentRate * 30 + engagementDensity * 30) * 100;
  return Math.min(100, Math.round(score * 10)); // スケール調整
}
