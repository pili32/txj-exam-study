<template>
  <div class="layout-box">
    <!-- <p>页面已停留: {{ displayTime }}</p>
    <p v-if="timerDestroyed">计时器已销毁（已停留1分钟）</p> -->
    <div id="OFDActiveXDIV"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount,computed ,watch} from "vue";
import { useRoute } from "vue-router";
import { dateFormatYMDHMS } from "@/utils/dateFormat";
import { userStore } from "@/stores/user.js";

import { updateReadingPoints } from "@/api/points";
const userStores = userStore();

const { enableUserPoints } = userStores.userInfo;

onMounted(() => {
  const route = useRoute();
  const id = route.query.id;
  const name = route.query.name
  const params ={
    id:id,
    name:name,

  }
  initOfd(id);
  startTimer(params)
});

let ocx = ref("");
const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
// 定义响应式数据
const seconds = ref(0);
const timerDestroyed = ref(false);
let timer = null;

const initOfd = (id) => {
  var iWidth = window.screen.availWidth - 30;
  var iHeight = window.screen.availHeight - 80;

  ocx.value = suwell.ofdReaderInit("OFDActiveXDIV", iWidth, iHeight);
  let downUrl = apiUrl.value + "/business/annex/downLoad?id=" + id;
  ocx.value.openFile(downUrl, false);
  window.ocx = ocx;

  setTimeout(function () {
    addTrackInfo();
  }, 2000);
};
const addTrackInfo = () => {
  const date = dateFormatYMDHMS();
  const { userName } = userStores.userInfo.user;

  var codeInfo =
    "<setinfo type='barinfo'>" +
    "<parameter name='pages' value=\"all\"/>" +
    '<parameter name="rotate" value="315"/>' +
    '<parameter name="visible" value="true"/>' +
    '<parameter name="printable" value="true"/>' +
    '<parameter name="isTile" value="true"/>' +
    '<parameter name="xpostype" value="center"/>' +
    '<parameter name="ypostype" value="center"/>' +
    '<parameter name="x" value="5"/>' +
    '<parameter name="y" value="80"/>' +
    '<parameter name="w" value="100"/>' +
    '<parameter name="h" value="100"/>' +
    '<parameter name="strcont" font="宋体" size="13" bold="true" italic="false"  opaque="70" color= "E8E8E8 ">' +
    `${userName} ${date}` +
    "</parameter>" +
    "</setinfo>";

  ocx.value.addTrackInfo(codeInfo);
};

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

// 兼容的格式化时间函数（避免使用可选链等新特性）
const formatTime = function (totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return (
    (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs)
  );
};

// 使用 computed 创建计算属性
const displayTime = computed(function () {
  return formatTime(seconds.value);
});

// 销毁计时器
const destroyTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    timerDestroyed.value = true;
  }
};
// 组件卸载前清理计时器
onBeforeUnmount(() => {
  destroyTimer();
});
</script>

<style scoped lang="less"></style>
