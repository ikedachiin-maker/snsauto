---
name: sns-intelligence-system
description: 全SNS分析→記事作成→マルチチャネル配信を統合するTSISオーケストレーションスキル
---

# SNS Intelligence System (TSIS)

## Overview

TAISUN SNS Intelligence System（TSIS）は、10種のSNSプラットフォームからのデータ収集・分析からSEO最適化記事の自動生成・マルチチャネル配信までを統合するオーケストレーションスキル。

## When to Use

- 「SNS分析から記事を作って」と指示された場合
- 全パイプラインの一括実行が必要な場合
- ワークフロー `sns-full-analysis` / `sns-to-article` を実行する場合

## System Architecture

```
Layer 1: データ収集 ──── apify, sociavault, whats-trending
Layer 2: 分析 ────────── social-media-analyzer, seo-geo-optimizer
Layer 3: コンテンツ生成 ─ content-brief-generator, content-research-writer
Layer 4: 配信 ────────── ghost-cms, x-api
Layer 5: 自動化 ──────── n8n-mcp
```

## Available Workflows

### WF-1: sns-full-analysis（全SNS分析）

```
データ収集 → 正規化 → 分析 → レポート生成
```

| Phase | 使用ツール | 出力 |
|-------|-----------|------|
| データ収集 | apify MCP, sociavault MCP | 生データ（JSON） |
| 正規化 | UnifiedPost型変換 | 統一データ |
| 分析 | social-media-analyzer | 分析結果 |
| レポート | Markdown生成 | docs/reports/sns-analysis-YYYYMMDD.md |

### WF-2: sns-to-article（SNS→記事変換）

```
トレンド分析 → 記事企画 → 執筆 → SEO最適化 → CMS公開
```

| Phase | 使用ツール | 出力 |
|-------|-----------|------|
| トレンド | whats-trending MCP | トレンドリスト |
| 企画 | content-brief-generator | ブリーフ（JSON） |
| 執筆 | content-research-writer | 記事（Markdown） |
| SEO | seo-geo-optimizer | SEO最適化済み記事 |
| 公開 | ghost-cms MCP | CMS下書き |

### WF-3: content-repurpose（コンテンツリパーパス）※Phase 5で実装

```
記事 → SNS投稿テキスト × N + ショート動画台本
```

### WF-4: competitor-analysis（競合分析）※Phase 3で実装

```
競合データ収集 → 比較分析 → 差分レポート
```

## Supported Platforms (10)

| Priority | Platform | Collect | Analyze | Post |
|----------|----------|---------|---------|------|
| P1 | Twitter/X | apify + x-api | social-media-analyzer | x-api |
| P1 | Instagram | apify | social-media-analyzer | - |
| P1 | YouTube | apify | social-media-analyzer | - |
| P1 | TikTok | apify | social-media-analyzer | - |
| P2 | Facebook | apify | social-media-analyzer | - |
| P2 | LinkedIn | apify | social-media-analyzer | - |
| P2 | Reddit | apify | social-media-analyzer | - |
| P3 | Pinterest | apify | social-media-analyzer | - |
| P3 | Threads | apify | social-media-analyzer | - |
| P3 | Bluesky | apify | social-media-analyzer | - |

## MCP Servers Used

| MCP Server | Layer | Purpose |
|------------|-------|---------|
| apify | L1 | データ収集（14,000+ Actor） |
| sociavault | L1 | 7SNS統合データアクセス |
| whats-trending | L1 | 35+ソーストレンド監視 |
| bright-data | L1 | エンタープライズスクレイピング |
| dataforseo | L2 | SEO/SERP/キーワード分析 |
| gsc | L2 | Google Search Consoleデータ |
| ghost-cms | L4 | ブログ記事公開 |
| x-api | L4 | Twitter/X投稿管理 |
| short-video | L4 | ショート動画生成 |
| n8n-mcp | L5 | ワークフロー自動化 |

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| social-media-analyzer | L2 | SNSパフォーマンス分析 |
| seo-geo-optimizer | L2-L3 | SEO/GEO最適化 |
| content-brief-generator | L3 | 記事企画・ブリーフ生成 |
| content-research-writer | L3 | リサーチ付き記事執筆 |
| sns-marketing | L4 | SNS投稿戦略（既存スキル） |

## Data Schema

全プラットフォームのデータは `UnifiedPost` 型（`src/types/unified-post.ts`）に正規化される。

## Usage Examples

```
「全SNSの分析レポートを生成して」
  → WF-1: sns-full-analysis を実行

「トレンドから記事を作ってGhostに公開して」
  → WF-2: sns-to-article を実行

「Instagramのエンゲージメント分析をして」
  → social-media-analyzer を単体実行

「"AI副業"のSEO分析とブリーフを作って」
  → seo-geo-optimizer + content-brief-generator を実行
```

