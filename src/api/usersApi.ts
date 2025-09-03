import request from '@/utils/http'

export class UserService {
  static login(params: Api.User.LoginParams) {
    return request.post<Api.User.LoginResponse>({
      url: '/auth/login',
      data: params
    })
  }

  static getUserInfo() {
    return request.get<Api.User.UserInfo>({
      url: '/users/me'
    })
  }

  static updateCurrentUser(data: Api.User.UpdateUserParams) {
    return request.put<Api.User.UserInfo>({
      url: '/users/me',
      data
    })
  }

  static changePassword(data: { currentPassword: string; newPassword: string }) {
    return request.put({
      url: '/users/me/change-password',
      data
    })
  }

  static getUserList(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.User.UserListData>({
      url: '/users/',
      params
    })
  }

  static createUser(data: Api.User.CreateUserParams) {
    return request.post<Api.User.UserListItem>({
      url: '/users/',
      data
    })
  }

  static getUserById(id: number) {
    return request.get<Api.User.UserListItem>({
      url: `/users/${id}`
    })
  }

  static updateUser(id: number, data: Api.User.UpdateUserParams) {
    return request.put<Api.User.UserListItem>({
      url: `/users/${id}`,
      data
    })
  }

  static deleteUser(id: number) {
    return request.del({
      url: `/users/${id}`
    })
  }

  static uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    return request.post<Api.User.AvatarUploadResponse>({
      url: '/users/me/avatar',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
