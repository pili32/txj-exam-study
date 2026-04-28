<template>
  <div class="main-dialog" ref="myDiv">
    <BaseDialog
      v-model="formDialogVisible"
      :title="title"
      :confirm-loading="loading"
      @confirm="handleSubmit"
      @close="resetForm"
      :confirmLoading="dialogLoading"
    >
      <div class="main-dialog">
        <el-form
          :model="ruleForm"
          label-width="100px"
          ref="ruleFormRef"
          :rules="rules"
          v-if="userType == 'role'"
        >
          <el-form-item label="名称" prop="name">
            <el-input
              v-model="ruleForm.name"
              :readonly="ruleFormReadonly"
              placeholder="请输入名称"
            />
          </el-form-item>
          <el-form-item
            label="描述"
            prop="description"
            placeholder="请输入描述"
          >
            <el-input
              v-model="ruleForm.description"
              :readonly="ruleFormReadonly"
            />
          </el-form-item>
        </el-form>

        <div v-if="userType == 'roleMenu'">
          <div class="name-class">角色名：{{ roleName }}</div>
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
              <el-button @click="resetForm"> 取消</el-button>
            </span>
          </div>
        </slot>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";

import {
  submitAuditApi,
  sysUserQueryById,
  getUserRoleList,
  getMenuTree,
  getMenusByRole,
  roleQueryById,
} from "@/api/system";

const props = defineProps({
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
    default: () => "新增角色",
  },
});

watch(
  () => props.formReadlony,
  (val) => {
    if (val) ruleFormReadonly.vlaue = true;
  }
);
const dialogVisible = ref(false);
let roleName = ref("");
const ruleUserForm = reactive({
  ids: [],
});
const treeRef = ref(); // 获取树组件的引用
const emit = defineEmits(["childEvent"]);
const parentName = ref(""); //父级菜单名称
const dialogLoading = ref(false);
const loading = ref(false);
const ruleFormReadonly = ref(false); //表单是否可以编辑
const formDialogVisible = ref(false);
const footerButton = ref(false);
const submitState = ref(true);

const defaultProps = ref({
  children: "children",
  label: "name",
});
const initChange = (obj) => {
  formDialogVisible.value = true;
  roleName.value = obj.roleName;
  if (obj.rowId) {
    // editChange(obj.rowId);
    // getTree();
    getTree(obj.rowId);
  }

  if (obj.rowId) {
    ruleFormId.value = obj.rowId;
  }
};

let checkedKeysArr = ref([]); //获取到的选择的tree数据
const treeData = ref([]);

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
const clickChange = async (checkedNodes, checkedKeys) => {
  let parentId = checkedNodes.parentId ? checkedNodes.parentId : ""; //获取当前的父节点id
  if (parentId) {
    //如果父节点id存在，则设置即使只选择一个子节点父节点也是高亮
    if (parentId) {
      await treeRef.value.setChecked(parentId, true); //设置父节点高亮
    }
  }
  const keys = await treeRef.value.getCheckedKeys(); //获取到当前所有选中的节点
  checkedKeysArr.value = keys;
};
const ruleForm = ref({
  account: "",
  deptName: "根节点",
  duty: "",
  phone: "",
  userName: "",
  password: "",
  sort: null,
  security: "",
  deptId: "1",
  name: "",
  description: "",
});
//分配权限事件
const selectChange = (event) => {
  checkedKeysArr.value = event;
};
const submitData = ref({
  moduleCode: "user",
  // auditStatus: 0,
  operParam: {},
});
let ruleFormId = ref("");

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
const examineChange = (val) => {
  emit("childEvent", val);
  resetForm();
};

