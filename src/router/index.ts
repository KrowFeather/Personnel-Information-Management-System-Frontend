import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/HomePage.vue";
import OrganizationPage from "@/views/OrganizationPage.vue";
import DashBoard from "@/views/DashboardPage.vue";
import UserPage from "@/views/UserPage.vue";
import BlogPage from "@/views/BlogPage.vue";
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
          component: DashBoard,
          children: [
            {
              path: '/home/dashboard/blog/:org',
              name: 'Blog',
              component: BlogPage
            },
            {
              path:'/home/dashboard',
              redirect: '/home/dashboard/blog/1'
            }
          ]
        },
        {
          path: '/home/user',
          name: 'User',
          component: UserPage
        },
      ],
    },
    {
      path: "/",
      redirect: "/home",
    }
  ],
});

export default router;
