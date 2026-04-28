<template>
  <div class="feedback-container" ref="myDiv">
    <div class="container-btn" v-if="!showErrorExam">
      <HeaderSearch
        :items="searchItems"
        :default-params="defaultParams"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template v-slot:click>
          <el-button type="primary" size="small" @click="feedBackChange"  v-if="!feedBackStatus"
            >新增</el-button
          >
        </template>
      </HeaderSearch>
      <div>
      </div>
    </div>
    <div class="table-box" v-if="!showErrorExam">
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
      >
        <template #title="scope">
          <el-button link class="scope-color" @click="openPage(scope.row.id)">
            {{ scope.row.title }}
          </el-button>
        </template>
        <template #isReply="scope">
          <span v-if="scope.row.isReply" style="color:#67C23A">已回复</span>
          <span v-else style="color:#909399">未回复</span>

        </template>
      </base-table>
    </div>
    <div v-if="showErrorExam">
      <feedBack-page
        :height="layoutHeight"
        ref="dialogRef"
        @childChange="closeExamHandler"
        :feedBackId="rowId"
        :hasFeedBack="feedBackStatus"
      ></feedBack-page>
    </div>
  </div>
</template>
<script setup>
import {
  ref,
  reactive,
  watchEffect,
  onMounted,
} from "vue";
import { storeToRefs } from "pinia";
import { pageListWithCondition } from "@/api/feedBack";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import FeedBackPage from "@/components/module/FeedBackPage.vue";
import { systemStore } from "@/stores/common.js";
import { userStore } from "@/stores/user.js";

import BaseTable from "@/components/BaseTable.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";
import { getToken } from "@/utils/auth";

const { documentSecurityData } = storeToRefs(systemStore()); //引入store
const { setStudyTypeData } = storeToRefs(systemStore()); //引入store

const myDiv = ref(null);
const tableHeight = ref(0);
const layoutHeight = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading

const searchTitle = ref("");
const isReply = ref("");

const uploadDialog = ref(false);
const dialogRef = ref(null);
const message = ref("");
const showErrorExam = ref(false);
const rowId = ref("");
const columns = ref([
  { prop: "title", label: "描述", slot: "title" },
  { prop: "isReply", label: "是否回复", slot: "isReply" },
  { prop: "createUserName", label: "创建人",  },
  { prop: "createTime", label: "创建时间",  },
]);
const { feedBackStatus } = storeToRefs(userStore()); //引入store   判断当前的意见反馈权限

const errorMsg = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 205; //
    layoutHeight.value = myDiv.value.clientHeight - 80; //
  }
});
const StudyTypeData = [
  {
    value: "1",
    label: "已回复",
  },

  {
    value: "0",
    label: "未回复",
  },
];
const searchItems = ref([
  {
    type: "input",
    prop: "title",
    label: "描述",
  },
  {
    type: "select",
    prop: "isReply",
    label: "是否回复",
    options: StudyTypeData,
  },
]);
const defaultParams = ref({
  title: "",
  typeCode: null,
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

const fileList = ref([]);
const defaultProps = {
  children: "children",
  label: "name",
};
const serchTitle = ref("");

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

const openPage = (id) => {
  rowId.value = id
  showErrorExam.value = true;

};
const initData = (params = {}) => {
  tableLoading.value = true;
  Object.assign(params, query.value);
  console.log(params);

  pageListWithCondition(params)
    .then((res) => {
      if (res.code == 200 && res.data.records.length > 0) {
        tableData.value = res.data.records;

        total.value = res.data.total;
      } else {
        tableData.value = [];
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
//搜索
const handleSearch = (value) => {
  console.log(value);

  searchTitle.value = value.title;
  isReply.value = value.isReply;
  query.value.current = 1;
  const params = {
    title: searchTitle.value,
    isReply: isReply.value,
  };
  console.log(params);
  initData(params);
};
const handleReset = () => {
  router.replace({
    name: route.name,
    params: {},
    query: {},
  });
  serchTitle.value = "";
  isReply.value = "";

  const params = {
    title: serchTitle.value,
    isReply: isReply.value,
  };
  initData(params);
  defaultParams.value.title = "";
  defaultParams.value.isReply = "";

};

const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  const params = {
    title: searchTitle.value,
    isReply: isReply.value,
  };
  initData(params);
};
const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  const params = {
    title: searchTitle.value,
    isReply: isReply.value,
  };
  initData(params);
};
const feedBackChange = async () => {
  rowId.value = ""
  showErrorExam.value = true;
};
//编辑表单信息
//回调
const closeExamHandler = async () => {
  showErrorExam.value = false;
  initData();
};
</script>

<style lang="less" scoped>
@import "@/styles/system.css";
.table-box{
  justify-content: center;
}
.base-table-container{
}
.table-box .scope-color {
  color: #409eff !important;
  line-height: 23px;
  overflow: hidden;
  overflow-wrap: break-word;
  padding: 0 12px;
  text-overflow: ellipsis;
  white-space: normal;
}
.feedback-container{
  padding: 1vw;
  box-sizing: border-box;
  height: 100%;
}
</style>
