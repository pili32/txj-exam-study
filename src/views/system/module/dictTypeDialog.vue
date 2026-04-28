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
              <el-form-item label="类别编码" prop="typeCode">
                <el-input
                  v-model="ruleForm.typeCode"
                  :readonly="ruleFormReadonly"
                  placeholder="请输入类别编码"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="类别名称" prop="typeName">
                <el-input
                  v-model="ruleForm.typeName"
                  :readonly="ruleFormReadonly"
                  placeholder="请输入类别名称"
                />
              </el-form-item>
            </el-col>

          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="备注">
                <el-input
                  v-model="ruleForm.remark"
                  :readonly="formReadlony"
                  placeholder="请输入备注"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
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
  dictTypeQueryById,
  sysDictTypeSave,
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

const ruleUserForm = reactive({
  ids: [],
});
// const { securityData } = storeToRefs(systemStore()); //引入store

const emit = defineEmits(["childEvent"]);
const parentName = ref(""); //父级菜单名称
const dialogLoading = ref(false);
const loading = ref(false);
const ruleFormReadonly = ref(false); //表单是否可以编辑
const initChange = (obj) => {
  dialogVisible.value = true;
  if (obj.rowId) {
    editChange(obj.rowId);
  }

};

let checkedKeysArr = ref([]); //获取到的选择的tree数据

//编辑菜单
const editChange = (id) => {
  ruleFormId.value = id;
  dictTypeQueryById(id).then((res) => {
    if (res.code == 200) {
      dialogVisible.value = true;
      ruleFormReadonly.value = false;
      Object.keys(ruleForm).forEach((key) => {
        ruleForm[key] = res.data[key];
      });
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

const ruleForm = reactive({
  typeName: "",
  typeCode: "",
  remark: "",
});

const submitData = ref({
  moduleCode: "dictType",
  // auditStatus: 0,
  operParam: {},
});
const ruleFormId = ref("");

const inFoChange = (obj, state, button) => {
  dialogVisible.value = true;

  footerButton.value = button;
  submitState.value = false;
  ruleFormReadonly.value = true;
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = obj[key];
  });

};

const rules = reactive({
  typeName: [{ required: true, message: "请输入类别名称", trigger: "blur" }],
  typeCode: [{ required: true, message: "请输入类别Code", trigger: "blur" }],
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
            message: "操作成功,",
            type: "success",
            duration: 3 * 1000,
          });
          dialogVisible.value = false;
          serviceLoading.close()
          emit("childEvent");

          resetForm();
        })
        .catch((error) => {
          serviceLoading.close()
          loading.value = false;
        });
      return;
    } else {
      loading.value = false;
    }
  });
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

//
const examineChange = (val) => {
  emit("childEvent", val);
  resetForm();
};
defineExpose({
  initChange,
  inFoChange,
});
</script>

<style lang="less" scoped>
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
