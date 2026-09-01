import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// The chweb CRM sits behind Tailscale and sends no CORS headers, so browser
// calls to it are blocked. Proxy /api through the dev server instead.
const chwebProxy = {
  '/api': {
    target: 'https://crm-chweb.tailb5010e.ts.net',
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5176,
    proxy: chwebProxy,
  },
  preview: {
    proxy: chwebProxy,
  },
})
