<template>
  <div class="echart-box" ref="myDiv">
    <div class="echart-header">
      <el-form label-width="100px">
        <el-row>

          <el-col :span="10">
            <el-form-item label="考试名称：">
              <el-select
                v-model="searchData.examId"
                placeholder="请选择考试名称"
                prop="type"
                style="min-width: 300px"
                @change="handleChange"
              >
                <el-option
                  v-for="item in topicType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
    </div>
    <mode :height="layoutHeight" ref="echartRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, onBeforeUnmount } from "vue";
import { dateFormatYMD, getDateMonthsAgo } from "@/utils/dateFormat";
import mode from "@/components/WeEcharts/mode.vue";
import { queryExamList } from "@/api/competitionMode";

import { ElLoading } from "element-plus";

const layoutHeight = ref(0);
const myDiv = ref(null);
const searchData = reactive({
  examId: "",
});
const dateList = reactive({
 examMode: 1,
});
const echartRef = ref(null);

// 更新布局高度
const updateLayoutHeight = () => {
  if (myDiv.value) {
    layoutHeight.value = myDiv.value.clientHeight - 150;
  }
};


// 监听容器大小变化
watch(
  () => myDiv.value,
  (newVal) => {
    if (newVal) {
      updateLayoutHeight();
    }
  },
  { immediate: true }
);

const topicType = ref([]);
onMounted(() => {
  getExamList();
  // 监听窗口 resize 事件
  window.addEventListener('resize', updateLayoutHeight);
});

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateLayoutHeight);
});
const getExamList = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: "正在加载考试列表...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    const res = await queryExamList(dateList);
    if (res.code === 200 && res.data.length > 0) {
      topicType.value = res.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      searchData.examId = topicType.value[0].value;
    } else {
      topicType.value = [];
      searchData.examId = "";
    }
  } catch (error) {
    console.error('获取考试列表失败:', error);
    topicType.value = [];
    searchData.examId = "";
  } finally {
    loading.close();
    // 确保 echartRef 存在时再调用方法
    if (echartRef.value) {
      echartRef.value.initChange(searchData.examId);
    }
  }
};

const handleChange = () => {
  if (echartRef.value) {
    console.log(searchData.examId);
    echartRef.value.initChange(searchData.examId);
  }
}


// 初始化加载数据
</script>

<style lang="less" scope>
.echart-box {
  background: #fff;
  height: 100%;
  .echart-header {
    padding: 10px;
    box-sizing: border-box;
  }
}
</style>
