# 全SNS分析リサーチ＋記事作成システム 構築提案書

> 調査日: 2026-02-04
> 調査ソース: MCPマーケット / スキルマーケット / Apifyストア / Reddit・Web全体

---

## 1. エグゼクティブサマリー

4つのソースを徹底調査した結果、**MCP（Model Context Protocol）+ Apify + Claude Code Skills**の組み合わせにより、
全SNSプラットフォームのデータ収集・分析からSEO最適化された記事自動生成までを一気通貫で実現するシステムが構築可能であることが判明した。

### 調査結果の数値サマリー

| ソース | 発見数 |
|--------|--------|
| MCPマーケット（mcpmarket.com） | SNS管理345+サーバー、SEO/マーケティング299+サーバー、スクレイピング534+サーバー |
| スキルマーケット（skillsmp.com） | 96,751+スキル、SNS分析・マーケティング・記事作成に直接使えるスキル30+種類 |
| Apifyストア | 14,195+Actor、SNS系スクレイパーTOP25中16件がSNS関連 |
| Web全体（Reddit/GitHub等） | MCP対応SNSサーバー8+種、オープンソース分析ツール10+種 |

---

## 2. システム全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SNS分析 → 記事作成 統合システム                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 1: データ収集層（Apify + MCP + スクレイパー）            │   │
│  │                                                              │   │
│  │  Twitter/X ─── Apify Tweet Scraper V2 / SocialData MCP      │   │
│  │  Instagram ─── Apify Instagram Scraper（公式）/ Ig MCP       │   │
│  │  YouTube ──── Apify YouTube Scraper / YouTube Content MCP    │   │
│  │  TikTok ───── Apify TikTok Scraper / TikTok MCP             │   │
│  │  Facebook ─── Apify Facebook Posts Scraper / Facebook MCP    │   │
│  │  LinkedIn ─── Apify LinkedIn Scraper / LinkedIn MCP          │   │
│  │  Reddit ───── Apify Reddit Scraper / Reddit MCP (PRAW)      │   │
│  │  Pinterest ── Apify Pinterest Search Scraper                 │   │
│  │  Threads ──── Apify Threads Scraper                          │   │
│  │  Bluesky ──── Apify Bluesky Scraper                          │   │
│  │                                                              │   │
│  │  統合アクセス: SociaVault MCP (7プラットフォーム一括)          │   │
│  │  トレンド監視: What's Trending MCP (35+ソース)                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           ↓ 構造化データ(JSON)                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 2: 分析層（Claude Code Skills + AI）                    │   │
│  │                                                              │   │
│  │  SNS分析 ──── Social Media Analyzer Skill                    │   │
│  │  センチメント ─ Brand24 API / Brandwatch（6感情検出）         │   │
│  │  トレンド検出 ─ カスタムNLP + LLM分析                         │   │
│  │  競合分析 ──── IMPACT Influencer Marketing Skills (18個)     │   │
│  │  SEO分析 ──── DataForSEO MCP / SEO-GEO Skills (16個)        │   │
│  │  SERP分析 ─── Semrush MCP / Google Search Console MCP       │   │
│  │  データ集計 ── CSV Data Summarizer Skill                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           ↓ 分析レポート                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 3: コンテンツ生成層（Skills + MCP + CMS）               │   │
│  │                                                              │   │
│  │  企画 ──────── Content Brief Generator Skill                 │   │
│  │  リサーチ ──── Deep Research Skill + Firecrawl Skill         │   │
│  │  記事作成 ──── Content Research Writer Skill                 │   │
│  │  SEO最適化 ── SEO Specialist Skill / Programmatic SEO Skill │   │
│  │  ブランド統一 ─ Content Creator Skill (brand_voice_analyzer) │   │
│  │  動画生成 ──── Short Video Maker MCP                         │   │
│  │  リパーパス ── Content Atomizer Skill                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           ↓ 記事・コンテンツ                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 4: 配信層（CMS MCP + SNS投稿MCP）                      │   │
│  │                                                              │   │
│  │  ブログ公開 ── Ghost CMS MCP / WordPress MCP                 │   │
│  │  記事管理 ──── Notion MCP                                    │   │
│  │  SNS投稿 ──── X API MCP / Ig MCP / LinkedIn Post Creator    │   │
│  │              / Facebook MCP / Social Media Post Generator    │   │
│  │  動画配信 ──── Short Video Maker → TikTok/Reels/Shorts      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Layer 5: 自動化オーケストレーション層                          │   │
│  │                                                              │   │
│  │  ワークフロー ─ n8n MCP Server (525+ノード)                   │   │
│  │  スケジュール ─ Apify Scheduler / n8n Cron                   │   │
│  │  監視 ──────── Context Monitor / Workflow Guard              │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. プラットフォーム別 推奨ツール一覧

