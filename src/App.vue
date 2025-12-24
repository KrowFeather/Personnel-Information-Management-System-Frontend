<template>
  <div class="app-wrapper">
    <router-view></router-view>
    <AgentInvoker v-model="showAgent" />
  </div>
</template>

<script setup lang="ts">
import { useAgent } from '@/composables/useAgent'
import AgentInvoker from '@/components/AgentInvoker.vue'

const { showAgent } = useAgent()
</script>

<style scoped>
.app-wrapper {
  height: 100%;
  overflow: hidden;
}
</style>
