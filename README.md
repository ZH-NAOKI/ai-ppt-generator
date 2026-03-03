# AI PowerPoint Generator

## プロジェクト概要
AIがプロンプトを解析して、提案資料や報告書などのプロフェッショナルなパワーポイントを自動生成するWebアプリケーションです。

## 🚀 主な機能
- 🤖 **AI統合**: OpenAI APIによる高度なコンテンツ生成
- 📝 **プロンプト入力**: 自由形式のテキストで資料内容を指定
- 📊 **資料タイプ選択**: 提案資料、報告書、分析資料、プレゼンテーション
- 🎯 **スライド数指定**: 5/10/15/20スライドから選択可能
- 👀 **プレビュー機能**: 生成前にスライド構成を確認
- 💾 **ダウンロード機能**: .pptx形式でダウンロード可能
- 🔄 **フォールバック機能**: AI失敗時は自動的にテンプレート生成

## URLs
- **GitHub**: https://github.com/ZH-NAOKI/ai-ppt-generator
- **デモ**: https://3000-iaqf59pcw2880p20xfhd8-cc2fbc16.sandbox.novita.ai

## 技術スタック
- **フレームワーク**: Hono (v4.12.3)
- **AI統合**: OpenAI API (gpt-5)
- **PowerPoint生成**: PptxGenJS (v4.0.1)
- **スタイリング**: Tailwind CSS (CDN)
- **デプロイ**: Cloudflare Pages
- **言語**: TypeScript

## プロジェクト構成
```
webapp/
├── src/
│   ├── index.tsx          # メインアプリケーション
│   ├── renderer.tsx       # HTMLレンダラー
│   └── ai-generator.ts    # AI統合ロジック
├── public/
│   └── static/
│       ├── style.css      # カスタムスタイル
│       └── app.js         # フロントエンドロジック
├── ecosystem.config.cjs   # PM2設定
├── wrangler.jsonc         # Cloudflare設定
├── .dev.vars              # ローカル環境変数
├── package.json           # 依存関係
└── README.md              # このファイル
```

## ✨ 実装済み機能

### 1. AI統合によるコンテンツ生成
- **OpenAI API統合**: gpt-5モデルを使用
- **プロンプトエンジニアリング**: 資料タイプに応じた最適化
- **構造化出力**: JSON形式でスライド構成を生成
- **エラーハンドリング**: AI失敗時の自動フォールバック

### 2. プロンプト入力フォーム
- テキストエリアでプロンプト入力
- 資料タイプ選択（提案資料/報告書/分析資料/プレゼンテーション）
- スライド数選択（5/10/15/20）
- AI生成ON/OFFトグル

### 3. PowerPoint生成API (`/api/generate`)
- AIによるプロンプト解析
- 資料タイプに応じたスライド構成生成
- PptxGenJSによるPowerPoint生成
- Base64エンコードでフロントエンドに返却

### 4. スライド構成
- **タイトルスライド**: 資料タイトルと日付
- **コンテンツスライド**: 
  - 箇条書き（bullet）
  - テキスト（text）
  - テーブル（table）
- **最終スライド**: 「ご清聴ありがとうございました」

### 5. AIプロンプト設計
資料タイプごとに最適化されたシステムプロンプト：
- 提案資料: 背景、課題、提案内容、効果、スケジュール
- 報告書: サマリー、調査方法、発見事項、推奨事項
- 分析資料: 目的、SWOT分析、結果サマリー
- プレゼンテーション: アジェンダ、主要トピック、まとめ

## 🔧 ローカル開発

### セットアップ
```bash
# 依存関係のインストール
npm install

# 環境変数設定（.dev.vars）
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1

# ビルド
npm run build

# 開発サーバー起動（PM2）
pm2 start ecosystem.config.cjs

# サービステスト
npm test
```

### 開発コマンド
```bash
# ポートクリーンアップ
npm run clean-port

# Vite開発サーバー
npm run dev

# Wranglerプレビュー
npm run preview

# Git操作
npm run git:status
npm run git:commit "commit message"
```

