<template>
  <div class="w-full h-full z-[10]">
    <transition name="el-fade-in-linear">
      <div v-show="show">
        <div class="w-full h-full flex overflow-y-hidden">
          <div class="w-20% h-[calc(100vh-4em)] b-r-1px b-t-0 b-l-0 b-b-0 b-solid b-black/10">
            <el-menu class="sci-menu" :default-active="1">
              <el-menu-item index="1">
                <el-icon><icon-name /></el-icon>
                <template #title>Dashboard</template>
              </el-menu-item>
              <el-menu-item index="2">
                <el-icon><icon-name /></el-icon>
                <template #title>Organization</template>
              </el-menu-item>
            </el-menu>
          </div>
          <div class="h-[calc(100vh-4em)] flex-1 bg-white text-black overflow-auto inner">
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
            <h1>123</h1>
          </div>
        </div>
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

<style scoped>
</style>
