<template>
  <template v-for="(item, index) in props.menuData" :key="item.meta.id">
    <el-menu-item
      :index="item.meta.path"
      v-if="!item.children || item.children.length == 0"
      @click="handlerClick(item, item.meta.path)"
    >
      <!-- <el-icon><setting /></el-icon> -->
      <el-icon>
        <component :is="item.meta.icon"></component>
      </el-icon>

      <span>{{ item.meta.description }}</span>
    </el-menu-item>

    <el-sub-menu :index="item.meta.path" v-else>
      <template #title>
        <el-icon>
          <component :is="item.meta.icon"></component>
        </el-icon>
        <span>{{ item.meta.name }}</span>
      </template>
      <treeMenu :index="activeIndex" :menuData="item.children"></treeMenu>
    </el-sub-menu>
  </template>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
const props = defineProps(["menuData", "index"]);
import { storeToRefs } from "pinia";

import { menuStore } from "@/stores/menu.js";
const store = menuStore();
const { activeIndex, menuTags } = storeToRefs(menuStore());
const router = useRouter();

const handlerClick = (item, path) => {
  console.log(item);
  const examStatus = localStorage.getItem("examStatus");
  let examinationStatus = false;
  // if (JSON.stringify(examStatus) !== "null") {
  //   examinationStatus = JSON.parse(examStatus).examinationStatus;
  // }
  // 尝试解析考试状态
  // 如果解析失败，默认认为不是考试状态
  try {
    if (examStatus) {
      examinationStatus = JSON.parse(examStatus).examinationStatus;
    }
  } catch (error) {
    console.error("解析考试状态失败:", error);
    examinationStatus = false;
  }

  if (examinationStatus) {
    ElMessage({
      message: "正在答题中，请不要切换页面",
      type: "error",
      duration: 2 * 1000,
    });
    activeIndex.value = "/practice/practice";
    return;
  }

  router.push(item.meta.path);
  activeIndex.value = item.meta.path;
  store.selectMenu(item.meta);
};
</script>

<style scoped></style>
