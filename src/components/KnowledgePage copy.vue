<template>
  <div class="layout-box">
    <header>
      <el-button type="primary" @click="submitFile()" :loading="loading"
        >保存</el-button
      >
      <el-button type="primary" @click="cancelChange()">取消</el-button>
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
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="ruleForm.title"
                :readonly="formReadlony"
                placeholder="请输入标题"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="资料类别">
              <el-select
                v-model="ruleForm.typeCode"
                placeholder="请选择资料类别"
                :disabled="formReadlony"
              >
                <el-option
                  v-for="item in props.studyTypeData"
                  :key="item.valueCode"
                  :label="item.valueName"
                  :value="item.valueCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="内容">
              <!-- <RichTextEditor
                v-model="ruleForm.content"
                @change="handleContentChange"
              /> -->
              <div>
                <!-- 编辑器容器 -->
                <div
                  ref="editorRef"
                  style="text-align: left"
                  class="editor-box"
                ></div>
                <div ref="toolbarRef" class="editor-tool"></div>
                <!-- 工具栏（可选） -->
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="密级" prop="security">
              <el-select
                v-model="ruleForm.security"
                placeholder="请选择密级"
                :disabled="formReadlony"
              >
                <el-option
                  v-for="item in props.securityData"
                  :key="item.valueCode"
                  :label="item.valueName"
                  :value="item.valueCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="阅读范围" prop="readRange">
              <el-select
                v-model="ruleForm.readRange"
                placeholder="请选择阅读范围"
                :disabled="formReadlony"
                @change="readRangeChange"
              >
                <el-option
                  v-for="item in readData"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="flex-user pl1" v-if="userCheck">
        <el-button type="primary" size="small" @click="checkChange"
          >选择</el-button
        >
        <div class="user-check">
          <div v-for="item in userData" class="flex gap-2">
            <el-tag type="primary" v-if="ruleForm.readRange == 30">{{
              item.userName
            }}</el-tag>
            <el-tag type="primary" v-else>{{ item.deptName }}</el-tag>
          </div>
        </div>
      </div>
      <div class="flex-user pl2">
        <el-upload
          ref="uploadRef"
          :action="action"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="validateFile"
          :file-list="fileList"
          :show-file-list="false"
          :on-progress="progressChange"
          :on-success="successChange"
          multiple
        >
          <el-button type="primary" size="small">选择文件</el-button>
        </el-upload>
        <div class="upload-check">
          <div v-for="item in fileList" class="flex gap-2">
            <div class="upload-content">
              <span>{{ item.name }}</span>
              <el-icon @click="handleFileRemove(item)"><Delete /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <component
      :is="components[currentTab]"
      ref="dialogRef"
      @childEvent="updateData"
      :readRange="ruleForm.readRange"
    />
  </div>
</template>
<script setup>
import { ref, reactive, nextTick, inject, onMounted, watch } from "vue";
import treeUser from "./module/treeUser.vue";
import treeDept from "./module/treeDept.vue";
import { getToken } from "@/utils/auth";
import { articleSave, queryByIdApi, updateSave } from "@/api/knowledge";
import { deleteFileApi } from "@/api/upload";
import E from "wangeditor";
import { ElLoading } from "element-plus";
import axios from "axios";
const components = {
  treeUser,
  treeDept,
};
const loading = ref(false);
const currentTab = ref("treeUser");
const props = defineProps({
  height: { type: Number, default: null },
  securityData: { type: Array, default: [] },
  studyTypeData: { type: Array, default: [] },
  mode: { type: String, default: "default" }, // 'default' 或 'simple'
  userExamId: { type: String, default: "" },
});

watch(
  () => props.userExamId,
  (val) => {
    // tableData.value = val;
  },
  { immediate: true }
);

import RichTextEditor from "@/components/RichTextEditor.vue";
const ruleFormRef = ref(null);
const fileList = ref([]);
const ruleFormId = ref("");
const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
const action = apiUrl.value + "/business/annex/upload";
const fileListIds = ref([]);
const $loading = inject("$loading"); // 注入全局 Loading

