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
                :readonly="ruleFormReadonly"
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
                :data="processedTreeData"
                :props="defaultProps"
                @node-click="handleNodeClick"
                @check-change="handleNodeClick"
                @remove-tag="handleRemoveTag"
                @blur="handleTreeSelectBlur"
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
       <div class="type-box">
        <template v-for="(child, index) in nodesName" :key="index">
          <div >
            <el-row>
              <el-col :span="18">
                <el-form-item>
                  <span>{{ child.name }}</span>
                  <span v-if="child.value"
                    >（总数：{{
                      child.value ? child.value.total : ""
                    }}、单选：{{ child.value.singleCount }}、多选：{{
                      child.value.multipleCount
                    }}、判断：{{ child.value.trueFalseCount }}、填空：{{
                      child.value.fillBlankCount
                    }}）</span
                  >
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="题数" prop="questionsTotal">
                  <el-input-number
                    v-model="ruleForm.questionsTotal[child.id]"
                    :min="0"
                    :readonly="ruleFormReadonly"
                    @change="
                      inputChange(
                        $event,
                        child.id,
                        child.value.total,
                        'questionsTotal'
                      )
                    "
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </template>
       </div>
        <template v-if="nodesName.length > 0">
          <el-row>
            <el-col :span="6">
              <el-form-item label="单选总数" prop="singleCount">
                <el-input-number
                  v-model="ruleForm.singleCount"
                  :min="0"
                  :readonly="ruleFormReadonly"
                  @change="
                    questionInnputChange($event, '单选题数量', 'singleCount')
                  "
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="多选总数 " prop="multipleCount">
                <el-input-number
                  v-model="ruleForm.multipleCount"
                  :min="0"
                  :readonly="ruleFormReadonly"
                  @change="
                    questionInnputChange($event, '多选题数量', 'multipleCount')
                  "
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="判断总数 " prop="trueFalseCount">
                <el-input-number
                  v-model="ruleForm.trueFalseCount"
                  :min="0"
                  :readonly="ruleFormReadonly"
                  @change="
                    questionInnputChange(
                      $event,
                      '判断题数量',

                      'trueFalseCount'
                    )
                  "
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="填空总数 " prop="fillBlankCount">
                <el-input-number
                  v-model="ruleForm.fillBlankCount"
                  :min="0"
                  :readonly="ruleFormReadonly"
                  @change="
                    questionInnputChange($event, '填空题数量', 'fillBlankCount')
                  "
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <el-row>
          <el-col :span="12">
            <el-form-item label="总题数">
              <el-input
                v-model="sumTotalScore"
                type="number"
                min="0"
                readonly
              />
            </el-form-item>
          </el-col>


        </el-row>
        <!-- <el-row>
          <el-col :span="10">
            <el-form-item >
              <div class="remark">
              注：当前试卷每种题型分数均为一分
            </div>
            </el-form-item>
          </el-col>


        </el-row> -->





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
                :disabled="rowId"
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
              <!-- :disabled="paperTypeDisabled" -->
              <el-select
                v-model="ruleForm.paperType"
                placeholder="请选择试卷类型"
                @change="paperTypeChange"
                :disabled="ruleFormReadonly"
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
      <template #footer>
        <slot name="footer" v-if="ruleFormReadonly">
          <div class="footer-btn">
            <span class="dialog-footer">
              <el-button @click="resetForm"> 关闭 </el-button>
            </span>
          </div>
        </slot>
      </template>
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
import { ElLoading } from "element-plus";

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

// watch(
//   () => props.tree,
//   (val) => {
//     const disableParents   =
//   },
//  { deep:true}
// );



