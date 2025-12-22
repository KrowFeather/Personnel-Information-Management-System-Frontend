<template>
  <div class="w-full h-full">
    <transition name="el-fade-in-linear">
      <div v-show="show" class="w-full flex flex-col">
        <div class="w-full h-22em banner">
          <div class="m-2em flex items-center h-15em">
            <div>
              <h1 class="text-3em m-b-0.5em text-white">JOIN YOUR ORGANIZATION!</h1>
              <h3 class="text-slate-200">Various organizations are waiting for you</h3>
            </div>
          </div>
          <div class="h-3em w-full flex items-center justify-center">
            <div class="w-full flex justify-center items-center m-b-4em">
              <el-input style="width: 50%; height: 4em;" placeholder="enter your organization name">

                <template #append>
                  <el-button @click="handleSearch()">
                    <el-icon>
                      <Search />
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
        <div class="flex items-center m-1em">
          <h3>Popular Organizations</h3>
        </div>
        <div class="w-full flex justify-around flex-wrap">
          <div v-for="org in orgs" :key="org.name" class="w-30% m-b-1.5em">
            <OrgCard :org="org"></OrgCard>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OrgCard from '@/components/OrgCard.vue';
import { onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
const show = ref(false);
onMounted(() => {
  show.value = true;
});
const orgs = ref([
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

const handleSearch = () => {
  alert('search')
}
</script>

<style scoped>
.banner{
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(135deg, #0f172a 0%, #111827 12%, #1e293b 35%, #1d4ed8 70%, #60a5fa 100%);
  background-size: 160% 160%;
  animation: org-banner-flow 22s ease-in-out infinite;
  color: #e5e7eb;
}

.banner > * {
  position: relative;
  z-index: 1;
}

.banner::before,
.banner::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.7;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.95), transparent 55%);
  animation: org-bubble 18s ease-in-out infinite;
}

.banner::before {
  width: 170px;
  height: 170px;
  top: -30px;
  left: -40px;
}

.banner::after {
  width: 260px;
  height: 260px;
  bottom: -60px;
  right: -40px;
  animation-delay: 5s;
}

@keyframes org-banner-flow {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 0%;
  }
}

@keyframes org-bubble {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, -16px, 0) scale(1.06);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}
</style>
