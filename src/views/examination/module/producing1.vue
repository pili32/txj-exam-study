<template>
  <div class="main-container1" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :confirm-loading="dialogLoading"
      @confirm="handleSubmit"
      width="60%"
      @close="resetForm"
    >
      <el-form
        :model="ruleForm"
        label-width="120px"
        ref="ruleFormRef"
        :rules="rules"
        style="max-height: 450px; overflow-y: auto"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item label="试卷名" prop="name">
              <el-input
                v-model="ruleForm.name"
                :readonly="formReadlony"
                placeholder="请输入试卷名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12"> </el-col>
        </el-row>
        <el-row>
          <!--
                  :check-strictly="true"父子不互相关联

              -->
          <el-col :span="24">
            <el-form-item label="题目分类" prop="categoryIds">
              <el-tree-select
                v-model="ruleForm.categoryId"
                :data="tree"
                :props="defaultProps"
                @node-click="handleNodeClick"
                @check-change="handleNodeClick"
                node-key="id"
                ref="treeRef"
                placeholder="请选择题目分类"
                style="min-width: 280px"
                multiple
                show-checkbox
                :default-expand-all="true"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <template v-for="(child, index) in nodesName" :key="index">
          <div>
            <el-row>
              <el-col :span="24">
                <el-form-item label="题目分类名称">
                  <span>{{ child.name }}</span>
                  <!-- <span>{{ child.value }}</span> -->

                  <span
                    >（题库数量：单选题{{ child.value.type1 }}、多选题{{
                      child.value.type2
                    }}、判断题{{ child.value.type3 }}、填空题{{
                      child.value.type4
                    }}）</span
                  >
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="单选题数量" prop="singleChoiceCount">
                  <!-- <el-input
                    v-model="ruleForm.singleChoiceCount[index]"
                    :readonly="formReadlony"
                    type="number"
                    placeholder="请输入单选题数量"
                  /> -->
                  <!-- <el-input-number
                    v-model.number="ruleForm.singleChoiceCount[index]"
                    :min="0"
                    @change="handleChange"
                  /> -->
                  <el-input-number
                    v-model="ruleForm.singleChoiceCount[child.id]"
                    :min="0"
                    @change="
                      inputChange(
                        $event,
                        child.id,
                        child.value.type1,
                        'singleChoiceCount'
                      )
                    "
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单选题分数" prop="singleChoiceScore">
                  <!-- <el-input
                    v-model="ruleForm.singleChoiceScore[index]"
                    :readonly="formReadlony"
                    type="number"
                    placeholder="请输入单选题分数"
                    min="0"
                  /> -->

                  <el-input-number
                    v-model="ruleForm.singleChoiceScore[child.id]"
                    :min="0"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="多选题数量" prop="multipleChoiceCount">
                  <!-- <el-input
                    v-model="ruleForm.multipleChoiceCount[index]"
                    :readonly="formReadlony"
                    type="number"
                    placeholder="请输入多选题数量"
                    min="0"
                  /> -->

                  <el-input-number
                    v-model="ruleForm.multipleChoiceCount[child.id]"
                    :min="0"
                    @change="
                      inputChange(
                        $event,
                        child.id,
                        child.value.type2,
                        'multipleChoiceCount'
                      )
                    "
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="多选题分数" prop="multipleChoiceScore">
                  <!-- <el-input
                    v-model="ruleForm.multipleChoiceScore[index]"
                    :readonly="formReadlony"
                    type="number"
                    placeholder="请输入多选题分数"
                    min="0"
                  /> -->

                  <el-input-number
                    v-model="ruleForm.multipleChoiceScore[child.id]"
                    :min="0"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="判断题数量 " prop="trueFalseCount">
                  <!-- <el-input
                    v-model="ruleForm.trueFalseCount[index]"
                    :readonly="formReadlony"
                    type="number"
                    placeholder="请输入判断题数量"
                    min="0"
                  /> -->

                  <el-input-number
                    v-model="ruleForm.trueFalseCount[child.id]"
                    :min="0"
                    @change="
                      inputChange(
                        $event,
                        child.id,
                        child.value.type3,
                        'trueFalseCount'
                      )
                    "
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="判断题分数" prop="trueFalseScore">
                  <!-- <el-input
                    v-model="ruleForm.trueFalseScore[index]"
                    :readonly="formReadlony"
                    type="number"
                    placeholder="请输入判断题分数"
                    min="0"
                  /> -->

                  <el-input-number
                    v-model="ruleForm.trueFalseScore[child.id]"
                    :min="0"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="填空题数量 " prop="fillBlankCount">
                  <!-- <el-input
                    v-model="ruleForm.fillBlankCount[index]"
                    :readonly="formReadlony"
                    type="number"
                    placeholder="请输入填空题数量"
                    min="0"
                  /> -->

                  <el-input-number
                    v-model="ruleForm.fillBlankCount[child.id]"
                    :min="0"
                    @change="
                      inputChange(
                        $event,
                        child.id,
                        child.value.type4,
                        'fillBlankCount'
                      )
                    "
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="填空题分数" prop="fillBlankScore">
                  <!-- <el-input
                    v-model="ruleForm.fillBlankScore[index]"
                    :readonly="formReadlony"
                    type="number"
                    placeholder="请输入填空题分数"
                    min="0"
                  /> -->
                  <el-input-number
                    v-model="ruleForm.fillBlankScore[child.id]"
                    :min="0"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </template>

        <el-row>
          <el-col :span="24">
            <el-form-item label="总分数">
              <el-input
                v-model="sumTotalScore"
                type="number"
                placeholder="请输入总分数"
                min="0"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="12">
            <el-form-item label="题目所属文件">
              <el-select
                v-model="ruleForm.sourceCodeList"
                placeholder="请选择题目所属文件"
                :multiple="true"
                prop="type"

              >
                <el-option
                  v-for="item in fileData"
                  :key="item.valueCode"
                  :label="item.valueName"
                  :value="item.valueCode"
                />
              </el-select>
            </el-form-item>

          </el-col>
          <el-col :span="12">
            <el-form-item label="题目分类">
              <el-tree-select
                v-model="ruleForm.categoryIds"
                :data="tree"
                :props="defaultProps"
                @node-click="handleNodeClick"
                @check-change="handleNodeClick"
                placeholder="请选择题目分类"
                node-key="id"
                ref="treeRef"
                multiple
                show-checkbox
                :default-expand-all="true"
                style="min-width: 280px"
              />
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col :span="12" v-if="false">
            <el-form-item label="是否手动选题" prop="isSelfChoose">
              <el-select
                v-model="ruleForm.isSelfChoose"
                placeholder="请选择是否手动选题"
                :disabled="formReadlony"
                @change="chooseChange"
              >
                <el-option
                  v-for="item in chooseData"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试卷类型" prop="paperType">
              <el-select
                v-model="ruleForm.paperType"
                placeholder="请选择试卷类型"
                @change="paperTypeChange"
                :disabled="paperTypeDisabled"
                popper-class="custom-select-dropdown"
              >
                <el-option
                  v-for="item in paperTypeData"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div v-if="paperTypeDisabled" class="type-calss">
        <span>题目已选择：</span>
        <span>单选题{{ selectTypeAllLng.typeOneLng || 0 }}题，</span>
        <span>多选题{{ selectTypeAllLng.typeTwoLng || 0 }}题，</span>
        <span>判断题{{ selectTypeAllLng.typeThreeLng || 0 }}题，</span>
        <span>填空题{{ selectTypeAllLng.typeFourLng || 0 }}题</span>
      </div>
    </BaseDialog>
  </div>
  <producingTable
    ref="tableRef"
    :topicType="topicType"
    :categoryIds="ruleForm.categoryIds"
    @tableEvent="tableCallbackChange"
    dialogTitle="选择题目"
  ></producingTable>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from "vue";
