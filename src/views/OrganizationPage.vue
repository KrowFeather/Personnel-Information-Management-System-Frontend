<template>
  <div class="w-full h-full">
    <transition name="el-fade-in-linear">
      <div v-show="show" class="h-100% w-full flex flex-col">
        <div class="w-full h-full banner">
          <div class="m-2em flex items-center h-15em">
            <div>
              <h1 class="text-3em m-b-0.5em">JOIN YOUR ORGANIZATION!</h1>
              <h3>Various organizations are waiting for you</h3>
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
          <div v-for="org in orgs" :key="org.name" class="w-32% m-b-1.5em">
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
  background-image: linear-gradient(to bottom left, white,#dbcaff,#c9b0ff,rgb(203, 166, 255), #e5d9ff);
}
</style>
