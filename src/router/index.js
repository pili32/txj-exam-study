import { createRouter, createWebHashHistory } from "vue-router";
import { getToken } from "@/utils/auth";

// import routerOne from "./routerOne";
// const userInfo = storage.get("userInfo");

let routers = [];

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login.vue"),
  },

  {
    path: "/main",
    name: "main",
    component: () => import("@/views/Main.vue"),
    children: [],
  },
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),

  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/Home.vue"),
    children: [],
    meta: { requiresAuth: true }
  },


  {
    path: "/404",
    name: "404",
    component: () => import("@/views/404.vue"),
  },
  {
    path: "/preview",
    name: "preview",
    component: () => import("@/views/knowledge/preview.vue"),
  },
  {
    path: "/feedback",
    name: "feedback",
    component: () => import("@/components/Feedback.vue"),
  },
  {
    path: "/openOfd",
    name: "openOfd",
    component: () => import("@/views/knowledge/openOfd.vue"),
  },
  {
    path: "/openVideo",
    name: "openVideo",
    component: () => import("@/views/knowledge/openVideo.vue"),
  },

  ...routers,
];

const router = createRouter({
  //挂载路由方法
  history: createWebHashHistory(), //路由匹配模式使用hash模式
  routes,
});


export default router; //导出后需要在main.js文件引入挂载