import producingTable from "@/components/module/producingTable.vue";
import {
  paperSaveApi,
  paperqQueryById,
  getQuestionCountByCategoryIds,
} from "@/api/examination";
import { systemStore } from "@/stores/common.js";

const props = defineProps({
  tree: {
    type: Array,
    default: () => [],
  },
  paperTypeData: {
    type: Array,
    default: () => [],
  },
  chooseData: {
    type: Array,
    default: () => [],
  },
  userType: {
    type: String,
    default: "user",
  },
  formReadlony: {
    type: Boolean,
    default: () => false,
  },
  fileData: {
    type: Array,
    default: () => [],
  },
});

watch(
  () => props.formReadlony,
  (val) => {
    if (val) ruleFormReadonly.vlaue = true;
  }
);

const defaultProps = {
  children: "children",
  label: "name",
  value: "id",

};
const dialogVisible = ref(false);
const footerButton = ref(false);
const tableRef = ref("");

const emit = defineEmits(["childEvent"]);
const dialogLoading = ref(false);
const loading = ref(false);
const ruleFormReadonly = ref(false); //表单是否可以编辑
const treeRef = ref();
const rowId = ref("");
const examData = ref([]);
const chooseQuestionsData = ref([]);
const nodesName = ref([]);
let questionCount = reactive([]);
const initChange = (obj) => {
  dialogVisible.value = true;
  if (obj.rowId) {
    rowId.vaue = obj.rowId;
    editChange(obj.rowId);
  }
};

