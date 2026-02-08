/**
 * TSIS Content Generation Module - Article Writer (Phase 4)
 *
 * 記事執筆: ブリーフから記事本文を生成。
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ContentBrief,
  BriefOutline,
  Reference,
  ArticleDraft,
  ArticleSource,
  HookStrategy,
  CTAType,
  ArticleWritingOptions,
} from './types';
import { loadContentConfig } from './brief-generator';

// ============================================
// Article Writing
// ============================================

/**
 * ブリーフから記事を生成
 */
export function writeArticleFromBrief(
  brief: ContentBrief,
  options?: ArticleWritingOptions
): ArticleDraft {
  const config = loadContentConfig();

  // フック戦略を決定
  const hookStrategy = options?.hookStrategy ||
    (config.article.hookStrategies[0] as HookStrategy);

  // CTA種別を決定
  const ctaType = options?.ctaType ||
    (config.article.ctaTypes[0] as CTAType);

  // 記事を構築
  const contentParts: string[] = [];

  // フック（導入）を生成
  const hook = generateHook(brief.title, brief.targetKeyword, hookStrategy);
  contentParts.push(hook);

  // 各セクションを展開
  for (const outline of brief.outline) {
    const section = expandOutline(outline, brief.references);
    contentParts.push(section);
  }

  // CTAを追加
  const cta = generateCTA(ctaType, brief.targetKeyword);
  contentParts.push(cta);

  // 記事本文を結合
  const content = contentParts.join('\n\n');

  // 文字数をカウント
  const wordCount = countWords(content);

  // 引用元を抽出
  const sources = extractSources(content, brief.references);

  return {
    id: uuidv4(),
    briefId: brief.id,
    generatedAt: new Date().toISOString(),
    title: brief.title,
    content,
    wordCount,
    sources,
    status: 'draft',
  };
}

// ============================================
// Hook Generation
// ============================================

/**
 * フック（導入文）を生成
 */
export function generateHook(
  title: string,
  keyword: string,
  strategy: HookStrategy
): string {
  switch (strategy) {
    case 'problem-statement':
      return generateProblemHook(keyword);
    case 'statistic':
      return generateStatisticHook(keyword);
    case 'story':
      return generateStoryHook(keyword);
    case 'question':
      return generateQuestionHook(keyword);
    case 'controversy':
      return generateControversyHook(keyword);
    default:
      return generateProblemHook(keyword);
  }
}

function generateProblemHook(keyword: string): string {
  return `「${keyword}を始めたいけど、何から手をつければいいかわからない...」

そんな悩みを抱えていませんか？

実は、${keyword}で成功している人の多くも、最初は同じ悩みを抱えていました。しかし、正しい知識と手順さえ知っていれば、誰でも${keyword}をマスターすることができます。

この記事では、${keyword}の基本から実践的なテクニックまで、初心者の方にもわかりやすく解説していきます。`;
}

function generateStatisticHook(keyword: string): string {
  return `**${keyword}市場は2026年に前年比150%の成長を記録しました。**

この数字が示すように、今${keyword}を始めることは大きなチャンスを意味します。

しかし、多くの人が正しい方法を知らないために、その恩恵を受けられていません。

この記事を読めば、${keyword}の本質を理解し、すぐに実践できるようになります。`;
}

function generateStoryHook(keyword: string): string {
  return `3ヶ月前、私は${keyword}について全く知識がありませんでした。

しかし、この記事で紹介する方法を実践したところ、わずか90日で成果を出すことができました。

今日は、私が${keyword}で成功するまでに学んだすべてを、あなたにお伝えします。

一歩ずつ進めていけば、必ず結果はついてきます。`;
}

function generateQuestionHook(keyword: string): string {
  return `**「${keyword}って、本当に効果があるの？」**

この疑問、あなたも一度は考えたことがあるのではないでしょうか。

結論から言うと、${keyword}は正しく実践すれば確実に成果が出ます。

ただし、間違った方法で取り組んでも時間の無駄になるだけ。

この記事では、${keyword}で確実に結果を出すための方法を、具体的なステップに分けて解説します。`;
}

function generateControversyHook(keyword: string): string {
  return `**「${keyword}はもう古い」と言う人がいます。**

しかし、それは大きな間違いです。

確かに、従来のやり方では通用しなくなった部分もあります。しかし、最新のトレンドを押さえた${keyword}は、今でも非常に強力な手法です。

この記事では、2026年に通用する${keyword}の最新戦略をお伝えします。`;
}

// ============================================
// Outline Expansion
// ============================================

/**
 * 見出しからセクションを展開
 */
