import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/HomePage.vue";
import OrganizationPage from "@/views/OrganizationPage.vue";
import DashBoard from "@/views/DashboardPage.vue";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/home",
      name: "Home",
      component: Home,
      children: [
        {
          path: "/home/organization",
          name: "Organization",
          component: OrganizationPage,
        },
        {
          path: '/home',
          redirect: '/home/dashboard'
        },
        {
          path: '/home/dashboard',
          name: 'DashBoard',
          component: DashBoard
        }
      ],
    },
    {
      path: "/",
      redirect: "/home",
    }
  ],
});

export default router;
