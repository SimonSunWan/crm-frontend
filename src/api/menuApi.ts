import { AppRouteRecord } from '@/types/router'
import http from '@/utils/http'

interface MenuResponse {
  menuList: AppRouteRecord[]
}

interface MenuListResponse {
  records: any[]
  total: number
  current: number
  size: number
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 菜单接口
export const menuService = {
  async getMenuList(delay = 300): Promise<MenuResponse> {
    try {
      // 调用后端接口获取菜单数据
      const response = await http.get<ApiResponse<MenuListResponse>>({ url: '/menus/' })

      if (response.code === 200) {
        // 将后端数据转换为前端需要的格式
        const menuList = this.convertBackendToFrontend(response.data.records)
        return { menuList }
      } else {
        throw new Error(response.message || '获取菜单失败')
      }
    } catch (error) {
      // 如果后端接口失败，回退到前端静态数据
      console.warn('后端菜单接口调用失败，使用前端静态数据:', error)
      const { asyncRoutes } = await import('@/router/routes/asyncRoutes')
      const { menuDataToRouter } = await import('@/router/utils/menuToRouter')

      const menuData = asyncRoutes
      const menuList = menuData.map(route => menuDataToRouter(route))
      await new Promise(resolve => setTimeout(resolve, delay))
      return { menuList }
    }
  },

  async getMenuTree(): Promise<AppRouteRecord[]> {
    try {
      const response = await http.get<ApiResponse<AppRouteRecord[]>>({ url: '/menus/tree' })
      if (response.code === 200) {
        return this.convertBackendToFrontend(response.data)
      }
      throw new Error(response.message || '获取菜单树失败')
    } catch (error) {
      console.warn('获取菜单树失败:', error)
      return []
    }
  },

  async getNavigationMenus(): Promise<AppRouteRecord[]> {
    try {
      const response = await http.get<ApiResponse<AppRouteRecord[]>>({ url: '/menus/navigation' })
      if (response.code === 200) {
        return this.convertBackendToFrontend(response.data)
      }
      throw new Error(response.message || '获取导航菜单失败')
    } catch (error) {
      console.warn('获取导航菜单失败:', error)
      return []
    }
  },

  async createMenu(menuData: any): Promise<any> {
    try {
      const response = await http.post<ApiResponse>({ url: '/menus/', data: menuData })
      if (response.code === 200) {
        return response.data
      }
      throw new Error(response.message || '创建菜单失败')
    } catch (error) {
      throw error instanceof Error ? error : new Error('创建菜单失败')
    }
  },

  async updateMenu(menuId: number, menuData: any): Promise<any> {
    try {
      const response = await http.put<ApiResponse>({ url: `/menus/${menuId}`, data: menuData })
      if (response.code === 200) {
        return response.data
      }
      throw new Error(response.message || '更新菜单失败')
    } catch (error) {
      throw error instanceof Error ? error : new Error('更新菜单失败')
    }
  },

  async deleteMenu(menuId: number): Promise<any> {
    try {
      const response = await http.del<ApiResponse>({ url: `/menus/${menuId}` })
      if (response.code === 200) {
        return response.data
      }
      throw new Error(response.message || '删除菜单失败')
    } catch (error) {
      throw error instanceof Error ? error : new Error('删除菜单失败')
    }
  },

  // 将后端数据格式转换为前端需要的格式
  convertBackendToFrontend(backendMenus: any[]): AppRouteRecord[] {
    return backendMenus.map(menu => ({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      component: menu.component,
      redirect: menu.redirect,
      meta: {
        title: menu.title,
        icon: menu.icon,
        sort: menu.sort,
        isHide: menu.isHide,
        keepAlive: menu.isKeepAlive,
        isIframe: menu.isIframe,
        link: menu.link,
        isEnable: menu.isEnable,
        roles: menu.roles ? menu.roles.split(',') : [],
        authList: menu.authList || []
      },
      children: menu.children ? this.convertBackendToFrontend(menu.children) : []
    }))
  }
}
