<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn">
      <HeaderSearch
        :items="searchItems"
        :default-params="defaultParams"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template v-slot:click>
          <el-button type="primary" size="small" @click="addUserHandler"
            >新增</el-button
          >
        </template>
      </HeaderSearch>
    </div>
    <div class="latout-box" :style="{ height: tableHeight + 50 + 'px' }">
      <div class="tree-box">
        <el-tree
          style="max-width: 100%"
          :data="treeData"
          node-key="id"
          default-expand-all
          :props="defaultProps"
          ref="treeRef"
          :highlight-current="true"
          @node-click="handleNodeClick"
        />
      </div>
      <div class="table-box">
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
           :operationWidth="200"

        >
          <!-- 自定义状态列 -->
          <template #status="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === "1" ? "启用" : "禁用" }}
            </el-tag>
          </template>

          <template #security="scope">
            <span>{{ filterSecurity(scope.row.security) }}</span>
          </template>

          <!-- 操作列按钮 -->
          <template #operation="scope">
            <div>
              <el-button
                size="small"
                link
                type="success"
                @click="handleEdit(scope.row)"
                >编辑</el-button
              >
              <el-button
                size="small"
                link
                type="primary"
                @click="roleChange(scope.row)"
                >分配角色</el-button
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
      </div>
    </div>
    <BaseDialog
      v-model="roleDialog"
      :title="dialogTitle"
      :confirm-loading="dialogLoading"
      @confirm="handleSubmitRole"
      @close="roleDialog = false"
      width="30%"
    >
      <el-form
        :model="ruleUserForm"
        label-width="100px"
        ref="ruleUserFormRef"
        :rules="rules"
      >
        <el-form-item label="权限配置" prop="ids">
          <el-select
            v-model="ruleUserForm.ids"
            placeholder="请选择角色"
            style="width: 240px"
            multiple
            @change="selectChange"
          >
            <template #label="{ label }">
              <span>{{ label }}</span>
            </template>
            <el-option
              v-for="item in ruleUserData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </BaseDialog>
    <userDialog
      ref="dialogRef"
      @childEvent="updateData"
      :dialogState="dialogVisible"
      :securityData="securityData"
      :userType="typeDialog"
      :ruleData="ruleUserData"
      :ids="ids"
      :title="dialogTitle"
      :tree="treeData"
      :defaultProps="defaultProps"
      :deptReadonly="deptEditStauts"
    ></userDialog>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import {
  submitAuditApi,
  userDeptPageList,
  sysUserQueryById,
  getDeptTreeApi,
  getUserList,
  getUserRoleList,
} from "@/api/system";
import { storeToRefs } from "pinia";
import BaseTable from "@/components/BaseTable.vue";
import BaseDialog from "@/components/BaseDialog.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";
import { systemStore } from "@/stores/common.js";
import { getCurrentInstance } from "vue";
import userDialog from "./module/userDialog.vue";

const { proxy } = getCurrentInstance();
const myDiv = ref(null);
const tableHeight = ref(0);
const dialogVisible = ref(false);
const { securityData } = storeToRefs(systemStore()); //引入store
const roleDialog = ref(false);
const ruleUserData = ref([]);
const typeDialog = ref("user");
const dialogTitle = ref("");
const deptEditStauts = ref(false)
const handleSearch = (value) => {
  userName.value = value.userName
  value.deptId = ruleForm.deptId;
  query.value.current = 1;

  const params = {
    userName: value.userName,
    deptId: ruleForm.deptId,
  };
  initData(params);
};
const handleReset = () => {
  const params = {
    userName: "",
    deptId:ruleForm.deptId,
  };
  initData(params);
};
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 120; // 获取高度并响应式更新
  }
});
const columns = ref([
  { prop: "userName", label: "用户名" },
  { prop: "account", label: "账号", width: 180 },
  { prop: "deptName", label: "部门名称", width: 180 },
  { prop: "duty", label: "职务" },
  { prop: "phone", label: "手机号" },
  // { prop: "password", label: "密码" },
  { prop: "security", label: "密级", slot: "security" },
]);
const searchItems = ref([
  {
    type: "input",
    prop: "userName",
    label: "用户名",
  },
]);
const dialogRef = ref(null);

