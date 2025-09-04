/**
 * 角色相关类型定义
 */

// 角色信息
export interface Role {
  id: number
  roleName: string
  roleCode: string
  description: string
  status: boolean
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
}

// 角色列表响应
export interface RoleListResponse {
  records: Role[]
  total: number
  current: number
  size: number
}

// 创建角色参数
export interface CreateRoleParams {
  roleName: string
  roleCode: string
  description?: string
  status: boolean
}

// 更新角色参数
export interface UpdateRoleParams {
  roleName?: string
  roleCode?: string
  description?: string
  status?: boolean
}

// 菜单节点
export interface MenuNode {
  id: number
  name: string
  title: string
  path: string
  icon: string
  sort: number
  menuType: string
  authName: string
  authMark: string
  authSort: number
  isEnable: boolean
  children: MenuNode[]
}

// 角色菜单响应
export interface RoleMenusResponse {
  menuTree: MenuNode[]
  selectedIds: number[]
}