let checkedKeysArr = ref([]); //获取到的选择的tree数据

//编辑菜单
const editChange = (id) => {
  dialogTitle.value = "试卷信息";
  paperqQueryById().then((res) => {
    if (res.code == 200) {
      Object.keys(ruleForm.value).forEach((key) => {
        ruleForm.value[key] = res.data[key];
      });
    }
  });
};

const ruleFormRef = ref(null);
const examIds = ref([]);

const dialogTitle = ref("新增试卷");
const ruleForm = ref({
  name: "", //试卷名称
  categoryIds: [], //题目分类
  singleChoiceCount: {}, //单选题数量
  singleChoiceScore: {}, //单选题分数
  trueFalseCount: {}, //判断题数量
  trueFalseScore: {}, //判断题分数
  multipleChoiceCount: {}, //多选题数量
  multipleChoiceScore: {}, //多选题分数
  fillBlankCount: {}, //填空题数量
  fillBlankScore: {}, //填空题分数
  totalScore: null, //总分数
  paperType: "", //试卷类型
  isSelfChoose: "", //是否单选多选
  chooseQuestions: [],
  sourceCodeList: [], //题目所属文件
});

const topicType = ref([
  {
    value: "1",
    label: "单选题",
  },

  {
    value: "2",
    label: "多选题",
  },
  {
    value: "3",
    label: "判断题",
  },
  {
    value: "4",
    label: "填空题",
  },
]);
const rules = reactive({
  name: [{ required: true, message: "请输入试卷名称", trigger: "blur" }],
  categoryIds: [{ required: true, message: "请选择题目分类", trigger: "blur" }],
  paperType: [{ required: true, message: "请选择试卷类型", trigger: "blur" }],
  isSelfChoose: [
    { required: true, message: "请选择是否手动选题", trigger: "blur" },
  ],

  singleChoiceCount: [
    { required: true, message: "请输入单选题数量", trigger: "blur" },
  ],
  singleChoiceScore: [
    { required: true, message: "请输入单选题分数", trigger: "blur" },
  ],
  trueFalseCount: [
    { required: true, message: "请输入判断题数量", trigger: "blur" },
  ],
  trueFalseScore: [
    { required: true, message: "请输入判断题分数", trigger: "blur" },
  ],
  multipleChoiceCount: [
    { required: true, message: "请输入多选题数量", trigger: "blur" },
  ],
  multipleChoiceScore: [
    { required: true, message: "请输入多选题分数", trigger: "blur" },
  ],
  fillBlankCount: [
    { required: true, message: "请输入填空题数量", trigger: "blur" },
  ],
  fillBlankScore: [
    { required: true, message: "请输入填空题分数", trigger: "blur" },
  ],
  sourceCodeList: [
    { required: true, message: "请输入题目所属文件", trigger: "blur" },
  ],

  totalScore: [{ required: true, message: "请输入总分数", trigger: "blur" }],
});

const paperTypeDisabled = ref(false);
//分配权限事件
const selectChange = (event) => {
  checkedKeysArr.value = event;
};
const submitData = ref({
  moduleCode: "user",
  // auditStatus: 0,
  operParam: {},
});

const inFoChange = (obj, state, button) => {
  dialogVisible.value = true;
  footerButton.value = button;
  if (state) {
    return;
  }

  ruleFormReadonly.value = true;
  Object.keys(ruleForm.value).forEach((key) => {
    ruleForm.value[key] = obj[key];
  });
};