## Data Collection Pipeline (Phase 2)

### Apify Actor一覧

| Platform | Actor ID | Priority |
|----------|----------|----------|
| Twitter/X | `apidojo/tweet-scraper` | P1 |
| Instagram | `apify/instagram-scraper` | P1 |
| YouTube | `streamers/youtube-scraper` | P1 |
| TikTok | `clockworks/tiktok-scraper` | P1 |
| Facebook | `apify/facebook-posts-scraper` | P2 |
| LinkedIn | `dev_fusion/linkedin-profile-scraper` | P2 |
| Reddit | `trudax/reddit-scraper` | P2 |
| Pinterest | `easyapi/pinterest-search-scraper` | P3 |
| Threads | `red.cars/threads-scraper` | P3 |
| Bluesky | `red.cars/bluesky-scraper` | P3 |

### 収集手順

1. **Apify MCPで Actor を実行**:
   ```
   Apify MCPの call-actor ツールを使用
   Actor ID: actors.json の actorId を参照
   入力パラメータ: actors.json の defaultInput を参照
   ```

2. **生データの正規化**:
   - 取得した生データ（JSON配列）を `src/sns/normalizer.ts` の正規化ロジックで変換
   - 各プラットフォーム固有のフィールドマッピングは `src/sns/platforms/` に定義
   - エンゲージメント率は統一計算式で再計算: `(likes+comments+shares+saves)/followers*100`
   - タイムスタンプはJST（ISO 8601）に統一

3. **重複排除**:
   - `platform:platformPostId` の組み合わせで一意性判定
   - `src/sns/deduplicator.ts` で処理

4. **出力**:
   - 正規化データ → `output/sns/normalized/`
   - 生データ → `output/sns/raw/`
   - トレンドデータ → `output/sns/trends/`

### スケジュール

| ジョブ | 時刻 (JST) | 内容 |
|--------|-----------|------|
| daily_sns_collection | 06:00 | 全プラットフォーム日次収集 |
| daily_trend_monitor | 07:00 | トレンドデータ日次収集 |

## Configuration Files

| File | Purpose |
|------|---------|
| `.mcp.json` | MCPサーバー接続設定（TSISセクション） |
| `.env` | APIキー・トークン |
| `src/types/unified-post.ts` | 統一データスキーマ |
| `src/sns/` | データ収集パイプライン（Phase 2） |
| `config/sns-collection/actors.json` | Apify Actor設定 |
| `config/sns-collection/collection-config.json` | 収集パラメータ設定 |
| `config/workflows/sns-full-analysis_v1.json` | WF-1定義 |
| `config/workflows/sns-to-article_v1.json` | WF-2定義 |
| `config/content-generation/content-config.json` | コンテンツ生成設定 |
| `docs/SNS_SYSTEM_REQUIREMENTS.md` | 要件定義書 |
| `docs/SNS_ANALYSIS_SYSTEM_PROPOSAL.md` | 提案書 |

## Content Generation Tools (Phase 4)

### コンテンツ生成ツール一覧

| ツール | 機能 | 入力 | 出力 |
|--------|------|------|------|
| `content.brief` | ブリーフ生成 | keyword or TrendTopic | ContentBrief |
| `content.write` | 記事執筆 | ContentBrief | ArticleDraft |
| `content.seo` | SEO最適化 | ArticleDraft | SEOCheckResult + SEOMetadata |
| `content.publish` | CMS公開 | ArticleDraft + SEOMetadata | PublishResult |
| `content.pipeline` | パイプライン一括実行 | keyword or TrendTopic | 全結果 |

### WF-2: SNS→記事変換 パイプライン

```
Phase 0: トレンド分析
  ↓ sns.trends
Phase 1: ブリーフ生成
  ↓ content.brief (content-brief-generator スキル)
Phase 2: 記事執筆
  ↓ content.write (content-research-writer スキル)
Phase 3: SEO最適化
  ↓ content.seo (seo-geo-optimizer スキル)
Phase 4: CMS公開
  ↓ content.publish (ghost-cms MCP)
```

### 使用手順

1. **トレンドからブリーフ生成**:
   ```
   content.brief に trendTopic または keyword を渡す
   → ContentBrief (記事構成・差別化ポイント・SEO要件)
   ```

2. **ブリーフから記事執筆**:
   ```
   content.write に ContentBrief を渡す
   → ArticleDraft (Markdown記事・5000文字目標)
   ```

3. **SEO最適化**:
   ```
   content.seo に ArticleDraft を渡す
   → SEOスコア80点以上で合格
   → SEOMetadata (メタタグ・Schema.org)
   ```

4. **CMS公開**:
   ```
   content.publish に ArticleDraft + SEOMetadata を渡す
   → Ghost CMS MCP経由で下書き保存
   ```

