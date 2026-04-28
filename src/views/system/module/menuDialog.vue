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
        <el-form-item label="上层菜单" v-if="parentName">
          <el-input v-model="parentName" readonly />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input
            v-model="ruleForm.path"
            :readonly="formReadlony"
            placeholder="请输入路径"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="ruleForm.name"
            type="name"
            :readonly="formReadlony"
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item label="地址" prop="url">
          <el-input
            v-model="ruleForm.url"
            type="url"
            :readonly="formReadlony"
            placeholder="请输入地址"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input
            v-model="ruleForm.icon"
            type="icon"
            :readonly="formReadlony"
            placeholder="请输入图标"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="ruleForm.description"
            :readonly="formReadlony"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input
            type="number"
            v-model="ruleForm.sort"
            :readonly="formReadlony"
            placeholder="请输入排序"
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
import { ref, reactive } from "vue";
import { submitAuditApi, getMenuQueryById } from "@/api/system";
import BaseDialog from "@/components/BaseDialog.vue";

const props = defineProps({
  formReadlony: {
    type: Boolean,
    default: () => false,
  },
  title: {
    type: String,
    default: () => "新增子菜单",
  },
});
const dialogVisible = ref(false);
const ruleFormRef = ref(null);
const ruleFormId = ref("");
const footerButton = ref(false);
const submitState = ref(true);

const ruleForm = reactive({
  path: "",
  name: "",
  url: "",
  icon: "",
  description: "",
  parentId: "0",
  sort: null,
  parentName: "",
});
const rules = reactive({
  path: [{ required: true, message: "请输入菜单路径", trigger: "blur" }],
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  url: [{ required: true, message: "请输入地址", trigger: "blur" }],
  icon: [{ required: true, message: "请输入图标名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入菜单描述", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
});

const submitData = ref({
  moduleCode: "menu",
  operParam: {},
});

const emit = defineEmits(["childEvent"]);
const parentName = ref(""); //父级菜单名称
const loading = ref(false);

const initChange = (obj) => {
  dialogVisible.value = true;
  parentName.value = obj.parentName;
  ruleForm.parentName = obj.parentName;
  if (obj.rowId) {
    editChange(obj.rowId);
  }
  if (obj.treeId) {
    ruleForm.parentId = obj.treeId;
  }
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
        type = "add";
      }
      const serviceLoading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      submitData.value.operParam = JSON.stringify(ruleForm);
      submitAuditApi(type, submitData.value)
        .then((res) => {
          ElMessage({
            message: "操作成功,等待审核",
            type: "success",
            duration: 3 * 1000,
          });
          dialogVisible.value = false;
          emit("childEvent");
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

const editChange = (id) => {
  ruleFormId.value = id;
  getMenuQueryById(id).then((res) => {
    if (res.code == 200) {
      dialogVisible.value = true;
      Object.keys(ruleForm).forEach((key) => {
        ruleForm[key] = res.data[key];
      });
    }
  });
};

//重置表单数据
const resetForm = () => {
  ruleFormRef.value.resetFields();
  dialogVisible.value = false;
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
  parentName.value = "";
  ruleFormId.value = "";
};

const inFoChange = (obj, button) => {
  dialogVisible.value = true;
  footerButton.value = button;
  submitState.value = false;

  // if(state == 2) {
  //   editChange(obj.id)
  //   return
  // }

  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = obj[key];
  });
  parentName.value = obj.parentName;
};
const infoQuery = (param, button) => {
  dialogVisible.value = true;
  footerButton.value = button;
  getMenuQueryById(param.id).then((res) => {
    Object.keys(ruleForm).forEach((key) => {
      ruleForm[key] = res.data[key];
      parentName.value = res.data.parentName;
    });
  });
};

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
.footer-btn {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
