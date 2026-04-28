<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn" v-if="!showErrorExam">
      <HeaderSearch
        :items="searchItems"
        :default-params="defaultParams"
        @search="handleSearch"
        @reset="handleReset"
      >
        <!-- <template v-slot:click>
          <el-button type="primary" size="small" @click="addChange"
            >新增</el-button
          >
        </template> -->
      </HeaderSearch>
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
        <template #security="scope">
          <span>{{ filterSecurity(scope.row.security) }}</span>
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
      </base-table>
    </div>
    <div v-if="showErrorExam">
      <knowledge-page
        :height="layoutHeight"
        ref="dialogRef"
        :securityData="documentSecurityData"
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
  computed,
  watch,
} from "vue";
import { storeToRefs } from "pinia";

import { selfArticlePageListApi, releaseApi, deleteApi } from "@/api/knowledge";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import KnowledgePage from "@/components/KnowledgePage.vue";
import { systemStore } from "@/stores/common.js";

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
const typeCode = ref("");

const uploadDialog = ref(false);
const dialogRef = ref(null);
const message = ref("");
const showErrorExam = ref(false);
const rowId = ref("");
const columns = ref([
  { prop: "title", label: "标题", slot: "title" },
  { prop: "typeCode", label: "资料类别", slot: "typeCode" },

  { prop: "security", label: "密级", slot: "security" },
  { prop: "releaseTime", label: "发布时间" },
  { prop: "createUserName", label: "录入人" },
]);

const errorMsg = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 115; //
    layoutHeight.value = myDiv.value.clientHeight - 68; //
  }
});
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
  releaseStatus: 0,
});
watch(
  () => route.query,
  async (val) => {
    console.log(val);

    if (val) {
      console.log(val);
      if (JSON.stringify(val) !== "{}") {
        serchTitle.value = val.serchTitle ? val.serchTitle : "";
        typeCode.value = val.typeCode ? val.typeCode : "";
        const params = {
          title: serchTitle.value,
          typeCode: typeCode.value,
        };
        await nextTick();
        defaultParams.value.title = serchTitle.value;
        defaultParams.value.typeCode = typeCode.value;
        await initData(params)
      }else {
        await nextTick();
        await initData()

      }
    }
  },
  { immediate: true }
);
onMounted(() => {
  // initData();
});

const openPage = (row) => {
  const origin = window.location.origin;

  window.open(origin + "/#/preview?id=" + row, "_blank");
};
const initData = (params = {}) => {
  console.log("12121");
  tableLoading.value = true;
  Object.assign(params, query.value);
  selfArticlePageListApi(params)
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
//搜索
const handleSearch = (value) => {
  console.log(value);

  searchTitle.value = value.title;
  typeCode.value = value.typeCode;
  query.value.current = 1;
  const params = {
    title: searchTitle.value,
    typeCode: typeCode.value,
  };
  initData(params);
};
const handleReset = () => {
  router.replace({
    name: route.name,
    params: {},
    query: {},
  });
  serchTitle.value = "";
  typeCode.value = "";

  const params = {
    title: serchTitle.value,
    typeCode: typeCode.value,
  };
  initData(params);
  defaultParams.value.title = "";
  defaultParams.value.typeCode = "";

};

const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  const params = {
    title: searchTitle.value,
    typeCode: typeCode.value,
  };
  initData(params);
};
const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;//关闭重置每页条数
  const params = {
    title: searchTitle.value,
    typeCode: typeCode.value,
  };
  initData(params);
};
const addChange = async () => {
  showErrorExam.value = true;
};
//编辑表单信息
//回调
const closeExamHandler = async () => {
  showErrorExam.value = false;
  initData();
};
</script>

<style lang="less">
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
