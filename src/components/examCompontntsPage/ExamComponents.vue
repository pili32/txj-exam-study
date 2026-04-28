<template>
  <div class="main-exam" :style="{ height: height + 'px' }">
    <div v-if="examShow" class="flex-dom">
      <div>总共{{ total }}题</div>
      <div>
        <el-button type="primary" @click="exitChange">退出答题</el-button>
      </div>
    </div>
    <div class="container-box">
      <div>
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
            <div v-if="currentQuestion.type == 2">
              <el-checkbox-group
                v-model="checkboxVlaue"
                @change="checkboxChange"
              >
                <div class="box-group">

                  <el-checkbox  size="large" :label="children.value" border>
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
                    size="large"

                  />
                </div>
              </div>
            </div>
          </div>
          <div v-if="currentQuestion.answerStatus && isAnswerCorrect !== ''">
            <div v-if="isAnswerCorrect == 1" class="correct">回答正确</div>
            <div v-else class="error">回答错误</div>
            <div class="answer-text">
              正确答案：{{ currentQuestion.answer }}
            </div>
          </div>
          <div v-if="currentQuestion.answerStatus" class="exam-parse">
            <div>
              <span> 解析：出处</span>
              <!-- <img :src="out" alt="" style="height: 18px; width: 18px" /> -->

              <span class="source-title">{{ filterAnalysis(currentQuestion.sourceCode) }} </span>
            </div>
            <span class="analysis-content"> {{ currentQuestion.analysis }} </span>
          </div>

          <el-divider border-style="dotted" />
        </div>
        <div class="footer-btn">
          <!-- <el-button
                type="primary"
                @click="prevQuestion"
                v-if="currentIndex != 0"
                >上一题</el-button
              > -->
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
            v-if="currentIndex + 1 == total"
            @click="exitChange"
            >结束练习</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watchEffect, onMounted, computed } from "vue";
import { categoryTreeApi } from "@/api/topic";
import {
  pageListApi,
  startPracticeApi,
  submitAnswerOneByOne,
  endPracticeApi,
  wrongListWithCondition,
} from "@/api/practice";
let tableData = ref([]);
import router from "@/router"; // 导入路由实例
import { storeToRefs } from "pinia";
import { menuStore } from "@/stores/menu.js";
const emit = defineEmits(["childEvent"]);
import out from "@/assets/image/out.png";
import { systemStore } from "@/stores/common.js";

const { activeIndex, menuTags } = storeToRefs(menuStore());
let { questionFileData } = systemStore(); //引入store

const treeData = reactive([]);
const examShow = ref(false);
const checkboxVlaue = ref([]);
const praticeId = ref("");
const examData = reactive();
const inputValues = ref([""]);
const submitData = ref([]);
const submitState = ref(true);
const submitAnswer = ref();
const total = ref("");
const isAnswerCorrect = ref(false);

const props = defineProps({
  // 搜索项配置
  height: {
    type: String,
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
  }
});
const currentQuestion = ref("");

const answer = ref("");
const dialogRef = ref();
onMounted(() => {
  getDeptTree();
  const params = {
    categoryId: props.categoryId,
  };
  initData(params);
  // dialogRef.value.initChange();
  // filterData()
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

const getDeptTree = () => {
  const id = 0;
  categoryTreeApi(id).then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
    }
  });
};

const query = ref({
  size: 30,
  current: 1,
});
const handleAnswerChange = (event) => {
  answer.value = event;
};
const checkboxChange = (event) => {};

// 上一题
const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    if (currentIndex.value == 0) {
      currentQuestion.value = tableData.value[0];
    }
    // const data = submitData.value.find(
    //   (item) => item.questionId == currentQuestion.value.id
    // );
    const userAnswer = submitData.value[currentIndex.value].userAnswer;
    const type = tableData.value[currentIndex.value].type;
    if (type == 1 || type == 3) {
      answer.value = userAnswer;
    } else if (type == 2) {
      checkboxVlaue.value = userAnswer;
    } else {
      inputValues.value = userAnswer;
    }
    getSaveAnswer();

    // 保存当前题目的答案
    // userAnswers.value[currentQuestion.value.id] = selectedAnswer.value;

    // 恢复上一题的答案
    // selectedAnswer.value = userAnswers.value[currentQuestion.value.id] || "";
    // showResult.value = false; // 切换题目时隐藏结果
  }
};
const getSaveAnswer = () => {};
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
  };
  const cacheObj = {
    questionId: id,
    userAnswer: cacheAnswer,
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

  //

  // if(tableData.value[currentIndex.value].type)
  // if (currentIndex.value < tableData.value.length - 1) {
  //   // 保存当前题目的答案
  //   currentIndex.value++;
  //   answer.value = "";
  // }
};

