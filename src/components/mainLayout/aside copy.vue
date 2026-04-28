<template>
  <div class="latout-aside">
    <div class="menu-toggle" @click="collapseChange">
      <el-tooltip
          effect="dark"
          :content="isCollapse ? '展开菜单' : '折叠菜单'"
          placement="right"
        >
          <el-icon>
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
        </el-tooltip>
    </div>
    <el-menu
      :style="{ width: menuWidth }"
      active-text-color="#c91111"
      background-color="transparent"
      text-color="#000"
      :default-active="activeIndex"
      :collapse="isCollapse"
    >
      <treeMenu :index="activeIndex" :menuData="menuData"></treeMenu>
    </el-menu>
  </div>
  <!-- 409eff1a -->
</template>

<script setup>
import { useRouter } from "vue-router";
import treeMenu from "./treeMenu.vue";
import { computed, reactive, ref } from "vue";

import { storeToRefs } from "pinia";
import { menuStore } from "@/stores/menu.js";
const { activeIndex, routerList, isCollapse } = storeToRefs(menuStore());
const router = useRouter();
const menuWidth = computed(() => (isCollapse.value ? "80px" : "190px"));

// const menuData = reactive(router.options.routes[0].children);
const menuData = routerList.value;

const collapseChange = () => {
  isCollapse.value = !isCollapse.value;

  console.log(isCollapse.value);
};
</script>

<style scoped lang="less">
.menu-logo {
  text-align: center;
  color: #000;
  height: 10px;
  line-height: 10px;
}
.el-menu {
  border-right: #dbecff;
}

/* 覆盖 el-menu 默认样式 */
:deep(.el-menu) {
  background-color: transparent !important;
  border-bottom: none !important; /* 可选：去掉下边框 */
}

/* 可选：调整菜单项悬停/激活状态样式 */
:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
:deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
.menu-toggle {
  text-align: right;
  padding: 10px;
}

.menu-toggle {
  will-change: transform; /* 提前告知浏览器该元素会变化 */
  position: relative;
  transform-origin: left center; /* 动画从左侧中心点缩放 */
  transition: transform 0.3s ease; /* 仅优化 transform 过渡 */
  z-index: 10; /* 防止缩放时被其他元素遮挡 */
}
</style>
