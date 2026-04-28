<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn" ref="searchRef">
      <HeaderSearch
        :items="searchItems"
        :default-params="defaultParams"
        @search="handleSearch"
        @reset="handleReset"
        @select="handlerSelect"
        :rowSpan="rowSpan"
        :showButton="true"
        searchWidth="70%"
      >
        <template v-slot:click>
          <el-button type="primary" size="small" @click="addDeptHandler"
            >新增</el-button
          >
          <el-button type="primary" size="small" @click="uploadDialog = true"
            >题目导入</el-button
          >
          <el-button type="primary" size="small" @click="downloadExcel"  v-auth
            >题目导出</el-button
          >
          <el-button type="primary" size="small" @click="downloadHandler"
            >模板下载</el-button
          >
        </template>
      </HeaderSearch>
    </div>
    <div class="table-box">
      <base-table
        :columns="columns"
        :data="tableData"
        :height="tableHeight"
        show-operation
        :total="total"
        :pagination="true"
        :loading="tableLoading"
        @size-change="sizeChange"
        @current-change="currentChange"
        :currentPage="query.current"
      >
        <!-- 自定义状态列 -->
        <template #status="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
            {{ scope.row.status === "1" ? "启用" : "禁用" }}
          </el-tag>
        </template>
        <template #type="scope">
          <span>{{ filterSecurity(scope.row.type) }}</span>
        </template>
        <template #sourceCode="scope">
          <span>{{ filterSource(scope.row.sourceCode) }}</span>
        </template>

        <!-- 操作列按钮 -->
        <template #operation="scope">
          <div v-if="childId !== '1'">
            <el-button
              size="small"
              link
              type="primary"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              link
              type="danger"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </div>
        </template>
      </base-table>
    </div>
    <importDialog
      ref="dialogRef"
      @childEvent="updateData"
      :dialogState="dialogVisible"
      :tree="treeData"
      :topicType="topicType"
      :questionFileData="questionFileData"
    ></importDialog>
    <BaseDialog
      v-model="uploadDialog"
      title="文件导入"
      @confirm="closeDialog"
      @close="closeDialog"
      :confirmLoading="dialogLoading"
      width="30%"
    >
      <h5>上传模板文件（ <span>仅支持上传.xlsx,.xls,.et文件</span>）</h5>
      <el-upload
        v-model:file-list="fileList"
        class="upload-demo"
        :action="action"
        multiple
        :on-preview="handlePreview"
        :headers="headers"
        :on-success="handleSuccessExcel"
        :on-change="handleChange"
        accept=".xlsx,.xls,.et"
      >
        <el-button type="primary">点击上传</el-button>
        <template #tip>
          <div class="el-upload__tip">
            <!-- jpg/png files with a size less than 500KB. -->
          </div>
        </template>
      </el-upload>
      <div v-if="exportMsg">
        <p>导入成功：{{ successCount }}</p>
        <p>导入失败：{{ failCount }}</p>
        <el-button
          v-if="errorMsg"
          type="primary"
          @click="errorHandler"
          size="small"
          >错误报告</el-button
        >
      </div>
      <template #footer>
        <slot name="footer">
          <div class="footer-btn">
            <span class="dialog-footer">
              <el-button @click="closeDialog" type="primary"> 关闭 </el-button>
            </span>
          </div>
        </slot>
      </template>
    </BaseDialog>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted, inject, computed } from "vue";
import { pageListApi, questiondelete, categoryTreeApi } from "@/api/topic";
import { systemStore } from "@/stores/common.js";
import { ElLoading } from "element-plus";

import BaseTable from "@/components/BaseTable.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";
import importDialog from "./module/importDialog.vue";
import { getToken } from "@/utils/auth";
import { getCurrentFormattedTime } from "@/utils/dateFormat";

