<template>
  <div class="w-full h-full">
    <transition name="el-fade-in-linear">
      <div v-show="show" class="transition-box h-100%">
        <div class="w-full h-30%">
          <div class="m-3em flex justify-center items-center">
            <h1 class="text-3em">JOIN YOUR ORGANIZATION!</h1>
          </div>
          <div class="h-3em w-full flex items-center justify-center">
            <div class="w-full flex justify-center items-center">
              <el-input style="width: 50%; height: 4em;">

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
        <div class="flex justify-center items-center">
          <h3>Popular Organizations</h3>
        </div>
        <div class="w-full flex justify-around flex-wrap">
          <div v-for="org in orgs" :key="org.name" class="w-30% m-b-3em">
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
    logo: 'https://th.bing.com/th/id/OIP.cX1fKk3vsARCeW2en8W8_QHaE8?w=232&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
  },
  {
    name: 'Google Research',
    description: 'Google Research is a artificial intelligence company.',
    logo: 'https://www.blog.google/static/blogv2/images/google-200x200.png'
  },
  {
    name: 'OpenAI',
    description: 'OpenAI is a artificial intelligence research laboratory.',
    logo: 'https://logos-world.net/wp-content/uploads/2024/08/OpenAI-Logo.png'
  },
  {
    name: 'DeepMind',
    description: 'DeepMind is a artificial intelligence company.',
    logo: 'https://th.bing.com/th/id/OIP.Jdg6NLFts5Gvvu7KBEpfvQHaFj?w=235&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
  },
  {
    name: 'Microsoft Research',
    description: 'Microsoft Research is a research division of Microsoft.',
    logo: 'https://th.bing.com/th/id/OIP.S6HTesXi1haWNZpfoUbd8AHaFj?w=208&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
  },
  {
    name: 'Facebook AI Research',
    description: 'Facebook AI Research is a artificial intelligence research laboratory.',
    logo: 'https://th.bing.com/th/id/OIP.SwZHn_xscjcc2OqaSAykcgHaEe?w=290&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
  }
])

const handleSearch = () => {
  alert('search')
}
</script>

<style scoped></style>
