<template>
  <div class="scroll-container">
    <div class="scroll-wrapper" ref="scrollWrapper">
      <div
        class="scroll-content"
        :style="{ transform: `translateY(${offset}px)` }"
      >
        <div
          v-for="(item, index) in displayItems"
          :key="index"
          class="scroll-item"
        >
          <span class="title"> {{ item.title }} </span>
          <!-- <span class="time">{{ item.releaseTime.split(" ")[0] }}</span> -->


        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount,nextTick,onUnmounted } from "vue";
import { homeArticleRollList } from "@/api/knowledge";

//

// 原始数据
const items = ref(["这是第一条滚动消息"]);

const dataList = ref([])
let timer  = null
// 显示的项目（固定7条）
const displayItems = ref(items.value.slice(0, 7));
const offset = ref(0);
const scrollSpeed = 50; // 滚动速度（像素/秒）
const itemHeight = 30; // 每个项目的高度（与CSS保持一致）
const scrollWrapper = ref(null);
let animationFrameId = null;
let lastTimestamp = 0;
onMounted(() => {
//   startScrolling();
  startInterval();
});

const startInterval = () =>{
    initData();// 立即调用一次
    timer = setInterval(initData, 60 * 1000); // 每分钟调用一次
}

  // 清除定时器
const stopInterval = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
};
const initData = async () => {
  await nextTick(); // 等待DOM更新完成
  await homeArticleRollList().then(async (res) => {
    const data = res.data.records.map( item =>{
        return {
            title:item.title,
            date:item.releaseTime.split(" ")[0]
        }
    })
    items.value =data
    console.log(items.value);
  });
};


// 滚动动画函数
const scrollAnimation = (timestamp) => {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  // 更新偏移量
  offset.value -= (scrollSpeed * delta) / 1000;

  // 检查是否需要重置位置
  const wrapperHeight = scrollWrapper.value?.clientHeight || 0;
  const contentHeight = items.value.length * itemHeight;

  // 当内容完全滚出视图时，重置位置
  if (-offset.value >= itemHeight) {
    // 移除第一项并添加到末尾
    const firstItem = items.value.shift();
    items.value.push(firstItem);

    // 更新显示项目（保持7条）
    displayItems.value = items.value.slice(0, 7);

    // 重置偏移量（考虑移除了一项）
    offset.value += itemHeight;
  }

  animationFrameId = requestAnimationFrame(scrollAnimation);
};

// 开始滚动
const startScrolling = () => {
  lastTimestamp = 0;
  animationFrameId = requestAnimationFrame(scrollAnimation);
};

// 停止滚动
const stopScrolling = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// 组件卸载时清除定时器
onUnmounted(() => {
    stopInterval();
    stopScrolling();

});
</script>

<style scoped>
.scroll-container {
  width: 300px;
  /* background: #ddd; */
}

.scroll-card {
  overflow: hidden;
}

.scroll-wrapper {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.scroll-content {
  transition: transform 0.3s linear;
  will-change: transform;
}

.scroll-item {
  display: flex;
  justify-content: space-around;
  line-height: 50px;
  line-height: 30px;
  /* border-bottom: 1px solid #ebeef5; */
}
.title {
  width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.time {
  width: 40%;
  padding-left: 20px;
  box-sizing: border-box;
}
</style>
