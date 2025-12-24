<template>
  <div class="w-full flex rounded-md items-center justify-between shadow-md h-21em flex-col hover:shadow-[#c3daef] transition-all duration-300">
    <div class="h-55% w-full">
      <img :src="org.banner" alt="" class="w-full h-full object-fill rounded-md">
    </div>
    <div class="flex items-center p-1.5em box-border pos-relative w-full h-60%">
      <div class="w-4em h-4em rounded-xl overflow-hidden flex items-center justify-center
              mr-0.5em pos-absolute top-[-2em] left-3em b-2px b-solid b-black/10 bg-white">
        <img v-if="org.logo" :src="org.logo" :alt="org.name" class="w-full h-full object-contain" />
        <span v-else class="text-lg font-semibold text-[#4b5563]">
          {{ org.name }}
        </span>
      </div>
      <div class="w-full h-full">
        <div class="h-1em"></div>
        <h2 class="text-base font-semibold text-[#111827] mb-1">
          {{ org.name }}
        </h2>
        <p class="text-xs text-[#6b7280] max-w-60">
          {{ org.description || 'No description yet.' }}
        </p>
      </div>
      <div>
        <el-button
          type="primary"
          size="small"
          :loading="joining"
          :disabled="isJoined"
          @click="handleJoin"
        >
          {{ isJoined ? 'Joined' : 'Join' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { TeamApi } from '@/api'

interface Org {
  id?: number
  name: string
  description?: string
  logo?: string
  banner?: string
}

const props = defineProps<{
  org: Org
  isJoined?: boolean
}>()

const org = props.org
const joining = ref(false)
const isJoined = ref(props.isJoined || false)
onMounted(() => {
  console.log('org', org)
})

watch(() => props.isJoined, (newVal) => {
  isJoined.value = newVal || false
})

const emit = defineEmits<{
  joined: [teamId: number]
}>()

const handleJoin = async () => {
  if (!org.id) {
    ElMessage.warning('Organization ID is missing')
    return
  }

  if (isJoined.value) {
    return
  }

  joining.value = true
  try {
    await TeamApi.applyJoinTeam(org.id)
    ElMessage.success('Join request submitted successfully')
    isJoined.value = true
    emit('joined', org.id)
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to submit join request')
  } finally {
    joining.value = false
  }
}
</script>

<style scoped></style>