const ruleForm = reactive({
  title: "",
  content: "",
  security: "",
  typeCode: "",
  readRange: "",
  relatedAnnexIds: [],
  rangeDepts: [],
  rangeUsers: [],
  rangeDepIds: [],
});
const headers = ref({
  Authorization: getToken(), //headers属性中添加token，这个属性是el-upload自带的用来设置上传请求头部
});
const dialogRef = ref();
const userData = ref([]);
const content = ref("<p>初始内容</p>");
const formReadlony = ref(false);
import { userStore } from "@/stores/user.js";

const userStores = userStore();

const { account } = userStores.userInfo.user;

const editorRef = ref(null);
const toolbarRef = ref(null);
let editorInstance = null

const rules = reactive({
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  security: [{ required: true, message: "请选择密级", trigger: "blur" }],
  readRange: [{ required: true, message: "请选择类型", trigger: "blur" }],
});
const emit = defineEmits(["childChange"]);
const dataId = ref("");
const uploadRef = ref(null); // 获取 el-upload 的实例
const handleContentChange = (val) => {};
const userCheck = ref(false);
const readData = reactive([
  {
    value: "10",
    label: "全部公开",
  },
  {
    value: "20",
    label: "限定部门",
  },
  {
    value: "30",
    label: "限定人员",
  },
]);

const cancelChange = () => {
  emit("childChange"); //部门ids和人员Array
};

onMounted(() => {
  // 初始化编辑器
  editorInstance.value = new E(toolbarRef.value, editorRef.value);

  // 配置编辑器（按需设置）
  editorInstance.config.placeholder = "请输入内容...";
  editorInstance.config.uploadImgShowBase64 = true; // 示例：图片 base64 保存
  // 自定义菜单（可选）
  editorInstance.config.menus = [
    "bold",
    "head",
    // "link",
    "image",
    "undo",
    "redo",
    "foreColor",
    "backColor",
  ];

  // 创建编辑器
  editorInstance.create();
});
// 获取编辑器内容（示例：通过按钮或事件）

const submitForm = async () => {
  if (userCheck.value) {
    if (ruleForm.readRange == "20" && ruleForm.rangeDepIds.length == 0) {
      ElMessage({
        message: "请选择部门",
        type: "warning",
        duration: 1 * 1000,
      });
      return;
    } else if (ruleForm.readRange == "30" && ruleForm.rangeDepIds.length == 0) {
      ElMessage({
        message: "请选择人员",
        type: "warning",
        duration: 1 * 1000,
      });
      return;
    }
  }
  // $loading.open({ text: "加载中..." });

  loading.value = true;
  ruleFormRef.value
    .validate(async (valid) => {
      if (valid) {
        ruleForm.relatedAnnexIds = fileListIds.value;
        ruleForm.id = dataId.value;
        if (dataId.value) {
          await updateSave(ruleForm)
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
          ruleForm.relatedAnnexIds = fileListIds.value;
          await articleSave(ruleForm)
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
        }
      } else {
        loading.value = false;
      }
    })
    .catch((error) => {
      loading.value = false;
    });
};
const readRangeChange = (value) => {
  if (value != 10) {
    userCheck.value = true;
  } else {
    userCheck.value = false;
  }
  userData.value = [];
};
const initFun = (data) => {
  dataId.value = data;
  if (data) {
    getData(data);
  }
};
const getData = (id) => {
  queryByIdApi(id).then((res) => {
    const { article, range, annex } = res.data;
    ruleForm.title = article.title;
    ruleForm.content = article.content;
    editorInstance.txt.html(article.content);
    ruleForm.security = String(article.security);
    ruleForm.typeCode =
      article.typeCode === null ? "" : String(article.typeCode);

    ruleForm.title = article.title;
    ruleForm.readRange = String(range.readRange);
    if (ruleForm.readRange != "10") {
      userCheck.value = true;

      if (ruleForm.readRange == "20") {
        ruleForm.rangeDepts = range.rangeDepts;
        userData.value = range.rangeDepts;
      } else {
        ruleForm.rangeUsers = range.rangeUsers;
        userData.value = range.rangeUsers;
      }
      ruleForm.rangeDepIds = range.rangeDepIds;
    }
    fileList.value = annex;
  });
};
const updateData = (deptIds, userArr) => {
  userData.value = userArr;
  if (ruleForm.readRange == 30) {
    ruleForm.rangeUsers = userArr;
  } else {
    ruleForm.rangeDepts = userArr;
  }
  ruleForm.rangeDepIds = deptIds;
  dialogRef.value.initChange(false);
};

