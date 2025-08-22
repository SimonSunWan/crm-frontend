import { getTabConfig } from '@/utils/ui'
import { useSettingStore } from '@/store/modules/setting'
import { useMenuStore } from '@/store/modules/menu'

export function useCommon() {
  const settingStore = useSettingStore()
  const { showWorkTab, tabStyle } = storeToRefs(settingStore)

  const isFrontendMode = computed(() => {
    return import.meta.env.VITE_ACCESS_MODE === 'frontend'
  })

  const homePath = computed(() => useMenuStore().getHomePath())

  const refresh = () => {
    settingStore.reload()
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0 })
  }

  const containerMinHeight = computed(() => {
    const { openHeight, closeHeight } = getTabConfig(tabStyle.value)
    return `calc(100vh - ${showWorkTab.value ? openHeight : closeHeight}px)`
  })

  const setContainerHeightCssVar = () => {
    const height = containerMinHeight.value
    document.documentElement.style.setProperty('--art-full-height', height)
  }

  watchEffect(() => {
    setContainerHeightCssVar()
  })

  return {
    isFrontendMode,
    homePath,
    refresh,
    scrollToTop,
    containerMinHeight,
    setContainerHeightCssVar
  }
}
