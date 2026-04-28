<template>
  <div class="layout-box">
    <header>
      <el-button
        type="primary"
        @click="submitReply()"
        :loading="loading"
        v-if="props.hasFeedBack && !replyStatus"
        >提交回复</el-button
      >
      <el-button
        type="primary"
        @click="submitForm()"
        :loading="loading"
        v-if="!props.feedBackId && !props.hasFeedBack"
        >提交反馈</el-button
      >

      <el-button type="primary" @click="cancelChange()">关闭</el-button>
    </header>

    <div :style="{ height: props.height + 'px' }" class="layout-form">
      <el-form
        :model="ruleForm"
        label-width="100px"
        ref="ruleFormRef"
        :rules="rules"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="title">
              <el-input
                v-model="ruleForm.title"
                :readonly="readonlyStatus"
                placeholder="请输入描述"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="详细信息">
              <div v-show="!readonlyStatus">
                <!-- 编辑器容器 -->
                <div
                  ref="editorRef"
                  style="text-align: left"
                  class="editor-box"
                ></div>
                <div ref="toolbarRef" class="editor-tool"></div>
                <!-- 工具栏（可选） -->
              </div>
              <div
                v-show="readonlyStatus"
                v-html="editorHtml"
                class="readonly-content"
              ></div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="replyStatus">
          <el-col :span="24">
            <el-form-item label="意见回复" prop="replyMessage">
              <div class="replay-content">
                <div>{{ ruleForm.replyMessage }}</div>
                <div class="replay-info">
                  <span>{{ replyInfoUserName }}</span>
                  <span class="times">{{ replyInfoTime }}</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-else-if="replayChange(ruleForm.replyMessage)">
          <el-col :span="24">
            <el-form-item label="意见回复" prop="replyMessage">
              <el-input
                v-model="ruleForm.replyMessage"
                :readonly="replyStatus"
                placeholder="请输入意见回复"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, nextTick, inject, onMounted, watch } from "vue";
import { getToken } from "@/utils/auth";
import { feedBackSave, queryById, feedBackReply } from "@/api/feedBack";
import E from "wangeditor";
import { ElLoading } from "element-plus";
import axios from "axios";

const loading = ref(false);
const props = defineProps({
  height: { type: Number, default: null },
  feedBackId: { type: String, default: "" }, //传来的rowId
  hasFeedBack: { type: Number, default: 0 }, //角色状态
});
const readonlyStatus = ref(false);

// 监听默认参数变化
watch(
  () => props.feedBackId,
  (val) => {
    console.log(val, "valvalval");
    if (val) {
      readonlyStatus.value = true;
    } else {
      readonlyStatus.value = false;
    }
  },
  { immediate: true }
);
const ruleFormRef = ref(null);
const fileList = ref([]);
const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
const action = apiUrl.value + "/business/annex/upload";
const fileListIds = ref([]);
const $loading = inject("$loading"); // 注入全局 Loading
const replyInfoUserName = ref("");
const replyInfoTime = ref("");

const ruleForm = reactive({
  title: "",
  content: "",
  replyMessage: "",
  isReply: 0,
});
const formReadlony = ref(false);
import { userStore } from "@/stores/user.js";

const userStores = userStore();

const { account } = userStores.userInfo.user;
const editorHtml = ref("");
const editorRef = ref(null);
const toolbarRef = ref(null);
let editorInstance = null;
const rules = reactive({
  title: [{ required: true, message: "请输入描述", trigger: "blur" }],
});
const emit = defineEmits(["childChange"]);
const dataId = ref("");
const replyStatus = ref(false);
const replayById = ref("");
const cancelChange = () => {
  emit("childChange"); //部门ids和人员Array
};

onMounted(() => {
  // 初始化编辑器
  editorInstance = new E(toolbarRef.value, editorRef.value);

  // 配置编辑器（按需设置）
  editorInstance.config.placeholder = "请输入内容...";
  // editorInstance.value.config.uploadImgShowBase64 = true; // 示例：图片 base64 保存
  editorInstance.config.showFullScreen = true;
  editorInstance.config.uploadImgServer = action;
  editorInstance.config.uploadFileName = "file"; // 上传文件字段名
  editorInstance.config.uploadImgMaxSize = 2 * 1024 * 1024; // 2MB 限制
  editorInstance.config.uploadImgTimeout = 15 * 1000; // 15秒超时

  // 自定义上传头（如需认证）
  editorInstance.config.uploadImgHeaders = {
    Authorization: getToken(),
  };

  // 自定义菜单（可选）
  editorInstance.config.menus = [
    "bold",
    "head",
    // "link",
    "image", //允许上传图片
    "undo",
    "redo",
    "foreColor",
    "backColor",
  ];
  editorInstance.config.showLinkImg = false; // 关闭插入网络图片功能
  // 自定义上传钩子（可选）
  editorInstance.config.customUploadImg = async (resultFiles, insertImgFn) => {
    // 手动处理文件上传（例如使用 FormData）
    console.log(resultFiles[0]);
    const file = resultFiles[0];
    const formData = new FormData();
    formData.append("files", file);
    console.log(formData);
    try {
      const response = await axios.post(action, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: getToken(),
        },
      });
      if (response.data.code == 200) {
        console.log(response);

        const id = response.data.data[0].id;
        console.log(id);
        let url = apiUrl.value + "/business/annex/downLoad?id=" + id;
        insertImgFn(url);
      } else {
        serviceLoading.close();
      }
    } catch (error) {
      ElMessage.success("文件上传失败");
    }
  };
  // configureEditor(editorInstance.value)
  // 创建编辑器
  editorInstance.create();

  getData(props.feedBackId);
});

