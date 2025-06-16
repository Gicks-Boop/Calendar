import './assets/main.css'
import '@/components/dialog/dialog.css'

import Session from './middleware/session'
import * as Static from './middleware/static'
import Dialog from '@/components/dialog/dialog'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)

app.config.globalProperties.$static = Static
app.config.globalProperties.$session = new Session(app)
app.config.globalProperties.$dialog = Dialog

app.use(createPinia());
app.use(router)

app.mount('#app')
