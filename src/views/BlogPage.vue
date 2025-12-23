<template>
  <div class="flex w-full h-[calc(100vh-4em)] blog-layout overflow-hidden">
    <div class="h-full flex-1 bg-white text-slate-900 overflow-y-auto px-4 py-3 box-border space-y-4">
      <div class="flex items-center justify-between mb-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Organization</p>
          <h2 class="text-lg font-semibold text-slate-800">{{ orgName }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Latest announcements</span>
          <el-button
            type="primary"
            size="small"
            class="new-post-btn"
            @click="openPostDialog"
            :disabled="!currentTeamId"
          >
            <el-icon class="mr-1"><Plus /></el-icon>
            New Post
          </el-button>
        </div>
      </div>
      <div v-if="loading" class="text-center py-8 text-slate-400">Loading...</div>
      <div v-else-if="tweets.length === 0" class="text-center py-8 text-slate-400">No tweets yet</div>
      <BlogCard
        v-for="tweet in tweets"
        :key="tweet.id"
        :tweet="tweet"
        :current-user-id="currentUserId"
        :is-team-owner="isTeamOwner"
        :is-admin="isAdmin"
        @deleted="handleTweetDeleted"
      />
    </div>
    <div class="h-full w-33% b-l-1.5px b-t-0 b-r-0 b-b-0 b-solid b-gray-200 px-4 py-3 box-border overflow-y-auto rightbar bg-white/90">
      <div class="mb-4">
        <h2 class="text-base font-semibold text-slate-800 mb-1">{{ orgName }}</h2>
        <p class="text-xs text-slate-400">Overview & members</p>
      </div>
      <div class="mb-4">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Active Members</h3>
        <div class="flex flex-wrap gap-2">
          <img
            v-for="member in members.slice(0, 15)"
            :key="member.id"
            :src="getMemberAvatar(member)"
            :alt="member.name || 'Member'"
            class="h-3em w-3em rounded-full object-cover border border-white shadow-sm"
            @error="handleAvatarError"
          >
        </div>
      </div>
      <div class="h-full w-full">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Recommend For You</h3>
        <div class="w-full rounded-lg bg-slate-50 border border-slate-200 p-2 mb-3">
          <KnowledgeGraph :nodes="graphNodes" :links="graphLinks" />
        </div>
        <div class="w-full space-y-2">
          <OrgCard v-for="(item,idx) in orgs" :key="idx" :org="item" />
        </div>
      </div>
    </div>

    <!-- Post Dialog -->
    <el-dialog
      v-model="postDialogVisible"
      title="Create New Post"
      width="600px"
    >
      <el-form
        :model="postForm"
        :rules="postRules"
        ref="postFormRef"
        label-width="80px"
      >
        <el-form-item label="Title" prop="title">
          <el-input
            v-model="postForm.title"
            placeholder="Enter post title"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="6"
            placeholder="Write your post content..."
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="Images">
          <div class="space-y-3">
            <div
              v-for="(image, index) in postForm.images"
              :key="index"
              class="flex items-start gap-2"
            >
              <div class="flex-1">
                <el-upload
                  :action="''"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="(file: UploadFile) => handleImageChange(file, index)"
                  accept="image/*"
                  class="w-full"
                >
                  <template #trigger>
                    <el-button type="primary" size="small" plain>
                      <el-icon class="mr-1"><Upload /></el-icon>
                      {{ image ? 'Change Image' : 'Upload Image' }}
                    </el-button>
                  </template>
                </el-upload>
                <div v-if="image" class="mt-2">
                  <img
                    :src="image"
                    alt="Preview"
                    class="max-w-full h-32 object-cover rounded-lg border border-slate-200"
                    @error="handleImageError"
                  />
                  <div class="mt-1 text-xs text-slate-500 truncate">{{ image }}</div>
                </div>
              </div>
              <el-button
                type="danger"
                size="small"
                @click="removeImage(index)"
                :disabled="postForm.images.length <= 1 && !postForm.images[0]"
              >
                Remove
              </el-button>
            </div>
            <el-button
              type="primary"
              size="small"
              plain
              @click="addImage"
            >
              <el-icon class="mr-1"><Plus /></el-icon>
              Add Image
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="postDialogVisible = false">Cancel</el-button>
          <el-button type="primary" :loading="posting" @click="handleSubmitPost">
            Publish
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref, onMounted, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import BlogCard from '@/components/BlogCard.vue';
import OrgCard from '@/components/OrgCard.vue';
import KnowledgeGraph from '@/components/KnowledgeGraph.vue';
import { TeamApi, TweetApi, FileApi } from '@/api'
import type { UploadFile } from 'element-plus'

const route = useRoute()
const orgName = computed(() => route.params.org ?? 'unknown')

interface Org {
  id?: number
  name: string
  description?: string
  logo?: string
  banner?: string
  ownerId?: number
  owner_id?: number
}

interface Tweet {
  id: number | string // 支持大数字 ID
  teamId: number
  senderId: number
  title: string
  content: string
  images: string[]
  createTime: string
}

interface TeamMember {
  id?: number
  memberId?: number
  teamId?: number
  position?: string
  joinTime?: string
  user?: {
    id?: number
    username?: string
    name?: string
    avatar?: string
    email?: string
  }
  avatar?: string
  name?: string
}

const orgs = ref<Org[]>([])
const tweets = ref<Tweet[]>([])
const members = ref<TeamMember[]>([])
const loading = ref(false)
const currentTeamId = ref<number | null>(null)
const currentTeam = ref<Org | null>(null)

// 获取当前用户信息
const getUserInfo = () => {
  const userStr = localStorage.getItem('auth_user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as {
      id?: number
      admin?: number
    }
  } catch (e) {
    console.error('Failed to parse user info', e)
    return null
  }
}

