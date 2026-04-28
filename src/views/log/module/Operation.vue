<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn">
      <HeaderSearch
        :items="searchItems"
        :rowSpan="rowSpan"
        :default-params="defaultParams"
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

      <template #auditStatus="scope">
        <span>{{ filterAuditStatus(scope.row.auditStatus) }}</span>
      </template>
      <!-- 操作列按钮 -->
      <template #operation="scope">
        <div>
          <el-button
            size="small"
            link
            type="info"
            @click="detailsChange(scope.row)"
            v-if=" props.queryType == 1"
            >查看</el-button
          >
          <el-button
            size="small"
            link
            type="info"
            @click="infoHandler(scope.row)"
            v-else
            >查看</el-button
          >


        </div>
      </template>
    </base-table>
    <userDialog
      ref="userRef"
      :securityData="securityData"
      :userType="typeDialog"
      :ruleData="ruleUserData"
      :ids="ids"
      :formReadlony="true"
    ></userDialog>
    <menuDialog
      ref="menuRef"
      :formReadlony="true"
    ></menuDialog>
    <deptDialog
      ref="deptRef"
      :formReadlony="true"
    ></deptDialog>
    <roleDialog
      ref="roleRef"
      :userType="typeDialog"
      :formReadlony="true"
    ></roleDialog>
    <DetailsDialog  ref="detailsRef" ></DetailsDialog>
  </div>
</template>
<script setup>

import { ref, reactive, watchEffect, onMounted, watch, nextTick } from "vue";
import {
  pageListOperLogApi,
  pageListAdminLogApi,
  pageListAuditLogApi,
} from "@/api/syslog";
import { systemStore } from "@/stores/common.js";
import BaseTable from "@/components/BaseTable.vue";
import { storeToRefs } from "pinia";
import userDialog from "@/views/system/module/userDialog.vue";
import menuDialog from "@/views/system/module/menuDialog.vue";
import deptDialog from "@/views/system/module/deptDialog.vue";
import roleDialog from "@/views/system/module/roleDialog.vue";
import DetailsDialog from "./DetailsDialog.vue";

const props = defineProps({
  height: Number,
  likes: Number,
  queryType: String,
  columns: Array,
});
const searchItems = ref([
  {
    type: "daterange",
    prop: "time",
    label: "时间搜索",
  },
]);
const defaultParams = reactive({});
watch(
  () => props.queryType,
  async (val) => {
    const params = {
      loginUserType: val,
    };
    await nextTick();
    initData(params);
  },
  { immediate: true }
);
const { securityData } = storeToRefs(systemStore()); //引入store

const myDiv = ref(null);
const tableHeight = ref(0);
const ruleUserData = ref([]);
const tableRowData = ref({});
const commonStore = systemStore();
const rowSpan = ref(12);

const userRef = ref(null);
const menuRef = ref(null);
const deptRef = ref(null);
const roleRef = ref(null);
const detailsRef = ref(null)
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 150; // 获取高度并响应式更新
  }
});

const ids = ref([]);
const filterAuditStatus = (state) => {
  let val = "";
  if (state == 0) {
    val = "未审核";
  } else if (state == 1) {
    val = "审核通过";
  } else {
    val = "审核不通过";
  }
  return val;
};
const submitData = ref({
  module: "角色",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const loading = ref(false);
const ruleFormRef = ref(null); //form表单ref
const typeDialog = ref("user");
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
let checkedKeysArr = reactive([]); //获取到的选择的tree数据
let startTime = ref("");
let endTime = ref("");
const requestData = ref(null);
const emit = defineEmits(["waitEvent"]);

const ruleForm = reactive({
  name: "",
  description: "",
});
const ruleFormId = ref("");
const rules = reactive({
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入菜单描述", trigger: "blur" }],
});
const tableData = ref([]);
const treeRef = ref(); // 获取树组件的引用
const query = ref({
  size: 10,
  current: 1,
});

const treeData = ref([]);

onMounted(() => {
  initData();
});

const initData = async (params = {}) => {
  tableLoading.value = true;
  let requestData = "";
  Object.assign(params, query.value);
  // import { pageListOperLogApi,pageListAdminLogApi,pageListAuditLogApi } from "@/api/syslog";
  try {
    switch (props.queryType) {
      case "1":
        requestData = await pageListOperLogApi(params); // 系统用户管理员
        break;
      case "2":
        requestData = await pageListAdminLogApi(params); // 系统管理员
        break;
      case "3":
        requestData = await pageListAuditLogApi(params); // 授权管理员
        break;
      default:
        throw new Error("未知的 type 类型");
    }
  } catch (err) {
    err.value = err;
  } finally {
    loading.value = false;
  }
  if (requestData.code == 200) {
    tableData.value = requestData.data.records;
    total.value = requestData.data.total;
    tableLoading.value = false;
  } else {
    tableData.value = [];
    tableLoading.value = false;
  }
};
const detailsChange = (row) =>{

  detailsRef.value.initChange(row);
}
//编辑表单信息
const infoHandler = (row) => {
  tableRowData.value = row;
  const { operParam, id } = row;
  let param = JSON.parse(operParam);
  if (row.moduleCode == "menu") {
    //判断是菜单
    if (row.operationType == "删除") {
      // menuRef.value.infoQuery(param, true);
      menuRef.value.inFoChange(param, false);
    } else {
      menuRef.value.inFoChange(param, false);
    }
  } else if (row.moduleCode == "user" || row.moduleCode == "userRole") {
    if (row.operationType == "删除" && row.moduleCode == "user") {
      // userRef.value.infoQuery(param,true);
      userRef.value.inFoChange(param);
    } else {
      userRef.value.inFoChange(param, "", false);

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
    startTime: startTime.value,
    endTime: endTime.value,
    loginUserType: props.queryType,
  };
  initData(params);
};
const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  const params = {
    startTime: startTime.value,
    endTime: endTime.value,
    loginUserType: props.queryType,
  };
  initData(params);
};
//搜索
const handleSearch = (value) => {
  const { timeStart, timeEnd } = value;
  const params = {
    startTime: timeStart,
    endTime: timeEnd,
    loginUserType: props.queryType,
  };
  query.value.current = 1;

  initData(params);
};
const handleReset = () => {
  startTime.value = "";
  endTime.value = "";
  const params = {
    startTime: "",
    endTime: "",
    loginUserType: props.queryType,
  };
  initData(params);
};
</script>

<style lang="less" scoped>
.main-container {
  height: 100%;
  padding: 0 5px 0 0 ;

  box-sizing: border-box;
}
.container-btn {
  width: 100%;
  text-align: right;
  padding: 3px;
  box-sizing: border-box;
  background: #fff;
  margin-bottom: 5px ;

  border-radius: 3px;
}
.el-dialog__header {
  text-align: center;
}
.dialog-tips {
  font-size: 12px;
  padding: 5px;
}
</style>
