<template>
  <div class="w-full h-full">
    <transition name="el-fade-in-linear">
      <div v-show="show" class="w-full flex flex-col">
        <div class="w-full h-22em banner">
          <div class="m-2em flex items-center h-15em">
            <div>
              <h1 class="text-3em m-b-0.5em text-white">JOIN YOUR ORGANIZATION!</h1>
              <h3 class="text-slate-200">Various organizations are waiting for you</h3>
            </div>
          </div>
          <div class="h-3em w-full flex items-center justify-center">
            <div class="w-full flex justify-center items-center m-b-4em">
              <el-input
                v-model="searchKeyword"
                style="width: 50%; height: 4em;"
                placeholder="enter your organization name"
              >

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
        <div class="flex items-center justify-between m-1em">
          <h3 class="text-slate-800">Popular Organizations</h3>
          <el-button
            type="primary"
            size="small"
            class="create-org-btn"
            @click="openCreateDialog"
          >
            <span class="i-ep-plus mr-1" />
            New Organization
          </el-button>
        </div>
        <div class="w-full flex justify-around flex-wrap">
          <div v-for="org in orgs" :key="org.id || org.name" class="w-30% m-b-1.5em">
            <OrgCard
              :org="org"
              :is-joined="joinedTeamIds.has(org.id!)"
              @joined="handleOrgJoined"
            ></OrgCard>
          </div>
        </div>
        <el-dialog
          v-model="createVisible"
          title="Create Organization"
          width="480px"
        >
          <el-form
            :model="createForm"
            :rules="createRules"
            ref="createFormRef"
            label-width="90px"
          >
            <el-form-item label="Name" prop="name">
              <el-input v-model="createForm.name" placeholder="Organization name" />
            </el-form-item>
            <el-form-item label="Logo URL" prop="logo">
              <el-input v-model="createForm.logo" placeholder="Logo image URL" />
            </el-form-item>
            <el-form-item label="Banner URL" prop="banner">
              <el-input v-model="createForm.banner" placeholder="Banner image URL" />
            </el-form-item>
            <el-form-item label="Description" prop="description">
              <el-input
                v-model="createForm.description"
                type="textarea"
                :rows="3"
                placeholder="Short description"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="createVisible = false">Cancel</el-button>
              <el-button type="primary" :loading="createLoading" @click="submitCreate">
                Submit
              </el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import OrgCard from '@/components/OrgCard.vue';
import { onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import { TeamApi } from '@/api'

interface Org {
  id?: number
  name: string
  description?: string
  logo?: string
  banner?: string
}

const show = ref(false);
const orgs = ref<Org[]>([])
const searchKeyword = ref('')
const loadingOrgs = ref(false)
const joinedTeamIds = ref<Set<number>>(new Set())

const fetchOrganizations = async (keyword?: string) => {
  loadingOrgs.value = true
  try {
    const resp = await TeamApi.getTeamList(1)
    const list = (resp.data as { teamList?: (Org & { id?: number })[] }).teamList || []
    let mapped: Org[] = list.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      logo: t.logo,
      banner: t.banner,
    }))
    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      mapped = mapped.filter(o => o.name?.toLowerCase().includes(kw))
    }
    orgs.value = mapped
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to load organizations')
  } finally {
    loadingOrgs.value = false
  }
}

const fetchJoinedTeams = async () => {
  try {
    const resp = await TeamApi.getMyTeams()
    const list = (resp.data as { teamList?: Org[] }).teamList || []
    joinedTeamIds.value = new Set(list.filter(t => t.id).map(t => t.id!))
  } catch (e) {
    console.error('Failed to load joined teams', e)
  }
}

onMounted(() => {
  show.value = true
  fetchOrganizations()
  fetchJoinedTeams()
});

const handleSearch = () => {
  fetchOrganizations(searchKeyword.value)
}

const handleOrgJoined = (teamId: number) => {
  joinedTeamIds.value.add(teamId)
}

const createVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref()

const createForm = reactive({
  name: '',
  banner: '',
  logo: '',
  description: '',
})

const createRules = {
  name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
}

const openCreateDialog = () => {
  createVisible.value = true
}

const submitCreate = () => {
  if (!createFormRef.value) return
  createLoading.value = true
  createFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      createLoading.value = false
      return
    }
    TeamApi.applyCreateTeam({
      name: createForm.name,
      banner: createForm.banner || undefined,
      logo: createForm.logo || undefined,
      description: createForm.description || undefined,
    })
      .then(() => {
        ElMessage.success('Create request submitted, waiting for approval')
        createVisible.value = false
        fetchOrganizations(searchKeyword.value)
      })
      .catch((err: unknown) => {
        console.error(err)
        ElMessage.error('Create failed')
      })
      .finally(() => {
        createLoading.value = false
      })
  })
}
</script>

<style scoped>
.banner{
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(135deg, #0f172a 0%, #111827 12%, #1e293b 35%, #1d4ed8 70%, #60a5fa 100%);
  background-size: 160% 160%;
  animation: org-banner-flow 22s ease-in-out infinite;
  color: #e5e7eb;
}

.banner > * {
  position: relative;
  z-index: 1;
}

.banner::before,
.banner::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.7;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.95), transparent 55%);
  animation: org-bubble 18s ease-in-out infinite;
}

.banner::before {
  width: 170px;
  height: 170px;
  top: -30px;
  left: -40px;
}

.banner::after {
  width: 260px;
  height: 260px;
  bottom: -60px;
  right: -40px;
  animation-delay: 5s;
}

@keyframes org-banner-flow {
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

@keyframes org-bubble {
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

.create-org-btn {
  border-radius: 999px;
  background-image: linear-gradient(120deg, #4f46e5 0%, #6366f1 40%, #0ea5e9 100%);
  border: none;
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.35);
}

.create-org-btn:hover {
  filter: brightness(1.05);
}
</style>
