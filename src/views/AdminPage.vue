<template>
  <div class="w-full h-screen admin-bg overflow-hidden relative">
    <div class="h-4em w-full flex items-center shadow-md z-100 fixed top-0">
      <div class="flex justify-between items-center h-full w-full nav px-4">
        <h1 class="text-xl font-semibold m-l-1em text-slate-800 tracking-wide">
          Admin Panel · Management Center
        </h1>
        <div class="w-30% flex justify-end items-center m-r-1em">
          <el-dropdown>
            <span class="el-dropdown-link cursor-pointer">
              <img
                :src="userAvatar"
                :alt="userName || 'Admin'"
                class="w-3em h-3em rounded-full mr-1em border border-white shadow-sm object-cover"
                @error="handleAvatarError"
              />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">Log out</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <div class="flex h-[calc(100vh-4em)] overflow-hidden relative m-t-4em px-3 gap-3 min-w-0">
      <div
        v-if="pageLoading"
        class="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center"
      >
        <el-icon class="is-loading text-3xl text-slate-600"><Loading /></el-icon>
      </div>
      <div class="w-13% h-full flex-shrink-0 min-w-0">
        <el-menu :default-active="activeTab" class="h-100% sci-menu" @select="handleMenuSelect">
          <el-menu-item index="teams">
            <el-icon><OfficeBuilding /></el-icon>
            <span>Team Management</span>
          </el-menu-item>
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>User Management</span>
          </el-menu-item>
          <el-menu-item index="tweets">
            <el-icon><Message /></el-icon>
            <span>Tweet Management</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="flex-1 h-[calc(100vh-6em)] overflow-y-auto b-1.5px b-solid b-gray-300 bg-white rounded-lg p-4 pb-16 min-w-0 max-w-full">
        <!-- 团队管理 -->
        <div v-if="activeTab === 'teams'" class="w-full min-w-0">
          <div class="mb-4">
            <el-tabs v-model="teamTab" @tab-change="handleTeamTabChange">
              <el-tab-pane label="Pending Approval" name="pending">
                <div class="mt-4">
                  <div v-if="pendingTeamsLoading" class="flex justify-center items-center py-8">
                    <el-icon class="is-loading text-2xl"><Loading /></el-icon>
                  </div>
                  <div v-else-if="pendingTeams.length === 0" class="text-center py-8 text-slate-400">
                    No pending team applications
                  </div>
                  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      v-for="team in pendingTeams"
                      :key="team.id"
                      class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow min-w-0"
                    >
                      <div class="flex items-start justify-between mb-3 gap-2 min-w-0">
                        <h3 class="text-lg font-semibold text-slate-800 truncate flex-1 min-w-0">{{ team.name }}</h3>
                        <el-tag type="warning" size="small" class="flex-shrink-0">Pending</el-tag>
                      </div>
                      <p class="text-sm text-slate-600 mb-3 line-clamp-2 break-words">{{ team.description || 'No description' }}</p>
                      <div class="flex gap-2 flex-wrap">
                        <el-button type="success" size="small" @click="handleApproveTeam(team.id)" :loading="team.approving">
                          Approve
                        </el-button>
                        <el-button type="danger" size="small" @click="handleRejectTeam(team.id)" :loading="team.rejecting">
                          Reject
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="All Teams" name="all">
                <div class="mt-4">
                  <div class="mb-4 flex justify-between items-center">
                    <el-input
                      v-model="teamSearchKeyword"
                      placeholder="Search teams..."
                      class="w-full max-w-xs"
                      clearable
                      @input="handleTeamSearch"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div v-if="allTeamsLoading" class="flex justify-center items-center py-8">
                    <el-icon class="is-loading text-2xl"><Loading /></el-icon>
                  </div>
                  <div v-else-if="filteredAllTeams.length === 0" class="text-center py-8 text-slate-400">
                    No teams found
                  </div>
                  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      v-for="team in filteredAllTeams"
                      :key="team.id"
                      class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow min-w-0"
                    >
                      <div class="flex items-start justify-between mb-3 gap-2 min-w-0">
                        <h3 class="text-lg font-semibold text-slate-800 truncate flex-1 min-w-0">{{ team.name }}</h3>
                        <el-tag :type="getTeamStatusTag(team.status)" size="small" class="flex-shrink-0">
                          {{ getTeamStatusText(team.status) }}
                        </el-tag>
                      </div>
                      <p class="text-sm text-slate-600 mb-3 line-clamp-2 break-words">{{ team.description || 'No description' }}</p>
                      <div class="flex gap-2 flex-wrap">
                        <el-button type="danger" size="small" @click="handleDeleteTeam(team.id)" :loading="team.deleting">
                          Delete
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 用户管理 -->
        <div v-if="activeTab === 'users'" class="w-full min-w-0">
          <div class="mb-4">
            <el-input
              v-model="userSearchKeyword"
              placeholder="Search users by username or name..."
              class="w-full max-w-md"
              clearable
              @keyup.enter="handleUserSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handleUserSearch">Search</el-button>
              </template>
            </el-input>
          </div>
          <div v-if="usersLoading" class="flex justify-center items-center py-8">
            <el-icon class="is-loading text-2xl"><Loading /></el-icon>
          </div>
          <div v-else-if="users.length === 0" class="text-center py-8 text-slate-400">
            No users found
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="user in paginatedUsers"
              :key="user.id"
              class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow min-w-0"
            >
              <div class="flex items-center gap-4 min-w-0">
                <img
                  :src="getUserAvatar(user)"
                  :alt="user.name || user.username"
                  class="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  @error="handleAvatarError"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-slate-800 truncate">{{ user.name || user.username }}</h3>
                  <p class="text-sm text-slate-500 truncate">@{{ user.username }}</p>
                  <p v-if="user.email" class="text-sm text-slate-400 truncate">{{ user.email }}</p>
                </div>
                <el-tag :type="user.admin === 1 ? 'danger' : 'info'" size="small" class="flex-shrink-0">
                  {{ user.admin === 1 ? 'Admin' : 'User' }}
                </el-tag>
              </div>
            </div>
            <div class="flex justify-center pt-2" v-if="users.length > userPageSize">
              <el-pagination
                background
                layout="prev, pager, next"
                :page-size="userPageSize"
                :total="users.length"
                v-model:current-page="userCurrentPage"
                @current-change="handleUserPageChange"
              />
            </div>
          </div>
        </div>

        <!-- 推文管理 -->
        <div v-if="activeTab === 'tweets'" class="w-full min-w-0">
          <div class="mb-4 flex gap-3 flex-wrap items-center">
            <el-input
              v-model="tweetKeyword"
              placeholder="Search tweets by title/content..."
              class="w-full max-w-md"
              clearable
              @keyup.enter="handleTweetSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handleTweetSearch">Search</el-button>
              </template>
            </el-input>
            <el-select
              v-model="tweetTeamId"
              placeholder="Filter by team"
              clearable
              class="w-52"
              @change="handleTweetSearch"
            >
              <el-option
                v-for="team in allTeams"
                :key="team.id"
                :label="team.name"
                :value="team.id"
              />
            </el-select>
          </div>
          <div v-if="tweetsLoading" class="flex justify-center items-center py-8">
            <el-icon class="is-loading text-2xl"><Loading /></el-icon>
          </div>
          <div v-else-if="tweets.length === 0" class="text-center py-8 text-slate-400">
            No tweets found
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="tweet in tweets"
              :key="tweet.id"
              class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow min-w-0"
            >
              <div class="flex justify-between items-start gap-3">
                <div class="min-w-0">
                  <p class="text-xs text-slate-400 mb-1">Team #{{ tweet.teamId }}</p>
                  <h3 class="text-lg font-semibold text-slate-800 truncate">{{ tweet.title }}</h3>
                  <p class="text-sm text-slate-600 line-clamp-2 mt-1">
                    {{ tweet.content || 'No content' }}
                  </p>
                  <p class="text-xs text-slate-400 mt-1">Created: {{ tweet.createTime || 'N/A' }}</p>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  :loading="tweet.deleting"
                  @click="handleDeleteTweet(tweet.id)"
                >
                  Delete
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OfficeBuilding, User, Message, Search, Loading } from '@element-plus/icons-vue'
import { TeamApi, UserApi, TweetApi } from '@/api'
import { clearAuth } from '@/net'