const countChange = () => {
  const { totalScore } = ruleForm.value;
  return totalScore >= 100;
};

const sumTotalScore = computed(() => {
  // return Object.values(ruleForm.value.singleChoiceCount).reduce((sum, score) => sum + score, 0)+
  // Object.values(ruleForm.value.singleChoiceCount).reduce((sum, score) => sum + score, 0)+
  // Object.values(ruleForm.value.singleChoiceCount).reduce((sum, score) => sum + score, 0)+
  // Object.values(ruleForm.value.singleChoiceCount).reduce((sum, score) => sum + score, 0)+
  // Object.values(ruleForm.value.singleChoiceCount).reduce((sum, score) => sum + score, 0)+
  // Object.values(ruleForm.value.singleChoiceCount).reduce((sum, score) => sum + score, 0)
  const {
    singleChoiceCount,
    singleChoiceScore,
    trueFalseCount,
    trueFalseScore,
    multipleChoiceCount,
    multipleChoiceScore,
    fillBlankCount,
    fillBlankScore,
  } = ruleForm.value;
  // const singleChoiceTotal =  Object.values(singleChoiceCount).reduce((sum, score) => sum + score, 0) * Object.values(singleChoiceScore).reduce((sum, score) => sum + score, 0);
  // const trueFalseTotal = Object.values(trueFalseCount).reduce((sum, score) => sum + score, 0) * Object.values(trueFalseScore).reduce((sum, score) => sum + score, 0);
  // const multipleChoiceTotal = Object.values(multipleChoiceCount).reduce((sum, score) => sum + score, 0) * Object.values(multipleChoiceScore).reduce((sum, score) => sum + score, 0);;
  // const fillBlankTotal = Object.values(fillBlankCount).reduce((sum, score) => sum + score, 0) * Object.values(fillBlankScore).reduce((sum, score) => sum + score, 0);
  //  const singleChoiceTotal =  Object.values(singleChoiceCount).reduce((sum, score) => sum + score, 0)

  const singleChoiceTotal = Object.keys(singleChoiceCount).reduce(
    (acc, key) => {
      return acc + singleChoiceCount[key] * (singleChoiceScore[key] || 0);
    },
    0
  );
  const trueFalseTotal = Object.keys(trueFalseCount).reduce((acc, key) => {
    return acc + trueFalseCount[key] * (trueFalseScore[key] || 0);
  }, 0);
  const multipleChoiceTotal = Object.keys(multipleChoiceCount).reduce(
    (acc, key) => {
      return acc + multipleChoiceCount[key] * (multipleChoiceScore[key] || 0);
    },
    0
  );
  const fillBlankTotal = Object.keys(fillBlankCount).reduce((acc, key) => {
    return acc + fillBlankCount[key] * (fillBlankCount[key] || 0);
  }, 0);
  return (ruleForm.value.totalScore =
    singleChoiceTotal + trueFalseTotal + multipleChoiceTotal + fillBlankTotal);
});

// watch(
//   () =>sumTotalScore,
//   (val) => {
//     ruleForm.value.totalScore = val.value
//   },{deep:true}
// );

