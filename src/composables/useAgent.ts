import { ref } from 'vue'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

// 全局共享的 AI 助手状态
const showAgent = ref(false)
const messages = ref<Message[]>([])

export const useAgent = () => {
  return {
    showAgent,
    messages,
  }
}