### 3.1 Twitter / X

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| ツイート大量取得 | Tweet Scraper V2 (apidojo) | Apify | Pay-per-use |
| 無制限スクレイピング | Twitter Scraper Unlimited (apidojo) | Apify | イベント課金 |
| リアルタイム分析 | SocialData MCP | MCPマーケット | 従量課金 |
| 投稿・管理 | X API MCP Server | MCPマーケット | 無料（API費用別） |
| トレンド分析 | X Trending Topics Scraper | Apify | Pay-per-use |
| フォロワー分析 | X Follower Scraper | Apify | $0.10/1,000件 |

### 3.2 Instagram

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| 総合スクレイピング | Instagram Scraper（公式） | Apify | Pay-per-use |
| プロフィール分析 | Instagram Profile Scraper | Apify | Pay-per-use |
| 投稿分析 | Instagram Post Scraper | Apify | $2.70/1,000件 |
| リール分析 | Instagram Reel Scraper | Apify | Pay-per-use |
| ハッシュタグ分析 | Instagram Hashtag Scraper | Apify | Pay-per-use |
| コメント分析 | Instagram Comments Scraper | Apify | Pay-per-use |
| ビジネスAPI連携 | Ig MCP | MCPマーケット | 無料（API費用別） |

### 3.3 YouTube

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| チャンネル・動画分析 | YouTube Scraper (streamers) | Apify | Pay-per-use |
| コメント分析 | YouTube Comments Scraper | Apify | Pay-per-use |
| 字幕抽出 | YouTube Transcript Scraper | Apify | Pay-per-use |
| コンテンツ分析+AI | YouTube Content Analysis MCP | MCPマーケット | 無料 |
| 字幕取得（APIキー不要） | YouTube Transcript API MCP | MCPマーケット | 無料 |
| ショート動画分析 | YouTube Shorts Scraper | Apify | Pay-per-use |

### 3.4 TikTok

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| 動画・プロフィール取得 | TikTok Scraper (clockworks) | Apify | Pay-per-use |
| 構造化データ抽出 | TikTok Data Extractor | Apify | Pay-per-use |
| ハッシュタグ分析 | TikTok Hashtag Scraper | Apify | Pay-per-use |
| フォロワー分析 | TikTok Followers Scraper | Apify | Pay-per-use |
| バイラリティ分析+AI | TikTok MCP | MCPマーケット | 無料 |

### 3.5 Facebook

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| ページ分析 | Facebook Pages Scraper | Apify | $10/1,000ページ |
| 投稿分析 | Facebook Posts Scraper | Apify | Pay-per-use |
| 広告分析 | Facebook Ads Scraper | Apify | Pay-per-use |
| コメント分析 | Facebook Comments Scraper | Apify | Pay-per-use |
| 投稿・管理+AI | Facebook MCP Server | MCPマーケット | 無料（API費用別） |

### 3.6 LinkedIn

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| プロフィール大量取得 | Mass LinkedIn Profile Scraper | Apify | Pay-per-use |
| 投稿分析 | LinkedIn Post Scraper | Apify | Pay-per-use |
| 投稿自動化 | LinkedIn Post Creator MCP | MCPマーケット | 無料 |
| 企業従業員分析 | LinkedIn Company Employees Scraper | Apify | Pay-per-use |

### 3.7 Reddit

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| 投稿・コメント取得 | Reddit Scraper (trudax) | Apify | Pay-per-use |
| API経由取得 | Reddit API Scraper | Apify | $2/1,000件 |
| エンゲージメント分析 | Reddit MCP (PRAW) | MCPマーケット | 無料 |

### 3.8 Pinterest

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| ピン検索 | Pinterest Search Scraper | Apify | Pay-per-use |
| ボード分析 | Pinterest Board Scraper | Apify | Pay-per-use |
| インサイト分析 | Pinterest Insights Scraper | Apify | Pay-per-use |

### 3.9 新興SNS（Threads / Bluesky）

