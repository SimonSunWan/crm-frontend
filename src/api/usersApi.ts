import request from '@/utils/http'
import type {
  UserInfo,
  UserListData,
  UserListItem,
  CreateUserParams,
  UpdateUserParams,
  AvatarUploadResponse
} from '@/types/api'

export class UserService {
  static login(params: Api.Auth.LoginParams) {
    return request.post<Api.Auth.LoginResponse>({
      url: '/auth/login',
      data: params
    })
  }

  static getUserInfo() {
    return request.get<UserInfo>({
      url: '/users/me'
    })
  }

  static updateCurrentUser(data: UpdateUserParams) {
    return request.put<UserInfo>({
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
    return request.get<UserListData>({
      url: '/users/',
      params
    })
  }

  static createUser(data: CreateUserParams) {
    return request.post<UserListItem>({
      url: '/users/',
      data
    })
  }

  static getUserById(id: number) {
    return request.get<UserListItem>({
      url: `/users/${id}`
    })
  }

  static updateUser(id: number, data: UpdateUserParams) {
    return request.put<UserListItem>({
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
    return request.post<AvatarUploadResponse>({
      url: '/users/me/avatar',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
