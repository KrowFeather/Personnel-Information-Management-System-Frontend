import { api } from '@/net'

export const uploadFile = (file: File | Blob) => {
  const formData = new FormData()
  formData.append('file', file)
  // 不手动设置 Content-Type，让浏览器自动设置（包含 boundary）
  return api.post<{ url: string }>('/file/upload', formData, {
    timeout: 30000, // 30秒超时
  })
}