| 用途 | ツール名 | ソース | 料金 |
|------|----------|--------|------|
| Threads分析 | Threads Scraper (red.cars) | Apify | Pay-per-use |
| Bluesky分析 | Bluesky Scraper (red.cars) | Apify | Pay-per-use |
| Bluesky投稿分析 | Bluesky Posts Scraper | Apify | Pay-per-use |

---

## 4. 推奨Claude Code Skills構成

### 4.1 SNS分析系スキル

| スキル名 | 開発者/リポジトリ | 機能 | 料金 |
|----------|-------------------|------|------|
| Social Media Analyzer | alirezarezvani/claude-skills | 5プラットフォーム分析、エンゲージメント、ROI、競合ベンチマーク | 無料(OSS) |
| IMPACT Influencer Marketing | aaron-he-zhu | 18スキル、5プラットフォーム、インフルエンサー発見〜ROI計算 | 無料(OSS) |
| Social Media Post Generator | alekspetrov/navigator | Threads/X/LinkedIn最適化投稿生成 | 無料(OSS) |
| Social Content | coreyhaines31/marketingskills | LinkedIn/X/Instagram向けコンテンツ最適化 | 無料(OSS) |

### 4.2 SEO・マーケティング系スキル

| スキル名 | 開発者/リポジトリ | 機能 | 料金 |
|----------|-------------------|------|------|
| SEO/GEO Claude Skills | aaron-he-zhu | 16スキル、キーワード〜GEO最適化、AI検索対応 | 無料(OSS) |
| SEO Specialist | MCPマーケット | Core Web Vitals、テクニカル監査、Schemaマークアップ | 無料 |
| Programmatic SEO | coreyhaines31/marketingskills | プログラマティックSEO自動化 | 無料(OSS) |
| Marketing Skills総合 | coreyhaines31/marketingskills | CRO、コピーライティング、広告など10スキル | 無料(OSS) |
| Vibe Skills | thevibemarketer.com | ブランドボイス、キーワードリサーチ、メール等10スキル | $199(買切) |

### 4.3 記事作成・リサーチ系スキル

| スキル名 | 開発者/リポジトリ | 機能 | 料金 |
|----------|-------------------|------|------|
| Content Research Writer | ComposioHQ/awesome-claude-skills | リサーチ付き記事作成、引用追加、フック改善 | 無料(OSS) |
| Content Brief Generator | jamesrochabrun/skills | ライター向けブリーフ自動生成 | 無料(OSS) |
| Content Creator | alirezarezvani/claude-skills | ブランドボイス分析+SEO最適化 | 無料(OSS) |
| Deep Research | ComposioHQ | Gemini Deep Research連携、市場分析、競合調査 | 無料(OSS) |
| Firecrawl Skill | firecrawl.dev | Web情報取得、構造化データ抽出 | 無料 |
| Content Atomizer | thevibemarketer.com | 記事→動画スクリプト・SNS投稿リパーパス | $199に含む |

---

## 5. 推奨MCPサーバー構成

### 5.1 必須級MCPサーバー

| MCPサーバー | 用途 | 料金 |
|-------------|------|------|
| **Apify MCP Server** | 全Apify Actor統合（数千のスクレイパーをMCPから呼出） | Free $5/月〜 |
| **SociaVault** | 7SNS統合分析（Instagram/TikTok/X/Threads/YouTube/Facebook/Reddit） | 無料50クレジット〜 |
| **Bright Data MCP** | エンタープライズ級スクレイピング、プロキシ自動回転 | $10/月〜 |
| **DataForSEO MCP** | キーワード、SERP、バックリンク、ドメイン分析 | 従量課金 |
| **Google Search Console MCP** | 自社サイトSEO分析 | 無料 |
| **What's Trending MCP** | 35+プラットフォームのトレンド監視 | -- |
| **n8n MCP Server** | 525+ノードのワークフロー自動化 | 無料(OSS) |
| **Ghost CMS MCP** | ブログ記事の自動公開 | 無料(Ghost費用別) |

### 5.2 推奨級MCPサーバー

| MCPサーバー | 用途 | 料金 |
|-------------|------|------|
| SocialData MCP | Twitter/X深掘り分析 | 従量課金 |
| YouTube Content Analysis MCP | YouTube動画+AI分析 | 無料 |
| TikTok MCP | TikTokバイラリティ分析+AI | 無料 |
| X API MCP | Twitter投稿・管理 | 無料 |
| Ig MCP | Instagram Business連携 | 無料 |
| LinkedIn Post Creator MCP | LinkedIn投稿自動化 | 無料 |
| Facebook MCP | Facebook管理+AI | 無料 |
| Reddit MCP (PRAW) | Reddit分析 | 無料 |
| Firecrawl MCP | LLM最適化スクレイピング | $16/月〜 |
| Crawl4AI MCP | 無料OSSスクレイピング | 無料(OSS) |
| Short Video Maker MCP | ショート動画自動生成 | 無料(OSS) |
| Notion MCP | コンテンツ企画管理 | 無料 |
| Semrush MCP | 競合分析 | Semrush契約必要 |