const defaultProps = {
  children: "children",
  label: "name",
  value: "id",
  disabled: (data, node) => {
    // 根据条件禁用节点
    // 示例1：禁用 id 为 2 的节点及其子节点
    if (data.id === 0) {
      return true;
    }

    // 示例2：禁用所有没有子节点的节点
    // return !data.children || data.children.length === 0

    // 示例3：禁用第三级节点
    // return node.level === 3

    return false;
  },
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
const totalScore = ref("");
let questionCount = reactive([]);
const initChange = (obj) => {
  dialogVisible.value = true;
  ruleFormReadonly.value = false;
  sumTotalScore.value = 0;
  console.log(sumTotalScore.value)
  if (obj.rowId) {
    rowId.value = obj.rowId;
    editChange(obj.rowId);
  }
};

let checkedKeysArr = ref([]); //获取到的选择的tree数据
const treeDataParentIds = reactive([])

const ruleFormRef = ref(null);
const examIds = ref([]);

const dialogTitle = ref("新增试卷");
const ruleForm = ref({
  name: "", //试卷名称
  categoryIds: [], //题目分类
  questionsTotal: {}, //单选题数量
  totalScore: null, //总分数
  paperType: "", //试卷类型
  isSelfChoose: "", //是否单选多选
  chooseQuestions: [],
  sourceCodeList: [], //题目所属文件
  singleCount: 0, //单选数量,
  multipleCount: 0, //多选数量,
  trueFalseCount: 0, //判断数量,
  fillBlankCount: 0, //填空数量,
});
//当前选择分类下的各题型相加的总数量
const questionTypeTotal = reactive({
  singleCount: 0,
  multipleCount: 0,
  trueFalseCount: 0,
  fillBlankCount: 0,
});

let questionTypesNumberTotal = 0;
const filteredNodes = ref([])
const filteredKeys =ref([]);
const filteredNodesIds =ref([]); //排除出来的id集合

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

  questionsTotal: [
    { required: true, message: "请输入题目数量", trigger: "blur" },
  ],
  sourceCodeList: [
    { required: true, message: "请输入题目所属文件", trigger: "blur" },
  ],

  totalScore: [{ required: true, message: "请输入总分数", trigger: "blur" }],
  singleCount: [
    { required: true, message: "请输入单选题数量", trigger: "blur" },
  ],
  multipleCount: [
    { required: true, message: "请输入多选题数量", trigger: "blur" },
  ],
  trueFalseCount: [
    { required: true, message: "请输入判断题数量", trigger: "blur" },
  ],
  fillBlankCount: [
    { required: true, message: "请输入填空题数量", trigger: "blur" },
  ],
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

// 递归处理数据，为父节点添加 disabled: true
const processedTreeData = computed(() => {
  console.log(props.tree[0].children);
  treeDataParentIds.value = props.tree[0].children.filter(node => node.parentId === '0') .map(node => node.id);
  treeDataParentIds.value.push('0')
  console.log(treeDataParentIds.value);

  const addDisabled = (nodes) => {
    return nodes.map((node) => {
      const isParent = node.children && node.children.length > 0;
      return {
        ...node,
        disabled: isParent, // 父节点禁用
      };
    });
  };
  return addDisabled(props.tree);
});


//编辑菜单
const editChange = (id) => {
  dialogTitle.value = "试卷信息";
  ruleFormReadonly.value = true;

  paperqQueryById(id).then((res) => {
    if (res.code == 200) {
      ruleForm.value.name = res.data.name;
      sumTotalScore.value = res.data.totalScore;
      totalScore.value = res.data.totalScore;

      ruleForm.value.paperType = String(res.data.paperType);

      ruleForm.value.categoryId = res.data.categoryIds.split(";");


      ruleForm.value.singleCount = res.data.singleCount
      ruleForm.value.fillBlankCount = res.data.fillBlankCount
      ruleForm.value.trueFalseCount = res.data.trueFalseCount
      ruleForm.value.multipleCount = res.data.multipleCount



      const categoryConfig = JSON.parse(res.data.categoryConfig);
      categoryConfig.forEach((item) => {
        if (!ruleForm.value.questionsTotal[item.categoryId]) {
          ruleForm.value.questionsTotal[item.categoryId] = item.total;
        }
      });
      const data = categoryConfig.map((item) => {
        return {
          name: item.categoryName,
          id: item.categoryId,
          total: item.total,
        };
      });
      nodesName.value = data;
    }
  });
};
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
  return sumTotalScore.value >= 100;
};

