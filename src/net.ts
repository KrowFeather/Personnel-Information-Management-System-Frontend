import axios from 'axios'

export const baseUrl = 'http://localhost:19090'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const saveAuth = (token?: string, user?: unknown) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user !== undefined) localStorage.setItem(USER_KEY, JSON.stringify(user))
}
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const api = axios.create({
  baseURL: baseUrl,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (!token) return config

  const url = config.url || ''
  // logout 需要 Bearer 前缀
  if (url.includes('/auth/logout')) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
    return config
  }

  // 其它需要鉴权的请求：非 /auth 路径需要 Bearer 前缀
  if (!url.startsWith('/auth')) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})
