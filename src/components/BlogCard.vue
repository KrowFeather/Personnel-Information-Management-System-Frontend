<template>
  <article
    class="w-full rounded-lg bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden relative"
  >
    
    <!-- 图片展示区域 -->
    <div v-if="tweet?.images && tweet.images.length > 0" class="w-full h-36 overflow-hidden relative">
      <!-- 多图片轮播 -->
      <el-carousel
        v-if="tweet.images.length > 1"
        :interval="0"
        indicator-position="outside"
        height="144px"
        class="blog-carousel"
      >
        <el-carousel-item v-for="(image, index) in tweet.images" :key="index">
          <img
            :src="image"
            :alt="`Image ${index + 1}`"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </el-carousel-item>
      </el-carousel>
      <!-- 单图片 -->
      <img
        v-else
        :src="tweet.images[0]"
        alt="Blog cover"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <!-- 图片数量指示器 -->
      <div v-if="tweet.images.length > 1" class="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {{ tweet.images.length }} images
      </div>
    </div>
    <div v-else class="w-full h-36 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100"></div>
    
    <div class="px-4 pt-3 pb-1 flex items-center justify-between">
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-slate-800 leading-snug">
          {{ tweet?.title || 'Untitled' }}
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          Organization announcement
        </p>
      </div>
      <span class="text-[11px] text-slate-400 whitespace-nowrap ml-3 flex-shrink-0">
        {{ formatTime(tweet?.createTime) }}
      </span>
    </div>
    <p class="px-4 pb-3 pt-1 text-sm text-slate-600 leading-relaxed break-words">
      {{ tweet?.content || 'No content' }}
    </p>
    <div class="px-4 pb-3 text-xs text-slate-400 flex items-center justify-between">
      <span>{{ estimateReadTime(tweet?.content) }} min read</span>
      <!-- 删除按钮 -->
      <el-button
        v-if="canDelete"
        :icon="Delete"
        size="small"
        circle
        class="delete-btn"
        @click.stop="handleDelete"
        :loading="deleting"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { TweetApi } from '@/api'

interface Tweet {
  id: number | string // 支持大数字 ID
  title: string
  content: string
  images?: string[]
  createTime?: string
  senderId?: number
  teamId?: number
}

const props = defineProps<{
  tweet?: Tweet
  currentUserId?: number
  isTeamOwner?: boolean
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  deleted: [tweetId: number]
}>()

const deleting = ref(false)

// 判断是否可以删除：作者、团队管理员或系统管理员
const canDelete = computed(() => {
  if (!props.tweet) return false
  const userId = props.currentUserId
  if (!userId) return false
  
  // 系统管理员可以删除任何推文
  if (props.isAdmin) return true
  
  // 推文作者可以删除
  if (props.tweet.senderId === userId) return true
  
  // 团队管理员可以删除
  if (props.isTeamOwner) return true
  
  return false
})

const formatTime = (time?: string) => {
  if (!time) return 'Unknown time'
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

const estimateReadTime = (content?: string) => {
  if (!content) return 0
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

const handleDelete = async () => {
  if (!props.tweet?.id) return
  
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this post?',
      'Confirm Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    deleting.value = true
    console.log('Deleting tweet with ID:', props.tweet.id, 'Type:', typeof props.tweet.id)
    await TweetApi.deleteTweet(props.tweet.id)
    ElMessage.success('Post deleted successfully')
    emit('deleted', props.tweet.id)
  } catch (e: unknown) {
    if ((e as { action?: string }).action !== 'cancel') {
      console.error('Delete tweet error:', e)
      const err = e as { response?: { data?: { error?: string }; status?: number }; message?: string }
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to delete post'
      ElMessage.error(errorMsg)
    }
  } finally {
    deleting.value = false
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E'
}
</script>

<style scoped>
.blog-carousel :deep(.el-carousel__indicators) {
  bottom: 8px;
}

.blog-carousel :deep(.el-carousel__button) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
}

.blog-carousel :deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background-color: rgba(255, 255, 255, 0.9);
}

.delete-btn {
  color: #64748b;
  border-color: #e2e8f0;
  background-color: white;
}

.delete-btn:hover {
  color: #ef4444;
  border-color: #fca5a5;
  background-color: #fef2f2;
}
</style>
