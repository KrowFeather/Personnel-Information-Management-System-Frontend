import { api } from '@/net'

export interface LoginPayload {
  username: string
  password: string
  uuid: string
  code: string
}

export interface LoginResponse {
  user: unknown
  token: string
}

export interface RegisterPayload {
  username: string
  password: string
  email: string
  code: string
}

export interface YnuloginPayload {
  username: string
  password: string
  uuid: string
  code: string
  email?: string
  emailCode?: string
}

export const getImageCaptcha = () => {
  return api.get<{ uuid: string; base64Img: string }>('/auth/get-image-captcha')
}

export const getEmailCaptcha = (email: string) => {
  return api.get<void>('/auth/get-email-captcha', {
    params: { email },
  })
}

export const register = (payload: RegisterPayload) => {
  return api.post<void>('/auth/register', payload)
}

export const login = (payload: LoginPayload) => {
  return api.post<LoginResponse>('/auth/login', payload)
}

export const loginYnu = (payload: YnuloginPayload) => {
  return api.post<LoginResponse>('/auth/login-ynu', payload)
}

export const logout = () => {
  // 拦截器会自动带上 Bearer token
  return api.post<void>('/auth/logout')
}


