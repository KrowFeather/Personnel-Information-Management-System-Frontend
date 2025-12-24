<template>
  <transition name="el-fade-in-linear">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      <div class="absolute inset-0 bg-black/10" @click="close"></div>

      <div class="relative m-4 pointer-events-auto">
        <div class="w-96 h-40em bg-white rounded-xl shadow-[0_16px_50px_rgba(15,23,42,0.35)]
                 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#F9FAFB]">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">AI 助手</h3>
              <p class="text-xs text-gray-500">问我任何和系统相关的问题</p>
            </div>
            <el-button link type="default" @click="close">
              关闭
            </el-button>
          </div>

          <div class="flex-1 px-4 py-3 overflow-auto bg-[#F3F4F6" ref="messagesContainer">
            <div v-if="messages.length === 0" class="text-xs text-gray-500 mb-2">示例：</div>
            <div v-if="messages.length === 0" class="mb-2">
              <div class="inline-block px-3 py-2 rounded-2xl bg-white text-xs text-gray-700 shadow-sm">
                帮我看看当前有哪些组织？
              </div>
            </div>
            
            <div v-for="(msg, index) in messages" :key="index" class="mb-3">
              <!-- 用户消息 -->
              <div v-if="msg.role === 'user'" class="mb-2">
                <div class="inline-block px-3 py-2 rounded-2xl bg-white text-xs text-gray-700 shadow-sm max-w-[80%]">
                  {{ msg.content }}
                </div>
              </div>
              <!-- AI 回复 -->
              <div v-else class="flex justify-end mb-2">
                <div class="inline-block px-3 py-2 rounded-2xl bg-[#4F46E5] text-xs text-white shadow-sm max-w-[80%]">
                  <div v-if="msg.loading" class="flex items-center gap-1">
                    <span class="inline-block w-1 h-1 bg-white rounded-full animate-pulse"></span>
                    <span class="inline-block w-1 h-1 bg-white rounded-full animate-pulse" style="animation-delay: 0.2s"></span>
                    <span class="inline-block w-1 h-1 bg-white rounded-full animate-pulse" style="animation-delay: 0.4s"></span>
                  </div>
                  <div v-else class="whitespace-pre-wrap">{{ msg.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100 p-3 bg-white">
            <el-input 
              v-model="input" 
              type="textarea" 
              :rows="2" 
              placeholder="请输入你的问题..."
              :disabled="loading"
              @keydown.ctrl.enter="handleSend"
              @keydown.meta.enter="handleSend"
            />
            <div class="flex justify-end mt-2">
              <el-button 
                type="primary" 
                size="small" 
                :loading="loading"
                :disabled="!input.trim() || loading"
                @click="handleSend"
              >
                {{ loading ? '发送中...' : '发送' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { AiApi } from '@/api'
import { useAgent } from '@/composables/useAgent'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { messages } = useAgent()
const input = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const close = () => {
  emit('update:modelValue', false)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleSend = async () => {
  const query = input.value.trim()
  if (!query || loading.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: query,
  })
  
  // 添加 AI 回复占位（loading 状态）
  const aiMessageIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    loading: true,
  })

  input.value = ''
  loading.value = true
  scrollToBottom()

  try {
    let fullContent = ''

    await AiApi.queryStream(
      query,
      (chunk) => {
        if (chunk.content) {
          fullContent += chunk.content
          // 直接修改对象属性以保持响应式
          const aiMessage = messages.value[aiMessageIndex]
          if (aiMessage) {
            aiMessage.content = fullContent
            aiMessage.loading = false
          }
          scrollToBottom()
        }

        if (chunk.error) {
          const aiMessage = messages.value[aiMessageIndex]
          if (aiMessage) {
            aiMessage.content = fullContent || '抱歉，处理请求时发生错误。'
            aiMessage.loading = false
          }
          ElMessage.error('AI 助手处理请求时发生错误')
        }

        if (chunk.done) {
          const aiMessage = messages.value[aiMessageIndex]
          if (aiMessage) {
            aiMessage.loading = false
          }
        }
      },
      (error) => {
        console.error('AI query error:', error)
        const aiMessage = messages.value[aiMessageIndex]
        if (aiMessage) {
          aiMessage.content = '抱歉，连接 AI 服务失败，请检查服务是否正常运行。'
          aiMessage.loading = false
        }
        ElMessage.error('连接 AI 服务失败')
      },
      () => {
        loading.value = false
        scrollToBottom()
      }
    )
  } catch (error) {
    console.error('Failed to send query:', error)
    const aiMessage = messages.value[aiMessageIndex]
    if (aiMessage) {
      aiMessage.content = '抱歉，发送请求失败，请稍后重试。'
      aiMessage.loading = false
    }
    loading.value = false
    ElMessage.error('发送请求失败')
  }
}

// 当对话框打开时，滚动到底部
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
