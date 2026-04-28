<template>
    <div class="main-container" ref="myDiv">
      <div class="container-box">
        <el-tabs type="border-card" class="demo-tabs">
          <el-tab-pane label="登录日志">
            <LoginLog queryType="2"  :height="tableHeight" @waitEvent="getWaitPageChange"></LoginLog>
          </el-tab-pane>
          <el-tab-pane label="操作日志">
            <Operation queryType="2"  :columns="tableColumns"  :height="tableHeight" @waitEvent="getWaitPageChange"></Operation>


          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </template>
  <script setup>
  import { ref, watchEffect ,inject } from "vue";
  import { storeToRefs } from "pinia";
  import { systemStore } from "@/stores/common.js";
  import LoginLog from "./module/LoginLog.vue";
  import Operation from "./module/Operation.vue";

  const tableHeight = ref(0);
  const myDiv = ref(null);
  const passTotal = ref(0)
  const waitTotal = ref(0)
  const failTotal = ref(0)
  const tableColumns = ref([
    { prop: "operatorName", label: "姓名" },
  { prop: "createTime", label: "时间" },
    { prop: "module", label: "模块" },
    { prop: "description", label: "内容" },
    { prop: "auditStatus", label: "状态",slot:"auditStatus" },


  ]);
  watchEffect(() => {
    if (myDiv.value) {
      tableHeight.value = myDiv.value.clientHeight - 185; // 获取高度并响应式更新
    }
  });
  const emit = defineEmits(["childEvent"]);
  //获取数量
  const getWaitPageChange = () => {
    let { examineTotal } =systemStore(); //引入store
    waitTotal.value = examineTotal.waitTotal
    passTotal.value = examineTotal.passTotal
    failTotal.value = examineTotal.failTotal
  };
  </script>

  <style scoped lang="less">
    .main-container {
  height: 100%;
  padding: 0 5px;
  box-sizing: border-box;
}
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
  </style>
