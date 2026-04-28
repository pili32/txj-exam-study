<template>
  <div class="main-container" ref="myDiv">
    <HeaderSearch
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />
    <base-table
      :columns="columns"
      :data="tableData"
      :height="tableHeight"
      :total="total"
      :loading="tableLoading"
      @size-change="sizeChange"
      @current-change="currentChange"
      :currentPage="query.current"
    >
      <template #auditStatus="scope">
        <span>{{ filterAuditStatus(scope.row.auditStatus) }}</span>
      </template>

      <!-- 操作列按钮 -->
      <template #operation="scope">
        <div>
          <el-button
            size="small"
            link
            type="primary"
            @click="handleEdit(scope.row)"
            >查看详情</el-button
          >
        </div>
      </template>
    </base-table>

    <BaseDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :confirm-loading="loading"
      @confirm="handleSubmit"
      @close="resetForm"
    >
      <el-tree
        style="max-width: 600px"
        :data="treeData"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        default-expand-all
        @check="clickChange"
        ref="treeRef"
      />
    </BaseDialog>

    <BaseDialog
      v-model="formDialogVisible"
      :title="dialogTitle"
      :confirm-loading="loading"
      @confirm="handleSubmitForm"
      @close="resetForm"
      :confirmLoading="dialogLoading"
    >
      <el-form
        :model="ruleForm"
        label-width="100px"
        ref="ruleFormRef"
        :rules="rules"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="ruleForm.description" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import { adminPageList } from "@/api/operation";
import BaseTable from "@/components/BaseTable.vue";
import BaseDialog from "@/components/BaseDialog.vue";
const myDiv = ref(null);
const tableHeight = ref(0);
const dialogVisible = ref(false);
const formDialogVisible = ref(false);
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 120; // 获取高度并响应式更新
  }
});
const columns = ref([
  { prop: "operatorName", label: "操作人" },
  { prop: "module", label: "操作模块" },
  { prop: "description", label: "操作内容" },
  { prop: "createTime", label: "操作时间" },
  { prop: "operIp", label: "IP" },
  { prop: "auditStatus", label: "审核状态", slot: "auditStatus" },
]);
const submitData = ref({
  module: "角色",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const searchItems = ref([
  {
    type: "input",
    prop: "description",
    label: "操作内容",
  },
  {
    type: "select",
    prop: "auditStatus",
    label: "审核状态",
    options: [
      {
        value: 0,
        label: "待审核",
      },
      {
        value: 1,
        label: "审核通过",
      },
      {
        value: 2,
        label: "审核不通过",
      },
    ],
  },
]);
const loading = ref(false);
const parentName = ref(""); //父级菜单名称
const ruleFormRef = ref(null); //form表单ref
const dialogTitle = ref("新增角色"); //弹框title
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading

const searchParams = reactive({
  description: "",
  auditStatus: "",
});
let checkedKeysArr = reactive([]); //获取到的选择的tree数据
const types = ref([]);
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

const defaultProps = {
  children: "children",
  label: "name",
};
const treeData = ref([]);
onMounted(() => {
  initData();
});
//搜索
const handleSearch = (value) => {



  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = value[key];
  });
  query.value.current = 1;
  initData(searchParams);
};
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
  tableLoading.value = true;
  adminPageList(params)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;
        tableLoading.value = false;
      }
    })
    .catch((error) => {
      tableLoading.value = false;
    });
};
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
const handleSubmit = async () => {
  const data = {
    roleId: ruleFormId.value,
    menuIds: checkedKeysArr,
  };
  const submitTree = {
    module: "角色菜单",
    status: 0,
    auditStatus: 0,
    operParam: JSON.stringify(data),
  };

  submitAuditApi("config", submitTree).then((res) => {
    ElMessage({
      message: "操作成功,等待审核",
      type: "success",
      duration: 3 * 1000,
    });
    resetForm();
  });
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  initData(searchParams);
};
const currentChange = (val) => {

  query.value.current = val;
  initData(searchParams);
};
const handleReset = () => {};

//提交数据新增和修改的提交
const handleSubmitForm = async () => {
  dialogLoading.value = true;
  await ruleFormRef.value.validate((valid) => {
    if (valid) {
      let type = ref("");
      //判断当前获取到列表的id，进行编辑保存
      if (ruleFormId.value) {
        type = "update";
        ruleForm.id = ruleFormId.value;
      } else {
        type = "add";
      }
      submitData.value.operParam = JSON.stringify(ruleForm);
      submitAuditApi(type, submitData.value)
        .then((res) => {
          ElMessage({
            message: "操作成功,等待审核",
            type: "success",
            duration: 3 * 1000,
          });
          dialogLoading.value = false;
          resetForm();
        })
        .catch((error) => {
        });
      loading.value = false;
      return;
    } else {
      loading.value = false;
    }
  });
};

const handleAdd = (row) => {
  parentName.value = row.name;
  ruleForm.parentId = row.id;
  dialogVisible.value = true;
};

//编辑表单信息
const handleEdit = (row) => {
  dialogTitle.value = "编辑菜单";
  const { id } = row;
  ruleFormId.value = id;
  getMenuTree().then((res) => {
    if (res.code == 200) {
      dialogVisible.value = true;
      treeData.value.push(res.data);
      getMenuId(id);
    }
  });
};

//编辑表单信息
const getMenuId = (id) => {
  dialogTitle.value = "编辑菜单";
  getMenusByRole(id).then((res) => {
    if (res.code == 200) {
      dialogVisible.value = true;
      if (res.data.menuIds && res.data.menuIds.length > 0) {
        checkedKeysArr = res.data.menuIds;
        res.data.menuIds.forEach(async (item) => {
          await treeRef.value.setChecked(item, true); //设置父节点高亮
        });
      }
    }
  });
};

//重置表单数据
const resetForm = () => {
  dialogVisible.value = false;
  formDialogVisible.value = false;
  dialogLoading.value = false;
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
  treeData.value = [];
  parentName.value = "";
  ruleFormId.value = "";
};
</script>

<style lang="less">
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
