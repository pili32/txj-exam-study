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
                <el-checkbox size="large" :label="children.value"  border>
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
            <span class="source-title">{{ filterAnalysis(currentQuestion.sourceCode) }} </span>
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
              <div class="item-type" style="width: 50px">名称</div>
              <el-input
                v-model="searchData.remark"
                placeholder="请输入名称"
                style="width: 300px"
              />
            </div>
            <div class="container-item">
              <div class="item-type">题目类型</div>
              <el-select
                v-model="searchData.type"
                placeholder="请选择题目类型"
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
  raceCompulsoryQuestionList,
  startPracticeApi,
  submitAnswerApi,
  endPracticeApi,
  resetQuestionList,
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
  type: "1",
  remark: "必答题-" + dateFormatYMD(new Date()),
  practiceCount: "20",
});
let { questionFileData } = systemStore(); //引入store
const isAnswerCorrect = ref(false);
const dateList = ref({
  examMode: 1,
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
});
const questionData = computed(() => {
  return questionFileData.map((item) => {
    return {
      value: item.valueCode,
      label: item.valueName,
    };
  });
});
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
  const type = tableData.value[currentIndex.value].type;
  const userAnswer = tableData.value[currentIndex.value].userAnswer;

  if (type == 1 || type == 3) {
    answer.value = userAnswer;
  } else if (type == 2) {
    checkboxVlaue.value = userAnswer;
  } else {
    inputValues.value = userAnswer || [""];
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
const startChange = () => {
  loading.value = false;
  const obj = {
    categoryIds: [],
    categoryNames: [],
    remark: searchData.remark,
    type: searchData.type,
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
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  ationLoading.value = true;

  raceCompulsoryQuestionList(searchData)
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

        // $loading.close();
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
</style>
