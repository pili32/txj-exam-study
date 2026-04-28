<template>
  <div class="common-layout">
    <!-- <el-container class="layout-container">
      <div class="common-aside">
        <Aside />
      </div>
      <el-container class="common-container">
        <el-header class="el-header">
          <Header ></Header>
        </el-header>
        <Tags></Tags>
        <router-view />
      </el-container>
    </el-container> -->
    <el-container class="layout-container">
      <!-- <div class="common-aside">
      </div> -->
      <el-container class="common-container">
        <el-header class="el-header">
          <Header></Header>
        </el-header>
        <div class="common-right">
          <div class="common-aside">
            <Aside />

          </div>
          <div class="layout-right" :style="{ width: `calc(100% - ${menuWidth})` }">
            <Tags></Tags>
            <router-view />
          </div>
        </div>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import Aside from "../components/mainLayout/aside.vue";
import Header from "../components/mainLayout/navHeader.vue";
import Tags from "../components/mainLayout/tags.vue";
import { computed } from "vue";

import { storeToRefs } from 'pinia';
import { menuStore } from "@/stores/menu.js";

const {isCollapse} = storeToRefs(menuStore())
console.log(isCollapse.value);
const menuWidth = computed(() => (isCollapse.value ? "80px" : "200px"));
console.log(menuWidth);
</script>
<style lang="less" scoped>
.common-layout {
  height: 100%;
  .layout-container {
    height: 100%;
  }
}
.el-header {
  margin: 0;
  padding: 0;
  height: 40px;
}
.common-right{
  display: flex;
  flex-direction: row;
  height: calc(100% - 40px);
}
.common-aside {
  // background: #fff7f5;
  overflow-y: auto;
  // width: 200px;
  // background: rgba(0, 0, 0, 0.5) url("@/assets/image/menu.png");

  background:  url("@/assets/image/layoutHome/groupMenu.png");

  // background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.common-container {
  background: #f5f7fa;
  width: 100%;
  color: #000;
}
.layout-right{
  display: flex;
  flex-direction: column;
}
</style>
