<template>
  <div class="main-app">
    <header class="app-header">
      <h1>{{ pageTitle }}</h1>
      <button @click="handleLogout" class="logout-button">Logout</button>
    </header>
    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Attendance Dashboard'
})

const pageTitle = computed(() => {
  return `${props.title} - ${authStore.userContact?.firstName} ${authStore.userContact?.lastName}`
})

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-app {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.logout-button {
  padding: 10px 24px;
  background: #fff;
  color: var(--vt-c-indigo);
  border: 2px solid var(--vt-c-indigo);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: var(--vt-c-indigo);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.app-content {
  padding: 40px;
  margin: 0 auto;
}

.welcome-card h2 {
  margin-bottom: 16px;
  color: #333;
  font-size: 28px;
}

.welcome-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.token-info strong {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.token-info code {
  display: block;
  background: white;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #667eea;
  word-break: break-all;
}
</style>