const router = useRouter()

const activeTab = ref('teams')
const teamTab = ref('pending')
const userName = ref('Admin')
const userAvatar = ref('https://ui-avatars.com/api/?name=Admin&background=random')

interface Team {
  id: number
  name: string
  description?: string
  status: number
  approving?: boolean
  rejecting?: boolean
  deleting?: boolean
}

interface User {
  id: number
  username: string
  name?: string
  email?: string
  avatar?: string
  admin?: number
}

interface Tweet {
  id: number | string
  teamId: number
  title: string
  content?: string
  createTime?: string
  deleting?: boolean
}

// 团队管理
const pendingTeams = ref<Team[]>([])
const allTeams = ref<Team[]>([])
const pendingTeamsLoading = ref(false)
const allTeamsLoading = ref(false)
const teamSearchKeyword = ref('')

// 用户管理
const users = ref<User[]>([])
const usersLoading = ref(false)
const userSearchKeyword = ref('')
const usersLoaded = ref(false)
const defaultUserPageSize = 500
const userPageSize = ref(10)
const userCurrentPage = ref(1)
const pageLoading = ref(true)
const tweets = ref<Tweet[]>([])
const tweetsLoading = ref(false)
const tweetKeyword = ref('')
const tweetTeamId = ref<number | ''>('')
const tweetsLoaded = ref(false)

