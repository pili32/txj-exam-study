<template>
  <div class="main-container" ref="myDiv">
    <div
      class="container-box"
      ref="scrollContainer"
      :style="{ height: layoutHeight + 'px' }"
    >
      <div class="container-header">
        <div class="name">
          <span v-if="props.role == 'examination'">{{ props.examDetails.name }}</span>
          <span v-else >练习记录</span>
        </div>
        <div class="exam-btn">
          <el-button type="primary" plain @click="outChange">返回</el-button>
        </div>
      </div>

      <div class="history-box">
        <div class="exam-content">
          <div v-for="(item, index) in tableData" :key="item.questionOrder">
            <div
              :ref="
                (el) => {
                  if (el) questionRefs[item.questionOrder] = el;
                }
              "
              style="display: flex; align-items: center"
            >
              <el-image
                v-if="item.isCorrect == 1"
                style="width: 30px; height: 30px; margin-right: 10px"
                :src="success"
              />
              <el-image
                v-else
                style="width: 30px; height: 30px; margin-right: 10px"
                :src="error"
              />
              <div>{{ item.questionOrder }}.{{ item.title }}</div>
            </div>

            <div
              v-for="(children, childrenIndex) in item.option"
              :key="childrenIndex"
            >
              <div v-if="item.type == 1 || item.type == 3">
                <div>
                  <el-radio-group
                    v-model="item.examAnswer"
                    @change="handleAnswerChange"
                  >
                    <div class="box-group">
                      <el-radio
                        :label="children.value"
                        size="large"
                        border
                        @click.prevent="isReadonly && handleReadonlyClick()"
                        :class="{
                          'is-highlighted': item.examAnswer === children.value,
                        }"
                        >{{ children.value }}{{ children.text }}{{
                      }}</el-radio>
                    </div>
                  </el-radio-group>
                </div>
              </div>

              <div v-if="item.type == 2">
                <el-checkbox-group
                  v-model="item.examAnswer"
                  @click.prevent="isReadonly && handleReadonlyClick()"
                >
                  <div class="box-group">
                    <el-checkbox :key="index" :label="children.value" border>
                      {{ children.value }}{{ children.text }}
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
                <!-- <el-radio-group v-model="answer" @change="handleAnswerChange">
                <div class="box-group">
                  <el-radio :label="children.value" size="large" border
                    >{{ children.value }}{{ children.text }}2222</el-radio
                  >
                </div>
              </el-radio-group> -->
              </div>
            </div>
            <div v-if="item.type == 4">用户答案：{{ item.userAnswer }}</div>
            <div class="history-bottom">
              <div style="color: #409eff">正确答案：{{ item.answer }}</div>

              <!-- 正确答案：{{ item.answer }}
              <div v-if="item.examAnswer == item.userAnswer" class="correct">
                回答正确
              </div>
              <div v-else class="error">回答错误</div> -->
            </div>
            <div class="exam-parse">
              <div>
                <span> 解析：出处</span>
                <!-- <img :src="out" alt="" style="height: 18px; width: 18px" /> -->
                <span  class="source-title">{{ filterAnalysis(item.sourceCode) }} </span>
              </div>
              <span class="analysis-content"> {{ item.analysis }} </span>
            </div>
            <el-divider border-style="dotted" />
          </div>
        </div>
        <div class="exam-all">
          <div class="exam-all-title" v-if="props.role == 'examination'">
            <div>满分{{ props.examDetails.totalScore }}分</div>
            <div>考试成绩：{{ props.examDetails.score }}分</div>
          </div>
          <div class="question-nav">
            <el-button
              v-for="(question, index) in tableData"
              :key="index"
              :type="getQuestionButtonType(question)"
              @click="goToQuestion(question.questionOrder)"
              circle
              class="grid-button"
            >
              {{ question.questionOrder }}
            </el-button>
          </div>
          <!-- <div class="exam-btn">
            <el-button type="primary" plain @click="outChange">退出</el-button>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  ref,
  reactive,
  watchEffect,
  watch,
  onMounted,
  onUnmounted,
  computed,
  inject,
} from "vue";

import { categoryTreeApi } from "@/api/topic";
import { pageListApi } from "@/api/practice";

const myDiv = ref(null);
const searchRef = ref("");
const $loading = inject("$loading"); // 注入全局 Loading
import { getUserExamWithUserAnswer } from "@/api/examination";
import { getUserPracticeQuestionWithUserAnswer } from "@/api/practice";

import { systemStore } from "@/stores/common.js";
import out from "@/assets/image/out.png";
import { ElLoading } from "element-plus";

const categoryIds = ref([]);
const types = ref([]);
const categoryId = ref([]);
const isReadonly = true;
const clickState = ref(true);
const examData = reactive([]);
const emit = defineEmits(["childChange"]);
let { questionFileData } = systemStore(); //引入store
const sourceCodeList = ref([]);
const searchStatus = ref(true);
import error from "@/assets/image/error1.png";
import success from "@/assets/image/success.png";

