import './assets/sass/app.scss'
import 'bootstrap'
import { createApp } from 'vue'
import App from './App.vue'
import routes from './routes/cityhoops'
import i18n from './i18n'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})
createApp(App).use(i18n).use(router).mount('#app')
