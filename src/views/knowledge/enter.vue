<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn" v-if="!showErrorExam">
      <HeaderSearch
        :items="searchItems"
        :default-params="defaultParams"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template v-slot:click>
          <el-button type="primary" size="small" @click="addChange"
            >新增</el-button
          >
        </template>
      </HeaderSearch>
    </div>
    <!-- <el-tag type="danger" effect="dark"
            >剩余时间: {{ formattedTime }}</el-tag
          > -->
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
        <template #security="scope">
          <span class="cell-title">{{
            filterSecurity(scope.row.security)
          }}</span>
        </template>
        <template #typeCode="scope">
          <span class="cell-title">{{
            filterTypeCode(scope.row.typeCode)
          }}</span>
        </template>

        <template #title="scope">
          <el-button link class="scope-color" @click="openPage(scope.row.id)">
            {{ scope.row.title }}
          </el-button>
        </template>
        <!-- 操作列按钮 -->
        <template #operation="scope">
          <div v-if="childId !== '1'">
            <el-button
              size="small"
              link
              type="success"
              @click="showErrorChange(scope.row)"
              >编辑</el-button
            >

            <el-button
              size="small"
              link
              type="primary"
              v-if="scope.row.releaseStatus == 0"
              @click="releaseChange(scope.row, 1)"
              >发布</el-button
            >
            <el-button
              size="small"
              link
              type="danger"
              @click="deleteChnage(scope.row)"
              >删除</el-button
            >
          </div>
        </template>
      </base-table>
    </div>
    <div v-if="showErrorExam">
      <knowledge-page
        :height="layoutHeight"
        ref="dialogRef"
        :securityData="documentSecurityData"
        :studyTypeData="setStudyTypeData"
        @childChange="closeExamHandler"
        :categoryId="rowId"
      ></knowledge-page>
    </div>
  </div>
</template>
<script setup>
import {
  ref,
  reactive,
  watchEffect,
  onMounted,
  nextTick,
  onUnmounted,
  computed,
} from "vue";
import { ElLoading } from "element-plus";

import {
  pageListWithConditionApi,
  releaseApi,
  deleteApi,
} from "@/api/knowledge";
import KnowledgePage from "@/components/KnowledgePage.vue";
import BaseTable from "@/components/BaseTable.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";
import { storeToRefs } from "pinia";
import { systemStore } from "@/stores/common.js";

const myDiv = ref(null);
const tableHeight = ref(0);
const layoutHeight = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
const serchTitle = ref("");
const typeCode = ref("");

//搜索
const handleSearch = (value) => {
  serchTitle.value = value.title;
  typeCode.value = value.typeCode;
  query.value.current = 1;
  const params = {
    title: serchTitle.value,
    typeCode: typeCode.value,
  };
  initData(params);
};
const handleReset = () => {
  serchTitle.value = "";
  typeCode.value = "";

  const params = {
    title: serchTitle.value,
    typeCode: typeCode.value,
  };
  initData(params);

};

const dialogRef = ref(null);
const showErrorExam = ref(false);
const rowId = ref("");
const columns = ref([
  { prop: "title", label: "标题", slot: "title" },
  { prop: "typeCode", label: "资料类别", slot: "typeCode" },

  { prop: "security", label: "密级", slot: "security" },
  { prop: "createTime", label: "录入时间" },
  { prop: "createUserName", label: "录入人" },
]);

const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);

const action = apiUrl.value + "/business/question/importQuestions";
const errorMsg = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 115; //
    layoutHeight.value = myDiv.value.clientHeight - 68; //
  }
});
const { documentSecurityData } = storeToRefs(systemStore()); //引入store
const { setStudyTypeData } = storeToRefs(systemStore()); //引入store

const StudyTypeData = computed(() => {
  return setStudyTypeData.value.map((item) => {
    return {
      value: item.valueCode,
      label: item.valueName,
    };
  });
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
    prop: "title",
    label: "标题",
  },
  {
    type: "select",
    prop: "typeCode",
    label: "资料类别",
    options: StudyTypeData,
  },
]);

