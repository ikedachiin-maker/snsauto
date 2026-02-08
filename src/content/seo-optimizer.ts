/**
 * TSIS Content Generation Module - SEO Optimizer (Phase 4)
 *
 * SEO最適化: 記事のSEOスコアチェック、メタデータ生成、Schema構造化データ生成。
 */

import {
  ArticleDraft,
  SEOMetadata,
  SEOCheckResult,
  SEOCheck,
  SEOOptimizationOptions,
  SEORequirements,
} from './types';
import { loadContentConfig, DEFAULT_SEO_REQUIREMENTS } from './brief-generator';

// ============================================
// SEO Check
// ============================================

/**
 * SEOスコアをチェック
 */
export function checkSEOScore(
  article: ArticleDraft,
  requirements?: SEORequirements
): SEOCheckResult {
  const config = loadContentConfig();
  const reqs = requirements || DEFAULT_SEO_REQUIREMENTS;
  const checks: SEOCheck[] = [];
  const suggestions: string[] = [];

  // 1. 文字数チェック
  const wordCountCheck = checkWordCount(
    article.wordCount,
    reqs.minWordCount,
    reqs.maxWordCount
  );
  checks.push(wordCountCheck);
  if (!wordCountCheck.passed) {
    suggestions.push(wordCountCheck.message);
  }

  // 2. キーワード密度チェック（簡易実装）
  const keywordCheck = checkKeywordDensity(
    article.content,
    article.title.split('】')[1]?.split('【')[0]?.trim() || article.title,
    reqs.keywordDensity
  );
  checks.push(keywordCheck);
  if (!keywordCheck.passed) {
    suggestions.push(keywordCheck.message);
  }

  // 3. 見出し階層チェック
  const headingCheck = checkHeadingHierarchy(
    article.content,
    reqs.headingRequirements
  );
  checks.push(headingCheck);
  if (!headingCheck.passed) {
    suggestions.push(headingCheck.message);
  }

  // 4. メタタイトル長チェック
  const titleCheck = checkMetaTitleLength(
    article.title,
    config.seo.maxMetaTitleLength
  );
  checks.push(titleCheck);
  if (!titleCheck.passed) {
    suggestions.push(titleCheck.message);
  }

  // 5. 内部リンクチェック
  const internalLinkCheck = checkInternalLinks(
    article.content,
    reqs.internalLinks
  );
  checks.push(internalLinkCheck);
  if (!internalLinkCheck.passed) {
    suggestions.push(internalLinkCheck.message);
  }

  // 6. 外部リンクチェック
  const externalLinkCheck = checkExternalLinks(
    article.content,
    reqs.externalLinks
  );
  checks.push(externalLinkCheck);
  if (!externalLinkCheck.passed) {
    suggestions.push(externalLinkCheck.message);
  }

  // 7. 画像alt属性チェック
  const imageAltCheck = checkImageAlt(article.content);
  checks.push(imageAltCheck);
  if (!imageAltCheck.passed) {
    suggestions.push(imageAltCheck.message);
  }

  // 8. 読みやすさチェック
  const readabilityCheck = checkReadability(article.content);
  checks.push(readabilityCheck);
  if (!readabilityCheck.passed) {
    suggestions.push(readabilityCheck.message);
  }

  // 総合スコア計算
  const totalScore = Math.round(
    checks.reduce((sum, c) => sum + c.score, 0) / checks.length
  );

  const threshold = config.seo.scoreThreshold;

  return {
    score: totalScore,
    passed: totalScore >= threshold,
    checks,
    suggestions,
  };
}

// ============================================
// Individual Checks
// ============================================

function checkWordCount(
  wordCount: number,
  min: number,
  max: number
): SEOCheck {
  let score = 100;
  let passed = true;
  let message = `文字数: ${wordCount}文字（適切）`;

  if (wordCount < min) {
    score = Math.round((wordCount / min) * 100);
    passed = false;
    message = `文字数が不足しています（${wordCount}/${min}文字）`;
  } else if (wordCount > max) {
    score = 80;
    message = `文字数が多すぎます（${wordCount}/${max}文字）`;
  }

  return { name: '文字数', passed, score, message };
}

