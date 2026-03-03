import OpenAI from 'openai'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as os from 'os'
import * as path from 'path'

// OpenAIクライアントの初期化
export function createOpenAIClient(env?: any) {
  // Cloudflare環境の場合
  if (env?.OPENAI_API_KEY && env?.OPENAI_BASE_URL) {
    return new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL
    })
  }

  // ローカル環境の場合: ~/.genspark_llm.yaml から設定を読み込み
  try {
    const configPath = path.join(os.homedir(), '.genspark_llm.yaml')
    if (fs.existsSync(configPath)) {
      const fileContents = fs.readFileSync(configPath, 'utf8')
      const config: any = yaml.load(fileContents)
      
      return new OpenAI({
        apiKey: config?.openai?.api_key || process.env.OPENAI_API_KEY || '',
        baseURL: config?.openai?.base_url || process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
      })
    }
  } catch (error) {
    console.warn('Failed to load config from ~/.genspark_llm.yaml:', error)
  }

  // フォールバック: 環境変数から取得
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
  })
}

// AIを使用してスライド構成を生成
export async function generateSlideContentWithAI(
  prompt: string,
  documentType: string,
  slideCount: number,
  env?: any
): Promise<any> {
  const client = createOpenAIClient(env)

  const systemPrompt = `あなたはプロフェッショナルなプレゼンテーション資料作成のエキスパートです。
ユーザーのプロンプトに基づいて、PowerPoint資料のスライド構成を生成してください。

資料タイプ: ${documentType}
スライド数: ${slideCount}枚（タイトルスライドと最終スライドを含む）

以下のJSON形式で返してください：
{
  "title": "資料のタイトル",
  "subtitle": "サブタイトル（日付など）",
  "content": [
    {
      "title": "スライドタイトル",
      "type": "bullet" | "text" | "table",
      "bullets": [{"text": "項目1", "options": {}}, {"text": "項目2", "options": {}}],
      "content": "テキストコンテンツ（typeがtextの場合）",
      "tableData": [配列の配列]（typeがtableの場合）
    }
  ]
}

要件:
- タイトルスライドと最終スライドは除き、contentに${slideCount - 2}個のスライドを含めること
- 各スライドは明確な構造を持ち、視覚的に分かりやすい内容にすること
- 箇条書きは3-5項目程度に抑えること
- テーブルは見やすく整理されたデータにすること
- 日本語で自然な表現を使用すること`

  const userPrompt = `以下の内容で${documentType}を作成してください：

${prompt}

上記の要件に基づいて、${slideCount}枚のスライド構成（タイトルと最終スライドを含む）をJSON形式で生成してください。`

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    // JSONの抽出（コードブロックで囲まれている場合に対応）
    let jsonText = responseText
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    // JSONパース
    const slideData = JSON.parse(jsonText)
    
    // 日付をサブタイトルに追加（指定されていない場合）
    if (!slideData.subtitle) {
      slideData.subtitle = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    return slideData
  } catch (error: any) {
    console.error('AI generation error:', error)
    throw new Error(`AI生成エラー: ${error.message}`)
  }
}

// スライドタイプの定義
export type SlideType = 'bullet' | 'text' | 'table'

export interface SlideContent {
  title: string
  type: SlideType
  bullets?: Array<{ text: string; options?: any }>
  content?: string
  tableData?: any[][]
}

export interface SlideStructure {
  title: string
  subtitle: string
  content: SlideContent[]
}
