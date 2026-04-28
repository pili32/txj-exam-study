<template>
  <div class="layout-aside">
    <div class="menu-toggle" @click="collapseChange">
      <el-icon>
        <Expand v-if="isCollapse" />
        <Fold v-else />
      </el-icon>


    </div>
    <div class="menu-wrapper">
      <el-menu
        :style="{ width: menuWidth }"
        active-text-color="#c91111"
        background-color="transparent"
        text-color="#000"
        :default-active="activeIndex"
        :collapse="isCollapse"
        :collapse-transition="false"
      >
        <treeMenu :index="activeIndex" :menuData="menuData"></treeMenu>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import treeMenu from "./treeMenu.vue";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { menuStore } from "@/stores/menu.js";
import { Expand, Fold } from '@element-plus/icons-vue'

const { activeIndex, routerList, isCollapse } = storeToRefs(menuStore());
const router = useRouter();

const menuWidth = computed(() => isCollapse.value ? "60px" : "200px");

const menuData = routerList.value;

const collapseChange = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style scoped lang="less">
.layout-aside {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu-toggle {
  text-align: right;
  padding: 10px;
  cursor: pointer;
  flex-shrink: 0; /* 防止被压缩 */
  transition: background-color 0.3s ease;
}
.menu-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  .el-menu {
    border-right: none;
    /* 核心：宽度过渡效果 */
    transition: width 0.3s ease-in-out;
    min-height: 100%; /* 确保高度占满 */
  }
}

/* 折叠时的宽度 */
:deep(.el-menu--collapse) {
  width: 50px !important;
}

/* 覆盖 el-menu 默认样式 */
:deep(.el-menu) {
  background-color: transparent !important;
  height: 100%; /* 确保高度100% */
}

/* 确保菜单滚动正常 */
:deep(.el-menu) {
  border-right: none !important;
}

/* 可选：自定义滚动条样式 */
.menu-wrapper::-webkit-scrollbar {
  width: 4px;
}

.menu-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.menu-wrapper::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.menu-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(201, 17, 17, 0.5);
}
</style>