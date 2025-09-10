import { router } from '@/router'

export class PermissionManager {
  static getUserPermissions(): Array<{ authMark: string }> {
    return (router.currentRoute.value.meta.authList as Array<{ authMark: string }>) || []
  }

  static hasPermission(authMark: string): boolean {
    const permissions = this.getUserPermissions()
    return permissions.some(item => item.authMark === authMark)
  }
}
