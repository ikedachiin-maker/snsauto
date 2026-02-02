# TAISUN v2 - Ultimate Unified System

---

## WORKFLOW FIDELITY CONTRACT（絶対遵守契約）

```
┌─────────────────────────────────────────────────────────────────────┐
│  この契約は、AIの行動を制約する最上位ルールです。                    │
│  いかなる状況でも、この契約に違反することは許可されません。          │
└─────────────────────────────────────────────────────────────────────┘
```

### 1. 指示の忠実な実行（契約）

ユーザーが「同じワークフロー」「指定スキルを使う」と言ったら、それは**契約**です。
- 短縮・簡略化・置換は**禁止**
- 「シンプルにする」「最適化する」「より良くする」は**逸脱**として扱う
- 逸脱が必要な場合は、**必ず事前に承認を得る**

### 2. 既存成果物の尊重

既存成果物（前回のcreate_video.py、既存スキルの手順、workflowドキュメント）を：
- **Readせずに新規スクリプト/別手順を作らない**
- **改変する前に必ずReadで内容を確認する**
- **ベースラインとして登録されたファイルは改変禁止**

### 3. 勝手な行動の禁止

指示にない行動（逸脱）をする場合：
1. **必ず「この行動は指示にありません。実行してよいですか？」と確認する**
2. **ユーザーの明示的な承認を得てから実行する**
3. **承認なしに逸脱することは絶対禁止**

### 4. セッション継続時の状態確認

セッション再開時は：
- `.workflow_state.json` の内容を確認（自動注入される）
- `SESSION_HANDOFF.md` があれば必ず読む
- 現在のフェーズと矛盾する行動をしない

### 5. スキル指定の遵守

「〇〇スキルを使って」という指示がある場合：
- **必ずSkillツールで呼び出す**
- 手動実装は**絶対禁止**
- スキルを呼び出さずに後工程に進むことは**ブロック**される

### 6. 13層防御システム

このシステムは以下の13層で防御されています：

| Layer | Guard | 機能 |
|-------|-------|------|
| 0 | CLAUDE.md | 絶対遵守ルール（この契約） |
| 1 | SessionStart Injector | 状態の自動注入 |
| 2 | Permission Gate | フェーズ外操作をブロック |
| 3 | Read-before-Write | 未読ファイル編集をブロック |
| 4 | Baseline Lock | 重要スクリプト改変をブロック |
| 5 | Skill Evidence | スキル証跡なしで後工程ブロック |
| 6 | Deviation Approval | 勝手な行動の事前承認要求 |
| 7 | Agent Enforcement | 複雑タスクでエージェント使用を強制 |
| 8 | Copy Safety | U+FFFD/U+3000/コピーマーカーをブロック |
| 9 | Input Sanitizer | コマンドインジェクション/機密情報漏洩を検出 |
| 10 | Skill Auto-Select | タスク種別から必須スキルを自動強制 |
| 11 | Definition Lint | workflow/policy定義の検証 |
| 12 | Context Quality | tmux推奨 + console.log警告（品質ガイド） |

**違反はexit code 2でブロックされ、実行不能になります。**
**Layer 12は警告のみ（品質優先のため強制しない）**

### 7. スキル自動マッピング（v3.0新機能）

タスク種別から必須スキルを自動検出・強制します：

| トリガー | 必須スキル |
|----------|------------|
| YOUTUBE + 教材 + 動画 + 生成 | youtubeschool-creator |
| YOUTUBE + 動画 + (分析/生成/まとめ) | youtube_channel_summary |
| スライド + 動画 | youtubeschool-creator |
| セールスレター | taiyo-style-sales-letter, taiyo-style |
| ステップメール | taiyo-style-step-mail |
| VSL/ビデオセールスレター | taiyo-style-vsl |

設定ファイル: `.claude/hooks/config/skill-mapping.json`

---

