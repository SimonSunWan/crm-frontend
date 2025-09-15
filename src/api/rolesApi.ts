import request from '@/utils/http'
import type {
  Role,
  RoleListResponse,
  CreateRoleParams,
  UpdateRoleParams,
  RoleMenusResponse
} from '@/types/api'

export class RoleService {
  static getRoles(params: Api.Common.PaginatingSearchParams) {
    return request.get<RoleListResponse>({
      url: '/roles/',
      params
    })
  }

  static getAllRoles() {
    return request.get<RoleListResponse>({
      url: '/roles/all'
    })
  }

  static getRole(id: number) {
    return request.get<Role>({
      url: `/roles/${id}`
    })
  }

  static createRole(data: CreateRoleParams) {
    return request.post<Role>({
      url: '/roles/',
      data
    })
  }

  static updateRole(id: number, data: UpdateRoleParams) {
    return request.put<Role>({
      url: `/roles/${id}`,
      data
    })
  }

  static deleteRole(id: number) {
    return request.del({
      url: `/roles/${id}`
    })
  }

  static getRoleMenus(roleId: number) {
    return request.get<RoleMenusResponse>({
      url: `/roles/${roleId}/menus`
    })
  }

  static updateRoleMenus(roleId: number, menuIds: number[]) {
    return request.post({
      url: `/roles/${roleId}/menus`,
      data: { menuIds }
    })
  }
}
