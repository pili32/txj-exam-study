<template>
  <div class="scroll-container">
    <div class="scroll-wrapper">
      <div class="scroll-content">
        <div v-for="(item, index) in items" :key="index" class="scroll-item">
          {{ item }}
        </div>
        <!-- 复制一份实现无缝滚动 -->
        <div
          v-for="(item, index) in displayItems"
          :key="index"
          class="scroll-item"
        >
          <div class="title">
            <img :src="news" alt="" />
            <span>{{ item.title }}</span>
          </div>
          <div class="time">{{ item.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { homeArticleRollList } from "@/api/knowledge";
import news from "@/assets/image/new.png";

let timer = null;
const items = ref([]);
const displayItems = ref(items.value.slice(0, 7));
console.log(displayItems.value);

onMounted(() => {
  startInterval();
});

const startInterval = () => {
  initData(); // 立即调用一次
  timer = setInterval(initData, 60 * 1000); // 每分钟调用一次
};
const initData = async () => {
  await nextTick(); // 等待DOM更新完成
  await homeArticleRollList().then(async (res) => {
    const data = await res.data.records.map((item) => {
      return {
        title: item.title,
        date: item.releaseTime.split(" ")[0],
      };
    });
    displayItems.value = data;
    console.log(items.value);
    console.log(displayItems.value);
  });
};

// 清除定时器
const stopInterval = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};
onUnmounted(() => {
  stopInterval();
});
</script>

<style scoped>
.scroll-container {
  width: 300px;
  margin: 20px auto;
}

.scroll-card {
  height: 210px;
  overflow: hidden;
}

.scroll-wrapper {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.scroll-content {
  display: flex;
  flex-direction: column;
  animation: scrollUp 10s linear infinite;
  -moz-animation: scrollUp 10s linear infinite; /* 添加火狐前缀 */
}

.scroll-item {
  height: 30px;
  line-height: 30px;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}
.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 70%;
  padding-right: 5px;
  font-size: 12px;
  display: flex;
  align-items: center;
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
img {
  margin-right: 5px;
  width: 24px;
  height: 26px;
}
.time {
  width: 70px;
  font-size: 10px;
}
.new {
  color: #67c23a;
  margin-right: 5px;
  font-size: 10px;
}
@-webkit-keyframes scrollUp {
  /* 添加WebKit前缀以兼容其他浏览器 */
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

@keyframes scrollUp {
  /* 标准语法 */
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

@-moz-keyframes scrollUp {
  /* 火狐前缀 */
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}
</style>
