<template>
  <div class="tags-box">
    <el-tag
      v-for="(tag, index) in menuTags"
      :key="tag.name"
      :closable="menuTags.length!=1"
      :disable-transitions="false"
      :effect="`${route.path}` === tag.path ? 'dark' : 'plain'"
      @close="handleClose(tag, index)"
      @click="handlerChange(tag)"
    >
      {{ tag.name }}
    </el-tag>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { menuStore } from "@/stores/menu.js";
import { storeToRefs } from "pinia";

const router = useRouter();
const { menuTags, activeIndex } = storeToRefs(menuStore());
const store = menuStore();

const handleClose = (tag, index) => {
  const examStatus = localStorage.getItem("examStatus");
  let examinationStatus = false;
  if (JSON.stringify(examStatus) !== "null") {
    examinationStatus = JSON.parse(examStatus).examinationStatus;
  }
  if (examinationStatus) {
    ElMessage({
      message: "正在答题中，请不要切换页面",
      type: "error",
      duration: 1 * 1000,
    });
    return;
  }
  store.updateTag(tag);
  if (tag.name !== route.name) return;
  if (index === menuTags.value.length) {
    store.selectMenu(menuTags.value[index - 1]); //如果删除的是tag的最后一个，那么要调整到前面一个tag上

    router.push(menuTags.value[menuTags.value.length - 1].path);
    activeIndex.value = menuTags.value[menuTags.value.length - 1].path;
  } else {
    store.selectMenu(menuTags.value[index]); //
    router.push(menuTags.value[index].path);
    activeIndex.value = menuTags.value[index].path;
  }
};
const handlerChange = (tag) => {
  const examStatus = localStorage.getItem("examStatus");
  let examinationStatus = false;
  if (JSON.stringify(examStatus) !== "null") {
    examinationStatus = JSON.parse(examStatus).examinationStatus;
  }
  if (examinationStatus) {
    ElMessage({
      message: "正在答题中，请不要切换页面",
      type: "error",
      duration: 3 * 1000,
    });
    return;
  }

  router.push(tag.path);
  activeIndex.value = tag.path;
};
const route = useRoute();
</script>

<style scoped>
.tags-box {
  padding: 5px 5px;
  background-color: #fff;
  box-sizing: border-box;
  margin-bottom: 5px;
}
.el-tag {
  cursor: pointer;
  margin-right: 5px;
}
</style>