const selectTypeAllLng = ref({});
const filterExamChange = () => {
  const {
    singleChoiceCount,
    trueFalseCount,
    multipleChoiceCount,
    fillBlankCount,
  } = ruleForm.value;
  let flag = false;
  if (
    selectTypeAllLng.value.typeOneLng == singleChoiceCount &&
    selectTypeAllLng.value.typeTwoLng == multipleChoiceCount &&
    selectTypeAllLng.value.typeThreeLng == trueFalseCount &&
    selectTypeAllLng.value.typeFourLng == fillBlankCount
  ) {
    flag = true;
  }
  return flag;

  // singleChoiceCount: "", //单选题数量
  // singleChoiceScore: "", //单选题分数
  // trueFalseCount: "", //判断题数量
  // trueFalseScore: "", //判断题分数
  // multipleChoiceCount: "", //多选题数量
  // multipleChoiceScore: "", //多选题分数
  // fillBlankCount: "", //填空题数量
  // fillBlankScore: "", //填空题分数
};
//提交数据新增和修改的提交
const handleSubmit = async () => {
  let arr = [];
  for (var i = 0; i < nodesName.value.length; i++) {
    const name = nodesName.value[i].name;
    const id = nodesName.value[i].id;
    let obj = {
      categoryId: name,
      categoryName: id,
      config: {
        singleChoiceCount: ruleForm.value.singleChoiceCount[id],
        singleChoiceScore: ruleForm.value.singleChoiceScore[id],
        trueFalseCount: ruleForm.value.trueFalseCount[id],
        trueFalseScore: ruleForm.value.trueFalseScore[id],
        multipleChoiceCount: ruleForm.value.multipleChoiceCount[id],
        multipleChoiceScore: ruleForm.value.multipleChoiceScore[id],
        fillBlankCount: ruleForm.value.fillBlankCount[id],
        fillBlankScore: ruleForm.value.fillBlankScore[id],
      },
    };
    arr.push(obj);
  }
  const {
    categoryIds,
    isSelfChoose,
    name,
    paperType,
    totalScore,
    sourceCodeList,
  } = ruleForm.value;
  const params = {
    categoryConfigList: arr,
    categoryIds: categoryIds,
    isSelfChoose: isSelfChoose,
    name: name,
    paperType: paperType,
    totalScore: totalScore,
    sourceCodeList: sourceCodeList,
  };

  await ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const result = await countChange();
      // examData.value
      let flag = true;
      if (paperTypeDisabled.value) {
        flag = await filterExamChange();
      }

      if (!result) {
        ElMessage({
          message: "总分数应当不小于100分",
          type: "warning",
          duration: 3 * 1000,
        });
        return;
      }

      if (!flag) {
        ElMessage({
          message: "选择的题目类型数量与填写的题目类型数量不匹配",
          type: "warning",
          duration: 3 * 1000,
        });
        return;
      }


      dialogLoading.value = true;

      if (paperTypeDisabled.value) {
        ruleForm.value.chooseQuestions = chooseQuestionsData.value;
      } else {
        ruleForm.value.chooseQuestions = [];
      }

      paperSaveApi(ruleForm.value)
        .then((res) => {
          ElMessage({
            message: "操作成功",
            type: "success",
            duration: 3 * 1000,
          });
          dialogVisible.value = false;
          emit("childEvent");

          resetForm();
        })
        .catch((error) => {});
      dialogLoading.value = false;
      return;
    } else {
      dialogLoading.value = false;
    }
  });
};

//重置表单数据
const resetForm = () => {
  ruleFormRef.value.resetFields();
  Object.keys(ruleForm.value).forEach((key) => {
    ruleForm.value[key] = "";
  });
};

