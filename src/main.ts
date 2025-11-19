import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { createPinia } from 'pinia'
import Toast from 'primevue/toast'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.use(PrimeVue)
app.use(ToastService)

// Register Toast component globally
app.component('ShowToast', Toast)

app.mount('#app')
