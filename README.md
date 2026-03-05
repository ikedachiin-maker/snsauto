# TAISUN v2

**Unified Development & Marketing Platform** - AIエージェント、MCPツール、マーケティングスキルを統合した次世代開発プラットフォーム

---

## 🚀 TSIS クイックスタート（SNS自動化）

**TSIS (TAISUN SNS Intelligence System)** - キーワードからSNS投稿＋動画台本を自動生成

### セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/ikedachiin-maker/snsauto.git
cd snsauto

# 2. 依存関係をインストール
npm install

# 3. ビルド
npm run build:all

# 4. デモ実行
npx ts-node scripts/tsis-demo.ts "AI副業"
```

### 出力内容

| 出力 | 内容 |
|------|------|
| 📝 記事（2000文字〜） | SEO対策済みMarkdown |
| 📱 SNS投稿×4 | Twitter, Instagram, LinkedIn, Threads |
| 🎬 動画台本×3 | TikTok, Reels, Shorts（60秒構成） |

### 出力ファイル

```
output/tsis-demo/
├── article_*.md              # 記事本文
├── distribution_*.json       # 配信データ（全体）
├── script_tiktok_*.md        # TikTok台本
├── script_instagram_reels_*.md   # Reels台本
└── script_youtube_shorts_*.md    # Shorts台本
```

### 詳細ドキュメント

👉 [TSIS スキルドキュメント](.claude/skills/sns-intelligence-system/SKILL.md)

---

## 109スキル完全ガイド（14カテゴリ）

> TAISUN Agent v2.30.0 搭載の全109スキルをカテゴリ別に分類。

### スキルの呼び出し方

```
# 方法1: スラッシュコマンド
/skill-name [引数]

# 方法2: 自然言語トリガー
「リサーチして」「LPを作って」「太陽スタイルで書いて」

