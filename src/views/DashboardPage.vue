<template>
  <div class="w-full h-full">
    <transition name="el-fade-in-linear">
      <div v-show="show">
        DashBoard
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const show = ref(false);
onMounted(() => {
  show.value = true;
});
</script>

<style scoped></style>
