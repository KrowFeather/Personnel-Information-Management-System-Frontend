<template>
  <transition name="el-fade-in-linear">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      <div class="absolute inset-0 bg-black/10"></div>

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

          <div class="flex-1 px-4 py-3 overflow-auto bg-[#F3F4F6]">
            <div class="text-xs text-gray-500 mb-2">示例：</div>
            <div class="mb-2">
              <div class="inline-block px-3 py-2 rounded-2xl bg-white text-xs text-gray-700 shadow-sm">
                帮我看看当前有哪些组织？
              </div>
            </div>
            <div class="flex justify-end mb-2">
              <div class="inline-block px-3 py-2 rounded-2xl bg-[#4F46E5] text-xs text-white shadow-sm">
                这是一个示例助手界面，你可以在这里接入后端 AI 接口。
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100 p-3 bg-white">
            <el-input v-model="input" type="textarea" :rows="2" placeholder="请输入你的问题...（目前为示例 UI，尚未接入真实对话接口）" />
            <div class="flex justify-end mt-2">
              <el-button type="primary" size="small" @click="handleSend">
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const input = ref('')

const close = () => {
  emit('update:modelValue', false)
}

const handleSend = () => {
  if (!input.value.trim()) return
  input.value = ''
}
</script>

<style scoped></style>
