---
name: content-research-writer
description: SNS分析データとWebリサーチを基にSEO最適化されたブログ記事を自動生成するスキル
---

# Content Research Writer

## Overview

SNS分析結果・トレンドデータ・Webリサーチを統合し、出典付き・SEO最適化済みのブログ記事を自動生成するスキル。Content Brief Generatorで生成されたブリーフを入力として記事を執筆する。

## When to Use

- 「記事を書いて」「ブログ記事を生成して」と指示された場合
- SNSデータを基にした記事作成が必要な場合
- SEO最適化された記事が必要な場合
- 出典・引用付きの記事が必要な場合

## Required MCP Servers

- `apify` - Web情報取得
- `ghost-cms` - 記事公開
- `dataforseo` - SEOデータ参照

## Required Skills

- `content-brief-generator` - ブリーフ生成（前工程）
- `seo-geo-optimizer` - SEO最適化チェック（後工程）

## Writing Pipeline

```
1. ブリーフ受領
   └→ content-brief-generatorの出力を受け取る

2. リサーチ実行
   ├→ Web検索（Firecrawl/Apify経由）
   ├→ SNSデータ参照（social-media-analyzer出力）
   └→ 関連記事・出典の収集

3. 記事構成確定
   ├→ H2/H3見出し構造
   ├→ 各セクションの要点
   └→ 引用・データ挿入ポイント

4. 記事執筆
   ├→ フック（導入部）最適化
   ├→ 本文執筆（指定文字数）
   ├→ 出典・引用の挿入
   └→ CTA（行動喚起）の配置

5. SEO最適化
   ├→ メタタイトル・ディスクリプション生成
   ├→ Schema（JSON-LD）生成
   ├→ SEOスコアチェック
   └→ seo-geo-optimizerでGEO最適化

6. 出力
   ├→ Markdown形式で保存
   └→ Ghost/WordPress CMSに下書き保存（オプション）
```

## Article Quality Standards

| 項目 | 基準 |
|------|------|
| 文字数 | 2,000〜10,000字（指定可） |
| SEOスコア | 80点以上 |
| 出典数 | 3件以上 |
| 画像提案 | セクションごとに1箇所以上 |
| フック | 読者の興味を引く導入部（問題提起/統計データ/ストーリー） |
| CTA | 記事末尾に行動喚起 |

## Output Format

```markdown
---
title: "記事タイトル（60字以内）"
description: "メタディスクリプション（160字以内）"
keywords: ["キーワード1", "キーワード2"]
category: "カテゴリ"
tags: ["タグ1", "タグ2"]
published: false
---

# 記事タイトル

## 導入部（フック）
...

## H2セクション
...

### H3サブセクション
...

## まとめ
...

## 出典
1. [ソースタイトル](URL) - 引用内容
2. ...

<script type="application/ld+json">
{Schema JSON-LD}
</script>
```

## Usage Examples

```
「SNSトレンドを基に"AIエージェント"の記事を5,000字で書いて」
「競合分析結果からコンテンツギャップ記事を生成して」
「YouTube動画の分析データを基にブログ記事にまとめて」
「この記事ブリーフから下書きを生成してGhostに保存して」
```

## Integration

- **入力**: content-brief-generatorの出力（ブリーフ）
- **リサーチ**: apify MCP / Firecrawl でWeb情報取得
- **SNSデータ**: social-media-analyzerの分析結果を引用
- **SEO**: seo-geo-optimizerでスコアチェック
- **公開**: ghost-cms MCPで下書き保存
