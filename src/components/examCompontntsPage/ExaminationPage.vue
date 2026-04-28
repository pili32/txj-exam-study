<template>
  <div class="main-exam" :style="{ height: height + 30 + 'px' }">
    <div v-if="examShow" class="flex-dom">
      <div>
        <h1>{{ examName }}</h1>
      </div>

      <!-- <div>
        <el-button type="primary" @click="exitChange">退出答题</el-button>
      </div> -->
    </div>
    <div class="container-box">
      <div class="exam-content" ref="examRef">
        <div class="exam-title" v-if="examShow">
          [{{ filterType(currentQuestion.type) }}]{{ currentIndex + 1 }}.{{
            currentQuestion.title
          }}
          ({{ currentQuestion.score }}分)
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
            <div v-if="currentQuestion.type == 2">
              <el-checkbox-group
                v-model="checkboxVlaue"
                @change="checkboxChange"
              >
                <div class="box-group">
                  <el-checkbox size="large" :label="children.value" border>
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
          <el-divider border-style="dotted" />
        </div>
        <div class="footer-btn">
          <el-button @click="prevQuestion" v-if="currentIndex != 0" plain
            >上一题</el-button
          >
          <!-- <el-button type="primary" @click="confirm" v-if="submitState"
            >确认</el-button
          > -->
          <el-button
            v-if="currentIndex != tableData.length - 1"
            @click="nextQuestion"
            plain
            >下一题</el-button
          >
          <el-button
            type="primary"
            v-if="currentIndex == tableData.length - 1"
            @click="submitExam"
            >提交试卷</el-button
          >
        </div>
      </div>
      <div class="exam-all">
        <div class="timer"></div>
        <div class="exam-all-title">
          <span v-if="switchCount > 0">切屏次数: {{ switchCount }}/3</span>
        </div>
        <div class="exam-all-title">
          <div>考试时长：{{ duration }}分钟</div>
          <el-tag type="danger" effect="dark"
            >倒计时：{{ formattedTime }}</el-tag
          >
        </div>
        <!-- <div class="exam-all-title">
          <div>考试时长{{ duration }}分钟</div>
          <el-tag type="danger" effect="dark"
            >脱离时间定时器{{ formattedTime3 }}</el-tag
          >
        </div> -->

        <div class="exam-all-title">
          <div>共有{{ total }}题</div>
          <div>满分{{ score }}分</div>
        </div>
        <!-- 题目导航 -->
        <div class="question-nav">
          <el-button
            v-for="(question, index) in currentAnswers"
            :key="index"
            :type="getQuestionButtonType(index)"
            @click="goToQuestion(index)"
            circle
            class="grid-button"
          >
            {{ index + 1 }}
          </el-button>
        </div>
        <div class="exam-btn">
          <el-button type="primary" plain @click="submitExam"
            >提交试卷</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1.考试第一步调用initChange(),并且给出弹框提示，是进入考试还是退出考试
//2.如果进入考试调用 startExam()，正式开始计时
//3.开始计时后调用initData(),获取考试的试题
//4.结束考试，清除定时器，调用endChange()提交试卷
//5.提交试卷后调用exitChange()退出到主页面，并且提示答题分数，成绩等
import {
  ref,
  reactive,
  watchEffect,
  onMounted,
  computed,
  onBeforeUnmount,
  onUnmounted,
} from "vue";
import { categoryTreeApi } from "@/api/topic";
import { onBeforeRouteLeave } from "vue-router";
import {
  getExamData,
  saveExamData,
  saveExamState,
  getExamState,
} from "@/utils/exam";
import {
  userExamAction,
  submitAnswerOneByOne,
  getUserExamPaper,
  userEndExam,
} from "@/api/examination";
import { ElLoading } from "element-plus";

let tableData = ref([]);
import router from "@/router"; // 导入路由实例
import { storeToRefs } from "pinia";
import { menuStore } from "@/stores/menu.js";
const emit = defineEmits(["childEvent"]);
import { examStore } from "@/stores/examination.js";
const store = examStore();
const examShow = ref(false);
const checkboxVlaue = ref([]);
const inputValues = ref([""]);
const submitData = ref([]);
const submitState = ref(true);
const submitAnswer = ref();
const total = ref("");
const score = ref(100);
const examRef = ref("");
const examName = ref("");
const width = ref(null);