const sumTotalScore = computed(() => {
  let values = null;
  values = Object.values(ruleForm.value.questionsTotal).reduce(
    (sum, score) => sum + score,
    0
  );
  console.log(totalScore.value)
  console.log(values)

  return values > 0 ? values : totalScore.value;
});

// watch(
//   () =>sumTotalScore,
//   (val) => {
//     ruleForm.value.totalScore = val.value
//   },{deep:true}
// );

const selectTypeAllLng = ref({});
const filterExamChange = () => {
  const { questionsTotal, trueFalseCount, multipleCount, fillBlankCount } =
    ruleForm.value;
  let flag = false;
  if (
    selectTypeAllLng.value.typeOneLng == questionsTotal &&
    selectTypeAllLng.value.typeTwoLng == multipleCount &&
    selectTypeAllLng.value.typeThreeLng == trueFalseCount &&
    selectTypeAllLng.value.typeFourLng == fillBlankCount
  ) {
    flag = true;
  }
  return flag;
};
const handleRemoveTag = (removedTag) => {
  // ruleForm.value.questionsTotal[item.id] = 0;
  ruleForm.value.questionsTotal[removedTag] = 0;
};
//提交数据新增和修改的提交
const handleSubmit = async () => {
  let arr = [];
  for (var i = 0; i < nodesName.value.length; i++) {
    const name = nodesName.value[i].name;
    const id = nodesName.value[i].id;
    let obj = {
      categoryName: name,
      categoryId: id,
      total: ruleForm.value.questionsTotal[id],
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
    singleCount,
    multipleCount,
    trueFalseCount,
    fillBlankCount,
  } = ruleForm.value;
  const params = {
    categoryConfigList: arr,
    categoryIds: categoryIds,
    isSelfChoose: isSelfChoose,
    name: name,
    paperType: paperType,
    totalScore: sumTotalScore.value,
    sourceCodeList: sourceCodeList,
    singleCount: singleCount,
    multipleCount: multipleCount,
    trueFalseCount: trueFalseCount,
    fillBlankCount: fillBlankCount,
    paperMode:0,

  };
  await ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const result = await countChange();
      // examData.value
      let flag = true;
      if (paperTypeDisabled.value) {
        flag = await filterExamChange();
      }

      // if (!result) {
      //   ElMessage({
      //     message: "总分数应当不小于100分",
      //     type: "warning",
      //     duration: 3 * 1000,
      //   });
      //   return;
      // }

      if (!flag) {
        ElMessage({
          message: "选择的题目类型数量与填写的题目类型数量不匹配",
          type: "error",
          duration: 5 * 1000,
        });
        return;
      }
      if (sumTotalScore.value !== questionTypesNumberTotal) {
        ElMessage({
          message: "单选、多选、判断、填空总数量与已总题数不匹配，请重新调整",
          type: "error",
          duration: 5 * 1000,
        });
        return;
      }
      dialogLoading.value = true;
      if (paperTypeDisabled.value) {
        ruleForm.value.chooseQuestions = chooseQuestionsData.value;
      } else {
        ruleForm.value.chooseQuestions = [];
      }
      const serviceLoading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      paperSaveApi(params)
        .then((res) => {
          ElMessage({
            message: "操作成功",
            type: "success",
            duration: 3 * 1000,
          });
          serviceLoading.close();

          dialogVisible.value = false;
          emit("childEvent");
          dialogLoading.value = false;

          resetForm();
        })
        .catch((error) => {
          serviceLoading.close();
          dialogLoading.value = false;
        });
      return;
    } else {
      loading.close();
      serviceLoading.close();

      dialogLoading.value = false;
    }
  });
};

