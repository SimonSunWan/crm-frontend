import { App, Directive } from 'vue'
import hljs from 'highlight.js'
import { ElMessage } from 'element-plus'

function highlightCode(block: HTMLElement) {
  hljs.highlightElement(block)
}

function insertLineNumbers(block: HTMLElement) {
  const lines = block.innerHTML.split('\n')
  const numberedLines = lines
    .map((line, index) => {
      return `<span class="line-number">${index + 1}</span> ${line}`
    })
    .join('\n')
  block.innerHTML = numberedLines
}

function addCopyButton(block: HTMLElement) {
  const copyButton = document.createElement('i')
  copyButton.className = 'copy-button iconfont-sys'
  copyButton.innerHTML = '&#xe7b2;'
  copyButton.onclick = () => {
    const codeContent = block.innerText.replace(/^\d+\s+/gm, '')
    navigator.clipboard.writeText(codeContent).then(() => {
      ElMessage.success('复制成功')
    })
  }

  const preElement = block.parentElement
  if (preElement) {
    let codeWrapper: HTMLElement
    if (!block.parentElement.classList.contains('code-wrapper')) {
      codeWrapper = document.createElement('div')
      codeWrapper.className = 'code-wrapper'
      preElement.replaceChild(codeWrapper, block)
      codeWrapper.appendChild(block)
    } else {
      codeWrapper = block.parentElement
    }
    preElement.appendChild(copyButton)
  }
}

function isBlockProcessed(block: HTMLElement): boolean {
  return (
    block.hasAttribute('data-highlighted') ||
    !!block.querySelector('.line-number') ||
    !!block.parentElement?.querySelector('.copy-button')
  )
}

function markBlockAsProcessed(block: HTMLElement) {
  block.setAttribute('data-highlighted', 'true')
}

function processBlock(block: HTMLElement) {
  if (isBlockProcessed(block)) {
    return
  }

  try {
    highlightCode(block)
    insertLineNumbers(block)
    addCopyButton(block)
    markBlockAsProcessed(block)
  } catch {}
}

function processAllCodeBlocks(el: HTMLElement) {
  const blocks = Array.from(el.querySelectorAll<HTMLElement>('pre code'))
  const unprocessedBlocks = blocks.filter(block => !isBlockProcessed(block))

  if (unprocessedBlocks.length === 0) {
    return
  }

  if (unprocessedBlocks.length <= 10) {
    unprocessedBlocks.forEach(block => processBlock(block))
  } else {
    const batchSize = 10
    let currentIndex = 0

    const processBatch = () => {
      const batch = unprocessedBlocks.slice(currentIndex, currentIndex + batchSize)

      batch.forEach(block => {
        processBlock(block)
      })

      currentIndex += batchSize
      if (currentIndex < unprocessedBlocks.length) {
        requestAnimationFrame(processBatch)
      }
    }

    processBatch()
  }
}

function retryProcessing(el: HTMLElement, maxRetries: number = 3, delay: number = 200) {
  let retryCount = 0

  const tryProcess = () => {
    processAllCodeBlocks(el)

    const remainingBlocks = Array.from(el.querySelectorAll<HTMLElement>('pre code')).filter(
      block => !isBlockProcessed(block)
    )

    if (remainingBlocks.length > 0 && retryCount < maxRetries) {
      retryCount++
      setTimeout(tryProcess, delay * retryCount)
    }
  }

  tryProcess()
}

const highlightDirective: Directive<HTMLElement> = {
  mounted(el: HTMLElement) {
    processAllCodeBlocks(el)

    setTimeout(() => {
      retryProcessing(el)
    }, 100)

    const observer = new MutationObserver(mutations => {
      let hasNewCodeBlocks = false

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement
              if (element.tagName === 'PRE' || element.querySelector('pre code')) {
                hasNewCodeBlocks = true
              }
            }
          })
        }
      })

      if (hasNewCodeBlocks) {
        setTimeout(() => {
          processAllCodeBlocks(el)
        }, 50)
      }
    })

    observer.observe(el, {
      childList: true,
      subtree: true
    })
    ;(el as any)._highlightObserver = observer
  },

  updated(el: HTMLElement) {
    setTimeout(() => {
      processAllCodeBlocks(el)
    }, 50)
  },

  unmounted(el: HTMLElement) {
    const observer = (el as any)._highlightObserver
    if (observer) {
      observer.disconnect()
      delete (el as any)._highlightObserver
    }
  }
}

export function setupHighlightDirective(app: App) {
  app.directive('highlight', highlightDirective)
}