const duration = ref(0);
const actionState = ref(true);
const isPageVisible = ref(true); // 页面是否可见
const switchCount = ref(0); // 切屏次数（可选）
const lastHiddenDuration = ref(0); // 上次隐藏时长（可选）
let hiddenTimestamp = null; // 记录页面隐藏的开始时间
// 计时器相关
const timeLeft = ref(0); // 转换为秒
const dateTimer = ref(null);

const endTime = ref(null); // 结束时间戳
const userExamId = ref("");
const remainingTime = ref(null);
const countdown = ref(null);
const countdownTime = ref(null);
const countdownTimer = ref(null);

const props = defineProps({
  // 搜索项配置
  height: {
    type: Number,
    default: () => "",
  },
  categoryId: {
    type: String,
    default: () => "",
  },
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
const currentIndex = ref(0);

watchEffect(() => {
  if (currentIndex.value) {
    currentQuestion.value = tableData.value[currentIndex.value];
    getSaveAnswer(currentQuestion.value.type);
  }
  if (examRef.value) {
    width.value = examRef.value.clientWidth;
  }
});
const currentQuestion = ref("");

const answer = ref("");
const dialogRef = ref();

// 获取从本地存储加载数据
const loadFromStorage = () => {
  const savedState = getExamState();
  if (savedState && savedState.examStatus) {
    const data = getExamData();
    currentAnswers.value = savedState.examStatus;
    currentIndex.value = savedState.currentQuestionIndex;
    timeLeft.value = savedState.timeLeft;
    //    initAnswers(currentAnswers);
  }
};
onMounted(async () => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});
onUnmounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);

  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
const currentAnswers = ref([]);

const handleAnswerChange = (event) => {
  answer.value = event;
  confirm();
};
const checkboxChange = (event) => {
  confirm();
};