const filteredAllTeams = computed(() => {
  if (!teamSearchKeyword.value) return allTeams.value
  const keyword = teamSearchKeyword.value.toLowerCase()
  return allTeams.value.filter(team =>
    team.name?.toLowerCase().includes(keyword) ||
    team.description?.toLowerCase().includes(keyword)
  )
})

const loadUserInfo = () => {
  const userStr = localStorage.getItem('auth_user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr) as { name?: string; username?: string; avatar?: string }
      userName.value = user.name || user.username || 'Admin'
      userAvatar.value = user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value) + '&background=random'
    } catch (e) {
      console.error('Failed to parse user info', e)
    }
  }
}

const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'https://ui-avatars.com/api/?name=Admin&background=random'
}

const handleMenuSelect = (key: string) => {
  activeTab.value = key
  if (key === 'users' && !usersLoaded.value) {
    fetchUsers()
  }
  if (key === 'tweets' && !tweetsLoaded.value) {
    if (allTeams.value.length === 0) {
      fetchAllTeams()
    }
    fetchTweets()
  }
}

const handleTeamTabChange = (tab: string) => {
  if (tab === 'pending') {
    fetchPendingTeams()
  } else if (tab === 'all') {
    fetchAllTeams()
  }
}

const fetchPendingTeams = async () => {
  pendingTeamsLoading.value = true
  try {
    const resp = await TeamApi.getTeamList(0) // status=0 表示待审核
    const list = (resp.data as { teamList?: Team[] }).teamList || []
    pendingTeams.value = list.map(team => ({
      ...team,
      approving: false,
      rejecting: false,
    }))
  } catch (e) {
    console.error('Failed to load pending teams', e)
    ElMessage.error('Failed to load pending teams')
  } finally {
    pendingTeamsLoading.value = false
  }
}

const fetchAllTeams = async () => {
  allTeamsLoading.value = true
  try {
    const resp = await TeamApi.getTeamList() // 不传 status 获取所有团队
    const list = (resp.data as { teamList?: Team[] }).teamList || []
    allTeams.value = list
      .filter(team => team.status !== 3) // hide deleted teams
      .map(team => ({
      ...team,
      deleting: false,
    }))
  } catch (e) {
    console.error('Failed to load all teams', e)
    ElMessage.error('Failed to load all teams')
  } finally {
    allTeamsLoading.value = false
  }
}

const handleApproveTeam = async (teamId: number) => {
  const team = pendingTeams.value.find(t => t.id === teamId)
  if (!team) return

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve team "${team.name}"?`,
      'Approve Team',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'success',
      }
    )

    team.approving = true
    await TeamApi.approveCreateTeam(teamId)
    ElMessage.success('Team approved successfully')
    await fetchPendingTeams()
  } catch (e: unknown) {
    if ((e as { action?: string }).action !== 'cancel') {
      console.error('Failed to approve team', e)
      ElMessage.error('Failed to approve team')
    }
  } finally {
    team.approving = false
  }
}

const handleRejectTeam = async (teamId: number) => {
  const team = pendingTeams.value.find(t => t.id === teamId)
  if (!team) return

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to reject team "${team.name}"?`,
      'Reject Team',
      {
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    team.rejecting = true
    await TeamApi.rejectCreateTeam(teamId)
    ElMessage.success('Team rejected successfully')
    await fetchPendingTeams()
  } catch (e: unknown) {
    if ((e as { action?: string }).action !== 'cancel') {
      console.error('Failed to reject team', e)
      ElMessage.error('Failed to reject team')
    }
  } finally {
    team.rejecting = false
  }
}