### 一括実行

```
content.pipeline に keyword を渡すだけで
ブリーフ→記事→SEO→公開準備まで自動実行
```

### 出力ファイル

| パス | 内容 |
|------|------|
| `output/content/briefs/` | ブリーフJSON |
| `output/content/articles/` | 記事Markdown |
| `output/content/seo/` | SEOチェック結果 |
| `output/content/publish/` | 公開準備データ |

## Multi-Channel Distribution Tools (Phase 5)

### WF-3: Content Repurpose Pipeline

```
ArticleDraft → Phase 1: SNS投稿生成
                ↓
           SNSRepurposedPost[] → Phase 2: 動画台本生成
                                  ↓
                             VideoScript[] → Phase 3: チャネル最適化
                                               ↓
                                          MultiChannelDistribution → Phase 4: 配信実行
                                                                      ↓
                                                                 DistributionResult
```

### 配信ツール一覧

| ツール | 機能 | 入力 | 出力 |
|--------|------|------|------|
| `distribution.repurpose` | 記事→SNS投稿+動画台本変換 | ArticleDraft | MultiChannelDistribution |
| `distribution.optimize` | チャネル最適化・検証 | distributionId or posts/scripts | ValidationResult |
| `distribution.schedule` | 配信スケジュール設定 | distributionId + strategy | ScheduleResult |
| `distribution.publish` | MCP経由で配信実行 | distributionId | DistributionResult |

### 対応プラットフォーム

| カテゴリ | Platform | 文字数 | ハッシュタグ | 特徴 |
|---------|----------|--------|-------------|------|
| SNS | Twitter/X | 280 | 3 | 簡潔・CTA重視 |
| SNS | Instagram | 2200 | 30 | 詳細・ハッシュタグ多め |
| SNS | LinkedIn | 3000 | 5 | プロフェッショナル |
| SNS | Threads | 500 | 5 | カジュアル・会話調 |
| SNS | Facebook | 63206 | 10 | 詳細OK |
| SNS | Bluesky | 300 | 5 | 簡潔 |
| 動画 | Instagram Reels | - | 30 | トレンディ・視覚重視 |
| 動画 | TikTok | 150 | 5 | カジュアル・テンポ重視 |
| 動画 | YouTube Shorts | - | 3 | プロフェッショナル |

### フックパターン（7種類）

| パターン | 説明 | 例 |
|----------|------|-----|
| question | 疑問形 | 「〇〇って知ってる？」 |
| prohibition | 禁止形 | 「絶対やってはいけない〇〇」 |
| shocking | 衝撃事実 | 「実は〇〇は間違いだった」 |
| number | 数字訴求 | 「たった3分で〇〇」 |
| empathy | 共感型 | 「〇〇で悩んでいませんか？」 |
| contrast | 対比 | 「成功する人と失敗する人の違い」 |
| authority | 権威性 | 「専門家が教える〇〇」 |

### 動画構成（60秒）

```
[0:00-0:05] フック（5秒）   ← 視聴者の興味を引く
[0:05-0:50] 本編（45秒）    ← 3ポイント構成
[0:50-1:00] CTA（10秒）     ← 行動喚起
```

### 使用手順

1. **記事からSNS投稿+動画台本を生成**:
   ```
   distribution.repurpose に ArticleDraft を渡す
   → SNSRepurposedPost[] (4プラットフォーム)
   → VideoScript[] (3フォーマット)
   ```

2. **チャネル最適化・検証**:
   ```
   distribution.optimize に distributionId を渡す
   → 文字数制限チェック
   → ハッシュタグ数調整
   → コンテンツスコア計算
   ```

3. **配信スケジュール設定**:
   ```
   distribution.schedule に distributionId + strategy を渡す
   → immediate: 即時配信
   → staggered: 間隔配信（デフォルト60分）
   → optimized: 最適時間帯配信
   ```

4. **配信実行**:
   ```
   distribution.publish に distributionId を渡す
   → dryRun: true でテスト実行
   → 各プラットフォームへMCP経由で配信
   ```

### 一括実行

```
distribution.repurpose に ArticleDraft を渡すだけで
SNS投稿生成→動画台本生成→最適化→スケジュール設定まで自動実行
```

### 出力ファイル

| パス | 内容 |
|------|------|
| `output/distribution/distribution_{id}.json` | 配信オブジェクト（全データ） |
| `output/distribution/script_{id}.md` | 動画台本（Markdown） |
| `output/distribution/result_{id}.json` | 配信結果 |

### スケジュール

| ジョブ | 時刻 (JST) | 内容 |
|--------|-----------|------|
| daily_distribution | 10:00 | 記事からSNS投稿・動画台本を生成して配信 |
