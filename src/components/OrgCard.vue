<template>
  <div class="w-full flex rounded-md items-center justify-between shadow-md">
    <div class="flex items-center p-1.5em box-border">
      <div class="w-6em h-6em rounded-xl overflow-hidden flex items-center justify-center
              mr-0.5em">
        <img v-if="org.logo" :src="org.logo" :alt="org.name" class="w-full h-full object-contain" />
        <span v-else class="text-lg font-semibold text-[#4b5563]">
          {{ org.name[0] }}
        </span>
      </div>
      <div>
        <h2 class="text-base font-semibold text-[#111827] mb-1">
          {{ org.name }}
        </h2>
        <p class="text-xs text-[#6b7280] truncate max-w-60">
          {{ org.description || 'No description yet.' }}
        </p>
      </div>
    </div>

    <div>
      <el-button type="primary" size="small" class="rounded-full px-4 mr-1em">
        Join
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Org {
  name: string
  description?: string
  logo?: string
}

const props = defineProps<{
  org: Org
}>()

const org = props.org
</script>

<style scoped></style>
