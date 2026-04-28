<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn">
      <HeaderSearch
        :items="props.searchItems"
        @search="handleSearch"
        @reset="handleReset"
      >
      </HeaderSearch>
    </div>

    <base-table
      :columns="columns"
      :data="tableData"
      :height="props.height"
      show-operation
      :total="total"
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

      <!-- 操作列按钮 -->
      <template #operation="scope">
        <div>
          <el-button
            size="small"
            link
            type="primary"
            @click="infoHandler(scope.row)"
            >查看</el-button
          >
        </div>
      </template>
    </base-table>
    <userDialog
      ref="userRef"
      :dialogState="dialogVisible"
      :securityData="securityData"
      :userType="typeDialog"
      :ruleData="ruleUserData"
      :ids="ids"
      :formReadlony="true"
      :title="dialogTitle"
      :deptReadonly="true"
    ></userDialog>
    <menuDialog
      ref="menuRef"
      :dialogState="dialogVisible"
      :formReadlony="true"
      :title="dialogTitle"
    ></menuDialog>
    <deptDialog
      ref="deptRef"
      :dialogState="dialogVisible"
      :formReadlony="true"
      :title="dialogTitle"
    ></deptDialog>
    <roleDialog
      ref="roleRef"
      :userType="typeDialog"
      :dialogState="dialogVisible"
      :formReadlony="true"
      :title="dialogTitle"
    ></roleDialog>
    <dictType
      ref="typeRef"
      :dialogState="dialogVisible"
      :formReadlony="true"
      :title="dialogTitle"
    ></dictType>

    <dictKey
      ref="dictKeyRef"
      :dialogState="dialogVisible"
      :formReadlony="true"
      :title="dialogTitle"
      :height="tableHeight"
    ></dictKey>
  </div>
</template>
<script setup>
import { ref, reactive, watch, watchEffect, onMounted } from "vue";
import { storeToRefs } from "pinia";

import { auditPageList } from "@/api/examine";
import BaseTable from "@/components/BaseTable.vue";
import userDialog from "../system/module/userDialog.vue";
import menuDialog from "../system/module/menuDialog.vue";
import deptDialog from "../system/module/deptDialog.vue";
import roleDialog from "../system/module/roleDialog.vue";
import dictType from "../system/module/dictTypeDialog.vue";
import dictKey from "../system/module/dictKeyDialog.vue";

import { systemStore } from "@/stores/common.js";

const props = defineProps({
  height: {
    type: Number,
    default: () => 0,
  },
  tabName: {
    type: String,
    default: () => "wait",
  },
  searchItems: {
    type: Array,
    default: () => [],
  },
});
const myDiv = ref(null);
const tableHeight = ref(0);
const dialogVisible = ref(false);
const emit = defineEmits(["waitEvent"]);
const { securityData } = storeToRefs(systemStore()); //引入store
const dialogTitle = ref("");

const conmmonStore = systemStore();
const ruleUserData = ref([]);
const module = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 100; // 获取高度并响应式更新
  }
});
watch(
  () => props.tabName,
  (val) => {
    if (val == "fail") initData();
  }
);
const columns = ref([
  { prop: "module", label: "模块名称" },
  { prop: "description", label: "说明" },
  { prop: "createTime", label: "提交时间" },
]);

const userRef = ref(null);
const menuRef = ref(null);
const deptRef = ref(null);
const typeRef = ref(null);
const dictKeyRef = ref(null);
const typeDialog = ref("user");
const ids = ref([]);

const roleRef = ref(null);
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const tableRowData = ref({});
const tableData = ref([]);
const query = ref({
  size: 10,
  current: 1,
  auditStatus: 2,
});

const treeData = ref([]);
onMounted(() => {
  initData();
});

const initData = (params = {}) => {
  Object.assign(params, query.value);
  auditPageList(params)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;
        // emit("failEvent",res.data.total);
        conmmonStore.setTotal(3, res.data.total);
        emit("waitEvent", res.data.total);
      }
    })
    .catch((error) => {});
};

//编辑表单信息
//编辑表单信息
const infoHandler = (row) => {
  tableRowData.value = row;
  const { operParam, id } = row;
  let param = JSON.parse(operParam);
  dialogTitle.value = `${row.operationType}${row.module}`;
  if (row.moduleCode == "menu") {
    menuRef.value.inFoChange(param, false);

  } else if (row.moduleCode == "user" || row.moduleCode == "userRole") {
    if (row.moduleCode == "user") {
      // userRef.value.infoQuery(param,false);
      typeDialog.value = "user";
      userRef.value.inFoChange(param, "user", false);
    } else {
      if (row.moduleCode == "userRole") {
        ids.value = param.roleIds;

        typeDialog.value = "role";
        userRef.value.inFoChange(param, "role", false);
        roleChange(id);
      }
    }
  } else if (row.moduleCode == "dept") {
    // if (row.operationType == "新增") {
    //   deptRef.value.inFoChange(param, "1", true);
    // } else {
    //   deptRef.value.infoQuery(param,true);
    // }
    if (row.operationType == "删除") {
      // deptRef.value.infoQuery(param,true);
      deptRef.value.inFoChange(param, "1", false);
    } else {
      deptRef.value.inFoChange(param, "1", false);
    }
  } else if (row.moduleCode == "role" || row.moduleCode == "roleMenu") {
    if (row.moduleCode == "role") {
      typeDialog.value = "role";
      if (row.operationType == "删除") {
        // roleRef.value.infoQuery(param,true);
        roleRef.value.inFoChange(param, "role", false);
      } else {
        roleRef.value.inFoChange(param, "role", false);
      }
    } else {
      typeDialog.value = "roleMenu";
      roleRef.value.inFoChange(param, "roleMenu", false);
    }
  } else if (row.moduleCode == "dictType") {
    if (row.operationType == "删除") {
      typeRef.value.inFoChange(param, "1", false);
    } else {
      typeRef.value.inFoChange(param, "1", false);
    }
  } else if (row.moduleCode == "dictData") {
    dictKeyRef.value.inFoChange(param, "1", false);
  } else {
    ElMessage({
      message: "数据未匹配",
      type: "warning",
      duration: 1 * 1000,
    });
  }
};
//分配角色
const roleChange = (row) => {
  ruleFormId.value = row.id;
  getUserList().then((res) => {
    if (res.code == 200) {
      ruleUserData.value = res.data;
      // getRoleList(row.id);
    }
  });
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  const params = {
    module: module.value,
  };
  initData(params);
};
const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数

  const params = {
    module: module.value,
  };
  initData(params);
};

const handleSearch = (value) => {
  module.value = value.module;
  query.value.current = 1;
  initData(value);
};
const handleReset = () => {
  initData();
};
</script>

<style lang="less" scoped>
  @import '@/assets/css/examine.less';

</style>
