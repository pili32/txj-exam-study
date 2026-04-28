<template>
  <div>
    <!-- 编辑器容器 -->
    <div ref="editorRef" style="text-align: left"></div>
    <!-- 工具栏（可选） -->
    <div ref="toolbarRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// 定义 DOM 引用
const editorRef = ref(null);
const toolbarRef = ref(null);
let editorInstance = null;

onMounted(() => {
  // 初始化编辑器
  editorInstance = new E(toolbarRef.value, editorRef.value);

  // 配置编辑器（按需设置）
  editorInstance.config.placeholder = "请输入内容...";
  editorInstance.config.uploadImgShowBase64 = true; // 示例：图片 base64 保存

  // 自定义菜单（可选）
  editorInstance.config.menus = [
    "bold",
    "head",
    "link",
    "image",
    "undo",
    "redo",
  ];

  // 创建编辑器
  editorInstance.create();

  // 获取编辑器内容（示例：通过按钮或事件）
  const getContent = () => {

  };
});

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;
  }
});
</script>
