/**
 * 用户相关类型定义
 */

// 用户信息
export interface UserInfo {
  id: number
  userName: string
  nickName?: string
  full_name: string
  email: string
  phone?: string
  avatar?: string
  is_active: boolean
  created_at: string
  updated_at: string | null
  roles?: string[] // 可选的角色字段
  roleNames?: string[] // 可选的角色名称字段
  buttons?: string[] // 按钮权限列表
}

// 用户列表数据
export interface UserListData {
  records: UserListItem[]
  total: number
  current: number
  size: number
}

// 用户列表项
export interface UserListItem {
  id: number
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  status: string
  userName: string
  nickName: string
  phone: string
  email: string
  roles: string[]
  roleNames?: string[] // 角色名称数组
}

// 创建用户参数
export interface CreateUserParams {
  userName: string
  nickName?: string
  phone: string
  email: string
  password: string
  roles?: string[]
  status?: boolean
}

// 更新用户参数
export interface UpdateUserParams {
  userName?: string
  nickName?: string
  email?: string
  phone?: string
}

// 用户注册参数
export interface RegisterUserParams {
  userName: string
  nickName: string
  phone: string
  email?: string
  password: string
  systemCode: string
}

// 忘记密码参数
export interface ForgetPasswordParams {
  username: string
  newPassword: string
  systemCode: string
}

// 头像上传响应
export interface AvatarUploadResponse {
  avatar_url: string
}
