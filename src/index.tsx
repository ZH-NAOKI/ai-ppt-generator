import { Hono } from 'hono'
import { renderer } from './renderer'
import PptxGenJS from 'pptxgenjs'

const app = new Hono()

app.use(renderer)

// ホームページ - プロンプト入力フォーム
app.get('/', (c) => {
  return c.render(
    <div class="container">
      <header>
        <h1>📊 AI PowerPoint Generator</h1>
        <p>プロンプトを入力して、提案資料や報告書などのパワーポイントを自動生成します</p>
      </header>

      <div class="form-container">
        <form id="pptForm">
          <div class="form-group">
            <label for="prompt">プロンプト入力</label>
            <textarea
              id="prompt"
              name="prompt"
              rows="8"
              placeholder="例: 新商品の市場分析レポートを作成してください。対象市場、競合分析、SWOT分析、売上予測を含めてください。"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="documentType">資料タイプ</label>
            <select id="documentType" name="documentType">
              <option value="proposal">提案資料</option>
              <option value="report">報告書</option>
              <option value="analysis">分析資料</option>
              <option value="presentation">プレゼンテーション</option>
            </select>
          </div>

          <div class="form-group">
            <label for="slideCount">スライド数</label>
            <select id="slideCount" name="slideCount">
              <option value="5">5スライド</option>
              <option value="10" selected>10スライド</option>
              <option value="15">15スライド</option>
              <option value="20">20スライド</option>
            </select>
          </div>

          <button type="submit" id="generateBtn">
            <span id="btnText">パワーポイントを生成</span>
            <span id="btnLoader" class="hidden">生成中...</span>
          </button>
        </form>

        <div id="preview" class="hidden">
          <h2>プレビュー</h2>
          <div id="slidesList"></div>
        </div>

        <div id="error" class="error hidden"></div>
      </div>
    </div>
  )
})

// API: PowerPoint生成
app.post('/api/generate', async (c) => {
  try {
    const body = await c.req.json()
    const { prompt, documentType, slideCount } = body

    // プロンプトに基づいてスライド構成を生成
    const slides = generateSlideStructure(prompt, documentType, parseInt(slideCount))

    // PowerPoint生成
    const pptx = new PptxGenJS()
    
    // タイトルスライド
    const titleSlide = pptx.addSlide()
    titleSlide.background = { color: '1F4788' }
    titleSlide.addText(slides.title, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    })
    titleSlide.addText(slides.subtitle, {
      x: 0.5,
      y: 4.0,
      w: 9,
      h: 0.5,
      fontSize: 20,
      color: 'E0E0E0',
      align: 'center'
    })

    // 各スライドを生成
    slides.content.forEach((slideData: any) => {
      const slide = pptx.addSlide()
      
      // タイトル
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.75,
        fontSize: 32,
        bold: true,
        color: '1F4788'
      })

      // コンテンツタイプに応じて配置
      if (slideData.type === 'bullet') {
        slide.addText(slideData.bullets, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 4,
          fontSize: 18,
          bullet: true,
          color: '333333'
        })
      } else if (slideData.type === 'table') {
        slide.addTable(slideData.tableData, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 3,
          fontSize: 14,
          color: '333333'
        })
      } else if (slideData.type === 'text') {
        slide.addText(slideData.content, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 4,
          fontSize: 18,
          color: '333333'
        })
      }
    })

    // 最終スライド
    const endSlide = pptx.addSlide()
    endSlide.background = { color: '1F4788' }
    endSlide.addText('ご清聴ありがとうございました', {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1.5,
      fontSize: 40,
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    })

    // PowerPointをバイナリとして生成
    const pptxData = await pptx.write({ outputType: 'arraybuffer' })

    // Base64エンコード
    const base64 = Buffer.from(pptxData as ArrayBuffer).toString('base64')

    return c.json({
      success: true,
      slides: slides,
      pptx: base64,
      filename: `${documentType}_${Date.now()}.pptx`
    })
  } catch (error: any) {
    console.error('Generation error:', error)
    return c.json(
      {
        success: false,
        error: error.message || 'PowerPoint生成中にエラーが発生しました'
      },
      500
    )
  }
})

