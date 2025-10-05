export interface UserInfo {
  id: number
  userName: string
  nickName?: string
  email: string
  phone?: string
  avatar?: string
  status: boolean
  roles?: string[]
  roleNames?: string[]
  buttons?: string[]
}

export interface UserListData {
  records: UserListItem[]
  total: number
  current: number
  size: number
}

export interface UserListItem {
  id: number
  status: boolean
  userName: string
  nickName: string
  phone: string
  email: string
  roles: string[]
  roleNames?: string[]
  departments?: string[]
}

export interface CreateUserParams {
  userName: string
  nickName?: string
  phone: string
  email: string
  password: string
  roles?: string[]
  status?: boolean
}

export interface UpdateUserParams {
  userName?: string
  nickName?: string
  email?: string
  phone?: string
}

export interface RegisterUserParams {
  userName: string
  nickName: string
  phone: string
  email?: string
  password: string
  systemCode: string
}

export interface ForgetPasswordParams {
  username: string
  newPassword: string
  systemCode: string
}

export interface AvatarUploadResponse {
  avatar_url: string
}
