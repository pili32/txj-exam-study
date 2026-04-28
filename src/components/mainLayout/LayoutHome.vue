<template>
  <div class="home-container">
    <div class="home-container-layout">
      <layout-Header :showBacImg="false" :menuData="menuData" />
      <div class="home-container-box">
        <div class="home-box">
          <div class="title-titps">
            <el-image fit="cover" alt="首页" :src="study" />
            <div class="border-line"></div>
          </div>
        </div>
        <div class="home-content">
          <div class="home-layout">
            <div class="home-card">
              <div class="titles">
                <el-image fit="cover" alt="首页" :src="jishuziliao" />
              </div>
              <div class="layout-box">
                <div class="home-left">
                  <el-image fit="cover" alt="首页" :src="ziliao" />
                </div>
                <div class="home-tabs">
                  <el-tabs
                    v-model="activeName"
                    class="demo-tabs"
                    @tab-change="handleClick"
                  >
                    <el-tab-pane label="设备技术资料" name="1">
                      <div class="home-right">
                        <div
                          class="right-box-content"
                          v-for="(item, index) in equipmentData"
                          @click="toPreview(item.id)"
                        >
                          <div class="item-title">{{ item.title }}</div>
                          <div class="item-time">
                            {{ item.releaseTime.split(" ")[0] }}
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane label="线路技术资料" name="2">
                      <div class="home-right">
                        <div
                          class="right-box-content"
                          v-for="(item, index) in lineData"
                          @click="toPreview(item.id)"
                        >
                          <div class="item-title">{{ item.title }}</div>
                          <div class="item-time">
                            {{ item.releaseTime.split(" ")[0] }}
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane label="会电技术资料" name="3">
                      <div class="home-right width100">
                        <div
                          class="right-box-content"
                          v-for="(item, index) in HuidianData"
                          @click="toPreview(item.id)"
                        >
                          <div class="item-title">{{ item.title }}</div>
                          <div class="item-time">
                            {{ item.releaseTime.split(" ")[0] }}
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                  <div
                    class="home-more-right"
                    @click="navigateTo(studyRouter, activeName)"
                  >
                    <el-image
                      style="width: 20px; height: 20px"
                      fit="cover"
                      :src="moreImg"
                    />
                  </div>
                  <!-- <div
                  class="right-box-content"
                  v-for="(item, index) in trainingData"
                  @click="toPreview(item.id)"
                >
                  <div class="item-title">{{ item.title }}1</div>
                  <div class="item-time">{{ item.releaseTime }}</div>
                </div> -->
                </div>
              </div>
            </div>
            <div class="home-card">
              <div class="titles">
                <el-image fit="cover" alt="首页" :src="jiaocai" />
              </div>
              <div class="layout-box">
                <div class="home-left">
                  <el-image fit="cover" alt="首页" :src="peixun" />
                </div>
                <div class="home-more">
                  <div class="more" @click="navigateTo(studyRouter, '4')">
                    <el-image
                      style="width: 20px; height: 20px"
                      fit="cover"
                      :src="moreImg"
                    />
                  </div>
                  <div class="home-right width-calc">
                    <div
                      class="right-box-content"
                      v-for="(item, index) in trainingData"
                      @click="toPreview(item.id)"
                    >
                      <div class="item-title">{{ item.title }}</div>
                      <div class="item-time">
                        {{ item.releaseTime.split(" ")[0] }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="home-layout">
            <div class="home-card">
              <div class="titles">
                <el-image fit="cover" alt="首页" :src="xinyewu" />
              </div>
              <div class="layout-box">
                <div class="home-left">
                  <el-image fit="cover" alt="首页" :src="jishu" />
                </div>
                <div class="home-more">
                  <div class="more" @click="navigateTo(studyRouter, '5')">
                    <el-image
                      style="width: 20px; height: 20px"
                      fit="cover"
                      :src="moreImg"
                    />
                  </div>
                  <div class="home-right width-calc">
                    <div
                      class="right-box-content"
                      v-for="(item, index) in newTechnologyData"
                      @click="toPreview(item.id)"
                    >
                      <div class="item-title">{{ item.title }}</div>
                      <div class="item-time">
                        {{ item.releaseTime.split(" ")[0] }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="home-card">
              <div class="titles">
                <el-image fit="cover" alt="首页" :src="wenjian" />
              </div>
              <div class="layout-box">
                <div class="home-left">
                  <el-image fit="cover" alt="首页" :src="zhengce" />
                </div>
                <div class="home-more">
                  <div class="more" @click="navigateTo(studyRouter, '6')">
                    <el-image
                      style="width: 20px; height: 20px"
                      fit="cover"
                      :src="moreImg"
                    />
                  </div>
                  <div class="home-right width-calc">
                    <div
                      class="right-box-content"
                      v-for="(item, index) in policyData"
                      @click="toPreview(item.id)"
                    >
                      <div class="item-title">{{ item.title }}</div>
                      <div class="item-time">
                        {{ item.releaseTime.split(" ")[0] }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="home-box">
          <div class="title-titps">
            <el-image fit="cover" alt="首页" :src="rukou" />
            <div class="border-line"></div>
          </div>
        </div>
        <div class="footer">
          <div class="footer-card">
            <div class="footer-layout">
              <div v-for="(menu, index) in menuList" class="footer-item">
                <div class="footer-item1">
                  <span @click="navigateTo(menu,'')">{{ menu.name }}</span>
                </div>
                <div class="children-item">
                  <div
                    v-for="(item, index) in menu.children"
                    class="container-item"
                  >
                    <el-image
                      fit="cover"
                      alt="首页"
                      :src="meunImage(item.name)"
                      style="height: 25px; width: 25px"
                    />
                    <span @click="navigateTo(item,'')">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="notice-box">
        <notice></notice>
      </div>
      <div class="fixed-top-button-container" >
        <el-button
          type="primary"
          class="fixed-button"
          style="top:500px"
          @click="feedBackChange"

        >
         意见反馈
        </el-button>
      </div>
    </div>
  </div>
</template>
<script setup >
import { useRouter } from "vue-router";
import { computed, reactive, ref, onMounted } from "vue";
import layoutHeader from "./layoutHeader.vue";
import Notice from "./Notice.vue";

import moreImg from "@/assets/image/more.png";
import { homeArticlePageList } from "@/api/knowledge";

import { userDeptPageList } from "@/api/system";
import { storeToRefs } from "pinia";
import { menuStore } from "@/stores/menu.js";
const store = menuStore();
import study from "@/assets/image/layoutHome/study.png";
import rukou from "@/assets/image/layoutHome/rukou.png";

import jiaocai from "@/assets/image/layoutHome/jiaocai.png";

import ziliao from "@/assets/image/layoutHome/ziliao.png";
import jishu from "@/assets/image/layoutHome/jishu.png";
import peixun from "@/assets/image/layoutHome/peixun.png";
import zhengce from "@/assets/image/layoutHome/zhengce.png";
import jishuziliao from "@/assets/image/layoutHome/jishuziliao.png";

import wenjian from "@/assets/image/layoutHome/wenjian.png";
import xinyewu from "@/assets/image/layoutHome/xinyewu.png";

const { isCollapse, activeIndex, routerList } = storeToRefs(menuStore());
const menuWidth = computed(() => (isCollapse.value ? "80px" : "200px"));
const router = useRouter();
import { systemStore } from "@/stores/common.js";


import cubeImg from "@/assets/image/home/cube.png";
import card0 from "@/assets/image/home/card0.png";
import card1 from "@/assets/image/home/card1.png";
import card2 from "@/assets/image/home/card2.png";
import card3 from "@/assets/image/home/card3.png";
import card4 from "@/assets/image/home/card4.png";
import card5 from "@/assets/image/home/card5.png";
import practice from "@/assets/image/layoutHome/practice.png";
import question from "@/assets/image/layoutHome/question.png";

import biwu from "@/assets/image/layoutHome/biwu.png";
import chengji from "@/assets/image/layoutHome/chengji.png";
import cuoti from "@/assets/image/layoutHome/cuoti.png";
import fenlei from "@/assets/image/layoutHome/fenlei.png";
import jifen from "@/assets/image/layoutHome/jifen.png";
import jilu from "@/assets/image/layoutHome/jilu.png";
import kaoshi from "@/assets/image/layoutHome/kaoshi.png";
import lianxi from "@/assets/image/layoutHome/lianxi.png";
import shijuan from "@/assets/image/layoutHome/shijuan.png";

import tongji from "@/assets/image/layoutHome/tongji.png";
// import xuexi from "@/assets/image/layoutHome/xuexi.png";
import yuedu from "@/assets/image/layoutHome/yuedu.png";

// const imageModules = import.meta.glob('@/assets/image/home/*.png');
// console.log(imageModules);
// const images = ref([])
// for (const path in imageModules) {
//   imageModules[path]().then((module) => {
//     console.log(module);
//     images.value.push({
//       name: path.split('/').pop().replace('.png', ''), // 提取文件名
//       url: module.default, // 图片 URL
//     });
//   });
// }

import footerImg from "@/assets/image/home/footer.png";
import { nextTick } from "vue";

const { setStudyTypeData } = storeToRefs(systemStore()); //引入store


const imageNames = ref(["card0", "card1", "card2"]); // 图片名称数组
const studyTypeData = ref([]);

const filterImage = (index) => {
  let name = null;

  switch (index) {
    case 0:
      name = card0;
      break;
    case 1:
      name = card1;
      break;
    case 2:
      name = card2;
      break;
    case 3:
      name = card3;
      break;
    case 4:
      name = card4;
      break;
    case 5:
      name = card5;
      break;
    case 6:

    default:
      throw new Error("未知的 type 类型");
  }

  return name;
};

const meunImage = (value) => {
  let name = null;

  switch (value) {
    case "资料录入":
      name = practice;
      break;
    case "已发布资料":
      name = question;
      break;
    case "资料学习":
      name = practice;
      break;
    case "分类维护":
      name = fenlei;
      break;
    case "题库导入":
      name = practice;
      break;
    case "试题学习":
      name = question;
      break;
    case "试题练习":
      name = lianxi;
      break;
    case "练习记录":
      name = jilu;
      break;
    case "错题集锦":
      name = cuoti;
      break;
    case "生成试卷":
      name = shijuan;
      break;

    case "生成考试":
      name = kaoshi;
      break;
    case "比武考试":
      name = biwu;
      break;
    case "比武成绩":
      name = chengji;
      break;
    case "积分统计":
      name = jifen;
      break;

    case "阅读量统计":
      name = yuedu;
      break;
    case "考试统计":
      name = tongji;
      break;

    default:
      name = practice;
      break;
  }

  return name;
};
const activeName = ref("1");
const menuData = routerList.value;
const menuList = computed(() => {
  console.log(menuData);
  return menuData.filter((item) => item.name !== "知识管理");
});

const studyRouter = reactive({
  path: "/knowledge/study",
  meta: { name: "资料学习", path: "/knowledge/study" },
  name: "资料学习",
});
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  initData();
});
let trainingData = ref([]); //培训
let equipmentData = ref([]); //设备
let lineData = ref([]); //线路
let HuidianData = ref([]); //会电
let newTechnologyData = ref([]); //新技术
let policyData = ref([]); //政策

const navigateTo = (menu, valueCode) => {
  console.log(menu);
  // router.push(menu.path);
  activeIndex.value = menu.path;
  if (!valueCode) {
    router.push(menu.path);
  } else {
    router.push({
      path: menu.path,
      query: { typeCode: valueCode },
    });
  }
  console.log(menu);
  store.selectMenu(menu);
};
const toPreview = (row) => {
  const origin = window.location.origin;

  window.open(origin + "/#/preview?id=" + row, "_blank");
};

// 滚动事件处理
const handleScroll = () => {
  if (!props.fixed) return

  // 如果需要保持相对于视口固定，则不需要调整位置
  // 如果需要相对于文档固定（不随滚动移动），则保持原逻辑
  // 这里我们实现的是相对于文档固定（不随滚动移动）的效果
  // 所以实际上不需要在滚动时做任何处理，因为使用了 fixed 定位
}

const handleClick = (tab, event) => {
  activeName.value = tab;

};

const feedBackChange = () => {
  const origin = window.location.origin;
  window.open(origin + "/#/feedback");

}
const initData = async () => {
  await nextTick(); // 等待DOM更新完成
  // studyTypeData.value = setStudyTypeData.value.map((item, index) => {
  //   return {
  //     value: item.valueCode,
  //     label: item.valueName,
  //     name: new URL(`./images/${imageNames[index]}.jpg`, import.meta.url).href,
  //   };
  // });
  await homeArticlePageList().then(async (res) => {
    trainingData.value = res.data.type4;
    equipmentData.value = res.data.type1.slice(0, 6); //设备
    lineData.value = res.data.type2.slice(0, 6); //设备
    HuidianData.value = res.data.type3.slice(0, 6); //设备
    newTechnologyData.value = res.data.type5; //设备
    policyData.value = res.data.type6; //设备

    // let lineData = ref([]); //线路
    // let HuidianData = ref([]); //会电
    // let newTechnologyData = ref([]); //新技术
    // let policyData = ref([]); //政策
  });
};
</script>

<style lang="less" scoped>
.home-container {
  width: 100%;
  .home-container-layout {
    background: #fff;
    position: relative;
  }
  .home-container-box {
    background: rgba(0, 0, 0, 0.5) url("@/assets/image/layoutHome/bg.png");

    background-size: cover;
    // background-position: center;
    background-repeat: no-repeat;
    padding-bottom: 1vh;
  }
}
.home-box {
  width: 70vw;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}
.title-titps {
  display: flex;
  flex-direction: row;
  .el-image {
    height: 35px;
  }
  .border-line {
    border-bottom: 1px solid red;
    width: 50vw;
    margin-bottom: 13px;
    margin-left: 7px;
  }
}

.home-content {
  width: 90vw;
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto;

  .home-layout {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin-top: 2vh;
  }
  .titles {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  .home-card {
    width: 49%;
    // background: #ddd;
    display: flex;
    flex-direction: column;
  }
  .layout-box {
    display: flex;
    flex-direction: row;
    padding-top: 10px;
    background: url("@/assets/image/layoutHome/card.png");
    background-size: cover;
    // background-position: center;
    background-repeat: no-repeat;
    padding-top: 10px;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
    border-radius: 7px;
    .home-left {
      .el-image {
        width: 150px;
        height: 240px;
      }
    }
    .home-tabs {
      width: 100%;
      position: relative;
      .home-more-right {
        position: absolute;
        top: 0;
        right: 20px;
        cursor: pointer;
      }
    }
    .width-calc {
      width: calc(100%);
    }
    .width100 {
      width: 100%;
    }
    .home-more {
      display: flex;
      flex-direction: column;
      width: 100%;
      .more {
        text-align: right;
        padding-right: 20px;
        cursor: pointer;
        height: 20px;
      }
    }
    .home-right {
      display: flex;
      flex-wrap: wrap;
      gap: 0 16px; /* 行间距为0，列间距为16px */
      // height: 100%;
      font-size: 15px;

      .right-box-content {
        width: 46%;
        // height: 20px;
        border-bottom: 1px dashed #ddd;
        display: flex;
        justify-content: space-between;
        margin-right: 2%;
        cursor: pointer;
        margin-top: 10px;
        padding-bottom: 5px;
        .item-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 73%;
        }

        .item-time {
          width: 25%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: right;
        }
      }
    }
  }
}
::v-deep .el-tabs__item {
  font-size: 17px;
}
::v-deep .el-tabs__item.is-active,
.el-tabs__item:hover {
  color: #d81e16;
}
::v-deep .el-tabs__active-bar {
  background: #d81e16 !important;
}

::v-deep .el-tabs__item:hover {
  color: #d81e16 !important;
}

::v-deep .el-card__body {
  padding: 10px 0 0 0;
}
.container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px); /* 或者固定高度如 500px */
  .container-item {
    flex: 1;
    min-height: 0; /* 防止内容溢出 */
    margin: 5px 0;
    transition: all 0.3s ease;
    align-items: center;
    display: flex;
    justify-content: center;
    span {
      cursor: pointer;
    }
  }
  .container-item:hover {
    transform: translateY(-5px);
    border-radius: 5px;
    color: #409eff; /* Element Plus 主色 */
    background: #f0f2f5;
  }
}

