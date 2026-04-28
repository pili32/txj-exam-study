<template>
  <div class="dialog-box" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="title"
      :confirm-loading="dialogLoading"
      @confirm="handleSubmit"
      width="60%"
      @close="resetForm"
    >
      <div class="main-dialog">
        <el-form
          :model="ruleForm"
          label-width="100px"
          ref="ruleFormRef"
          :rules="rules"
          v-if="userType == 'user'"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="账号" prop="account">
                <el-input
                  v-model="ruleForm.account"
                  :readonly="ruleFormReadonly"
                  placeholder="请输入账号"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户名" prop="userName">
                <el-input
                  v-model="ruleForm.userName"
                  :readonly="ruleFormReadonly"
                  placeholder="请输入用户名"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="职务">
                <el-input
                  v-model="ruleForm.duty"
                  :readonly="formReadlony"
                  placeholder="请输入职务"
                />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="部门名称" prop="deptName">
                <el-input v-model="ruleForm.deptName" readonly  placeholder="请输入部门名称" />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="部门名称" prop="deptId">
                <el-input v-model="ruleForm.deptName" readonly  placeholder="请输入部门名称" v-if="props.deptReadonly" />
                <el-tree-select
                  v-model="ruleForm.deptId"
                  :data="props.tree"
                  :props="props.defaultProps"
                  @node-click="handleNodeClick"
                  node-key="id"
                  ref="treeRef"
                  placeholder="请选择题目分类"
                  style="min-width: 280px"
                  v-else
                  :default-expand-all="true"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="ruleForm.password"
                  :readonly="ruleFormReadonly"
                  placeholder="请输入密码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号">
                <el-input
                  type="number"
                  v-model="ruleForm.phone"
                  :readonly="formReadlony"
                  placeholder="请输入手机号"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="密级" prop="security">
                <el-select
                  v-model="ruleForm.security"
                  placeholder="请选择密级"
                  :disabled="formReadlony"
                >
                  <el-option
                    v-for="item in securityData"
                    :key="item.valueCode"
                    :label="item.valueName"
                    :value="item.valueCode"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序" prop="sort">
                <el-input
                  type="number"
                  v-model="ruleForm.sort"
                  :readonly="formReadlony"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div v-if="userType == 'role'">
          <div class="name-class">用户名：{{ userName }}</div>
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
                  v-for="item in ruleData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                  :disabled="formReadlony"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer v-if="footerButton">
        <slot name="footer">
          <div class="footer-btn">
            <span class="dialog-footer">
              <el-button @click="examineChange(1)" type="primary">
                通过
              </el-button>
              <el-button @click="examineChange(2)" type="info">
                不通过
              </el-button>
              <el-button @click="resetForm"> 取消 </el-button>
            </span>
          </div>
        </slot>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";

import {
  submitAuditApi,
  sysUserQueryById,
  getUserRoleList,
} from "@/api/system";

const props = defineProps({
  securityData: {
    type: Array,
    default: () => [],
  },
  userType: {
    type: String,
    default: "user",
  },
  ruleData: {
    type: Array,
    default: () => [],
  },
  ids: {
    type: Array,
    default: () => [],
  },
  formReadlony: {
    type: Boolean,
    default: () => false,
  },
  title: {
    type: String,
    default: () => "新增人员",
  },
  tree:{
    type: Array,
    default: () => [],
  },
  defaultProps:{
    type: Object,
    default: () => {},
  },
  deptReadonly:{
    type: Boolean,
    default: () => false,
  }
});

watch(
  () => props.formReadlony,
  (val) => {
    if (val) ruleFormReadonly.vlaue = true;
  }
);
const dialogVisible = ref(false);
const footerButton = ref(false);
const submitState = ref(true);
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
const ruleUserForm = reactive({
  ids: [],
});
// const { securityData } = storeToRefs(systemStore()); //引入store

const emit = defineEmits(["childEvent"]);
const parentName = ref(""); //父级菜单名称
const dialogLoading = ref(false);
const loading = ref(false);
const ruleFormReadonly = ref(false); //表单是否可以编辑
let userName = ref("");
const initChange = (obj) => {
  dialogVisible.value = true;
  parentName.value = obj.parentName;
  userName.value = obj.userName;
  ruleForm.deptName = obj.parentName;
  ruleForm.deptId = obj.treeId;
  if (obj.rowId) {
    editChange(obj.rowId);
  }
  if (obj.ruleFormId) {
    ruleFormId.value = obj.ruleFormId;
  }
};

let checkedKeysArr = ref([]); //获取到的选择的tree数据

