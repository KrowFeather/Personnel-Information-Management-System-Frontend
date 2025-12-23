<template>
  <div class="w-full h-full z-[10] user-shell overflow-hidden">
    <transition name="el-fade-in-linear">
      <div v-show="show" class="w-full h-full flex flex-col overflow-hidden">
        <div class="h-20em w-full flex items-center surface relative overflow-hidden flex-shrink-0">
          <div class="h-full w-full flex items-center m-l-3em relative z-10">
            <img 
              :src="userAvatar" 
              :alt="userName"
              class="h-8em w-8em rounded-1em object-cover border-2 border-white shadow-lg flex-shrink-0"
              @error="handleAvatarError"
            >
            <div class="m-l-2em flex-shrink-0">
              <div class="text-white text-1.5em font-semibold truncate">
                {{ userName }}
              </div>
              <div class="text-white/90 text-1em mt-1 truncate">
                {{ userEmail }}
              </div>
              <div v-if="userInfo?.username" class="text-white/80 text-sm mt-1 truncate">
                @{{ userInfo.username }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 w-full px-4 py-3 overflow-hidden flex flex-col min-h-0">
          <el-tabs v-model="activeName" class="h-full flex flex-col">
            <el-tab-pane label="Joined" name="first">
              <div v-if="loadingJoined" class="text-center py-8 text-slate-400">Loading...</div>
              <div v-else-if="joinedOrgs.length === 0" class="text-center py-8 text-slate-400">
                You haven't joined any organizations yet
              </div>
              <div v-else class="grid grid-cols-3 gap-4 pb-4">
                <OrgCard v-for="org in joinedOrgs" :key="org.id" :org="org" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="Created" name="second">
              <div v-if="loadingCreated" class="text-center py-8 text-slate-400">Loading...</div>
              <div v-else-if="createdOrgs.length === 0" class="text-center py-8 text-slate-400">
                You haven't created any organizations yet
              </div>
              <div v-else class="grid grid-cols-3 gap-4 pb-4">
                <OrgCard v-for="org in createdOrgs" :key="org.id" :org="org" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="Settings" name="third">
              <div class="max-w-2xl mx-auto py-6 space-y-6">
                <!-- Account Information -->
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-slate-800">Account Information</h3>
                    <el-button type="primary" size="small" @click="openEditDialog">
                      <el-icon class="mr-1"><Edit /></el-icon>
                      Edit
                    </el-button>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between py-3 border-b border-slate-100">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600">Username</div>
                        <div class="text-base text-slate-800 mt-1">{{ userInfo?.username || 'N/A' }}</div>
                      </div>
                      <el-icon class="text-slate-400"><User /></el-icon>
                    </div>
                    <div class="flex items-center justify-between py-3 border-b border-slate-100">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600">Email</div>
                        <div class="text-base text-slate-800 mt-1">{{ userEmail }}</div>
                      </div>
                      <el-icon class="text-slate-400"><Message /></el-icon>
                    </div>
                    <div class="flex items-center justify-between py-3 border-b border-slate-100">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600">Display Name</div>
                        <div class="text-base text-slate-800 mt-1">{{ userInfo?.name || 'Not set' }}</div>
                      </div>
                      <el-icon class="text-slate-400"><Avatar /></el-icon>
                    </div>
                    <div class="flex items-center justify-between py-3 border-b border-slate-100">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600">Avatar</div>
                        <div class="mt-2">
                          <img 
                            :src="userAvatar" 
                            :alt="userName"
                            class="h-16 w-16 rounded-lg object-cover border border-slate-200"
                            @error="handleAvatarError"
                          >
                        </div>
                      </div>
                      <el-icon class="text-slate-400"><Picture /></el-icon>
                    </div>
                    <div class="flex items-center justify-between py-3 border-b border-slate-100">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600">Birthday</div>
                        <div class="text-base text-slate-800 mt-1">{{ formatBirthday(userInfo?.birthday) }}</div>
                      </div>
                      <el-icon class="text-slate-400"><Calendar /></el-icon>
                    </div>
                    <div class="flex items-center justify-between py-3 border-b border-slate-100">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600">Phone</div>
                        <div class="text-base text-slate-800 mt-1">{{ userInfo?.phone || 'Not set' }}</div>
                      </div>
                      <el-icon class="text-slate-400"><Phone /></el-icon>
                    </div>
                    <div class="flex items-center justify-between py-3 border-b border-slate-100">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600">Gender</div>
                        <div class="text-base text-slate-800 mt-1">{{ formatGender(userInfo?.gender) }}</div>
                      </div>
                      <el-icon class="text-slate-400"><UserFilled /></el-icon>
                    </div>
                    <div class="flex items-center justify-between py-3">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600">Address</div>
                        <div class="text-base text-slate-800 mt-1">{{ userInfo?.address || 'Not set' }}</div>
                      </div>
                      <el-icon class="text-slate-400"><Location /></el-icon>
                    </div>
                  </div>
                </div>

                <!-- Edit Dialog -->
                <el-dialog
                  v-model="editDialogVisible"
                  title="Edit Profile"
                  width="500px"
                >
                  <el-form
                    :model="editForm"
                    :rules="editRules"
                    ref="editFormRef"
                    label-width="100px"
                    label-position="left"
                  >
                    <el-form-item label="Display Name" prop="name">
                      <el-input v-model="editForm.name" placeholder="Enter display name" />
                    </el-form-item>
                    <el-form-item label="Avatar URL" prop="avatar">
                      <el-input v-model="editForm.avatar" placeholder="Enter avatar image URL" />
                      <div v-if="editForm.avatar" class="mt-2">
                        <img 
                          :src="editForm.avatar" 
                          alt="Preview"
                          class="h-20 w-20 rounded-lg object-cover border border-slate-200"
                          @error="handlePreviewError"
                        >
                      </div>
                    </el-form-item>
                    <el-form-item label="Birthday" prop="birthday">
                      <el-date-picker
                        v-model="editForm.birthday"
                        type="date"
                        placeholder="Select birthday"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                      />
                    </el-form-item>
                    <el-form-item label="Phone" prop="phone">
                      <el-input v-model="editForm.phone" placeholder="Enter phone number" />
                    </el-form-item>
                    <el-form-item label="Gender" prop="gender">
                      <el-radio-group v-model="editForm.gender">
                        <el-radio :label="0">Female</el-radio>
                        <el-radio :label="1">Male</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="Address" prop="address">
                      <el-input 
                        v-model="editForm.address" 
                        type="textarea"
                        :rows="2"
                        placeholder="Enter address"
                      />
                    </el-form-item>
                  </el-form>
                  <template #footer>
                    <span class="dialog-footer">
                      <el-button @click="editDialogVisible = false">Cancel</el-button>
                      <el-button type="primary" :loading="updating" @click="handleUpdateProfile">
                        Save
                      </el-button>
                    </span>
                  </template>
                </el-dialog>

                <!-- Security Settings -->
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h3 class="text-lg font-semibold text-slate-800 mb-4">Security</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between py-3">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-600 mb-1">Password</div>
                        <div class="text-xs text-slate-400">Change your account password</div>
                      </div>
                      <el-button type="primary" plain @click="handleChangePassword">
                        <el-icon class="mr-1"><Lock /></el-icon>
                        Change Password
                      </el-button>
                    </div>
                  </div>
                </div>

                <!-- Danger Zone -->
                <div class="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                  <h3 class="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <div class="flex items-center justify-between py-3">
                    <div class="flex-1">
                      <div class="text-sm font-medium text-slate-600 mb-1">Sign Out</div>
                      <div class="text-xs text-slate-400">Sign out of your account</div>
                    </div>
                    <el-button type="danger" @click="handleLogout">
                      <el-icon class="mr-1"><SwitchButton /></el-icon>
                      Logout
                    </el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Message, Avatar, Lock, SwitchButton, Edit, Picture, Calendar, Phone, UserFilled, Location } from '@element-plus/icons-vue'
