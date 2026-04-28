<template>
  <div class="main-container" ref="myDiv">
    <div v-if="examShow" class="flex-dom">
      <div>总共{{ total }}题</div>
      <div>
        <el-button type="primary" @click="endChange" :loading="endExamLoading"
          >退出</el-button
        >
      </div>
    </div>
    <div class="container-box" :style="{ height: layoutHeight + 'px' }">
      <div class="exam-title" v-if="examShow">
        [{{ filterType(currentQuestion.type) }}]{{ currentIndex + 1 }}.{{
          currentQuestion.title
        }}
      </div>
      <div v-if="examShow">
        <div
          v-for="(children, childrenIndex) in currentQuestion.option"
          :key="childrenIndex"
        >
          <div v-if="currentQuestion.type == 1 || currentQuestion.type == 3">
            <div>
              <el-radio-group v-model="answer" @change="handleAnswerChange">
                <div class="box-group">
                  <el-radio :label="children.value" size="large" border
                    >{{ children.value }}{{ children.text }}</el-radio
                  >
                </div>
              </el-radio-group>
            </div>
          </div>
          <div v-if="currentQuestion.type == 2" class="typeTwo">
            <el-checkbox-group v-model="checkboxVlaue" @change="checkboxChange">
              <div class="box-group">
                <el-checkbox  size="large":label="children.value" border>
                  {{ children.value }}{{ children.text }}
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
          <div v-if="currentQuestion.type == 4">
            <div
              v-for="(_, index) in currentQuestion.blankCount"
              :key="index"
              class="input-item"
            >
              <div class="item-div">
                <span>{{ index + 1 }}.</span>
                <el-input
                  v-model="inputValues[index]"
                  placeholder="请输入答案"
                  @blur="handleBlur(index)"
                  size="large"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentQuestion.answerStatus && isAnswerCorrect !== ''">
          <div v-if="isAnswerCorrect == 1" class="correct">回答正确</div>
          <div v-else class="error">回答错误</div>
          <div class="answer-text">正确答案：{{ currentQuestion.answer }}</div>
        </div>
        <div
          v-if="currentQuestion.answerStatus && isAnswerCorrect !== ''"
          class="exam-parse"
        >
          <div>
            <span> 解析：出处</span>
            <!-- <img :src="out" alt="" style="height: 18px; width: 18px" /> -->
            <span  class="source-title">{{ filterAnalysis(currentQuestion.sourceCode) }} </span>
          </div>
          <span class="analysis-content"> {{ currentQuestion.analysis }} </span>
        </div>
        <el-divider border-style="dotted" />
        <div class="container-btn">
          <el-button type="primary" @click="confirm" v-if="submitState"
            >确认</el-button
          >
          <el-button
            type="primary"
            v-if="
              currentIndex != tableData.length &&
              !submitState &&
              currentIndex + 1 != total
            "
            @click="nextQuestion"
            >下一题</el-button
          >
          <el-button
            type="primary"
            v-if="currentIndex + 1 == total && !submitState"
            @click="endChange"
            :loading="endExamLoading"
            >结束</el-button
          >
        </div>
      </div>
      <div v-else class="container-box-center">
        <div class="container-content">
          <div class="container-item-box">
            <div class="container-item">
              <div class="item-type">名称</div>
              <el-select
                v-model="searchData.remark"
                placeholder="请选择考试名称"
                prop="type"
                style="width: 260px"
              >
                <el-option
                  v-for="item in topicType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="container-item">
              <div class="item-type">数量</div>
              <el-select
                v-model="searchData.practiceCount"
                placeholder="请选择练习数量"
                style="width: 260px"
                @change="typeHandler"
              >
                <el-option
                  v-for="item in practiceNum"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
        </div>

        <div class="start-btn">
          <el-button
            class="container-button"
            type="primary"
            @click="startChange"
            :loading="ationLoading"
            >进入答题</el-button
          >
        </div>
      </div>
    </div>
  </div>

  <practiceDialog
    ref="dialogRef"
    :topicType="topicType"
    :treeData="treeData"
  ></practiceDialog>
</template>
<script setup>
import {
  ref,
  reactive,
  watchEffect,
  onMounted,
  watch,
  computed,
  onBeforeUnmount,
  inject,
} from "vue";
import { ElLoading } from "element-plus";

