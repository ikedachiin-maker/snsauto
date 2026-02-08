---
name: content-brief-generator
description: SNS分析データとSEOリサーチを基にライター向け記事ブリーフを自動生成するスキル
---

# Content Brief Generator

## Overview

SNS分析結果・トレンドデータ・SEOリサーチを統合し、記事作成に必要な全情報を網羅したブリーフ（指示書）を自動生成するスキル。content-research-writerの前工程として機能する。

## When to Use

- 「記事の企画を作って」「ブリーフを生成して」と指示された場合
- トレンドデータから記事テーマを提案してほしい場合
- キーワードベースで記事構成案が必要な場合
- 競合コンテンツとの差別化ポイントを見つけたい場合

## Required MCP Servers

- `dataforseo` - キーワードデータ
- `sociavault` - SNSトレンドデータ
- `whats-trending` - リアルタイムトレンド

## Brief Generation Pipeline

```
1. テーマ候補生成
   ├→ トレンドデータから候補5件抽出
   ├→ SEOキーワードリサーチ
   └→ 競合コンテンツギャップ分析

2. テーマ選定・承認
   └→ ユーザーに候補を提示し選択

3. ブリーフ生成
   ├→ ターゲットキーワード確定
   ├→ 記事構成案（H2/H3）生成
   ├→ 参考URL収集
   ├→ SNSデータ引用ポイント提案
   └→ 差別化ポイント明記
```

## Brief Output Format

```json
{
  "brief": {
    "title": "推奨タイトル",
    "targetKeyword": "メインキーワード",
    "secondaryKeywords": ["サブKW1", "サブKW2"],
    "searchVolume": 5400,
    "difficulty": 42,
    "intent": "informational",
    "targetWordCount": 5000,
    "outline": [
      {
        "h2": "見出し1",
        "points": ["要点1", "要点2"],
        "snsDataRef": "Instagram投稿ID xxx のエンゲージメントデータ",
        "subSections": [
          { "h3": "サブ見出し1", "points": ["要点"] }
        ]
      }
    ],
    "references": [
      { "url": "https://...", "title": "参考記事", "relevance": "高" }
    ],
    "differentiators": [
      "競合が扱っていない独自の切り口",
      "SNSデータを引用した定量的な根拠"
    ],
    "snsInsights": [
      {
        "platform": "twitter",
        "insight": "このトピックに関するツイートの感情分析: ポジティブ72%",
        "dataSource": "social-media-analyzer output"
      }
    ],
    "seoRequirements": {
      "metaTitleMaxLength": 60,
      "metaDescMaxLength": 160,
      "minInternalLinks": 2,
      "minExternalLinks": 1,
      "schema": "Article"
    }
  }
}
```

## Usage Examples

```
「今のSNSトレンドから記事テーマを5つ提案して」
「"Claude Code"のキーワードで記事ブリーフを作って」
「競合が書いていない記事のテーマを見つけて」
「YouTubeで話題のAIトピックから記事企画を作って」
```

## Integration

- **入力**: social-media-analyzer / whats-trending MCPの分析結果
- **出力**: content-research-writerへのブリーフ
- **SEO**: dataforseo MCPでキーワードデータ取得
