import request from '@/utils/http'

export class RoleService {
  static getRoles(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.Role.RoleListResponse>({
      url: '/roles/',
      params
    })
  }

  static getAllRoles() {
    return request.get<Api.Role.Role[]>({
      url: '/roles/all'
    })
  }

  static getRole(id: number) {
    return request.get<Api.Role.Role>({
      url: `/roles/${id}`
    })
  }

  static createRole(data: Api.Role.CreateRoleParams) {
    return request.post<Api.Role.Role>({
      url: '/roles/',
      data
    })
  }

  static updateRole(id: number, data: Api.Role.UpdateRoleParams) {
    return request.put<Api.Role.Role>({
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
    return request.get<Api.Role.RoleMenusResponse>({
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
