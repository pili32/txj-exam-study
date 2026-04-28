
import { defineStore, createPinia,storeToRefs } from "pinia";
import { login, logout, getInfo } from '@/api/user'
import { menuStore } from "./menu.js";
import loginMenu from "@/api/role"

const {activeIndex} = storeToRefs(menuStore());

import {setToken} from '@/utils/auth'
import router from "@/router"; // 导入路由实例
const menuStores = menuStore();
export const userStore = defineStore("userInfo", {
  state: () => ({
  token:'',
  userInfo:'',
  feedBackStatus:0,
  }),
  actions: {
    //设置tag
    login(params) {
      const {account,password} = params
      return new Promise((resolve,reject) =>{
        login({account,password}).then(response =>{
          const {data } = response
          setToken(data.token)
          this.userInfo = data
          this.feedBackStatus = data.hasFeedBackManageRole ? 1 : 0  //1是业务管理者  0 是普通用户
          if(!data.menuTree){
            ElMessage({
              message: "无权限登录",
              type: "warning",
              duration: 3 * 1000,
            });
            return
          }
          // const role  =loginMenu.adminRole
          const role  =data.menuTree.children
          let loginPath = ''
          let meta = ''
          if(role[0].children && role[0].children.length > 0) {
             loginPath = role[0].children[0].path
             meta = role[0].children[0].meta
          } else {
           loginPath = role[0].path
           meta = role[0].meta
          }
          // console.log(role);
          // const home =
          //   {
          //     path: "/home",
          //     name: "首页",
          //     meta: {
          //       id: "1-1",
          //       name: "首页",
          //       icon: "Grid",
          //       path: "/home",
          //       description: "这是首页",
          //     },
          //     component: () => import("@/views/home.vue"),
          //     url: "home",
          //   }
          // role.unshift(home)
          this.token = data.token
          menuStores.updateMenu(role); //将当前获取的菜单在Pinia中去缓存
          menuStores.addMenu(role); //配置动态路由
          menuStores.selectMenu(meta)  //配置登录后的tag标签
          console.log(data.needHomePage);
          if(data.needHomePage === 1) {
            setTimeout(()=>{
              const path = '/home'
              router.push(path); //跳到首页第一个菜单
              activeIndex.value =path; //设置首页第一个menu菜单
              resolve()
            },1000)
          } else{
            setTimeout(()=>{
              console.log(loginPath);
              router.push(loginPath); //跳到首页第一个菜单
              activeIndex.value =loginPath; //设置首页第一个menu菜单
              resolve()
            },1000)
          }

        }).catch(error =>{
          reject(error)
        })
      })
    },
    crearStore(){
      this.$patch({
        token: "", //控制左侧菜单栏的缩放
        userInfo: "", //控制当前菜单页面加载时默认激活菜单的 index
      });
      localStorage.removeItem("userInfo");
      localStorage.removeItem("commomState");
      localStorage.removeItem("examStatus");

    },
    //更新tags的状态
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
