import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store'
import { initRouter } from './router'
import '@styles/reset.scss'
import '@styles/app.scss'
import '@styles/el-ui.scss'
import '@styles/mobile.scss'
import '@styles/change.scss'
import '@styles/theme-animation.scss'
import '@styles/el-light.scss'
import '@styles/el-dark.scss'
import '@styles/dark.scss'
import '@icons/system/iconfont.js'
import '@icons/system/iconfont.css'
import '@utils/sys/console.ts'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { setupGlobDirectives } from './directives'
import language from './locales'

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
initStore(app)
initRouter(app)
setupGlobDirectives(app)

app.use(language)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')

