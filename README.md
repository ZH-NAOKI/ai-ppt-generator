# AI PowerPoint Generator

## プロジェクト概要
プロンプトを入力するだけで、提案資料や報告書などのパワーポイントを自動生成するWebアプリケーションです。

## 主な機能
- 📝 **プロンプト入力**: 自由形式のテキストで資料内容を指定
- 📊 **資料タイプ選択**: 提案資料、報告書、分析資料、プレゼンテーション
- 🎯 **スライド数指定**: 5/10/15/20スライドから選択可能
- 👀 **プレビュー機能**: 生成前にスライド構成を確認
- 💾 **ダウンロード機能**: .pptx形式でダウンロード可能

## URLs
- **GitHub**: https://github.com/ZH-NAOKI/ai-ppt-generator
- **デモ**: https://3000-iaqf59pcw2880p20xfhd8-cc2fbc16.sandbox.novita.ai

## 技術スタック
- **フレームワーク**: Hono (v4.12.3)
- **PowerPoint生成**: PptxGenJS (v4.0.1)
- **スタイリング**: Tailwind CSS (CDN)
- **デプロイ**: Cloudflare Pages
- **言語**: TypeScript

## プロジェクト構成
```
webapp/
├── src/
│   ├── index.tsx          # メインアプリケーション
│   └── renderer.tsx       # HTMLレンダラー
├── public/
│   └── static/
│       ├── style.css      # カスタムスタイル
│       └── app.js         # フロントエンドロジック
├── ecosystem.config.cjs   # PM2設定
├── wrangler.jsonc         # Cloudflare設定
├── package.json           # 依存関係
└── README.md              # このファイル
```

## 実装済み機能

### 1. プロンプト入力フォーム
- テキストエリアでプロンプト入力
- 資料タイプ選択（提案資料/報告書/分析資料/プレゼンテーション）
- スライド数選択（5/10/15/20）

### 2. PowerPoint生成API (`/api/generate`)
- プロンプト解析
- 資料タイプに応じたスライド構成生成
- PptxGenJSによるPowerPoint生成
- Base64エンコードでフロントエンドに返却

### 3. スライド構成
- **タイトルスライド**: 資料タイトルと日付
- **コンテンツスライド**: 
  - 箇条書き（bullet）
  - テキスト（text）
  - テーブル（table）
- **最終スライド**: 「ご清聴ありがとうございました」

### 4. 資料タイプ別テンプレート
- **提案資料**: 目次、背景と課題、提案内容、期待される効果、スケジュール
- **報告書**: エグゼクティブサマリー、調査方法、主要な発見事項
- **分析資料**: 分析の目的、SWOT分析、分析結果サマリー
- **プレゼンテーション**: アジェンダ、主要トピック

## ローカル開発

### セットアップ
```bash
# 依存関係のインストール
npm install

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

## デプロイ

### Cloudflare Pagesへのデプロイ
```bash
# ビルド
npm run build

# デプロイ
npm run deploy:prod
```

## データアーキテクチャ

### スライドデータ構造
```typescript
{
  title: string,           // 資料タイトル
  subtitle: string,        // サブタイトル（日付）
  content: [
    {
      title: string,       // スライドタイトル
      type: 'bullet' | 'text' | 'table',
      bullets?: Array,     // 箇条書き項目
      content?: string,    // テキストコンテンツ
      tableData?: Array    // テーブルデータ
    }
  ]
}
```

### PowerPoint出力形式
- **形式**: .pptx (Office Open XML)
- **エンコード**: Base64（API → フロントエンド）
- **ダウンロード**: Blob API使用

## 今後の実装予定

### 未実装機能
- [ ] AI統合（OpenAI/Claude APIによる高度なコンテンツ生成）
- [ ] カスタムテンプレート選択
- [ ] 画像・チャートの自動挿入
- [ ] 複数言語対応
- [ ] ユーザー認証
- [ ] 履歴管理（D1 Database）
- [ ] プレゼンテーションプレビュー（iframe）

### 推奨される次のステップ
1. **AI統合**: OpenAI APIを使用してプロンプトから高品質なコンテンツを自動生成
2. **テンプレート拡張**: 業界別・用途別のテンプレート追加
3. **データ保存**: Cloudflare D1を使用した生成履歴の保存
4. **エクスポート形式追加**: PDF、Googleスライドへのエクスポート
5. **コラボレーション機能**: 複数ユーザーでの共同編集

## ライセンス
MIT License

## 作成者
ZH-NAOKI

## 最終更新
2026-03-03
