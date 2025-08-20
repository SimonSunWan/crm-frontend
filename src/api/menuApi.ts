import { AppRouteRecord } from '@/types/router'
import http from '@/utils/http'

export interface Menu {
  id: number
  name: string
  path: string
  component: string
  redirect: string
  title: string
  icon: string
  sort: number
  is_hide: boolean
  is_keep_alive: boolean
  is_iframe: boolean
  link: string
  is_enable: boolean
  menu_type: string
  parent_id?: number
  roles: string
  auth_name: string
  auth_mark: string
  auth_sort: number
  children?: Menu[]
}

export interface MenuCreate {
  name: string
  path: string
  title: string
  icon?: string
  sort?: number
  isHide?: boolean
  keepAlive?: boolean
  isIframe?: boolean
  link?: string
  isEnable?: boolean
  menuType?: string
  parentId?: number
  roles?: string
  authName?: string
  authMark?: string
  authSort?: number
}

export interface MenuUpdate {
  name?: string
  path?: string
  title?: string
  icon?: string
  sort?: number
  isHide?: boolean
  keepAlive?: boolean
  isIframe?: boolean
  link?: string
  isEnable?: boolean
  menuType?: string
  parentId?: number
  roles?: string
  authName?: string
  authMark?: string
  authSort?: number
  updateBy?: string
}

export interface MenuListResponse {
  records: Menu[]
  total: number
  current: number
  size: number
}

// 获取菜单列表
export function getMenus(params?: {
  current?: number
  size?: number
  name?: string
  path?: string
  menuType?: string
}) {
  return http.get<MenuListResponse>({
    url: '/menus/',
    params
  })
}

// 获取菜单树
export function getMenuTree() {
  return http.get<Menu[]>({
    url: '/menus/tree'
  })
}

// 获取导航菜单
export function getNavigationMenus() {
  return http.get<Menu[]>({
    url: '/menus/navigation'
  })
}

// 获取单个菜单
export function getMenu(id: number) {
  return http.get<Menu>({
    url: `/menus/${id}`
  })
}

// 创建菜单
export function createMenu(data: MenuCreate) {
  return http.post<Menu>({
    url: '/menus/',
    data
  })
}

// 更新菜单
export function updateMenu(id: number, data: MenuUpdate) {
  return http.put<Menu>({
    url: `/menus/${id}`,
    data
  })
}

// 删除菜单
export function deleteMenu(id: number) {
  return http.del({
    url: `/menus/${id}`
  })
}

// 数据转换函数
export function convertMenuToRoute(menu: any): AppRouteRecord {
  // 处理角色字段，支持字符串和数组两种格式
  let roles: string[] = []
  if (menu.roles) {
    if (typeof menu.roles === 'string') {
      roles = menu.roles.split(',').filter((role: string) => role.trim())
    } else if (Array.isArray(menu.roles)) {
      roles = menu.roles
    }
  }

  // 处理meta字段，支持两种数据结构
  let meta = {
    title: '',
    icon: '',
    sort: 1,
    isHide: false,
    keepAlive: true,
    isIframe: false,
    link: undefined,
    isEnable: true,
    roles: roles,
    authList: []
  }

  // 如果后端返回的数据有meta字段，使用meta字段的数据
  if (menu.meta) {
    meta = {
      title: menu.meta.title || menu.title || '',
      icon: menu.meta.icon || menu.icon || '',
      sort: menu.meta.sort || menu.sort || 1,
      isHide: menu.meta.isHide || menu.is_hide || false,
      keepAlive: menu.meta.keepAlive || menu.is_keep_alive || true,
      isIframe: menu.meta.isIframe || menu.is_iframe || false,
      link: menu.meta.link || menu.link || undefined,
      isEnable: menu.meta.isEnable || menu.is_enable || true,
      roles: menu.meta.roles || roles,
      authList: menu.meta.authList || []
    }
  } else {
    // 如果后端返回的数据没有meta字段，使用顶层字段
    meta = {
      title: menu.title || '',
      icon: menu.icon || '',
      sort: menu.sort || 1,
      isHide: menu.is_hide || false,
      keepAlive: menu.is_keep_alive || true,
      isIframe: menu.is_iframe || false,
      link: menu.link || undefined,
      isEnable: menu.is_enable || true,
      roles: roles,
      authList: []
    }
  }

  return {
    id: menu.id,
    name: menu.name,
    path: menu.path,
    component: menu.component,
    redirect: menu.redirect,
    meta: meta,
    children: menu.children ? menu.children.map(convertMenuToRoute) : []
  }
}
