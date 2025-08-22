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

export function getMenuTree() {
  return http.get<Menu[]>({
    url: '/menus/tree'
  })
}

export function getNavigationMenus() {
  return http.get<Menu[]>({
    url: '/menus/navigation'
  })
}

export function getMenu(id: number) {
  return http.get<Menu>({
    url: `/menus/${id}`
  })
}

export function createMenu(data: MenuCreate) {
  return http.post<Menu>({
    url: '/menus/',
    data
  })
}

export function updateMenu(id: number, data: MenuUpdate) {
  return http.put<Menu>({
    url: `/menus/${id}`,
    data
  })
}

export function deleteMenu(id: number) {
  return http.del({
    url: `/menus/${id}`
  })
}

export function convertMenuToRoute(menu: any): AppRouteRecord {
  let roles: string[] = []
  if (menu.roles) {
    if (typeof menu.roles === 'string') {
      roles = menu.roles.split(',').filter((role: string) => role.trim())
    } else if (Array.isArray(menu.roles)) {
      roles = menu.roles
    }
  }

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

  const extendedMeta = {
    ...meta,
    originalTitle: menu.title,
    originalIcon: menu.icon,
    originalSort: menu.sort,
    originalIsHide: menu.isHide,
    originalIsKeepAlive: menu.isKeepAlive,
    originalIsIframe: menu.isIframe,
    originalLink: menu.link,
    originalIsEnable: menu.isEnable,
    originalMenuType: menu.menuType,
    originalParentId: menu.parentId,
    originalAuthName: menu.authName,
    originalAuthMark: menu.authMark,
    originalAuthSort: menu.authSort
  }

  return {
    id: menu.id,
    name: menu.name,
    path: menu.path,
    component: menu.component,
    redirect: menu.redirect,
    meta: extendedMeta,
    children: menu.children ? menu.children.map(convertMenuToRoute) : []
  } as AppRouteRecord & {
    title?: string
    icon?: string
    sort?: number
    is_hide?: boolean
    is_keep_alive?: boolean
    is_iframe?: boolean
    link?: string
    is_enable?: boolean
    menu_type?: string
    parent_id?: number
    auth_name?: string
    auth_mark?: string
    auth_sort?: number
  }
}
