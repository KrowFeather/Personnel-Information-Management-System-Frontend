<template>
  <div class="flex w-full h-[calc(100vh-4em)] blog-layout overflow-hidden">
    <div class="h-full flex-1 bg-white text-slate-900 overflow-y-auto px-4 py-3 box-border space-y-4">
      <div class="flex items-center justify-between mb-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Organization</p>
          <h2 class="text-lg font-semibold text-slate-800">{{ orgName }}</h2>
        </div>
        <span class="text-xs text-slate-400">Latest announcements</span>
      </div>
      <BlogCard />
      <BlogCard />
      <BlogCard />
    </div>
    <div class="h-full w-33% b-l-1.5px b-t-0 b-r-0 b-b-0 b-solid b-gray-200 px-4 py-3 box-border overflow-y-auto rightbar bg-white/90">
      <div class="mb-4">
        <h2 class="text-base font-semibold text-slate-800 mb-1">{{ orgName }}</h2>
        <p class="text-xs text-slate-400">Overview & members</p>
      </div>
      <div class="mb-4">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Active Members</h3>
        <div class="flex flex-wrap gap-2">
          <img
            v-for="idx in 15"
            src="https://picsum.photos/200/300"
            alt=""
            :key="idx"
            class="h-3em w-3em rounded-full object-cover border border-white shadow-sm"
          >
        </div>
      </div>
      <div class="h-full w-full">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Recommend For You</h3>
        <div class="w-full space-y-2">
          <OrgCard v-for="(item,idx) in orgs" :key="idx" :org="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import BlogCard from '@/components/BlogCard.vue';
import OrgCard from '@/components/OrgCard.vue';

const route = useRoute()
const orgName = computed(() => route.params.org ?? 'unknown')

const orgs = ref([
    {
    name: 'Google Research',
    description: 'Google Research is a artificial intelligence company.',
    logo: 'https://www.blog.google/static/blogv2/images/google-200x200.png',
    banner: 'https://research.google/static/images/blog/google-ai-meta.png'
  },
  {
    name: 'OpenAI',
    description: 'OpenAI is a artificial intelligence research laboratory.',
    logo: 'https://logos-world.net/wp-content/uploads/2024/08/OpenAI-Logo.png',
    banner: 'https://img.lancdn.com/landian/2024/09/105878.png'
  }
])
</script>

<style scoped>
.blog-layout {
  background: radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 28%),
    radial-gradient(circle at 100% 100%, #e5e7ff 0, transparent 30%);
}

.rightbar::-webkit-scrollbar{
  display: none;
}

.rightbar{
  scrollbar-width: none;
}
</style>
