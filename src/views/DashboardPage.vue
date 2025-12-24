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
                class="org-menu-item"
              >
                <img :src="item.logo" alt="" class="w-3.2em h-3.2em rounded-lg shadow-sm object-cover">
                <span class="flex-1 m-l-1em font-medium text-slate-800 truncate">
                  {{ item.name }}
                </span>
                <el-dropdown
                  v-if="!isTeamOwner(item)"
                  trigger="click"
                  @command="(cmd: string) => handleLeaveTeam(Number(cmd))"
                  @click.stop
                >
                  <el-icon class="ml-2 cursor-pointer hover:text-red-600 transition-colors" @click.stop><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="String(item.id)" class="text-red-600">
                        Leave Team
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-menu-item>
            </el-menu>
          </div>
          <div class="h-full w-full dashboard-content">
            <router-view></router-view>
          </div>
          <div class="absolute right-5 bottom-5 w-4em h-4em z-10">
            <el-button type="primary" circle class="ai-btn" style="width: 4em; height: 4em;" @click="showAgent = true">
              <h3 class="text-center text-sm font-semibold">AI+</h3>
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, MoreFilled } from '@element-plus/icons-vue'
import { TeamApi } from '@/api'
import { useAgent } from '@/composables/useAgent'

const show = ref(false);
const router = useRouter()
const { showAgent } = useAgent()

interface Org {
  id?: number
  name: string
  description?: string
  logo?: string
  banner?: string
  ownerId?: number
  owner_id?: number
}

const orgs = ref<Org[]>([])
const loading = ref(false)

// 获取当前用户ID
const getCurrentUserId = () => {
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr) as { id?: number }
    return user.id
  } catch {
    return null
  }
}

const currentUserId = computed(() => getCurrentUserId())

// 判断是否是团队创建者
const isTeamOwner = (org: Org) => {
  if (!currentUserId.value) return false
  const ownerId = org.ownerId || (org as unknown as { owner_id?: number }).owner_id
  return ownerId === currentUserId.value
}

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
      ownerId: t.ownerId || (t as unknown as { owner_id?: number }).owner_id,
      owner_id: (t as unknown as { owner_id?: number }).owner_id,
    }))
    if (orgs.value.length > 0 && orgs.value[0]?.name) {
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

const handleLeaveTeam = async (teamId: number) => {
  const team = orgs.value.find(t => t.id === teamId)
  if (!team || !team.id) return

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to leave "${team.name}"?`,
      'Leave Team',
      {
        confirmButtonText: 'Leave',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    await TeamApi.leaveTeam(teamId)
    ElMessage.success('Left team successfully')
    await fetchOrgs()
  } catch (e: unknown) {
    if ((e as { action?: string }).action !== 'cancel') {
      console.error('Failed to leave team', e)
      ElMessage.error('Failed to leave team')
    }
  }
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
  height: calc(100vh - 4em);
}

.sci-menu :deep(.el-menu-item) {
  margin: 4px 8px;
  border-radius: 999px;
}

.sci-menu :deep(.el-menu-item.is-active) {
  background-image: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #1d4ed8;
}

.org-menu-item {
  position: relative;
}

.org-menu-item :deep(.el-dropdown) {
  opacity: 0;
  transition: opacity 0.2s;
}

.org-menu-item:hover :deep(.el-dropdown) {
  opacity: 1;
}

.ai-btn {
  background-image: radial-gradient(circle at 0% 0%, #a5b4fc, #6366f1);
  border: none;
  animation: glow-pulse 2.5s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(129, 140, 248, 0.45),
      0 0 16px rgba(79, 70, 229, 0.35);
  }

  50% {
    box-shadow: 0 0 12px rgba(129, 140, 248, 0.9),
      0 0 24px rgba(79, 70, 229, 0.7);
  }
}
</style>