//初始化函数
const initChange = async (obj) => {
  console.log(obj);
  await store.selectMenu(false); //初始化进入考试状态
  startExam(obj); //调用开始考试
  return;
};
// 上一题
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    // if (currentIndex.value == 0) {
    //   getSaveAnswer(tableData.value[0].type);
    // }

    if (currentIndex.value == 0) {
      currentQuestion.value = tableData.value[currentIndex.value];
      getSaveAnswer(tableData.value[0].type);
    }

    saveToStorage();

    // if (currentIndex.value == 0) {
    //   currentQuestion.value = tableData.value[0];
    // }
    // const data = submitData.value.find(
    //   (item) => item.questionId == currentQuestion.value.id
    // );
    // const userAnswer = submitData.value[currentIndex.value].userAnswer;
    // const type = tableData.value[currentIndex.value].type;

    // getSaveAnswer();

    // 保存当前题目的答案
    // userAnswers.value[currentQuestion.value.id] = selectedAnswer.value;

    // 恢复上一题的答案
    // selectedAnswer.value = userAnswers.value[currentQuestion.value.id] || "";
    // showResult.value = false; // 切换题目时隐藏结果
  }
};
const getSaveAnswer = (type) => {
  const data = currentAnswers.value[currentIndex.value];
  let userAnswerData = "";
  if (data) {
    const { userAnswer } = data;
    userAnswerData = userAnswer;
  } else {
    userAnswerData = "";
  }

  if (type == 1 || type == 3) {
    answer.value = userAnswerData;
  } else if (type == 2) {
    checkboxVlaue.value = userAnswerData || [];
  } else {
    inputValues.value = userAnswerData || [""];
  }
};
// 提交答案
const confirm = () => {
  let aswerData = "";
  let cacheAnswer = "";
  const type = currentQuestion.value.type;
  const id = currentQuestion.value.id;
  if (type == 1 || type == 3) {
    // if (!answer.value) {
    //   ElMessage({
    //     message: "请先选择答案",
    //     type: "warning",
    //     duration: 3 * 1000,
    //   });
    //   return;
    // }

    aswerData = answer.value;
    cacheAnswer = answer.value;
    submitAnswer.value = aswerData;
  } else if (type == 2) {
    // if (checkboxVlaue.value.length < 1 || checkboxVlaue.value == []) {
    //   ElMessage({
    //     message: "请先选择答案",
    //     type: "warning",
    //     duration: 3 * 1000,
    //   });
    //   return;
    // }
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
    userExamId: userExamId.value,
    type: type,
  };
  const cacheObj = {
    questionId: id,
    userAnswer: cacheAnswer,
    userExamId: userExamId.value,
    type: type,
  };

  const index = submitData.value.findIndex(
    (item) => item.questionId === cacheObj.questionId
  );

  currentAnswers.value[currentIndex.value] = cacheObj;

  saveToStorage();
  if (index !== -1) {
    submitData.value.splice(index, 1, obj);
  } else {
    submitData.value.push(obj);
  }
  currentQuestion.value.answerStatus = true;
  tableData.value[currentIndex.value].answerStatus = true;
  submitState.value = false;
  cacheObj.index = currentIndex.value;
  saveAswer(obj);
};
// 初始化答案数组
const initAnswers = () => {
  // if (currentAnswers.value.length > 1) {
  //   return;
  // }
  currentAnswers.value = tableData.value.map(() => {
    return null;
  });
  examShow.value = true;
};
//按照有规律的排序
const sortedLetters = (value) => {
  return [...value].sort();
};
//下一题
const nextQuestion = () => {
  currentIndex.value++;
  saveToStorage();
};
//提交答案
const saveAswer = (params) => {
  submitAnswerOneByOne(params).then((res) => {
    if (res.code == 200) {
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
      text: "." +  parts[1],
      value:parts[0],
    };
  });
  return questionoptions;
};
//考试考试
const startExam = (obj) => {
  console.log(obj);
  duration.value = obj.duration; //获取当前考试时长
  timeLeft.value = duration.value * 60;
  endTime.value = Date.now() + timeLeft.value * 1000;
  countdown.value = duration.value * 60 * 1000;
  countdownTime.value = countdown.value;
  examName.value = obj.name;
  score.value = obj.totalScore;
  //调用开始考试计时，开始考试
  store.selectMenu(true);
  userExamId.value = obj.examId;
  initData(obj.examId); //调用试卷
  localStorage.setItem("studyExamAction", "true");
  // userExamAction(params).then((res) => {
  //   if (res.code == 200) {
  //     store.selectMenu(true);
  //     const examId = res.data.userExamId;
  //     userExamId.value = examId;
  //     initData(examId); //调用试卷
  //     localStorage.setItem("studyExamAction", "true");
  //   }
  // }).catch(error =>{
  //   setTimeout(() => {
  //     emit("errorEvent");
  //   }, 1000);
  // });
};

const initData = (userExamId) => {
  getUserExamPaper(userExamId) //获取试卷
    .then((res) => {
      if (res.code == 200) {
        updateRemainingTime();
        dateTimer.value = setInterval(updateRemainingTime, 1000);

        // startCountdown();

        tableData.value = res.data.records;
        currentQuestion.value = tableData.value[0];
        filterData(tableData.value);
        total.value = res.data.records.length; //获取当前题目总数
        initAnswers(); //初始化右侧题目
      }
    })
    .catch((error) => {});
};

const endChange = (value) => {
  clearInterval(dateTimer.value); // 停止计时器
  if (!actionState.value) return;
  localStorage.setItem("ceshi", value);
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  const params = {
    userExamId: userExamId.value,
    allAnswer: submitData.value.map((item) => {
      return {
        userAnswer: item.userAnswer,
        questionId: item.questionId,
        userExamId: item.userExamId,
        type: item.type,
      };
    }),
  };

  userEndExam(params)
    .then((res) => {
      if (res.code == 200) {
        localStorage.removeItem("studyExamAction");
        ElMessage({
          message: "提交成功",
          type: "warning",
          duration: 3 * 1000,
        });
        actionState.value = false;
        setTimeout(() => {
          exitChange(true, res.data, userExamId.value);
        }, 1000);
      }
      loading.close()

    })
    .catch((error) => {
      loading.close()
      localStorage.setItem("studyExamParams", JSON.stringify(params));
      ElMessage({
        message: "提交失败，请重新提交或联系管理员",
        type: "warning",
        duration: 1 * 1000,
      });
    });
};