## Overview
世界最高品質の開発・マーケティング統合システム。
AIエージェント、MCPツール、マーケティングスキルを完全統合。

## System Stats

| Component | Count | Active | Description |
|-----------|-------|--------|-------------|
| **Agents** | 82 | 11 | AIT42 + Taiyou統合エージェント |
| **Skills** | 66 | 55 | マーケティング・クリエイティブ・インフラ |
| **Commands** | 82 | 49 | ショートカットコマンド |
| **MCP Servers** | 36 | - | 外部サービス連携 |
| **MCP Tools** | 227 | - | 自動化ツール群 |
| **Defense Layers** | 13 | 13 | 防御層システム |

## Architecture

```
taisun_v2/.claude/
├── agents/              # 82 統合エージェント (11 active)
├── commands/            # 82 コマンド (49 active)
├── skills/              # 66 スキル (55 active)
├── memory/              # 学習・統計システム
├── mcp-servers/         # カスタムMCPサーバー (4)
├── mcp-tools/           # → taisun MCPツール (227)
├── hooks/               # 8層防御システム (21ファイル)
├── CLAUDE.md            # このファイル
└── settings.json        # 設定
```

## Agent Categories (82 Agents)

### Coordinators (5)
- `ait42-coordinator` - メインオーケストレーター
- `ait42-coordinator-fast` - 高速O(1)選択
- `omega-aware-coordinator` - Ω関数理論
- `self-healing-coordinator` - 自己修復
- `initialization-orchestrator` - 環境セットアップ統合

### Diagnostics & Recovery (5) 🆕
- `system-diagnostician` - プロアクティブシステム診断
- `error-recovery-planner` - エラー回復計画
- `dependency-validator` - 依存関係検証
- `log-analyzer` - ログ解析・パターン検出
- `environment-doctor` - 環境診断・修復（初心者向け）

### Architecture & Design (6)
- `system-architect`, `api-designer`, `database-designer`
- `security-architect`, `cloud-architect`, `ui-ux-designer`

### Development (6)
- `backend-developer`, `frontend-developer`, `api-developer`
- `database-developer`, `integration-developer`, `migration-developer`

### Quality Assurance (8)
- `code-reviewer`, `test-generator`, `qa-validator`
- `integration-tester`, `security-tester`, `performance-tester`
- `mutation-tester`, `chaos-engineer`

### Operations (8)
- `devops-engineer`, `cicd-manager`, `monitoring-specialist`
- `incident-responder`, `backup-manager`, `container-specialist`
- `config-manager`, `release-manager`

### Documentation (3)
- `tech-writer`, `doc-reviewer`, `knowledge-manager`

### Analysis (4)
- `complexity-analyzer`, `feedback-analyzer`
- `innovation-scout`, `learning-agent`

### Specialized (5)
- `bug-fixer`, `refactor-specialist`, `feature-builder`
- `script-writer`, `implementation-assistant`

### Multi-Agent (4)
- `multi-agent-competition`, `multi-agent-debate`
- `multi-agent-ensemble`, `reflection-agent`

### Process (5)
- `workflow-coordinator`, `integration-planner`
- `process-optimizer`, `metrics-collector`, `requirements-elicitation`

### Taiyou Agents (6)
- `taiyou-coordinator-agent`, `taiyou-codegen-agent`
- `taiyou-issue-agent`, `taiyou-pr-agent`
- `taiyou-review-agent`, `taiyou-deployment-agent`

### Specialized Tools (16+)
- Data analyst, Researcher, Automation architect, etc.

## Skill Categories (66 Skills)

### Marketing & Sales (12)
| Skill | Description |
|-------|-------------|
| `copywriting-helper` | コピーライティング支援 |
| `launch-video` | ローンチ動画 |
| `lp-analysis` | LP分析・改善 |
| `lp-design` | LP設計 |
| `mendan-lp` | 面談LP |
| `funnel-builder` | ファネル構築 |
| `customer-support-120` | カスタマーサポート（120%対応） |
| `taiyo-style` | 太陽スタイル |
| `education-framework` | 6つの教育要素 |
| `line-marketing` | LINEマーケティング |
| `sales-systems` | セールスシステム |
| `lp-json-generator` | LP画像のテキスト差し替え生成 |