function checkKeywordDensity(
  content: string,
  keyword: string,
  density: { min: number; max: number }
): SEOCheck {
  if (!keyword) {
    return {
      name: 'キーワード密度',
      passed: true,
      score: 80,
      message: 'キーワードが特定できませんでした',
    };
  }

  const keywordCount = (content.match(new RegExp(keyword, 'gi')) || []).length;
  const totalWords = content.length;
  const keywordDensity = (keywordCount * keyword.length / totalWords) * 100;

  let score = 100;
  let passed = true;
  let message = `キーワード密度: ${keywordDensity.toFixed(2)}%（適切）`;

  if (keywordDensity < density.min) {
    score = 60;
    passed = false;
    message = `キーワード「${keyword}」の出現頻度が低いです（${keywordDensity.toFixed(2)}%）`;
  } else if (keywordDensity > density.max) {
    score = 70;
    passed = false;
    message = `キーワード「${keyword}」の出現頻度が高すぎます（${keywordDensity.toFixed(2)}%）`;
  }

  return { name: 'キーワード密度', passed, score, message };
}

function checkHeadingHierarchy(
  content: string,
  requirements: { level: number; min: number; max?: number }[]
): SEOCheck {
  const h1Count = (content.match(/^# /gm) || []).length;
  const h2Count = (content.match(/^## /gm) || []).length;
  const h3Count = (content.match(/^### /gm) || []).length;

  let score = 100;
  let passed = true;
  const issues: string[] = [];

  // H1チェック
  if (h1Count !== 1) {
    score -= 20;
    passed = false;
    issues.push(`H1は1つである必要があります（現在: ${h1Count}）`);
  }

  // H2チェック
  if (h2Count < 3) {
    score -= 15;
    passed = false;
    issues.push(`H2が3つ以上必要です（現在: ${h2Count}）`);
  }

  // H3チェック
  if (h3Count < 2) {
    score -= 10;
    issues.push(`H3が2つ以上あると良いです（現在: ${h3Count}）`);
  }

  const message = issues.length > 0
    ? issues.join('、')
    : `見出し階層: H1=${h1Count}, H2=${h2Count}, H3=${h3Count}（適切）`;

  return { name: '見出し階層', passed, score: Math.max(0, score), message };
}

function checkMetaTitleLength(title: string, maxLength: number): SEOCheck {
  const length = title.length;
  let score = 100;
  let passed = true;
  let message = `タイトル長: ${length}文字（適切）`;

  if (length > maxLength) {
    score = 70;
    passed = false;
    message = `タイトルが長すぎます（${length}/${maxLength}文字）`;
  } else if (length < 30) {
    score = 80;
    message = `タイトルがやや短いです（${length}文字）`;
  }

  return { name: 'タイトル長', passed, score, message };
}

function checkInternalLinks(content: string, minLinks: number): SEOCheck {
  // 内部リンクパターン（簡易実装：相対URLや特定ドメイン）
  const internalLinkPattern = /\[.*?\]\((?!https?:\/\/)[^\)]+\)/g;
  const internalLinks = content.match(internalLinkPattern) || [];

  let score = 100;
  let passed = true;
  let message = `内部リンク: ${internalLinks.length}件（適切）`;

  if (internalLinks.length < minLinks) {
    score = 60;
    passed = false;
    message = `内部リンクが不足しています（${internalLinks.length}/${minLinks}件）`;
  }

  return { name: '内部リンク', passed, score, message };
}

function checkExternalLinks(content: string, minLinks: number): SEOCheck {
  // 外部リンクパターン
  const externalLinkPattern = /\[.*?\]\(https?:\/\/[^\)]+\)/g;
  const externalLinks = content.match(externalLinkPattern) || [];

  let score = 100;
  let passed = true;
  let message = `外部リンク: ${externalLinks.length}件（適切）`;

  if (externalLinks.length < minLinks) {
    score = 60;
    passed = false;
    message = `外部リンク（参考文献）が不足しています（${externalLinks.length}/${minLinks}件）`;
  }

  return { name: '外部リンク', passed, score, message };
}

function checkImageAlt(content: string): SEOCheck {
  // 画像パターン
  const imagePattern = /!\[([^\]]*)\]\([^\)]+\)/g;
  const images = [...content.matchAll(imagePattern)];

  if (images.length === 0) {
    return {
      name: '画像alt属性',
      passed: true,
      score: 80,
      message: '画像がありません（記事の質向上のため追加を推奨）',
    };
  }

  const imagesWithAlt = images.filter(m => m[1] && m[1].trim().length > 0);
  const ratio = imagesWithAlt.length / images.length;

  let score = Math.round(ratio * 100);
  let passed = ratio >= 0.8;
  let message = passed
    ? `画像alt属性: ${imagesWithAlt.length}/${images.length}（適切）`
    : `画像にalt属性を追加してください（${imagesWithAlt.length}/${images.length}）`;

  return { name: '画像alt属性', passed, score, message };
}

function checkReadability(content: string): SEOCheck {
  // 読みやすさの簡易チェック
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const avgParagraphLength =
    paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;

  let score = 100;
  let passed = true;
  let message = `読みやすさ: 平均段落長${Math.round(avgParagraphLength)}文字（適切）`;

  if (avgParagraphLength > 400) {
    score = 70;
    passed = false;
    message = `段落が長すぎます（平均${Math.round(avgParagraphLength)}文字）。分割を推奨`;
  }

  return { name: '読みやすさ', passed, score, message };
}

// ============================================
// SEO Metadata Generation
// ============================================

/**
 * SEOメタデータを生成
 */
export function generateSEOMetadata(
  article: ArticleDraft,
  options: SEOOptimizationOptions
): SEOMetadata {
  const config = loadContentConfig();

  // メタタイトル生成
  const metaTitle = generateMetaTitle(
    article.title,
    config.seo.maxMetaTitleLength
  );

  // メタディスクリプション生成
  const metaDescription = generateMetaDescription(
    article.content,
    options.targetKeyword,
    config.seo.maxMetaDescriptionLength
  );

  // Schema.org構造化データ生成
  const schema = generateSchema(article, options.schemaType || 'Article');

  // キーワード一覧
  const keywords = [
    options.targetKeyword,
    ...(options.secondaryKeywords || []),
  ];

  return {
    metaTitle,
    metaDescription,
    schema,
    keywords,
  };
}

/**
 * メタタイトルを生成
 */
function generateMetaTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) {
    return title;
  }

  // 長すぎる場合は切り詰め
  return title.slice(0, maxLength - 3) + '...';
}