const infoQuery = (obj, button) => {
  formDialogVisible.value = true;
  footerButton.value = button;

  roleQueryById(obj.id).then((res) => {
    Object.keys(ruleForm.value).forEach((key) => {
      ruleForm.value[key] = res.data[key];
    });
  });
};
const inFoChange = (obj, state, button) => {
  formDialogVisible.value = true;
  submitState.value = false;

  ruleFormReadonly.value = false;
  roleName.value = obj.roleName;
  footerButton.value = button;
  if (state == "role") {
    Object.keys(ruleForm.value).forEach((key) => {
      ruleForm.value[key] = obj[key];
    });
  } else {
    // defaultProps.value.disabled = "name";

    getTree(obj.roleId, obj.menuIds);
  }
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
        ruleForm.value.id = ruleFormId.value;
      } else {
        type = "add";
      }
      submitData.value.moduleCode = "role";
      const serviceLoading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      submitData.value.operParam = JSON.stringify(ruleForm.value);
      submitAuditApi(type, submitData.value)
        .then((res) => {
          ElMessage({
            message: "操作成功,等待审核",
            type: "success",
            duration: 3 * 1000,
          });
          dialogLoading.value = false;
          serviceLoading.close();
          resetForm();
        })
        .catch((error) => {
          serviceLoading.close();
        });
      loading.value = false;
      return;
    } else {
      loading.value = false;
    }
  });
};
const getTree = (id, menuIds = []) => {
  getMenuTree().then((res) => {
    if (res.code == 200) {
      treeData.value.push(res.data);
      if (menuIds.length > 0) {
        menuIds.forEach(async (item) => {
          await nextTick();
          await treeRef.value.setChecked(item, true); //设置父节点高亮
        });

        return;
      } else {
        setTimeout(() => {
          getMenuId(id);
        }, 200);
      }
    }
  });
};
//编辑表单信息
const getMenuId = async (id) => {
  getMenusByRole(id).then((res) => {
    const data = treeData.value[0].children;
    checkedKeysArr.value = res.data.menuIds;
    if (res.code == 200) {
      if (res.data.menuIds && res.data.menuIds.length > 0) {
        const parentId = [];
        const childId = [];
        // treeRef.value.setChecked(item, true); //设置父节点高亮
        data.forEach((e) => {
          res.data.menuIds.forEach(async (item) => {
            if (e.id === item) {
              parentId.push(item);
            } else {
              childId.push(item);
            }
          });
        });

        //将parent和child分开是因为需要先将子节点勾选再将父节点勾选，否则父节点勾不上
        const uniqueArray = parentId.filter(
          (item, index) => parentId.indexOf(item) === index
        );
        const uniqueArray1 = childId.filter(
          (item, index) => childId.indexOf(item) === index
        );

        uniqueArray1.forEach((item) => {
          treeRef.value.setChecked(item, true); //设置父节点高亮
        });
        uniqueArray.forEach((item) => {
          treeRef.value.setChecked(item, true); //设置父节点高亮
        });
      }
    }
  });
};
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
const handleSubmit = async () => {
  if (!submitState.value) {
    {
      resetForm();
      return;
    }
  }
  if (props.userType == "role") {
    handleSubmitForm();
  } else {
    const data = {
      roleId: ruleFormId.value,
      roleName: roleName.value,
      menuIds: checkedKeysArr.value,
    };

    const submitTree = {
      moduleCode: "roleMenu",

      status: 0,
      auditStatus: 0,
      operParam: JSON.stringify(data),
    };
    const serviceLoading = ElLoading.service({
      lock: true,
      text: "加载中...",
      background: "rgba(0, 0, 0, 0.7)",
    });
    submitAuditApi("config", submitTree)
      .then((res) => {
        ElMessage({
          message: "操作成功,等待审核",
          type: "success",
          duration: 3 * 1000,
        });
        serviceLoading.close();
        resetForm();
      })
      .catch((error) => {
        serviceLoading.close();
      });
  }
};

//重置表单数据
const resetForm = () => {
  formDialogVisible.value = false;
  ruleFormId.value = "";
  ruleFormReadonly.value = false;

  if (props.userType == "roleMenu") {
    treeData.value = [];
    return;
  }
  ruleFormRef.value.resetFields();
  Object.keys(ruleForm.value).forEach((key) => {
    ruleForm.value[key] = "";
  });
};
const handleSubmitRole = () => {
  ruleUserFormRef.value.validate((valid) => {
    if (valid) {
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
        dialogVisible.value = false;
      });
    } else {
      loading.value = false;
    }
  });
};
defineExpose({
  initChange,
  inFoChange,
  infoQuery,
});
</script>

<style scoped lang="less">
.el-dialog {
  overflow-y: auto;
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