import BaseDialog from "@/components/BaseDialog.vue";
const $loading = inject("$loading"); // 注入全局 Loading
const rowSpan = ref(8);
const myDiv = ref(null);
const tableHeight = ref(0);
const countHeight = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
const handleReset = () => {
  searchStatus.value = true;
};
const uploadDialog = ref(false);
const dialogRef = ref(null);
const successCount = ref(0);
const failCount = ref(0);
const errorFileName = ref("");
const searchRef = ref("");
const headers = ref({
  Authorization: getToken(), //headers属性中添加token，这个属性是el-upload自带的用来设置上传请求头部
});
let { questionFileData } = systemStore(); //引入store
const questionData = computed(() => {
  return questionFileData.map((item) => {
    return {
      value: item.valueCode,
      label: item.valueName,
    };
  });
});
const errorMsg = ref("");
const exportMsg = ref("");
const searchParams = ref({
  size: 10,
  current: 1,
});
const treeData = reactive([]);
const searchStatus = ref(true);
watchEffect(() => {
  if (myDiv.value && searchStatus.value) {
    tableHeight.value = myDiv.value.clientHeight - 150; //
    countHeight.value = tableHeight.value;
  }
});
const columns = ref([
  { prop: "title", label: "题干" },
  { prop: "sourceCode", label: "题目所属文件", slot: "sourceCode" },
  { prop: "type", label: "题目类型", slot: "type" },
  { prop: "categoryName", label: "分类名称" },
  { prop: "createUserName", label: "创建人" },
]);

const topicType = ref([
  {
    value: "1",
    label: "单选题",
  },

  {
    value: "2",
    label: "多选题",
  },
  {
    value: "3",
    label: "判断题",
  },
  {
    value: "4",
    label: "填空题",
  },
]);
const searchItems = ref([
  {
    type: "input",
    prop: "title",
    label: "题干",
  },

  {
    type: "select",
    prop: "types",
    label: "题目类型",
    multiple: true,
    options: [
      {
        value: "1",
        label: "单选题",
      },

      {
        value: "2",
        label: "多选题",
      },
      {
        value: "3",
        label: "判断题",
      },
      {
        value: "4",
        label: "填空题",
      },
    ],
  },
  {
    type: "select",
    prop: "sourceCodeList",
    label: "题目所属文件",
    multiple: true,
    options: questionData,
  },
  {
    type: "el-tree-select",
    prop: "categoryIds",
    label: "题目分类",
    multiple: true,
    options: [],
    defaultProps: {
      children: "children",
      label: "name",
      value: "id",
    },


    width: "300",
    showCheckbox: true,
    defaultExpandAll: true,
  },
  {
    type: "input",
    prop: "option",
    label: "题目选项",
  },
]);
const defaultParams = ref({});

const handlePreview = (uploadFile) => {};
const fileList = ref([]);

const total = ref(null);
let tableData = ref([]);
let childId = ref("0");
const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
const action = apiUrl.value + "/business/question/importQuestions";
const excelLoading = ref(false);
const query = ref({
  size: 10,
  current: 1,
});
onMounted(() => {
  getDeptTree();
  initData();
});
const getDeptTree = () => {
  const id = 0;
  categoryTreeApi(id).then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
      searchItems.value[3].options = treeData;
    }
  });
};
const initData = (params = {}) => {
  // $loading.open({ text: '加载中...' })
  tableLoading.value = true;

  Object.assign(params, query.value);
  pageListApi(params)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;

        total.value = res.data.total;
      }
      tableLoading.value = false;
    })
    .catch((error) => {
      tableLoading.value = false;
    });
};

const addDeptHandler = () => {
  dialogRef.value.initChange({});
  setTimeout(() => {}, 2000);
};
const downloadHandler = () => {
  let url =
    apiUrl.value + "/business/question/templateDownload?fileName=试题模板.xlsx";
  downloadFileWithToken(url, "试题模板.xlsx", "GET");
};