# 方法3: Skill tool経由
Skill tool → skill: "skill-name", args: "引数"
```

- スキル指定がある場合は **必ずSkill toolを使用**（手動実装は禁止）
- `-free`系スキルはAPIキー不要で動作

---

### 1. リサーチ・情報収集（14スキル）

| スキル | コマンド | 特徴 |
|--------|---------|------|
| **research** | `/research [トピック]` | ワンコマンド深層調査。出典付きレポート自動生成 |
| **research-free** | `/research-free [トピック] [--depth=quick\|standard\|deep]` | APIキー不要。WebSearchのみで動作 |
| **research-cited-report** | 「出典付きレポートを作って」 | 一次情報優先の構造化レポート |
| **mega-research** | `/mega-research [トピック] [--mode=deep\|quick\|news\|trend]` | 6API統合（Tavily/SerpAPI/Brave/NewsAPI/Reddit/Perplexity） |
| **mega-research-plus** | `/mega-research-plus [トピック] [--mode=deep\|quick\|news\|social\|free]` | 8ソース統合。`free`モードでAPIキー不要 |
| **unified-research** | 「リサーチして」「調べて」 | 5API統合リサーチ |
| **world-research** | `/world-research キーワード=[KW]` | 50+プラットフォーム横断（X/Reddit/YouTube/note/Arxiv等）。日英中3言語 |
| **gem-research** | `/gem-research <業界> [--mode=quick\|standard\|deep]` | Marketing AI Factory向け9層リサーチ |
| **gpt-researcher** | リサーチクエリで自動発動 | 自律型Deep Research。50+ソース横断 |
| **dr-explore** | `/dr-explore` | Deep Research探索フェーズ。evidence.jsonl生成 |
| **dr-synthesize** | `/dr-synthesize` | 証拠統合→レポート＋実装計画生成 |
| **dr-build** | `/dr-build` | 実装計画→コード落とし込み |
| **apify-research** | 「Instagramを調査」「Amazon商品をリサーチ」 | Apify MCP経由。SNS/EC/検索エンジンスクレイピング |
| **note-research** | `/note-research ジャンル=[名前]` | note.com特化。トレンド・売れ筋パターン分析。コスト0円 |

---

### 2. 太陽スタイル・コピーライティング（12スキル）

> 日給5000万円を生み出した太陽スタイルのコピーライティング技術群

**メインスキル**

| スキル | コマンド | 用途 |
|--------|---------|------|
| **taiyo-style** | 「太陽スタイルで書いて」 | マスタースキル。対話型コピー・感情のジェットコースター・数値とストーリー融合 |
| **taiyo-analyzer** | 「太陽スタイルで分析して」 | 176パターンに基づく6次元スコアリング（0〜100点） |
| **taiyo-rewriter** | 「太陽スタイルにリライトして」 | スコアに応じて軽微調整〜全面リライト |

**専門スキル**

| スキル | コマンド | 用途 |
|--------|---------|------|
| **taiyo-style-headline** | `/taiyo-style-headline` | ヘッドライン10案自動生成（開封率3.2倍・CTR4.7倍） |
| **taiyo-style-bullet** | `/taiyo-style-bullet` | ブレット・ベネフィットリスト（購買意欲3.8倍） |
| **taiyo-style-lp** | `/taiyo-style-lp` | 12セクション完全準拠LP（成約率4.3倍） |
| **taiyo-style-sales-letter** | `/taiyo-style-sales-letter [商品名]` | 27ブロック構造セールスレター（Sランク品質自動保証） |
| **taiyo-style-step-mail** | `/taiyo-style-step-mail` | 7〜14通ステップメール（6教育要素+心理トリガー） |
| **taiyo-style-vsl** | `/taiyo-style-vsl` | 35〜45分・15章VSL台本（感情曲線設計） |
| **taiyo-style-ps** | `/taiyo-style-ps` | 追伸生成（7つの黄金パターン） |
| **copywriting-helper** | 「セールスレターを書いて」 | テンプレートベースコピー作成 |
| **customer-support-120** | 「120%の返信を作成して」 | 神対応返信生成（6教育要素・2000文字以上） |

---

### 3. LP（ランディングページ）制作（8スキル）

| スキル | コマンド | 特徴 |
|--------|---------|------|
| **lp-design** | 「LP設計して」 | オプトイン/セールス/漫画LP設計。7要素構成テンプレート |
| **lp-full-generation** | `/lp-full-generation` | RAG+ローカルLLMで12セクション全生成（コスト0円）。70点未満は自動再生成 |
| **lp-local-generator** | `/lp-local-generator <section>` | セクション単位のローカル生成。API費用0円 |
| **lp-analysis** | 「LPを分析して」 | 太陽スタイル基準で分析し3フェーズ改善ロードマップ提案 |
| **lp-analytics** | `/lp-analytics` | LP知識ベース（1096チャンク）の統計分析・共通パターン抽出 |
| **lp-json-generator** | 「この画像で文字だけ変えて」 | 参考画像のデザインを維持しながらテキスト差替え |
| **mendan-lp** | 「面談LPを作って」 | 面談申込率50%の4パターン（ストーリー型/タイムライン型/Q&A型/神話崩し型） |
| **figma-design** | FigmaのURLを含める | FigmaデザインからReact/CSSコードをピクセルパーフェクトに生成 |

---

### 4. 動画・コンテンツ制作（10スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **shorts-create** | `/shorts-create [トピック]` | ショート動画全自動制作（リサーチ→スクリプト→画像→音声→レンダリング→検証） |
| **video-agent** | `/video-agent download\|transcribe\|produce` | 統合動画自動化（yt-dlp/Whisper/FFmpeg/Remotion） |
| **youtube-content** | 「YouTube動画の企画・台本作成」 | ショート(60秒)と長尺(10-20分)の台本作成 |
| **youtube-thumbnail** | 「サムネイルを作って」 | CTR向上サムネイル作成ガイド（4パターン） |
| **youtube_channel_summary** | `/youtube_channel_summary [URL]` | チャンネル分析（テーマ・パターン・競合分析） |
| **launch-video** | 「ローンチ動画の台本を作って」 | 4話構成×8パート（各70分）のローンチ動画スクリプト |
| **telop** | `/テロップ [動画種類] [内容]` | ショート動画用テロップ作成（4種類のスタイル） |
| **anime-slide-generator** | `/slides` `/anime-slides` | アニメ風スライド自動生成（NanoBanana Pro+Pillow） |
| **anime-production** | 「アニメ動画作成」 | アニメ動画・広告・キャラクターアニメーション制作 |
| **omnihuman1-video** | 「AIアバター動画を作って」 | 1枚の画像+音声からリップシンクAIアバター動画を生成 |

---

### 5. SNSマーケティング（5スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **sns-marketing** | `make sns-workflow PLATFORM=x` | 5役割分離ワークフロー（戦略→制作→レビュー→投稿→分析） |
| **sns-patterns** | 「SNS投稿を作って」 | X/Instagram/YouTube/noteの投稿パターン・炎上対策 |
| **note-marketing** | 「note記事を作って」 | note.com記事作成＋無料→有料ファネル設計 |
| **line-marketing** | 「LINEステップメッセージを設計して」 | 10日間シナリオ＋リッチメニュー設計 |
| **education-framework** | 「ステップメール設計」 | 6教育要素フレームワーク（目的・問題・解決策・価値・信用・行動） |

---

### 6. セールス・ファネル構築（8スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **funnel-builder** | `/funnel-builder [platform]` | Kindle/note/YouTube/SNS→LINE→VSLファネル統合構築 |
| **sales-systems** | 「VSLスクリプトを作って」 | VSL・セミナー台本・個別相談トーク設計 |
| **kindle-publishing** | 「Kindle本を書いて」 | 10章構成・1章3000-5000文字の電子書籍作成 |
| **lead-scoring** | 「リードをスコアリングして」 | 4次元スコアリング（HOT/WARM/COLD/DISQUALIFIED） |
| **outreach-composer** | 「リードにメッセージを送って」 | LINE/メール/SMS/音声でパーソナライズメッセージ送信 |
| **ai-sdr** | `/workflow-start sdr_pipeline_v1` | 自律型営業AI（リード取込→スコアリング→4チャネル自動送信） |
| **voice-ai** | 「アウトバウンドコール自動化」 | Twilio+OpenAI音声AIで電話発信・IVR・SMS自動化 |
| **customer-support-120** | 「120%の返信を作成して」 | 神対応カスタマーサポート返信生成 |

---

### 7. 画像生成・デザイン（6スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **nanobanana-pro** | 「画像を生成して」 | Gemini NanoBanana Proでテキスト→画像生成 |
| **nanobanana-prompts** | 「画像プロンプトを作って」 | NanoBanana向け最適化プロンプト生成（フェイススワップ等） |
| **custom-character** | 「キャラクター画像を作って」 | キャラクター一貫性を保ったバリエーション生成 |
| **diagram-illustration** | 「図解を作って」 | フロー図・比較図・構造図等のインフォグラフィック生成 |
| **agentic-vision** | `/agentic-vision` | Gemini 3 Flashで画像・動画の高度分析 |
| **figma-design** | FigmaのURLを含める | Figmaデザインからコード生成 |

---

### 8. URL分析（2スキル）

| スキル | コマンド | 特徴 |
|--------|---------|------|
| **url-all** | `/url-all <URL> [--mode=quick\|standard\|deep\|competitive\|seo\|audit\|links]` | ローカルLLM完全把握。Playwright MCP + Ollamaで7モード・7層分析。APIキー不要 |
| **url-deep-analysis** | `/url-deep-analysis <URL> [--depth=1\|2\|3] [--mode=full\|structure\|design\|content\|links]` | 5層完全解析。WebFetch・Playwright・curlを自動選択 |

---

### 9. キーワード・SEO（4スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **keyword-free** | `/keyword-free <シードKW>` | APIキー不要キーワード抽出（WebSearchのみ） |
| **keyword-mega-extractor** | `/keyword-mega-extractor <シードKW>` | 複数API統合8タイプキーワード大量抽出 |
| **keyword-to-gem** | `/keyword-to-gem <キーワード>` | KW→SNS横断検索→NotebookLM→Gem作成まで全自動 |

---

### 10. 設計・ドキュメント（SDD系 12スキル）

> Spec-Driven Development: 仕様駆動開発の完全パイプライン

**推奨実行順序:**
```
/sdd-stakeholder → /sdd-context → /sdd-glossary → /sdd-event-storming
→ /sdd-req100 → /sdd-design → /sdd-slo → /sdd-threat
→ /sdd-tasks → /sdd-runbook → /sdd-guardrails → /sdd-adr
```

**一括実行:** `/sdd-full [spec-slug]` — 7成果物を依存順に自動生成（C.U.T.E.スコア>=98目標）

| スキル | 出力 | 役割 |
|--------|------|------|
| **sdd-stakeholder** | stakeholder-map.md | ステークホルダー特定（Power/Interest Grid・RACI） |
| **sdd-context** | business-context.md | ビジネス目標整合（PR-FAQ・OKR・Impact Map） |
| **sdd-glossary** | glossary.md | 用語辞書（DDD Ubiquitous Language） |
| **sdd-event-storming** | event-storming.md | ドメイン知識可視化（Events・Commands・Aggregates） |
| **sdd-req100** | requirements.md | 要件定義（EARS準拠・105点満点スコアリング） |
| **sdd-design** | design.md | アーキテクチャ設計（C4 Model・Arc42） |
| **sdd-slo** | slo.md | SLI/SLO/SLA定義（Prometheusルール付き） |
| **sdd-threat** | threats.md | STRIDE脅威分析（リスクスコアリング・DFD図） |
| **sdd-tasks** | tasks.md | タスク分解（1-4時間粒度・Mermaidガント） |
| **sdd-runbook** | runbook.md | 運用手順書（SEV1-4定義・コピペ実行コマンド） |
| **sdd-guardrails** | guardrails.md | AIエージェント安全設計（権限境界・監査証跡） |
| **sdd-adr** | adr-XXX.md | 技術選択記録（MADR形式・代替案3つ以上） |

---

### 11. 開発・DevOps（10スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **batch** | `/batch <タスク>` | git worktreeで並列エージェントチームによる大規模変更 |
| **dual-ai-review** | `/dual-ai-review` | 2AI並列レビュー（実装AI+検証AI）。バグ30-60%削減 |
| **context7-docs** | プロンプトに「use context7」 | React/Next.js/Tailwind等の最新公式ドキュメント取得 |
| **security-scan-trivy** | 「脆弱性スキャンして」 | Trivyセキュリティスキャン |
| **docker-mcp-ops** | 「Dockerを操作して」 | MCP経由Dockerコンテナ管理 |
| **phase1-tools** | `make setup` / `make verify` | ドキュメント処理ツール群管理（Pandoc/Marp/Gotenberg） |
| **phase2-monitoring** | 「監視を設定して」 | Prometheus/Grafana/Loki監視スタック管理 |
| **opencode-fix** | 「バグを修正して」 | mistakes.md参照→再発防止チェック→最小差分修正 |
| **opencode-ralph-loop** | `/opencode-ralph-loop` | OpenCode反復開発ループ（max-iterations必須） |
| **opencode-setup** | 「OpenCodeをセットアップしたい」 | OpenCode CLI導入・設定ガイド |

---

### 12. メモリ・知識管理（4スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **hierarchical-memory** | 「これを長期記憶に保存して」 | 3層階層メモリ（ショート/ロング/エピソード）。精度26%向上 |
| **qdrant-memory** | 「これを覚えておいて」 | Qdrantベクターデータベースでセマンティック検索・永続記憶 |
| **notion-knowledge-mcp** | Notion保存・検索時 | Notion MCP経由で知識の検索・追記・整理 |
| **agent-trace** | `/agent-trace` | AI生成コードの帰属追跡・統計・レポート |

---

### 13. 営業自動化（5スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **ai-sdr** | `/workflow-start sdr_pipeline_v1` | 自律型営業AI（リード→スコアリング→4チャネル送信） |
| **lead-scoring** | 「リードをスコアリングして」 | 4次元HOT/WARM/COLD分類 |
| **outreach-composer** | 「リードにメッセージを送って」 | パーソナライズアウトリーチ（LINE/Email/SMS/Voice） |
| **voice-ai** | 「アウトバウンドコール自動化」 | Twilio+OpenAIで電話自動化 |
| **workflow-automation-n8n** | n8nワークフロー設計依頼 | n8n自動化ワークフロー設計（6要素分解） |

---

### 14. その他ユーティリティ（9スキル）

| スキル | コマンド | 用途 |
|--------|---------|------|
| **pdf-processing** | 「PDFを読んで」 | PDF処理（テキスト抽出/テーブル取得/結合/分割/OCR） |
| **pdf-automation-gotenberg** | 「PDFに変換して」 | HTML/Office/URL→PDF変換（Gotenberg） |
| **doc-convert-pandoc** | 「ドキュメントを変換して」 | Pandocフォーマット変換（Markdown→PDF等） |
| **japanese-tts-reading** | `/japanese-tts-reading` | 日本語テキスト→音声変換（4エンジン対応） |
| **skill-validator** | `/skill-validator [パス]` | スキルファイル品質検証（0-100スコア） |
| **unified-notifications-apprise** | 通知送信依頼 | Email/Discord/Telegram等マルチ通知 |
| **postgres-mcp-analyst** | 「PostgreSQLを分析して」 | MCP経由PostgreSQL分析 |
| **udemy-download** | `/udemy-download <URL>` | Udemyコースダウンロード |
| **kaitori-price-fetch** | `/kaitori-price-fetch` | 買取比較くん定価自動取得 |

---

### ストーリーパターン（物語YouTube台本 5種）

| スキル | パターン | 構造 |
|--------|---------|------|
| **story-pattern-delayed-rescue** | 遅れて届く救い型 | 10幕構成 |
| **story-pattern-flawed-hero** | 傷ある主人公型 | 9幕構成 |
| **story-pattern-inner-conflict** | 内なる葛藤型 | 9幕構成 |
| **story-pattern-systemic-wall** | 組織の壁型 | 9幕構成 |
| **story-pattern-witness-reversal** | 逆転の証人型 | 9幕構成 |

```
# 呼び出し例
/story-pattern-delayed-rescue テーマ:介護 主人公:30代男性 舞台:地方の病院
```

---

### よくある使い方の組み合わせ（パイプライン例）

**Kindle出版:**
```
/keyword-free [テーマ] → /research-free [テーマ] → /kindle-publishing → /nanobanana-pro
```

**LP制作:**
```
/research [商品テーマ] → /taiyo-style-headline → /lp-full-generation → /taiyo-analyzer → /taiyo-rewriter
```

**YouTube動画:**
```
/youtube_channel_summary [競合URL] → /youtube-content → /shorts-create [トピック] → /youtube-thumbnail
```

**営業自動化:**
```
/lead-scoring → /outreach-composer → /ai-sdr → /voice-ai
```

**新サービス設計:**
```
/sdd-full [プロジェクト名]
# または: /sdd-stakeholder → /sdd-context → /sdd-req100 → /sdd-design → /sdd-tasks
```

---

[![CI](https://github.com/taiyousan15/taisun_agent/actions/workflows/ci.yml/badge.svg)](https://github.com/taiyousan15/taisun_agent/actions/workflows/ci.yml)
[![Security Scan](https://github.com/taiyousan15/taisun_agent/actions/workflows/security.yml/badge.svg)](https://github.com/taiyousan15/taisun_agent/actions/workflows/security.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-775%20passing-brightgreen)](https://github.com/taiyousan15/taisun_agent/actions)

---

> **2026-02-03: v2.10.0 defer_loading最適化 & システム強化 🚀**
>
> Context消費を70%削減する`defer_loading`最適化と、研究ツール・パイプラインスキルを大幅に強化しました。
>
> ### 新機能
> | 機能 | 説明 |
> |------|------|
> | ⚡ **defer_loading統合** | MCPを必要時のみロード（コンテキスト70%削減） |
> | 🔍 **Apify MCP追加** | SNS/EC/検索エンジンスクレイピング対応 |
> | 💰 **コスト警告システム** | API消費MCPの事前警告フック |
> | 🎯 **スキルマッピング拡張** | 10→19マッピング（自動スキル選択強化） |
> | 📋 **MCPプリセット** | marketing/video/research/developmentなど6プリセット |
>
> ### 新規スキル・コマンド
> | スキル/コマンド | 説明 |
> |----------------|------|
> | `/marketing-full` | マーケティング統合パイプライン（要件定義→LP→セールスレター→画像） |
> | `/video-course` | 動画コース作成パイプライン |
> | `/sdd-full-pipeline` | SDD完全パイプライン（8フェーズ） |
> | `apify-research` | ApifyによるSNS/検索/ECスクレイピング |
>
> ### MCPプリセット切り替え
> ```bash
> ./scripts/switch-mcp.sh marketing     # マーケティング向け
> ./scripts/switch-mcp.sh video         # 動画制作向け
> ./scripts/switch-mcp.sh research      # リサーチ向け
> ./scripts/switch-mcp.sh full-optimized # フル構成（defer_loading最適化）
> ```
>
> ### アップグレード
> ```bash
> cd ~/taisun_agent && git pull origin main && npm install && npm run build:all && npm run taisun:diagnose
> ```

---

> **2026-02-02: v2.9.3 Mac/Windows両対応 & SDD完全版 🖥️**
>
> Mac/Windows両方で確実に動作するセットアップガイドと、Spec-Driven Development (SDD) の完全版を追加しました。
>
> ### 新機能
> | 機能 | 説明 |
> |------|------|
> | 🪟 **Windows完全対応** | 開発者モード/管理者権限/コピー方式の3つの方法を提供 |
> | 🍎 **Mac/Windows統一ガイド** | 両OS向けの明確なインストール・アップデート手順 |
> | 📋 **SDD完全版** | 8つの新スキル（design/tasks/threat/slo/runbook/adr/guardrails/full） |
> | 🎯 **成熟度レベル** | L1-L5の5段階で仕様の完成度を管理 |
>
> ### 新規SDDスキル（8個）
> | スキル | コマンド | 説明 |
> |--------|---------|------|
> | sdd-design | `/sdd-design <slug>` | C4モデル設計書 |
> | sdd-tasks | `/sdd-tasks <slug>` | Kiro形式タスク分解 |
> | sdd-threat | `/sdd-threat <slug>` | STRIDE脅威モデル |
> | sdd-slo | `/sdd-slo <slug>` | SLO/SLI/SLA定義 |
> | sdd-runbook | `/sdd-runbook <slug>` | インシデント対応 |
> | sdd-adr | `/sdd-adr "<title>" <slug>` | 技術決定記録(ADR) |
> | sdd-guardrails | `/sdd-guardrails <slug>` | AIガードレール |
> | sdd-full | `/sdd-full <slug>` | 全成果物一括生成 |
>
> ### アップグレード
> ```bash
> cd ~/taisun_agent && git pull origin main && npm install && npm run build:all && npm run taisun:diagnose
> ```

---

> **2026-02-01: v2.9.2 企業向けプレゼン資料 & インストールガイド改善 📊**
>
> Deep Researchを活用した企業向けプレゼン資料の自動生成機能と、正しいインストール方法のガイドを追加しました。
>
> ### 新機能
> | 機能 | 説明 |
> |------|------|
> | 📊 **プレゼン資料自動生成** | 業界別活用事例・専門用語解説付きのPDFスライド生成 |
> | 🔍 **Deep Research統合** | 競合調査・市場分析を自動化してプレゼンに反映 |
> | 📖 **できること/できないこと明確化** | システムの限界を正直に文書化 |
>
> ### 重要：正しいインストール方法
>
> **taisun_agentは1つだけ**インストール。プロジェクトごとにコピーする必要はありません。
>
> #### 方法1: Plugin形式（推奨・最も簡単）
> ```bash
> /plugin marketplace add taiyousan15/taisun_agent
> /plugin install taisun-agent@taisun-agent
> ```
> アップデート: `/plugin update taisun-agent`
>
> #### 方法2: 自然言語でインストール
> Claude Codeで以下をコピペ：
> ```
> taisun_agentをインストールまたはアップデートして
> ```
>
> #### 他のプロジェクトで使う場合
> ```bash
> ln -s ~/taisun_agent/.claude .claude
> ln -s ~/taisun_agent/.mcp.json .mcp.json
> ```
> **重要**: 両方のリンクが必要です（MCPサーバーを使うため）
>
> これで68スキル・85エージェント・227 MCPツールが全て使えます。
>
> ### TAISUNでできないこと（限界）
> - 単独では動作しない（Claude Code必須）
> - 24時間自律稼働（人間の監視が必要）
> - 100%正確な情報（ハルシネーションの可能性あり）
> - 専門資格が必要な判断（医療診断、法的助言等）
> - 物理的な作業、電話対応、契約締結
>
> 詳細は[プレゼン資料](docs/TAISUN_PRESENTATION.md)を参照

---

> **2026-02-01: v2.9.1 ドキュメント整合性修正 🔧**
>
> 第三者配布時の信頼性向上のため、ドキュメントと実際のスキル構成を完全に同期しました。
>
> ### 修正内容
> | 項目 | 説明 |
> |------|------|
> | 📝 **削除済みスキル参照修正** | sales-letter, step-mail, vsl等の参照を正しいスキル名に更新 |
> | 🎬 **Video Agent統合反映** | 12個の個別スキル → `video-agent` 統合をドキュメントに反映 |
> | 📊 **スキル数修正** | 83 → 66（実際のアクティブスキル数） |
> | 🌐 **フォルダ名英語化** | `テロップ` → `telop`（クロスプラットフォーム対応） |
>
> ### アップグレード（既存ユーザー）
> ```bash
> cd taisun_agent
> git pull origin main
> npm install && npm run build:all
> npm run taisun:diagnose        # 98/100点以上で成功
> ```
>
> ### 新規インストール（5分）
> ```bash
> git clone https://github.com/taiyousan15/taisun_agent.git
> cd taisun_agent && npm install && npm run build:all
> npm run perf:fast              # 推奨: 高速モード
> npm run taisun:diagnose        # 98/100点以上で成功
> ```

---

> **2026-02-01: v2.9.0 Kindle Content Empire & Video Agent統合 📚🎬**
>
> Kindle本→note記事→YouTube動画のマルチプラットフォーム自動展開を支援する要件定義システムを追加しました。
>
> ### 新機能
> | 機能 | 説明 |
> |------|------|
> | 📚 **Kindle Content Empire** | Kindle本取得→オリジナル本生成→KDP出品→note記事→YouTube動画の自動化要件定義 |
> | 🎬 **Video Agent統合** | video-download, video-transcribe等12スキルを1つの`video-agent`に統合 |
> | 🔍 **VLM画像OCR** | 画像9割のKindle本もQwen-VLで正確に読み取り（要約なし転写） |
> | 🔐 **Amazon認証自動化** | Cookie-based認証（1年有効）+ TOTP自動化 |
>
> ### Kindle Content Empire 100点要件定義
> `.kiro/specs/kindle-content-empire/requirements.md` に25の機能要件を定義:
> - REQ-001〜016: Kindle抽出・オリジナル本生成・ePub変換・note記事・YouTube動画
> - REQ-900〜903: 処理速度30分以内・可用性99%・90日データ保持
> - REQ-950〜951: APIキー管理・ログマスキング
> - REQ-960〜962: 構造化ログ・進捗監視・エラーアラート
>
> ### 使い方
> ```bash
> # 要件定義100点を達成
> /sdd-req100 kindle-content-empire
> /score-req100 .kiro/specs/kindle-content-empire/requirements.md
>
> # Video Agent統合スキル
> /video-agent                   # 動画パイプライン全体
> ```
>
> ### アップグレード（既存ユーザー）
> ```bash
> cd taisun_agent
> git pull origin main
> npm install && npm run build:all
> npm run perf:fast
> npm run taisun:diagnose
> ```
>
> ### 新規インストール
> ```bash
> git clone https://github.com/taiyousan15/taisun_agent.git
> cd taisun_agent && npm install && npm run build:all
> npm run perf:fast              # 推奨: 高速モード
> npm run taisun:diagnose        # 100/100点で成功
> ```

---

> **2026-01-31: v2.8.0 Deep Research & 要件定義スキル追加 🔬📋**
>
> 「〇〇をリサーチして」で深層調査、「要件定義を作って」でEARS準拠の要件定義が作れるようになりました。
>
> ### 新スキル（7個）
> | スキル | 説明 |
> |--------|------|
> | 🔬 **research** | ワンコマンド深層調査（`/research AIエージェントの最新動向`） |
> | 🔍 **dr-explore** | 探索・収集フェーズ（evidence.jsonl生成） |
> | 📊 **dr-synthesize** | 検証・統合→レポート生成 |
> | 🛠️ **dr-build** | 実装計画をPoC/MVP/Productionに落とし込む |
> | ⚙️ **dr-mcp-setup** | MCPサーバーのセットアップ支援 |
> | 📋 **sdd-req100** | EARS準拠の要件定義生成＋C.U.T.E.自動採点（目標98点） |
>
> ### 新コマンド（2個）
> | コマンド | 説明 |
> |----------|------|
> | `/req100` | spec-slugを自動推論してコマンドを提示 |
> | `/score-req100` | 既存requirements.mdを再採点 |
>
> ### 使い方
> ```bash
> # 深層調査
> /research AIエージェントの最新動向
>
> # 要件定義（EARS準拠 + 自動採点）
> /sdd-req100 my-feature
> /req100                    # spec-slug推論ヘルパー
> /score-req100 .kiro/specs/my-feature/requirements.md
> ```
>
> ### アップグレード（既存ユーザー）
> ```bash
> cd taisun_agent
> git pull origin main
> npm install && npm run build:all
> npm run taisun:diagnose
> ```
>
> ### 新規インストール
> ```bash
> git clone https://github.com/taiyousan15/taisun_agent.git
> cd taisun_agent && npm install && npm run build:all
> npm run perf:fast              # 推奨: 高速モード
> npm run taisun:diagnose        # 100/100点で成功
> ```
>
> 詳細: [research/README.md](research/README.md) | [.kiro/specs/README.md](.kiro/specs/README.md)

---

> **2026-01-30: v2.7.2 メモリ最適化・安定性向上 🚀**
>
> 長時間セッションでのメモリ不足クラッシュ（heap out of memory）を解決しました。
>
> ### 新機能
> | 機能 | 説明 |
> |------|------|
> | 🧠 **メモリ最適化** | Node.jsヒープサイズ8GB対応 |
> | ⚡ **高速モード** | `npm run perf:fast` でフック81%削減 |
> | 🔧 **安定起動** | `claude-stable` エイリアス追加 |
>
> ### アップグレード（既存ユーザー）
> ```bash
> cd taisun_agent
> git pull origin main
> npm install && npm run build:all
> npm run perf:fast              # 高速モード有効化
> echo 'export NODE_OPTIONS="--max-old-space-size=8192"' >> ~/.zshrc
> source ~/.zshrc
> npm run taisun:diagnose        # 100/100点で成功
> ```
>
> ### 新規インストール（5分）
> ```bash
> git clone https://github.com/taiyousan15/taisun_agent.git
> cd taisun_agent && npm install && npm run build:all
> npm run perf:fast              # 推奨: 高速モード
> npm run taisun:diagnose        # 100/100点で成功
> ```
>
> 詳細: [docs/PERFORMANCE_MODE.md](docs/PERFORMANCE_MODE.md) | [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

> **2026-01-30: v2.7.1 テスト安定化・配布品質向上 🔧**
>
> 他の環境でもテストが確実に通過するよう**権限問題を修正**しました。
>
> ### 修正内容
> - ワークフローテストをOS一時ディレクトリで実行（権限問題を回避）
> - 並列テスト実行時の分離を強化
> - 全775テストが新規インストール環境で通過

---

> **2026-01-29: v2.7.0 GitHub配布対応・診断システム追加 🚀**
>
> 世界中の誰でも5分でインストールできる**GitHub配布対応**を完了しました。
>
> ### 新機能
> | 機能 | 説明 |
> |------|------|
> | 🔧 **自動診断** | `npm run taisun:diagnose` で13層防御・82エージェント・77スキルを一括検証 |
> | 📖 **5分インストール** | [INSTALL.md](INSTALL.md) でクイックスタート |
> | 🏗️ **アーキテクチャ文書** | [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) で.mdファイル参照順序を解説 |
> | 🎯 **セットアッププロンプト** | [TAISUN_SETUP_PROMPTS.md](TAISUN_SETUP_PROMPTS.md) で初期設定を支援 |
>
> 詳細: [INSTALL.md](INSTALL.md) | [DISTRIBUTION_GUIDE.md](DISTRIBUTION_GUIDE.md)

---

> **2026-01-21: v2.6.0 13層防御システム完成・新スキル追加 🛡️**
>
> AIの暴走を完全に防止する**13層防御システム**を完成させ、新しいスキルとMCP統合を追加しました。
>
> ### 13層防御システム
> | Layer | Guard | 機能 |
> |-------|-------|------|
> | 0 | CLAUDE.md | 絶対遵守ルール |
> | 1-7 | Core Guards | 状態注入・権限・編集・スキル制御 |
> | 8-9 | Safety Guards | 文字化け防止・インジェクション検出 |
> | 10-12 | Quality Guards | スキル自動選択・定義検証・品質ガイド |
>
> ### 新スキル・MCP統合
> - **diagram-illustration**: 図解・インフォグラフィック作成
> - **taiyo-analyzer**: 176パターンコピーライティング品質分析
> - **context7-docs**: 最新ドキュメント取得（ハルシネーション防止）
> - **gpt-researcher**: 自律型深層リサーチ
> - **hierarchical-memory**: Mem0ベース3層メモリアーキテクチャ

---


> **2026-01-18: v2.5.1 システム総合検証・安定化リリース 🎯**
>
> システム全体の動作検証と安定化を行い、**本番環境対応**の品質を達成しました。
>
> ### 検証済みコンポーネント
> - **82 Agents**: 全エージェント動作確認済み
> - **70 Skills**: 全スキル定義検証済み
> - **13 Hooks**: 構文・実行テスト通過
> - **227 MCP Tools**: 統合テスト完了
>
> ### 修正内容
> - **Auto-save閾値最適化**: 50KB→15KB（より積極的なコンテキスト節約）
> - **MCP Proxy cold start対応**: 初期状態での誤検知を修正
> - **Agent Enforcement Guard**: 複雑タスク検出・Task tool強制機能
>
> ### インストール・アップデート
> ```bash
> git clone https://github.com/taiyousan15/taisun_agent.git
> cd taisun_agent && npm install && npm run build:all
> ./scripts/test-agents.sh  # 動作確認
> ```
>
> 詳細: [DISTRIBUTION_GUIDE.md](DISTRIBUTION_GUIDE.md)

---

> **2026-01-15: v2.4.0 Workflow Guardian Phase 3 - 並列実行・条件分岐 🚀**
>
> ワークフローシステムに**Phase 3機能**を追加し、より複雑なワークフローをサポートします。
>
> ### 新機能
> - **並列実行**: 複数フェーズの同時実行をサポート
> - **条件分岐**: 動的なワークフロー制御
> - **高度なロールバック**: フェーズ単位での安全な巻き戻し
>
> ### ドキュメント
> - [docs/WORKFLOW_PHASE3_QUICKSTART.md](docs/WORKFLOW_PHASE3_QUICKSTART.md) - クイックスタート
> - [CHANGELOG.md](CHANGELOG.md) - 詳細な変更履歴

---

> **2026-01-12: Workflow Guardian Phase 2 - AIの暴走を防ぐ厳格モード 🛡️**
>
> AIが勝手にワークフローのフェーズをスキップしたり、危険な操作を実行するのを**完全に防止**する
> Workflow Guardian Phase 2を実装しました。
>
> ### 主要機能
> - **Strict Mode**: `--strict`フラグで厳格な強制モードを有効化
> - **Skill Guard**: 許可されていないスキルの実行を自動ブロック
> - **Hooks System**: 危険なBashコマンド・ファイル操作を事前防止
> - **状態管理**: セッション跨ぎでワークフロー進捗を永続化
>
> ### セキュリティ保護
> **ブロック対象**:
> - `rm -rf`, `git push --force`, `DROP TABLE`等の危険コマンド
> - `.env`, `secrets/`, `.git/`等の重要ファイル編集
> - 現在フェーズで許可されていないスキル実行
>
> ### 2つのモード
> ```bash
> # Phase 1 (デフォルト): Advisory - 警告のみ
> npm run workflow:start -- video_generation_v1
>
> # Phase 2: Strict - 完全強制
> npm run workflow:start -- video_generation_v1 --strict
> ```
>
> ### ドキュメント
> - [docs/WORKFLOW_STATE_MANAGEMENT.md](docs/WORKFLOW_STATE_MANAGEMENT.md) - 完全ガイド
> - [docs/WORKFLOW_PHASE2_DESIGN.md](docs/WORKFLOW_PHASE2_DESIGN.md) - 設計書
>
> **推奨**: 本番環境・重要なワークフローではstrict modeを使用してください。

---

> **2026-01-11: OpenCode/OMO統合 - 任意で使えるセカンドエンジン 🤖**
>
> 難しいバグ修正やTDD自動化を支援する**OpenCode/OMO統合**を追加しました。
> 完全opt-in設計で、使いたい時だけ明示的に有効化できます。
>
> ### 新機能
> - **memory_add(content_path)**: 大量ログをファイルから直接保存（コンテキスト節約99%）
> - **/opencode-setup**: セットアップ確認と導入ガイド
> - **/opencode-fix**: バグ修正支援（mistakes.md統合 + セッション回収）
> - **/opencode-ralph-loop**: TDD自動反復開発（デフォルト無効）
> - **環境診断拡張**: `npm run doctor`でOpenCode状態を確認
>
> ### セキュリティ
> - **Path Traversal防止**: プロジェクト外ファイル読み込み不可
> - **Size Limit**: 10MB制限でDoS防止
> - **UTF-8 Validation**: 文字化けファイル自動検出
>
> ### ドキュメント
> - [docs/opencode/README-ja.md](docs/opencode/README-ja.md) - OpenCode/OMO導入ガイド
> - [docs/opencode/USAGE-ja.md](docs/opencode/USAGE-ja.md) - 使用例・ベストプラクティス
>
> ### 使用例
> ```bash
> # 環境確認
> npm run doctor
>
> # バグ修正相談
> /opencode-fix "DBコネクションプールが枯渇するバグ"
>
> # ログは自動的にmemory_addに保存（会話に含めない）
> # → コンテキスト消費: 100KB → 50トークン（99.8%削減）
> ```
>
> **重要**: OpenCodeは完全オプショナルです。インストールしなくてもTAISUNは100%動作します。

---

> **2026-01-09: コンテキスト最適化システム強化 🚀**
>
> 書き込み操作の最適化により、コンテキスト使用量を**70%削減**できるようになりました。
>
> ### 新機能
> - **自動監視**: ファイルサイズ・コンテキスト使用率の自動チェック
> - **Agent委託ガイド**: 5KB/20KB/50KB閾値による最適化提案
> - **バッチ処理**: 3-5ファイルごとに/compact推奨
> - **警告システム**: 60%/75%/85%で段階的警告
>
> ### ドキュメント
> - [CONTEXT_MANAGEMENT.md](docs/CONTEXT_MANAGEMENT.md) - 読み取り最適化（99%削減）
> - [CONTEXT_WRITE_OPTIMIZATION.md](docs/CONTEXT_WRITE_OPTIMIZATION.md) - 書き込み最適化（70%削減）
> - [context-monitor.js](.claude/hooks/context-monitor.js) - 自動監視フック
>
> ### 効果
> ```
> Before: 113KB生成 → 83k tokens (41%)
> After:  113KB生成 → 15-25k tokens (8-12%)
> 削減:   約60k tokens (70%削減)
> ```

---

> **2026-01-08: Windows完全対応リリース 🎉**
>
> Windows環境で100%動作することを保証するアップデートをリリースしました。
>
> ### アップデート方法
> ```powershell
> cd taisun_agent
> git pull origin main
> npm install
> ```
>
> ### 新機能
> - **自動環境診断**: `npm run setup:windows` で環境をチェック
> - **改行コード統一**: .gitattributes による自動統一（CRLF/LF問題を解決）
> - **Node.js版スクリプト**: シェルスクリプト不要
> - **詳細ガイド**: 475行の [Windows専用セットアップガイド](docs/WINDOWS_SETUP.md)
>
> ### Windows環境での使い方
> ```powershell
> npm run setup:windows  # 環境診断
> npm install
> npm test               # 775テスト全通過を確認
> npm run mcp:health     # MCP設定チェック
> ```
>
> 詳細: [docs/WINDOWS_SETUP.md](docs/WINDOWS_SETUP.md)

---

> **2026-01-07: セキュリティ強化アップデート**
>
> MCPツールの入力検証とインジェクション防止機能を追加しました。
>
> ### アップデート方法
> ```bash
> cd taisun_agent
> git pull origin main
> npm install
> ```
>
> ### セキュリティ修正内容
> - **Chrome パス検証**: コマンドインジェクション防止（ホワイトリスト検証）
> - **JSON プロトタイプ汚染対策**: `__proto__`等の危険キー自動除去
> - **スキル名検証**: パストラバーサル攻撃防止（CWE-22）
> - **メモリ入力検証**: DoS防止（サイズ制限・サニタイズ）
>
> ### 新規ユーティリティ
> - `src/utils/safe-json.ts` - 安全なJSONパーサー

---

> **2026-01-07: UTF-8安全対策をリリースしました**
>
> 日本語/マルチバイト文字を含むファイルの編集時にクラッシュ・文字化けが発生する問題への対策を追加しました。
>
> ### 新機能
> - **safe-replace**: Unicode安全な置換ツール
> - **utf8-guard**: 文字化け自動検知
> - **品質ゲート強化**: CIでエンコーディングチェック
>
> 詳細: [docs/operations/text-safety-ja.md](docs/operations/text-safety-ja.md)

---

## はじめての方へ

> **重要**: TAISUN v2は **Claude Code の拡張機能** です。
> インストール後、68のスキルと85のエージェントが自動的に使えるようになります。

---

## 🚀 セットアップガイド（Mac / Windows 両対応）

```
┌─────────────────────────────────────────────────────────────────────┐
│  全ての操作は「Claude Codeのチャットにコピペ」するだけ！             │
│  ターミナル操作は不要です                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🍎 Mac ユーザー

