<template>
  <div class="main-container" ref="myDiv">

    <div class="container-box">
      <el-tabs type="border-card" class="demo-tabs" @tab-change="tabChange" v-model="activeName ">
        <el-tab-pane :label="`待审核 （${waitTotal}）`"  name="wait" >
          <wait :height="tableHeight" @waitEvent="getPageChange" :searchItems="searchItems" :tabName="activeName"></wait>
        </el-tab-pane>
        <el-tab-pane :label="`审核通过 （${passTotal}）`" name="pass" >
          <pass :height="tableHeight" @waitEvent="getPageChange"  :searchItems="searchItems" :tabName="activeName"></pass>
        </el-tab-pane>
        <el-tab-pane :label="`审核不通过 （${failTotal}）`" name="fail">
          <fail :height="tableHeight" @waitEvent="getPageChange"    :searchItems="searchItems" :tabName="activeName"></fail>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect ,inject } from "vue";
import { storeToRefs } from "pinia";

import wait from "./wait.vue";
import pass from "./pass.vue";
import fail from "./fail.vue";
import { systemStore } from "@/stores/common.js";

const tableHeight = ref(0);
const handleSearch = () => {};

const handleReset = () => {};
const myDiv = ref(null);
const passTotal = ref(0)
const waitTotal = ref(0)
const failTotal = ref(0)
const currentTab =ref("")
const activeName = ref("wait")
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 195; // 获取高度并响应式更新
  }
});
const searchItems = ref([
  {
    type: "input",
    prop: "module",
    label: "模块名称",
  },
]);
const emit = defineEmits(["childEvent"]);

const defaultParams = ref({
  status: "1",
});
const tabChange = (tab,event) => {
  ;
};

//获取数量
const getPageChange = () => {
  let { examineTotal } =systemStore(); //引入store
  waitTotal.value = examineTotal.waitTotal
  passTotal.value = examineTotal.passTotal
  failTotal.value = examineTotal.failTotal
}
const getPassPageChange = (value) => {
  let { examineTotal } =systemStore(); //引入store
  waitTotal.value = examineTotal.waitTotal
  passTotal.value = examineTotal.passTotal
  failTotal.value = examineTotal.failTotal
}


const getFailPageChange = (value) => {
  let { examineTotal } =systemStore(); //引入store
  waitTotal.value = examineTotal.waitTotal
  passTotal.value = examineTotal.passTotal
  failTotal.value = examineTotal.failTotal
};
</script>

<style scoped lang="less">
.container-box {
  margin: 2px;
  background: #fff;
  border: 1px solid #dcdfe6;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12),
    0 0 6px 0 rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
}
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
.demo-tabs .custom-tabs-label .el-icon {
  vertical-align: middle;
}
.demo-tabs .custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}
.advanced-search-container{
  padding: 0  ;
}
</style>