const checkChange = async () => {
  currentTab.value =
    String(ruleForm.readRange) == "30" ? "treeUser" : "treeDept";
  await nextTick(); // 等待DOM更新完成
  if (dataId.value && currentTab.value == "treeDept") {
    dialogRef.value.initChange(true, ruleForm.rangeDepIds, ruleForm.rangeDepts);
  } else if (dataId.value && currentTab.value == "treeUser") {
    dialogRef.value.initChange(true, ruleForm.rangeDepIds, ruleForm.rangeUsers);
  }
  dialogRef.value.initChange(true);
};

// 文件变化时保存到 fileList
const handleFileChange = (file, files) => {
  console.log(account);
  if (account === "cs2") {
    fileList.value.push(file);
  } else {
    const type = file.raw.type;
    const validTypes = [
      "application/ofd",
      "application/pdf",
      "video/WebM",
      "video/ogg",
      "video/mp4",
    ];
    const isValid = validTypes.includes(file.raw.type);
    if (!isValid) {
      ElMessage.error(
        "只能上传ofd、pdf、video/WebM、video/ogg、video/mp4等文件类型"
      );
      return false;
    }

    fileList.value.push(file);
  }

  // fileList.value = validSzie;
};

// 删除文件时更新 fileList
const handleFileRemove = (item) => {
  // deleteFileApi

  const index = fileList.value.findIndex((e) => e.uid === item.uid);
  fileList.value.splice(index, 1);
  if (item.id) deleteFile(item.id);

  // fileList.value = files;
};

const deleteFile = (id) => {
  deleteFileApi(id).then((res) => {});
};
const progressChange = (file) => {};
// 上传前校验文件大小（限制 2MB）
const validateFile = (file) => {
  // const isLt2M = file.size / 1024 / 1024 < 2;
  // if (!isLt2M) {
  //   ElMessage.error("文件大小不能超过 2MB!");
  //   return false; // 返回 false 阻止上传
  // }
  // return true; // 返回 true 允许添加到文件列表
};
const successChange = () => {};
//提交上传文件
const submitFile = async () => {
  const data = editorInstance.txt.html();

  ruleForm.content = data;

  // uploadRef.value.submit();
  if (fileList.value.length === 0) {
    submitForm();
    return;
  }
  const serviceLoading = ElLoading.service({
    lock: true,
    text: "正在上传文件！",
    background: "rgba(0, 0, 0, 0.7)",
  });
  // const formData = ref({ name: '', description: '' }); // 其他表单数据
  // 1. 创建 FormData 对象（可选）
  const form = new FormData();
  fileList.value.forEach((file) => {
    form.append("files", file.raw); // 添加文件
  });
  //  form.append('name', formData.value.name); // 添加其他字段

  // 2. 手动通过 axios 上传（替代 uploadRef.value.submit()）

  try {
    const response = await axios.post(action, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: getToken(),
      },
    });
    if (response.data.code == 200) {
      fileListIds.value = response.data.data.map((item) => item.id);
      serviceLoading.close();
    } else {
      serviceLoading.close();
    }
  } catch (error) {
    ElMessage.success("文件上传失败");
    serviceLoading.close();
  } finally {
    serviceLoading.close();

    submitForm();
  }
};

const handleChange = (file, files) => {
  //   fileList.value = fileList.value.slice(-1)
  fileList.value = files;
};

// 手动触发上传
const submitUpload = () => {
  if (fileList.value.length === 0) {
    return;
  }
  // 调用 el-upload 的 submit 方法
  uploadRef.value.submit();
};
const handleSuccessExcel = (response) => {
  //   const that = this;
  //   if (response.code !== 200) {
  //     that.$message({
  //       message: "上传失败",
  //       type: "success",
  //       duration: 1500,
  //     });
  //   } else {
  //      message.value = `上传成功${response.data.successCount}条,上传失败${response.data.failCount}条`
  //      if(response.data.failCount > 0) {
  //         errorMsg.value = response.data.errorRecord
  //      }
  //     ElMessage({
  //       message: '操作成功',
  //       type: "success",
  //       duration: 3 * 1000,
  //     });
  //     // uploadDialog.value = false
  //   }
};

defineExpose({
  initFun,
});
</script>

<style scoped lang="less">
.editor-box {
  min-height: 200px;
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
}
.layout-form {
  overflow-y: auto;
  padding-right: 50px;
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
</style>