//编辑菜单
const editChange = (id) => {
  ruleFormId.value = id;
  sysUserQueryById(id).then((res) => {
    if (res.code == 200) {
      dialogVisible.value = true;
      ruleFormReadonly.value = true;
      Object.keys(ruleForm).forEach((key) => {
        if (ruleForm["security"]) {
          ruleForm["security"] = res.data["security"].toString();
        } else if (key == "password") {
          ruleForm[key] = "******";
        } else {
          ruleForm[key] = res.data[key];
        }
      });

      ruleForm.password = "******";
    }
  });
};
// 同步 v-model
watch(
  () => props.ids,
  (val) => {
    ruleUserForm.ids = val;
    checkedKeysArr.value = val;
  }
);

const ruleFormRef = ref(null);
const ruleUserFormRef = ref(null);

//分配权限事件
const selectChange = (event) => {
  checkedKeysArr.value = event;
};
const submitData = ref({
  moduleCode: "user",
  // auditStatus: 0,
  operParam: {},
});
const ruleFormId = ref("");

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

const inFoChange = (obj, state, button) => {
  userName.value = obj.userName;
  dialogVisible.value = true;
  footerButton.value = button;
  submitState.value = false;
  // if (state) {
  //   return;
  // }

  ruleFormReadonly.value = true;
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = obj[key];
  });
  ruleForm.password = "******";
};

const rules = reactive({
  account: [{ required: true, message: "请输入账户名", trigger: "blur" }],
  deptId: [{ required: true, message: "请选择部门名称", trigger: "blur" }],
  duty: [{ required: true, message: "请输入职务", trigger: "blur" }],
  // phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
  phone: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  userName: [{ required: true, message: "请输入用户名称", trigger: "blur" }],
  password: [{ required: true, validator: validatePassword, trigger: "blur" }],
  security: [{ required: true, message: "请选择密级", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
});
const tableData = ref([]);
//提交数据新增和修改的提交
const handleSubmit = async () => {
  if (!submitState.value) {
    {
      resetForm();
      return;
    }
  }
  loading.value = true;
  if (props.userType == "user") {

    await ruleFormRef.value.validate((valid) => {
      if (valid) {
        const serviceLoading = ElLoading.service({
          lock: true,
          text: "加载中...",
          background: "rgba(0, 0, 0, 0.7)",
        });
        let type = ref("");
        //判断当前获取到列表的id，进行编辑保存
        if (ruleFormId.value) {
          type = "update";
          ruleForm.id = ruleFormId.value;
          delete ruleForm.password;
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
            dialogVisible.value = false;
            // emit("childEvent");
            serviceLoading.close()
            resetForm();
          })
          .catch((error) => {
            serviceLoading.close()
          });
        loading.value = false;
        return;
      } else {
        loading.value = false;
      }
    });
  } else {
    handleSubmitRole();
  }
};
const handleNodeClick = (data) => {
  ruleForm.deptId = data.id;
  ruleForm.deptName = data.deptName;
};
//重置表单数据
const resetForm = () => {
  if (props.userType == "role") {
    dialogVisible.value = false;
    return;
  }
  ruleFormRef.value.resetFields();
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
  ruleFormReadonly.value = false;
  dialogVisible.value = false;
  ruleFormId.value = "";
};
const handleSubmitRole = () => {
  ruleUserFormRef.value.validate((valid) => {
    if (valid) {
      const serviceLoading = ElLoading.service({
          lock: true,
          text: "加载中...",
          background: "rgba(0, 0, 0, 0.7)",
        });
      const data = {
        userId: ruleFormId.value,
        userName: userName.value,
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
        serviceLoading.close()
        dialogVisible.value = false;
      });
    } else {
      loading.value = false;
    }
  }).catch(error =>{
    serviceLoading.close()
  });
};
const infoQuery = (param, button) => {
  dialogVisible.value = true;
  footerButton.value = button;
  ruleFormReadonly.value = true;
  sysUserQueryById(param.id).then((res) => {
    Object.keys(ruleForm).forEach((key) => {
      if (ruleForm["security"]) {
        ruleForm["security"] = res.data["security"].toString();
      } else {
        ruleForm[key] = res.data[key];
      }
    });
  });
};
//
const examineChange = (val) => {
  emit("childEvent", val);
  resetForm();
};
defineExpose({
  initChange,
  inFoChange,
  infoQuery,
});
</script>

<style lang="less" scoped>
::v-deep .el-select-dropdown {
  min-width: 200px !important;
}
::v-deep .el-tree {
  min-width: 200px !important;
}
::v-deep .el-tag {
  max-width: 230px !important;
}
.footer-btn {
  width: 100%;
  display: flex;
  justify-content: center;
}
.name-class {
  padding: 10px 20px;
  color: #409eff;
}
.main-dialog {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
