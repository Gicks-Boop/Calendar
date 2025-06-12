import './assets/main.css'

import { createApp } from 'vue'
import CalendarioView from './Views/CalendarioView.vue'
import router from './router'

createApp(CalendarioView).use(router).mount('#app')
    
    