const defaultParams = ref({
  title: "",
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

const remainingTime = ref(60 * 60); // 10 分钟（单位：秒）
const endTime = ref(Date.now() + remainingTime.value * 1000); // 结束时间戳
let timer = null;
const query = ref({
  size: 10,
  current: 1,
  releaseStatus: 0,
});
onMounted(() => {
  initData();
  // updateRemainingTime(); // 立即更新一次
  // timer = setInterval(updateRemainingTime, 1000)
});

onUnmounted(() => {
  clearInterval(timer);
});
// 格式化时间显示
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
});
const updateRemainingTime = () => {
  const now = Date.now();
  remainingTime.value = Math.max(0, Math.round((endTime.value - now) / 1000));
  if (remainingTime.value <= 0) {
    clearInterval(timer);
    // 倒计时结束后的逻辑
  }
};
const openPage = (row) => {

  const { origin } = new URL(window.location.href);
  window.open(origin + "/#/preview?id=" + row);
};
const initData = (params = {}) => {
  Object.assign(params, query.value);
  tableLoading.value = true;
  pageListWithConditionApi(params)
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
const filterSecurity = (value) => {
  let val = "";
  if (String(value) && documentSecurityData.value.length > 0) {
    const { valueName } = documentSecurityData.value.find(
      (item) => item.valueCode == String(value)
    );
    val = valueName;
  }
  return val;
};
const filterTypeCode = (value) => {
  let val = "";
  if (value && String(value) && setStudyTypeData.value.length > 0) {
    const { valueName } = setStudyTypeData.value.find(
      (item) => item.valueCode == String(value)
    );
    val = valueName;
  }
  return val;
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];
  const params = {
    title: serchTitle.value,
    typeCode: typeCode.value,
  };
  initData(params);
};

const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10; //关闭重置每页条数
  tableData.value = [];
  const params = {
    title: serchTitle.value,
    typeCode: typeCode.value,
  };
  initData(params);
};
const addChange = async () => {
  showErrorExam.value = true;
};
//编辑表单信息
const showErrorChange = async (row) => {
  const { id } = row;
  rowId.value = row.categoryId;
  showErrorExam.value = true;
  await nextTick(); // 等待DOM更新完成

  dialogRef.value.initFun(id);
};

const deleteChnage = (row) => {
  const { id } = row;
  ElMessageBox.confirm("是否要删除数据?", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const loading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      deleteApi(id)
        .then((res) => {
          if (res.code == 200) {
            ElMessage({
              message: "操作成功",
              type: "success",
              duration: 3 * 1000,
            });
            loading.close();
            const params = {
                title: serchTitle.value,
                typeCode: typeCode.value,
              };
            initData(params);
          }
        })
        .catch((error) => {
          loading.close();
        });
      // ElMessage({
      //   type: 'success',
      //   message: 'Delete completed',
      // })
    })
    .catch(() => {
      loading.close();
    });
};

const releaseChange = (row, state) => {
  const { id } = row;

  const params = {
    releaseStatus: state,
    id: id,
  };
  ElMessageBox.confirm("确定发布？", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const loading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      releaseApi(params).then((res) => {
        ElMessage({
          message: "操作成功",
          type: "success",
          duration: 3 * 1000,
        });
        loading.close();
        initData();
      });
    })
    .catch(() => {
      loading.close();
    });
};

//退出练习
const closeExamHandler = async () => {
  showErrorExam.value = false;
  initData();
};
</script>

<style lang="less" scoped>
@import "@/styles/system.css";
.table-box .scope-color {
  color: #409eff !important;
  line-height: 23px;
  overflow: hidden;
  overflow-wrap: break-word;
  padding: 0 12px;
  text-overflow: ellipsis;
  white-space: normal;
}
</style>
