import request from '@/utils/http'

export class UserService {
  // 登录
  static login(params: Api.Auth.LoginParams) {
    return request.post<Api.Auth.LoginResponse>({
      url: '/auth/login',
      data: params
    })
  }

  // 获取用户信息
  static getUserInfo() {
    return request.get<Api.User.UserInfo>({
      url: '/users/me'
    })
  }

  // 更新当前用户信息
  static updateCurrentUser(data: Api.User.UpdateUserParams) {
    return request.put<Api.User.UserInfo>({
      url: '/users/me',
      data
    })
  }

  // 修改当前用户密码
  static changePassword(currentPassword: string, newPassword: string) {
    return request.put({
      url: '/users/me/change-password',
      data: {
        current_password: currentPassword,
        new_password: newPassword
      }
    })
  }

  // 获取用户列表
  static getUserList(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.User.UserListData>({
      url: '/users/',
      params
    })
  }

  // 创建用户
  static createUser(data: Api.User.CreateUserParams) {
    return request.post<Api.User.UserListItem>({
      url: '/users/',
      data
    })
  }

  // 获取单个用户
  static getUserById(id: number) {
    return request.get<Api.User.UserListItem>({
      url: `/users/${id}`
    })
  }

  // 更新用户
  static updateUser(id: number, data: Api.User.UpdateUserParams) {
    return request.put<Api.User.UserListItem>({
      url: `/users/${id}`,
      data
    })
  }

  // 删除用户
  static deleteUser(id: number) {
    return request.del({
      url: `/users/${id}`
    })
  }
}