//按照有规律的排序
const sortedLetters = (value) => {
  return [...value].sort();
};

const nextQuestion = () => {
  const totalNum = query.value.size * query.value.current;
  isAnswerCorrect.value = "";

  if (totalNum < total.value && totalNum == currentIndex.value + 1) {
    query.value.current++;
    const params = {
      categoryId: props.categoryId,
    };
    initData(params);
  } else {
    currentIndex.value++;
  }
  answer.value = "";
  checkboxVlaue.value = [];
  inputValues.value = [""];
  submitState.value = true;

  // if (currentIndex.value < tableData.value.length - 1) {
  //   // 保存当前题目的答案
  //   // userAnswers.value[currentQuestion.value.id] = selectedAnswer.value;
  //   currentIndex.value++;
  //   answer.value = "";
  //   // 恢复下一题的答案
  //   // selectedAnswer.value = userAnswers.value[currentQuestion.value.id] || "";
  //   // showResult.value = false; // 切换题目时隐藏结果
  // }
};
//提交答案
const saveAswer = (params) => {
  submitAnswerOneByOne(params).then((res) => {
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
const filterAnalysis = (sourceCode) => {
  let code = "";

  if (sourceCode) {
    const data = questionData.value.find((item) => item.value === sourceCode);
    code = data.label;
  }
  return code;
};
const updateData = (types = [], categoryIds = []) => {
  const params = {
    categoryIds: categoryIds,
    types: types,
  };
  initData(params);
  startPracticeApi().then((res) => {
    praticeId.value = res.data.practiceId;
  });
};
const initData = (params = {}) => {
  Object.assign(params, query.value);
  wrongListWithCondition(params)
    .then((res) => {
      if (res.code == 200) {
        if (query.value.current > 1) {
          res.data.records.forEach((item) => {
            tableData.value.push(item);
          });

          currentIndex.value++;
          filterData(tableData.value);
        } else {
          tableData.value = res.data.records;
          currentQuestion.value = tableData.value[0];
          filterData(tableData.value);
        }

        total.value = res.data.total;
      }
      //   tableLoading.value = false;
    })
    .catch((error) => {
      //   tableLoading.value = false;
    });
};

const endChange = () => {
  const params = {
    practiceId: praticeId.value,
    allAnswer: submitData.value.map((item) => {
      return {
        userAnswer: item.userAnswer,
        questionId: item.questionId,
      };
    }),
  };
  endPracticeApi(params).then((res) => {
    if (res.code == 200) {
      ElMessage({
        message: "提交成功",
        type: "warning",
        duration: 1 * 1000,
      });
      setTimeout(() => {
        router.push({ path: "/practice/record" });
        activeIndex.value = "/practice/record";
      }, 1000);
    }
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
  // examData.map( item =>{
  //     const data = examData.option.split("|");
  // })
  //   const data = examData.option.split("|");
  //
  //   const questionoptions = data.map((item) => {
  //     return {
  //       id: Date.now() + Math.floor(Math.random() * 1000),
  //       text: item.split(".")[1],
  //       value: item.split(".")[0] + ".",
  //     };
  //   });
};

const exitChange = () => {
  emit("childEvent");
};
//删选是什么类型
const filterType = (type) => {
  const data = topicType.value.find((item) => item.value == type);
  return data.label;
};
</script>

<style scoped lang="less">
.flex-dom {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}
.main-exam {
  height: 100%;
  background: #fff;
  padding: 10px 0;
}
.container-box {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  height: 95%;
  position: relative;
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
.footer-btn {
  // position: absolute;
  // bottom: 100px;
  width: 98%;
  display: flex;
  justify-content: center;
  margin-top: 50px
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
.exam-parse {
  background-color: #fff3e0;
  padding: 5px;
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
