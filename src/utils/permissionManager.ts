import { router } from '@/router'
import { useMenuStore } from '@/store/modules/menu'

export class PermissionManager {
  static getUserPermissions(): Array<{ authMark: string }> {
    return (router.currentRoute.value.meta.authList as Array<{ authMark: string }>) || []
  }

  static hasPermission(authMark: string): boolean {
    const permissions = this.getUserPermissions()
    return permissions.some(item => item.authMark === authMark)
  }

  static hasPagePermission(pagePath: string, authMark: string): boolean {
    const menuStore = useMenuStore()
    const menuPermissions = menuStore.menuList
    if (!menuPermissions?.length) return false

    const findMenuByPath = (menus: any[], targetPath: string): any => {
      for (const menu of menus) {
        if (menu.path === targetPath) return menu
        if (menu.children?.length) {
          const found = findMenuByPath(menu.children, targetPath)
          if (found) return found
        }
      }
      return null
    }

    const menu = findMenuByPath(menuPermissions, pagePath)
    return menu?.meta?.authList?.some((auth: any) => auth.authMark === authMark) || false
  }
}
