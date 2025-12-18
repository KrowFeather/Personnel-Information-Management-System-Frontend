<template>
  <div class="flex h-[calc(100vh-4em)]">
    <div class="h-[calc(100vh-4em)] flex-1 bg-white text-black overflow-y-auto p-l-3em p-r-3em p-t-2em box-border">
      <BlogCard></BlogCard>
      <BlogCard></BlogCard>
      <BlogCard></BlogCard>
    </div>
    <div class="w-33% b-l-1.5px b-t-0 b-r-0 b-b-0 b-solid b-gray-300 p-1em box-border overflow-y-auto rightbar">
      <div class="m-b-1em">
         <h2>{{ orgName }}</h2>
      </div>
      <div>
        <h3>Active Members</h3>
        <div class="flex flex-wrap">
          <img v-for="idx in 15" src="https://picsum.photos/200/300" alt="" :key="idx" class="h-3em w-3em">
        </div>
      </div>
      <div class="h-full w-full">
        <h3 class="p-b-0.5em">Recommend For You</h3>
        <div class="w-full">
          <OrgCard v-for="(item,idx) in orgs" :key="idx" :org="item"></OrgCard>
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
.rightbar::-webkit-scrollbar{
  display: none;
}

.rightbar{
  scrollbar-width: none;
}

</style>