const props = defineProps({
  examDetails: { type: Object, default: {} },
  isGetAll: { type: String, default: "" },
  role: { type: String, default: "examination" },
});
const questionRefs = ref([]);
const currentIndex = ref(0);
const currentQuestion = computed(() => examData[currentIndex.value]);
const answer = ref("A");
const layoutHeight = ref(0);
const countHeight = ref(0);
const treeData = reactive([]);
const treeRef = ref(); // 获取树组件的引用
let tableData = ref([]);
const scrollContainer = ref();
//组织交互
const handleReadonlyClick = () => {
  // 阻止任何交互（实际由 @click.prevent 处理）
};
const finished = ref(false);
const loading = ref(false);
const initData = async () => {
  // $loading.open({ text: '加载中...' })

  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  try {
    let res;
    // 根据角色调用不同的API
    if (props.role === "examination") {
      const params = {
        id: props.examDetails.userExamId,
        isGetAll: props.isGetAll == 1 ? false : true,
      };
      res = await getUserExamWithUserAnswer(params);
    } else {
      res = await getUserPracticeQuestionWithUserAnswer(
        props.examDetails.userExamId
      );
    }
    // 统一处理成功响应
    if (res.code === 200) {
      res.data.records.forEach((item, index) => {
        item.questionOrder = item.questionOrder ? item.questionOrder :index + 1;
      });
      tableData.value = await res.data.records;
      filterData(tableData.value);
      loading.close();
    }
  } catch (error) {
    // 统一处理错误
    console.error("获取数据失败:", error);
    tableData.value = [];
    loading.close();
  }
};

watchEffect(() => {
  if (myDiv.value) {
    layoutHeight.value = myDiv.value.clientHeight - 20; //
  }
});

onMounted(() => {
  // scrollContainer.value.addEventListener('scroll', handleScroll)
  getDeptTree();
  initData();
});
onUnmounted(() => {
  // scrollContainer.value.addEventListener('scroll', handleScroll)
});
const getDeptTree = () => {
  const id = 0;
  categoryTreeApi(id).then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
    }
  });
};
const filterAnalysis = (sourceCode) => {
  let code = "";

  if (sourceCode) {
    const data = questionData.value.find((item) => item.value === sourceCode);
    code = data.label;
  }
  return code;
};
const handleAnswerChange = (event) => {
  const id = examData[currentIndex.value].id;
  answer.value = event;
};
//筛选出来返回的option
const filterOption = (item) => {
  const data = item.split("|");
  const questionoptions = data.map((item) => {
    let parts = item.split("."); // 分割字符串
    if (parts.length > 1) {
      parts = [parts[0]].concat(parts.slice(1).join(".")); // 只保留第一部分，其余部分重新连接
    }
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: "." + parts[1],
      value: parts[0],
    };
  });

  return questionoptions;
};

const questionData = computed(() => {
  return questionFileData.map((item) => {
    return {
      value: item.valueCode,
      label: item.valueName,
    };
  });
});
//题目分类事件
const handleNodeClick = (checkedNode) => {
  if (!clickState.value) return;
  const keys = treeRef.value.getCheckedKeys(); //获取到当前所有选中的节点
  categoryIds.value = keys;
  query.value.current = 1;
  const params = {
    categoryIds: keys,
    types: types.value,
  };
  clickState.value = false;
  setTimeout(() => {
    clickState.value = true;
  }, 500);
  computeHeight();

  initData(params);
};
//处理tableData
const filterData = (tableData) => {
  tableData.forEach((item, index) => {
    item.examAnswer = item.userAnswer;
    if (item.option && typeof item.option == "string") {
      item.option = filterOption(item.option);
    } else if (item.type == 4 && !item.option) {
      item.option = [
        {
          id: "",
          text: "",
          value: "",
        },
      ];
    } else {
    }

    if (item.type == 2) {
      // if (typeof item.option == "string") {
      item.examAnswer = item.userAnswer.split("");
      // }
    }
  });
};
const typeHandler = (event) => {
  query.value.current = 1;
  const params = {
    types: types.value,
    categoryIds: categoryIds.value,
    sourceCodeList: sourceCodeList.value,
  };
  computeHeight();

  initData(params);
};
const computeHeight = () => {
  const height = searchRef.value.clientHeight;
  searchStatus.value = false;

  if (height > 40) {
    const h = height - 40;
    layoutHeight.value = countHeight.value - h;
  } else {
    layoutHeight.value = countHeight.value;
  }
  // countHeight
};
const loadData = async () => {
  query.value.current++;
  // initData()

  if (loading.value || finished.value) return;

  //   loading.value = true

  //   await new Promise(resolve => setTimeout(resolve, 500))

  const start = (query.value.current - 1) * query.value.size;
  const end = start + query.value.size;
  const newData = mockData.slice(start, end);

  //   if (newData.length > 0) {
  //     listData.value = [...listData.value, ...newData]
  //     page.value++
  //   }

  //   if (listData.value.length >= mockData.length) {
  //     finished.value = true
  //   }

  //   loading.value = false
};
// 滚动事件处理
const handleScroll = () => {
  const container = scrollContainer.value;
  // 距离底部50px时触发加载
  if (
    container.scrollHeight - container.scrollTop - container.clientHeight <
    50
  ) {
    loadData();
  }
};
//判断当前有没有做题
const getQuestionButtonType = (question) => {
  if (question.isCorrect == 0) {
    return "danger"; // 未答题
  }
  return "success"; // 已答题
};

