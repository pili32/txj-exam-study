<!-- components/RichTextEditor.vue -->
<template>
  <div  class="editor">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 250px;width: 100%; overflow-y: hidden"
      v-model="props.modelValue"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleEditorCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup>
import 'wangeditor/dist/css/style.css';
import { onBeforeUnmount, ref, watch,onMounted,nextTick } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import Editor from 'wangeditor';
const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "请输入内容..." },
  mode: { type: String, default: "simple" }, // 'default' 或 'simple'
});

const emit = defineEmits(["update:modelValue", "change"]);
const editorRef = ref(null);
const toolbarConfig = {
  excludeKeys: ["insertLink",, "insertVideo", "emotion", "fullScreen","codeBlock","todo","group-image"] //当前不需要的菜单
};
const toolbarConfig1 ={
        toolbarKeys: [
          // 一些常用的菜单 key
          "headerSelect", // 标题
          // "header1", // 标题1
          // "header2", // 标题2
          // "header3", // 标题3
          // "header4", // 标题4
          // "header5", // 标题5
          "bold", // 粗体
          "underline", // 下划线
          "italic", // 斜体
          "through", // 删除线
          "code", // 行内代码
          "sub", // 下标
          "sup", // 上标
          "clearStyle", // 清除格式
          "color", // 字体颜色
          "bgColor", // 背景色
          "fontSize", // 字号
          "fontFamily", // 字体
          "indent", // 增加缩进
          "delIndent", // 减少缩进
          "justifyLeft", // 左对齐
          "justifyRight", // 右对齐
          "justifyCenter", // 居中对齐
          "justifyJustify", // 两端对齐
          "lineHeight", // 行高
          // "insertImage", // 网络图片
          "deleteImage", // 删除图片
          "editImage", // 编辑图片
          "viewImageLink", // 查看链接
          "imageWidth30", // 图片宽度相对于编辑器宽度的百分比30
          "imageWidth50", // 图片宽度相对于编辑器宽度的百分比50
          "imageWidth100", // 图片宽度相对于编辑器宽度的百分比100
          "divider", // 分割线
          "emotion", // 表情
          "insertLink", // 插入链接
          "editLink", // 修改链接
          "unLink", // 取消链接
          "viewLink", // 查看链接
          // "codeBlock", // 代码块
          // "blockquote", // 引用
          "todo", // 待办
          "redo", // 重做
          "undo", // 撤销
          "fullScreen", // 全屏
          "enter", // 回车
          "bulletedList", // 无序列表
          "numberedList", // 有序列表
          "insertTable", // 插入表格
          "deleteTable", // 删除表格
          "insertTableRow", // 插入行
          "deleteTableRow", // 删除行
          "insertTableCol", // 插入列
          "deleteTableCol", // 删除列
          "tableHeader", // 表头
          "tableFullWidth", // 宽度自适应
          // "insertVideo", // 插入网络视频
          // "uploadVideo", // 上传视频
          // "editVideoSize", // 修改视频尺寸
          "uploadImage", // 上传图片
          // "codeSelectLang" // 选择语言
          // 对齐
          // {
          //   iconSvg:
          //       '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
          //   key: "group-justify",
          //   menuKeys: [
          //     "justifyLeft",
          //     "justifyRight",
          //     "justifyCenter",
          //     "justifyJustify",
          //   ],
          //   title: "对齐",
          // },
        ]
          }
const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {},
  autoFocus: true,
};
const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
const action = apiUrl.value + "file/upload";
// 配置图片上传
editorConfig.MENU_CONF["uploadImage"] = {
  server:action, // 你的上传接口
  fieldName: "file",
  maxFileSize: 10 * 1024 * 1024, // 10M
  allowedFileTypes: ["image/*"],
  timeout: 15 * 1000, // 15秒
  // 自定义插入图片
  customInsert(res, insertFn) {
    // res 即服务端的返回结果
    // 从 res 中找到 url alt height width 等数据，插入图片
    insertFn(res.data.url, res.data.alt, res.data.height);
  },
  // 上传错误提示
  onFailed(file, res) {
  },
};
const handleEditorCreated = (editorInstance) => {
  editorRef.value = editorInstance;
};

const handleChange = (editorRef) => {
  emit("update:modelValue", editorRef.getHtml());
  emit("change", editorRef.getHtml());
};

// 监听外部传入的 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (editorRef.value && newVal !== editorRef.value.getHtml()) {
      editorRef.value.setHtml(newVal || "");
    }
  }
);

// onBeforeUnmount(() => {
//   if (editor.value == "") return;
//   editor.value.destroy();
// });

// 点击空白处关闭菜单
const handleClickOutside = async  (e) => {

  await nextTick()
  const editor = await editorRef.value;
  if (!editor) return;

  // 检查点击目标是否在工具栏或菜单内
  const isClickToolbar = e.target.closest('.w-e-toolbar');
  const isClickMenu = e.target.closest('.w-e-menu, .w-e-dropdown-menu, .w-e-panel,.w-e-drop-panel');
  // 如果点击的不是工具栏或菜单，则关闭所有菜单
  if (!isClickToolbar && !isClickMenu) {
  editorRef.value.hidePanelOrModal()
    const doc = document.getElementsByClassName('w-e-drop-panel')
    for(let i=0 ;i<doc.length;i++) {
      doc[i].style.display = "none"
    }
  }
};

onMounted( async () => {
  await nextTick()
  const toobal =  DomEditor.getToolbar(editorRef.value)
  const curToolbarConfig = toobal.getConfig()
  // 添加全局点击事件监听
  await  nextTick()
  setTimeout(async  ()=>{
  await document.addEventListener('click',  handleClickOutside);

  },1000)
});

onBeforeUnmount(() => {
  // 移除事件监听
  document.removeEventListener('click', handleClickOutside);
  // 销毁编辑器
  if (editorRef.value) {
    editorRef.value.destroy();
  }
});
</script>

<style scoped lang="less">
.editor{
  border: 1px solid #ccc;
  background: #fff;
}
/* 隐藏默认的下拉箭头（可选） */
.w-e-toolbar .w-e-droplist {
  display: none;
}

/* 鼠标悬停时显示下拉菜单 */
.w-e-toolbar .w-e-menu:hover .w-e-dropdown-menu,
.w-e-toolbar .w-e-menu:hover .w-e-panel {
  display: block !important;
}
</style>