const defaultParams = ref({});
const submitData = ref({
  moduleCode: "user",
  // auditStatus: 0,
  operParam: {},
});
const treeData = reactive([]);
const defaultProps = {
  children: "children",
  label: "deptName",
};
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
const ruleFormRef = ref(null);
const userName = ref("");
const total = ref(null);
const ruleForm = reactive({
  account: "",
  deptName: "根节点",
  duty: "",
  phone: "",
  userName: "",
  password: "",
  sort: null,
  security: "",
  deptId: "1",
});
const ids = ref([]);
const ruleFormId = ref("");
const ruleFormReadonly = ref(false);
const validatePassword = (rule, value, callback) => {
  const regexp = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=~`\{\}\[\]\|\\:;\"'<>,.?/])(?!.*\s).{8,15}$/
  );
  if (value != "******" || !value) {
    if (!regexp.test(value)) {
      callback(new Error("需包含大小写字母，数字，特殊字符的8-15位密码"));
    }
  }
  callback();
};

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入手机号"));
  } else {
    const regexp = new RegExp(/^1[3-9]\d{9}$/);
    if (!regexp.test(value)) {
      callback(new Error("手机号格式错误"));
    } else {
    }
    callback();
  }
};

let checkedKeysArr = ref([]); //获取到的选择的tree数据

const rules = reactive({
  account: [{ required: true, message: "请输入账户名", trigger: "blur" }],
  deptName: [{ required: true, message: "请选择部门名称", trigger: "blur" }],
  duty: [{ required: true, message: "请输入职务", trigger: "blur" }],
  phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
  userName: [{ required: true, message: "请输入用户名称", trigger: "blur" }],
  password: [{ required: true, validator: validatePassword, trigger: "blur" }],
  security: [{ required: true, message: "请选择密级", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
});
const tableData = ref([]);

const query = ref({
  size: 10,
  current: 1,
});
onMounted(() => {
  getDeptTree();
  tableLoading.value = true;
});

const getDeptTree = () => {
  getDeptTreeApi(1).then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
    }
  });
  treeData.length = 0;
  const params = {
    deptId: "1",
  };
  initData(params);
};
const initData = (params = {}) => {
  // proxy.$loading.show({
  //   text: "正在加载数据...",
  // });
  Object.assign(params, query.value);
  tableLoading.value = true;

  userDeptPageList(params)
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

const handleSubmitRole = () => {
  const data = {
    userId: ruleFormId.value,
    roleIds: checkedKeysArr.value,
  };
  const submitTree = {
    moduleCode: "userRole",
    operParam: JSON.stringify(data),
  };
  submitAuditApi("config", submitTree).then((res) => {
    ElMessage({
      message: "操作成功,等待审核",
      type: "success",
      duration: 3 * 1000,
    });
    roleDialog.value = false;
  });
};
const handleNodeClick = (data) => {
  // this.loading = true;
  query.value.current =1;
  ruleForm.deptId = data.id;
  ruleForm.deptName = data.deptName;
  tableData.value = [];
  const params = {
    deptId: data.id,
  };
  initData(params);
};

const updateData = (val) => {
  tableData.value = [];
  const params = {
    deptId: ruleForm.deptId,
  };
  initData(params);
};
const filterSecurity = (value) => {
  let val = "";
  if (value) {
    const { valueName } = securityData.value.find(
      (item) => item.valueCode == value
    );
    val = valueName;
  }
  return val;
};
const addUserHandler = () => {
  if (ruleForm.deptId == 1) {
    ElMessage({
      message: "不能在根节点新增人员",
      type: "warning",
      duration: 2 * 1000,
    });
    return;
  }
  // dialogVisible.value = true;
  dialogTitle.value = "新增人员";
  const childObj = {
    treeId: ruleForm.deptId, //左边组织树的id
    parentName: ruleForm.deptName,

  };
  dialogRef.value.initChange(childObj);
  deptEditStauts.value = true
  // dialogRef.value.initChange(childObj, parentName);
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
            dialogVisible.value = false;
            serviceLoading.close()
            initData();
            resetForm();
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
//分配角色
const roleChange = (row) => {
  dialogTitle.value = "分配角色";
  ruleFormId.value = row.id;
  getUserList().then((res) => {
    if (res.code == 200) {
      ruleUserData.value = res.data;
      getRoleList(row.id, row.userName);
    }
  });
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];
  const params = {
    userName: userName.value,
    deptId: ruleForm.deptId,
  };
  initData(params);
};

const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  tableData.value = [];

  const params = {
    userName: userName.value,
    deptId: ruleForm.deptId,
  };
  initData(params);
};
const getRoleList = (id, userName) => {
  getUserRoleList(id).then((res) => {
    if (res.code == 200) {
      ids.value = res.data.roleIds;
      checkedKeysArr.value = res.data.roleIds;
      typeDialog.value = "role";
      const obj = {
        ruleFormId: id, //左边组织树的id
        userName: userName,
      };
      dialogRef.value.initChange(obj);
    }
  });
};
//分配权限事件
const selectChange = (event) => {
  checkedKeysArr.value = event;
};
//编辑表单信息
const handleEdit = (row) => {
  dialogTitle.value = "编辑人员";

  typeDialog.value = "user";
  const { id } = row;
  const childObj = {
    rowId: id,
    treeId: row.deptId, //左边组织树的id
  };
  deptEditStauts.value = false
  dialogRef.value.initChange(childObj);
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
  padding: 3px 0;
  box-sizing: border-box;
}
.el-dialog__header {
  text-align: center;
}
.dialog-tips {
  font-size: 12px;
  padding: 5px;
}
::v-deep .el-select-dropdown {
  min-width: 200px !important;
}
::v-deep .el-tree {
  min-width: 200px !important;
}
::v-deep .el-tag {
  max-width: 230px !important;
}
.latout-box {
  display: flex;
  flex-direction: row;
  .tree-box {
    width: 15%;
    background: #fff;
    height: 100%;
    margin-right: 3px;
    padding: 3px;
    box-sizing: border-box;
    border-radius: 5px;
    .title {
      font-size: 12px;
    }
  }
  .table-box {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-basis: auto;
    flex-direction: row;
    min-width: 0;
    background: #fff;
    border-radius: 5px;
  }
}
</style>
