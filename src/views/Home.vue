<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-container class="common-container">
        <!-- <el-header class="el-header">
          <Header></Header>
        </el-header> -->
          <layout-home />
          <!-- <home /> -->

      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import Aside from "../components/mainLayout/aside.vue";
import Header from "../components/mainLayout/navHeader.vue";
import layoutHome from "../components/mainLayout/LayoutHome.vue";
import home from "../components/mainLayout/Home.vue";


</script>
<style lang="less" scoped>
.common-layout {
  height: 100%;
  .layout-container {
    height: 100%;
  }
}
.el-header {
    margin: 0;
    padding: 0;
    height: 40px;
}
.common-aside {
  // background: #fff7f5;
  overflow-y: auto;
  // width: 200px;
  background: rgba(0, 0, 0, 0.5) url("@/assets/image/menu.png");
  // background-size: cover;
  // background-position: center;
  // background-repeat: no-repeat;
}
.common-container{
  // background: #f5f7fa;
  width: calc(100% - 200px);
  color: #000;


}


</style>
