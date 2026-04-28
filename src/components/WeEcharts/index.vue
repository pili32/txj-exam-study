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
import { getStatistics } from "@/api/examination";
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

// 模拟数据
const mockData = [
  {
    deptName: "研发部",
    scores: [
      {
        name: "张三",
        score: 70,
      },
      {
        name: "王五",
        score: 71,
      },
      {
        name: "斯克",
        score: 74,
      },
    ],
    maxUser: "1515",
  },
  {
    deptName: "测试部",
    scores: [
      {
        name: "张三",
        score: 21,
      },
      {
        name: "王五",
        score: 34,
      },
      {
        name: "斯克",
        score: 15,
      },
    ],
  },
];
const showChart = ref(true);
const queryType = ref("dept");

const echartData = ref([]);
// 搜索参数

const initChange = (params) => {
  setTimeout(() => {
    queryType.value = params.queryType;
    getStatistics(params)
      .then((res) => {
        if (res.data.length > 0) {
          echartData.value = res.data;

          if (params.queryType == "dept") updateDeptChart();
          else updateUserChart();
          showChart.value = true;
        } else {
          showChart.value = false;
        }
      })
      .catch((errro) => {
        echartData.value = [];
        showChart.value = false;
      });
  },200);
};

// 原始数据
const rawData = ref(mockData);
// 图表DOM引用
const chartRef = ref(null);
let chartInstance = ref(null);
// 计算图表数据
const chartData = computed(() => {
  let data = [...echartData.value];
  if (queryType.value == "user") {
    return data;
  } else {
    // 处理数据为图表需要的格式
    return data.map((item) => {
      const scores = item.userScore.map((item) => Number(item.score));
      const maxScore = Math.max(...scores);
      // const maxUser = item.userScore.find((item) => item.score === maxScore);
      const minScore = Math.min(...scores);
      // const minUser = item.userScore.find((item) => item.score === minScore);
      const sum = scores.reduce((a, b) => a + b, 0);

      const avgScore = sum / scores.length;

      return {
        deptName: item.deptName,
        maxScore,
        // maxUser, //分数最高人员
        // minUser, //分数最低人员
        minScore,
        avgScore: parseFloat(avgScore.toFixed(2)),
        sum,
      };
    });
  }
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
  const data = chartData.value;
  const deptOption = {
    title: {
      text: "部门分数统计",
      left: "center",
      top: "0",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      // formatter: (params) => {
      //   const dataIndex = params[0].dataIndex;
      //   return `
      //     <div><strong>${data[dataIndex].deptName}</strong></div>
      //     <div>最高分: ${data[dataIndex].maxScore}</div>
      //     <div>最低分: ${data[dataIndex].minScore}</div>
      //     <div>平均分: ${data[dataIndex].avgScore}</div>
      //     <div>最高分人员: ${data[dataIndex].maxUser}</div>
      //   `;
      // },
      // ${data.maxUserInfo ? `<div>最高分者: ${data.maxUserInfo}</div>` : ''}
    },
    legend: {
      data: ["最高分", "最低分", "平均分"],
      top: 30,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.deptName),
      name: "名称",
      axisLabel: {
        interval: 0,
        rotate: 0, // 如果部门名称太长可以旋转
        fontSize: 18,
      },
    },
    yAxis: {
      type: "value",
      name: "分数",
    },
    series: [
      {
        name: "最高分",
        type: "bar",
        data: data.map((item) => item.maxScore),
        label: {
          show: true, // 显示标签
          position: "top", // 标签位置：顶部

          color: "#333", // 文字颜色
          fontSize: 12, // 文字大小
        },
        itemStyle: {
          color: "#5470C6",
        },
      },
      {
        name: "最低分",
        type: "bar",
        data: data.map((item) => item.minScore),
        label: {
          show: true, // 显示标签
          position: "top", // 标签位置：顶部
          color: "#333", // 文字颜色
          fontSize: 12, // 文字大小
        },
        itemStyle: {
          color: "#91CC75",
        },
      },
      {
        name: "平均分",
        type: "bar",
        data: data.map((item) => item.avgScore),
        itemStyle: {
          color: "#EE6666",
        },
        label: {
          show: true, // 显示标签
          position: "top", // 标签位置：顶部
          color: "#333", // 文字颜色
          fontSize: 12, // 文字大小
        },
      },
    ],
  };
  await nextTick();

  chartInstance.value.setOption(deptOption, {
    notMerge: true, //可选，是否不跟之前设置的 option 进行合并，默认为 false，即合并
    lazyUpdate: true, //可选，在设置完 option 后是否不立即更新图表，默认为 false，即立即更新
  });
};
const updateUserChart = async () => {
  const data = chartData.value;
  const userOption = {
    title: {
      text: "人员分数统计",
      left: "center",
      top: "0",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      // ${data.maxUserInfo ? `<div>最高分者: ${data.maxUserInfo}</div>` : ''}
    },
    legend: {
      data: ["分数"],
      top: 30,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      name: "名称",
      data: data.map((item) => item.userName),
      axisLabel: {
        interval: 0,
        rotate: 0, // 如果部门名称太长可以旋转
        fontSize: 18,

      },
    },
    yAxis: {
      type: "value",
      name: "分数",
    },
    series: [
      {
        name: "分数",
        type: "bar",
        data: data.map((item) => item.score),
        label: {
          show: true, // 显示标签
          position: "top", // 标签位置：顶部

          color: "#333", // 文字颜色
          fontSize: 12, // 文字大小
        },
        itemStyle: {
          color: "#5470C6",
        },
      },
    ],
  };
  await nextTick();
  chartInstance.value.setOption(userOption, {
    notMerge: true,
    lazyUpdate: true,
  });
};

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
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
