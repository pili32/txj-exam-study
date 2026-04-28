import { createApp, provide } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
// import 'element-plus/dist/index.css'
import store from "./stores";
import { getToken } from "@/utils/auth";
import { createPinia } from "pinia";
const pinia = createPinia();
import { menuStore } from "@/stores/menu.js";
import "normalize.css"; // 引入 Normalize.css
import { useGlobalLoading } from "@/utils/loading";
import authDirective from './directives/auth'; // 导入指令

const app = createApp(App);
app.use(pinia);
app.provide("$loading", useGlobalLoading());
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import zhCn from "element-plus/es/locale/lang/zh-cn"; //element-plus默认的英文版本，需要引入中文

const stores = menuStore();
const menuData = localStorage.getItem("menuState");

function isRoute(to) {
  const res = router.getRoutes();
  // console.log(res);
  console.log(res);

  let resFil = res.filter((item) => item.path === to.path);
  console.log(resFil);

  return resFil.length;
}
function currentOneTags() {
  const data = JSON.parse(menuData).menuTags;
  console.log(data[data.length - 1].path)

  return data[data.length - 1].path;
}
router.beforeEach((to, from, next) => {
  console.log(to);
  const token = getToken();
  const userInfo = localStorage.getItem("userInfo");
  if (to.path !== "login" && token && userInfo) {
    console.log("当前跳转并不是login页面，并且token存在,并且有用户信息缓存");
    console.log(to.path);

    if (isRoute(to)) {
      if (to.path == "/") {
        // console.log("当前指向空地址时，将重置路由为tag的最后一个route");
        next(currentOneTags());
      } else {
        next();
      }
    } else {
      if (to.path == "/" && currentOneTags()) {
        // console.log("当前指向空地址时，将重置路由为tag的最后一个route");
        next(currentOneTags());
      } else {
        console.log("报错，没找到");
        next("/404");
      }
    }
  } else {
    console.log("当前token不在");
    if (to.path == "/login") {
      //当前页面没有token并且是login页面
      next();
    } else {
      //当前页面没有token并且不是login页面
      next("/login");
    }

    localStorage.clear();
    sessionStorage.clear();
  }
});

if (menuData) {
  const data = JSON.parse(menuData).routerList;
  (stores as any).addMenu(data, "refresh")
  data.forEach((element) => {
    router.addRoute("main", element);
  });
}
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
// 全局注册指令
app.directive('auth', authDirective);
app.use(store);
app.use(ElementPlus, { locale: zhCn }); // 全局配置中文
app.use(router).mount("#app");
