import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import { useCommon } from '@/composables/useCommon'
import type { AppRouteRecord } from '@/types/router'

type AuthItem = NonNullable<AppRouteRecord['meta']['authList']>[number]

const userStore = useUserStore()

/**
 * 按钮权限(前后端模式通用)
 * 用法: * const { hasAuth } = useAuth()
 * hasAuth('add') // 检查是否拥有新增权限
 */
export const useAuth = () => {
  const route = useRoute()
  const { isFrontendMode } = useCommon()
  const { info } = storeToRefs(userStore)
  const frontendAuthList = info.value?.buttons ?? []
  const backendAuthList: AuthItem[] = Array.isArray(route.meta.authList)
    ? (route.meta.authList as AuthItem[])
    : []

  const hasAuth = (auth: string): boolean => {
    if (isFrontendMode.value) {
      return frontendAuthList.includes(auth)
    }

    return backendAuthList.some(item => item?.authMark === auth)
  }

  return {
    hasAuth
  }
}
