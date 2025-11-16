import { defineStore } from 'pinia'
import router from '@/router'

interface AuthState {
  token: string | null
  isLoading: boolean
  error: string | null
}

interface LoginResponse {
  isSuccess: boolean
  token: string
  data: unknown
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('authToken') || null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token
  },

  actions: {
    async login(username: string, password: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('https://crm.chweb.it/api/LoginApp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })

        if (!response.ok) {
          throw new Error('Login failed')
        }

        const data: LoginResponse = await response.json()

        if (data.isSuccess && data.token) {
          this.token = data.token
          localStorage.setItem('authToken', data.token)
          await router.push('/')
        } else {
          throw new Error('Invalid credentials')
        }
      } catch (error) {

        this.error = error instanceof Error ? error.message : 'An error occurred'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    logout(): void {
      this.token = null
      localStorage.removeItem('authToken')
    }
  }
})
