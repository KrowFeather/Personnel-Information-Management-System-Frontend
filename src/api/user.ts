import { api } from '@/net'

export interface UserUpdatePayload {
  userId: number
  name?: string
  avatar?: string
  birthday?: string
  phone?: string
  gender?: number
  address?: string
}

export interface UserSearchPayload {
  // 具体字段参见后端 UserSearchRequestDTO，这里留空让调用方按需扩展
  [key: string]: unknown
}

export const getUserInfo = (userId: number) => {
  return api.get<{ user: unknown }>('/user/get-info', {
    params: { userId },
  })
}

export const updateUserInfo = (payload: UserUpdatePayload) => {
  return api.put<{ user: unknown }>('/user/update-info', payload)
}

export const searchUser = (payload: UserSearchPayload) => {
  return api.post<{ userList: unknown[] }>('/user/search', payload)
}


