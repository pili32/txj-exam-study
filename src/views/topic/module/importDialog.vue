<template>
  <div class="main-container-box" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :confirm-loading="loading"
      @confirm="handleSubmit"
      @close="resetForm"
    >
      <el-form
        :model="ruleForm"
        label-width="110px"
        ref="ruleFormRef"
        :rules="rules"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item label="题干" prop="title">
              <el-input
                v-model="ruleForm.title"
                :readonly="formReadlony"
                type="textarea"
                placeholder="请输入题干"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="题目所属文件" prop="sourceCode">
              <!-- <el-input v-model="ruleForm.analysis" :readonly="formReadlony" /> -->
              <el-select
                v-model="ruleForm.sourceCode"
                placeholder="请选择题目所属文件"

                prop="type"
              >
                <el-option
                  v-for="item in questionFileData"
                  :key="item.valueCode"
                  :label="item.valueName"
                  :value="item.valueCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="题目类型" prop="type">
              <!-- <el-input v-model="ruleForm.analysis" :readonly="formReadlony" /> -->
              <el-select
                v-model="ruleForm.type"
                placeholder="请选择题目类型"
                @change="slectChange"
                prop="type"
              >
                <el-option
                  v-for="item in props.topicType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="题目分类" prop="categoryId">
              <el-tree-select
                v-model="ruleForm.categoryId"
                :data="tree"
                :props="defaultProps"
                @node-click="handleNodeClick"
                default-expand-all
                placeholder="请选择题目分类"
                style="min-width: 220px"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="题目选项" prop="options" v-if="ruleForm.type != 4">
          <div class="option-box">
            <div
              class="container-option"
              v-for="option in question.options"
              :key="option.value"
            >
              <span>{{ option.value }}</span>

              <el-input v-model="option.text" placeholder="请输入选项" />
              <el-button
                @click="removeOptionHandler(option.id)"
                class="remove-btn"
                v-if="question.options.length > 1"
              >
                x
              </el-button>
            </div>
            <div class="option-btn">
              <el-button type="primary" size="small" @click="addOptionHandler"
                >新增</el-button
              >
              <!-- <el-button
                type="primary"
                size="small"
                @click="removeOptionHandler()"
                >删除</el-button
              > -->
            </div>
          </div>
        </el-form-item>
        <el-form-item label="题目答案" prop="answer">
          <el-input
            v-model="ruleForm.answer"
            :readonly="formReadlony"
            placeholder="请输入答案"
          />
        </el-form-item>
        <el-form-item label="答案解析">
          <el-input
            v-model="ruleForm.analysis"
            :readonly="formReadlony"
            type="textarea"
            placeholder="请输入答案解析"
          />
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>
<script setup>
import {
  saveQuestionApi,
  questionQueryByIdApi,
  questionUpdate,
} from "@/api/topic";
import {
  ref,
  reactive,
  defineExpose,
  watch,
  shallowRef,
  triggerRef,
} from "vue";
import { ElLoading } from 'element-plus'

const dialogTitle = ref("题库导入");
const submitData = ref({
  moduleCode: "dept",
  status: 0,
  auditStatus: 0,
  operParam: {},
});

const question = ref({
  id: 1,
  title: "示例题目",
  options: [{ id: 1, text: "", value: "A." }],
});
const loading = ref(false);
const ruleFormRef = ref(null);
const dialogVisible = ref(false);
const props = defineProps({
  formReadlony: {
    type: Boolean,
    default: () => false,
  },
  tree: {
    type: Array,
    default: () => [],
  },
  topicType: {
    type: Array,
    default: () => [],
  },
  questionFileData: {
    type: Array,
    default: () => [],
  },
});
const defaultProps = {
  children: "children",
  label: "name",
  value: "id",
};
watch(
  () => props.formReadlony,
  (val) => {
    if (val) ruleFormReadonly.vlaue = true;
  }
);
const emit = defineEmits(["childEvent"]);
const initChange = (obj) => {
  dialogVisible.value = true;
  if (obj.rowId) {
    editChange(obj.rowId);
  }
};

const inFoChange = (obj) => {
  dialogVisible.value = true;

  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = obj[key];
  });
};

const addOptionHandler = () => {
  if (question.value.options.length === 0) {
    // 如果没有选项，从A开始
    question.value.options.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: "",
      value: "A.",
    });
  } else {
    // 获取最后一个选项的value
    const lastOption =
      question.value.options[question.value.options.length - 1];
    const lastChar = lastOption.value;

    // 计算下一个字母
    const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1) + ".";

    // 添加新选项
    question.value.options.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: "",
      value: nextChar,
    });
  }
};