import { onBeforeRouteLeave } from "vue-router";
const myDiv = ref(null);
import { queryExamList } from "@/api/competitionMode";
import out from "@/assets/image/out.png";

import {
  getUserPracticeListWithRemark,
  startPracticeApi,
  submitAnswerApi,
  endPracticeApi,
  resetQuestionList,
  raceBuzzerQuestionList,
} from "@/api/practice";
let tableData = ref([]);
import router from "@/router"; // 导入路由实例
import { storeToRefs } from "pinia";
import { menuStore } from "@/stores/menu.js";
import { examStore } from "@/stores/examination.js";
const store = examStore();
const { activeIndex, menuTags } = storeToRefs(menuStore());
const menuStors = menuStore();
const tableLoading = ref(false);
import practiceDialog from "./module/practiceDialog.vue";
const treeData = reactive([]);
const loading = ref(false);
const examShow = ref(false);
const checkboxVlaue = ref([]);
const praticeId = ref("");
const inputValues = ref([""]);
const submitData = ref([]);
const submitState = ref(true);
const submitAnswer = ref();
const total = ref("");
const $loading = inject("$loading"); // 注入全局 Loading
const ationLoading = ref(false);
const endExamLoading = ref(false);
const isActive = ref(0);
import { systemStore } from "@/stores/common.js";
import { getDateMonthsAgo, dateFormatYMD } from "@/utils/dateFormat";
const defaultProps = {
  children: "children",
  label: "name",
  value: "id",
};
const categoryIds = ref([]);
const categoryNames = ref([]);
const searchData = reactive({
  remark: "",
  practiceCount: "20",
});
let { questionFileData } = systemStore(); //引入store
const isAnswerCorrect = ref(false);
let parentItemData = ref([]);
const dateList = ref({
  examMode: 1,
});
const topicType = ref([]);
const questionType = reactive([
  { value: 1, label: "单选题" },
  { value: 2, label: "多选题" },
  { value: 3, label: "判断题" },
  { value: 4, label: "填空题" },
]);
const practiceNum = ref([
  {
    value: "10",
    label: "10题",
  },
  {
    value: "20",
    label: "20题",
  },

  {
    value: "30",
    label: "30题",
  },
  {
    value: "40",
    label: "40题",
  },
  {
    value: "50",
    label: "50题",
  },
]);
const currentIndex = ref(0);
watch(
  () => inputValues.value,
  (val) => {}
);

watchEffect(() => {
  if (myDiv.value) {
    if (!examShow.value) layoutHeight.value = myDiv.value.clientHeight - 10; //
    else layoutHeight.value = myDiv.value.clientHeight - 40; //
  }
  if (currentIndex.value) {
    currentQuestion.value = tableData.value[currentIndex.value];
  }
});
const currentQuestion = ref("");

const answer = ref("");
const dialogRef = ref();
onMounted(() => {
  store.selectMenu(false); //如果删除的是tag的最后一个，那么要调整到前面一个tag上
  getExamList();
});
const questionData = computed(() => {
  return questionFileData.map((item) => {
    return {
      value: item.valueCode,
      label: item.valueName,
    };
  });
});
const getExamList = () => {
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  getUserPracticeListWithRemark(dateList.value)
    .then((res) => {
      if (res.code == 200 && res.data.length > 0) {
        topicType.value = res.data.map((item, index) => {
          return {
            label: item.remark,
            value: index,
          };
        });
        searchData.remark = topicType.value[0].value;
      } else {
        topicType.value = [];
        searchData.remark = "";
      }
      loading.close();
      echartRef.value.initChange(searchData.value);
    })
    .catch((error) => {
      loading.close();
    });
};
const layoutHeight = ref(0);

const handleAnswerChange = (event) => {
  answer.value = event;
};
const checkboxChange = (event) => {};

const handleBlur = (e) => {
  const value = inputValues.value[e].trim();
  inputValues.value[e] = value;
};