### 📦 Step 1: インストール（初回のみ）

Claude Codeのチャットに**以下を丸ごとコピペ**：

```
以下のコマンドを順番に実行して：
cd ~
git clone https://github.com/taiyousan15/taisun_agent.git
cd taisun_agent
npm install
npm run build:all
npm run taisun:diagnose
```

**完了の目安**: 「98/100点」以上が表示されれば成功

> **自動スキルインストール**: インストール時にスキル（sdd-req100等）が `~/.claude/skills/` に自動コピーされます。
> これにより、**どのプロジェクトでも** `/sdd-req100` などのスキルがすぐに使えます。

### 🔄 アップデート（Macユーザー）

```
以下のコマンドを実行して：
cd ~/taisun_agent && git pull origin main && npm install && npm run build:all && npm run taisun:diagnose
```

### 📁 プロジェクトで使えるようにする（Mac）

使いたいプロジェクトのフォルダでClaude Codeを起動し、**以下を丸ごとコピペ**：

```
以下のコマンドを実行して：
ln -s ~/taisun_agent/.claude .claude && ln -s ~/taisun_agent/.mcp.json .mcp.json && echo "✅ 完了"
```

**完了の目安**: 「✅ 完了」と表示され、フォルダに`.claude`と`.mcp.json`が見える

