<template>
  <div class="w-full h-full overflow-hidden team-admin-page">
    <div class="w-full h-full overflow-y-auto p-6">
      <div class="mb-6 flex-shrink-0">
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Team Management</h1>
        <p class="text-sm text-slate-500">Manage your teams' applications and members</p>
      </div>

      <el-tabs v-model="activeTab" class="team-admin-tabs">
        <!-- Applications Tab -->
        <el-tab-pane label="Applications" name="applications">
          <div v-if="loadingApplications" class="text-center py-12">
            <el-icon class="is-loading" :size="32">
              <Loading />
            </el-icon>
            <p class="text-slate-400 mt-4">Loading applications...</p>
          </div>

          <div v-else-if="teamApplications.length === 0" class="text-center py-12">
            <p class="text-slate-400 mb-2">No applications to review</p>
          </div>

          <div v-else class="space-y-4 pb-4 max-w-full p-r-3em">
            <div
              v-for="app in teamApplications"
              :key="`${app.teamId}-${app.id}`"
              class="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow max-w-full overflow-hidden"
            >
              <div class="flex items-start gap-4 max-w-full">
                <div class="flex-1 min-w-0 overflow-hidden">
                  <div class="flex items-center mb-3 flex-wrap gap-2">
                    <h3 class="text-lg font-semibold text-slate-800 truncate max-w-full">
                      {{ app.teamName }}
                    </h3>
                    <el-tag size="small" type="warning" class="flex-shrink-0">Pending</el-tag>
                  </div>
                  <div class="space-y-2 text-sm text-slate-600">
                    <div class="break-words overflow-wrap-anywhere">
                      <span class="font-medium">Applicant:</span>
                      <span class="ml-2">{{ app.applicantName || `User #${app.applicantId}` }}</span>
                    </div>
                    <div class="break-words overflow-wrap-anywhere">
                      <span class="font-medium">Applied at:</span>
                      <span class="ml-2">{{ formatTime(app.applyTime) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <el-button
                    type="success"
                    size="small"
                    :loading="app.approving"
                    @click="handleApprove(app)"
                  >
                    Approve
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    :loading="app.rejecting"
                    @click="handleReject(app)"
                  >
                    Reject
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Members Tab -->
        <el-tab-pane label="Members" name="members">
          <div class="mb-4 flex items-center gap-4">
            <el-select
              v-model="selectedTeamId"
              placeholder="Select a team"
              style="width: 300px"
              @change="handleTeamChange"
            >
              <el-option
                v-for="team in managedTeams"
                :key="team.id"
                :label="team.name"
                :value="team.id"
              />
            </el-select>
            <el-input
              v-model="memberSearchKeyword"
              placeholder="Search members by name or email"
              style="width: 300px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div v-if="loadingMembers" class="text-center py-12">
            <el-icon class="is-loading" :size="32">
              <Loading />
            </el-icon>
            <p class="text-slate-400 mt-4">Loading members...</p>
          </div>

          <div v-else-if="!selectedTeamId" class="text-center py-12">
            <p class="text-slate-400">Please select a team to view members</p>
          </div>

          <div v-else-if="filteredMembers.length === 0" class="text-center py-12">
            <p class="text-slate-400 mb-2">No members found</p>
          </div>

          <div v-else class="space-y-3 pb-4">
            <div
              v-for="member in filteredMembers"
              :key="member.id"
              class="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span class="text-slate-600 font-semibold">
                      {{ (member.name || member.username || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="text-base font-semibold text-slate-800 truncate">
                        {{ member.name || member.username || `User #${member.id}` }}
                      </h4>
                      <el-tag v-if="isTeamOwner(member)" size="small" type="warning">Owner</el-tag>
                      <el-tag v-else-if="member.position" size="small" type="info">{{ member.position }}</el-tag>
                    </div>
                    <div class="text-sm text-slate-500 truncate">
                      {{ member.email || member.username || `ID: ${member.id}` }}
                    </div>
                  </div>
                </div>
                <el-button
                  v-if="!isTeamOwner(member)"
                  type="danger"
                  size="small"
                  :loading="member.removing"
                  @click="handleRemoveMember(member)"
                >
                  Remove
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Team Info Tab -->
        <el-tab-pane label="Team Info" name="info">
          <div class="mb-4">
            <el-select
              v-model="selectedTeamIdForEdit"
              placeholder="Select a team to edit"
              style="width: 300px"
              @change="handleTeamInfoChange"
            >
              <el-option
                v-for="team in managedTeams"
                :key="team.id"
                :label="team.name"
                :value="team.id"
              />
            </el-select>
          </div>

          <div v-if="loadingTeamInfo" class="text-center py-12">
            <el-icon class="is-loading" :size="32">
              <Loading />
            </el-icon>
            <p class="text-slate-400 mt-4">Loading team information...</p>
          </div>

          <div v-else-if="!selectedTeamIdForEdit" class="text-center py-12">
            <p class="text-slate-400">Please select a team to edit</p>
          </div>

          <div v-else class="max-w-2xl">
            <el-form
              :model="teamInfoForm"
              ref="teamInfoFormRef"
              label-width="120px"
              label-position="left"
            >
              <el-form-item label="Team Name">
                <el-input v-model="teamInfoForm.name" disabled />
                <div class="text-xs text-slate-400 mt-1">Team name cannot be changed</div>
              </el-form-item>

              <el-form-item label="Logo">
                <div class="w-full">
                  <el-upload
                    :action="''"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="(file: UploadFile) => handleLogoChange(file)"
                    accept="image/*"
                    class="w-full"
                  >
                    <template #trigger>
                      <el-button type="primary" size="small" plain :loading="uploadingLogo">
                        <el-icon class="mr-1"><Upload /></el-icon>
                        {{ teamInfoForm.logo ? 'Change Logo' : 'Upload Logo' }}
                      </el-button>
                    </template>
                  </el-upload>
                  <div v-if="teamInfoForm.logo" class="mt-2">
                    <img
                      :src="teamInfoForm.logo"
                      alt="Logo Preview"
                      class="max-w-full h-32 object-contain rounded-lg border border-slate-200 bg-slate-50"
                      @error="handleImageError"
                    />
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="Banner">
                <div class="w-full">
                  <el-upload
                    :action="''"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="(file: UploadFile) => handleBannerChange(file)"
                    accept="image/*"
                    class="w-full"
                  >
                    <template #trigger>
                      <el-button type="primary" size="small" plain :loading="uploadingBanner">
                        <el-icon class="mr-1"><Upload /></el-icon>
                        {{ teamInfoForm.banner ? 'Change Banner' : 'Upload Banner' }}
                      </el-button>
                    </template>
                  </el-upload>
                  <div v-if="teamInfoForm.banner" class="mt-2">
                    <img
                      :src="teamInfoForm.banner"
                      alt="Banner Preview"
                      class="max-w-full h-32 object-cover rounded-lg border border-slate-200"
                      @error="handleImageError"
                    />
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="Description">
                <el-input
                  v-model="teamInfoForm.description"
                  type="textarea"
                  :rows="4"
                  placeholder="Enter team description"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="updatingTeamInfo" @click="handleUpdateTeamInfo">
                  Save Changes
                </el-button>
                <el-button @click="handleResetTeamInfo">Reset</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, Search, Upload } from '@element-plus/icons-vue'
import { TeamApi, FileApi } from '@/api'
import type { UploadFile } from 'element-plus'

interface TeamJoinApplication {
  id: number
  teamId: number
  teamName: string
  applicantId: number
  applicantName?: string
  applyTime: string
  status: number
  approving?: boolean
  rejecting?: boolean
}

interface TeamMember {
  id: number
  name?: string
  username?: string
  email?: string
  position?: string
  removing?: boolean
}

interface ManagedTeam {
  id: number
  name: string
  ownerId?: number
  owner_id?: number
}

const activeTab = ref('applications')
const loadingApplications = ref(false)
const loadingMembers = ref(false)
const loadingTeamInfo = ref(false)
const teamApplications = ref<TeamJoinApplication[]>([])
const managedTeams = ref<ManagedTeam[]>([])
const selectedTeamId = ref<number | null>(null)
const selectedTeamIdForEdit = ref<number | null>(null)
const teamMembers = ref<TeamMember[]>([])
const memberSearchKeyword = ref('')
const currentUserId = ref<number | null>(null)
const uploadingLogo = ref(false)
const uploadingBanner = ref(false)
const updatingTeamInfo = ref(false)
const teamInfoFormRef = ref()

const teamInfoForm = reactive({
  id: 0,
  name: '',
  logo: '',
  banner: '',
  description: '',
})

// 获取当前用户ID
const getCurrentUserId = () => {
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr) as { id?: number | string; userId?: number | string; user_id?: number | string }
    const id = user.id || user.userId || user.user_id
    if (id !== undefined && id !== null) {
      const userId = typeof id === 'string' ? parseInt(id, 10) : id
      return isNaN(userId) ? null : userId
    }
  } catch (e) {
    console.error('Failed to parse user info', e)
  }
  return null
}

// 获取管理的团队列表
const fetchManagedTeams = async () => {
  try {
    const myTeamsResp = await TeamApi.getMyTeams()
    const myTeams = (myTeamsResp.data as { teamList?: Array<{
      id?: number
      name?: string
      ownerId?: number
      owner_id?: number
    }> }).teamList || []

    const userId = getCurrentUserId()
    if (!userId) {
      ElMessage.warning('Unable to get user information. Please try logging out and logging in again.')
      return []
    }

    currentUserId.value = userId

    const managed = myTeams
      .filter(t => {
        const ownerId = t.ownerId || t.owner_id
        const ownerIdNum = typeof ownerId === 'string' ? parseInt(ownerId, 10) : ownerId
        return t.id && ownerIdNum === userId
      })
      .map(t => ({
        id: t.id!,
        name: t.name || `Team #${t.id}`,
        ownerId: t.ownerId || t.owner_id,
        owner_id: t.owner_id,
      }))

    managedTeams.value = managed
    return managed
  } catch (e) {
    console.error('Failed to fetch managed teams', e)
    ElMessage.error('Failed to load teams')
    return []
  }
}

const fetchApplications = async () => {
  loadingApplications.value = true
  try {
    const managed = await fetchManagedTeams()

    if (managed.length === 0) {
      ElMessage.info('You are not the owner of any teams')
      teamApplications.value = []
      return
    }

    // 对于每个管理的组织，获取待审核的加入申请
    const allApplications: TeamJoinApplication[] = []
    for (const team of managed) {
      if (!team.id) continue
      try {
        console.log(`Fetching applications for team ${team.id} (${team.name})`)
        const resp = await TeamApi.getTeamJoinApplications(team.id)
        console.log('Applications response:', resp.data)

        // 后端返回的是 TeamJoinApplyVO 数组，包含 id, user, applyTime, status
        const applications = (resp.data as { teamJoinApplyList?: Array<{
          id?: number
          user?: {
            id?: number
            username?: string
            name?: string
            email?: string
          }
          applyTime?: string
          status?: number
        }> }).teamJoinApplyList || []

        console.log(`Found ${applications.length} applications for team ${team.id}`)

        // 处理申请数据，提取所需字段
        const pendingApps: TeamJoinApplication[] = applications
          .filter(app => {
            // 只处理有 id 和 status 的申请，且 status = 0（待审核）
            return app.id !== undefined && app.status !== undefined && app.status === 0
          })
          .map(app => ({
            id: app.id!,
            teamId: team.id!,
            teamName: team.name || `Team #${team.id}`,
            applicantId: app.user?.id || 0,
            applicantName: app.user?.name || app.user?.username,
            applyTime: app.applyTime || '',
            status: app.status!,
          }))

        console.log(`Pending apps for team ${team.id}:`, pendingApps)
        allApplications.push(...pendingApps)
      } catch (e: unknown) {
        const err = e as { response?: { status?: number } }
        console.error(`Failed to load applications for team ${team.id}:`, err)
        // 403 表示用户不是该组织的管理员，跳过
        if (err?.response?.status !== 403) {
          ElMessage.error(`Failed to load applications for team ${team.name || team.id}`)
        }
      }
    }

    teamApplications.value = allApplications
  } catch (e) {
    console.error('Error fetching applications:', e)
    ElMessage.error('Failed to load applications')
  } finally {
    loadingApplications.value = false
  }
}

// 获取团队成员
const fetchTeamMembers = async (teamId: number) => {
  if (!teamId) return

  loadingMembers.value = true
  try {
    const resp = await TeamApi.getTeamMembers(teamId)
    const members = (resp.data as { teamMemberList?: Array<{
      id?: number
      user?: {
        id?: number
        username?: string
        name?: string
        email?: string
      }
      position?: string
    }> }).teamMemberList || []

    teamMembers.value = members.map(m => ({
      id: m.user?.id || m.id || 0,
      name: m.user?.name,
      username: m.user?.username,
      email: m.user?.email,
      position: m.position,
    }))
  } catch (e: unknown) {
    console.error('Failed to fetch team members', e)
    const err = e as { response?: { status?: number } }
    if (err?.response?.status !== 403) {
      ElMessage.error('Failed to load team members')
    }
  } finally {
    loadingMembers.value = false
  }
}

// 判断是否是团队创建者
const isTeamOwner = (member: TeamMember) => {
  if (!currentUserId.value || !selectedTeamId.value) return false
  const team = managedTeams.value.find(t => t.id === selectedTeamId.value)
  if (!team) return false
  const ownerId = team.ownerId || team.owner_id
  return ownerId === member.id
}

// 过滤成员
const filteredMembers = computed(() => {
  if (!memberSearchKeyword.value.trim()) {
    return teamMembers.value
  }
  const keyword = memberSearchKeyword.value.trim().toLowerCase()
  return teamMembers.value.filter(m => {
    const name = (m.name || '').toLowerCase()
    const username = (m.username || '').toLowerCase()
    const email = (m.email || '').toLowerCase()
    return name.includes(keyword) || username.includes(keyword) || email.includes(keyword)
  })
})

// 处理团队切换
const handleTeamChange = (teamId: number | null) => {
  if (teamId) {
    fetchTeamMembers(teamId)
  } else {
    teamMembers.value = []
  }
}

// 处理团队信息编辑的团队切换
const handleTeamInfoChange = async (teamId: number | null) => {
  if (teamId) {
    await fetchTeamInfo(teamId)
  } else {
    resetTeamInfoForm()
  }
}

// 获取团队信息
const fetchTeamInfo = async (teamId: number) => {
  loadingTeamInfo.value = true
  try {
    const resp = await TeamApi.getTeamInfo(teamId)
    const team = (resp.data as { team?: {
      id?: number
      name?: string
      logo?: string
      banner?: string
      description?: string
    } }).team

    if (team) {
      teamInfoForm.id = team.id || teamId
      teamInfoForm.name = team.name || ''
      teamInfoForm.logo = team.logo || ''
      teamInfoForm.banner = team.banner || ''
      teamInfoForm.description = team.description || ''
    }
  } catch (e: unknown) {
    console.error('Failed to fetch team info', e)
    const err = e as { response?: { status?: number } }
    if (err?.response?.status !== 403) {
      ElMessage.error('Failed to load team information')
    }
  } finally {
    loadingTeamInfo.value = false
  }
}

// 重置团队信息表单
const resetTeamInfoForm = () => {
  teamInfoForm.id = 0
  teamInfoForm.name = ''
  teamInfoForm.logo = ''
  teamInfoForm.banner = ''
  teamInfoForm.description = ''
}

// 处理 Logo 上传
const handleLogoChange = async (file: UploadFile) => {
  if (!file.raw) return

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.raw.size > maxSize) {
    ElMessage.error('Logo image size should not exceed 10MB')
    return
  }

  if (!file.raw.type.startsWith('image/')) {
    ElMessage.error('Please upload an image file')
    return
  }

  uploadingLogo.value = true
  try {
    const resp = await FileApi.uploadFile(file.raw)
    const url = (resp.data as { url?: string }).url
    if (url) {
      teamInfoForm.logo = url
      ElMessage.success('Logo uploaded successfully')
    } else {
      ElMessage.error('Failed to get logo URL')
    }
  } catch (e: unknown) {
    console.error('Upload error:', e)
    const err = e as { response?: { data?: { error?: string } }; message?: string }
    const errorMsg = err?.response?.data?.error || err?.message || 'Failed to upload logo'
    ElMessage.error(errorMsg)
  } finally {
    uploadingLogo.value = false
  }
}

// 处理 Banner 上传
const handleBannerChange = async (file: UploadFile) => {
  if (!file.raw) return

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.raw.size > maxSize) {
    ElMessage.error('Banner image size should not exceed 10MB')
    return
  }

  if (!file.raw.type.startsWith('image/')) {
    ElMessage.error('Please upload an image file')
    return
  }

  uploadingBanner.value = true
  try {
    const resp = await FileApi.uploadFile(file.raw)
    const url = (resp.data as { url?: string }).url
    if (url) {
      teamInfoForm.banner = url
      ElMessage.success('Banner uploaded successfully')
    } else {
      ElMessage.error('Failed to get banner URL')
    }
  } catch (e: unknown) {
    console.error('Upload error:', e)
    const err = e as { response?: { data?: { error?: string } }; message?: string }
    const errorMsg = err?.response?.data?.error || err?.message || 'Failed to upload banner'
    ElMessage.error(errorMsg)
  } finally {
    uploadingBanner.value = false
  }
}

