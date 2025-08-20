import http from '@/utils/http'

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

export interface RoleCreate {
  roleName: string
  roleCode: string
  description?: string
  status: boolean
}

export interface RoleUpdate {
  roleName?: string
  roleCode?: string
  description?: string
  status?: boolean
}

export interface RoleListResponse {
  records: Role[]
  total: number
  current: number
  size: number
}

// 获取角色列表
export function getRoles(params: { current?: number; size?: number; roleName?: string }) {
  return http.get<RoleListResponse>({
    url: '/roles/',
    params
  })
}

// 获取单个角色
export function getRole(id: number) {
  return http.get<Role>({
    url: `/roles/${id}`
  })
}

// 创建角色
export function createRole(data: RoleCreate) {
  return http.post<Role>({
    url: '/roles/',
    data
  })
}

// 更新角色
export function updateRole(id: number, data: RoleUpdate) {
  return http.put<Role>({
    url: `/roles/${id}`,
    data
  })
}

// 删除角色
export function deleteRole(id: number) {
  return http.del({
    url: `/roles/${id}`
  })
}

// 获取角色菜单权限
export function getRoleMenus(roleId: number) {
  return http.get<{ menuIds: number[] }>({
    url: `/roles/${roleId}/menus`
  })
}

// 更新角色菜单权限
export function updateRoleMenus(roleId: number, menuIds: number[]) {
  return http.post({
    url: `/roles/${roleId}/menus`,
    data: menuIds
  })
}