export function expandOutline(
  outline: BriefOutline,
  references: Reference[]
): string {
  const parts: string[] = [];

  // 見出しを追加
  const headingPrefix = '#'.repeat(outline.level);
  parts.push(`${headingPrefix} ${outline.heading}`);

  // 導入文を生成
  const intro = generateSectionIntro(outline.heading, outline.keyPoints);
  parts.push(intro);

  // キーポイントを展開
  for (const point of outline.keyPoints) {
    const expanded = expandKeyPoint(point, outline.level);
    parts.push(expanded);
  }

  // 参考情報があれば引用
  const relevantRefs = references.filter(r => r.relevanceScore > 0.5);
  if (relevantRefs.length > 0 && outline.level === 2) {
    const citation = insertCitation(relevantRefs[0]);
    parts.push(citation);
  }

  return parts.join('\n\n');
}

/**
 * セクション導入文を生成
 */
function generateSectionIntro(heading: string, keyPoints: string[]): string {
  return `このセクションでは、${keyPoints[0]}について詳しく解説します。`;
}

/**
 * キーポイントを展開
 */
function expandKeyPoint(point: string, level: number): string {
  // レベルに応じてサブ見出しを追加
  if (level === 2) {
    return `### ${point}

${point}は非常に重要なポイントです。以下のことを押さえておきましょう。

- ポイント1: 基本的な考え方
- ポイント2: 実践時の注意点
- ポイント3: よくある間違い`;
  }

  return `${point}について、具体的に見ていきましょう。`;
}

// ============================================
// Citation Handling
// ============================================

/**
 * 引用を挿入
 */
export function insertCitation(reference: Reference): string {
  return `> 参考: [${reference.title}](${reference.url})
>
> ${reference.summary}`;
}

/**
 * 記事から引用元を抽出
 */
function extractSources(
  content: string,
  references: Reference[]
): ArticleSource[] {
  const sources: ArticleSource[] = [];

  for (const ref of references) {
    // コンテンツ内でURLが使用されているか確認
    if (content.includes(ref.url)) {
      sources.push({
        url: ref.url,
        title: ref.title,
        citedAt: [ref.url], // 簡易実装
      });
    }
  }

  return sources;
}

// ============================================
// CTA Generation
// ============================================

/**
 * CTA（行動喚起）を生成
 */
export function generateCTA(type: CTAType, keyword: string): string {
  switch (type) {
    case 'newsletter':
      return generateNewsletterCTA(keyword);
    case 'product':
      return generateProductCTA(keyword);
    case 'consultation':
      return generateConsultationCTA(keyword);
    case 'download':
      return generateDownloadCTA(keyword);
    case 'trial':
      return generateTrialCTA(keyword);
    default:
      return generateNewsletterCTA(keyword);
  }
}

function generateNewsletterCTA(keyword: string): string {
  return `---

## 次のステップ

${keyword}についてもっと学びたい方は、無料メールマガジンに登録してください。

週1回、最新の情報と実践的なテクニックをお届けします。

**[無料で購読する →]**`;
}

function generateProductCTA(keyword: string): string {
  return `---

## ${keyword}を始める準備はできましたか？

私たちのサービスを使えば、${keyword}を今日から始められます。

**[詳細を見る →]**`;
}

function generateConsultationCTA(keyword: string): string {
  return `---

## 個別相談を受け付けています

${keyword}について、あなたの状況に合わせたアドバイスが必要ですか？

無料相談を実施しています。お気軽にお申し込みください。

**[無料相談に申し込む →]**`;
}

function generateDownloadCTA(keyword: string): string {
  return `---

## 無料ガイドをダウンロード

この記事の内容をまとめたPDFガイドを無料でダウンロードできます。

${keyword}を始める際のチェックリスト付き。

**[無料でダウンロード →]**`;
}

function generateTrialCTA(keyword: string): string {
  return `---

## 14日間無料で試してみませんか？

${keyword}ツールを14日間無料でお試しいただけます。

クレジットカード不要。今すぐ始められます。

**[無料トライアルを開始 →]**`;
}

// ============================================
// Utilities
// ============================================

/**
 * 文字数をカウント
 */
export function countWords(content: string): number {
  // Markdown記法を除去
  const plainText = content
    .replace(/#+\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[>\-*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length;
}

/**
 * 記事を分割して読みやすくする
 */
export function improveReadability(content: string): string {
  // 長い段落を分割
  const paragraphs = content.split('\n\n');
  const improved: string[] = [];

  for (const para of paragraphs) {
    if (para.length > 300 && !para.startsWith('#') && !para.startsWith('>')) {
      // 長い段落を分割
      const sentences = para.split('。');
      const midPoint = Math.floor(sentences.length / 2);
      improved.push(sentences.slice(0, midPoint).join('。') + '。');
      improved.push(sentences.slice(midPoint).join('。'));
    } else {
      improved.push(para);
    }
  }

  return improved.join('\n\n');
}

// ============================================
// Exports
// ============================================

export {
  countWords as getWordCount,
};
