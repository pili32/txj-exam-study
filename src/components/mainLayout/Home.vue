<template>
  <div class="home-container">
    <Header :showBacImg="false" />
    <div class="home-box">
      <div
        class="menu-container"
        :class="{
          'layout-1': menuData.length === 1,
          'layout-2': menuData.length === 2,
          'layout-3': menuData.length === 3,
          'layout-4': menuData.length === 4,
          'layout-5': menuData.length === 5,
        }"
      >
        <div class="layout-main">
          <div class="layout-text">
            <el-image fit="cover" alt="首页" :src="cubeImg" />
            <span>知识学习</span>
          </div>
          <div>
            <div class="module-card">
              <div
                v-for="(menu, index) in studyTypeData"
                :key="index"
                class="module-item"
                shadow="hover"
              >
                <el-card class="box-card">
                  <div
                    class="card-header"
                    @click="navigateTo(studyRouter, menu.value)"
                  >
                    <div class="card-header">
                      <el-image
                        fit="cover"
                        :src="filterImage(index)"
                        style="height: 35px; width: 35px"
                      />
                      <span>{{ menu.label }}</span>
                    </div>
                    <el-image
                      style="width: 20px; height: 20px"
                      fit="cover"
                      :src="moreImg"
                    />
                  </div>
                  <div class="card-item">
                    <div
                      v-for="item in menu.data"
                      :key="item"
                      class="items"
                      @click="toPreview(item.id)"
                    >
                      <div class="item-title">{{ item.title }}</div>
                      <div class="item-time">{{ item.releaseTime }}</div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
            <div class="footer">
              <div class="footer-card">
                <div class="footer-layout">
                  <div v-for="(menu, index) in menuList" class="footer-item">
                    <div class="footer-item1">
                      <span @click="navigateTo(menu)">{{ menu.name }}</span>
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
                        <span @click="navigateTo(item)">{{ item.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from "vue-router";
import { computed, reactive, ref, onMounted } from "vue";
import Header from "./navHeader.vue";
import moreImg from "@/assets/image/more.png";
import { homeArticlePageList } from "@/api/knowledge";

import { userDeptPageList } from "@/api/system";
import { storeToRefs } from "pinia";
import { menuStore } from "@/stores/menu.js";
const store = menuStore();

const { isCollapse, activeIndex, routerList } = storeToRefs(menuStore());
const menuWidth = computed(() => (isCollapse.value ? "60px" : "200px"));
const router = useRouter();
import { systemStore } from "@/stores/common.js";
import cubeImg from "@/assets/image/home/cube.png";
import card0 from "@/assets/image/home/card0.png";
import card1 from "@/assets/image/home/card1.png";
import card2 from "@/assets/image/home/card2.png";
import card3 from "@/assets/image/home/card3.png";
import card4 from "@/assets/image/home/card4.png";
import card5 from "@/assets/image/home/card5.png";
import practice from "@/assets/image/home/practice.png";
import question from "@/assets/image/home/question.png";

import biwu from "@/assets/image/home/ICON/biwu.png";
import chengji from "@/assets/image/home/ICON/chengji.png";
import cuoti from "@/assets/image/home/ICON/cuoti.png";
import fenlei from "@/assets/image/home/ICON/fenlei.png";
import jifen from "@/assets/image/home/ICON/jifen.png";
import jilu from "@/assets/image/home/ICON/jilu.png";
import kaoshi from "@/assets/image/home/ICON/kaoshi.png";
import lianxi from "@/assets/image/home/ICON/lianxi.png";
import shijuan from "@/assets/image/home/ICON/shijuan.png";

import tongji from "@/assets/image/home/ICON/tongji.png";
import xuexi from "@/assets/image/home/ICON/xuexi.png";
import yuedu from "@/assets/image/home/ICON/yuedu.png";

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

const menuData = routerList.value;
const menuList = computed(() => {
  return menuData.filter((item) => item.name !== "知识管理");
});

const studyRouter = reactive({
  path: "/knowledge/study",
  meta: { name: "资料学习", path: "/knowledge/study" },
  name: "资料学习",
});
onMounted(() => {
  initData();
});
const navigateTo = (menu, valueCode, title) => {
  console.log(valueCode);
  router.push(menu.path);
  activeIndex.value = menu.path;
  if (!valueCode) {
    router.push(menu.path);
  } else {
    router.push({
      path: menu.path,
      query: { typeCode: valueCode },
    });
  }
  store.selectMenu(menu);
};
const toPreview = (row) => {
  const origin = window.location.origin;

  window.open(origin + "/#/preview?id=" + row, "_blank");
};
const initData = () => {
  studyTypeData.value = setStudyTypeData.value.map((item, index) => {
    return {
      value: item.valueCode,
      label: item.valueName,
      name: new URL(`./images/${imageNames[index]}.jpg`, import.meta.url).href,
    };
  });
  homeArticlePageList().then(async (res) => {
    let arr = [];
    for (let obj in res.data) {
      arr.push(res.data[obj]);
    }
    await studyTypeData.value.forEach((item, index) => {
      item.data = arr[index];
    });
    console.log(studyTypeData.value);
  });
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  width: 100%;
  text-align: center;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 100%;
  background: #409eff;
  flex-direction: column;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.5) url("@/assets/image/bg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  justify-content: center;
}
.home-box {
  width: 70vw;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
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
  height: 80vh;
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
    width: 30%;
    margin-top: 10px;
    padding: 10px;
    cursor: pointer;

    .box-card {
      width: 100%;
      ::v-deep .el-card__body {
        padding: 0 10px;
        height: 100%;
      }
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
        .item-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: calc( 100% - 180px);
          text-align: left
        }
        .item-time {
          width: 170px;
        }
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
  padding: 0 0.7vw;
  margin-top: 10px;
  background-image: url("@/assets/image/home/footer.png");
  background-size: cover; /* 或者其他你需要的背景大小 */
  background-position: center; /* 或者其他你需要的背景位置 */

  .footer-card {
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    border-radius: 10px;
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
</style>