---

## 🪟 Windows ユーザー

### 📦 Step 1: インストール（初回のみ）

Claude Codeのチャットに**以下を丸ごとコピペ**：

```
以下のコマンドを順番に実行して：
cd ~
git clone https://github.com/taiyousan15/taisun_agent.git
cd taisun_agent
npm install
npm run build:all
npm run taisun:diagnose
```

**完了の目安**: 「98/100点」以上が表示されれば成功

> **自動スキルインストール**: インストール時にスキル（sdd-req100等）が `~/.claude/skills/` に自動コピーされます。
> これにより、**どのプロジェクトでも** `/sdd-req100` などのスキルがすぐに使えます。

### 🔄 アップデート（Windowsユーザー）

```
以下のコマンドを実行して：
cd ~/taisun_agent && git pull origin main && npm install && npm run build:all && npm run taisun:diagnose
```

### 📁 プロジェクトで使えるようにする（Windows）

**⚠️ 重要: Windowsではシンボリックリンクの設定が必要です**

#### 方法A: 開発者モード有効化（推奨）

1. **Windowsの設定を開く**
   - 設定 → 更新とセキュリティ → 開発者向け → **開発者モード ON**

2. Claude Codeで以下をコピペ：
```
以下のコマンドを実行して：
export MSYS=winsymlinks:nativestrict && ln -s ~/taisun_agent/.claude .claude && ln -s ~/taisun_agent/.mcp.json .mcp.json && echo "✅ 完了"
```