// 保存到本地存储
const saveToStorage = () => {
  saveExamState({
    currentQuestionIndex: currentIndex.value,
    timeLeft: timeLeft.value,
    examStatus: currentAnswers.value,
    lastSaveTime: Date.now(),
  });
};

// 跳转到指定题目
const goToQuestion = (index) => {
  currentIndex.value = index;

  if (currentIndex.value == 0) {
    currentQuestion.value = tableData.value[currentIndex.value];
    getSaveAnswer(tableData.value[0].type);
  }

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
  });
};

let startTime = 0; // 记录倒计时开始的时间戳
let lastUpdateTime = 0; // 上次更新的时间戳（用于强制每秒更新）
let animationId = null;
const updateCountdown = (currentTime) => {
  if (!lastUpdateTime) {
    lastUpdateTime = currentTime; // 初始化上次更新时间
  }

  // 强制每秒更新一次（避免高频更新导致性能问题）
  if (currentTime - lastUpdateTime >= 1000) {
    const elapsed = currentTime - startTime; // 计算已过去的时间
    countdownTime.value = Math.max(0, countdown.value - elapsed);
    lastUpdateTime = currentTime;
    if (countdownTime.value <= 0) {
      cancelAnimationFrame(animationId);
      endChange(4);

      ElMessage.warning("考试时间结束！");
    }
  }

  animationId = requestAnimationFrame(updateCountdown);
};
// 启动倒计时
const startCountdown = () => {
  startTime = performance.now(); // 记录高精度起始时间
  lastUpdateTime = 0; // 重置上次更新时间
  animationId = requestAnimationFrame(updateCountdown);

  // const startTime = performance.now(); // 记录高精度起始时间

  // const updateTime = () => {

  //   const elapsed = performance.now() - startTime;

  //   countdownTime.value = Math.max(0, countdown.value - elapsed);
  //   if (countdownTime.value <= 0) {
  //     endChange(4);
  //     ElMessage.warning("考试时间结束！");
  //   }
  // };

  // // 立即执行一次，避免1秒延迟
  // updateTime();
  // // 每秒更新一次
  // countdownTimer.value = setInterval(updateTime, 1000);
};

//开始计时-
const updateRemainingTime = () => {
  const now = Date.now();
  remainingTime.value = Math.max(0, Math.round((endTime.value - now) / 1000));

  // 考试结束
  if (remainingTime.value == 180) {
    ElMessage.warning("考试时间还剩3分钟，请完成试卷作答！");
    // setTimeout(() => {
    //   endChange(4);
    // }, 3000);
  }
  if (remainingTime.value <= 0) {
    endChange(4);
    // 倒计时结束后的逻辑
  }
};
const exitChange = (flag, data, userExamId) => {
  store.selectMenu(false);
  data.name = examName.value;
  data.totalScore = score.value;
  emit("childEvent", flag, data, userExamId);
};

//判断当前有没有做题
const getQuestionButtonType = (index) => {
  if (currentAnswers.value[index] === null || !currentAnswers.value[index]) {
    return "info"; // 未答题
  }
  return "primary"; // 已答题
};

//删选是什么类型
const filterType = (type) => {
  const data = topicType.value.find((item) => item.value == type);
  return data.label;
};
const formattedTime3 = computed(() => {
  const minutes = Math.floor(countdownTime.value / 1000 / 60);
  const seconds = Math.floor((countdownTime.value / 1000) % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
});
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
});

