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
export function convertMenuToRoute(menu: Menu): AppRouteRecord {
  return {
    id: menu.id,
    name: menu.name,
    path: menu.path,
    component: menu.component,
    redirect: menu.redirect,
    meta: {
      title: menu.title,
      icon: menu.icon,
      sort: menu.sort,
      isHide: menu.is_hide,
      keepAlive: menu.is_keep_alive,
      isIframe: menu.is_iframe,
      link: menu.link,
      isEnable: menu.is_enable,
      roles: menu.roles ? menu.roles.split(',') : [],
      authList: []
    },
    children: menu.children ? menu.children.map(convertMenuToRoute) : []
  }
}
