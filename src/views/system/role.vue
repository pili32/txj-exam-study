<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn">
      <el-button @click="addUserHandler" type="primary" size="small"
        >新增</el-button
      >
    </div>
    <base-table
      :columns="columns"
      :data="tableData"
      :height="tableHeight"
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
            @click="handleEdit(scope.row)"
            >菜单配置</el-button
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
    <!--
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
    </BaseDialog> -->

    <!-- <BaseDialog
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
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="ruleForm.description" />
        </el-form-item>
      </el-form>
    </BaseDialog> -->
    <roleDialog
      ref="dialogRef"
      :dialogState="dialogVisible"
      :userType="typeDialog"
      :ruleData="ruleUserData"
      :title="dialogTitle"
    ></roleDialog>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import {
  submitAuditApi,
  userRolePageList,
  queryByIdApi,
  getMenuTree,
  getMenusByRole,
} from "@/api/system";
import BaseTable from "@/components/BaseTable.vue";
import BaseDialog from "@/components/BaseDialog.vue";
import roleDialog from "./module/roleDialog.vue";

const myDiv = ref(null);
const tableHeight = ref(0);
const dialogVisible = ref(false);
const formDialogVisible = ref(false);
const dialogRef = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 100; // 获取高度并响应式更新
  }
});
const columns = ref([
  { prop: "name", label: "名称"},
  { prop: "description", label: "描述" },
]);
const submitData = ref({
  moduleCode: "role",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const loading = ref(false);
const parentName = ref(""); //父级菜单名称
const ruleFormRef = ref(null); //form表单ref
const dialogTitle = ref(""); //弹框title
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
let checkedKeysArr = reactive([]); //获取到的选择的tree数据
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
  current:1,
});
const typeDialog = ref("user");

const defaultProps = {
  children: "children",
  label: "name",
};
const treeData = ref([]);
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
const initData = () => {
  tableLoading.value = true;

  userRolePageList(query.value)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;
        tableLoading.value = false;
      }
    })
    .catch((error) => {});
};

const handleSubmit = async () => {
  const data = {
    roleId: ruleFormId.value,
    menuIds: checkedKeysArr,
  };
  const submitTree = {
    moduleCode: "roleMenu",

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
  tableData.value = [];
  initData();
};

const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  tableData.value = [];
  initData();
};
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
//删除数据
const handleDelete = (row) => {
  const { id } = row;
  ElMessageBox.confirm("是否要删除数据?", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const serviceLoading = ElLoading.service({
          lock: true,
          text: "加载中...",
          background: "rgba(0, 0, 0, 0.7)",
        });
      submitData.value.operParam = JSON.stringify(row);

      submitAuditApi("delete", submitData.value)
        .then((res) => {
          if (res.code == 200) {
            ElMessage({
              message: "操作成功,等待审核",
              type: "success",
              duration: 3 * 1000,
            });
            initData();
            resetForm();
            serviceLoading.close()
          }
        })
        .catch((error) => {
          serviceLoading.close()
        });
      // ElMessage({
      //   type: 'success',
      //   message: 'Delete completed',
      // })
    })
    .catch(() => {});
};
//编辑表单信息
const handleEdit = (row) => {
  typeDialog.value = "roleMenu";
  dialogTitle.value = "角色菜单配置";
  const obj = {
    rowId: row.id,
    roleName: row.name,
  };
  dialogRef.value.initChange(obj);

  // dialogTitle.value = "编辑菜单";
  // const { id } = row;
  // ruleFormId.value = id;
  // getMenuTree().then((res) => {
  //   if (res.code == 200) {
  //     dialogVisible.value = true;
  //     treeData.value.push(res.data);
  //     getMenuId(id);
  //   }
  // });
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
const addUserHandler = () => {
  dialogTitle.value = "新增角色";
  typeDialog.value = "role";

  dialogRef.value.initChange({});
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
