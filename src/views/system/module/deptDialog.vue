<template>
  <div class="main-container1" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="title"
      :confirm-loading="loading"
      @confirm="handleSubmit"
      @close="resetForm"
    >
      <el-form
        :model="ruleForm"
        label-width="100px"
        ref="ruleFormRef"
        :rules="rules"
      >
        <el-form-item label="上级部门" prop="deptName" v-if="ruleForm.parentName">
          <el-input v-model="ruleForm.parentName" readonly />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="ruleForm.deptName"
            :readonly="formReadlony"
            placeholder="请输入部门名称"
          />
        </el-form-item>
        <el-form-item label="电话">
          <el-input
            v-model="ruleForm.phone"
            type="number"
            placeholder="请输入电话"
            :readonly="formReadlony"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input
            v-model="ruleForm.sort"
            type="number"
            placeholder="请输入排序"
            :readonly="formReadlony"
          />
        </el-form-item>
      </el-form>
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
import { submitAuditApi, deptQueryById, getDeptTreeApi } from "@/api/system";
import BaseDialog from "@/components/BaseDialog.vue";

import { ref, reactive, defineExpose, watch } from "vue";
const submitData = ref({
  moduleCode: "dept",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const loading = ref(false);
let childId = ref("1");
const props = defineProps({
  formReadlony: {
    type: Boolean,
    default: () => false,
  },
  title: {
    type: String,
    default: () => "新增子部门",
  },
});
const ruleForm = reactive({
  phone: "",
  deptName: "",
  sort: null,
  parentId: "",
  parentName: "",
});
const ruleFormId = ref("");
const rules = reactive({
  deptName: [{ required: true, message: "请输入菜单路径", trigger: "blur" }],
  phone: [{ required: true, message: "请输入名称", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
});

watch(
  () => props.formReadlony,
  (val) => {

    if (val) ruleFormReadonly.vlaue = true;
  }
);
const emit = defineEmits(["childEvent"]);
const footerButton = ref(false);
const submitState = ref(true);
const initChange = (obj) => {
  dialogVisible.value = true;
  childId.value = obj.treeId;
  ruleForm.parentName = obj.parentName;
  if (obj.rowId) {
    editChange(obj.rowId);
  }
};

const inFoChange = (obj, state, button) => {
  dialogVisible.value = true;
  footerButton.value = button;
  submitState.value = false;

  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = obj[key];
  });
};

const infoQuery = (param, button) => {
  dialogVisible.value = true;
  footerButton.value = button;
  deptQueryById(param.id).then((res) => {
    Object.keys(ruleForm).forEach((key) => {
      ruleForm[key] = res.data[key];
    });
  });
};

const editChange = (val) => {
  ruleFormId.value = val;
  deptQueryById(val).then((res) => {
    if (res.code == 200) {
      dialogVisible.value = true;
      Object.keys(ruleForm).forEach((key) => {
        if (key == "parentName") {
          if (!ruleForm["parentName"]) {
            ruleForm['parentName'] = res.data['parentName'];
          }
        } else {
          ruleForm[key] = res.data[key];
        }
      });
    }
  });
};
const examineChange = (val) => {
  emit("childEvent", val);
  resetForm();
};
const ruleFormRef = ref(null);
const dialogVisible = ref(false);

//重置表单数据
const resetForm = () => {
  dialogVisible.value = false;
  childId.value = "";
  ruleFormId.value = "";
  ruleFormRef.value.resetFields();
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
};

//提交数据新增和修改的提交
const handleSubmit = async () => {
  if (!submitState.value) {
    {
      resetForm();
      return;
    }
  }

  loading.value = true;
  await ruleFormRef.value.validate((valid) => {
    if (valid) {
      let type = ref("");
      //判断当前获取到列表的id，进行编辑保存
      if (ruleFormId.value) {
        type = "update";
        ruleForm.id = ruleFormId.value;
      } else {
        ruleForm.parentId = childId.value;
        type = "add";
      }
      submitData.value.operParam = JSON.stringify(ruleForm);
      const serviceLoading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      submitAuditApi(type, submitData.value)
        .then((res) => {
          ElMessage({
            message: "操作成功,等待审核",
            type: "success",
            duration: 1 * 1000,
          });
          dialogVisible.value = false;
          serviceLoading.close()

          emit("childEvent");
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
};
defineExpose({
  initChange,
  inFoChange,
  infoQuery,
});
</script>

<style lang="less">
@import "@/styles/system.css";
</style>