#### 方法B: 管理者コマンドプロンプト使用

1. **管理者としてコマンドプロンプトを開く**
   - スタートメニュー → 「cmd」を検索 → 右クリック → **管理者として実行**

2. 以下を実行（`your-project`は実際のパスに置き換え）：
```cmd
cd C:\Users\YourName\your-project
mklink /D .claude C:\Users\YourName\taisun_agent\.claude
mklink .mcp.json C:\Users\YourName\taisun_agent\.mcp.json
```

#### 方法C: フォルダをコピー（最も確実）

シンボリックリンクがうまくいかない場合：

```
以下のコマンドを実行して：
cp -r ~/taisun_agent/.claude .claude && cp ~/taisun_agent/.mcp.json .mcp.json && echo "✅ 完了"
```

> **注意**: この方法ではアップデート時に再度コピーが必要です

---

## ✅ 動作確認（Mac / Windows 共通）

```
taisun:diagnose もう一回実行して
```

**完了の目安**: 「98/100点」以上で全項目正常

---

## 🎉 これで完了！

**68スキル・85エージェント・227 MCPツール** が使えるようになりました。

普通に日本語で話しかけるだけで全機能が使えます：
- 「セールスレターを書いて」
- 「LP分析して」
- 「YouTubeサムネイルを作って」

---

## 🌐 グローバルスキル（どのプロジェクトでも使用可能）

`npm run setup` 実行時に、以下のスキルが `~/.claude/skills/` に自動インストールされます。

### 自動インストールされるスキル

| スキル | コマンド | 説明 |
|--------|---------|------|
| **sdd-req100** | `/sdd-req100` | 100点満点の要件定義を作成（EARS準拠） |
| **sdd-full** | `/sdd-full` | 完全なSDD（設計書一式）を一括生成 |
| **sdd-design** | `/sdd-design` | C4モデル設計書 |
| **sdd-adr** | `/sdd-adr` | アーキテクチャ決定記録 |
| **sdd-threat** | `/sdd-threat` | STRIDE脅威モデル |
| **sdd-slo** | `/sdd-slo` | SLO/SLI/SLA定義 |
| **sdd-runbook** | `/sdd-runbook` | 運用手順書 |
| **sdd-guardrails** | `/sdd-guardrails` | AIガードレール |
| **sdd-tasks** | `/sdd-tasks` | Kiro形式タスク分解 |
| **gpt-researcher** | `/gpt-researcher` | 自律型深層リサーチ |
| **research** | `/research` | ワンコマンド調査 |
| **dual-ai-review** | `/dual-ai-review` | AI二重レビュー |
| **taiyo-analyzer** | `/taiyo-analyzer` | 太陽スタイル品質分析 |
| **lp-analysis** | `/lp-analysis` | LP成約率改善分析 |
| **nanobanana-pro** | `/nanobanana-pro` | AI画像生成 |

### 別プロジェクトでの使用

一度インストールすれば、**taisun_agentをリンクしていないプロジェクトでも**スキルが使えます：

```bash
cd ~/任意のプロジェクト
claude

# スキルが使える！
> /sdd-req100 my-feature
> /research AIエージェントの最新動向
```

### 手動でスキルを再インストール

```bash
cd ~/taisun_agent
npm run setup
```

---

## 🔌 上級者向け: Plugin形式

Claude Code v2.1.0以降で使用可能（Mac / Windows 共通）：

```bash
/plugin marketplace add taiyousan15/taisun_agent
/plugin install taisun-agent@taisun-agent
```

**アップデート：** `/plugin update taisun-agent`


---

### ❓ よくある質問・トラブルシューティング

#### 共通の問題

| 状況 | 解決方法 |
|------|---------|
| 「already exists」エラー | 正常です！アップデートコマンドを実行してください |
| 「heap out of memory」エラー | `メモリ設定を最適化して（NODE_OPTIONS 8GB）` |
| ビルドエラー | `taisun_agentをクリーンインストールして` |
| 「command not found: claude」 | まずClaude Code CLIをインストール: https://claude.ai/code |
| スキルが使えない | `このフォルダでtaisun_agentを使えるようにして` |

#### 🪟 Windows特有の問題

| 状況 | 解決方法 |
|------|---------|
| `.claude`フォルダが見えない | 方法B（管理者コマンドプロンプト）または方法C（コピー）を試す |
| 「シンボリックリンクの作成に失敗」 | 開発者モードを有効にするか、管理者権限で実行 |
| `ln -s`が動かない | `export MSYS=winsymlinks:nativestrict`を先に実行 |
| パスに日本語が含まれる | 英語のみのパスにtaisun_agentをインストール |
| 改行コードエラー | `git config core.autocrlf false`を実行してから再clone |

#### 🍎 Mac特有の問題

| 状況 | 解決方法 |
|------|---------|
| 権限エラー | `chmod -R 755 ~/taisun_agent` を実行 |
| Xcode要求 | `xcode-select --install` を実行 |

#### 「Invalid API key - Please run /login」エラー

**原因**: MCPサーバーが環境変数を読み込めていない

**解決策**: `~/.zshrc`に以下を追加して`source ~/.zshrc`を実行:

```bash
export OPENAI_API_KEY="sk-xxxxxxxxxxxx"
export TAVILY_API_KEY="tvly-xxxxxxxxxxxx"
export FIGMA_API_KEY="figd_xxxxxxxxxxxx"
```

または`~/.claude/settings.json`に追加:
```json
{
  "env": {
    "OPENAI_API_KEY": "sk-xxxxxxxxxxxx",
    "TAVILY_API_KEY": "tvly-xxxxxxxxxxxx"
  }
}
```

詳細: [docs/API_KEY_TROUBLESHOOTING.md](docs/API_KEY_TROUBLESHOOTING.md)

---

詳細: [INSTALL.md](INSTALL.md) | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

### 🏆 検定後のスコアを100点にする方法

TAISUN v2には自動診断システムがあり、スキル・MCP・エージェントの動作状況を100点満点で採点します。

#### 現在のスコアを確認

```bash
npm run taisun:diagnose
```

#### スコア採点基準

| 項目 | 配点 | 内容 |
|------|------|------|
| 13層防御システム | 30点 | 全21フック正常動作 |
| MCPサーバー接続 | 25点 | 36サーバー中の接続率 |
| スキル定義検証 | 20点 | 66スキルのYAML構文・必須フィールド |
| エージェント定義 | 15点 | 82エージェントの定義検証 |
| ビルド状態 | 10点 | TypeScriptコンパイル成功 |

#### 100点達成チェックリスト

```bash
# ステップ1: クリーンビルド（最重要）
rm -rf node_modules dist
npm install
npm run build:all

# ステップ2: 高速モード有効化
npm run perf:fast

# ステップ3: メモリ最適化
echo 'export NODE_OPTIONS="--max-old-space-size=8192"' >> ~/.zshrc
source ~/.zshrc

# ステップ4: 診断実行
npm run taisun:diagnose
```

#### よくある減点原因と対処法

| 減点 | 原因 | 対処法 |
|------|------|--------|
| -10〜20点 | ビルド未実行 | `npm run build:all` |
| -5〜15点 | node_modules破損 | `rm -rf node_modules && npm install` |
| -5点 | 高速モード未有効 | `npm run perf:fast` |
| -5点 | MCPサーバー未起動 | `.env`のAPI KEYs確認 |
| -3点 | 古いキャッシュ | `rm -rf dist && npm run build:all` |

#### MCP個別のスコアを確認

```bash
# MCPサーバーの接続状態を詳細確認
npm run mcp:health

# 特定MCPのデバッグ
MCP_DEBUG=true npm run proxy:smoke
```

#### スキル定義の修正

```bash
# スキル定義の構文チェック
npm run skills:validate

# エラーがある場合は該当スキルを修正
# .claude/skills/[スキル名]/skill.yml を編集
```

#### 98点以上で合格

| スコア | 状態 |
|--------|------|
| **100点** | 完璧 🎉 全機能正常動作 |
| **98-99点** | 合格 ✅ 本番利用可能 |
| **90-97点** | 要確認 ⚠️ 一部機能に問題 |
| **90点未満** | 要修正 ❌ クリーンインストール推奨 |

#### 詳細診断

```bash
# 詳細モードで原因を特定
npm run taisun:diagnose:full

# 個別コンポーネント診断
npm run taisun:diagnose -- --hooks    # フックのみ
npm run taisun:diagnose -- --mcps     # MCPのみ
npm run taisun:diagnose -- --skills   # スキルのみ
```

---

### 📋 要件定義スキル（sdd-req100）で100点を取る方法

EARS準拠の要件定義を作成し、C.U.T.E.（Completeness/Unambiguity/Testability/EARS）で自動採点します。

#### 基本の使い方

```bash
# 要件定義を自動生成（目標98点以上）
/sdd-req100 my-feature

# 既存の要件定義を再採点
/score-req100 .kiro/specs/my-feature/requirements.md
```

