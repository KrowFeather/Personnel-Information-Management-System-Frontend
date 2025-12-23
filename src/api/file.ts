import { api } from '@/net'

export const uploadFile = (file: File | Blob) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<{ url: string }>('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}


