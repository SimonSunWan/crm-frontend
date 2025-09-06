import type { Router, RouteRecordRaw } from 'vue-router'
import type { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'
import { useMenuStore } from '@/store/modules/menu'

const modules: Record<string, () => Promise<any>> = import.meta.glob('../../views/**/*.vue')
const componentCache = new Map<string, (() => Promise<any>) | null>()
export function registerDynamicRoutes(router: Router, menuList: AppRouteRecord[]): void {
  const removeRouteFns: (() => void)[] = []
  checkDuplicateRoutes(menuList)

  menuList.forEach(route => {
    if (route.meta?.isLink) return
    if (route.name && route.component && !router.hasRoute(route.name)) {
      const routeConfig = convertRouteComponent(route)
      if (routeConfig) {
        removeRouteFns.push(router.addRoute(routeConfig as RouteRecordRaw))
      }
    }
  })

  useMenuStore().addRemoveRouteFns(removeRouteFns)
}
/**
 * 路径解析函数: 处理父路径和子路径的拼接
 */
function resolvePath(parent: string, child: string): string {
  return [parent.replace(/\/$/, ''), child.replace(/^\//, '')].filter(Boolean).join('/')
}

/**
 * 检测菜单中的重复路由(包括子路由)
 */
function checkDuplicateRoutes(routes: AppRouteRecord[], parentPath = ''): void {
  // 用于检测动态路由中的重复项
  const routeNameMap = new Map<string, string>() // 路由名称 -> 路径
  const componentPathMap = new Map<string, string>() // 组件路径 -> 路由信息

  const checkRoutes = (routes: AppRouteRecord[], parentPath = '') => {
    routes.forEach(route => {
      // 处理路径拼接
      const currentPath = route.path || ''
      const fullPath = resolvePath(parentPath, currentPath)

      // 名称重复检测
      if (route.name) {
        if (routeNameMap.has(String(route.name))) {
          // 路由名称重复警告
        } else {
          routeNameMap.set(String(route.name), fullPath)
        }
      }

      // 组件路径重复检测
      if (route.component) {
        const componentPath = getComponentPathString(route.component)

        if (componentPath && componentPath !== RoutesAlias.Layout) {
          const componentKey = `${parentPath}:${componentPath}`

          if (componentPathMap.has(componentKey)) {
            // 路由路径重复警告
          } else {
            componentPathMap.set(componentKey, fullPath)
          }
        }
      }

      // 递归处理子路由
      if (route.children?.length) {
        checkRoutes(route.children, fullPath)
      }
    })
  }

  checkRoutes(routes, parentPath)
}

/**
 * 获取组件路径的字符串表示
 */
function getComponentPathString(component: any): string {
  if (typeof component === 'string') {
    return component
  }

  /* 对于其他别名路由, 获取组件名称 */
  for (const key in RoutesAlias) {
    if (RoutesAlias[key as keyof typeof RoutesAlias] === component) {
      return `RoutesAlias.${key}`
    }
  }

  return ''
}

/**
 * 根据组件路径动态加载组件
 * @param componentPath 组件路径(不包含../../views 前缀和. vue 后缀)
 * @returns 组件加载函数
 */
function loadComponent(componentPath: string): (() => Promise<any>) | null {
  if (!componentPath) return null

  if (componentCache.has(componentPath)) {
    return componentCache.get(componentPath)!
  }

  const fullPath = `../../views${componentPath}.vue`
  const fullPathWithIndex = `../../views${componentPath}/index.vue`
  const module = modules[fullPath] || modules[fullPathWithIndex]
  const result = module || null
  componentCache.set(componentPath, result)
  return result
}

/**
 * 转换后的路由配置类型
 */
interface ConvertedRoute extends Omit<RouteRecordRaw, 'children'> {
  id?: number
  children?: ConvertedRoute[]
  component?: RouteRecordRaw['component'] | (() => Promise<any>)
}

/**
 * 转换路由组件配置
 */
function convertRouteComponent(route: AppRouteRecord, depth = 0): ConvertedRoute | null {
  const { component, children, ...routeConfig } = route
  const converted: ConvertedRoute = { ...routeConfig, component: undefined }
  const isFirstLevel = depth === 0 && route.children?.length

  if (isFirstLevel) {
    handleLayoutRoute(converted, route, component as string)
  } else {
    if (!handleNormalRoute(converted, component as string, String(route.name))) {
      return null
    }
  }

  if (children?.length) {
    const validChildren = children
      .map(child => convertRouteComponent(child, depth + 1))
      .filter(Boolean) as ConvertedRoute[]

    if (validChildren.length) {
      converted.children = validChildren
    }
  }

  return converted
}

/**
 * 处理一级菜单路由
 */
function handleLayoutRoute(
  converted: ConvertedRoute,
  route: AppRouteRecord,
  component: string | undefined
): void {
  converted.component = () => import('@/views/index/index.vue')
  converted.path = `/${(route.path?.split('/')[1] || '').trim()}`
  converted.name = ''

  if (route.meta) {
    route.meta.isFirstLevel = true
  } else {
    route.meta = { isFirstLevel: true } as any
  }

  const childComponent = loadComponent(component as string)
  if (childComponent) {
    converted.children = [{ ...route, component: childComponent } as ConvertedRoute]
  }
}

/**
 * 处理普通路由
 */
function handleNormalRoute(converted: ConvertedRoute, component: string | undefined): boolean {
  if (!component) return false

  const aliasComponent = RoutesAlias[
    component as keyof typeof RoutesAlias
  ] as unknown as RouteRecordRaw['component']
  if (aliasComponent) {
    converted.component = aliasComponent
    return true
  }

  const loadedComponent = loadComponent(component)
  if (loadedComponent) {
    converted.component = loadedComponent
    return true
  }

  return false
}