// 处理图片错误
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

// 更新团队信息
const handleUpdateTeamInfo = async () => {
  if (!teamInfoForm.id) {
    ElMessage.warning('Please select a team first')
    return
  }

  updatingTeamInfo.value = true
  try {
    await TeamApi.updateTeamInfo({
      id: teamInfoForm.id,
      logo: teamInfoForm.logo || undefined,
      banner: teamInfoForm.banner || undefined,
      description: teamInfoForm.description || undefined,
    })
    ElMessage.success('Team information updated successfully')
    // 刷新团队列表
    await fetchManagedTeams()
  } catch (e: unknown) {
    console.error('Failed to update team info', e)
    ElMessage.error('Failed to update team information')
  } finally {
    updatingTeamInfo.value = false
  }
}

// 重置表单
const handleResetTeamInfo = async () => {
  if (selectedTeamIdForEdit.value) {
    await fetchTeamInfo(selectedTeamIdForEdit.value)
  } else {
    resetTeamInfoForm()
  }
}

// 移除成员
const handleRemoveMember = async (member: TeamMember) => {
  if (!selectedTeamId.value || !member.id) return

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to remove "${member.name || member.username || `User #${member.id}`}" from the team?`,
      'Remove Member',
      {
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    member.removing = true
    await TeamApi.removeTeamMember(selectedTeamId.value, member.id)
    ElMessage.success('Member removed successfully')
    await fetchTeamMembers(selectedTeamId.value)
  } catch (e: unknown) {
    if ((e as { action?: string }).action !== 'cancel') {
      console.error('Failed to remove member', e)
      ElMessage.error('Failed to remove member')
    }
  } finally {
    member.removing = false
  }
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return 'Unknown'
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timeStr
  }
}

const handleApprove = async (app: TeamJoinApplication) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve this join application?`,
      'Confirm Approval',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'success',
      }
    )

    app.approving = true
    await TeamApi.approveJoinTeam(app.id)
    ElMessage.success('Application approved successfully')
    // 移除已处理的申请
    teamApplications.value = teamApplications.value.filter(a => a.id !== app.id)
  } catch (err: unknown) {
    if ((err as { action?: string }).action !== 'cancel') {
      console.error(err)
      ElMessage.error('Failed to approve application')
    }
  } finally {
    app.approving = false
  }
}

const handleReject = async (app: TeamJoinApplication) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to reject this join application?`,
      'Confirm Rejection',
      {
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    app.rejecting = true
    await TeamApi.rejectJoinTeam(app.id)
    ElMessage.success('Application rejected')
    // 移除已处理的申请
    teamApplications.value = teamApplications.value.filter(a => a.id !== app.id)
  } catch (err: unknown) {
    if ((err as { action?: string }).action !== 'cancel') {
      console.error(err)
      ElMessage.error('Failed to reject application')
    }
  } finally {
    app.rejecting = false
  }
}

onMounted(async () => {
  await fetchManagedTeams()
  if (activeTab.value === 'applications') {
    await fetchApplications()
  }
})
</script>

<style scoped>
.team-admin-page {
  background: radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 26%),
    radial-gradient(circle at 100% 100%, #e5e7ff 0, transparent 28%),
    linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%);
}

.team-admin-tabs :deep(.el-tabs__content) {
  padding-top: 1rem;
  padding-right: 3em;
  box-sizing: border-box;
  padding-bottom: 3em;
}
</style>

