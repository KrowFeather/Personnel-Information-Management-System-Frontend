<template>
  <div class="w-full h-full z-[10] overflow-hidden">
    <transition name="el-fade-in-linear">
      <div v-show="show">
        <div class="w-full h-full flex overflow-y-hidden">
          <div class="w-20% h-[calc(100vh-4em)] b-r-1.5px b-t-0 b-l-0 b-b-0 b-solid b-gray-300">
            <el-menu class="sci-menu" :default-active="0">
              <el-menu-item v-for="(item, idx) in orgs" :index="idx" @click="toOrgBlog(item.name)" :key="idx">
                <img :src="item.logo" alt="" class="w-3.2em h-3.2em rounded-xl">
                <span class="m-l-1em">{{ item.name }}</span>
              </el-menu-item>
            </el-menu>
          </div>
          <div class="h-full w-full">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted} from "vue";
import type { Ref } from "vue";
import { useRouter } from 'vue-router'

const show = ref(false);
const router = useRouter()

onMounted(() => {
  show.value = true;
  console.log('orgs', orgs.value)
  router.push({ name: 'Blog', params: { org: orgs.value[0]?.name } })
});

interface Org {
  name: string
  description?: string
  logo?: string
  banner?: string
}

const orgs: Ref<Org[]> = ref([
  {
    name: 'Apple ML',
    description: 'Apple ML is a machine learning company.',
    logo: 'https://th.bing.com/th/id/OIP.cX1fKk3vsARCeW2en8W8_QHaE8?w=232&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
    banner: 'https://photos5.appleinsider.com/gallery/33813-59969-000-lead-ML-xl.jpg'
  },
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
  },
  {
    name: 'DeepMind',
    description: 'DeepMind is a artificial intelligence company.',
    logo: 'https://th.bing.com/th/id/OIP.Jdg6NLFts5Gvvu7KBEpfvQHaFj?w=235&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
    banner: 'https://hitconsultant.net/wp-content/uploads/2016/07/Google-DeepMind.png'
  },
  {
    name: 'Microsoft Research',
    description: 'Microsoft Research is a research division of Microsoft.',
    logo: 'https://th.bing.com/th/id/OIP.S6HTesXi1haWNZpfoUbd8AHaFj?w=208&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
    banner: 'https://th.bing.com/th/id/OIP.S6HTesXi1haWNZpfoUbd8AHaFj?w=208&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
  },
  {
    name: 'Facebook AI Research',
    description: 'Facebook AI Research is a artificial intelligence research laboratory.',
    logo: 'https://th.bing.com/th/id/OIP.SwZHn_xscjcc2OqaSAykcgHaEe?w=290&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1',
    banner: 'https://th.bing.com/th/id/OIP.SwZHn_xscjcc2OqaSAykcgHaEe?w=290&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
  }
])

const toOrgBlog = (orgSlug: string) => {
  router.push({ name: 'Blog', params: { org: orgSlug } })
}
</script>

<style scoped>
.sci-menu :deep(.el-menu-item.is-active) {
  /* animation: glow-pulse 2s ease-in-out infinite; */
  background-color: #E0E7FF;
  /* background-image: linear-gradient(-225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%); */
  color: #1c47e2;
}
</style>