const slectChange = (event) => {
  if(event != 4) {
      question.value.options = [{ id: 1, text: "", value: "A." }];
  } else {
    question.value.options = []
  }
  // ruleForm.categoryId = event

  // const data  =  props.topicType.find( item =>item.value == event)
  // ruleForm.categoryName = data.label
};
const removeOptionHandler = (optionId) => {

  question.value.options = question.value.options.filter(
    (opt) => opt.id !== optionId
  );
  // 重新计算选项字母

  question.value.options.forEach((opt, index) => {

    opt.value = String.fromCharCode("A".charCodeAt(0) + index)+'.';
  });
};
const editChange = (val) => {
  ruleFormId.value = val;
  questionQueryByIdApi(val).then((res) => {
    if (res.code == 200) {
      dialogVisible.value = true;
      Object.keys(ruleForm).forEach((key) => {
        if (key == "type") {
          ruleForm["type"] = res.data["type"].toString();
        } else {
          ruleForm[key] = res.data[key];
        }
      });
    }

    const data = res.data.option.split("|");

    question.value.options = data.map((item) => {
      let parts = item.split("."); // 分割字符串
      if (parts.length > 1) {
            parts = [parts[0]].concat(parts.slice(1).join(".")); // 只保留第一部分，其余部分重新连接
        }
      return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        text: parts[1],
        value:parts[0] + ".",
      };
    });

    // options: [{ id: 1, text: "", value: "A" }],
  });
};

const ruleForm = reactive({
  type: "",
  title: "",
  categoryName: "",
  categoryId: "",
  sourceCode: "",
  analysis: "",
  option: "",
  answer: "",
});
const ruleFormId = ref("");

const validateAnswer = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入答案"));
  } else {
    const regexp = new RegExp(/[^A-Z]/);
    //当type不等于填空题时必须输入大写
    if (ruleForm.type != 4 && ruleForm.type) {
      if (/[^A-Z]/.test(value)) {
        callback(new Error("请输入大写答案"));
      }
    }

    callback();
  }
};

const rules = reactive({
  title: [{ required: true, message: "请输入题干", trigger: "blur" }],
  type: [{ required: true, message: "请选择题目类型", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择题目分类", trigger: "blur" }],
  sourceCode: [
    { required: true, message: "请选择题目所属文件", trigger: "blur" },
  ],

  analysis: [{ required: true, message: "请输入答案解析", trigger: "blur" }],
  option: [{ required: true, message: "请输入题目选项", trigger: "blur" }],

  answer: [{ required: true, validator: validateAnswer, trigger: "blur" }],
});
const handleNodeClick = (checkedNode) => {
  ruleForm.categoryId = checkedNode.id;
  ruleForm.categoryName = checkedNode.name;
};

//重置表单数据
const resetForm = () => {
  dialogVisible.value = false;
  ruleFormId.value = "";
  ruleFormRef.value.resetFields();
  question.value.options = [{ id: 1, text: "", value: "A." }];
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
};

//提交数据新增和修改的提交
const handleSubmit = async () => {
  const state = await ifOption();


  ruleForm.option = await filterOptions();
  await ruleFormRef.value.validate((valid) => {
    if (valid) {
      if (!state && ruleForm.type != "4") {
        ElMessage({
          message: "题目选项不能为空",
          type: "error",
          duration: 3 * 1000,
        });
        return;
      }
      const loading = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      if (ruleFormId.value) {
        ruleForm.id = ruleFormId.value;
        questionUpdate(ruleForm).then((res) => {
          if (res.code == 200) {
            ElMessage({
              message: "操作成功",
              type: "success",
              duration: 3 * 1000,
            });
            loading.close()
            dialogVisible.value = false;
            emit("childEvent");
            delete ruleForm.id;
            resetForm();
          }
        }).catch(error =>{
          loading.close()

        });
      } else {
        saveQuestionApi(ruleForm)
          .then((res) => {
            ElMessage({
              message: "操作成功",
              type: "success",
              duration: 3 * 1000,
            });
            loading.close()

            dialogVisible.value = false;
            emit("childEvent");
            resetForm();
          })
          .catch((error) => {
            loading.close()

          });
      }
      return;
    } else {

    }
  });
};

const filterOptions = () => {
  let data = "";

  question.value.options.forEach((item, index) => {
    let str = index == question.value.options.length - 1 ? "" : "|";
    let value = item.value + item.text + str;
    data += value;
  });
  return data;
};

const ifOption = () => {
  const data = question.value.options.filter((item) => !item.text);
  if (data.length > 0) return false;
  else return true;
};
defineExpose({
  initChange,
  inFoChange,
});
</script>
<style lang="less">
@import "@/styles/system.css";
.option-box {
  width: 100%;
  .container-option {
    display: flex;
    width: 100%;
    margin: 3px 0;
  }
  .option-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
  .remove-btn {
    margin-left: 10px;
  }
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
</style>
