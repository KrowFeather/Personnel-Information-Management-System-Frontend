import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/HomePage.vue";
import LoginPage from "../views/LoginPage.vue";
import OrganizationPage from "@/views/OrganizationPage.vue";
import DashBoard from "@/views/DashboardPage.vue";
import UserPage from "@/views/UserPage.vue";
import BlogPage from "@/views/BlogPage.vue";
import AdminPage from "@/views/AdminPage.vue";
import TeamAdminPage from "@/views/TeamAdminPage.vue";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: LoginPage,
    },
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
            }
          ]
        },
        {
          path: '/home/user',
          name: 'User',
          component: UserPage
        },
        {
          path: '/home/team-admin',
          name: 'TeamAdmin',
          component: TeamAdminPage
        },
      ],
    },
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/admin",
      name: "Admin",
      component: AdminPage,
    }
  ],
});

export default router;