/**
 * メタディスクリプションを生成
 */
function generateMetaDescription(
  content: string,
  keyword: string,
  maxLength: number
): string {
  // 最初の段落を抽出
  const paragraphs = content.split('\n\n').filter(p =>
    !p.startsWith('#') && p.trim().length > 0
  );

  let description = paragraphs[0] || '';

  // Markdown記法を除去
  description = description
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[>\-*]/g, '')
    .trim();

  // 長さ調整
  if (description.length > maxLength) {
    description = description.slice(0, maxLength - 3) + '...';
  }

  // キーワードが含まれていない場合は追加
  if (keyword && !description.includes(keyword)) {
    const prefix = `${keyword}について徹底解説。`;
    const remaining = maxLength - prefix.length;
    description = prefix + description.slice(0, remaining);
  }

  return description;
}

// ============================================
// Schema.org Generation
// ============================================

/**
 * Schema.org構造化データを生成
 */
export function generateSchema(
  article: ArticleDraft,
  type: 'Article' | 'BlogPosting' | 'NewsArticle' | 'HowTo' | 'FAQ'
): Record<string, unknown> {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    headline: article.title,
    datePublished: article.generatedAt,
    dateModified: article.generatedAt,
    wordCount: article.wordCount,
  };

  switch (type) {
    case 'HowTo':
      return {
        ...baseSchema,
        '@type': 'HowTo',
        name: article.title,
        step: extractHowToSteps(article.content),
      };
    case 'FAQ':
      return {
        ...baseSchema,
        '@type': 'FAQPage',
        mainEntity: extractFAQItems(article.content),
      };
    default:
      return baseSchema;
  }
}

