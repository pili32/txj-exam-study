
import { defineStore, createPinia } from "pinia";
import {toRaw } from "vue";
import router from "@/router"; // 导入路由实例
export const menuStore = defineStore("menuState", {
  state: () => ({
    isCollapse: false, //控制左侧菜单栏的缩放
    activeIndex: "", //控制当前菜单页面加载时默认激活菜单的 index
    menuTags: [],
    currentMenu: "",
    menuList: [],
    token: "",
    routerList: [],
  }),
  getters: {},
  actions: {
    //设置tag
    selectMenu(val) {
      this.currentMenu = val.name;
      const data = this.menuTags.findIndex((item) => item.name == val.name);
      if (data == -1) {
        this.menuTags.push(val);
      }
    },
    //更新tags的状态
    updateTag(tag) {
      this.menuTags.splice(this.menuTags.indexOf(tag), 1);
    },
    updateMenu(val) {
      this.menuList = val;
    },
    addMenu(payload, type) {
      const module = import.meta.glob("../views/**/*.vue"); //vue语法,匹配view下面的.vue文件
      function routerSet(routerData) {
        routerData.forEach((item) => {
          if (!item.children || item.children.length<1) {
            let url = `../views/${item.url}.vue`;
            item.component = module[url];
          } else {
            routerSet(item.children);
          }
        });
      }
      routerSet(payload);
      this.routerList = payload;
      //toRaw  将响应式数据转为普通数据
      toRaw(payload).forEach((item) => {
        router.addRoute("main", item);
      });
    },
    crearStore() {
      router.push("/login");
        this.$patch({
          isCollapse: false, //控制左侧菜单栏的缩放
          activeIndex: "", //控制当前菜单页面加载时默认激活菜单的 index
          menuTags: [],
          currentMenu: "",
          menuList: [],
          token: "",
          routerList: [],
        });
        localStorage.removeItem("menuState");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("commomState");
        localStorage.removeItem("examStatus");
      window.history.pushState(null, null, window.location.href); // 添加一个新的历史记录项，使得后退按钮无效
      window.addEventListener("popstate", window.history.go(1));
    },
  },
  persist: {
    enabled: true, // 开启持久化
    // strategies: [
    //   {
    //     key: "menuActiveIndex", // 存储键名
    //     storage: localStorage, // 存储介质
    //     paths: ["activeIndex"], // 需要做持久化存储的字段
    //   },
    //   {
    //     key: "routerList", // 存储键名
    //     storage: localStorage, // 存储介质
    //     paths: ["routerList"], // 需要做持久化存储的字段
    //   },
    // ],
  },
});

const store = createPinia();
export default store;
