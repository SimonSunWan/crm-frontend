/**
 * 菜单相关类型定义
 */

// 菜单信息
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
  path: string
  title: string
  icon?: string
  sort?: number
  isHide?: boolean
  keepAlive?: boolean
  link?: string
  isEnable?: boolean
  menuType?: string
  parentId?: number
  roles?: string
  authName?: string
  authMark?: string
  authSort?: number
}

// 更新菜单参数
export interface UpdateMenuParams {
  name?: string
  path?: string
  title?: string
  icon?: string
  sort?: number
  isHide?: boolean
  keepAlive?: boolean
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
