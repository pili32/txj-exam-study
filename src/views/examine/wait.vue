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
        <!-- <div>
          <el-button
            size="small"
            link
            type="primary"
            @click="auditChange(scope.row, 1)"
            >通过</el-button
          >
          <el-button
            size="small"
            link
            type="danger"
            @click="auditChange(scope.row, 2)"
            >不通过</el-button
          >
        </div> -->
      </template>
    </base-table>
  </div>
  <userDialog
    ref="userRef"
    @childEvent="auditChange"
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
    @childEvent="auditChange"
    :dialogState="dialogVisible"
    :formReadlony="true"
    :title="dialogTitle"
  ></menuDialog>
  <deptDialog
    ref="deptRef"
    @childEvent="auditChange"
    :dialogState="dialogVisible"
    :formReadlony="true"
    :title="dialogTitle"
  ></deptDialog>
  <roleDialog
    ref="roleRef"
    @childEvent="auditChange"
    :userType="typeDialog"
    :dialogState="dialogVisible"
    :formReadlony="true"
    :title="dialogTitle"
  ></roleDialog>
  <dictType
    ref="typeRef"
    @childEvent="auditChange"
    :dialogState="dialogVisible"
    :formReadlony="true"
    :title="dialogTitle"
  ></dictType>

  <dictKey
    ref="dictKeyRef"
    @childEvent="auditChange"
    :dialogState="dialogVisible"
    :formReadlony="true"
    :title="dialogTitle"
    :height="dialogHeight"
  ></dictKey>
</template>
<script setup>
import {
  ref,
  reactive,
  watch,
  watchEffect,
  onMounted,
  provide,
  inject,
} from "vue";
import { doAuditApi, auditPageList } from "@/api/examine";
import { getUserList, sysUserQueryById, roleQueryById } from "@/api/system";
import { systemStore } from "@/stores/common.js";

import BaseTable from "@/components/BaseTable.vue";
import userDialog from "../system/module/userDialog.vue";
import menuDialog from "../system/module/menuDialog.vue";
import deptDialog from "../system/module/deptDialog.vue";
import roleDialog from "../system/module/roleDialog.vue";
import dictType from "../system/module/dictTypeDialog.vue";
import dictKey from "../system/module/dictKeyDialog.vue";

import { storeToRefs } from "pinia";

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
const dialogHeight = ref(0);

const dialogVisible = ref(false);
const formDialogVisible = ref(false);
const ruleUserData = ref([]);
const tableRowData = ref({});
const commonStore = systemStore();
const { securityData } = storeToRefs(systemStore()); //引入store
const module = ref("");
const dialogTitle = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight; // 获取高度并响应式更新
    dialogHeight.value = myDiv.value.clientHeight;
  }
});

const handleSearch = (value) => {
  module.value = value.module;
  query.value.current = 1;
  initData(value);
};
const handleReset = () => {
  initData();
};

watch(
  () => props.tabName,
  (val) => {
    if (val == "wait") initData();
  }
);
const columns = ref([
  { prop: "module", label: "模块名称" },
  { prop: "description", label: "操作内容" },
  { prop: "createTime", label: "提交时间" },
]);
const ids = ref([]);

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
  auditStatus: 0,
});

const treeData = ref([]);
const userRef = ref(null);
const menuRef = ref(null);
const deptRef = ref(null);
const roleRef = ref(null);
const typeRef = ref(null);
const dictKeyRef = ref(null);
onMounted(() => {
  initData();
});
const clickChange = async (checkedNodes, checkedKeys) => {
  let parentId = checkedNodes.parentId ? checkedNodes.parentId : ""; //获取当前的父节点id
  if (parentId) {
    //如果父节点id存在，则设置即使只选择一个子节点父节点也是高亮
    if (parentId) {
      await treeRef.value.setChecked(parentId, true); //设置父节点高亮
    }
  }
  const keys = await treeRef.value.getCheckedKeys(); //获取到当前所有选中的节点
  checkedKeysArr = keys;
};
const initData = (params = {}) => {
  Object.assign(params, query.value);
  auditPageList(params)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;
        commonStore.setTotal(1, res.data.total);
        emit("waitEvent", res.data.total);
      }
    })
    .catch((error) => {});
};

//编辑表单信息
const infoHandler = (row) => {
  tableRowData.value = row;
  const { operParam, id } = row;
  let param = JSON.parse(operParam);

  dialogTitle.value = `${row.operationType}${row.module}`;
  if (row.moduleCode == "menu") {
    //判断是菜单
    menuRef.value.inFoChange(param, true);
  } else if (row.moduleCode == "user" || row.moduleCode == "userRole") {
    if (row.moduleCode == "user") {
      typeDialog.value = "user";
      userRef.value.inFoChange(param, "user", true);
    } else {
      if (row.moduleCode == "userRole") {
        ids.value = param.roleIds;
        typeDialog.value = "role";
        userRef.value.inFoChange(param, "role", true);
        roleChange(id);
      }
    }
  } else if (row.moduleCode == "dept") {
    if (row.operationType == "删除") {
      deptRef.value.inFoChange(param, "1", true);
    } else {
      deptRef.value.inFoChange(param, "1", true);
    }
  } else if (row.moduleCode == "role" || row.moduleCode == "roleMenu") {
    if (row.moduleCode == "role") {
      typeDialog.value = "role";
      if (row.operationType == "删除") {
        roleRef.value.inFoChange(param, "role", true);
      } else {
        roleRef.value.inFoChange(param, "role", true);
      }
    } else {
      typeDialog.value = "roleMenu";
      roleRef.value.inFoChange(param, "roleMenu", true);
    }
  } else if (row.moduleCode == "dictType") {
    if (row.operationType == "删除") {
      typeRef.value.inFoChange(param, "1", true);
    } else {
      typeRef.value.inFoChange(param, "1", true);
    }
  } else if (row.moduleCode == "dictData") {
    dictKeyRef.value.inFoChange(param, "1", true);
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
const auditChange = (status) => {
  tableLoading.value = true;
  const serviceLoading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  const obj = {
    auditStatus: status,
    id: tableRowData.value.id,
    relatedRecordId: tableRowData.value.relatedRecordId,
  };
  doAuditApi(tableRowData.value.moduleCode, obj).then((res) => {
    if (res.code == 200) {
      ElMessage({
        message: "操作成功",
        type: "success",
        duration: 3 * 1000,
      });
      tableLoading.value = false
      initData();
      serviceLoading.close();
    } else {
      ElMessage({
        message: "操作失败",
        type: "success",
        duration: 3 * 1000,
      });
      serviceLoading.close();
    }
    tableLoading.value = false;
    initData();
  }).catch(error =>{
    tableLoading.value = false;

    serviceLoading.close();
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
</script>

<style lang="less" scoped>
  @import '@/assets/css/examine.less';

</style>