const goToQuestion = (index) => {
  const questionEl = questionRefs.value[index];
  if (questionEl) {
    questionEl.scrollIntoView({ behavior: "smooth" });
  }
};
//点击切换size
const handleSizeChange = (val) => {
  query.value.size = val;
  const container = scrollContainer.value;
  container.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  const params = {
    categoryIds: categoryIds.value,
    types: types.value,
    sourceCodeList: sourceCodeList.value,
  };
  initData(params);
};
//点击切换current
const handleCurrentChange = (val) => {
  tableData.length = 0;
  query.value.current = val;
  const container = scrollContainer.value;
  container.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  const params = {
    categoryIds: categoryIds.value,
    types: types.value,
    sourceCodeList: sourceCodeList.value,
  };
  initData(params);
};

const outChange = () => {
  emit("childChange"); //部门ids和人员Array
};
</script>

<style scoped lang="less">
.main-container {
  height: 100%;
  // background: #f0f2f5;
  color: #000;
}
.container-box {
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  position: relative;
  padding: 10px;
}
.container-header {
  padding-bottom: 5px;
  display: flex;
  flex-direction: row;
  .name {
    display: flex;
    text-align: center;
    flex: 1;
    justify-content: center;
    font-size: 20px;

    .exam-btn {
      width: 100px;
    }
  }
}
.history-box {
  display: flex;
  flex-direction: row;
  height: calc(100% - 15px);

  .exam-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 5px;
    background: #fff;
    height: 100%;
    overflow-y: auto;
    padding-top: 10px;
    box-sizing: border-box;
    border-radius: 5px;

    .correct {
      color: #67c23a;
    }
    .error {
      color: #f56c6c;
    }
  }
  .exam-content:first-child {
    padding-top: 5px;
    box-sizing: border-box;
  }
  .exam-all {
    display: flex;
    width: 280px;
    background: #fff;
    flex-direction: column;
    border-radius: 5px;
    margin-left: 10px;
    position: relative;
    .exam-all-title {
      display: flex;
      justify-content: space-around;
      width: 100%;
      line-height: 40px;
      align-items: center;
      font-size: 16px;
      border-bottom: 1px solid #ddd;
    }
    .question-nav {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 15px 8px;
      margin: 0;
      padding: 5px 10px;
      box-sizing: border-box;
      overflow-y: auto;
      .grid-button {
        aspect-ratio: 1;
        padding: 0;
        box-sizing: border-box;
        margin: 5px;
      }
    }
    .exam-btn {
      position: absolute;
      bottom: 10px;
      width: 98%;
      display: flex;
      justify-content: center;
    }
  }
}

.container-option {
  display: flex;
  width: 100%;
}
.el-radio-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}
.box-group {
  width: 100%;
  background: #f0f2f5;
  margin: 15px 0;
  box-sizing: border-box;
}
.el-radio {
  width: 100%;
}
.exam-title {
  font-weight: bold;
  font-size: 18px;
}
.container-btn {
  position: absolute;
  bottom: 50px;
  width: 98%;
  display: flex;
  justify-content: center;
}
::v-deep .el-radio__label {
  white-space: pre-line;
  word-wrap: break-word;
}
.el-checkbox {
  width: 100%;
}
.filter-box {
  padding: 5px;
  background: #f0f2f5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.out {
  text-align: right;
}
.exam-parse {
  background-color: #fff3e0;
  padding: 2px;
  .analysis-content {
    white-space: pre-wrap; /* 保留换行符和空格，并允许自动换行 */
    word-wrap: break-word; /* 兼容性写法，允许长单词或 URL 换行 */
    display: block; /* 确保作为块级元素显示，避免排版问题 */
    line-height: 30px;
  }
  .source-title{
      margin-left: 10px;
    }
  img {
    vertical-align: sub;
  }
}
.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 5px;
  box-sizing: border-box;
  background: #fff;
}
.el-select {
  margin-right: 20px;
}
::v-deep .el-tag {
  max-width: 230px !important;
}
/* 覆盖 Element Plus 的 disabled 样式，保持原始颜色 */
.el-checkbox.is-readonly .el-checkbox__input.is-disabled .el-checkbox__inner {
  background-color: #fff;
  border-color: #dcdfe6;
  cursor: default;
}
.el-checkbox.is-readonly
  .el-checkbox__input.is-disabled.is-checked
  .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff;
}
.el-checkbox.is-readonly .el-checkbox__label {
  color: #606266 !important; /* 保持原始字体颜色 */
}
/* 禁用鼠标事件（但保留样式） */
.el-checkbox.is-readonly {
  pointer-events: none;
}
.history-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px 5px 5px;
  // background: #e5f4ff;
  box-sizing: border-box;
  margin: 5px 0;
}
</style>