//重置表单数据
const resetForm = () => {


  console.log("151")
  // ruleFormRef.value.resetFields();
  rowId.value = "";
  dialogVisible.value = false;
  nodesName.value = [];
  Object.keys(ruleForm.value).forEach((key) => {
    ruleForm.value[key] = "";
  });
  Object.keys(questionTypeTotal).forEach((key) => {
    questionTypeTotal[key] = 0;
  });
  sumTotalScore.value = 0;

  ruleForm.value.categoryIds = [];
  ruleForm.value.questionsTotal = {};
  ruleForm.value.categoryId = [];
  ruleForm.value.sourceCodeList = [];
  totalScore.value = ""
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

const handleTreeSelectBlur = () => {
  const nodesList = filteredNodes.value.map((item) => {
    return {
      name: item.name,
      id: item.id,
    };
  });
  getQuestionCountByCategoryIds(filteredKeys.value).then((res) => {
    questionCount = res.data;
    nodesList.forEach((item) => {
      item.value = res.data.find((e) => e.categoryId === item.id);
    });
    nodesList.forEach((item) => {
      if (!ruleForm.value.questionsTotal[item.id])
        ruleForm.value.questionsTotal[item.id] = 0;
    });

    nodesName.value = nodesList;
    console.log(nodesList);
    //当前选择的题库类型存在
    if (nodesList.length > 0) {
      questionTypeTotal.singleCount = nodesList.reduce(
        (acc, obj) => acc + obj.value.singleCount,
        0
      );
      questionTypeTotal.multipleCount = nodesList.reduce(
        (acc, obj) => acc + obj.value.multipleCount,
        0
      );
      questionTypeTotal.trueFalseCount = nodesList.reduce(
        (acc, obj) => acc + obj.value.trueFalseCount,
        0
      );
      questionTypeTotal.fillBlankCount = nodesList.reduce(
        (acc, obj) => acc + obj.value.fillBlankCount,
        0
      );
      console.log(questionTypeTotal);
    } else {
      //当前选择的题库类型不存在
      Object.keys(questionTypeTotal).forEach((key) => {
        questionTypeTotal[key] = 0; //清空当前题库所有类型的疏朗
        ruleForm.value[key] = 0; //清空当前选择的题目类型数量
      });
    }
  });


}
//题目分类事件
const handleNodeClick = (checkedNode) => {
  const keys = treeRef.value.getCheckedKeys(); //获取到当前所有选中的节点
  const nodes = treeRef.value.getCheckedNodes();
    // 找出treeDataParentIds和nodesIds中不同的id
  const nodesData = nodes.filter(node => !treeDataParentIds.value.includes(node.id));
  filteredKeys.value = keys.filter(node => !treeDataParentIds.value.includes(node));
  filteredNodes.value = nodesData.map((item) => {
    return {
      name: item.name,
      id: item.id,
    };
  });

  ruleForm.value.categoryIds = filteredKeys.value;
  return

};

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
      questionsTotal,
      trueFalseCount,
      multipleCount,
      fillBlankCount,
      categoryIds,
    } = ruleForm.value;
    const obj = {
      questionsTotal: questionsTotal,
      trueFalseCount: trueFalseCount,
      multipleCount: multipleCount,
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
    ruleForm.value[field][categoryId] =num;
    ElMessage({
      message: "当前输入的题目数量不得大于题库数量",
      type: "error",
      duration: 3 * 1000,
    });
  }
};

const questionInnputChange = (value, questionName, field) => {
  const questionCount = ruleForm.value[field];
  const selectCount = questionTypeTotal[field];
  console.log(questionCount);
  console.log(selectCount);

  if (questionCount > selectCount) {
    ElMessage({
      message: `当前选择的${questionName}不得大于题库的${questionName}`,
      type: "error",
      duration: 3 * 1000,
    });
    ruleForm.value[field] = selectCount;
  }

  questionTypesNumberTotal =
    ruleForm.value.singleCount +
    ruleForm.value.multipleCount +
    ruleForm.value.trueFalseCount +
    ruleForm.value.fillBlankCount;
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
.type-box{
  max-height: 200px;
  overflow-y: auto;

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
  padding-right: 10px !important;
}
.remark{
  font-size:10px
}
::v-deep  .el-tag .el-tag__close{
  display: none !important;
}
</style>
