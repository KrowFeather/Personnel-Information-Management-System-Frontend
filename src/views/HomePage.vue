<template>
  <div class="w-full h-full home-bg">
    <div class="h-4em w-full flex items-center shadow-md z-100 fixed top-0">
      <div class="flex justify-between items-center h-full w-full nav px-4">
        <h1 class="text-xl font-semibold m-l-1em text-slate-800 tracking-wide">
          Fake Discord · Personnel Center
        </h1>
        <div class="w-30% flex justify-end items-center m-r-1em">
          <el-dropdown>
            <span class="el-dropdown-link cursor-pointer">
              <img
                :src="userAvatar"
                :alt="userName || 'User'"
                class="w-3em h-3em rounded-full mr-1em border border-white shadow-sm object-cover"
                @error="handleAvatarError"
              />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toUserSettingPage">
                  <el-icon class="mr-2"><Setting /></el-icon>
                  Profile
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">Log out</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <div class="flex h-[calc(100vh-4em)] overflow-hidden relative m-t-4em px-3 gap-3">
      <div class="w-13% h-full">
        <el-menu :default-active="activeMenuIndex" class="h-100% sci-menu" @open="handleOpen" @close="handleClose">
          <el-menu-item index="1" @click="toDashBoard()">
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>DashBoard</span>
          </el-menu-item>
          <el-menu-item index="2" @click="toOrganizationPage()">
            <el-icon>
              <Compass />
            </el-icon>
            <span>Organizations</span>
          </el-menu-item>
          <el-menu-item index="3" @click="toUserSettingPage()">
            <el-icon>
              <Setting />
            </el-icon>
            <span>User Setting</span>
          </el-menu-item>
          <el-menu-item index="4" @click="toTeamAdminPage()" v-if="hasManagedTeams">
            <el-icon>
              <DocumentChecked />
            </el-icon>
            <span>Team Applications</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="flex-1 h-full overflow-y-auto b-1.5px b-solid b-gray-300 bg-white">
        <router-view></router-view>
      </div>
      <div class="absolute right-5 bottom-5 w-4em h-4em">
        <el-button type="primary" circle class="ai-btn" style="width: 4em; height: 4em;" @click="showAgent = true">
          <h3 class="text-center text-sm font-semibold">AI+</h3>
        </el-button>
      </div>
    </div>
    <AgentInvoker v-model="showAgent" />
  </div>
</template>

<script setup lang="ts">
import { Menu as IconMenu, Compass, Setting, DocumentChecked } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { baseUrl } from '@/net'
import { TeamApi } from '@/api'
import AgentInvoker from '@/components/AgentInvoker.vue'
const router = useRouter()
const route = useRoute()

const showAgent = ref(false)
const hasManagedTeams = ref(false)

// 根据当前路由确定激活的菜单项
const activeMenuIndex = computed(() => {
  const path = route.path
  if (path.startsWith('/home/dashboard')) return '1'
  if (path.startsWith('/home/organization')) return '2'
  if (path.startsWith('/home/user')) return '3'
  if (path.startsWith('/home/team-admin')) return '4'
  return '2' // 默认
})

// 获取用户信息
const getUserInfo = () => {
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as {
      id?: number
      name?: string
      username?: string
      email?: string
      avatar?: string
    }
  } catch (e) {
    console.error('Failed to parse user info', e)
    return null
  }
}

const userInfo = computed(() => getUserInfo())
const userName = computed(() => userInfo.value?.name || userInfo.value?.username || 'User')
const userAvatar = computed(() => {
  const avatar = userInfo.value?.avatar
  if (avatar) return avatar
  // 默认头像
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value) + '&background=random'
})

const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value) + '&background=random'
}

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const toDashBoard = () => {
  router.push('/home/dashboard')
}

const toOrganizationPage = () => {
  router.push('/home/organization')
}

const toUserSettingPage = () => {
  router.push('/home/user')
}

const toTeamAdminPage = () => {
  router.push('/home/team-admin')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to log out?',
      'Confirm',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning',
      },
    )

    const token = localStorage.getItem('auth_token')

    // 即使没有 token 也要清理本地信息并跳转
    if (token) {
      try {
        await axios.post(`${baseUrl}/auth/logout`, null, {
          headers: {
            // 后端的 Logout 期望的是 "Bearer " 前缀
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (e) {
        console.error('logout error', e)
      }
    }

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')

    ElMessage.success('Logged out')
    router.push('/login')
  } catch {
    // 用户取消，不做处理
  }
}

const checkManagedTeams = async () => {
  try {
    const myTeamsResp = await TeamApi.getMyTeams()
    const myTeams = (myTeamsResp.data as { teamList?: Array<{ ownerId?: number }> }).teamList || []
    const userStr = localStorage.getItem('auth_user')
    let currentUserId: number | null = null
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as { id?: number; userId?: number; user_id?: number }
        currentUserId = user.id || user.userId || user.user_id || null
      } catch (e) {
        console.error('Failed to parse user info', e)
      }
    }
    hasManagedTeams.value = currentUserId !== null && myTeams.some(t => t.ownerId === currentUserId)
  } catch (e) {
    console.error('Failed to check managed teams', e)
  }
}

onMounted(() => {
  // 如果当前不在 /home 的子路由，才跳转到默认页面
  if (!route.path.startsWith('/home/')) {
    router.push('/home/organization')
  }
  checkManagedTeams()
})

// 监听路由变化，确保菜单状态同步
watch(() => route.path, () => {
  // 路由变化时，菜单会自动通过 activeMenuIndex 更新
}, { immediate: true })
</script>

<style scoped>
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

.home-bg {
  background: radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 26%),
    radial-gradient(circle at 100% 100%, #e5e7ff 0, transparent 28%),
    linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%);
}

.sci-menu :deep(.el-menu-item.is-active) {
  background-image: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #1d4ed8;
  border-radius: 999px;
}

.sci-menu {
  border-right: none;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding-top: 0.75rem;
}

.sci-menu :deep(.el-menu-item) {
  margin: 4px 6px;
  border-radius: 999px;
}

.nav {
  /* background-image: linear-gradient(225deg, #22E1FF 0%, #1D8FE1 48%, #2e23fa 100%); */
  background-image: linear-gradient(to right, #ffffff, #eef2ff);
  /* background-color: #fcfcff; */
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  backdrop-filter: blur(10px);
}

.ai-btn {
  background-image: radial-gradient(circle at 0% 0%, #a5b4fc, #6366f1);
  border: none;
  animation: glow-pulse 2.5s ease-in-out infinite;
}
</style>
