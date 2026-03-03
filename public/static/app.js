// PowerPoint生成フォームの処理
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pptForm')
  const generateBtn = document.getElementById('generateBtn')
  const btnText = document.getElementById('btnText')
  const btnLoader = document.getElementById('btnLoader')
  const previewDiv = document.getElementById('preview')
  const slidesList = document.getElementById('slidesList')
  const errorDiv = document.getElementById('error')

  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    // フォームデータ取得
    const formData = new FormData(form)
    const data = {
      prompt: formData.get('prompt'),
      documentType: formData.get('documentType'),
      slideCount: formData.get('slideCount'),
      useAI: formData.get('useAI') === 'on'
    }

    // バリデーション
    if (!data.prompt || data.prompt.trim().length === 0) {
      showError('プロンプトを入力してください')
      return
    }

    // UI更新: ローディング状態
    generateBtn.disabled = true
    btnText.classList.add('hidden')
    btnLoader.classList.remove('hidden')
    errorDiv.classList.add('hidden')
    previewDiv.classList.add('hidden')

    try {
      // API呼び出し
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'PowerPoint生成に失敗しました')
      }

      // プレビュー表示
      displayPreview(result.slides, result.generatedWithAI)

      // ダウンロードボタン作成
      createDownloadButton(result.pptx, result.filename)

      // 成功メッセージ
      const message = result.generatedWithAI
        ? '✨ AIによるPowerPointが正常に生成されました!'
        : 'PowerPointが正常に生成されました!'
      showSuccess(message)
    } catch (error) {
      console.error('Error:', error)
      showError(error.message || 'エラーが発生しました')
    } finally {
      // UI復元
      generateBtn.disabled = false
      btnText.classList.remove('hidden')
      btnLoader.classList.add('hidden')
    }
  })

  // プレビュー表示
  function displayPreview(slides, generatedWithAI = false) {
    slidesList.innerHTML = ''

    // AI生成バッジ
    if (generatedWithAI) {
      const aiBadge = document.createElement('div')
      aiBadge.className = 'ai-badge'
      aiBadge.innerHTML = '🤖 AI生成コンテンツ'
      aiBadge.style.marginBottom = '1rem'
      slidesList.appendChild(aiBadge)
    }

    // タイトルスライド
    const titleSlide = document.createElement('div')
    titleSlide.className = 'slide-preview'
    titleSlide.innerHTML = `
      <h3>📄 タイトルスライド</h3>
      <p><strong>${slides.title}</strong></p>
      <p>${slides.subtitle}</p>
    `
    slidesList.appendChild(titleSlide)

    // コンテンツスライド
    slides.content.forEach((slide, index) => {
      const slideDiv = document.createElement('div')
      slideDiv.className = 'slide-preview'

      let contentHtml = ''
      if (slide.type === 'bullet') {
        const bullets = slide.bullets
          .map((b) => `<li>${typeof b === 'string' ? b : b.text}</li>`)
          .join('')
        contentHtml = `<ul style="margin-left: 1.5rem; margin-top: 0.5rem;">${bullets}</ul>`
      } else if (slide.type === 'text') {
        contentHtml = `<p style="margin-top: 0.5rem; white-space: pre-line;">${slide.content}</p>`
      } else if (slide.type === 'table') {
        contentHtml = '<p style="margin-top: 0.5rem; color: #666;">📊 テーブルデータ</p>'
      }

      slideDiv.innerHTML = `
        <h3>📊 スライド ${index + 2}: ${slide.title}</h3>
        ${contentHtml}
      `
      slidesList.appendChild(slideDiv)
    })

    // 最終スライド
    const endSlide = document.createElement('div')
    endSlide.className = 'slide-preview'
    endSlide.innerHTML = `
      <h3>🎉 最終スライド</h3>
      <p>ご清聴ありがとうございました</p>
    `
    slidesList.appendChild(endSlide)

    previewDiv.classList.remove('hidden')
  }

  // ダウンロードボタン作成
  function createDownloadButton(base64Data, filename) {
    // 既存のボタンを削除
    const existingBtn = document.getElementById('downloadBtn')
    if (existingBtn) {
      existingBtn.remove()
    }

    const downloadBtn = document.createElement('a')
    downloadBtn.id = 'downloadBtn'
    downloadBtn.className = 'download-btn'
    downloadBtn.textContent = '📥 PowerPointをダウンロード'

    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault()

      try {
        // Base64をBlobに変換
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        })

        // ダウンロード
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        showSuccess('ダウンロードを開始しました!')
      } catch (error) {
        console.error('Download error:', error)
        showError('ダウンロード中にエラーが発生しました')
      }
    })

    previewDiv.appendChild(downloadBtn)
  }

  // エラー表示
  function showError(message) {
    errorDiv.textContent = '❌ ' + message
    errorDiv.classList.remove('hidden')
  }

  // 成功メッセージ表示
  function showSuccess(message) {
    errorDiv.textContent = '✅ ' + message
    errorDiv.style.background = '#d4edda'
    errorDiv.style.border = '1px solid #c3e6cb'
    errorDiv.style.color = '#155724'
    errorDiv.classList.remove('hidden')

    setTimeout(() => {
      errorDiv.classList.add('hidden')
      errorDiv.style.background = ''
      errorDiv.style.border = ''
      errorDiv.style.color = ''
    }, 5000)
  }
})