## 🌐 デプロイ

### Cloudflare Pagesへのデプロイ

1. **環境変数設定**
```bash
# Cloudflare Pages設定で以下を追加
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://www.genspark.ai/api/llm_proxy/v1
```

2. **デプロイ実行**
```bash
# ビルド
npm run build

# デプロイ
npm run deploy:prod
```

## 📋 データアーキテクチャ

### AIリクエスト/レスポンス構造
```typescript
// リクエスト
{
  prompt: string,
  documentType: 'proposal' | 'report' | 'analysis' | 'presentation',
  slideCount: number,
  useAI: boolean
}

// AIレスポンス
{
  title: string,
  subtitle: string,
  content: [
    {
      title: string,
      type: 'bullet' | 'text' | 'table',
      bullets?: Array<{text: string, options: {}}>,
      content?: string,
      tableData?: Array<Array>
    }
  ]
}
```

### PowerPoint出力形式
- **形式**: .pptx (Office Open XML)
- **エンコード**: Base64（API → フロントエンド）
- **ダウンロード**: Blob API使用

## 🎯 AI統合の特徴

### 1. インテリジェントなコンテンツ生成
- プロンプトから資料の意図を理解
- 資料タイプに応じた最適な構成を提案
- 自然な日本語表現

### 2. 構造化された出力
- JSON形式で明確な構造
- スライドタイプ（箇条書き/テキスト/テーブル）の自動判定
- 視覚的に分かりやすい配置

### 3. フォールバック機能
- AI API失敗時の自動切り替え
- テンプレートベースの生成を保証
- ユーザー体験の継続性

### 4. パフォーマンス最適化
- 非同期処理によるレスポンス向上
- エラーハンドリングの徹底
- タイムアウト管理

## 📈 使用例

### 例1: 新商品提案資料
```
プロンプト: 新型スマートウォッチの市場投入提案。ターゲット層、機能比較、価格戦略、販売計画を含む
資料タイプ: 提案資料
スライド数: 10
```

### 例2: 四半期業績報告
```
プロンプト: 2026年Q1の業績報告。売上推移、主要KPI、課題と対策、次期予測を含む
資料タイプ: 報告書
スライド数: 15
```

### 例3: 競合分析
```
プロンプト: EC市場の競合分析。市場シェア、強み弱み、機会脅威、戦略提言を含む
資料タイプ: 分析資料
スライド数: 12
```

## 🔮 今後の拡張予定

### 未実装機能
- [ ] カスタムテンプレート選択
- [ ] 画像・チャートの自動挿入
- [ ] 複数言語対応
- [ ] ユーザー認証
- [ ] 履歴管理（D1 Database）
- [ ] プレゼンテーションプレビュー（iframe）
- [ ] Claude API統合（代替AI）
- [ ] ストリーミング生成（リアルタイム表示）

### 推奨される次のステップ
1. ✅ **AI統合完了**: OpenAI APIによる高度なコンテンツ生成
2. **画像生成統合**: DALL-E APIによる自動画像生成
3. **データ可視化**: Chart.js統合によるグラフ自動生成
4. **テンプレート拡張**: 業界別・用途別のテンプレート追加
5. **データ保存**: Cloudflare D1を使用した生成履歴の保存
6. **エクスポート形式追加**: PDF、Googleスライドへのエクスポート
7. **コラボレーション機能**: 複数ユーザーでの共同編集

## 🔐 セキュリティ

- API キーは環境変数で管理
- `.dev.vars`は`.gitignore`に含まれる
- Cloudflare Pages環境変数で本番管理
- クライアントサイドにAPIキーを露出しない

## 📄 ライセンス
MIT License

## 👤 作成者
ZH-NAOKI

## 📅 最終更新
2026-03-03

---

**Note**: このアプリケーションはGenSpark LLM API (OpenAI互換) を使用しています。