### Content Creation (10)
| Skill | Description |
|-------|-------------|
| `kindle-publishing` | Kindle本出版 |
| `note-marketing` | note記事戦略 |
| `youtube-content` | YouTube動画企画 |
| `youtube-thumbnail` | サムネイル作成 |
| `youtube_channel_summary` | YouTubeチャンネル分析 |
| `ai-manga-generator` | AI漫画制作 |
| `anime-production` | アニメ制作 |
| `diagram-illustration` | 図解作成 |
| `custom-character` | キャラクター設定 |
| `sns-marketing` | SNSマーケティング |

### AI Image & Video (5)
| Skill | Description |
|-------|-------------|
| `nanobanana-pro` | NanoBanana Pro画像生成 |
| `nanobanana-prompts` | プロンプト最適化 |
| `omnihuman1-video` | AIアバター動画 |
| `japanese-tts-reading` | 日本語TTS |
| `gpt-sovits-tts` | GPT-SoVITS音声合成 |

### Video Agent統合 (1)
| Skill | Description |
|-------|-------------|
| `video-agent` | 動画パイプライン統合（12スキル統合） |

*統合内容: video-download, video-transcribe, video-production, video-policy, video-eval等*

### Infrastructure (11)
| Skill | Description |
|-------|-------------|
| `workflow-automation-n8n` | n8nワークフロー |
| `docker-mcp-ops` | Docker操作 |
| `security-scan-trivy` | セキュリティスキャン |
| `pdf-automation-gotenberg` | PDF自動化 |
| `doc-convert-pandoc` | ドキュメント変換 |
| `unified-notifications-apprise` | 通知統合 |
| `postgres-mcp-analyst` | PostgreSQL分析 |
| `notion-knowledge-mcp` | Notionナレッジ |
| `nlq-bi-wrenai` | 自然言語BI |
| `research-cited-report` | 出典付きリサーチ |
| `sns-patterns` | SNSパターン |

## MCP Integration

### MCP Servers (36)

| Category | Servers |
|----------|---------|
| **Development** | ide-integration, github-enhanced, project-context, github, gitlab, greptile |
| **Productivity** | asana, atlassian, linear, notion |
| **Infrastructure** | firebase, supabase, vercel, docker |
| **Database** | postgres-ro, postgres-rw, qdrant |
| **Communication** | slack |
| **AI** | context-engineering, context7, serena, gpt-researcher |
| **Design** | figma |
| **Automation** | taiyou, taiyou-mcp |
| **Media** | youtube-automation, remotion-documentation |
| **Testing** | playwright |
| **Observability** | sentry |
| **Search** | brave-search |
| **Memory** | memory, sequential-thinking |
| **System** | filesystem |

### MCP Tools (227)

| Category | Count | Examples |
|----------|-------|----------|
| **git** | 20 | status, diff, log, branch, commit |
| **file** | 18 | read, write, search, convert |
| **process** | 19 | execute, monitor, schedule |
| **agent** | 18 | coordinate, delegate, reflect |
| **marketing** | 10 | lp-generate, email-create |
| **sns** | 10 | post, schedule, analyze |
| **content** | 9 | generate, edit, optimize |
| **cloud** | 25 | deploy, scale, monitor |
| **database** | 25 | query, migrate, backup |
| **observability** | 24 | log, trace, metric |
| **devops** | 25 | build, test, deploy |
| **development** | 24 | lint, format, refactor |

## Commands (73)

### Development
`build-feature`, `fix-bug`, `refactor-code`, `review-code`, `generate-tests`