---

## 6. コスト試算

### 6.1 最小構成（月額）

| 項目 | 月額 |
|------|------|
| Apify Free Plan | $0（$5クレジット/月） |
| SociaVault 無料枠 | $0（50クレジット） |
| Google Search Console | $0 |
| オープンソースSkills | $0 |
| Crawl4AI / n8n | $0 |
| Claude API使用料 | 使用量による |
| **合計** | **実質$0〜（API使用量のみ）** |

### 6.2 推奨構成（月額）

| 項目 | 月額 |
|------|------|
| Apify Starter Plan | $39 |
| Firecrawl Basic | $16 |
| Bright Data | $10 |
| SociaVault クレジット | 従量 |
| DataForSEO | 従量 |
| Vibe Skills（初月のみ） | $199（買切） |
| Claude API使用料 | 使用量による |
| **合計** | **約$65/月 + 従量課金 + API使用量** |

### 6.3 フルスケール構成（月額）

| 項目 | 月額 |
|------|------|
| Apify Scale Plan | $199 |
| Firecrawl | $16 |
| Bright Data | $10〜 |
| Semrush API | $499〜 |
| DataForSEO | 従量 |
| Ghost CMS Pro | $25 |
| Claude API使用料 | 使用量による |
| **合計** | **約$749/月 + 従量課金** |

---

## 7. 各SNSプラットフォームのAPI制限・注意事項

| SNS | API料金 | レート制限 | 注意点 |
|-----|---------|-----------|--------|
| Twitter/X | Free:500投稿/月、Basic:$100〜、Pro:$5,000〜 | プランにより変動 | 公式APIは高額。Apify/Bright Data経由が現実的 |
| Instagram | 無料（Graph API） | 200コール/時（96%削減後） | ビジネス/クリエイターアカウント必須 |
| YouTube | 無料（Data API v3） | 10,000ユニット/日 | 無料枠で大半のユースケースに対応可能 |
| TikTok | 無料（承認制） | 600リクエスト/分 | Research APIは1,000リクエスト/日 |
| Facebook | 無料（Graph API） | バージョンにより変動 | ビジネス利用はMeta承認必要 |
| LinkedIn | パートナー申請必要 | 非公開 | スクレイピングは500プロフィール/日で警告リスク |
| Reddit | 無料:100リクエスト/分 | 商用:$0.24/1,000コール | 非商用は無料で十分 |
| Pinterest | 無料（承認制） | Trial:日次制限、Standard:300コール/分 | 昇格にはデモ動画提出必要 |

---

## 8. 実装ロードマップ（提案）

### Phase 1: 基盤構築
- [ ] Apify MCPサーバーセットアップ
- [ ] SociaVault MCP接続
- [ ] Google Search Console MCP接続
- [ ] 基本スキルインストール（Social Media Analyzer, SEO/GEO Skills）
- [ ] n8n MCPによるワークフロー基盤構築

### Phase 2: データ収集パイプライン
- [ ] 10プラットフォーム対応スクレイピング設定
- [ ] Apify Actorの選定・テスト
- [ ] データ正規化・構造化パイプライン構築
- [ ] What's Trending MCPによるトレンド監視設定

### Phase 3: 分析エンジン
- [ ] センチメント分析機能実装
- [ ] 競合分析ダッシュボード構築
- [ ] SEO分析パイプライン（DataForSEO + GSC連携）
- [ ] IMPACT Influencer Marketingスキル統合

### Phase 4: コンテンツ生成パイプライン
- [ ] Content Brief Generator → Content Research Writer連携
- [ ] SEO最適化自動適用
- [ ] ブランドボイス統一チェック
- [ ] Ghost/WordPress CMSへの自動公開

### Phase 5: マルチチャネル配信
- [ ] SNS自動投稿（X/Instagram/LinkedIn/Facebook）
- [ ] Short Video Makerによるショート動画生成
- [ ] Content Atomizerによるリパーパス自動化
- [ ] パフォーマンス追跡・フィードバックループ

