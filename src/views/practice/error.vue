<template>
  <div class="main-container" ref="myDiv">
    <!-- <div class="container-btn" v-if="!showErrorExam"> -->
    <!-- <HeaderSearch
          :items="searchItems"
          :default-params="defaultParams"
          @search="handleSearch"
          @reset="handleReset"
        > -->
    <!-- <template v-slot:click>
            <el-button type="primary" size="small" @click="addDeptHandler"
              >新增</el-button
            >
          </template> -->
    <!-- </HeaderSearch> -->
    <!-- </div> -->
    <div class="table-box" v-if="!showErrorExam">
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
        :operationWidth="200"
      >
        <!-- 操作列按钮 -->
        <template #operation="scope">
          <div v-if="childId !== '1'">
            <!-- <el-button
                size="small"
                link
                type="primary"
                @click="handleEdit(scope.row)"
                >编辑</el-button
              > -->
            <el-button
              size="small"
              link
              type="success"
              @click="showErrorChange(scope.row)"
              >继续练习</el-button
            >
          </div>
        </template>
      </base-table>
    </div>
    <div v-if="showErrorExam">
      <ExamComponents
        :height="layoutHeight"
        @childEvent="closeExamHandler"
        :categoryId="rowId"
      ></ExamComponents>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import { WrongPageListApi } from "@/api/practice";
import ExamComponents from "@/components/examCompontntsPage/ExamComponents.vue";

import BaseTable from "@/components/BaseTable.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";
import { getToken } from "@/utils/auth";
import { ElLoading } from "element-plus";

const myDiv = ref(null);
const tableHeight = ref(0);
const layoutHeight = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
const handleSearch = () => {};
const handleReset = () => {};
const uploadDialog = ref(false);
const dialogRef = ref(null);
const message = ref("");
const showErrorExam = ref(false);
const rowId = ref("");
const columns = ref([
  { prop: "categoryName", label: "类别" },
  { prop: "total", label: "数量" },
]);

const errorMsg = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 60; //
    layoutHeight.value = myDiv.value.clientHeight - 30; //
  }
});

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
    prop: "keyword",
    label: "关键词",
  },
]);
const defaultParams = ref({
  status: "1",
});
const treeRef = ref(); // 获取树组件的引用

const addDialog = ref();

const submitData = ref({
  moduleCode: "dept",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const treeData = reactive([]);

const beforeRemove = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `Cancel the transfer of ${uploadFile.name} ?`
  ).then(
    () => true,
    () => false
  );
};

const handlePreview = (uploadFile) => {};
const fileList = ref([]);
const defaultProps = {
  children: "children",
  label: "name",
};
const loading = ref(false);
const parentName = ref("根节点"); //父级菜单名称
const total = ref(null);
let tableData = ref([]);
let childId = ref("0");

const query = ref({
  size: 10,
  current: 1,
});
onMounted(() => {
  initData();
});

const initData = (params = {}) => {
  tableLoading.value = true;


  Object.assign(params, query.value);
  WrongPageListApi(params)
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

const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];

  initData();
};

const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  tableData.value = [];
  initData();
};

//编辑表单信息
const showErrorChange = (row) => {
  rowId.value = row.categoryId;
  showErrorExam.value = true;
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  setTimeout(() => {
    loading.close();
  }, 500);
};

//退出练习
const closeExamHandler = () => {
  showErrorExam.value = false;
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  setTimeout(()=>{
    loading.close()
  },500)
  initData();
};
</script>

<style lang="less">
@import "@/styles/system.css";
</style>