### Design
`design-api`, `design-architecture`, `design-database`, `design-security`, `design-ui-ux`

### Operations
`manage-cicd`, `manage-config`, `manage-releases`, `setup-monitoring`

### Quality
`validate-quality`, `scan-security`, `test-integration`, `test-performance`

### Marketing
`lp-normal`, `lp-manga`, `kindle-line-vsl`, `note-line-vsl`, `youtube-thumbnail`

### Taiyou
`taiyou-agent`, `taiyou-auto`, `taiyou-status`, `taiyou-todos`, `create-issue`

### MCP
`mcp-health`, `mcp-git`, `mcp-github`, `mcp-files`, `mcp-system`

## Quick Start

```bash
# エージェント実行
/agent-run

# スキル使用
/copywriting-helper
/youtube-thumbnail
/security-scan

# 状態確認
/taiyou-status
/mcp-health
```

### 環境診断・トラブルシューティング（初心者向け）
```
「環境を診断して」           → environment-doctor が自動実行
「エラーログを分析して」      → log-analyzer が原因特定
「依存関係をチェックして」    → dependency-validator が検証
「このエラーの修復方法は？」  → error-recovery-planner が提案
「システムの状態を確認」      → system-diagnostician が診断
```

### Context7: 最新ドキュメント取得（ハルシネーション防止）
```
「use context7 でNext.js 15のApp Routerについて教えて」
「use context7 React 19の新機能でコンポーネントを作って」
「use context7 Tailwind v4の設定方法」

→ 訓練データではなく、最新の公式ドキュメントから取得
→ 存在しないAPIの生成（ハルシネーション）を防止
```

### GPT Researcher: 自律型深層リサーチ
```
「AIエージェントフレームワークの最新動向を調査して」
「予測市場プラットフォームの競合分析をして」
「2026年のSaaS市場トレンドをレポートにまとめて」

→ 数百ソースを自律的に探索・検証
→ 引用付きの包括的レポートを生成
→ Carnegie Mellon大学ベンチマークで最高評価
```

### Figma: デザイン→コード変換
```
「このFigmaデザインを実装して: https://www.figma.com/file/...」
「FigmaのButtonコンポーネントをReactで作って」
「Figmaからデザイントークンを抽出して」

→ デザインファイルに直接アクセス
→ 正確な色・スペーシング・タイポグラフィ値を取得
→ ピクセルパーフェクトな実装を実現
```

### Qdrant: ベクトル検索・長期記憶
```
「このパターンを覚えておいて」
「以前話した認証の実装方法は？」
「類似のコードパターンを検索して」

→ セマンティック検索で意味的に類似した情報を取得
→ セッションをまたいだ永続的な記憶
→ RAG（検索拡張生成）で精度向上
```

### 階層メモリ: Mem0ベース3層アーキテクチャ
```
短期記憶 → taisun-proxy (セッション内)
長期記憶 → Qdrant (永続ベクトル)
エピソード → claude-mem (決定履歴)

→ Mem0研究に基づく26%精度向上
→ 91%レイテンシ削減、90%トークン節約
→ 自動統合でセッション終了時に重要情報を永続化
```

## MANDATORY PRE-FLIGHT CHECKS (絶対遵守)

### BEFORE ANY ACTION - 必ず実行せよ

```
┌─────────────────────────────────────────────────────────────┐
│  STOP! このチェックリストを完了するまで作業を開始するな     │
└─────────────────────────────────────────────────────────────┘
```

#### 1. スキル指示の確認
- [ ] ユーザーが「〇〇スキルを使って」と言っていないか？
- [ ] 言っている場合 → **必ずSkillツールで呼び出せ**
- [ ] 手動実装は**絶対禁止**

#### 2. 既存ファイルの確認
- [ ] 「同じワークフロー」「同じスクリプト」「前回と同じ」という指示はないか？
- [ ] ある場合 → **既存ファイルをReadツールで読め**
- [ ] 読まずに新規作成は**絶対禁止**