#### C.U.T.E.採点基準（100点満点）

| 項目 | 配点 | 内容 |
|------|------|------|
| **C: Completeness** | 25点 | 必須セクション・フィールドの網羅性 |
| **U: Unambiguity** | 25点 | 曖昧語の排除（「適切」「最適」等NG） |
| **T: Testability** | 25点 | GWT形式の受入テスト記載 |
| **E: EARS** | 25点 | EARSパターン準拠の要件文 |

#### 100点達成の必須条件

```
✅ 必須セクションがすべて存在
   - 目的/スコープ/用語集/前提/機能要件/非機能要件/セキュリティ/運用/未解決事項

✅ 全REQに必須フィールドが存在
   - 種別/優先度/要件文(EARS)/受入テスト(GWT)/例外処理

✅ 全REQの要件文がEARSパターンに一致

✅ 全REQに受入テスト(GWT形式)が存在

✅ 曖昧語が0個

✅ 未解決事項が0件
```

#### EARSパターン（必須）

| パターン | 構文 | 例 |
|----------|------|-----|
| 普遍 | システムは...しなければならない。 | システムは入力を5秒以内に処理しなければならない。 |
| イベント駆動 | ...とき、システムは...しなければならない。 | ユーザーがログインボタンを押したとき、システムは認証を開始しなければならない。 |
| 状態駆動 | ...の間、システムは...しなければならない。 | ファイルアップロード中の間、システムは進捗バーを表示しなければならない。 |
| 望ましくない挙動 | ...場合、システムは...しなければならない。 | APIが503を返した場合、システムは3回まで再試行しなければならない。 |
| オプション | ...が有効な場合、システムは...しなければならない。 | 2段階認証が有効な場合、システムはSMSコードを要求しなければならない。 |

#### GWT形式の受入テスト（必須）

```markdown
**受入テスト:**
- Given: ユーザーがログインフォームを表示している
- When: 正しいメールアドレスとパスワードを入力してログインボタンを押す
- Then: ダッシュボード画面に遷移し、「ようこそ」メッセージが表示される
```

#### よくある減点と対処法

| 減点 | 原因 | 対処法 |
|------|------|--------|
| -1〜25点 | 曖昧語の使用 | 「適切」→「5秒以内」、「高速」→「100ms以下」に具体化 |
| -3点/REQ | 受入テストなし | 全REQにGWT形式で追加 |
| -2点/REQ | EARS非準拠 | 上記パターンに書き換え |
| -3点/セクション | 必須セクション欠落 | テンプレートに沿って追加 |
| -2点/件 | 未解決事項あり | 質問を解決するか、仮置きで前提に明記 |

#### 禁止語リスト（一部）

以下の曖昧語は使用禁止（1出現につき-1点）:

```
適切、最適、よしなに、できるだけ、可能な限り、高速、
適宜、ユーザーフレンドリー、十分な、必要に応じて、
柔軟に、スムーズに、シームレスに、直感的に
```

#### 改善ループ

```bash
# 1. 初回生成
/sdd-req100 my-feature

# 2. スコアを確認（score.jsonに出力）
cat .kiro/specs/my-feature/score.json

# 3. 改善点を確認（critique.mdに出力）
cat .kiro/specs/my-feature/critique.md

# 4. requirements.mdを修正後、再採点
/score-req100 .kiro/specs/my-feature/requirements.md
```

#### 合格基準

| スコア | 状態 |
|--------|------|
| **100点** | 完璧 🎉 未解決事項なし・曖昧さゼロ |
| **98-99点** | 合格 ✅ 実装可能な品質 |
| **90-97点** | 要改善 ⚠️ 改善ループ継続 |
| **90点未満** | 不十分 ❌ 大幅な見直し必要 |

---

### 使い方（超簡単）

```bash
cd ~/taisun_agent
claude  # Claude Code を起動
```

**あとは普通に会話するだけ:**

```
あなた: 「セールスレターを書いて」
Claude: /taiyo-style-sales-letter スキルで作成します...

あなた: 「このコードをレビューして」
Claude: code-reviewer エージェントで分析します...
```

### 3. 詳細ガイド

| ドキュメント | 内容 |
|-------------|------|
| [INSTALL.md](INSTALL.md) | **5分クイックインストール** ⭐ |
| [TAISUN_SETUP_PROMPTS.md](TAISUN_SETUP_PROMPTS.md) | 初期設定・検証プロンプト集 |
| [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) | システムアーキテクチャ・.md参照順序 |
| [QUICK_START.md](docs/QUICK_START.md) | 詳細セットアップ手順 |
| [WINDOWS_SETUP.md](docs/WINDOWS_SETUP.md) | **Windows 専用**セットアップガイド（100%動作保証） |
| [CONTEXT_MANAGEMENT.md](docs/CONTEXT_MANAGEMENT.md) | コンテキスト管理システム完全ガイド（99%削減の仕組み） |
| [opencode/README-ja.md](docs/opencode/README-ja.md) | OpenCode/OMO 任意導入ガイド（opt-in セカンドエンジン） |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | エラー解決 |
| [CONFIG.md](docs/CONFIG.md) | 設定カスタマイズ |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | 開発参加方法 |

---

## Overview

TAISUN v2は、Claude Codeと連携し、設計から実装、テスト、デプロイ、マーケティングまでを一貫して支援する**統合開発・マーケティングプラットフォーム**です。

```
┌─────────────────────────────────────────────────────────────┐
│                    TAISUN v2 Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │   Claude    │◄──│  Proxy MCP  │──►│  36 External │       │
│  │    Code     │   │   Server    │   │  MCP Servers │       │
│  └─────────────┘   └──────┬──────┘   └─────────────┘       │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         ▼                 ▼                 ▼              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │ 82 Agents   │   │  82 Skills  │   │ 82 Commands │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### System Statistics

| Component | Count | Description |
|-----------|-------|-------------|
| **AI Agents** | 82 | 専門家エージェント (AIT42 + Taiyou + Diagnostics) |
| **Skills** | 66 | マーケティング・インフラ自動化スキル |
| **Hooks** | 21 | 13層防御システム（21ファイル） |
| **Commands** | 84 | ショートカットコマンド（OpenCode統合含む） |
| **MCP Servers** | 36 | 外部サービス連携 |
| **MCP Tools** | 227 | 統合ツール群 |
| **Source Lines** | 11,167 | TypeScript (proxy-mcp) |
| **Tests** | 775 | ユニット・統合テスト（全Pass） |

## Key Features

### 1. Single MCP Entrypoint (Proxy MCP)

5つのツールで32+の外部MCPサーバーを統合管理:

```typescript
// 5 Public Tools
system_health   // ヘルスチェック
skill_search    // スキル検索
skill_run       // スキル実行
memory_add      // コンテンツ保存
memory_search   // コンテンツ検索
```

### 2. Hybrid Router

- **ルールベース安全性**: 危険操作の自動検出・ブロック
- **セマンティック検索**: 類似度ベースのMCP選択
- **人間承認フロー**: 高リスク操作のエスカレーション

### 3. Multi-Agent System (82 Agents)

| Category | Count | Examples |
|----------|-------|----------|
| **Coordinators** | 5 | ait42-coordinator, omega-aware-coordinator, initialization-orchestrator |
| **Diagnostics & Recovery** | 5 | system-diagnostician, error-recovery-planner, environment-doctor 🆕 |
| **Architecture** | 6 | system-architect, api-designer, security-architect |
| **Development** | 6 | backend-developer, frontend-developer, api-developer |
| **Quality Assurance** | 8 | code-reviewer, test-generator, security-tester |
| **Operations** | 8 | devops-engineer, incident-responder, cicd-manager |
| **Documentation** | 3 | tech-writer, doc-reviewer, knowledge-manager |
| **Analysis** | 4 | complexity-analyzer, feedback-analyzer |
| **Specialized** | 5 | bug-fixer, refactor-specialist, feature-builder |
| **Multi-Agent** | 4 | competition, debate, ensemble, reflection |
| **Process** | 5 | workflow-coordinator, requirements-elicitation |
| **Taiyou** | 6 | taiyou-codegen-agent, taiyou-pr-agent |

### 4. Skill Library (82 Skills)

#### Marketing & Sales (12)
- `copywriting-helper` - コピーライティング支援
- `taiyo-style-sales-letter` - セールスレター作成（太陽スタイル）
- `taiyo-style-step-mail` - ステップメール作成（太陽スタイル）
- `taiyo-style-vsl` - ビデオセールスレター（太陽スタイル）
- `launch-video` - ローンチ動画スクリプト
- `lp-analysis` / `mendan-lp` - LP分析・面談LP
- `funnel-builder` - ファネル構築
- `customer-support-120` - カスタマーサポート（120%対応）
- `taiyo-style` - 太陽スタイル適用

#### Content Creation (10)
- `kindle-publishing` - Kindle本出版
- `youtube-content` / `youtube-thumbnail` - YouTube企画・サムネイル
- `ai-manga-generator` / `anime-production` - AI漫画・アニメ制作
- `diagram-illustration` - 図解作成
- `sns-marketing` - SNSマーケティング

#### AI Image & Video (4)
- `nanobanana-pro` / `nanobanana-prompts` - NanoBanana統合
- `omnihuman1-video` - AIアバター動画
- `japanese-tts-reading` - 日本語TTS

#### Infrastructure (11)
- `workflow-automation-n8n` - n8nワークフロー
- `docker-mcp-ops` - Docker操作
- `security-scan-trivy` - セキュリティスキャン
- `pdf-automation-gotenberg` - PDF自動化
- `doc-convert-pandoc` - ドキュメント変換
- `postgres-mcp-analyst` - PostgreSQL分析
- `notion-knowledge-mcp` - Notionナレッジ
- `unified-notifications-apprise` - 通知統合

### 5. Production-Grade Operations

- **Circuit Breaker**: 障害耐性・自動復旧
- **Incident Lifecycle (P17)**: インシデント相関・ノイズ削減・週次ダイジェスト
- **Scheduled Jobs (P18)**: 日次/週次レポート自動生成
- **Observability**: Prometheus/Grafana/Loki統合

---

## MCPツール完全リファレンス

TAISUN v2では、**3つのMCPサーバー**と**11のMCPツール**を提供しています。

### MCPアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code CLI                          │
├─────────────────────────────────────────────────────────────┤
│  MCPサーバー                                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  taisun-proxy (メイン統合エントリーポイント)              ││
│  │  ├── Router (ルール/セマンティックルーティング)          ││
│  │  ├── Memory (短期/長期記憶)                              ││
│  │  ├── Skillize (66スキル実行)                             ││
│  │  ├── Supervisor (ワークフロー制御)                       ││
│  │  └── 内部MCP (github/notion/postgres/filesystem)        ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ claude-mem-search│  │     ide          │                 │
│  │ (履歴/学習検索)   │  │ (VS Code連携)    │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### MCPサーバー詳細

#### 1. TAISUN Proxy MCP（メインサーバー）

統合エントリーポイント。すべての機能を5つのツールで提供。

| ツール | 説明 | 使用例 |
|-------|------|-------|
| `system_health` | システム稼働状況確認、ヘルスチェック | `mcp__taisun-proxy__system_health()` |
| `skill_search` | 66スキルの検索（キーワードまたは全件） | `skill_search(query="taiyo")` |
| `skill_run` | スキルのロード・実行 | `skill_run(name="youtube-thumbnail")` |
| `memory_add` | 大規模コンテンツの保存、参照ID発行<br>- `content`: 直接テキスト保存<br>- `content_path`: ファイルを読み込んで保存（巨大ログ向け） | `memory_add(content="データ", type="long-term")`<br>`memory_add(content_path="logs/output.log", type="short-term")` |
| `memory_search` | 参照IDまたはキーワードでメモリ検索 | `memory_search(query="LP作成")` |

**内部MCP（Rollout管理）:**
- `github` - GitHub Issue/PR連携
- `notion` - Notionナレッジベース
- `postgres` - PostgreSQLデータ分析
- `filesystem` - ファイルシステム操作

#### 2. Claude Memory Search MCP

過去のセッション記録・学習履歴を効率的に検索。**3層ワークフロー**で10倍のトークン節約。

| ツール | 説明 | パラメータ |
|-------|------|-----------|
| `search` | メモリ検索（インデックス取得） | query, limit, project, type, dateStart, dateEnd |
| `timeline` | 結果周辺のコンテキスト取得 | anchor, depth_before, depth_after |
| `get_observations` | フィルタ済みIDの詳細取得 | ids (配列), orderBy, limit |

**推奨ワークフロー:**
```javascript
// 1. 検索でIDを取得（〜50-100トークン/件）
search(query="LP作成") → IDs