const getSaveAnswer = () => {
  const id = currentQuestion.value.id;
  const type = tableData.value[currentIndex.value].type;
  const userAnswer = tableData.value[currentIndex.value].userAnswer;

  if (type == 1 || type == 3) {
    answer.value = userAnswer;
  } else if (type == 2) {
    checkboxVlaue.value = userAnswer;
  } else {
    inputValues.value = userAnswer|| [""];
  }
};
// 下一题
const confirm = () => {
  let aswerData = "";
  let cacheAnswer = "";
  isAnswerCorrect.value = "";

  const type = currentQuestion.value.type;
  const id = currentQuestion.value.id;
  if (type == 1 || type == 3) {
    if (!answer.value) {
      ElMessage({
        message: "请先选择答案",
        type: "warning",
        duration: 3 * 1000,
      });
      return;
    }

    aswerData = answer.value;
    cacheAnswer = answer.value;
    submitAnswer.value = aswerData;
  } else if (type == 2) {
    if (checkboxVlaue.value.length < 1 || checkboxVlaue.value == []) {
      ElMessage({
        message: "请先选择答案",
        type: "warning",
        duration: 3 * 1000,
      });
      return;
    }
    cacheAnswer = checkboxVlaue.value;
    aswerData = sortedLetters(checkboxVlaue.value).join().replace(/,/g, "");
    submitAnswer.value = aswerData;
  } else {
    cacheAnswer = inputValues.value;
    aswerData = inputValues.value.join("|");
    submitAnswer.value = aswerData;
  }
  const obj = {
    questionId: id,
    userAnswer: aswerData,
    practiceId: praticeId.value,
  };
  const cacheObj = {
    questionId: id,
    userAnswer: cacheAnswer,
    practiceId: praticeId.value,
  };
  const index = submitData.value.findIndex(
    (item) => item.questionId === cacheObj.questionId
  );
  if (index !== -1) {
    submitData.value.splice(index, 1, cacheObj);
  } else {
    submitData.value.push(cacheObj);
  }
  currentQuestion.value.answerStatus = true;
  tableData.value[currentIndex.value].answerStatus = true;
  submitState.value = false;
  cacheObj.index = currentIndex.value;
  // currentIndex.value++;
  saveAswer(obj);
};
const filterAnalysis = (sourceCode) => {
  let code = "";
  if (sourceCode) {
    const data = questionData.value.find((item) => item.value === sourceCode);
    code = data.label;
  }
  return code;
};
// 拆分 answer 为二维数组（按 | 和 、）
const splitAnswer = computed(() => {
  return currentQuestion.value.answer
    .split("|")
    .map((item) => item.split("、"));
});

const isCorrect = computed(() => {
  return comparisonResult.value.every((item) => item.isMatch);
});
// 对比逻辑
const comparisonResult = computed(() => {
  return splitAnswer.value.map((options, index) => {
    const userAns = inputValues.value[index] || "";
    const isMatch =
      userAns === "" ? false : options.some((option) => option === userAns);
    return {
      userAnswer: userAns,
      correctOptions: options,
      isMatch,
    };
  });
});
// 拆分 userAnswer 为数组（按 |）
const typeHandler = (event) => {
  // types.value = event;
};
onBeforeRouteLeave((to, from, next) => {
  if (examShow.value == true) {
    ElMessageBox.confirm("确定离开当前练习，并结束？", "系统提示", {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    })
      .then(() => {
        next();
      })
      .catch((action) => {
        ationLoading.value = false;
        if (action === "cancel") {
        } else {
        }
      });
  } else {
    next();
  }
});
//按照有规律的排序
const sortedLetters = (value) => {
  return [...value].sort();
};
//下一题
const nextQuestion = () => {
  currentIndex.value++;
  answer.value = "";
  checkboxVlaue.value = [];
  inputValues.value = [""];
  isAnswerCorrect.value = "";
  if (currentIndex.value < submitData.value.length) {
    getSaveAnswer();
  }
  // }
  submitState.value = true;
};
//提交答案
const saveAswer = (params) => {
  submitAnswerApi(params).then((res) => {
    if (res.code == 200) {
      isAnswerCorrect.value = res.data.isCorrect;
    }
  });
};
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
const startChange = (type = [], id = []) => {
  const resultData = parentItemData.value.map((item) => item.checkIds);
  const merged = [].concat(...resultData);
  categoryIds.value = merged.map((item) => item.id);
  categoryNames.value = merged.map((item) => item.name);

  loading.value = false;

  const obj = {
    categoryIds: categoryIds.value,
    categoryNames: categoryNames.value,
  };
  startPracticeApi(obj)
    .then((res) => {
      if (res.code == 200) {
        praticeId.value = res.data.practiceId;

        initData();
      } else {
        ElMessage({
          message: res.msg,
          type: "success",
          duration: 3 * 1000,
        });
      }
    })
    .catch((error) => {});
};
const initData = () => {
    answer.value = "";
    checkboxVlaue.value = [];
    inputValues.value = [""];
    isAnswerCorrect.value = "";
    currentIndex.value = 0;
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  ationLoading.value = true;

  const remark = topicType.value.filter(
    (item) => item.value == searchData.remark
  )[0].label;
  const params = {
    practiceCount: searchData.practiceCount,
    remark: remark,
  };
  raceBuzzerQuestionList(params)
    .then((res) => {
      if (res.code == 200) {
        //判断当前有数据时
        if (res.data.length > 0) {
          examShow.value = true;
         store.selectMenu(true); //如果删除的是tag的最后一个，那么要调整到前面一个tag上
          tableData.value = res.data;
          currentQuestion.value = tableData.value[0];
          filterData(tableData.value);
        } else {
          ElMessage({
            message: "无题目可用",
            type: "warning",
            duration: 2 * 1000,
          });

          // const params = {
          //   categoryIds: categoryIds.value,
          // };
          // getResetquestion(params);
        }
        loading.close();
        ationLoading.value = false;

        if (currentIndex.value < submitData.value.length) {
          getSaveAnswer();
        }
        total.value = res.data.length;
      }
    })
    .catch((error) => {
      loading.close();
      ationLoading.value = false;
    });
};