import OrgCard from "@/components/OrgCard.vue";
import { TeamApi, AuthApi, UserApi } from '@/api'
import { clearAuth, saveAuth } from '@/net'

const router = useRouter()
const show = ref(false);
const activeName = ref("first");

interface Org {
  id?: number
  name: string
  description?: string
  logo?: string
  banner?: string
  ownerId?: number
  owner_id?: number
}

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
      birthday?: string
      phone?: string
      gender?: number
      address?: string
    }
  } catch (e) {
    console.error('Failed to parse user info', e)
    return null
  }
}

const userInfo = ref(getUserInfo())
const userName = computed(() => userInfo.value?.name || userInfo.value?.username || 'User')
const userEmail = computed(() => userInfo.value?.email || 'No email')
const userAvatar = computed(() => {
  const avatar = userInfo.value?.avatar
  if (avatar) return avatar
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value) + '&background=random'
})

const editDialogVisible = ref(false)
const updating = ref(false)
const editFormRef = ref()

const editForm = reactive({
  name: '',
  avatar: '',
  birthday: '',
  phone: '',
  gender: undefined as number | undefined,
  address: '',
})

const editRules = {
  name: [
    { max: 50, message: 'Name should not exceed 50 characters', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^[0-9+\-\s()]*$/, message: 'Please enter a valid phone number', trigger: 'blur' }
  ],
}

