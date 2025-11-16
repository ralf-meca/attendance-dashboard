import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import { useAuthStore } from '@/stores/authStore.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/DashboardPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard to protect routes
router.beforeEach((to, _, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to "login" if the route requires auth and the user is not authenticated
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Redirect to the dashboard if already logged in and trying to access login
    next('/')
  } else {
    next()
  }
})

export default router
