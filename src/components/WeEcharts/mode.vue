<template>
  <div
    v-show="showChart"
    ref="chartRef"
    :style="{ height: props.height + 'px', width: '100%' }"
  ></div>
  <el-empty :image="images" description="暂无考试数据" v-show="!showChart" />
</template>
<script setup>
import {
  ref,
  onMounted,
  computed,
  watch,
  onBeforeUnmount,
  nextTick,
} from "vue";
import * as echarts from "echarts";
import { raceExamStatistics } from "@/api/examination";
import images from "@/assets/image/exam.png";
const props = defineProps({
  height: {
    type: Number,
    default: () => null,
  },
  searchItem: {
    type: Object,
    default: {},
  },
});

// 模拟数据（部门统计）
const mockDeptData = [
  {
    userName: "研发部",
    score: [
      {  score: 70, duration: 100},
    ],
  },
  {
    userName: "测试部",
    score: [
      { score: 21, duration: 80 },
    ],
  },
  {
    userName: "产品部",
    score: [
      { score: 90, duration: 150 },

    ],
  },
  {
    userName: "运维部",
    score: [
      { score: 65, duration: 105 },
    ],
  },
];

const showChart = ref(true);
const queryType = ref("dept");

const echartData = ref([]);
// 搜索参数

const initChange = (examId) => {
  console.log(examId);
  setTimeout(() => {
      // echartData.value = mockDeptData;
      // updateDeptChart();
      showChart.value = true;
    // 注释掉真实API调用，使用模拟数据
    raceExamStatistics(examId)
      .then((res) => {
        if (res.data.length > 0) {
          echartData.value = res.data;
          updateDeptChart();
          showChart.value = true;
        } else {
          showChart.value = false;
        }
      })
      .catch((errro) => {
        // API调用失败时使用模拟数据
        if (params.queryType == "dept") {
          echartData.value = mockDeptData;
          updateDeptChart();
          showChart.value = true;
        } else {
          echartData.value = mockUserData;
          updateUserChart();
          showChart.value = true;
        }
      });
  },200);
};

// 原始数据
const rawData = ref(mockDeptData);
// 图表DOM引用
const chartRef = ref(null);
let chartInstance = ref(null);
// 计算图表数据
const chartData = computed(() => {
  let data = [...echartData.value];
  return data.map((item) => {
      // 兼容 score 为数组或对象的情况，并设置默认值防止 undefined
      let scoreInfo = item.score && Array.isArray(item.score) ? item.score[0] : item.score;

      // 如果 scoreInfo 不存在，初始化默认值
      if (!scoreInfo) {
        scoreInfo = { userScore: 0, duration: 0 };
      }

      return {
        userName: item.userName || "未知部门",
        examScore: scoreInfo.userScore || 0, // 确保有值
        examDuration: scoreInfo.duration || 0, // 确保有值
      };
    });
});

// 监听数据变化更新图表
// watch(chartData, () => {
//   updateDeptChart();
// });

// 初始化图表
const initChart = async () => {
  if (!chartRef.value) return;

  // 销毁旧实例
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
  await nextTick();
  chartInstance.value = await echarts.init(chartRef.value);
};

// 更新图表数据
const updateDeptChart = async () => {
  // 1. 检查图表实例是否存在
  if (!chartInstance.value) {
    console.warn("图表实例未初始化");
    return;
  }
  const data = chartData.value;

    // 2. 检查数据是否有效
  if (!data || data.length === 0) {
    showChart.value = false;
    return;
  } else {
    showChart.value = true;
  }

  console.log(data);
  const deptOption = {
    title: {
      text: "用户考试统计",
      left: "center",
      top: "0",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["考试成绩", "考试时长（分钟）"],
      top: 30,
      fontSize: 18,

    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%", // 增加底部距离，给部门名称留空间
      containLabel: true,

    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.userName),
      name: "",
      axisLabel: {
        interval: 0,
        rotate: 0, // 如果部门名称太长可以旋转
      },
      axisLabel: {
      interval: 0, // 强制显示所有标签（如果不设置，ECharts 会自动隐藏部分标签防止重叠）
      rotate: 0,  // 旋转角度，30度是常用值
      fontSize: 22,
      // 或者使用换行函数
      formatter: function (value) {
        console.log(value);
        // 如果名字超过4个字，就换行
        if (value.length > 4) {
          return value.substring(0, 4) + '\n' + value.substring(4);
        }
        return value;
      }
    }
    },
    yAxis: [
      {
        type: "value",
        name: "考试成绩",
        position: "left",
        axisLine: {
          show: true,
          lineStyle: {
            color: "#5470C6",
          },
        },
        axisLabel: {
        formatter: "{value}分",
        fontSize: 18,

        },

      },
      {
        type: "value",
        name: "考试时长（分钟）",
        position: "right",
        axisLine: {
          show: true,
          lineStyle: {
            color: "#EE6666",
          },
        },
        axisLabel: {
          formatter: "{value}分钟",
        fontSize: 18,

        },
      },
    ],
    series: [
      {
        name: "考试成绩",
        type: "bar",
        data: data.map((item) => item.examScore),
        label: {
          show: true, // 显示标签
          position: "top", // 标签位置：顶部
          color: "#333", // 文字颜色
          fontSize: 20, // 文字大小
        },
        itemStyle: {
          color: "#5470C6",
        },
      },
      {
        name: "考试时长（分钟）",
        type: "bar",
        yAxisIndex: 1,
        data: data.map((item) => item.examDuration),
        itemStyle: {
          color: "#EE6666",
        },
        label: {
          show: true, // 显示标签
          position: "top", // 标签位置：顶部
          color: "#333", // 文字颜色
          fontSize: 20, // 文字大小

        },
      },
    ],
  };
  await nextTick();

   // 3. 确保在设置 option 时图表实例依然有效
   if (chartInstance.value) {
    try {
      chartInstance.value.setOption(deptOption, {
        notMerge: true,
        lazyUpdate: false, // 改为 false 确保立即更新，避免状态不同步
      });
    } catch (error) {
      console.error("设置图表选项失败:", error);
    }
  }
};

// 组件挂载时初始化图表
onMounted(async () => {
  initChart();
  window.addEventListener("resize", handleResize);
  // 组件挂载时自动加载模拟数据
  await nextTick();
  initChange();
});

// 组件卸载前销毁图表
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
  window.removeEventListener("resize", handleResize);
});

// 图表响应式resize
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

// 初始化加载数据

defineExpose({
  initChange,
});
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
