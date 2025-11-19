<template>
  <MainLayout title="Attendance Dashboard">
    <div class="welcome-card">
      <h2>Welcome {{ userContact?.firstName }}!</h2>
      <p>You are successfully authenticated.</p>
      <div class="token-info">
        <strong>Token (first 50 chars):</strong>
        <code>{{ tokenPreview }}</code>
      </div>
      <p class="info-text">
        You can now add your actual application components here.
        The authentication is handled automatically, and the token
        is stored in localStorage for persistence across sessions.
      </p>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/layouts/MainLayout.vue'

const authStore = useAuthStore()

const tokenPreview = computed(() => {
  return authStore.token ? `${authStore.token.substring(0, 50)}...` : ''
})

const userContact = computed(() => authStore.userContact)
</script>

<style scoped>
.welcome-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.token-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin: 24px 0;
  border-left: 4px solid #667eea;
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

.info-text {
  font-size: 14px;
  color: #888;
  font-style: italic;
}
</style>
