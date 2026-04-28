<template>
  <div class="layout-box">
    <div>
      <h2>文件名称： {{ videoName }}</h2>
    </div>
    <div>
      <base-video
        :src="videoSrc"
        @ended="onEnded"
        :width="videoWidth"
        :height="videoHeight"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted,computed, inject } from "vue";
import { storeToRefs } from "pinia";
import { getToken } from "@/utils/auth";
import { queryByIdApi } from "@/api/knowledge";
import BaseVideo from "@/components/BaseVideo.vue";
import bilibili from "@/assets/video/bilibili.mp4";
import axios from "axios";
import { systemStore } from "@/stores/common.js";
import { userStore } from "@/stores/user.js";
import { useRoute } from "vue-router";
import { updateReadingPoints } from "@/api/points";

const userStores = userStore();

const { enableUserPoints } = userStores.userInfo;

defineProps({
  height: { type: Number, default: null },
  securityData: { type: Array, default: [] },
  mode: { type: String, default: "default" }, // 'default' 或 'simple'
});

const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
const videoName = ref("");
const videoSrc = ref("");
const videoWidth = ref(640); // 响应式宽度
const videoHeight = ref(360); // 响应式高度
const seconds = ref(0);
const timerDestroyed = ref(false);
let timer = null;

const headers = ref({
  Authorization: getToken(), //headers属性中添加token，这个属性是el-upload自带的用来设置上传请求头部
});

onMounted(() => {
  const route = useRoute();
  const id = route.query.id;
  const name = route.query.name;
  videoName.value = name;

  const src = apiUrl.value + "/business/annex/streamVideo?id=" + id;
  getVideoFile(src);

  const params ={
    id:id,
    name:name,

  }
  startTimer(params)

});
// 启动计时器，开始倒计时
const startTimer = (params) => {
  if(enableUserPoints == 0) return;
  timer = setInterval(() => {
    seconds.value++;
    // 检查是否达到1分钟（60秒）
    if (seconds.value == 60 && !timerDestroyed.value) {
      destroyTimer();
      getupdateReadingPoints(params)
    }
  }, 1000);
};
const getupdateReadingPoints= (params)  =>{
  updateReadingPoints(params).then(res =>{

  })
}
// 销毁计时器
const destroyTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    timerDestroyed.value = true;
  }
};
const getVideoFile = async (src) => {
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    const response = await axios.get(src, {
      responseType: "blob", // 关键：告诉 axios 返回 Blob 数据
    });
    // 1. 创建 Blob 对象
    const blob = new Blob([response.data], { type: "video/mp4" });

    // 2. 生成 Object URL
    videoSrc.value = URL.createObjectURL(blob);
    loading.close();
    // 3. 可选：在组件卸载时释放 URL
    // onUnmounted(() => URL.revokeObjectURL(videoSrc.value));
  } catch (error) {
    console.error("加载视频失败:", error);
    loading.close();
  }
};

// 使用 computed 创建计算属性
const displayTime = computed(function () {
  return formatTime(seconds.value);
});

// 兼容的格式化时间函数（避免使用可选链等新特性）
const formatTime = function (totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return (
    (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs)
  );
};
const onEnded = () => {
  console.log("视频播放结束");
};
</script>

<style scoped lang="less">
.layout-box {
  padding: 10px;
  display: flex;
  color: #000;
  flex-direction: column;
  align-items: center;
}
.layout-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80vw;
}
header {
  display: flex;
  justify-content: center;
  padding: 5px 0;
}
.el-form-item__content {
  align-items: center;
}
.flex-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 29px;
  font-size: 14px;
  div {
    color: #606266;
  }
}
.flex-user {
  display: flex;
  flex-direction: column;
  padding-left: 29px;
  font-size: 14px;
  width: 100%;
  .upload-check {
    color: #409eff;
    cursor: pointer;
    margin: 10px 0;
  }
}
.gap-2 {
  gap: 0.5rem;
}
.flex {
  display: flex;
}
.el-tag {
  margin: 2px;
}
.layout-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  span {
    margin: 0 5px;
  }
}
.content {
  min-height: 200px;
  width: 100%;
}
.font-size {
  span {
    cursor: pointer;
  }
}
</style>
