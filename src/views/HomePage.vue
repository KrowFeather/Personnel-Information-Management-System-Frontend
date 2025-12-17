<template>
  <div class="w-full h-full">
    <div class="h-4em w-full flex items-center bg-[#F9FAFB] shadow-md z-100 fixed top-0">
      <div class="flex justify-between items-center h-full w-full nav">
        <h1 class="text-2xl font-bold m-l-1em text-black">
          Fake Discord
        </h1>
        <div class="w-30% flex justify-end items-center m-r-1em">
          <el-dropdown>
            <span class="el-dropdown-link">
              <img src="../assets/wallhaven-83we8o.jpg" alt="avatar" class="w-3em h-3em rounded-full mr-1em" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>User Settings</el-dropdown-item>
                <el-dropdown-item>Log out</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <div class="flex h-[calc(100vh-4em)] overflow-hidden relative m-t-4em">
      <div class="w-13% h-full shadow-[3px_3px_5px_rgba(0,0,0,0.1)]">
        <el-menu default-active="1" class="h-100% sci-menu" @open="handleOpen" @close="handleClose">
          <el-menu-item index="1" @click="toDashBoard()">
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>DashBoard</span>
          </el-menu-item>
          <el-menu-item index="2" @click="toOrganizationPage()">
            <el-icon>
              <Compass />
            </el-icon>
            <span>Organizations</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon>
              <Setting />
            </el-icon>
            <span>User Setting</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="flex-1 h-full overflow-y-auto b-1px b-solid b-gray-400 rounded-3px">
        <router-view></router-view>
      </div>
      <div class="absolute right-5 bottom-5 w-4em h-4em">
        <el-button type="primary" circle style="width: 4em; height: 4em;" @click="showAgent = true">
          <h3 class="text-center">AI+</h3>
        </el-button>
      </div>
    </div>
    <AgentInvoker v-model="showAgent" />
  </div>
</template>

<script setup lang="ts">
import { Menu as IconMenu, Compass, Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import AgentInvoker from '@/components/AgentInvoker.vue'
const router = useRouter()

const showAgent = ref(false)

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const toDashBoard = () => {
  router.push('/home/dashboard')
}

const toOrganizationPage = () => {
  router.push('/home/organization')
}

onMounted(() => {
  router.push('/home/dashboard')
})
</script>

<style scoped>
@keyframes glow-pulse {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(0, 217, 255, 0.5),
      0 0 10px rgba(0, 217, 255, 0.3);
  }

  50% {
    box-shadow: 0 0 5px rgba(0, 217, 255, 0.8),
      0 0 5px rgba(0, 217, 255, 0.5),
      0 0 10px rgba(0, 217, 255, 0.3);
  }
}

.sci-menu :deep(.el-menu-item.is-active) {
  /* animation: glow-pulse 2s ease-in-out infinite; */
  background-color: #E0E7FF;
  /* background-image: linear-gradient(-225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%); */
  color: #1c47e2;
}

.sci-menu {
  /* background-image: linear-gradient(to right bottom, #e8edff, #efefff, #f6f1ff, #fbf4ff, #fff7ff); */
  /* background-image: linear-gradient(to right, #cbd6ff, #deddfe, #ede4fd, #f8edfd, #fff7ff) !important; */
  border-right: none;
}

.nav {
  /* background-image: linear-gradient(225deg, #22E1FF 0%, #1D8FE1 48%, #2e23fa 100%); */
  background-image: linear-gradient(to top left, white,white, #ddffff);
  /* background-color: #fcfcff; */

}
</style>