/* Flex 布局容器 */
.menu-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  // height: 80vh;
  border-radius: 10px;
  background: #fff;
  // padding: 20px 20px;

  .layout-main {
    width: 100%;
    height: 20vh;
    background-image: url("@/assets/image/home/headers.png");
    background-size: cover; /* 或者其他你需要的背景大小 */
    background-position: center; /* 或者其他你需要的背景位置 */
    border-radius: 5px;
  }
  .layout-text {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    font-size: 18px;
    .el-image {
      margin-right: 10px;
    }
  }
  // gap: 1.5rem;
}
.module-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 56vh;

  .module-item {
    display: flex;
    width: 40%;
    margin-top: 10px;
    padding: 10px;
    cursor: pointer;

    .box-card {
      width: 100%;

      span {
        margin-left: 10px;
      }
    }
    .card-item {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      height: calc(100% - 60px);
      font-size: 14px;
      .items {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px dashed #ddd;
        height: 20%;
        align-items: center;
      }
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
      font-size: 18px;
    }
  }
}
.footer {
  display: flex;
  height: 20vh;
  width: 99vw;
  margin-top: 10px;

  display: flex;
  justify-content: center;
  box-sizing: border-box;
  margin-bottom: 1vh;

  .footer-card {
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
    width: 80vw;
    border-radius: 10px;
    border: 1px solid orange;
    //   background-image: url("@/assets/image/home/footer.png");
    // background-size: cover; /* 或者其他你需要的背景大小 */
    // background-position: center; /* 或者其他你需要的背景位置 */
  }
  .footer-layout {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 19vh;
    .footer-item1 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      padding: 5px;
      box-sizing: border-box;
    }
  }
  .footer-item {
    width: 25%;
    height: 100%;
    border-right: 1px solid #ddd;
    padding: 10px;
    box-sizing: border-box;
  }
  .children-item {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    font-size: 16px;
    width: 100%;
    .container-item {
      width: 48%;
    }
  }
  .container-item {
    margin: 10px 0;
    transition: all 0.3s ease;
    align-items: center;
    display: flex;
    justify-content: center;
    span {
      cursor: pointer;
      margin-left: 5px;
    }
  }
  ::v-deep .el-card__body {
    padding: 0 10px;
  }
}

