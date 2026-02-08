#!/usr/bin/env npx ts-node
/**
 * TSIS デモスクリプト
 *
 * キーワードを入力すると：
 * 1. 記事を自動生成
 * 2. SNS投稿テキストを生成（4プラットフォーム）
 * 3. ショート動画台本を生成（3フォーマット）
 *
 * 使い方:
 *   npx ts-node scripts/tsis-demo.ts "AI副業"
 *   npx ts-node scripts/tsis-demo.ts "ChatGPT活用術"
 */

import { runContentPipeline } from '../src/content';
import {
  runDistributionPipeline,
  generateMinimalSummary,
  scriptToMarkdown
} from '../src/distribution';
import * as fs from 'fs';
import * as path from 'path';

// カラー出力
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

function log(msg: string, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function divider() {
  console.log('─'.repeat(60));
}

async function main() {
  const keyword = process.argv[2];

  if (!keyword) {
    log('使い方: npx ts-node scripts/tsis-demo.ts "キーワード"', colors.yellow);
    log('例: npx ts-node scripts/tsis-demo.ts "AI副業"');
    process.exit(1);
  }

  log('\n' + '═'.repeat(60), colors.cyan);
  log('  TSIS (TAISUN SNS Intelligence System) デモ', colors.bright);
  log('═'.repeat(60), colors.cyan);

  log(`\n📝 キーワード: ${keyword}\n`, colors.bright);

  // ============================================
  // Phase 1: コンテンツ生成
  // ============================================
  log('【Phase 1】記事生成中...', colors.cyan);

  const contentResult = await runContentPipeline({
    manualTopic: {
      title: keyword,
      keyword: keyword
    },
    seoScoreThreshold: 70, // デモ用に少し下げる
  });

  if (!contentResult.success || !contentResult.article) {
    log('❌ 記事生成に失敗しました', colors.yellow);
    console.log(contentResult.errors);
    process.exit(1);
  }

  const article = contentResult.article;

  divider();
  log(`✅ 記事生成完了`, colors.green);
  log(`   タイトル: ${article.title}`);
  log(`   文字数: ${article.wordCount}文字`);
  log(`   SEOスコア: ${contentResult.seoCheck?.score || 'N/A'}点`);
  divider();

  // ============================================
  // Phase 2: マルチチャネル配信
  // ============================================
  log('\n【Phase 2】SNS投稿 + 動画台本生成中...', colors.cyan);

  const distribution = await runDistributionPipeline(article, {
    platforms: ['twitter', 'instagram', 'linkedin', 'threads'],
    videoFormats: ['instagram_reels', 'tiktok', 'youtube_shorts'],
    hookPattern: 'question',
    ctaType: 'follow',
  });

  divider();
  log(`✅ 配信コンテンツ生成完了`, colors.green);
  log(`   配信ID: ${distribution.id}`);
  log(`   SNS投稿: ${distribution.snsPosts.length}件`);
  log(`   動画台本: ${distribution.videoScripts.length}件`);
  divider();

  // ============================================
  // 結果表示: SNS投稿
  // ============================================
  log('\n📱 【SNS投稿プレビュー】\n', colors.magenta);

  for (const post of distribution.snsPosts) {
    log(`[${post.platform.toUpperCase()}]`, colors.bright);

    // テキストを60文字で折り返し
    const lines = post.content.text.split('\n').slice(0, 5);
    for (const line of lines) {
      if (line.trim()) {
        console.log(`  ${line.slice(0, 80)}${line.length > 80 ? '...' : ''}`);
      }
    }

    log(`  ハッシュタグ: ${post.content.hashtags.map(t => '#' + t).join(' ')}`, colors.yellow);
    console.log();
  }

  // ============================================
  // 結果表示: 動画台本
  // ============================================
  log('🎬 【動画台本プレビュー】\n', colors.magenta);

  for (const script of distribution.videoScripts) {
    log(`[${script.platform.toUpperCase()}] ${script.title}`, colors.bright);
    log(`  フック (${script.hook.pattern}): "${script.hook.text}"`, colors.cyan);
    log(`  本編: ${script.mainPoints.length}ポイント`);
    script.mainPoints.forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.text.slice(0, 50)}...`);
    });
    log(`  CTA: ${script.cta.text}`, colors.yellow);
    console.log();
  }

  // ============================================
  // ファイル保存
  // ============================================
  const outputDir = path.resolve(process.cwd(), 'output/tsis-demo');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 記事を保存
  const articlePath = path.join(outputDir, `article_${article.id.slice(0, 8)}.md`);
  fs.writeFileSync(articlePath, article.content, 'utf-8');

  // 配信データを保存
  const distPath = path.join(outputDir, `distribution_${distribution.id.slice(0, 8)}.json`);
  fs.writeFileSync(distPath, JSON.stringify(distribution, null, 2), 'utf-8');

  // 動画台本をMarkdownで保存
  for (const script of distribution.videoScripts) {
    const scriptPath = path.join(outputDir, `script_${script.platform}_${script.id.slice(0, 8)}.md`);
    fs.writeFileSync(scriptPath, scriptToMarkdown(script), 'utf-8');
  }

  // ============================================
  // サマリー
  // ============================================
  log('\n' + '═'.repeat(60), colors.cyan);
  log('  完了！', colors.bright);
  log('═'.repeat(60), colors.cyan);

  log('\n📁 出力ファイル:', colors.green);
  log(`   記事: ${articlePath}`);
  log(`   配信データ: ${distPath}`);
  log(`   動画台本: ${outputDir}/script_*.md`);

  log('\n💡 次のステップ:', colors.yellow);
  log('   1. 出力ファイルを確認');
  log('   2. distribution.schedule で配信スケジュールを設定');
  log('   3. distribution.publish で各プラットフォームへ配信');
  console.log();
}

main().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
