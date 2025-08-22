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

export function getRoles(params: { current?: number; size?: number; roleName?: string }) {
  return http.get<RoleListResponse>({
    url: '/roles/',
    params
  })
}

export function getAllRoles() {
  return http.get<Role[]>({
    url: '/roles/all'
  })
}

export function getRole(id: number) {
  return http.get<Role>({
    url: `/roles/${id}`
  })
}

export function createRole(data: RoleCreate) {
  return http.post<Role>({
    url: '/roles/',
    data
  })
}

export function updateRole(id: number, data: RoleUpdate) {
  return http.put<Role>({
    url: `/roles/${id}`,
    data
  })
}

export function deleteRole(id: number) {
  return http.del({
    url: `/roles/${id}`
  })
}

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

export interface RoleMenusResponse {
  menuTree: MenuNode[]
  selectedIds: number[]
}

export function getRoleMenus(roleId: number) {
  return http.get<RoleMenusResponse>({
    url: `/roles/${roleId}/menus`
  })
}

export function updateRoleMenus(roleId: number, menuIds: number[]) {
  return http.post({
    url: `/roles/${roleId}/menus`,
    data: { menuIds }
  })
}
