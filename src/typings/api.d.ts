/**
 * namespace: Api
 *
 * 所有接口相关类型定义
 * 在.vue文件使用会报错,需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 */
declare namespace Api {
  /** 基础类型 */
  namespace Http {
    /** 基础响应 */
    interface BaseResponse<T = any> {
      // 状态码
      code: number
      // 消息
      message?: string
      // 数据
      data: T
    }
  }

  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginatingParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type PaginatingSearchParams = Pick<PaginatingParams, 'current' | 'size'>

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      accessToken: string
      tokenType: string
    }
  }

  /** 用户类型 */
  namespace User {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      user: UserInfo
    }

    /** 用户信息 */
    interface UserInfo {
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
    }

    /** 用户列表数据 */
    interface UserListData {
      records: UserListItem[]
      total: number
      current: number
      size: number
    }

    /** 用户列表项 */
    interface UserListItem {
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

    /** 创建用户参数 */
    interface CreateUserParams {
      userName: string
      nickName?: string
      phone: string
      email: string
      password: string
      roles?: string[]
      status?: string
    }

    /** 更新用户参数 */
    interface UpdateUserParams {
      userName?: string
      nickName?: string
      email?: string
      phone?: string
    }

    /** 头像上传响应 */
    interface AvatarUploadResponse {
      avatar_url: string
    }
  }

  /** 字典类型 */
  namespace Dictionary {
    /** 字典类型项 */
    interface DictionaryTypeItem {
      id: number
      name: string
      code: string
      description?: string
      status: boolean
      createBy?: string
      createTime?: string
      updateBy?: string
      updateTime?: string
    }

    /** 字典类型列表数据 */
    interface DictionaryTypeListData {
      records: DictionaryTypeItem[]
      total: number
      current: number
      size: number
    }

    /** 创建字典类型参数 */
    interface CreateDictionaryTypeParams {
      name: string
      code: string
      description?: string
    }

    /** 更新字典类型参数 */
    interface UpdateDictionaryTypeParams {
      name?: string
      code?: string
      description?: string
      status?: boolean
    }

    /** 字典枚举项 */
    interface DictionaryEnumItem {
      id: number
      typeId: number
      keyValue: string
      dictValue: string
      sortOrder: number
      status: boolean
      createBy?: string
      createTime?: string
      updateBy?: string
      updateTime?: string
    }

    /** 字典枚举列表数据 */
    interface DictionaryEnumListData {
      records: DictionaryEnumItem[]
      total: number
      current: number
      size: number
    }

    /** 创建字典枚举参数 */
    interface CreateDictionaryEnumParams {
      typeId: number
      keyValue: string
      dictValue: string
      sortOrder?: number
    }

    /** 更新字典枚举参数 */
    interface UpdateDictionaryEnumParams {
      keyValue?: string
      dictValue?: string
      sortOrder?: number
      status?: boolean
    }
  }

  /** 角色类型 */
  namespace Role {
    /** 角色信息 */
    interface Role {
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

    /** 角色列表响应 */
    interface RoleListResponse {
      records: Role[]
      total: number
      current: number
      size: number
    }

    /** 创建角色参数 */
    interface CreateRoleParams {
      roleName: string
      roleCode: string
      description?: string
      status: boolean
    }

    /** 更新角色参数 */
    interface UpdateRoleParams {
      roleName?: string
      roleCode?: string
      description?: string
      status?: boolean
    }

    /** 菜单节点 */
    interface MenuNode {
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

    /** 角色菜单响应 */
    interface RoleMenusResponse {
      menuTree: MenuNode[]
      selectedIds: number[]
    }
  }

  /** 菜单类型 */
  namespace Menu {
    /** 菜单信息 */
    interface Menu {
      id: number
      name: string
      path: string
      component: string
      redirect: string
      title: string
      icon: string
      sort: number
      is_hide: boolean
      is_keep_alive: boolean
      is_iframe: boolean
      link: string
      is_enable: boolean
      menu_type: string
      parent_id?: number
      roles: string
      auth_name: string
      auth_mark: string
      auth_sort: number
      children?: Menu[]
    }

    /** 菜单列表响应 */
    interface MenuListResponse {
      records: Menu[]
      total: number
      current: number
      size: number
    }

    /** 创建菜单参数 */
    interface CreateMenuParams {
      name: string
      path: string
      title: string
      icon?: string
      sort?: number
      isHide?: boolean
      keepAlive?: boolean
      isIframe?: boolean
      link?: string
      isEnable?: boolean
      menuType?: string
      parentId?: number
      roles?: string
      authName?: string
      authMark?: string
      authSort?: number
    }

    /** 更新菜单参数 */
    interface UpdateMenuParams {
      name?: string
      path?: string
      title?: string
      icon?: string
      sort?: number
      isHide?: boolean
      keepAlive?: boolean
      isIframe?: boolean
      link?: string
      isEnable?: boolean
      menuType?: string
      parentId?: number
      roles?: string
      authName?: string
      authMark?: string
      authSort?: number
      updateBy?: string
    }
  }
}
