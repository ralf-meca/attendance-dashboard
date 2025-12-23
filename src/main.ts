import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import ToastService from 'primevue/toastservice'
import { createPinia } from 'pinia'
import Toast from 'primevue/toast'
import { Button } from 'primevue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

app.use(ToastService)

// Register Toast component globally
app.component('ShowToast', Toast)
app.component('ButtonComponent', Button)

app.mount('#app')