const userInfo = computed(() => getUserInfo())
const currentUserId = computed(() => userInfo.value?.id)
const isAdmin = computed(() => userInfo.value?.admin === 1)
const isTeamOwner = computed(() => {
  if (!currentUserId.value || !currentTeam.value) return false
  const ownerId = currentTeam.value.ownerId || (currentTeam.value as unknown as { owner_id?: number }).owner_id
  return ownerId === currentUserId.value
})

const postDialogVisible = ref(false)
const posting = ref(false)
const postFormRef = ref()

const postForm = reactive({
  title: '',
  content: '',
  images: [''],
})

const uploadingImages = ref<boolean[]>([])

const postRules = {
  title: [
    { required: true, message: 'Please input title', trigger: 'blur' },
    { max: 100, message: 'Title should not exceed 100 characters', trigger: 'blur' }
  ],
  content: [
    { required: true, message: 'Please input content', trigger: 'blur' },
    { max: 1000, message: 'Content should not exceed 1000 characters', trigger: 'blur' }
  ],
}

const fetchTeamInfo = async () => {
  if (!orgName.value || orgName.value === 'unknown') return

  loading.value = true
  try {
    const teamListResp = await TeamApi.getTeamList(1)
    const teamList = (teamListResp.data as { teamList?: Org[] }).teamList || []
    const foundTeam = teamList.find(t => t.name === orgName.value)

    if (!foundTeam || !foundTeam.id) {
      ElMessage.warning('Organization not found')
      return
    }

    currentTeamId.value = foundTeam.id
    currentTeam.value = foundTeam

    // 获取推文列表
    try {
      const tweetResp = await TweetApi.searchTweet(undefined, currentTeam.value.id)
      const tweetList = (tweetResp.data as { tweetList?: Tweet[] }).tweetList || []
      // 确保 id 是字符串，避免大数字精度丢失
      tweets.value = tweetList.map(tweet => ({
        ...tweet,
        id: String(tweet.id) // 转换为字符串
      }))
    } catch (e) {
      console.error('Failed to load tweets', e)
      tweets.value = []
    }

    // 获取团队成员（如果用户不是成员会返回 403，这是正常的）
    if (currentTeam.value?.id) {
      try {
        const membersResp = await TeamApi.getTeamMembers(currentTeam.value.id)
        const memberList = (membersResp.data as { teamMemberList?: TeamMember[] }).teamMemberList || []
        // 后端返回的是 TeamMemberVO，包含 user 对象，需要提取用户信息
        members.value = memberList.map((member, index) => ({
          id: member.id || member.user?.id || index,
          memberId: member.memberId || member.user?.id,
          teamId: currentTeam.value!.id,
          position: member.position || '',
          joinTime: member.joinTime,
          avatar: member.avatar || member.user?.avatar,
          name: member.name || member.user?.name || member.user?.username,
        }))
      } catch (e: unknown) {
        // 403 表示用户不是团队成员，这是正常的，不显示错误
        const err = e as { response?: { status?: number } }
        if (err?.response?.status !== 403) {
          console.error('Failed to load members', e)
        }
        members.value = []
      }
    }

    // 获取推荐组织（排除当前组织）
    if (currentTeam.value?.id) {
      orgs.value = teamList.filter(t => t.id !== currentTeam.value!.id).slice(0, 2)
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to load data')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTeamInfo()
})

watch(orgName, () => {
  fetchTeamInfo()
})

const getMemberAvatar = (member: TeamMember) => {
  if (member.avatar) return member.avatar
  const name = member.name || member.user?.name || member.user?.username || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
}

const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  const name = img.alt || 'User'
  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
}

const handleTweetDeleted = (tweetId: number | string) => {
  // 从列表中移除已删除的推文
  tweets.value = tweets.value.filter(t => String(t.id) !== String(tweetId))
}