/**
 * HowToステップを抽出
 */
function extractHowToSteps(content: string): Array<{ '@type': string; name: string; text: string }> {
  const steps: Array<{ '@type': string; name: string; text: string }> = [];
  const headingPattern = /^### (.+)$/gm;
  let match;

  while ((match = headingPattern.exec(content)) !== null) {
    steps.push({
      '@type': 'HowToStep',
      name: match[1],
      text: '', // 簡易実装
    });
  }

  return steps;
}

/**
 * FAQ項目を抽出
 */
function extractFAQItems(content: string): Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> {
  const items: Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> = [];
  const questionPattern = /\*\*Q[:\.]?\s*(.+?)\*\*/g;
  let match;

  while ((match = questionPattern.exec(content)) !== null) {
    items.push({
      '@type': 'Question',
      name: match[1],
      acceptedAnswer: {
        '@type': 'Answer',
        text: '', // 簡易実装
      },
    });
  }

  return items;
}

// ============================================
// Article Optimization
// ============================================

/**
 * 記事をSEO最適化
 */
export function optimizeArticle(
  article: ArticleDraft,
  options: SEOOptimizationOptions
): ArticleDraft {
  let optimizedContent = article.content;

  // 1. キーワードの適切な配置
  optimizedContent = optimizeKeywordPlacement(
    optimizedContent,
    options.targetKeyword
  );

  // 2. 見出しの最適化
  optimizedContent = optimizeHeadings(optimizedContent, options.targetKeyword);

  // 3. 内部リンクの追加提案（プレースホルダー）
  optimizedContent = addInternalLinkPlaceholders(optimizedContent);

  return {
    ...article,
    content: optimizedContent,
    status: 'optimized',
  };
}

function optimizeKeywordPlacement(content: string, keyword: string): string {
  // 導入部にキーワードがない場合は追加
  const paragraphs = content.split('\n\n');
  if (paragraphs.length > 1 && !paragraphs[1].includes(keyword)) {
    // 2番目の段落（導入部）にキーワードを自然に追加
    // 実際のAI実装では文脈に応じた追加を行う
  }
  return content;
}

function optimizeHeadings(content: string, keyword: string): string {
  // 見出しにキーワードを含める最適化
  // 実際のAI実装では文脈に応じた変更を行う
  return content;
}

function addInternalLinkPlaceholders(content: string): string {
  // 内部リンクのプレースホルダーを追加
  // 実際の実装では既存記事とのマッチングを行う
  return content;
}

// ============================================
// Improvement Suggestions
// ============================================

/**
 * 改善提案を生成
 */
export function suggestImprovements(checkResult: SEOCheckResult): string[] {
  const suggestions: string[] = [];

  for (const check of checkResult.checks) {
    if (!check.passed) {
      suggestions.push(`[${check.name}] ${check.message}`);
    }
  }

  // 追加の一般的な提案
  if (checkResult.score < 70) {
    suggestions.push('全体的なSEO品質を改善するため、上記の項目を優先的に対応してください');
  }

  return suggestions;
}

// ============================================
// Exports
// ============================================

export {
  checkWordCount,
  checkKeywordDensity,
  checkHeadingHierarchy,
  generateMetaTitle,
  generateMetaDescription,
};
