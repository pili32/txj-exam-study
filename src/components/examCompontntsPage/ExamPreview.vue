<template>
  <div class="main-container" ref="myDiv">
    <div class="filter-box">
      <!-- <span class="total"> 总共{{ total }}题 </span> -->
      <el-tree-select
        v-model="categoryId"
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
        @check-change="handleNodeClick"
        node-key="id"
        ref="treeRef"
        placeholder="请选择题目分类"
        style="width: 260px"
        multiple
        show-checkbox
        :default-expand-all="true"
        v-if="state"
      />
      <el-select
        v-model="types"
        multiple
        placeholder="请选择题目类型"
        style="width: 260px"
        @change="typeHandler"
        v-if="state"
      >
        <el-option
          v-for="item in topicType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div
      class="container-box"
      :style="{ height: layoutHeight + 'px' }"
      ref="scrollContainer"
    >
      <div class="out-preview">
        <el-button @click="outChange" size="small" type="primary">
          退出预览
        </el-button>
      </div>

      <div class="type" v-if="singleData.length > 0">（一）单选题（每题1分，共{{singleData.length}}题）</div>
      <div v-for="(item, index) in singleData" :key="index">
        <div>{{ item.questionOrder }}.{{ item.title }}</div>
        <div
          v-for="(children, childrenIndex) in item.option"
          :key="childrenIndex"
          class="exam-item"
        >
          <span>{{ children.value }}{{ children.text }}</span>
        </div>
        <el-divider border-style="dotted" />
      </div>

      <div class="type" v-if="multipleData.length > 0">（二）多选题（每题1分，共{{multipleData.length}}题）</div>

      <div v-for="(item, index) in multipleData" :key="index">
        <div>{{ item.questionOrder }}.{{ item.title }}</div>
        <div
          v-for="(children, childrenIndex) in item.option"
          :key="childrenIndex"
          class="exam-item"
        >
          <span>{{ children.value }}{{ children.text }}</span>
        </div>
        <el-divider border-style="dotted" />
      </div>

      <div class="type" v-if="judgeData.length > 0">（三）判断题（每题1分，共{{judgeData.length}}题）</div>

      <div v-for="(item, index) in judgeData" :key="index">
        <div>{{ item.questionOrder }}.{{ item.title }}</div>
        <div
          v-for="(children, childrenIndex) in item.option"
          :key="childrenIndex"
          class="exam-item"
        >
          <span>{{ children.value }}{{ children.text }}</span>
        </div>
        <el-divider border-style="dotted" />
      </div>

      <div class="type" v-if="fillBlankData.length > 0">（四）填空题（每题1分，共{{fillBlankData.length}}题）</div>

      <div v-for="(item, index) in fillBlankData" :key="index">
        <div>{{ item.questionOrder }}.{{ item.title }}</div>
        <el-divider border-style="dotted" />
      </div>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="query.current"
        v-model:page-size="query.size"
        :page-sizes="[10, 20, 30, 50, 100]"
        background
        layout="sizes, prev, pager, next"
        :total="total"
        class="mt-4"
        size="small"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-if="state"
      />
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
} from "vue";

import { categoryTreeApi } from "@/api/topic";
import { pageListApi } from "@/api/practice";
import { paperPreview } from "@/api/examination";

const myDiv = ref(null);
const props = defineProps({
  rowId: {
    type: Number,
    default: () => null,
  },
  state: {
    type: Boolean,
    default: () => true,
  },
});
const categoryIds = ref([]);
const types = ref([]);
const categoryId = ref([]);
const isReadonly = true;
const clickState = ref(true);
const examData = reactive([]);
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
const total = ref();
const defaultProps = {
  children: "children",
  label: "name",
  value: "id",
};
const currentIndex = ref(0);
const currentQuestion = computed(() => examData[currentIndex.value]);
const answer = ref("A");
const layoutHeight = ref(0);
const treeData = reactive([]);
const treeRef = ref(); // 获取树组件的引用
let tableData = ref([]);
let singleData = ref([]);
let multipleData = ref([]);
let judgeData = ref([]);
let fillBlankData = ref([]);
const scrollContainer = ref();
const query = ref({
  size: 10,
  current: 1,
});
const emit = defineEmits(["childEvent"]);

//组织交互
const handleReadonlyClick = () => {
  // 阻止任何交互（实际由 @click.prevent 处理）
};
const finished = ref(false);
const loading = ref(false);
const initData = (params = {}) => {
  paperPreview(props.rowId)
    .then((res) => {
      if (res.code == 200) {
        singleData.value = res.data.single;
        multipleData.value = res.data.multiple;
        judgeData.value = res.data.judge;

        filterData(singleData.value);

        filterData(multipleData.value);

        filterData(judgeData.value);
        fillBlankData.value = res.data.fillBlank;

        total.value = res.data.total;
      }
      //   tableLoading.value = false;
    })
    .catch((error) => {
      //   tableLoading.value = false;
    });
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

  initData(params);
};
//处理tableData
const filterData = (tableData) => {
  tableData.forEach((item, index) => {
    item.option = filterOption(item.option);
    // if(item.type == 2) {
    //     item.answer = item.answer.split('');
    // }
  });
};

const typeHandler = (event) => {
  query.value.current = 1;
  const params = {
    types: event,
    categoryIds: categoryIds.value,
  };
  initData(params);
};
const outChange = () => {
  emit("childEvent");
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
  };
  initData(params);
};
</script>

<style scoped lang="less">
.main-container {
  height: 100%;
  // background: #f0f2f5;
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
.exam-parse {
  background-color: #fff3e0;
  padding: 2px;
}
.pagination {
  display: flex;
  justify-content: end;
  padding: 5px;
  box-sizing: border-box;
}
.el-select {
  margin-right: 20px;
}
.type {
  font-weight: bold;
  line-height: 40px;
}
.exam-item {
  padding: 5px 10px;
}
::v-deep .el-tag {
  max-width: 230px !important;
}
.out-preview {
  width: 100%;
  display: flex;
  justify-content: end;
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
