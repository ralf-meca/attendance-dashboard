export interface AuthState {
  token: string | null
  isLoading: boolean
  error: string | null
  userContact: Contact | null
}

export interface LoginResponse {
  isSuccess: boolean
  token: string
  data: unknown
}

export interface Contact {
  id: number
  firstName: string
  lastName: string
  contractType: string
  creationDate: string
  phoneNumber: string
  email: string
  status: string
}
