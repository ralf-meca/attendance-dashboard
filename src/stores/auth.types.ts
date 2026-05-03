export interface AuthState {
  token: string | null
  doInnToken: string | null
  isLoading: boolean
  error: string | null
  userContact: Contact | null
}

export interface IDoInnLoginResponse {
  results: { data: { logintoken: string; user?: { username: string } } }
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