const openPostDialog = () => {
  if (!currentTeamId.value) {
    ElMessage.warning('Please select an organization first')
    return
  }
  postForm.title = ''
  postForm.content = ''
  postForm.images = ['']
  uploadingImages.value = [false]
  postDialogVisible.value = true
}

const addImage = () => {
  postForm.images.push('')
  uploadingImages.value.push(false)
}

const removeImage = (index: number) => {
  if (postForm.images.length > 1 || postForm.images[index]) {
    postForm.images.splice(index, 1)
    uploadingImages.value.splice(index, 1)
  }
}

const handleImageChange = async (file: UploadFile, index: number) => {
  if (!file.raw) return

  // 检查文件大小（限制为 10MB）
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.raw.size > maxSize) {
    ElMessage.error('Image size should not exceed 10MB')
    return
  }

  // 检查文件类型
  if (!file.raw.type.startsWith('image/')) {
    ElMessage.error('Please upload an image file')
    return
  }

  uploadingImages.value[index] = true
  try {
    const resp = await FileApi.uploadFile(file.raw)
    const url = (resp.data as { url?: string }).url
    if (url) {
      postForm.images[index] = url
      ElMessage.success('Image uploaded successfully')
    } else {
      ElMessage.error('Failed to get image URL')
    }
  } catch (e: unknown) {
    console.error('Upload error:', e)
    const err = e as { response?: { data?: { error?: string } }; message?: string }
    const errorMsg = err?.response?.data?.error || err?.message || 'Failed to upload image'
    ElMessage.error(errorMsg)
  } finally {
    uploadingImages.value[index] = false
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

const handleSubmitPost = async () => {
  if (!postFormRef.value || !currentTeamId.value) return

  posting.value = true
  postFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      posting.value = false
      return
    }

    try {
      // 过滤掉空的图片URL
      const images = postForm.images.filter(img => img && img.trim())

      await TweetApi.sendTweet({
        teamId: currentTeamId.value!,
        title: postForm.title,
        content: postForm.content,
        images: images,
      })

      ElMessage.success('Post published successfully')
      postDialogVisible.value = false

      // 重置表单
      postForm.title = ''
      postForm.content = ''
      postForm.images = ['']
      uploadingImages.value = [false]

      // 刷新推文列表 - 重新获取最新数据
      if (currentTeamId.value) {
        try {
          const tweetResp = await TweetApi.searchTweet(undefined, currentTeamId.value)
          const newTweets = (tweetResp.data as { tweetList?: Tweet[] }).tweetList || []
          // 将新推文插入到列表最前面
          tweets.value = newTweets
        } catch (e) {
          console.error('Failed to refresh tweets', e)
          // 即使刷新失败，也重新加载整个团队信息
          await fetchTeamInfo()
        }
      }
    } catch (e) {
      console.error(e)
      ElMessage.error('Failed to publish post')
    } finally {
      posting.value = false
    }
  })
}

const graphNodes = computed(() => {
  const centerName = typeof orgName.value === 'string' ? orgName.value : 'Org'
  const centerId = `org:${centerName}`
  const baseNodes = [
    { id: centerId, name: centerName, category: 'Org', symbolSize: 42 },
    { id: 'members', name: 'Members', category: 'Entity' },
    { id: 'projects', name: 'Projects', category: 'Entity' },
    { id: 'roles', name: 'Roles', category: 'Entity' },
    { id: 'docs', name: 'Docs', category: 'Entity' },
  ]
  const orgNodes = orgs.value.map((o) => ({
    id: `org:${o.name}`,
    name: o.name,
    category: 'Related Org',
  }))
  return [...baseNodes, ...orgNodes]
})

const graphLinks = computed(() => {
  const centerName = typeof orgName.value === 'string' ? orgName.value : 'Org'
  const centerId = `org:${centerName}`
  const baseLinks = [
    { source: centerId, target: 'members', label: 'has' },
    { source: centerId, target: 'projects', label: 'owns' },
    { source: centerId, target: 'roles', label: 'defines' },
    { source: centerId, target: 'docs', label: 'references' },
  ]
  const orgLinks = orgs.value.map((o) => ({
    source: centerId,
    target: `org:${o.name}`,
    label: 'related',
  }))
  return [...baseLinks, ...orgLinks]
})
</script>

<style scoped>
.blog-layout {
  background: radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 28%),
    radial-gradient(circle at 100% 100%, #e5e7ff 0, transparent 30%);
}

.rightbar::-webkit-scrollbar{
  display: none;
}

.rightbar{
  scrollbar-width: none;
}

.new-post-btn {
  border-radius: 999px;
  background-image: linear-gradient(120deg, #4f46e5 0%, #6366f1 40%, #0ea5e9 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.3s ease;
}

.new-post-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.new-post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