const getResetquestion = (params) => {
  ElMessageBox.confirm("所选分类下的试题已经全部练习完，是否重新练习？", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      ationLoading.value = false;
      const loading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      resetQuestionList(params)
        .then((res) => {
          if (res.code == 200) {
            initData();
            loading.close();
          }
        })
        .catch((error) => {
          loading.close();
        });
      // ElMessage({
      //   type: 'success',
      //   message: 'Delete completed',
      // })
    })
    .catch(() => {
      ationLoading.value = false;
    });
};

const endChange = () => {

  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  // $loading.open({ text: "数据提交中..." });
  endExamLoading.value = true;
  const params = {
    practiceId: praticeId.value,
    allAnswer: submitData.value.map((item) => {
      return {
        userAnswer: item.userAnswer,
        questionId: item.questionId,
      };
    }),
  };
  endPracticeApi(params)
    .then((res) => {
      if (res.code == 200) {
        store.selectMenu(false); //如果删除的是tag的最后一个，那么要调整到前面一个tag上
        examShow.value = false;
        endExamLoading.value = false;

        answer.value = "";
        checkboxVlaue.value = [];
        inputValues.value = [""];
        isAnswerCorrect.value = "";
        currentIndex.value = 0;
        submitData.value = [];
        submitState.value = true;

        ElMessage({
          message: "提交成功",
          type: "warning",
          duration: 2 * 1000,
        });
        setTimeout(() => {
          //刷新当前路由
          loading.close();
        }, 500);
      } else {
        endExamLoading.value = false;
        loading.close();
      }
    })
    .catch((error) => {
      endExamLoading.value = false;
      loading.close();
    });
};
const filterData = (tableData) => {
  tableData.forEach((item, index) => {
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
      if (typeof item.option == "string") {
        item.answer = item.answer.split("");
        item.answerStatus = false;
      }
    }
  });

  examShow.value = true;
};
//删选是什么类型
const filterType = (type) => {
  const data = questionType.find((item) => item.value == type);
  return data.label;
};
onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
});
const handleBeforeUnload = (event) => {
  store.selectMenu(false);
  // endChange();
};