// 2. 興味のあるIDの周辺コンテキスト取得
timeline(anchor=123)

// 3. 必要なIDのみ詳細取得
get_observations(ids=[123, 124])
```

#### 3. IDE MCP

VS Code連携による開発支援。

| ツール | 説明 |
|-------|------|
| `getDiagnostics` | 言語診断情報取得（型エラー、警告等） |
| `executeCode` | Jupyterカーネルでコード実行 |

---

## スキル完全リファレンス（66スキル）

### マーケティング・セールス（12スキル）

| スキル | 説明 | コマンド |
|-------|------|---------|
| `copywriting-helper` | コピーライティング支援、訴求力のある文章作成 | `/copywriting-helper` |
| `launch-video` | ローンチ動画スクリプト（3話/4話構成） | `/launch-video` |
| `lp-design` | LP設計・ワイヤーフレーム | `/lp-design` |
| `lp-analysis` | LP分析・改善提案（成約率4.3倍達成） | `/lp-analysis` |
| `mendan-lp` | 面談LP作成（申込率50%目標、4つの型対応） | `/mendan-lp` |
| `funnel-builder` | セールスファネル構築 | `/funnel-builder` |
| `customer-support-120` | 顧客期待120%超え対応 | `/customer-support-120` |
| `education-framework` | 6つの教育要素フレームワーク | `/education-framework` |
| `line-marketing` | LINEマーケティング戦略 | `/line-marketing` |
| `sales-systems` | セールスシステム構築 | `/sales-systems` |
| `lp-json-generator` | LP画像のテキスト差し替え生成 | `/lp-json-generator` |
| `taiyo-analyzer` | 太陽スタイル176パターン品質分析 | `/taiyo-analyzer` |

### 太陽スタイル（10スキル）

日給5000万円を生み出した太陽スタイルのコピーライティング技術。

| スキル | 説明 | コマンド |
|-------|------|---------|
| `taiyo-style` | 太陽スタイル基本（176パターン適用） | `/taiyo-style` |
| `taiyo-rewriter` | 既存コンテンツを太陽スタイルに変換 | `/taiyo-rewriter` |
| `taiyo-style-headline` | 衝撃的なヘッドライン・キャッチコピー生成 | `/taiyo-style-headline` |
| `taiyo-style-bullet` | ブレット・ベネフィットリスト生成 | `/taiyo-style-bullet` |
| `taiyo-style-ps` | 追伸（P.S.）パターン生成 | `/taiyo-style-ps` |
| `taiyo-style-lp` | 太陽スタイルLP作成・最適化 | `/taiyo-style-lp` |
| `taiyo-style-sales-letter` | 太陽スタイルセールスレター | `/taiyo-style-sales-letter` |
| `taiyo-style-step-mail` | 太陽スタイルステップメール | `/taiyo-style-step-mail` |
| `taiyo-style-vsl` | 太陽スタイルVSL台本（15章構成） | `/taiyo-style-vsl` |

### コンテンツ制作（10スキル）

| スキル | 説明 | コマンド |
|-------|------|---------|
| `kindle-publishing` | Kindle本出版（企画〜出版） | `/kindle-publishing` |
| `note-marketing` | note記事戦略 | `/note-marketing` |
| `youtube-content` | YouTube動画企画 | `/youtube-content` |
| `youtube-thumbnail` | サムネイル作成（CTR最適化） | `/youtube-thumbnail` |
| `youtube_channel_summary` | YouTubeチャンネル分析・まとめ | `/youtube_channel_summary` |
| `ai-manga-generator` | AI漫画制作（マーケティング漫画） | `/ai-manga-generator` |
| `anime-production` | アニメ制作 | `/anime-production` |
| `diagram-illustration` | 図解・解説画像作成 | `/diagram-illustration` |
| `custom-character` | キャラクター設定 | `/custom-character` |
| `sns-marketing` | SNSマーケティング（マルチプラットフォーム） | `/sns-marketing` |

### AI画像・動画（5スキル）

| スキル | 説明 | コマンド |
|-------|------|---------|
| `nanobanana-pro` | NanoBanana Pro画像生成（参照画像対応） | `/nanobanana-pro` |
| `nanobanana-prompts` | NanoBanana向けプロンプト最適化 | `/nanobanana-prompts` |
| `omnihuman1-video` | OmniHuman1 AIアバター動画作成 | `/omnihuman1-video` |
| `japanese-tts-reading` | 日本語TTS（Whisper対応） | `/japanese-tts-reading` |
| `gpt-sovits-tts` | GPT-SoVITS音声合成 | `/gpt-sovits-tts` |

### Video Agent統合スキル（1スキル）

動画制作・管理の自動化システム。12個の個別スキルを1つに統合。

| スキル | 説明 | コマンド |
|-------|------|---------|
| `video-agent` | 動画パイプライン統合（ダウンロード、文字起こし、制作、品質管理、CI/CD、通知） | `/video-agent` |

**統合された機能**: video-download, video-transcribe, video-production, video-policy, video-eval, video-ci-scheduling, video-metrics, video-notify, video-anomaly, video-dispatch, video-validate, video-guard

### Deep Research & 要件定義（6スキル）🆕

AIによる深層調査・レポート生成・要件定義システム。

| スキル | 説明 | コマンド |
|-------|------|---------|
| `research` | ワンコマンド深層調査（探索→検証→レポート自動生成） | `/research [トピック]` |
| `dr-explore` | 探索・収集フェーズ（evidence.jsonl生成） | `/dr-explore [topic]` |
| `dr-synthesize` | 検証・統合→レポート・実装計画生成 | `/dr-synthesize [run_path]` |
| `dr-build` | 実装計画をPoC/MVP/Productionに落とし込む | `/dr-build [plan_path]` |
| `dr-mcp-setup` | MCPサーバーのセットアップ支援 | `/dr-mcp-setup` |
| `sdd-req100` | EARS準拠の要件定義生成＋C.U.T.E.自動採点（目標98点） | `/sdd-req100 [spec-slug]` |

**使用例:**
```bash
/research AIエージェントの最新動向
/research 2026年のSaaS市場トレンド
/dr-explore Claude MCP | depth=deep | lang=ja,en
```

### 📊 リサーチ・キーワード抽出スキル 🆕

**APIキー不要版**と**API版（高精度）**の2種類を用意。他人にシステムを渡すときは、APIキー不要版をすぐに使えます。

#### すぐに使えるスキル（APIキー設定不要）

| スキル | 説明 | コマンド |
|-------|------|---------|
| `research-free` | WebSearch/WebFetchのみでリサーチ | `/research-free [トピック]` |
| `keyword-free` | WebSearchのみでキーワード抽出 | `/keyword-free [キーワード]` |

```bash
# 例
/research-free AIエージェントの最新動向
/research-free Next.js 15 新機能 --depth=quick

