<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn" v-if="showExam == 1">
      <HeaderSearch
        :items="searchItems"
        :rowSpan="rowSpan"
        :default-params="defaultParams"
        @search="handleSearch"
        @reset="handleReset"
      >
      </HeaderSearch>
    </div>
    <div class="table-box" v-if="showExam == 1">
      <base-table
        :columns="columns"
        :data="tableData"
        :height="tableHeight"
        :total="total"
        :pagination="true"
        :loading="tableLoading"
        @size-change="sizeChange"
        @current-change="currentChange"
        :currentPage="query.current"
        show-operation
      >
        <!-- 自定义状态列 -->
        <template #status="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
            {{ scope.row.status === "1" ? "启用" : "禁用" }}
          </el-tag>
        </template>

        <template #accuracy="scope">
          <span style="color: #67c23a">{{ scope.row.accuracy }}</span>
        </template>

        <template #type="scope">
          <span>{{ filterSecurity(scope.row.type) }}</span>
        </template>
        <!-- 操作列按钮 -->
        <template #operation="scope">
          <el-button
            size="small"
            v-if="scope.row.questionCount > 0"
            link
            type="primary"
            @click="releaseChange(scope.row)"
            >查看</el-button
          >
        </template>
      </base-table>
    </div>
    <exam-history
      @childChange="closeChange"
      :examDetails="examRow"
      v-if="showExam == 2"
      isGetAll="2"
      role="practice"
    />
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import { practicePageHistoryApi } from "@/api/practice";

import BaseTable from "@/components/BaseTable.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";

import { getToken } from "@/utils/auth";
import ExamHistory from "@/components/examCompontntsPage/ExamHistory.vue";
const myDiv = ref(null);
const tableHeight = ref(0);
const tableLoading = ref(false); //table数据loading
const uploadDialog = ref(false);
const dialogRef = ref(null);
const message = ref("");
const quertStartTime = ref("");
const queryEndTime = ref("");
const errorMsg = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 110; //
  }
});
const columns = ref([
  { prop: "categoryNames", label: "题目分类" },
  { prop: "startTime", label: "开始时间" },
  { prop: "endTime", label: "结束时间" },
  { prop: "duration", label: "练习时长" },
  { prop: "correntCount", label: "答对题数" },
  { prop: "questionCount", label: "题目总数" },
  { prop: "accuracy", label: "正确率", slot: "accuracy" },
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
    type: "daterange",
    prop: "time",
    label: "时间搜索",
  },
]);
const defaultParams = ref({
  status: "1",
});

const showExam = ref(1);
const examRow = ref({});

const handleSearch = (value) => {
  const { timeStart, timeEnd } = value;
  quertStartTime.value = timeStart;
  queryEndTime.value = timeEnd;
  const params = {
    queryStartTime: quertStartTime.value,
    queryEndTime: queryEndTime.value,
  };
  query.value.current = 1;

  initData(params);
};
const handleReset = () => {
  quertStartTime.value = "";
  queryEndTime.value = "";
  const params = {
    queryStartTime: quertStartTime.value,
    queryEndTime: queryEndTime.value,
  };
  initData(params);
};
const beforeRemove = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `Cancel the transfer of ${uploadFile.name} ?`
  ).then(
    () => true,
    () => false
  );
};

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
const rowSpan = ref(12);
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
  practicePageHistoryApi(params)
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
};

const downloadFileWithToken = (url) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`); // 设置Token头
  xhr.responseType = "blob"; // 关键：指定响应类型为二进制流

  xhr.onload = function () {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "试题模板.xlsx"; // 设置默认文件名
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(downloadUrl); // 释放内存
    }
    xhr.send();
  };

  xhr.send();
};

const handleNodeClick = (data) => {
  childId.value = data.id;
  parentName.value = data.name;
  getDeptData();
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];
  const params = {
    queryStartTime: quertStartTime.value,
    queryEndTime: queryEndTime.value,
  };
  initData(params);
};

const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  tableData.value = [];
  const params = {
    queryStartTime: quertStartTime.value,
    queryEndTime: queryEndTime.value,
  };
  initData(params);
};
const filterSecurity = (value) => {
  let val = "";
  if (value) {
    const { label } = topicType.value.find((item) => item.value == value);
    val = label;
  }
  return val;
};
const closeChange = () => {
  showExam.value = 1;
  initData();
};
//编辑表单信息
const releaseChange = (row) => {
  // tableRef.value.initChange(row.id, "record");
  examRow.value = row;
  row.userExamId = row.id;
  showExam.value = 2;
};
</script>

<style lang="less">
@import "@/styles/system.css";
.main-container{
  background: #f0f2f5;
}
</style>
