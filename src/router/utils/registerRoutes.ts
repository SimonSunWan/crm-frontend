import type { Router, RouteRecordRaw } from 'vue-router'
import type { AppRouteRecord } from '@/types/router'
import { saveIframeRoutes } from './menuToRouter'
import { RoutesAlias } from '../routesAlias'
import { h } from 'vue'
import { useMenuStore } from '@/store/modules/menu'

const modules: Record<string, () => Promise<any>> = import.meta.glob('../../views/**/*.vue')

export function registerDynamicRoutes(router: Router, menuList: AppRouteRecord[]): void {
  const iframeRoutes: AppRouteRecord[] = []
  const removeRouteFns: (() => void)[] = []

  checkDuplicateRoutes(menuList)

  menuList.forEach(route => {
    if (route.name && !router.hasRoute(route.name)) {
      const routeConfig = convertRouteComponent(route, iframeRoutes)
      const removeRouteFn = router.addRoute(routeConfig as RouteRecordRaw)
      removeRouteFns.push(removeRouteFn)
    }
  })

  const menuStore = useMenuStore()
  menuStore.addRemoveRouteFns(removeRouteFns)
  saveIframeRoutes(iframeRoutes)
}

/**
 * 路径解析函数:处理父路径和子路径的拼接
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

  /* 对于其他别名路由,获取组件名称 */
  for (const key in RoutesAlias) {
    if (RoutesAlias[key as keyof typeof RoutesAlias] === component) {
      return `RoutesAlias.${key}`
    }
  }

  return ''
}

/**
 * 根据组件路径动态加载组件
 * @param componentPath 组件路径(不包含 ../../views 前缀和 .vue 后缀)
 * @param routeName 当前路由名称(用于错误提示)
 * @returns 组件加载函数
 */
function loadComponent(componentPath: string, routeName: string): () => Promise<any> {
  /* 如果路径为空,直接返回一个空的组件 */
  if (componentPath === '') {
    return () =>
      Promise.resolve({
        render() {
          return h('div', {})
        }
      })
  }

  // 构建可能的路径
  const fullPath = `../../views${componentPath}.vue`
  const fullPathWithIndex = `../../views${componentPath}/index.vue`

  /* 先尝试直接路径,再尝试添加/index的路径 */
  const module = modules[fullPath] || modules[fullPathWithIndex]

  if (!module) {
    return () =>
      Promise.resolve({
        render() {
          return h('div', `组件未找到: ${routeName}`)
        }
      })
  }

  return module
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
function convertRouteComponent(
  route: AppRouteRecord,
  iframeRoutes: AppRouteRecord[],
  depth = 0
): ConvertedRoute {
  const { component, children, ...routeConfig } = route

  // 基础路由配置
  const converted: ConvertedRoute = {
    ...routeConfig,
    component: undefined
  }

  // 是否为一级菜单
  const isFirstLevel = depth === 0 && route.children && route.children.length > 0

  if (isFirstLevel) {
    handleLayoutRoute(converted, route, component as string)
  } else {
    handleNormalRoute(converted, component as string, String(route.name))
  }

  // 递归时增加深度
  if (children?.length) {
    converted.children = children.map(child =>
      convertRouteComponent(child, iframeRoutes, depth + 1)
    )
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

  // 确保 isFirstLevel 属性被正确设置
  if (route.meta) {
    route.meta.isFirstLevel = true
  } else {
    route.meta = { isFirstLevel: true } as any
  }

  converted.children = [
    {
      ...route,
      component: loadComponent(component as string, String(route.name))
    } as ConvertedRoute
  ]
}

/**
 * 处理普通路由
 */
function handleNormalRoute(
  converted: ConvertedRoute,
  component: string | undefined,
  routeName: string
): void {
  if (component) {
    const aliasComponent = RoutesAlias[
      component as keyof typeof RoutesAlias
    ] as unknown as RouteRecordRaw['component']
    converted.component = aliasComponent || loadComponent(component as string, routeName)
  }
}
