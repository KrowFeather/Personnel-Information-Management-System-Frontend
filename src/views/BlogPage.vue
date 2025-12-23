<template>
  <div class="flex w-full h-[calc(100vh-4em)] blog-layout overflow-hidden">
    <div class="h-full flex-1 bg-white text-slate-900 overflow-y-auto px-4 py-3 box-border space-y-4">
      <div class="flex items-center justify-between mb-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Organization</p>
          <h2 class="text-lg font-semibold text-slate-800">{{ orgName }}</h2>
        </div>
        <span class="text-xs text-slate-400">Latest announcements</span>
      </div>
      <div v-if="loading" class="text-center py-8 text-slate-400">Loading...</div>
      <div v-else-if="tweets.length === 0" class="text-center py-8 text-slate-400">No tweets yet</div>
      <BlogCard v-for="tweet in tweets" :key="tweet.id" :tweet="tweet" />
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
            :src="member.avatar || 'https://picsum.photos/200/300'"
            :alt="member.name || 'Member'"
            class="h-3em w-3em rounded-full object-cover border border-white shadow-sm"
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
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import BlogCard from '@/components/BlogCard.vue';
import OrgCard from '@/components/OrgCard.vue';
import KnowledgeGraph from '@/components/KnowledgeGraph.vue';
import { TeamApi, TweetApi } from '@/api'

const route = useRoute()
const orgName = computed(() => route.params.org ?? 'unknown')
const currentTeamId = ref<number | null>(null)

interface Org {
  id?: number
  name: string
  description?: string
  logo?: string
  banner?: string
}

interface Tweet {
  id: number
  teamId: number
  senderId: number
  title: string
  content: string
  images: string[]
  createTime: string
}

interface TeamMember {
  id: number
  memberId: number
  teamId: number
  position: string
  avatar?: string
  name?: string
}

const orgs = ref<Org[]>([])
const tweets = ref<Tweet[]>([])
const members = ref<TeamMember[]>([])
const loading = ref(false)

const fetchTeamInfo = async () => {
  if (!orgName.value || orgName.value === 'unknown') return
  
  loading.value = true
  try {
    const teamListResp = await TeamApi.getTeamList(1)
    const teamList = (teamListResp.data as { teamList?: Org[] }).teamList || []
    const currentTeam = teamList.find(t => t.name === orgName.value)
    
    if (!currentTeam || !currentTeam.id) {
      ElMessage.warning('Organization not found')
      return
    }
    
    currentTeamId.value = currentTeam.id
    
    // 获取推文列表
    try {
      const tweetResp = await TweetApi.searchTweet(undefined, currentTeam.id)
      tweets.value = (tweetResp.data as { tweetList?: Tweet[] }).tweetList || []
    } catch (e) {
      console.error('Failed to load tweets', e)
      tweets.value = []
    }
    
    // 获取团队成员（如果用户不是成员会返回 403，这是正常的）
    try {
      const membersResp = await TeamApi.getTeamMembers(currentTeam.id)
      members.value = (membersResp.data as { teamMemberList?: TeamMember[] }).teamMemberList || []
    } catch (e: unknown) {
      // 403 表示用户不是团队成员，这是正常的，不显示错误
      const err = e as { response?: { status?: number } }
      if (err?.response?.status !== 403) {
        console.error('Failed to load members', e)
      }
      members.value = []
    }
    
    // 获取推荐组织（排除当前组织）
    orgs.value = teamList.filter(t => t.id !== currentTeam.id).slice(0, 2)
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
</style>