// 提交试卷
const submitExam = async () => {
  try {
    await ElMessageBox.confirm(
      "确定要提交试卷吗？提交后将无法修改答案。",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // saveExamState({
    //   currentQuestionIndex: "",
    //   timeLeft: 0,
    //   examStatus: "",
    //   lastSaveTime: Date.now(),
    // });

    endChange();
    return;
  } catch (error) {}
};
// //点击确认离开
// onBeforeRouteLeave((to, from, next) => {
//   if (examShow.value == true) {
//     ElMessageBox.confirm("确定离开当前练习，并结束考试？", "系统提示", {
//       distinguishCancelAndClose: true,
//       confirmButtonText: "确定",
//       cancelButtonText: "取消",
//     })
//       .then(() => {
//         next();
//       })
//       .catch((action) => {
//         if (action === "cancel") {
//         } else {
//         }
//       });
//   } else {
//     next();
//   }
// });
// 卸载组件实例前调用,但是并没有触发
onBeforeUnmount(() => {
  localStorage.setItem("onBeforeUnmount", "onBeforeUnmount");

  store.selectMenu(false);
  endChange(1); //自动交卷

  // window.removeEventListener("beforeunload", handleBeforeUnload);
});

const handleBlur = (e) => {
  const value = inputValues.value[e].trim();
  inputValues.value[e] = value;
  confirm();
};
//刷新浏览器后调用
const handleBeforeUnload = (event) => {
  store.selectMenu(false);
  endChange(2); //自动交卷
};
// 监听 visibilitychange 事件
const handleVisibilityChange = () => {
  const isHidden = document.hidden || document.mozHidden; // 兼容火狐前缀
  if (isHidden) {
    // 页面隐藏（用户切屏）
    isPageVisible.value = false;
    hiddenTimestamp = Date.now(); // 记录隐藏开始时间
    // 这里可以触发一些操作，如暂停计时器、播放视频等
  } else {
    // 页面再次可见（用户返回）
    isPageVisible.value = true;
    const duration = hiddenTimestamp ? Date.now() - hiddenTimestamp : 0;
    lastHiddenDuration.value = duration; // 记录隐藏时长
    hiddenTimestamp = null;
    // 示例：只有隐藏超过 1 秒才记录为有效切屏
    if (duration > 1000) {
      switchCount.value++;

      // 根据切屏次数执行相应逻辑，如警告、提交表单等
      if (switchCount.value == 3) {
        // 例如切屏超过3次警告
        store.selectMenu(false);
        endChange(3); //自动交卷
      }
    }
    ElMessage.warning("禁止切屏，超过三次将自动交卷");
  }
};

defineExpose({
  initChange,
});
</script>

<style scoped lang="less">
.flex-dom {
  display: flex;
  justify-content: center;
  padding: 0 10px;
  text-align: center;
  width: 100%;
  background: #fff;
  box-sizing: border-box;
  height: 100px;
}
.main-exam {
  height: 100%;
  padding: 10px 0;
  box-sizing: border-box;
  color: #000;
}
.container-box {
  width: 100%;
  padding: 2px 5px 10px 5px;
  box-sizing: border-box;
  // height: 100%;
  height: calc(100% - 100px);
  display: flex;
  flex-direction: row;
  position: relative;
  .exam-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 5px;
    background: #fff;
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
  line-height: 40px;

}
.exam-all {
  display: flex;
  width: 280px;
  background: #fff;
  flex-direction: column;
  border-radius: 5px;
  margin-left: 10px;
  position: relative;
  height: 100%;
  .exam-all-title {
    display: flex;
    justify-content: space-around;
    width: 100%;
    line-height: 40px;
    align-items: center;
    font-size: 12px;
  }
}
.footer-btn {
  // position: absolute;
  // bottom: 30vh;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 50px
}
.exam-btn {
  position: absolute;
  bottom: 10px;
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
.input-item {
  width: 90%;
  margin: 10px;
  .item-div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
.question-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px 8px;
  margin: 0;
  padding: 5px 10px;
  box-sizing: border-box;
  border-top: 1px solid #ddd;
  max-height: 70%;
  overflow-y: auto;
  .grid-button {
    aspect-ratio: 1;
    padding: 0;
    box-sizing: border-box;
    margin: 5px;
  }
  .grid-button:first-child {
    // margin-left: 12px;
  }
}
.exam-parse {
  background-color: #fff3e0;
  padding: 5px;
}
.answer-text {
  margin-right: 20px;
  line-height: 40px;
}
.correct {
  color: #409eff;
}
.error {
  color: #f56c6c;
}
</style>
