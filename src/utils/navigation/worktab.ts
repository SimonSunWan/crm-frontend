import { useWorktabStore } from '@/store/modules/worktab'
import { RouteLocationNormalized } from 'vue-router'
import { useSettingStore } from '@/store/modules/setting'
import { useCommon } from '@/composables/useCommon'

/**
 * 根据当前路由信息设置工作标签页(worktab)
 * @param to 当前路由对象
 */
export const setWorktab = (to: RouteLocationNormalized): void => {
  const worktabStore = useWorktabStore()
  const { meta, path, name, params, query } = to
  if (!meta.isHideTab) {
    if (useSettingStore().showWorkTab || path === useCommon().homePath.value) {
      worktabStore.openTab({
        title: meta.title as string,
        path,
        name: name as string,
        keepAlive: meta.keepAlive as boolean,
        params,
        query,
        fixedTab: meta.fixedTab as boolean
      })
    }
  }
}