// スライド構成を生成する関数
function generateSlideStructure(prompt: string, documentType: string, slideCount: number) {
  // 簡易的なスライド構成生成（実際のAI統合は後で実装可能）
  const title = extractTitle(prompt, documentType)
  const subtitle = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const content = []

  // 資料タイプごとの基本構成
  if (documentType === 'proposal') {
    content.push({
      title: '目次',
      type: 'bullet',
      bullets: [
        { text: '背景と課題', options: {} },
        { text: '提案内容', options: {} },
        { text: '期待される効果', options: {} },
        { text: '実施スケジュール', options: {} },
        { text: '予算概算', options: {} }
      ]
    })
    content.push({
      title: '背景と課題',
      type: 'bullet',
      bullets: [
        { text: '現状の課題認識', options: {} },
        { text: '解決すべき問題点', options: {} },
        { text: '対応の必要性', options: {} }
      ]
    })
    content.push({
      title: '提案内容',
      type: 'bullet',
      bullets: [
        { text: '提案の概要', options: {} },
        { text: '具体的なアプローチ', options: {} },
        { text: '実施方法', options: {} }
      ]
    })
  } else if (documentType === 'report') {
    content.push({
      title: 'エグゼクティブサマリー',
      type: 'bullet',
      bullets: [
        { text: '報告の目的', options: {} },
        { text: '主要な発見事項', options: {} },
        { text: '推奨事項', options: {} }
      ]
    })
    content.push({
      title: '調査方法',
      type: 'text',
      content: '本報告書は、以下の方法論に基づいて実施されました。\n\n• データ収集\n• 分析手法\n• 評価基準'
    })
    content.push({
      title: '主要な発見事項',
      type: 'bullet',
      bullets: [
        { text: '発見事項1: 重要なトレンド', options: {} },
        { text: '発見事項2: 課題の特定', options: {} },
        { text: '発見事項3: 機会の発見', options: {} }
      ]
    })
  } else if (documentType === 'analysis') {
    content.push({
      title: '分析の目的',
      type: 'bullet',
      bullets: [
        { text: '分析の背景', options: {} },
        { text: '分析対象', options: {} },
        { text: '期待される成果', options: {} }
      ]
    })
    content.push({
      title: 'SWOT分析',
      type: 'table',
      tableData: [
        [
          { text: '強み (Strengths)', options: { bold: true, fill: '4472C4', color: 'FFFFFF' } },
          { text: '弱み (Weaknesses)', options: { bold: true, fill: 'ED7D31', color: 'FFFFFF' } }
        ],
        [
          { text: '• 競争優位性\n• 独自技術\n• 強固な顧客基盤', options: {} },
          { text: '• リソース不足\n• 技術的課題\n• 市場認知度', options: {} }
        ],
        [
          { text: '機会 (Opportunities)', options: { bold: true, fill: '70AD47', color: 'FFFFFF' } },
          { text: '脅威 (Threats)', options: { bold: true, fill: 'C00000', color: 'FFFFFF' } }
        ],
        [
          { text: '• 市場成長\n• 新技術\n• パートナーシップ', options: {} },
          { text: '• 競合参入\n• 規制変更\n• 経済動向', options: {} }
        ]
      ]
    })
    content.push({
      title: '分析結果サマリー',
      type: 'bullet',
      bullets: [
        { text: '主要な分析結果', options: {} },
        { text: 'リスクと機会', options: {} },
        { text: '戦略的示唆', options: {} }
      ]
    })
  } else {
    // プレゼンテーション
    content.push({
      title: 'アジェンダ',
      type: 'bullet',
      bullets: [
        { text: 'イントロダクション', options: {} },
        { text: '主要トピック', options: {} },
        { text: 'まとめ', options: {} }
      ]
    })
  }

  // スライド数に合わせて調整
  while (content.length < slideCount - 2) {
    content.push({
      title: `セクション ${content.length + 1}`,
      type: 'bullet',
      bullets: [
        { text: 'ポイント1: 重要な情報', options: {} },
        { text: 'ポイント2: 詳細な説明', options: {} },
        { text: 'ポイント3: 具体的な事例', options: {} }
      ]
    })
  }

  return {
    title,
    subtitle,
    content: content.slice(0, slideCount - 2)
  }
}

function extractTitle(prompt: string, documentType: string): string {
  // プロンプトから簡易的にタイトルを抽出
  const typeNames: { [key: string]: string } = {
    proposal: '提案資料',
    report: '報告書',
    analysis: '分析資料',
    presentation: 'プレゼンテーション'
  }

  // プロンプトの最初の30文字を取得するか、デフォルトタイトルを使用
  const promptTitle = prompt.slice(0, 30).trim()
  if (promptTitle.length > 0) {
    return promptTitle
  }

  return typeNames[documentType] || 'PowerPoint資料'
}

export default app
