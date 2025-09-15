import { AppRouteRecord } from '@/types/router'
import request from '@/utils/http'
import type { Menu, MenuListResponse, CreateMenuParams, UpdateMenuParams } from '@/types/api'

export class MenuService {
  static getMenus(params?: { name?: string; path?: string; menuType?: string }) {
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

    const meta = {
      title: menu.meta?.title || '',
      icon: menu.meta?.icon || '',
      sort: menu.meta?.sort || 1,
      keepAlive: menu.meta?.keepAlive || false,
      isLink: menu.meta?.isLink || false,
      link: menu.meta?.link || undefined,
      isEnable: menu.meta?.isEnable || true,
      roles: roles,
      authList: menu.meta?.authList || [],
      isFirstLevel: menu.parentId === null || menu.parentId === undefined
    }

    return {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      component: menu.isLink ? undefined : menu.path,
      meta,
      children: menu.children ? menu.children.map(MenuService.convertMenuToRoute) : []
    } as AppRouteRecord
  }
}
