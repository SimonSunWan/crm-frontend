#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const punctuationMap = {
  '，': ',',
  '。': '.',
  '；': ';',
  '：': ':',
  '！': '!',
  '？': '?',
  '（': '(',
  '）': ')',
  '【': '[',
  '】': ']',
  '《': '<',
  '》': '>',
  '\u201c': '"',
  '\u201d': '"',
  '\u2018': "'",
  '\u2019': "'",
  '…': '...'
}

const validExtensions = ['.ts', '.js', '.vue', '.tsx', '.jsx']

const excludeDirs = ['node_modules', 'dist', '.git', 'public']

function shouldSkipSpacing(text, index) {
  const urlPatterns = [/https?:\/\/\S+/gi, /\w+\.\w+\.\w+/gi, /\w+\.\w+\/\S*/gi]

  for (const pattern of urlPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      if (index >= match.index && index < match.index + match[0].length) {
        return true
      }
    }
  }

  const beforeChar = text[index - 1] || ''
  const afterChar = text[index + 1] || ''

  if (/[a-zA-Z0-9_\-=&%#]/.test(beforeChar) && /[a-zA-Z0-9_\-=&%#]/.test(afterChar)) {
    return true
  }

  if (text[index] === '.' && /[a-zA-Z0-9_]/.test(beforeChar) && /[a-zA-Z0-9_]/.test(afterChar)) {
    return true
  }

  if (text[index] === ':' && text.slice(index + 1, index + 3) === '//') {
    return true
  }

  return false
}

function formatCommentPunctuation(comment) {
  let newComment = comment
  let changed = false

  for (const [chinese, english] of Object.entries(punctuationMap)) {
    if (newComment.includes(chinese)) {
      newComment = newComment.replace(new RegExp(chinese, 'g'), english)
      changed = true
    }
  }

  const punctuations = [',', '.', ';', ':', '!', '?']

  for (const punct of punctuations) {
    for (let i = 0; i < newComment.length; i++) {
      if (newComment[i] === punct) {
        const nextChar = newComment[i + 1]

        if (nextChar && !/[\s\n\r*/,.;:!?]/.test(nextChar)) {
          if (!shouldSkipSpacing(newComment, i)) {
            const beforeText = newComment.slice(Math.max(0, i - 10), i)
            const isLabelColon = punct === ':' && /[a-zA-Z\u4e00-\u9fa5]+$/.test(beforeText.trim())

            if ((punct === ':' && isLabelColon) || punct !== ':') {
              newComment = newComment.slice(0, i + 1) + ' ' + newComment.slice(i + 1)
              changed = true
              i++
            }
          }
        }
      }
    }
  }

  const cleanupRules = [
    { pattern: /\s+([,.;:!?])/g, replacement: '$1' },
    { pattern: /([,.;:!?])\s{2,}/g, replacement: '$1 ' },
    { pattern: /([^/*\s])\s+$/gm, replacement: '$1' }
  ]

  for (const rule of cleanupRules) {
    const before = newComment
    newComment = newComment.replace(rule.pattern, rule.replacement)
    if (newComment !== before) {
      changed = true
    }
  }

  return { content: newComment, changed }
}

function replacePunctuationInComments(content) {
  let result = content
  let changed = false

  result = result.replace(/\/\/.*$/gm, match => {
    const { content: newComment, changed: isChanged } = formatCommentPunctuation(match)
    if (isChanged) {
      changed = true
    }
    return newComment
  })

  result = result.replace(/\/\*[\s\S]*?\*\//g, match => {
    const { content: newComment, changed: isChanged } = formatCommentPunctuation(match)
    if (isChanged) {
      changed = true
    }
    return newComment
  })

  result = result.replace(/\/\*\*[\s\S]*?\*\//g, match => {
    const { content: newComment, changed: isChanged } = formatCommentPunctuation(match)
    if (isChanged) {
      changed = true
    }
    return newComment
  })

  return { content: result, changed }
}

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath)
  return validExtensions.includes(ext)
}

function shouldExcludeDir(dirPath) {
  const dirName = path.basename(dirPath)
  return excludeDirs.includes(dirName)
}

function processDirectory(dirPath, stats = { processed: 0, changed: 0, files: [] }) {
  const items = fs.readdirSync(dirPath)

  for (const item of items) {
    const itemPath = path.join(dirPath, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      if (!shouldExcludeDir(itemPath)) {
        processDirectory(itemPath, stats)
      }
    } else if (stat.isFile() && shouldProcessFile(itemPath)) {
      processFile(itemPath, stats)
    }
  }

  return stats
}

function processFile(filePath, stats) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const { content: newContent, changed } = replacePunctuationInComments(content)

    stats.processed++

    if (changed) {
      fs.writeFileSync(filePath, newContent, 'utf8')
      stats.changed++
      stats.files.push(filePath)
      console.log(`✓ 已更新: ${filePath}`)
    }
  } catch (error) {
    console.error(`✗ 处理文件失败: ${filePath}`, error.message)
  }
}

function main() {
  const srcPath = path.resolve(__dirname, '../src')

  console.log('🚀 开始格式化注释中的标点符号...\n')
  console.log(`处理目录: ${srcPath}\n`)

  const startTime = Date.now()
  const stats = processDirectory(srcPath)
  const endTime = Date.now()

  console.log('\n📊 处理完成统计:')
  console.log(`处理文件数: ${stats.processed}`)
  console.log(`修改文件数: ${stats.changed}`)
  console.log(`处理耗时: ${endTime - startTime}ms`)

  if (stats.files.length > 0) {
    console.log('\n📝 修改的文件:')
    stats.files.forEach(file => {
      console.log(`  - ${path.relative(process.cwd(), file)}`)
    })
  }

  console.log('\n✨ 注释格式化完成!')
}

main()

export {
  replacePunctuationInComments,
  formatCommentPunctuation,
  shouldSkipSpacing,
  processDirectory
}
