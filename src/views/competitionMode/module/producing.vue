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
            <el-form-item label="题目分类" prop="categoryId">
              <el-tree-select
                v-model="ruleForm.categoryId"
                :data="processedTreeData"
                :props="defaultProps"
                @remove-tag="handleRemoveTag"
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
        <el-row>
          <el-col :span="12">
            <el-form-item label="试卷份数">
              <el-input-number
                v-model="ruleForm.copiesNum"
                :min="0"
                :readonly="ruleFormReadonly"
              />
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
import { ref, reactive, watch, computed, onMounted, nextTick } from "vue";
import producingTable from "@/components/module/producingTable.vue";
import { raceSave, paperqQueryById } from "@/api/competitionMode";
import { getCurrentFormattedTime } from "@/utils/dateFormat";

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

const parentHiddenIds = ref(""); //父级节点不需要展示的IDS

watch(
  () => props.tree,
  (val) => {
    parentHiddenIds.value = findParentNode(val);
    console.log(parentHiddenIds.value);
  },
  { deep: true }
);

const findParentNode = (tree = treeData, res = []) => {
  console.log(tree);
  const traverse = (nodes, parentNode = null) => {
    if (!nodes || nodes.length === 0) return;

    // 遍历每个节点
    nodes.forEach((node, index) => {
      // 如果当前节点是父节点的最后一个子节点（右子节点），记录父节点ID
      if (parentNode && index === parentNode.children.length - 1) {
        res.push(parentNode.id);
      }

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        traverse(node.children, node);
      }
    });
  };

  traverse(tree);
  return res;
};

const setCheckedKeysChange = (data) => {
  const filterData = data[0].children;

  // 等待组件渲染完成
  setTimeout(() => {
    const treeInstance = treeRef.value;
    console.log(treeInstance);
    if (treeInstance && treeInstance.setCheckedKeys) {
      // 获取所有节点的 key
      const getAllKeys = (data) => {
        let keys = [];
        const traverse = (nodes) => {
          nodes.forEach((node) => {
            keys.push(node.id);
            if (node.children && node.children.length > 0) {
              traverse(node.children);
            }
          });
        };
        traverse(data);
        return keys;
      };

      const allKeys = getAllKeys(filterData);
      console.log(allKeys);
      // 设置所有节点为选中状态
      treeInstance.setCheckedKeys(allKeys);
      // 同步到 v-model
      ruleForm.value.categoryId = allKeys.filter(
        (item) => !parentHiddenIds.value.includes(item)
      );
    }
  }, 100);
};

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
const sumTotalScore = ref(20);
const emit = defineEmits(["childEvent"]);
const dialogLoading = ref(false);
const loading = ref(false);
const ruleFormReadonly = ref(false); //表单是否可以编辑
const treeRef = ref();
const rowId = ref("");
const examData = ref([]);
const chooseQuestionsData = ref([]);
const totalScore = ref("");

let checkedKeysArr = ref([]); //获取到的选择的tree数据

const ruleFormRef = ref(null);
const examIds = ref([]);

const dialogTitle = ref("创建考试");
const ruleForm = ref({
  name: "竞赛试卷-" + getCurrentFormattedTime(), //试卷名称
  categoryIds: [], //题目分类
  questionsTotal: {}, //单选题数量
  totalScore: null, //总分数
  paperType: "2", //试卷类型
  isSelfChoose: false, //是否单选多选
  chooseQuestions: [],
  singleCount: 9, //单选数量,
  multipleCount: 3, //多选数量,
  trueFalseCount: 5, //判断数量,
  fillBlankCount: 3, //填空数量,
  copiesNum: 5, //试卷份数

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
  categoryId: [{ required: true, message: "请选择题目分类", trigger: "blur" }],
  paperType: [{ required: true, message: "请选择试卷类型", trigger: "blur" }],
  isSelfChoose: [
    { required: true, message: "请选择是否手动选题", trigger: "blur" },
  ],

  questionsTotal: [
    { required: true, message: "请输入题目数量", trigger: "blur" },
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
const initChange = (obj) => {
  dialogVisible.value = true;
  ruleFormReadonly.value = false;
  if (obj.rowId) {
    rowId.value = obj.rowId;
    editChange(obj.rowId);
  } else {
    setCheckedKeysChange(props.tree);
    (ruleForm.value.name = "竞赛试卷-" + getCurrentFormattedTime()), //试卷名称
      (ruleForm.value.singleCount = 9);
    ruleForm.value.multipleCount = 3;
    ruleForm.value.trueFalseCount = 5;
    ruleForm.value.fillBlankCount = 3;
    ruleForm.value.copiesNum = 5;
    ruleForm.value.paperType = 2;
    sumTotalScore.value = 20
  }
};

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

      ruleForm.value.singleCount = res.data.singleCount;
      ruleForm.value.fillBlankCount = res.data.fillBlankCount;
      ruleForm.value.trueFalseCount = res.data.trueFalseCount;
      ruleForm.value.multipleCount = res.data.multipleCount;

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
      ruleForm.value.categoryId = data.map((item) => item.id);
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

// 递归获取所有节点的id

const countChange = () => {
  return sumTotalScore.value >0;
};

// 递归处理数据，为父节点添加 disabled: true
const processedTreeData = computed(() => {
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

const selectTypeAllLng = ref({});
const handleRemoveTag = (removedTag) => {
  // ruleForm.value.questionsTotal[item.id] = 0;
  ruleForm.value.questionsTotal[removedTag] = 0;
};
//提交数据新增和修改的提交
const handleSubmit = async () => {
  const {
    isSelfChoose,
    name,
    paperType,
    singleCount,
    multipleCount,
    trueFalseCount,
    fillBlankCount,
    copiesNum,
    categoryId,
  } = ruleForm.value;

  console.log(categoryId);
  const params = {
    copiesNum: copiesNum,
    categoryIds: categoryId,
    isSelfChoose: isSelfChoose,
    name: name,
    paperType: paperType,
    totalScore: sumTotalScore.value,
    singleCount: singleCount,
    multipleCount: multipleCount,
    trueFalseCount: trueFalseCount,
    fillBlankCount: fillBlankCount,
    paperMode:1,
  };
  console.log(params);

  await ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      const result = await countChange();
      // examData.value

      if (!result) {
        ElMessage({
          message: "总题数不能小于1",
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
      const serviceLoading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      raceSave(params)
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
  // ruleFormRef.value.resetFields();
  rowId.value = "";
  dialogVisible.value = false;
  sumTotalScore.value = 0;
  ruleForm.value.categoryIds = [];
  ruleForm.value.name = "";
  ruleForm.value.questionsTotal = {};
  ruleForm.value.categoryId = [];
  ruleForm.value.sourceCodeList = [];
  totalScore.value = "";
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

const questionInnputChange = (value, questionName, field) => {
  sumTotalScore.value =
    ruleForm.value.singleCount +
    ruleForm.value.multipleCount +
    ruleForm.value.trueFalseCount +
    ruleForm.value.fillBlankCount;
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
.type-box {
  max-height: 300px;
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
}
.remark {
  font-size: 10px;
}
::v-deep  .el-tag .el-tag__close{
  display: none !important;
}
</style>
