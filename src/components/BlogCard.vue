<template>
  <article
    class="w-full rounded-lg bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300 cursor-pointer overflow-hidden"
  >
    <div v-if="tweet?.images && tweet.images.length > 0" class="w-full h-36 overflow-hidden">
      <img
        :src="tweet.images[0]"
        alt="Blog cover"
        class="w-full h-full object-cover"
      >
    </div>
    <div v-else class="w-full h-36 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100"></div>
    <div class="px-4 pt-3 pb-1 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-slate-800 leading-snug">
          {{ tweet?.title || 'Untitled' }}
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          Organization announcement
      </p>
      </div>
      <span class="text-[11px] text-slate-400 whitespace-nowrap ml-3">
        {{ formatTime(tweet?.createTime) }}
      </span>
    </div>
    <p class="px-4 pb-3 pt-1 text-sm text-slate-600 leading-relaxed">
      {{ tweet?.content || 'No content' }}
    </p>
    <div class="px-4 pb-3 text-xs text-slate-400">
      <span>{{ estimateReadTime(tweet?.content) }} min read</span>
  </div>
  </article>
</template>

<script setup lang="ts">
interface Tweet {
  id: number
  title: string
  content: string
  images?: string[]
  createTime?: string
}

const props = defineProps<{
  tweet?: Tweet
}>()

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
</script>

<style scoped>
</style>
