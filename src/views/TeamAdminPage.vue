<template>
  <div class="w-full h-full overflow-hidden team-admin-page">
    <div class="w-full h-full overflow-y-auto p-6">
      <div class="mb-6 flex-shrink-0">
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Team Applications</h1>
        <p class="text-sm text-slate-500">Manage join applications for your teams</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <el-icon class="is-loading" :size="32">
          <Loading />
        </el-icon>
        <p class="text-slate-400 mt-4">Loading applications...</p>
      </div>

      <div v-else-if="teamApplications.length === 0" class="text-center py-12">
        <p class="text-slate-400 mb-2">No applications to review</p>
        <p class="text-xs text-slate-400">Check the browser console for debugging information</p>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { TeamApi } from '@/api'

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

const loading = ref(false)
const teamApplications = ref<TeamJoinApplication[]>([])

const fetchApplications = async () => {
  loading.value = true
  try {
    // 获取用户已加入的组织（包括管理的）
    const myTeamsResp = await TeamApi.getMyTeams()
    // 后端可能返回 ownerId 或 owner_id
    const myTeams = (myTeamsResp.data as { teamList?: Array<{
      id?: number
      name?: string
      ownerId?: number
      owner_id?: number
    }> }).teamList || []

    console.log('My teams:', myTeams)

    // 获取当前用户ID（从localStorage获取）
    const userStr = localStorage.getItem('auth_user')
    let currentUserId: number | null = null
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as { id?: number | string; userId?: number | string; user_id?: number | string }
        console.log('User info:', user)
        // 尝试多种可能的字段名和类型
        const id = user.id || user.userId || user.user_id
        if (id !== undefined && id !== null) {
          currentUserId = typeof id === 'string' ? parseInt(id, 10) : id
          if (isNaN(currentUserId!)) {
            currentUserId = null
          }
        }
      } catch (e) {
        console.error('Failed to parse user info', e)
      }
    }

    console.log('Current user ID:', currentUserId, 'Type:', typeof currentUserId)

    if (!currentUserId) {
      ElMessage.warning('Unable to get user information. Please try logging out and logging in again.')
      console.error('User ID is null. User string:', userStr)
      return
    }

    // 获取用户管理的组织（ownerId 或 owner_id = currentUserId）
    const managedTeams = myTeams.filter(t => {
      const ownerId = t.ownerId || t.owner_id
      // 确保类型一致进行比较
      const ownerIdNum = typeof ownerId === 'string' ? parseInt(ownerId, 10) : ownerId
      const match = t.id && ownerIdNum === currentUserId
      console.log(`Team ${t.id} (${t.name}): ownerId=${ownerId} (${typeof ownerId}), currentUserId=${currentUserId} (${typeof currentUserId}), match=${match}`)
      return match
    })

    console.log('Managed teams count:', managedTeams.length)
    console.log('Managed teams:', managedTeams)

    if (managedTeams.length === 0) {
      console.log('No managed teams found. All teams:', myTeams.map(t => ({
        id: t.id,
        name: t.name,
        ownerId: t.ownerId,
        owner_id: t.owner_id
      })))
      ElMessage.info('You are not the owner of any teams')
      teamApplications.value = []
      return
    }

    // 对于每个管理的组织，获取待审核的加入申请
    const allApplications: TeamJoinApplication[] = []
    for (const team of managedTeams) {
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

    console.log('All applications:', allApplications)
    teamApplications.value = allApplications
  } catch (e) {
    console.error('Error fetching applications:', e)
    ElMessage.error('Failed to load applications')
  } finally {
    loading.value = false
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

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.team-admin-page {
  background: radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 26%),
    radial-gradient(circle at 100% 100%, #e5e7ff 0, transparent 28%),
    linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%);
}
</style>

