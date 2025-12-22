<template>
  <div class="w-full h-full z-[10]">
    <transition name="el-fade-in-linear">
      <div v-show="show">
        <div class="w-full h-full flex overflow-y-hidden flex-col">
          <div class="h-20em w-100% flex items-center surface">
            <div class="h-full w-full flex items-center m-l-3em">
              <img src="../assets/wallhaven-83we8o.jpg" alt="" class="h-8em w-8em rounded-1em">
              <div class="m-l-2em">
                <div class="text-white text-1.5em">
                  <!-- {{user.name}} -->
                  jiajun tang
                </div>
                <div class="text-white text-1em">
                  <!-- {{user.email}} -->
                  shhutu@gmail.com
                </div>
              </div>
            </div>
          </div>
          <div class="p-l-1em p-r-1em box-border">
            <el-tabs v-model="activeName">
              <el-tab-pane label="Joined" name="first">
                <OrgCard :org="org"></OrgCard>
              </el-tab-pane>
              <el-tab-pane label="Created" name="second">Created</el-tab-pane>
              <el-tab-pane label="Settings" name="third">
                <el-button>Change Password</el-button>
                <el-button>Logout</el-button>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import OrgCard from "@/components/OrgCard.vue";
const show = ref(false);
const org = ref({
  name: "Org Name",
  description: "Org Description",
  logo: "https://picsum.photos/200/300",
  banner: "https://picsum.photos/200/300",
});
onMounted(() => {
  show.value = true;
});

const activeName = ref("first");
</script>

<style scoped>
.surface {
  background-image: linear-gradient(to bottom left, white, #dbcaff, #c9b0ff, rgb(203, 166, 255), #e5d9ff);
  background-size: 160% 160%;
  animation: user-banner-flow 24s ease-in-out infinite;
}

@keyframes user-banner-flow {
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
</style>
