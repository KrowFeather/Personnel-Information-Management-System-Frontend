<template>
  <div class="flex">
    <div class="h-[calc(100vh-4em)] flex-1 bg-white text-black overflow-auto inner">
      {{ orgName }}
    </div>
    <div class="w-33% b-l-1.5px b-t-0 b-r-0 b-b-0 b-solid b-gray-300">
      <div class="p-1em">
         <h2>{{ orgName }}</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const orgName = computed(() => route.params.org ?? 'unknown')
</script>

<style scoped></style>
