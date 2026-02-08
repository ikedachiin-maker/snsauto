---
name: social-media-analyzer
description: 全SNSプラットフォームのパフォーマンス分析・エンゲージメント計測・競合ベンチマーク・ROI分析を実行するスキル
---

# Social Media Analyzer

## Overview

10種のSNSプラットフォーム（Twitter/X, Instagram, YouTube, TikTok, Facebook, LinkedIn, Reddit, Pinterest, Threads, Bluesky）のデータを多角的に分析し、構造化されたレポートを生成するスキル。

## When to Use

- 「SNS分析して」「エンゲージメント分析」「SNSパフォーマンス」と指示された場合
- 競合アカウントの分析が必要な場合
- 投稿パフォーマンスのランキングが必要な場合
- ROI・ROAS計算が必要な場合

## Required MCP Servers

- `apify` - データ収集（Apify Actor経由）
- `sociavault` - 7プラットフォーム統合データアクセス

## Analysis Functions

### 1. エンゲージメント分析

プラットフォーム横断で統一された計算式でエンゲージメント率を算出。

```
エンゲージメント率 = (likes + comments + shares + saves) / followers * 100
```

| 指標 | 説明 |
|------|------|
| Engagement Rate | エンゲージメント率（%） |
| Reach | リーチ数 |
| Impressions | インプレッション数 |
| CTR | クリック率（%） |
| Saves | 保存/ブックマーク数 |

### 2. 投稿パフォーマンスランキング

- プラットフォーム別TOP投稿の自動抽出
- コンテンツタイプ別（テキスト/画像/動画/リール）比較
- 最適投稿時間帯分析（曜日×時間帯ヒートマップ）

### 3. 競合ベンチマーク

- 競合アカウント登録（最大20アカウント/プラットフォーム）
- 投稿頻度・時間帯・コンテンツタイプ比較
- エンゲージメント率比較
- コンテンツ差分分析

### 4. ROI分析

- コスト/エンゲージメント計算
- コスト/クリック計算
- ROAS（広告費用対効果）計算

## Output Format

分析結果はJSON + Markdown形式で出力。

```json
{
  "analysis": {
    "period": { "start": "2026-01-01", "end": "2026-01-31" },
    "platforms": ["twitter", "instagram", "youtube"],
    "metrics": {
      "totalPosts": 150,
      "totalEngagement": 25000,
      "avgEngagementRate": 4.2,
      "topPosts": [...],
      "bestTimeSlots": [...]
    },
    "competitors": [...],
    "recommendations": [...]
  }
}
```

## Usage Examples

```
「先月のSNSパフォーマンスを分析して」
「競合3社のInstagram分析をして」
「YouTube動画のエンゲージメントランキングを出して」
「X（Twitter）の最適投稿時間帯を分析して」
```

## Data Collection (Phase 2)

### Apify Actorによるデータ収集手順

1. Apify MCPの `call-actor` ツールを使用して対象プラットフォームのActorを実行:
   - 設定ファイル: `config/sns-collection/actors.json`
   - Actor実行結果はJSON配列として返却される

2. 取得した生データを正規化:
   - 正規化モジュール: `src/sns/platforms/<platform>.ts`
   - 統一型: `UnifiedPost`（`src/types/unified-post.ts`）

3. 重複排除:
   - `platform:platformPostId` キーで重複検出
   - モジュール: `src/sns/deduplicator.ts`

### プラットフォーム別Actor設定

| Platform | Actor | 備考 |
|----------|-------|------|
| Twitter/X | `apidojo/tweet-scraper` | maxItems=100, sort=Latest |
| Instagram | `apify/instagram-scraper` | resultsLimit=100 |
| YouTube | `streamers/youtube-scraper` | maxResults=100 |
| TikTok | `clockworks/tiktok-scraper` | maxItems=100 |
| Facebook | `apify/facebook-posts-scraper` | maxPosts=100 |
| LinkedIn | `dev_fusion/linkedin-profile-scraper` | maxItems=50 |
| Reddit | `trudax/reddit-scraper` | maxItems=100 |

## Integration

- **データ収集**: Apify MCP経由で各プラットフォームのActorを呼び出し
- **データ正規化**: UnifiedPost型（src/types/unified-post.ts）に変換
- **収集パイプライン**: `src/sns/` モジュール（collector, normalizer, deduplicator）
- **レポート出力**: docs/reports/ にMarkdown形式で保存

## Analysis Tools (Phase 3)

### 分析ツール一覧

| ツール | 機能 | 入力 | 出力 |
|--------|------|------|------|
| `sns.analyze` | 全分析オーケストレーター | UnifiedPost[] | FullAnalysisResult |
| `sns.sentiment` | センチメント分析 | UnifiedPost[] | SentimentResult[] |
| `sns.report` | レポート生成 | UnifiedPost[] | Markdown + JSON |
| `sns.competitors` | 競合分析 | 自社 + 競合投稿 | CompetitorAnalysisResult |

### センチメント分析

ヒューリスティクスベースの日英対応センチメント分析:

```
アルゴリズム:
1. 日英キーワード辞書によるスコアリング（-1.0 〜 +1.0）
2. 絵文字センチメントマップ
3. 否定ハンドリング（"not good" → 反転）
4. 6感情検出（anger/disgust/fear/joy/sadness/surprise）
```

### パフォーマンス分析

```
分析項目:
- プラットフォーム別メトリクス集計
- TOP投稿抽出（エンゲージメント順）
- 最適投稿時間帯（曜日×時間帯ヒートマップ）
- コンテンツタイプ比較
- バズ投稿検出（プラットフォーム平均の3倍以上）
```

### 使用手順

1. **データ収集**（Phase 2ツール使用）:
   ```
   sns.collect でApify Actorを実行 → sns.normalize で正規化
   ```

2. **全分析実行**:
   ```
   sns.analyze に UnifiedPost[] を渡す
   → センチメント・パフォーマンス・ハッシュタグ分析を一括実行
   ```

3. **レポート生成**:
   ```
   sns.report でMarkdownレポートを生成
   → output/sns/reports/ に保存
   ```

4. **競合分析**（オプション）:
   ```
   sns.competitors に自社投稿 + 競合投稿を渡す
   → ギャップ・機会を検出
   ```

### 出力ファイル

| パス | 内容 |
|------|------|
| `output/sns/reports/sns-analysis-YYYYMMDD.md` | Markdownレポート |
| `output/sns/analysis/` | JSON形式の詳細データ |
| `config/sns-collection/competitors.json` | 競合アカウント設定 |
