<template>
  <div class="main-container" ref="myDiv">
    <div
      class="container-box"
      :style="{ height: layoutHeight + 'px' }"
      ref="scrollContainer"
    >
      <div v-if="props.userExamId" class="out">
        <el-button size="small" @click="outChange">退出</el-button>
      </div>

      <div v-for="(item, index) in tableData" :key="index">
        <div v-if="item.questionOrder">
          {{ item.questionOrder }}.{{ item.title }}
        </div>
        <div v-else>{{ index + 1 }}.{{ item.title }}</div>

        <div
          v-for="(children, childrenIndex) in item.option"
          :key="childrenIndex"
        >
          <div v-if="item.type == 1 || item.type == 3">
            <div>
              <el-radio-group
                v-model="item.answer"
                @change="handleAnswerChange"
              >
                <div class="box-group">
                  <el-radio
                    :label="children.value"
                    size="large"
                    border
                    @click.prevent="isReadonly && handleReadonlyClick()"
                    :class="{
                      'is-highlighted': item.answer === children.value,
                    }"
                    >{{ children.value }}{{ children.text }}{{
                  }}</el-radio>
                </div>
              </el-radio-group>
            </div>
          </div>

          <div v-if="item.type == 2">
            <el-checkbox-group
              v-model="item.answer"
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
        <div v-if="item.type == 4">
          <!-- <span>{{ item.answer }}</span> -->
        </div>
        <div v-if="props.userExamId">用户答案：{{ item.userAnswer }}</div>
        <div v-if="props.userExamId" style="color: #409eff">
          正确答案：{{ item.examAnswer }}
        </div>
        <div v-if="!props.userExamId" style="color: #409eff">
          正确答案：{{ item.answer }}
        </div>
        <div class="exam-parse">解析：{{ item.analysis }}</div>
        <el-divider border-style="dotted" />
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
import { systemStore } from "@/stores/common.js";

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

const props = defineProps({
  userExamId: { type: String, default: "" },
});

const currentIndex = ref(0);
const currentQuestion = computed(() => examData[currentIndex.value]);
const answer = ref("A");
const layoutHeight = ref(0);
const countHeight = ref(0);
const treeData = reactive([]);
const treeRef = ref(); // 获取树组件的引用
let tableData = ref([]);
const scrollContainer = ref();
const query = ref({
  size: 10,
  current: 1,
});
//组织交互
const handleReadonlyClick = () => {
  // 阻止任何交互（实际由 @click.prevent 处理）
};
const finished = ref(false);
const loading = ref(false);
const initData = (params = {}) => {
  // $loading.open({ text: '加载中...' })
  const params = {
    id: props.userExamId,
    isGetAll: true,
  };
  getUserExamWithUserAnswer(params)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        filterData(tableData.value);
        total.value = res.data.total;
      }
      //   tableLoading.value = false;
    })
    .catch((error) => {
      tableData.value = [];
      query.value.current = 1;
      //   tableLoading.value = false;
    });
};

watchEffect(() => {
  if (myDiv.value) {
    if (!props.userExamId && searchStatus.value) {
      layoutHeight.value = myDiv.value.clientHeight - 90; //
      countHeight.value = layoutHeight.value;
    } else {
      layoutHeight.value = myDiv.value.clientHeight - 10; //
    }
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
  const current = (query.value.current - 1) * query.value.size;
  tableData.forEach((item, index) => {
    item.index = current + index + 1;
    item.option = filterOption(item.option);
    item.examAnswer = item.answer;
    if (item.type == 2) {
      item.answer = item.answer.split("");
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
  background: #f0f2f5;
  color: #000;
}
.container-box {
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  position: relative;
  overflow-y: auto;
  background: #fff;
  padding: 10px;
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
</style>
