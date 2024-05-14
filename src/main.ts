import './assets/sass/app.scss'
import 'bootstrap'
import { createApp } from 'vue'
import App from './App.vue'
import routes from './routes'
import i18n from './i18n'
import { createRouter, createWebHistory } from 'vue-router'
import useAuthentification from './composable/useAuthentification'

const { isAdmin } = useAuthentification()
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
router.beforeEach(async (to, from, next) => {
  const accessRequired = to.matched?.find((r) => Array.isArray(r.meta?.authRequired))?.meta
    ?.authRequired as string[] | undefined
  if (Array.isArray(accessRequired) && accessRequired.length > 0 && !isAdmin.value) {
    next({ name: 'login', query: { redirect: from.name } })
  } else {
    next()
  }
})
createApp(App).use(i18n).use(router).mount('#app')