const formatBirthday = (birthday?: string) => {
  if (!birthday) return 'Not set'
  try {
    const date = new Date(birthday)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch (e) {
    return birthday
  }
}

const formatGender = (gender?: number) => {
  if (gender === undefined || gender === null) return 'Not set'
  return gender === 1 ? 'Male' : gender === 0 ? 'Female' : 'Not set'
}

const openEditDialog = () => {
  if (!userInfo.value) return
  editForm.name = userInfo.value.name || ''
  editForm.avatar = userInfo.value.avatar || ''
  editForm.birthday = userInfo.value.birthday || ''
  editForm.phone = userInfo.value.phone || ''
  editForm.gender = userInfo.value.gender
  editForm.address = userInfo.value.address || ''
  editDialogVisible.value = true
}

const handlePreviewError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

const handleUpdateProfile = async () => {
  if (!editFormRef.value || !userInfo.value?.id) return
  
  updating.value = true
  editFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      updating.value = false
      return
    }

    try {
      const payload: {
        userId: number
        name?: string
        avatar?: string
        birthday?: string
        phone?: string
        gender?: number
        address?: string
      } = {
        userId: userInfo.value.id,
      }

      if (editForm.name) payload.name = editForm.name
      if (editForm.avatar) payload.avatar = editForm.avatar
      if (editForm.birthday) payload.birthday = editForm.birthday
      if (editForm.phone) payload.phone = editForm.phone
      if (editForm.gender !== undefined) payload.gender = editForm.gender
      if (editForm.address) payload.address = editForm.address

      const resp = await UserApi.updateUserInfo(payload)
      const updatedUser = (resp.data as { user?: typeof userInfo.value }).user
      
      if (updatedUser) {
        // 更新本地存储的用户信息
        saveAuth(undefined, updatedUser)
        userInfo.value = updatedUser
        ElMessage.success('Profile updated successfully')
        editDialogVisible.value = false
      }
    } catch (e) {
      console.error(e)
      ElMessage.error('Failed to update profile')
    } finally {
      updating.value = false
    }
  })
}

const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value) + '&background=random'
}

const joinedOrgs = ref<Org[]>([])
const createdOrgs = ref<Org[]>([])
const loadingJoined = ref(false)
const loadingCreated = ref(false)

const fetchJoinedOrgs = async () => {
  loadingJoined.value = true
  try {
    const resp = await TeamApi.getMyTeams()
    const list = (resp.data as { teamList?: Org[] }).teamList || []
    const currentUserId = userInfo.value?.id
    // 排除用户创建的组织
    joinedOrgs.value = list.filter(org => {
      const ownerId = org.ownerId || org.owner_id
      return ownerId !== currentUserId
    })
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to load joined organizations')
  } finally {
    loadingJoined.value = false
  }
}

const fetchCreatedOrgs = async () => {
  loadingCreated.value = true
  try {
    const resp = await TeamApi.getMyTeams()
    const list = (resp.data as { teamList?: Org[] }).teamList || []
    const currentUserId = userInfo.value?.id
    // 只显示用户创建的组织
    createdOrgs.value = list.filter(org => {
      const ownerId = org.ownerId || org.owner_id
      return ownerId === currentUserId
    })
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to load created organizations')
  } finally {
    loadingCreated.value = false
  }
}

const handleChangePassword = () => {
  ElMessage.info('Change password feature coming soon')
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

    try {
      await AuthApi.logout()
    } catch (e) {
      console.error('logout error', e)
    }

    clearAuth()
    ElMessage.success('Logged out')
    router.push('/login')
  } catch {
    // 用户取消，不做处理
  }
}

onMounted(() => {
  show.value = true;
  fetchJoinedOrgs()
  fetchCreatedOrgs()
});
</script>

<style scoped>
.user-shell {
  background: radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 26%),
    radial-gradient(circle at 100% 100%, #e5e7ff 0, transparent 28%),
    linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%);
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.surface {
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(135deg, #0f172a 0%, #111827 12%, #1e293b 35%, #1d4ed8 70%, #60a5fa 100%);
  background-size: 160% 160%;
  animation: user-banner-flow 22s ease-in-out infinite;
  color: #e5e7eb;
}

.surface > * {
  position: relative;
  z-index: 1;
}

.surface::before,
.surface::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.7;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.95), transparent 55%);
  animation: user-bubble 18s ease-in-out infinite;
}

.surface::before {
  width: 170px;
  height: 170px;
  top: -30px;
  left: -40px;
}

.surface::after {
  width: 260px;
  height: 260px;
  bottom: -60px;
  right: -40px;
  animation-delay: 5s;
}

@keyframes user-banner-flow {
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

@keyframes user-bubble {
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