const submitReply = async () => {
  console.log(ruleForm.replyMessage);

  if (!ruleForm.replyMessage) {
    ElMessage({
      message: "请输入意见回复",
      type: "warning",
      duration: 3 * 1000,
    });
    return;
  }
  const params = {
    replyMessage: ruleForm.replyMessage,
    id: replayById.value,
  };
  await feedBackReply(params)
    .then((res) => {
      if (res.code == 200) {
        ElMessage({
          message: "操作成功",
          type: "success",
          duration: 3 * 1000,
        });
      }

      loading.value = false;
      // $loading.close();
      emit("childChange"); //部门ids和人员Array
    })
    .catch((error) => {
      loading.value = false;

      // $loading.close();
    });
};

const submitForm = async () => {
  const data = editorInstance.txt.html();
  if (!data) {
    ElMessage({
      message: "请输入详情",
      type: "warning",
      duration: 3 * 1000,
    });
    return;
  }
  ruleForm.content = data;
  loading.value = true;
  console.log(ruleForm);
  ruleFormRef.value
    .validate(async (valid) => {
      if (valid) {
        await feedBackSave(ruleForm)
          .then((res) => {
            if (res.code == 200) {
              ElMessage({
                message: "操作成功",
                type: "success",
                duration: 3 * 1000,
              });
            }

            loading.value = false;
            // $loading.close();
            emit("childChange"); //部门ids和人员Array
          })
          .catch((error) => {
            loading.value = false;

            // $loading.close();
          });
        return;
      } else {
        loading.value = false;
      }
    })
    .catch((error) => {
      loading.value = false;
    });
};

const getData = (id) => {
  if (!id) return;
  queryById(id).then((res) => {
    const {
      content,
      title,
      isReply,
      id,
      replyMessage,
      replyUserName,
      replyTime,
    } = res.data;
    ruleForm.title = title;
    ruleForm.replyMessage = replyMessage;
    editorInstance.txt.html(content);
    editorHtml.value = content;
    replyStatus.value = isReply ? true : false;
    replayById.value = id;
    replyInfoUserName.value = replyUserName;
    replyInfoTime.value = replyTime;
  });
};

const replayChange = () => {
  let result = false;
  if (props.hasFeedBack == 1) {
    result = true;
  }

  return result;
};
</script>

<style scoped lang="less">
.editor-box {
  min-height: 50vh;
  background: #fff;
  z-index: 100;
}
::v-deep .w-e-text-container {
  z-index: 100 !important;
}
::v-deep.editor-tool {
  z-index: 100 !important;
  .w-e-toolbar {
    z-index: 100 !important;
  }
}
.layout-box {
  padding: 10px;
  background: #ebeef5;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.layout-form {
  overflow-y: auto;
  padding-right: 50px;
  width: 60vw;
}
header {
  display: flex;
  justify-content: center;
  padding: 5px 0;
}
.el-form-item__content {
  align-items: center;
  div {
    width: 100%;
  }
}
.flex-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 29px;
  font-size: 14px;
  div {
    color: #606266;
  }
}
.pl1 {
  padding-left: 29px;
}
.pl2 {
  padding-left: 5px;
}
.flex-user {
  display: flex;
  flex-direction: row;
  font-size: 14px;
  align-items: center;
  padding-bottom: 10px;
  box-sizing: border-box;
  button {
    margin-left: 16px;
  }
  .user-check {
    display: flex;
    border: 1px solid #ddd;
    flex: 1;
    margin-left: 8px;
    min-height: 50px;
    background: #fff;
  }
  .upload-check {
    display: flex;
    border: 1px solid #ddd;
    width: 500px;
    min-height: 50px;
    background: #fff;
    flex-direction: column;
    margin-left: 8px;
    border-radius: 3px;
    cursor: pointer;
  }
  .upload-content {
    display: flex;
    align-items: center;
    padding: 5px;
    box-sizing: border-box;
  }
  .upload-content :hover {
    color: #409eff;
  }
}
.gap-2 {
  gap: 0.5rem;
}
.flex {
  display: flex;
}
.el-tag {
  margin: 2px;
}
.readonly-content {
  min-height: 300px;
  background: #fff;
  border-radius:3px

}
.replay-content{
  background:#fff;
  width: 100%;
    padding: 5px;
    box-sizing: border-box;
  .replay-info{
    text-align:right;
    width:100%
  }
  .replay-info .times{
    margin-left:20px
  }
}

</style>
