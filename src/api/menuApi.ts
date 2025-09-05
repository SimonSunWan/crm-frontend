import { AppRouteRecord } from '@/types/router'
import request from '@/utils/http'
import type { Menu, MenuListResponse, CreateMenuParams, UpdateMenuParams } from '@/types/api'

export class MenuService {
  static getMenus(params?: {
    current?: number
    size?: number
    name?: string
    path?: string
    menuType?: string
  }) {
    return request.get<MenuListResponse>({
      url: '/menus/',
      params
    })
  }

  static getMenuTree() {
    return request.get<Menu[]>({
      url: '/menus/tree'
    })
  }

  static getNavigationMenus() {
    return request.get<Menu[]>({
      url: '/menus/navigation'
    })
  }

  static getMenu(id: number) {
    return request.get<Menu>({
      url: `/menus/${id}`
    })
  }

  static createMenu(data: CreateMenuParams) {
    return request.post<Menu>({
      url: '/menus/',
      data
    })
  }

  static updateMenu(id: number, data: UpdateMenuParams) {
    return request.put<Menu>({
      url: `/menus/${id}`,
      data
    })
  }

  static deleteMenu(id: number) {
    return request.del({
      url: `/menus/${id}`
    })
  }

  static convertMenuToRoute(menu: any): AppRouteRecord {
    let roles: any[] = []
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
        isHide:
          menu.meta.isHide !== undefined
            ? menu.meta.isHide
            : menu.isHide !== undefined
              ? menu.isHide
              : false,
        keepAlive:
          menu.meta.keepAlive !== undefined
            ? menu.meta.keepAlive
            : menu.isKeepAlive !== undefined
              ? menu.isKeepAlive
              : true,
        isIframe:
          menu.meta.isIframe !== undefined
            ? menu.meta.isIframe
            : menu.isIframe !== undefined
              ? menu.isIframe
              : false,
        link: menu.meta.link || menu.link || undefined,
        isEnable:
          menu.meta.isEnable !== undefined
            ? menu.meta.isEnable
            : menu.isEnable !== undefined
              ? menu.isEnable
              : true,
        roles: menu.meta.roles || roles,
        authList: menu.meta.authList || []
      }
    } else {
      meta = {
        title: menu.title || '',
        icon: menu.icon || '',
        sort: menu.sort || 1,
        isHide: menu.isHide !== undefined ? menu.isHide : false,
        keepAlive: menu.isKeepAlive !== undefined ? menu.isKeepAlive : true,
        isIframe: menu.isIframe !== undefined ? menu.isIframe : false,
        link: menu.link || undefined,
        isEnable: menu.isEnable !== undefined ? menu.isEnable : true,
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

    const isFirstLevel = menu.parentId === null || menu.parentId === undefined

    return {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      component: menu.component,
      redirect: menu.redirect,
      meta: {
        ...extendedMeta,
        isFirstLevel: isFirstLevel
      },
      children: menu.children ? menu.children.map(MenuService.convertMenuToRoute) : []
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
}
