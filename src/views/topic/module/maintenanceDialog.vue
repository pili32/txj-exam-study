<template>
  <div class="main-container1" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="dialogTitle"
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
        <el-form-item label="上层分类" v-if="parentName">
          <el-input v-model="parentName" readonly v-if="!rowId" />
          <el-tree-select
            v-else
            style="max-width: 100%"
            v-model="parentName"
            :data="filteredpropsTree"
            node-key="id"
            default-expand-all
            :props="props.defaultProps"
            ref="treeRef"
            :highlight-current="true"
            @node-click="handleNodeClick"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="ruleForm.name"
            :readonly="formReadlony"
            placeholder="请输入名称"
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
            v-model="ruleForm.sort"
            :readonly="formReadlony"
            placeholder="排序"
            type="number"
          />
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>
<script setup>
import { saveApi, queryByIdApi, updateApi } from "@/api/topic";

import { ref, reactive, defineExpose, watch, nextTick, computed } from "vue";
const dialogTitle = ref("新增分类");
const submitData = ref({
  moduleCode: "dept",
  status: 0,
  auditStatus: 0,
  operParam: {},
});

const parentName = ref(""); //父级菜单名称
const rowId = ref("");
const loading = ref(false);
let parentId = ref("1");
const props = defineProps({
  formReadlony: {
    type: Boolean,
    default: () => false,
  },
  defaultProps: {
    type: Object,
    default: () => {},
  },
  propsTree: {
    type: Array,
    default: () => {},
  },
});
watch(
  () => props.formReadlony,
  (val) => {
    if (val) ruleFormReadonly.vlaue = true;
  }
);
const emit = defineEmits(["childEvent"]);
const ruleForm = reactive({
  name: "",
  description: "",
  sort: 0,
});
const ruleFormId = ref("");
const rules = reactive({
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入描述", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
});
const ruleFormRef = ref(null);
const dialogVisible = ref(false);
const treeRef = ref(null);
const initChange = async (obj) => {
  dialogVisible.value = true;
  parentName.value = obj.parentName;
  parentId.value = obj.treeId;
  ruleForm.parentId = obj.treeId;
  if (obj.rowId) {
    rowId.value = obj.rowId;
    editChange(obj.rowId);
    nextTick();
    console.log(treeRef.value);
    nextTick(() => {
      if (treeRef.value && obj.treeId) {
        treeRef.value.setCurrentKey(obj.treeId);
      }
    });
  }
};

const inFoChange = (obj) => {
  dialogVisible.value = true;

  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = obj[key];
  });
};

// 计算过滤后的树数据
const filteredpropsTree = computed(() => {
  const clonedData = JSON.parse(JSON.stringify(props.propsTree)); //进行深拷贝，以免影响原始数据
  const filterTree = (nodes) => {
    return nodes.filter((node) => {
      // 保留id为0或parentId为0的节点
      if (node.id === "0" || node.parentId === "0") {
        // 如果有子节点，递归过滤
        if (node.children && node.children.length > 0) {
          node.children = filterTree(node.children);
        }
        return true;
      }
      return false;
    });
  };
  return filterTree(clonedData);
});

const handleNodeClick = (data) => {
  console.log(data);
  ruleForm.parentId = data.id;
  parentName.value = data.name;
};

const editChange = (val) => {
  dialogTitle.value = "编辑菜单";
  ruleFormId.value = val;
  queryByIdApi(val).then((res) => {
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
  dialogVisible.value = false;
  parentId.value = "";
  ruleFormId.value = "";
  rowId.value = "";
  ruleFormRef.value.resetFields();
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
};

//提交数据新增和修改的提交
const handleSubmit = async () => {
  loading.value = true;

  await ruleFormRef.value.validate((valid) => {
    if (valid) {
      const serviceLoading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      if (rowId.value) {
        ruleForm.id = rowId.value;
        updateApi(ruleForm)
          .then((res) => {
            ElMessage({
              message: "操作成功",
              type: "success",
              duration: 3 * 1000,
            });
            dialogVisible.value = false;
            serviceLoading.close();

            emit("childEvent");
            resetForm();
          })
          .catch((error) => {
            serviceLoading.close();
          });
      } else {
        // updateApi
        saveApi(ruleForm)
          .then((res) => {
            ElMessage({
              message: "操作成功",
              type: "success",
              duration: 3 * 1000,
            });
            dialogVisible.value = false;
            serviceLoading.close();

            emit("childEvent");
            resetForm();
          })
          .catch((error) => {
            serviceLoading.close();
          });
      }

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
});
</script>

<style lang="less">
@import "@/styles/system.css";
</style>