/keyword-free 投資信託
/keyword-free プログラミング --type=longtail
```

> **ポイント**: Claude Codeをインストールすれば**すぐ使えます**。APIキーの設定は不要です。

#### 高精度版（APIキー設定が必要）

| スキル | 説明 | コマンド |
|-------|------|---------|
| `mega-research` | 6つのAPIを統合した深層リサーチ | `/mega-research [トピック]` |
| `keyword-mega-extractor` | 検索ボリューム・競合度付きキーワード分析 | `/keyword-mega-extractor [キーワード]` |

```bash
# 例
/mega-research AIエージェント市場の最新動向 --mode=deep
/keyword-mega-extractor 転職 --type=buying
```

> **必要なAPIキー**: 使用するには以下のAPIキーを`~/.zshrc`または`.env`に設定してください。
> - Tavily: https://tavily.com/
> - SerpAPI: https://serpapi.com/
> - Brave Search: https://brave.com/search/api/
> - NewsAPI: https://newsapi.org/
> - Perplexity: https://perplexity.ai/settings/api

#### 比較表

| 機能 | APIキー不要版 | API版（高精度） |
|------|-------------|----------------|
| **配布** | そのまま動作 ✅ | APIキー設定必要 |
| **検索精度** | 良好 | 高精度 |
| **検索速度** | 標準 | 高速（並列） |
| **検索ボリューム** | 推定のみ | 正確なデータ |
| **必要なもの** | Claude Codeのみ | 各種APIキー |

### 🔍 追加MCP（無料）

APIキー不要で使える追加のMCPサーバー。

| MCP | 費用 | 用途 | 状態 |
|-----|------|------|------|
| `open-websearch` | 無料 | DuckDuckGo/Bing/Brave検索 | ✅ 有効（設定不要） |
| `twitter-client` | 無料 | Twitter/Xツイート取得・検索 | ⚠️ 要設定（下記参照） |
| `playwright` | 無料 | ブラウザ自動化 | ✅ 有効（設定不要） |

#### 🐦 Twitter/X MCP の設定方法

Twitter機能を使うにはCookie認証が必要です（APIキー不要・無料）。

**Step 1: Cookieを取得**

1. **Chrome/Edgeで X.com にログイン**
2. **F12キーでDevToolsを開く**
3. **「Application」タブ → 「Cookies」→ 「https://x.com」をクリック**
4. **以下の3つの値をコピー**:

| Name | 説明 |
|------|------|
| `auth_token` | 認証トークン（約40文字） |
| `ct0` | CSRFトークン（約100文字） |
| `twid` | ユーザーID（`u%3D数字`形式） |

**Step 2: .envに設定**

プロジェクトの`.env`ファイルに以下を追加（値は自分のものに置き換え）:

```bash
TWITTER_COOKIES=["auth_token=あなたのauth_token; Domain=.twitter.com", "ct0=あなたのct0; Domain=.twitter.com", "twid=あなたのtwid; Domain=.twitter.com"]
```

**Step 3: MCPを有効化**

`.mcp.json`の`twitter-client`セクションで`"disabled": false`に変更:

```json
"twitter-client": {
  ...
  "disabled": false,  // ← trueからfalseに変更
  ...
}
```

**Step 4: Claude Codeを再起動**

```bash
# Ctrl+C で終了後、再度起動
claude
```

**使用例:**
```
「このツイートの内容を教えて: https://x.com/username/status/123456789」
「"AI Agent" に関する最新ツイートを10件検索して」
「DuckDuckGoで "Claude Code MCP" を検索して」
```

> **⚠️ 注意**: Cookie情報は**絶対に他人と共有しないでください**。GitHubにプッシュされる`.env.example`にはプレースホルダーのみ含まれ、実際の値は含まれません。

### インフラ・自動化（11スキル）

| スキル | 説明 | コマンド |
|-------|------|---------|
| `workflow-automation-n8n` | n8nワークフロー設計・実装 | `/workflow-automation-n8n` |
| `docker-mcp-ops` | Docker操作（コンテナ起動/停止/ログ） | `/docker-mcp-ops` |
| `security-scan-trivy` | Trivyセキュリティスキャン | `/security-scan-trivy` |
| `pdf-automation-gotenberg` | PDF変換・帳票出力自動化 | `/pdf-automation-gotenberg` |
| `doc-convert-pandoc` | ドキュメント変換（md→docx/pptx等） | `/doc-convert-pandoc` |
| `unified-notifications-apprise` | 通知チャネル統合（Slack/Discord/Email等） | `/unified-notifications-apprise` |
| `postgres-mcp-analyst` | PostgreSQL分析（read-only） | `/postgres-mcp-analyst` |
| `notion-knowledge-mcp` | Notionナレッジ検索・整理 | `/notion-knowledge-mcp` |
| `nlq-bi-wrenai` | 自然言語BI/可視化（WrenAI） | `/nlq-bi-wrenai` |
| `research-cited-report` | 出典付きリサーチレポート | `/research-cited-report` |
| `sns-patterns` | SNS投稿パターン | `/sns-patterns` |

### 開発フェーズ（2スキル）

| スキル | 説明 | コマンド |
|-------|------|---------|
| `phase1-tools` | Phase 1ツール群 | - |
| `phase2-monitoring` | Phase 2モニタリング | - |

---

## MCPツール使用例

### スキル検索・実行

```javascript
// 全スキル一覧
mcp__taisun-proxy__skill_search()

// キーワード検索
mcp__taisun-proxy__skill_search(query="taiyo")

// スキル実行
mcp__taisun-proxy__skill_run(name="youtube-thumbnail")
```

### メモリ操作

```javascript
// 長期メモリに保存（直接テキスト）
mcp__taisun-proxy__memory_add(
  content="重要な調査結果...",
  type="long-term",
  metadata={ project: "LP改善" }
)
// → refId: "mem_abc123" を返す

// ファイルから保存（大量ログ向け）
mcp__taisun-proxy__memory_add(
  content_path="logs/test-failure.log",
  type="short-term",
  metadata={ type: "test-log", issue: "DB接続エラー" }
)
// → コンテキスト節約: 100KB → 50トークン（99.8%削減）

// 検索
mcp__taisun-proxy__memory_search(query="mem_abc123")
```

### 履歴検索（3層ワークフロー）

```javascript
// Step 1: インデックス検索
mcp__claude-mem-search__search(
  query="LP作成",
  limit=10,
  dateStart="2026-01-01"
)

// Step 2: コンテキスト取得
mcp__claude-mem-search__timeline(
  anchor=123,
  depth_before=2,
  depth_after=2
)

// Step 3: 詳細取得（必要なIDのみ）
mcp__claude-mem-search__get_observations(
  ids=[123, 124, 125]
)
```

### システムヘルスチェック

```javascript
mcp__taisun-proxy__system_health()
// → { status, uptime, mcps, circuits, metrics }
```

## Quick Start

> **日本語ユーザー向け**: 詳細なセットアップガイドは [docs/getting-started-ja.md](docs/getting-started-ja.md) をご覧ください。

### Prerequisites

- Node.js 18.x+
- npm 9.x+
- Claude Code CLI
- Docker (optional, for monitoring stack)

### Installation

```bash
# Clone repository
git clone https://github.com/taiyousan15/taisun_agent.git
cd taisun_agent

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys
```

### Verification

```bash
# Run tests (775 tests)
npm test

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build:all
```

## Usage

### Using Agents

```javascript
// Architecture design
Task(subagent_type="system-architect", prompt="ECサイトのアーキテクチャを設計して")

// Backend implementation
Task(subagent_type="backend-developer", prompt="ユーザー認証APIを実装して")

// Code review (0-100 scoring)
Task(subagent_type="code-reviewer", prompt="このPRをレビューして")

// Auto-select optimal agent
Task(subagent_type="ait42-coordinator", prompt="ユーザー認証機能を設計・実装して")
```

### Using Skills

```bash
# Sales letter
/sales-letter --product "オンライン講座"

# LP analysis
/lp-analysis https://example.com

# Security scan
/security-scan-trivy

# Daily observability report
npm run obs:report:daily
```

### Monitoring Stack

```bash
# Start monitoring (Prometheus, Grafana, Loki)
make monitoring-up

# Start ops tools (Gotenberg, PDF)
make tools-up

# Start scheduled jobs daemon
docker compose -f docker-compose.ops.yml --profile ops-scheduler up -d
```

## Project Structure

```
taisun_agent/
├── src/
│   └── proxy-mcp/              # Proxy MCP Server (11.2K LOC)
│       ├── server.ts           # MCP server entry
│       ├── tools/              # Public tools (system, skill, memory)
│       ├── memory/             # Memory service & storage
│       ├── router/             # Hybrid router engine
│       ├── internal/           # Circuit breaker, resilience
│       ├── browser/            # Chrome/CDP integration
│       ├── skillize/           # URL→Skill generation
│       ├── supervisor/         # GitHub workflow integration
│       ├── ops/                # Schedule, incidents, digest
│       └── observability/      # Event tracking & metrics
│
├── .claude/                    # Agent system
│   ├── agents/                 # 82 agent definitions
│   ├── skills/                 # 77 skill definitions
│   ├── commands/               # 82 command shortcuts
│   ├── mcp-servers/            # 4 custom MCP servers
│   ├── mcp-tools/              # 227 MCP tools
│   └── memory/                 # Learning & statistics
│
├── config/
│   └── proxy-mcp/              # MCP configuration
│       ├── internal-mcps.json  # MCP registry
│       ├── ops-schedule.json   # Scheduled jobs
│       └── incidents.json      # Incident tracking
│
├── docs/                       # Documentation (30+ files)
│   ├── ARCHITECTURE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── API_REFERENCE.md
│   ├── OPERATIONS.md
│   └── third-agent/            # Advanced docs
│
├── tests/
│   ├── unit/                   # 22 unit test files
│   └── integration/            # 5 integration suites
│
├── docker-compose.monitoring.yml  # Prometheus/Grafana/Loki
├── docker-compose.tools.yml       # Document processing
└── docker-compose.ops.yml         # Operations environment
```

## Quality Gates

| Metric | Requirement | Current |
|--------|-------------|---------|
| Test Coverage | 80%+ | 80%+ |
| Code Review Score | 80+ | 80+ |
| Security Scan | Zero Critical/High | Zero |
| P0/P1 Bugs | Zero | Zero |

## NPM Scripts

```bash
# TAISUN Diagnostics (推奨)
npm run taisun:diagnose       # 13層防御・全コンポーネント診断
npm run taisun:diagnose:full  # 詳細診断
npm run taisun:setup          # セットアップガイド表示

# Development
npm run dev                    # Watch mode
npm test                       # Run all tests
npm run lint                   # ESLint
npm run typecheck              # TypeScript check

# Building
npm run proxy:build           # Build proxy MCP
npm run scripts:build         # Build scripts
npm run build:all             # Full build

# Operations
npm run obs:report:daily      # Daily observability report
npm run obs:report:weekly     # Weekly report
npm run ops:schedule:status   # Check scheduled jobs

# Utilities
npm run agents:list           # List available agents
npm run skills:list           # List available skills
npm run proxy:smoke           # MCP smoke test
```

## Documentation

### Getting Started

| Document | Description |
|----------|-------------|
| [QUICK_START.md](docs/QUICK_START.md) | 5分クイックスタート |
| [BEGINNERS_PROMPT_GUIDE.md](docs/BEGINNERS_PROMPT_GUIDE.md) | 初心者向けフレーズ集 ⭐ |
| [CONFIG.md](docs/CONFIG.md) | 設定ガイド |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | トラブルシューティング |
| [getting-started-ja.md](docs/getting-started-ja.md) | 日本語セットアップガイド |

### Development

| Document | Description |
|----------|-------------|
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | コントリビューションガイド |
| [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | 開発者ガイド |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | システムアーキテクチャ |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | API リファレンス |

### Operations

| Document | Description |
|----------|-------------|
| [OPERATIONS.md](docs/OPERATIONS.md) | 運用ガイド |
| [RUNBOOK.md](docs/RUNBOOK.md) | ランブック |
| [SECURITY.md](docs/SECURITY.md) | セキュリティポリシー |
| [CHANGELOG.md](docs/CHANGELOG.md) | 変更履歴 |

## Technology Stack

| Category | Technologies |
|----------|--------------|
| **Runtime** | Node.js 18+, TypeScript 5.3+ |
| **Testing** | Jest 29.7 |
| **MCP** | @modelcontextprotocol/sdk 1.0 |
| **AI** | Anthropic SDK, LangChain |
| **Browser** | Playwright Core 1.57 |
| **Monitoring** | Prometheus, Grafana, Loki |
| **Infrastructure** | Docker, n8n |

## Contributing

詳細は [CONTRIBUTING.md](docs/CONTRIBUTING.md) を参照してください。

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See [LICENSE](LICENSE) for details.

## Support

- Issues: [GitHub Issues](https://github.com/taiyousan15/taisun_agent/issues)
- Documentation: [docs/](docs/)

---

Built with [Claude Code](https://claude.ai/code)
