export interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    role: 'User' | 'Admin'
    isActive: boolean
    emailConfirmed: boolean
    lastLoginAt?: string
    createdAt: string
    fullName: string
    isAdmin: boolean
  }
  
  export interface LoginDto {
    email: string
    password: string
    rememberMe?: boolean
  }
  
  export interface RegisterDto {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
  }
  
  export interface AuthResponse {
    token: string
    user: User
    expiresAt: string
    refreshToken?: string
  }
  
  export interface AuthStore {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginDto) => Promise<void>
    register: (data: RegisterDto) => Promise<void>
    logout: () => void
    refreshToken: () => Promise<void>
    setUser: (user: User) => void
  }
  