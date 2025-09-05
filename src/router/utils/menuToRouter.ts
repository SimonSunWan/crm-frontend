import { AppRouteRecord } from '@/types/router'

/**
 * 将菜单数据转换为路由配置
 * @param route 菜单数据对象
 * @param parentPath 父级路径
 * @returns 处理后的路由配置
 */
export const menuDataToRouter = (route: AppRouteRecord, parentPath = ''): AppRouteRecord => {
  const fullPath = buildRoutePath(route, parentPath)

  // 检测组件配置并给出警告
  validateComponent(route, parentPath)

  return {
    ...route,
    path: fullPath,
    children: processChildren(route.children || [], fullPath)
  }
}

/**
 * 构建路由完整路径
 * @param route 菜单数据对象
 * @param parentPath 父级路径
 * @returns 构建后的完整路径
 */
const buildRoutePath = (route: AppRouteRecord, parentPath: string): string => {
  if (!route.path) return ''

  // 拼接并规范化路径
  return parentPath ? `${parentPath}/${route.path}`.replace(/\/+/g, '/') : route.path
}

/**
 * 处理子路由
 * @param children 子路由数组
 * @param parentPath 父级路径
 * @returns 处理后的子路由数组
 */
const processChildren = (children: AppRouteRecord[], parentPath: string): AppRouteRecord[] => {
  if (!Array.isArray(children) || children.length === 0) return []

  return children.map(child => menuDataToRouter(child, parentPath))
}

/**
 * 检查 component 是否有效
 * @param route 路由对象
 * @param parentPath 父级路径
 */
const validateComponent = (route: AppRouteRecord, parentPath: string): void => {
  const hasExternalLink = !!route.meta?.link?.trim()
  const hasChildren = Array.isArray(route.children) && route.children.length > 0

  // 检查一级父级菜单的 component 配置是否为空
  if (parentPath === '' && !route.component) {
    // 一级父级菜单的 component 不存在或为空
  }

  // 检查 component 是否为空字符串
  if (!route.component) {
    /* 如果不是特殊情况, 则给出警告 */
    if (!hasExternalLink && !hasChildren) {
      // component 不存在或为空
    }
  }
}
