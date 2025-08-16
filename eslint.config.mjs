// 从URL和路径模块中导入必要的功能
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// 从ESLint插件中导入推荐配置
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// 使用import.meta.url获取当前模块的路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 读取.auto-import.json文件的内容, 并将其解析为JSON对象
const autoImportConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.auto-import.json'), 'utf-8')
)

export default [
  // 指定文件匹配规则
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}']
  },
  // 指定全局变量和环境
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  // 扩展配置
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  // 自定义规则
  {
    // 针对所有JavaScript、TypeScript和Vue文件应用以下配置
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      globals: {
        // 合并从autoImportConfig中读取的全局变量配置
        ...autoImportConfig.globals,
        // TypeScript全局命名空间
        Api: 'readonly',
        Form: 'readonly'
      }
    },
    rules: {
      quotes: ['error', 'single'], // 使用单引号
      semi: ['error', 'never'], // 语句末尾不加分号
      'no-var': 'error', // 要求使用let或const而不是var
      '@typescript-eslint/no-explicit-any': 'off', // 禁用any检查
      'vue/multi-word-component-names': 'off', // 禁用对vue组件名称的多词要求检查
      'no-multiple-empty-lines': ['warn', { max: 1 }], // 不允许多个空行
      'no-unexpected-multiline': 'error' // 禁止空余的多行
    }
  },
  // vue规则
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser }
    }
  },
  // 忽略文件
  {
    ignores: [
      'node_modules',
      'dist',
      'public',
      '.vscode/**',
      'src/assets/**',
      'src/utils/console.ts'
    ]
  },
  // prettier配置
  eslintPluginPrettierRecommended
]
