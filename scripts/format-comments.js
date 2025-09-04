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

class SafeCommentFormatter {
  constructor(content) {
    this.content = content
    this.length = content.length
    this.position = 0
    this.comments = []
  }

  parse() {
    while (this.position < this.length) {
      this.skipWhitespace()

      if (this.position >= this.length) break

      const char = this.content[this.position]

      if (char === '/') {
        this.handleSlash()
      } else if (char === '<') {
        this.handleHtmlComment()
      } else if (char === '"' || char === "'" || char === '`') {
        this.skipString(char)
      } else {
        this.position++
      }
    }

    return this.comments
  }

  handleSlash() {
    if (this.position + 1 >= this.length) {
      this.position++
      return
    }

    const nextChar = this.content[this.position + 1]

    if (nextChar === '/') {
      this.parseSingleLineComment()
    } else if (nextChar === '*') {
      this.parseBlockComment()
    } else {
      this.position++
    }
  }

  handleHtmlComment() {
    if (this.position + 3 >= this.length) {
      this.position++
      return
    }

    if (this.content.slice(this.position, this.position + 4) === '<!--') {
      this.parseHtmlComment()
    } else {
      this.position++
    }
  }

  parseSingleLineComment() {
    const start = this.position
    this.position += 2

    while (this.position < this.length && this.content[this.position] !== '\n') {
      this.position++
    }

    const end = this.position
    const original = this.content.slice(start, end)

    this.comments.push({
      start,
      end,
      original,
      type: 'single'
    })
  }

  parseBlockComment() {
    const start = this.position
    this.position += 2

    const isJSDoc = this.position < this.length && this.content[this.position] === '*'

    while (this.position < this.length - 1) {
      if (this.content[this.position] === '*' && this.content[this.position + 1] === '/') {
        this.position += 2
        break
      }
      this.position++
    }

    const end = this.position
    const original = this.content.slice(start, end)

    this.comments.push({
      start,
      end,
      original,
      type: isJSDoc ? 'jsdoc' : 'block'
    })
  }

  parseHtmlComment() {
    const start = this.position
    this.position += 4

    while (this.position < this.length - 2) {
      if (this.content.slice(this.position, this.position + 3) === '-->') {
        this.position += 3
        break
      }
      this.position++
    }

    const end = this.position
    const original = this.content.slice(start, end)

    this.comments.push({
      start,
      end,
      original,
      type: 'html'
    })
  }

  skipString(quote) {
    this.position++

    while (this.position < this.length) {
      const char = this.content[this.position]

      if (char === quote) {
        this.position++
        break
      } else if (char === '\\') {
        this.position += 2
      } else {
        this.position++
      }
    }
  }

  skipWhitespace() {
    while (this.position < this.length && /\s/.test(this.content[this.position])) {
      this.position++
    }
  }
}

function formatCommentContent(comment) {
  let content = comment
  let changed = false

  for (const [chinese, english] of Object.entries(punctuationMap)) {
    if (content.includes(chinese)) {
      content = content.replace(new RegExp(chinese, 'g'), english)
      changed = true
    }
  }

  if (content.startsWith('<!--') && content.endsWith('-->')) {
    const innerContent = content.slice(4, -3)
    const { content: formattedInner, changed: innerChanged } = formatInnerContent(innerContent)
    if (innerChanged) {
      content = '<!--' + formattedInner + '-->'
      changed = true
    }
  } else {
    const { content: formattedContent, changed: contentChanged } = formatInnerContent(content)
    if (contentChanged) {
      content = formattedContent
      changed = true
    }
  }

  return { content, changed }
}

function formatInnerContent(content) {
  let result = content
  let changed = false
  const punctuations = [',', '.', ';', ':', '!', '?']

  for (const punct of punctuations) {
    const regex = new RegExp(`\\${punct}([^\\s\\n\\r*/,.;:!?])`, 'g')
    const newContent = result.replace(regex, (match, nextChar) => {
      if (punct === '.' && /[a-zA-Z0-9_]/.test(nextChar)) {
        return match
      }
      if (punct === ':' && (nextChar === '/' || /[0-9]/.test(nextChar))) {
        return match
      }

      return punct + ' ' + nextChar
    })

    if (newContent !== result) {
      result = newContent
      changed = true
    }
  }

  return { content: result, changed }
}

function replacePunctuationInComments(content) {
  const formatter = new SafeCommentFormatter(content)
  const comments = formatter.parse()

  if (comments.length === 0) {
    return { content, changed: false }
  }

  let result = content
  let hasChanges = false

  for (let i = comments.length - 1; i >= 0; i--) {
    const comment = comments[i]
    const { content: newComment, changed } = formatCommentContent(comment.original)

    if (changed) {
      result = result.slice(0, comment.start) + newComment + result.slice(comment.end)
      hasChanges = true
    }
  }

  return { content: result, changed: hasChanges }
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

function processDirectory(dirPath, stats = { processed: 0, changed: 0, files: [] }) {
  const items = fs.readdirSync(dirPath)

  for (const item of items) {
    const itemPath = path.join(dirPath, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(path.basename(itemPath))) {
        processDirectory(itemPath, stats)
      }
    } else if (stat.isFile() && validExtensions.includes(path.extname(itemPath))) {
      processFile(itemPath, stats)
    }
  }

  return stats
}

function main() {
  const srcPath = path.resolve(__dirname, '../src')

  console.log('🚀 开始安全格式化注释中的标点符号...\n')
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

  console.log('\n✨ 安全注释格式化完成!')
}

main()

export { replacePunctuationInComments, SafeCommentFormatter, formatCommentContent }
