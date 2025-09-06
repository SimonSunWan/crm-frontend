/**
 * 菜单相关类型定义
 */

// 菜单信息
export interface Menu {
  id: number
  name: string
  path: string
  icon: string
  sort: number
  is_hide: boolean
  is_keep_alive: boolean
  is_link: boolean
  link: string
  is_enable: boolean
  menu_type: string
  parent_id?: number | null
  roles: string
  auth_mark: string
  children?: Menu[]
}

// 菜单列表响应
export interface MenuListResponse {
  records: Menu[]
  total: number
  current: number
  size: number
}

// 创建菜单参数
export interface CreateMenuParams {
  name: string
  path?: string | null
  icon?: string | null
  sort?: number
  isHide?: boolean
  keepAlive?: boolean
  isLink?: boolean
  link?: string | null
  isEnable?: boolean
  menuType?: string
  parentId?: number | null
  authMark?: string | null
}

// 更新菜单参数
export interface UpdateMenuParams {
  name?: string
  path?: string | null
  icon?: string | null
  sort?: number
  isHide?: boolean
  keepAlive?: boolean
  isLink?: boolean
  link?: string | null
  isEnable?: boolean
  menuType?: string
  parentId?: number | null
  authMark?: string | null
  updateBy?: string
}