/* 1 个菜单：单独居中 */
.menu-container.layout-1 {
  justify-content: center;
}
.menu-container.layout-1 .menu-card {
  flex: 0 0 50%; /* 限制宽度，避免过宽 */
  height: 42vh;
}

/* 2 个菜单：并排均分 */
.menu-container.layout-2 .menu-card {
  flex: 1 1 calc(50% - 1.5rem);
  min-width: 0;
  height: 42vh;
  margin-right: 1.5rem;
}

/* 3 个菜单：并排均分 */
.menu-container.layout-3 .menu-card {
  flex: 1 1 calc(33.333% - 1.5rem);
  min-width: 0;
  height: 42vh;
  margin-right: 1.5rem;
}

/* 4 个菜单：两行两列（均分） */
.menu-container.layout-4 .menu-card {
  flex: 1 1 calc(50% - 1.5rem);
  min-width: 0;
  height: 32vh;
  margin-right: 1.5rem;
}

/* 5 个菜单：上 3 下 2 */
.menu-container.layout-5 .menu-card:nth-child(-n + 3) {
  flex: 1 1 calc(33.333% - 1.5rem); /* 前 3 个占 3 列 */
  height: 32vh;
  margin-top: 1.5rem;
  margin-right: 1.5rem;
}
.menu-container.layout-5 .menu-card:nth-child(n + 4) {
  flex: 1 1 calc(50% - 1.5rem); /* 后 2 个占 2 列 */
  height: 32vh;
  margin-top: 1.5rem;
  margin-right: 1.5rem;
}

/* 菜单卡片样式 */
.menu-card {
  transition: all 0.3s ease;
  background: #fff;
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
}

.menu-card:hover {
  transform: translateY(-5px);
}

.menu-content {
  padding: 0.5rem;
  width: 100%;
  align-items: center;
}
.menu-more {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
  color: #bfbfbf;
  p {
    padding: 0;
    margin: 0;
  }
}
.menu-content h3 {
  margin: 0.8rem 0;
  color: #42b983;
}

.menu-content p {
  color: #666;
  font-size: 0.9rem;
}

/* 响应式调整（可选） */
@media (max-width: 768px) {
  .menu-container .menu-card {
    flex: 1 1 100% !important; /* 小屏幕下全部堆叠 */
  }
}
.notice-box {
  position: absolute;
  top: 20vh;
  right: 0;
}

.fixed-top-button-container {
    position: relative;


}

.fixed-button {
  position: fixed;
  right: 10px;
  z-index: 999;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}
</style>