---

## 9. taisun_agent との統合方針

既存のtaisun_agentのアーキテクチャを活用して統合する方針：

### 9.1 MCP設定（.mcp.json への追加）
```json
{
  "mcpServers": {
    "apify": {
      "url": "https://mcp.apify.com",
      "headers": { "Authorization": "Bearer ${APIFY_TOKEN}" }
    },
    "sociavault": {
      "url": "https://api.sociavault.com/mcp",
      "headers": { "Authorization": "Bearer ${SOCIAVAULT_TOKEN}" }
    },
    "dataforseo": {
      "command": "npx",
      "args": ["dataforseo-mcp-server"],
      "env": { "DATAFORSEO_LOGIN": "${DATAFORSEO_LOGIN}", "DATAFORSEO_PASSWORD": "${DATAFORSEO_PASSWORD}" }
    },
    "google-search-console": {
      "command": "npx",
      "args": ["gsc-mcp-server"],
      "env": { "GSC_CREDENTIALS": "${GSC_CREDENTIALS}" }
    },
    "n8n": {
      "command": "npx",
      "args": ["n8n-mcp-server"]
    },
    "ghost-cms": {
      "command": "npx",
      "args": ["ghost-mcp-server"],
      "env": { "GHOST_URL": "${GHOST_URL}", "GHOST_ADMIN_KEY": "${GHOST_ADMIN_KEY}" }
    }
  }
}
```

### 9.2 スキル配置（.claude/skills/ への追加）
```
.claude/skills/
  ├── sns-analysis/
  │   ├── social-media-analyzer/SKILL.md
  │   ├── influencer-marketing/SKILL.md (18スキル)
  │   └── social-content/SKILL.md
  ├── seo-marketing/
  │   ├── seo-geo-skills/SKILL.md (16スキル)
  │   ├── seo-specialist/SKILL.md
  │   └── programmatic-seo/SKILL.md
  ├── content-creation/
  │   ├── content-research-writer/SKILL.md
  │   ├── content-brief-generator/SKILL.md
  │   ├── content-creator/SKILL.md
  │   └── deep-research/SKILL.md
  └── marketing/
      ├── marketing-skills/SKILL.md (10スキル)
      └── vibe-skills/SKILL.md (10スキル)
```

### 9.3 ワークフロー定義（proxy-mcp/workflow への追加）
```
sns-full-analysis     → 全SNSデータ収集 → 分析 → レポート生成
sns-to-article        → SNSトレンド分析 → 記事企画 → 執筆 → SEO最適化 → 公開
trend-monitoring      → 35+ソーストレンド監視 → アラート → コンテンツ提案
competitor-analysis   → 競合SNS分析 → 差分レポート → 戦略提案
content-repurpose     → 記事 → SNS投稿 × N + ショート動画 生成
```

---

## 10. 主要ソースまとめ

### MCPマーケット
- https://mcpmarket.com/categories/social-media-management (345+サーバー)
- https://mcpmarket.com/categories/marketing-automation (299+サーバー)
- https://mcpmarket.com/categories/web-scraping-data-collection (534+サーバー)
- https://mcpmarket.com/server/sociavault (7SNS統合)
- https://mcpmarket.com/server/socialdata (Twitter分析)

### スキルマーケット
- https://skillsmp.com/ (96,751+スキル)
- https://github.com/alirezarezvani/claude-skills (SNS分析)
- https://github.com/aaron-he-zhu/influencer-marketing-claude-skills (18スキル)
- https://github.com/aaron-he-zhu/seo-geo-claude-skills (16スキル)
- https://github.com/coreyhaines31/marketingskills (マーケティング10スキル)
- https://github.com/ComposioHQ/awesome-claude-skills (リサーチ・コンテンツ)

### Apify
- https://apify.com/store/categories/social-media-scrapers (SNSスクレイパー)
- https://github.com/apify/apify-mcp-server (MCP統合)
- https://github.com/apify/crawlee (OSSスクレイピングFW)

### オープンソース・GitHub
- https://github.com/brightdata/brightdata-mcp (Bright Data MCP)
- https://github.com/tayler-id/social-media-mcp (SNS MCP)
- https://github.com/qeeqbox/social-analyzer (1000+SNS分析)
- https://github.com/taazkareem/twitter-mcp-server (Twitter MCP)

---

> 次のステップ: この提案書をベースに要件定義を作成します。
