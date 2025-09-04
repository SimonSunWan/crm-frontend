/**
 * Utils 工具函数统一导出
 * 提供向后兼容性和便捷导入
 */

// UI 相关
export * from './ui'

// 浏览器相关
export * from './browser'

// 数据处理相关
export * from './dataprocess'

// 路由导航相关
export * from './navigation'

// 系统管理相关
export * from './sys'

// 常量定义相关
export * from './constants'

// 存储相关
export * from './storage'

// 主题相关
export * from './theme'

// HTTP 相关
export * from './http'

// 验证相关
export * from './validation'

/**
 * 获取完整的头像URL
 * @param avatarPath 头像路径
 * @returns 完整的头像URL
 */
export function getAvatarUrl(avatarPath?: string): string {
  if (!avatarPath) return ''

  // 如果已经是完整URL, 直接返回
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }

  // 如果是相对路径, 加上API代理URL前缀
  const apiProxyUrl = import.meta.env.VITE_API_PROXY_URL || ''
  return `${apiProxyUrl}${avatarPath}`
}