const tableCallbackChange = (data, typeAllLng) => {
  examData.value = data;
  examIds.value = data.map((item) => item.id);

  chooseQuestionsData.value = data.map((item) => {
    return {
      id: item.id,
      type: item.type,
    };
  });
  selectTypeAllLng.value = typeAllLng;
};
//题目分类事件
const handleNodeClick = (checkedNode) => {
  // ruleForm.value
  const keys = treeRef.value.getCheckedKeys(); //获取到当前所有选中的节点
  const nodes = treeRef.value.getCheckedNodes();
  const nodesList = nodes.map((item) => {
    return {
      name: item.name,
      id: item.id,
    };
  });

  ruleForm.value.categoryIds = keys;

  getQuestionCountByCategoryIds(ruleForm.value.categoryIds).then((res) => {
    questionCount = res.data;
    nodesList.forEach((item) => {
      item.value = res.data.find((e) => e.categoryId === item.id);
    });

    nodesList.forEach((item) => {
      if (!ruleForm.value.singleChoiceCount[item.id])
        ruleForm.value.singleChoiceCount[item.id] = 0;
      if (!ruleForm.value.singleChoiceScore[item.id])
        ruleForm.value.singleChoiceScore[item.id] = 0;
      if (!ruleForm.value.trueFalseCount[item.id])
        ruleForm.value.trueFalseCount[item.id] = 0;
      if (!ruleForm.value.trueFalseScore[item.id])
        ruleForm.value.trueFalseScore[item.id] = 0;
      if (!ruleForm.value.multipleChoiceCount[item.idi])
        ruleForm.value.multipleChoiceCount[item.id] = 0;
      if (!ruleForm.value.multipleChoiceScore[item.id])
        ruleForm.value.multipleChoiceScore[item.id] = 0;
      if (!ruleForm.value.fillBlankCount[item.id])
        ruleForm.value.fillBlankCount[item.id] = 0;
      if (!ruleForm.value.fillBlankScore[item.id])
        ruleForm.value.fillBlankScore[item.id] = 0;
    });

    nodesName.value = nodesList;
  });

  // 初始化新选择的分类的分数和答案
  //   nodesName.value.forEach(id => {
  //   if (!form.singleScores[id]) form.singleScores[id] = 0
  //   if (!form.multiScores[id]) form.multiScores[id] = 0
  //   if (!form.singleAnswers[id]) form.singleAnswers[id] = ''
  //   if (!form.multiAnswers[id]) form.multiAnswers[id] = []
  // })

  // for(var i=0;i< nodesName.value.length;i++){
  //   if (!ruleForm.value.singleChoiceCount[i]) ruleForm.value.singleChoiceCount[i] = 0
  //   if (!ruleForm.value.singleChoiceScore[i]) ruleForm.value.singleChoiceScore[i] = 0
  //   if (!ruleForm.value.trueFalseCount[i]) ruleForm.value.trueFalseCount[i] =0
  //   if (!ruleForm.value.trueFalseScore[i]) ruleForm.value.trueFalseScore[i] = 0
  //   if (!ruleForm.value.multipleChoiceCount[i]) ruleForm.value.multipleChoiceCount[i] = 0
  //   if (!ruleForm.value.multipleChoiceScore[i]) ruleForm.value.multipleChoiceScore[i] = 0
  //   if (!ruleForm.value.fillBlankCount[i]) ruleForm.value.fillBlankCount[i] = 0
  //   if (!ruleForm.value.fillBlankScore[i]) ruleForm.value.fillBlankScore[i] = 0
  // }
};
const handleRemoveTag = (removedTag) =>{
}
const filterTitleNum = async (id) => {
  await nextTick();
  let value = "";
  if (questionCount.length > 0) {
    const data = questionCount.find((item) => item.categoryId == id);
    if (data) {
      const { type1, type2, type3, type4 } = data;
      value = `题库数量：单选题${type1}、多选题${type2}、判断题${type3}、填空题${type4}、`;
    }
  }
  return value;
};

//手动选题事件
const chooseChange = (event) => {
  if (event == "1") {
    if (ruleForm.value.categoryIds.length < 1) {
      ElMessage({
        message: "请先选择题目分类",
        type: "warning",
        duration: 3 * 1000,
      });
      return;
    }

    const {
      singleChoiceCount,
      trueFalseCount,
      multipleChoiceCount,
      fillBlankCount,
      categoryIds,
    } = ruleForm.value;
    const obj = {
      singleChoiceCount: singleChoiceCount,
      trueFalseCount: trueFalseCount,
      multipleChoiceCount: multipleChoiceCount,
      fillBlankCount: fillBlankCount,
      categoryIds: categoryIds,
    };
    tableRef.value.initChange(obj);
    ruleForm.value.paperType = "1";
    paperTypeDisabled.value = true;
  } else {
    ruleForm.value.paperType = "";
    paperTypeDisabled.value = false;
  }
};

//设置，当前的值和分类有的数据进行对比，如果大于则设为0
const inputChange = (value, categoryId, num, field) => {
  if (value > num) {
    ruleForm.value[field][categoryId] = 0;
    ElMessage({
      message: "当前输入的题目数量不得大于题库数量",
      type: "warning",
      duration: 3 * 1000,
    });
  }
};

//试卷类型事件
const paperTypeChange = (event) => {
  // if (!ruleForm.value.isSelfChoose) {
  //   ElMessage({
  //     message: "请先选择是否手动选题",
  //     type: "warning",
  //     duration: 3 * 1000,
  //   });
  //   ruleForm.value.paperType = "";
  // }
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
.type-calss {
  margin-left: 30px;
  span {
    margin: 0 5px;
  }
}
::v-deep .el-modal-dialog .dialogClass {
  height: 600px;
}
/* 针对 WebKit 内核浏览器（如 Chrome, Safari, Edge）隐藏上下箭头 */
.el-input__inner[type="number"]::-webkit-outer-spin-button,
.el-input__inner[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
  display: none !important; /* 确保在支持 WebKit 的浏览器中隐藏 */
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