onBeforeUnmount(() => {
  // 组件卸载时移除监听器，避免内存泄漏
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<style scoped lang="less">
@import "@/assets/css/examCommons.less"; // 引入公共样式文件

// .main-container {
//   height: 100%;
//   // background: #f0f2f5;
//   color: #000;
// }
// .container-box {
//   width: 100%;
//   padding: 10px;
//   box-sizing: border-box;
//   height: 100%;
//   position: relative;
//   background: #fff;
//   .typeTwo {
//     width: 100%;
//     .el-checkbox {
//       width: 100%;
//     }
//   }
// }
// .container-option {
//   display: flex;
//   width: 100%;
// }
// .el-radio-group {
//   display: flex;
//   flex-direction: column;
//   width: 100%;
//   box-sizing: border-box;
// }
// .box-group {
//   width: 100%;
//   background: #f0f2f5;
//   margin: 15px 0;
//   box-sizing: border-box;
// }
// .el-radio {
//   width: 100%;
// }
// .exam-title {
//   font-weight: bold;
//   font-size: 18px;
//   line-height: 40px;

// }
// .container-btn {
//   position: absolute;
//   // bottom: 30vh;
//   width: 98%;
//   display: flex;
//   justify-content: center;
// }
// ::v-deep .el-select-dropdown {
//   min-width: 200px !important;
// }
// ::v-deep .el-tree {
//   min-width: 200px !important;
// }
// ::v-deep .el-radio__label {
//   white-space: pre-line;
//   word-wrap: break-word;
// }

// .input-item {
//   width: 90%;
//   margin: 10px;
//   .item-div {
//     display: flex;
//     flex-direction: row;
//     align-items: center;
//   }
// }
// .exam-parse {
//   background-color: #fff3e0;
//   padding: 5px;
//   .analysis-content {
//     white-space: pre-wrap; /* 保留换行符和空格，并允许自动换行 */
//     word-wrap: break-word; /* 兼容性写法，允许长单词或 URL 换行 */
//     display: block; /* 确保作为块级元素显示，避免排版问题 */
//     line-height: 40px;
//   }
//   img {
//     vertical-align: sub;
//   }
// }
// .answer-text {
//   margin-right: 20px;
//   line-height: 40px;
// }
// .correct {
//   color: #409eff;
// }
// .error {
//   color: #f56c6c;
// }
// .flex-dom {
//   display: flex;
//   justify-content: space-between;
//   padding: 0 10px;
//   background: #fff;
// }
// .container-content {
//   display: flex;
//   align-items: center;
//   flex-direction: column;
//   width: 100%;
// }
// .container-item-box {
//   display: flex;
//   width: 100%;
//   justify-content: center;
//   padding: 0 20px;
//   box-sizing: border-box;
// }
// .container-typeItem {
//   display: flex;
//   width: 100%;
//   padding: 0 10px;
//   box-sizing: border-box;
//   flex-direction: row;
//   height: calc(100% - 200px);
//   overflow: auto;
//   border-bottom: 1px solid #ddd;
//   .typeItem {
//     display: flex;
//     flex-direction: column;
//     border-right: 1px solid #ddd;
//     height: calc(100% - 10px);
//     width: 200px;
//     ul {
//       margin: 10px;
//       li {
//         padding: 6px 8px;
//         margin-right: 12px;
//         text-align: center;
//         border-radius: 50px;
//         overflow: hidden;
//         text-overflow: ellipsis;
//         white-space: nowrap;
//         cursor: pointer;
//         list-style-type: none;
//       }
//     }
//     .active {
//       background-color: #409eff;
//       color: #fff;
//     }
//   }
//   .checkbox-layout {
//     display: flex;
//     flex-direction: column;
//     width: 100%;
//     padding-left: 10px;
//   }
//   .children-item {
//     display: flex;
//     padding: 10px 10px;
//     overflow-y: auto;
//     .el-checkbox-group {
//       width: 100%;
//       display: flex;
//       flex-wrap: wrap;
//     }
//   }

//   .children-checkbox {
//     width: 30%;
//     padding: 10px 5px 10px 10px;
//     box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
//     transition: box-shadow 0.3s ease;
//     cursor: pointer;
//     border-radius: 8px 8px 8px 8px;
//     box-sizing: border-box;
//     height: 50px;
//     margin-top: 10px;
//     white-space: normal; /* 默认值，文本自动换行 */
//     word-wrap: break-word; /* 长单词或URL换行 */
//     overflow-wrap: break-word; /* 更现代的属性，效果同上 */
//     .el-checkbox__label {
//       font-size: 20px;
//     }
//   }
//   .children-checkbox:hover {
//     box-shadow: 0 4px 16px 2px rgba(0, 0, 0, 0.15); /* 加深阴影 */
//   }
// }
// .start-btn {
//   width: 100px;
//   align-items: center;
//   margin-top: 10px;
//   height: 100px;
//   line-height: 100px;
// }
// .container-box-center {
//   display: flex;
//   align-items: center;
//   flex-direction: column;
//   // height: 100%;
//   margin-top: 10vh;
//   .container-item {
//     display: flex;
//     flex-direction: row;
//     align-items: center;

//     .item-type {
//       margin: 20px;
//     }
//   }
// }
// .container-button {
//   margin-left: 20px;
// }
// ::v-deep .el-tag {
//   max-width: 230px !important;
// }
</style>
