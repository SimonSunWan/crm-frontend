# crm-frontend

基于 Vue 3 + TypeScript + Element Plus 的现代化 CRM 前端系统。

## 🚀 技术栈

- **框架**: Vue 3 + TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier + Stylelint
- **国际化**: Vue I18n
- **图表**: ECharts
- **编辑器**: WangEditor
- **工具库**: VueUse

## 📦 安装运行

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发环境

```bash
pnpm dev
```

### 生产构建

```bash
pnpm build
```

### 代码检查

```bash
# ESLint 检查
pnpm lint

# 自动修复
pnpm lint:fix

# Prettier 格式化
pnpm lint:prettier

# Stylelint 检查
pnpm lint:stylelint
```

## 📁 项目结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── composables/      # 组合式函数
├── config/           # 配置文件
├── directives/       # 自定义指令
├── enums/            # 枚举定义
├── locales/          # 国际化文件
├── mock/             # 模拟数据
├── router/           # 路由配置
├── store/            # 状态管理
├── types/            # TypeScript 类型
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── auth/         # 认证相关
│   ├── index/        # 首页
│   ├── order/        # 订单管理
│   ├── system/       # 系统管理
│   └── exception/    # 异常页面
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## ⚙️ 环境配置

项目支持多环境配置：

- `.env` - 默认环境变量
- `.env.development` - 开发环境
- `.env.production` - 生产环境

主要配置项：

```bash
VITE_VERSION = 2.5.5          # 版本号
VITE_PORT = 3000              # 开发端口
VITE_BASE_URL = /             # 网站地址前缀
VITE_API_URL = /api           # API地址前缀
VITE_ACCESS_MODE = backend    # 权限模式
```

## 🔧 开发特性

- **自动导入**: 组件和 API 自动导入，无需手动 import
- **类型安全**: 完整的 TypeScript 支持
- **代码规范**: 统一的代码风格和提交规范
- **性能优化**: 路由懒加载、组件按需加载
- **国际化**: 多语言支持
- **主题定制**: 支持主题切换和样式定制

## 📝 提交规范

项目使用 Conventional Commits 规范：

```bash
# 使用交互式提交
pnpm commit
```

## 📄 许可证

[MIT License](LICENSE)