#### 3. SESSION_HANDOFF.mdの確認
- [ ] プロジェクトディレクトリに`SESSION_HANDOFF.md`があるか？
- [ ] ある場合 → **必ず読んでから作業開始**
- [ ] 前セッションの状態を無視することは**絶対禁止**

#### 4. コンテンツ生成の確認
- [ ] 要約比率が指定されているか？（例: 80%要約）
- [ ] 指定されている場合 → **その比率を厳守**
- [ ] 勝手に圧縮率を変更することは**絶対禁止**

### VIOLATION = CRITICAL ERROR

上記ルールに違反した場合：
1. 即座に作業を停止
2. ユーザーに謝罪と報告
3. `.claude/hooks/mistakes.md`に記録
4. 正しい手順で再実行

---

## Guidelines

### Context Management（品質優先）
コンテキスト効率より**品質が最優先**。必要であれば多くのファイルを読んで良い。
詳細: `.claude/rules/context-management.md`

| 項目 | 推奨値 | 理由 |
|------|--------|------|
| 有効化MCP | 10個以下 | コンテキスト縮小防止 |
| アクティブツール | 80個以下 | 200k→70k縮小を防ぐ |

### Development
1. **TDD First** - テスト駆動開発
2. **Clean Architecture** - レイヤー分離
3. **SOLID Principles** - 設計原則遵守
4. **Security by Design** - セキュリティ組み込み

### Quality Gates
- コードレビュー: 80点以上
- テストカバレッジ: 80%以上
- セキュリティ: Critical/High脆弱性ゼロ

### Agent Selection
1. Coordinator経由で最適エージェント自動選択
2. 複雑タスクは並列実行
3. reflection-agentで品質ゲート

## Language
- 日本語優先
- 技術用語は英語可
- マーケティング専門用語を適切に使用


<claude-mem-context>
# Recent Activity

<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->

### Jan 7, 2026

| ID | Time | T | Title | Read |
|----|------|---|-------|------|
| #708 | 5:32 PM | 🟣 | Implemented UTF-8 safety tools preventing multibyte text corruption | ~596 |
| #641 | 5:04 PM | 🟣 | Created pins registry for tracking specific modification targets | ~475 |
| #640 | " | 🔵 | Directives ledger tracks two completed tasks with structured instruction decomposition | ~576 |
| #639 | " | ✅ | Directive ledger updated with Memory++ upgrade task specification | ~755 |
| #623 | 4:53 PM | ✅ | Task contract updated for memory system enhancement work | ~643 |
| #622 | 4:52 PM | 🟣 | New memory enhancement task directive added to instruction ledger | ~621 |
| #605 | 4:26 PM | ✅ | Running summary updated to mark directive fidelity framework as complete | ~410 |
</claude-mem-context>
<!-- SDD-REQ100 SOP START -->
## Spec-Driven Development SOP (Requirements)

### Canonical command (MUST)
- **When the user asks to create/rewrite requirements, do NOT write requirements directly in chat.**
- Instead, route to the canonical pipeline command:
  - `/sdd-req100 <spec-slug> [target-dir(optional)]`

### Defaults / conventions
- `spec-slug` MUST be kebab-case (e.g. `google-ad-report`).
- If `target-dir` is omitted, use: `.kiro/specs/<spec-slug>/`

### Team workflow (fast)
1) If slug is unknown:
   - `/req100`  → copy the printed `next: ...`
2) Generate & score:
   - `/sdd-req100 <spec-slug>`
3) Re-score anytime:
   - `/score-req100 .kiro/specs/<spec-slug>/requirements.md`

### Guardrails
- Keep requirements in files under `.kiro/specs/` as the single source of truth.
- Avoid "vibe requirements"; always EARS + acceptance tests + scoring loop.

<!-- SDD-REQ100 SOP END -->
