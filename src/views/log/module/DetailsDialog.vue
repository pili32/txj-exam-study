<template>
  <div class="main-container1" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      @confirm="resetForm"
      @close="resetForm"
    >
      <el-form
        :model="ruleForm"
        label-width="100px"
        ref="ruleFormRef"
        :rules="rules"
      >
        <el-form-item label="请求参数:">
          <el-input
            type="textarea"
            v-model="ruleForm.operParam"
            readonly
            :rows="5"
          ></el-input>
        </el-form-item>
        <el-form-item label="请求结果:">
          <el-input
            type="textarea"
            v-model="ruleForm.jsonResult"
            readonly
            :rows="5"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="错误信息:">
          <el-input
            type="textarea"
            v-model="ruleForm.errorMsg"
            readonly
            :rows="5"
          ></el-input>
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>
<script setup>
import { ref, reactive, defineExpose, watch } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";

const dialogTitle = ref("系统用户日志查看");
const ruleForm = reactive({
  operParam: "",
  jsonResult: "",
  errorMsg: "",
});
const ruleFormId = ref("");
const emit = defineEmits(["childEvent"]);
const dialogVisible = ref(false);

const initChange = (obj) => {
  dialogVisible.value = true;
  const { operParam, jsonResult, errorMsg } = obj;
  const objData = { operParam, jsonResult, errorMsg };
      for (let key in objData) {
        if (key != "errorMsg") {
          ruleForm[key] =jsonPretty(objData[key]);
        }
      }
};

const ruleFormRef = ref(null);

//重置表单数据
const resetForm = () => {
  dialogVisible.value = false;
  ruleFormRef.value.resetFields();
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
};

const jsonPretty = (value) => {
  // 检查传入的 value 是否存在
  if (value) {
    // 使用 JSON.parse 将传入的 JSON 字符串解析为 JavaScript 对象
    let data = JSON.parse(value);
    return JSON.stringify(data, null, 2);
    // 使用 JSON.stringify 将 JavaScript 对象转换为格式化的 JSON 字符串
    // 第二个参数 null 表示不进行替换，第三个参数 2 表示缩进级别为 2 个空格
  }
  // 如果传入的 value 不存在，则返回空字符串
  return "";
};

defineExpose({
  initChange,
});
</script>

<style lang="less">
@import "@/styles/system.css";
</style>
