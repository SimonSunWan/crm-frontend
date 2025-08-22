import type { App } from 'vue'
import { setupAuthDirective } from './auth'
import { setupHighlightDirective } from './highlight'
import { setupRippleDirective } from './ripple'
import { setupRolesDirective } from './roles'

export function setupGlobDirectives(app: App) {
  setupAuthDirective(app)
  setupRolesDirective(app)
  setupHighlightDirective(app)
  setupRippleDirective(app)
}
