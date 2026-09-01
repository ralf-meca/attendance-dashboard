import { defineStore } from 'pinia'
import router from '@/router'
import type { AuthState, Contact, IDoInnLoginResponse, LoginResponse } from './auth.types'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('authToken') || null,
    doInnToken: localStorage.getItem('doInnToken') || null,
    isLoading: false,
    error: null,
    userContact: JSON.parse(localStorage.getItem('userContact') || 'null'),
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    async login(username: string, password: string, includeWay4Tech: boolean = false): Promise<{ success: boolean; error?: string }> {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/api/LoginApp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })

        if (!response.ok) {
          return { success: false, error: 'Login failed' }
        }

        const data: LoginResponse = await response.json()

        if (data.isSuccess && data.token) {
          this.token = data.token
          localStorage.setItem('authToken', data.token)

          if (includeWay4Tech) {
            const doInnResponse = await fetch('https://intranet.doinnovation.it/backend/rest/main/authentication/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user: 'ralf.meca', password, persist: true }),
              credentials: 'include',
            })
            if (doInnResponse.ok) {
              const doInnData: IDoInnLoginResponse = await doInnResponse.json()
              console.log('DoInn login response:', doInnData)
              this.doInnToken = doInnData?.results?.data?.logintoken
              localStorage.setItem('doInnToken', doInnData?.results?.data?.logintoken)
            }
          }

          await this.fetchUserContact(username, data.token).then(async (result) => {
            if (!result.success) {
              await router.push('/')
              return { success: true, message: `Contact fetch failed: ${ result.error || 'Unknown error' }` }
            }
          })
          await router.push('/')
          return { success: true }
        } else {
          return { success: false, error: 'Invalid credentials' }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'An error occurred'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchUserContact(
      email: string,
      token: string,
    ): Promise<{ success: boolean; error?: string }> {
      try {
        const response = await fetch('/api/Contact/GetContactsAndProjects', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          return { success: false, error: 'Failed to fetch contacts' }
        }

        const contacts: Contact[] = await response.json()
        const userContact = contacts.find((contact) => contact.email === email)

        if (userContact) {
          this.userContact = userContact
          localStorage.setItem('userContact', JSON.stringify(userContact))
          return { success: true }
        } else {
          return { success: false, error: 'No contact found matching the login email' }
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
      }
    },

    logout(): void {
      this.token = null
      this.doInnToken = null
      this.userContact = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('doInnToken')
      localStorage.removeItem('userContact')
    },
  },
})