const handleDeleteTeam = async (teamId: number) => {
  const team = allTeams.value.find(t => t.id === teamId)
  if (!team) return

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete team "${team.name}"? This action cannot be undone.`,
      'Delete Team',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error',
      }
    )

    team.deleting = true
    await TeamApi.deleteTeam(teamId)
    ElMessage.success('Team deleted successfully')
    await fetchAllTeams()
  } catch (e: unknown) {
    if ((e as { action?: string }).action !== 'cancel') {
      console.error('Failed to delete team', e)
      ElMessage.error('Failed to delete team')
    }
  } finally {
    team.deleting = false
  }
}

const getTeamStatusTag = (status: number) => {
  if (status === 0) return 'warning'
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  if (status === 3) return 'info'
  return 'info'
}

const getTeamStatusText = (status: number) => {
  if (status === 0) return 'Pending'
  if (status === 1) return 'Approved'
  if (status === 2) return 'Rejected'
  if (status === 3) return 'Deleted'
  return 'Unknown'
}

const handleTeamSearch = () => {
  // Search is handled by computed property
}

const fetchUsers = async (keyword?: string) => {
  usersLoading.value = true
  try {
    const trimmed = keyword?.trim()
    const payload: Record<string, unknown> = {
      matchAll: false,
      offset: 0,
      size: defaultUserPageSize,
    }
    if (trimmed) {
      payload.username = trimmed
      payload.email = trimmed
      payload.name = trimmed
      payload.phone = trimmed
    }
    const resp = await UserApi.searchUser(payload)
    const list = (resp.data as { userList?: User[] }).userList || []
    users.value = list
    usersLoaded.value = true
    userCurrentPage.value = 1
  } catch (e) {
    console.error('Failed to search users', e)
    ElMessage.error('Failed to search users')
  } finally {
    usersLoading.value = false
  }
}

const handleUserSearch = async () => {
  await fetchUsers(userSearchKeyword.value)
}

const paginatedUsers = computed(() => {
  const start = (userCurrentPage.value - 1) * userPageSize.value
  return users.value.slice(start, start + userPageSize.value)
})

const handleUserPageChange = (page: number) => {
  userCurrentPage.value = page
}

const fetchTweets = async () => {
  tweetsLoading.value = true
  try {
    const resp = await TweetApi.searchTweet(
      tweetKeyword.value.trim() || undefined,
      tweetTeamId.value === '' ? undefined : Number(tweetTeamId.value)
    )
    const list = (resp.data as { tweetList?: Tweet[] }).tweetList || []
    tweets.value = list.map(t => ({ ...t, deleting: false }))
    tweetsLoaded.value = true
  } catch (e) {
    console.error('Failed to load tweets', e)
    ElMessage.error('Failed to load tweets')
  } finally {
    tweetsLoading.value = false
  }
}

const handleTweetSearch = async () => {
  await fetchTweets()
}

const handleDeleteTweet = async (tweetId: number | string) => {
  const tweet = tweets.value.find(t => t.id === tweetId)
  if (!tweet) return
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this tweet?',
      'Delete Tweet',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error',
      }
    )
    tweet.deleting = true
    await TweetApi.deleteTweet(tweetId)
    ElMessage.success('Tweet deleted')
    await fetchTweets()
  } catch (e: unknown) {
    if ((e as { action?: string }).action !== 'cancel') {
      console.error('Failed to delete tweet', e)
      ElMessage.error('Failed to delete tweet')
    }
  } finally {
    tweet.deleting = false
  }
}

const getUserAvatar = (user: User) => {
  if (user.avatar) return user.avatar
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.username || 'User') + '&background=random'
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('Are you sure you want to logout?', 'Confirm Logout', {
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
    clearAuth()
    router.push('/login')
  } catch {
    // User cancelled
  }
}

onMounted(async () => {
  loadUserInfo()
  try {
    await fetchPendingTeams()
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped>
.admin-bg {
  background: radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 26%),
    radial-gradient(circle at 100% 100%, #e5e7ff 0, transparent 28%),
    linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%);
  min-height: 100vh;
}

.nav {
  background-image: linear-gradient(to right, #ffffff, #eef2ff);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  backdrop-filter: blur(10px);
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: break-word;
}

.min-w-0 {
  min-width: 0;
}
</style>
