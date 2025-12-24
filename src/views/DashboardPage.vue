<template>
  <div class="w-full h-full z-[10] overflow-hidden dashboard-shell relative">
    <transition name="el-fade-in-linear">
      <div v-show="show">
        <div class="w-full h-full flex overflow-hidden relative">
          <div
            v-if="loading"
            class="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center"
          >
            <el-icon class="is-loading text-3xl text-slate-600"><Loading /></el-icon>
          </div>
          <div class="w-20% h-full dashboard-menu">
            <el-menu class="sci-menu h-full" :default-active="'0'">
              <div v-if="!loading && orgs.length === 0" class="p-4 text-center text-slate-400 text-sm">
                No organizations
              </div>
              <el-menu-item
                v-for="(item, idx) in orgs"
                :index="String(idx)"
                @click="toOrgBlog(item.name)"
                :key="idx"
              >
                <img :src="item.logo" alt="" class="w-3.2em h-3.2em rounded-lg shadow-sm object-cover">
                <span class="flex-1 m-l-1em font-medium text-slate-800 truncate">
                  {{ item.name }}
                </span>
              </el-menu-item>
            </el-menu>
          </div>
          <div class="h-full w-full dashboard-content">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { TeamApi } from '@/api'

const show = ref(false);
const router = useRouter()

interface Org {
  id?: number
  name: string
  description?: string
  logo?: string
  banner?: string
}

const orgs = ref<Org[]>([])
const loading = ref(false)

const fetchOrgs = async () => {
  loading.value = true
  try {
    const resp = await TeamApi.getMyTeams()
    const list = (resp.data as { teamList?: Org[] }).teamList || []
    orgs.value = list.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      logo: t.logo,
      banner: t.banner,
    }))
    if (orgs.value.length > 0) {
      router.push({ name: 'Blog', params: { org: orgs.value[0].name } })
    } else {
      ElMessage.info('You have not joined any organizations yet')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to load organizations')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  show.value = true;
  fetchOrgs()
});

const toOrgBlog = (orgSlug: string) => {
  router.push({ name: 'Blog', params: { org: orgSlug } })
}
</script>

<style scoped>
.dashboard-shell {
  background: radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 26%),
    radial-gradient(circle at 100% 100%, #e5e7ff 0, transparent 28%),
    linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%);
}

.dashboard-menu {
  background-color: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
}

.dashboard-content {
  padding: 0.75rem 0.75rem 0.5rem;
}

.sci-menu {
  border-right: none;
  padding-top: 0.75rem;
}

.sci-menu :deep(.el-menu-item) {
  margin: 4px 8px;
  border-radius: 999px;
}

.sci-menu :deep(.el-menu-item.is-active) {
  background-image: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #1d4ed8;
}
</style>