const downloadExcel = () => {
  const fileName = "试题导出-" + getCurrentFormattedTime() + ".xlsx";
  let url = apiUrl.value + "/business/question/exportQuestion";
  console.log(url);
  const params = searchParams.value;
  // if(JSON.stringify(params) == '{}') {
  //   params = {
  //     size:10,
  //     current:1
  //   }
  // }
  downloadFileWithToken(url, fileName, "POST", params);
};
const errorHandler = () => {
  let url = apiUrl.value + errorMsg.value;
  downloadFileWithToken(url, errorFileName.value, "GET");
};
const downloadFileWithToken = (url, name, type, params) => {
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  console.log(params);
  const xhr = new XMLHttpRequest();
  xhr.open(type, url, true);
  xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`); // 设置Token头
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.responseType = "blob"; // 关键：指定响应类型为二进制流
  xhr.onload = function () {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = name; // 设置默认文件名
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(downloadUrl); // 释放内存
      loading.close();
    } else {
      ElMessage({
        message: "下载失败",
        type: "error",
        duration: 3 * 1000,
      });
      loading.close();
    }
  };

  if (params) {
    xhr.send(JSON.stringify(params));
  } else {
    xhr.send();
  }
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];
  initData(searchParams.value);
};
const currentChange = (val) => {
  console.log(query.value.size);
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  tableData.value = [];
  initData(searchParams.value);
};
const filterSecurity = (value) => {
  let val = "";
  if (value) {
    const { label } = topicType.value.find((item) => item.value == value);
    val = label;
  }
  return val;
};

const filterSource = (value) => {
  let val = "";
  if (value && questionFileData.length > 0) {
    const { valueName } = questionFileData.find(
      (item) => item.valueCode == value
    );
    val = valueName;
  }
  return val;
};
//删除数据
const handleDelete = (row) => {
  const { id } = row;
  ElMessageBox.confirm("是否要删除数据?", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const loading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      questiondelete(id)
        .then((res) => {
          if (res.code == 200) {
            ElMessage({
              message: "操作成功",
              type: "success",
              duration: 3 * 1000,
            });
            loading.close();
            childId.value = "0";
            initData(searchParams.value);
          }
        })
        .catch((error) => {
          loading.close();
        });
    })
    .catch(() => {});
};
//编辑表单信息
const handleEdit = (row) => {
  const { id } = row;
  const obj = {
    rowId: id,
  };
  dialogRef.value.initChange(obj);
};
const handleChange = () => {
  fileList.value = fileList.value.slice(-1);
};
const handleSuccessExcel = (response) => {
  if (response.code !== 200) {
    ElMessage({
      message: response.msg,
      type: "error",
      duration: 1500,
    });
  } else {
    exportMsg.value = `上传成功${response.data.successCount}条,上传失败${response.data.failCount}条`;
    successCount.value = response.data.successCount;
    failCount.value = response.data.failCount;
    errorFileName.value = response.data.errorFileName;
    if (response.data.failCount > 0) {
      errorMsg.value = response.data.errorRecord;
    }
    ElMessage({
      message: "操作成功",
      type: "success",
      duration: 3 * 1000,
    });
  }
};
const updateData = (val) => {
  initData(searchParams.value);
};
const closeDialog = () => {
  initData();
  uploadDialog.value = false;
  fileList.value = [];
  errorMsg.value = "";
  exportMsg.value = "";
  successCount.value = 0;
  failCount.value = 0;
};
const handleSearch = (value) => {
  searchParams.value = value;
  query.value.current = 1;
  initData(value);
};
const computedHeight = computed(() => {
  const height = searchRef.value.clientHeight;
});
const handlerSelect = () => {
  const height = searchRef.value.clientHeight;
  searchStatus.value = false;

  if (height > 90) {
    const h = height - 60;
    tableHeight.value = countHeight.value - h;
  } else {
    tableHeight.value = countHeight.value;
  }
};
</script>

<style lang="less">
@import "@/styles/system.css";
// .upload-demo{
//   display: flex;
//   justify-content: center;
//   flex-direction: column;
// }
h5 span {
  color: #f56c6c;
}
</style>
