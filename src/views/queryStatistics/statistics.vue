<template>
  <div class="echart-box" ref="myDiv">
    <div class="echart-header">
      <el-form label-width="100px">
        <el-row>
          <el-col :span="10">
            <el-form-item label="考试时间：">
              <el-date-picker
                v-model="retakeDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="请选择开始时间"
                end-placeholder="请选择结束时间"
                :size="size"
                @change="handleSearch"
                style="min-width: 200px"
                :default-value="defaultValue"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="考试名称：">
              <el-select
                v-model="searchData.examId"
                placeholder="请选择考试名称"
                prop="type"
                style="min-width: 300px"
                @change="handleChange"
              >
                <el-option
                  v-for="item in topicType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="选择部门：">
              <el-tree-select
                v-model="searchData.deptId"
                :data="treeData"
                :props="defaultProps"
                default-expand-all
                placeholder="请选择选择部门"
                style="min-width: 200px"
                @node-click="handleNodeClick"
                :default-expand-all="true"
                node-key="id"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="查看方式：">
              <el-select
                v-model="searchData.queryType"
                placeholder="请选择类型"
                prop="type"
                style="min-width: 300px"
                @change="handleChange"


              >
                <el-option
                  v-for="item in selectType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>


        </el-row>
      </el-form>
    </div>
    <We-echarts :height="layoutHeight" ref="echartRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watchEffect } from "vue";
import * as echarts from "echarts";
import { getDeptTreeApi } from "@/api/system";

import {
  dateFormatYMDHMS,
  getDateMonthsAgo,
  dateFormatYMD,
} from "@/utils/dateFormat";
import WeEcharts from "@/components/WeEcharts/index.vue";
import { getQueryExamList } from "@/api/examination";
import { ElLoading } from "element-plus";

const size = ref("small");
// 模拟数据
const treeData = reactive([]);
const layoutHeight = ref(0);
const myDiv = ref("");
const searchData = ref({
  examId: "",
  deptId:1,
  queryType: "dept",
});
const deptId = ref("");
const dateList = ref({
  queryStartTime: dateFormatYMD(getDateMonthsAgo(new Date(), 3)),
  queryEndTime: dateFormatYMD(new Date()),
});
const retakeDateRange = ref([
  dateFormatYMDHMS(getDateMonthsAgo(new Date(), 3)),
  dateFormatYMDHMS(new Date()),
]);
const defaultValue = ref([getDateMonthsAgo(new Date(), 3), new Date()]);
const echartRef = ref("");
watchEffect(() => {
  if (myDiv.value) {
    layoutHeight.value = myDiv.value.clientHeight - 150; //
  }
});

const topicType = ref([]);
const selectType = ref([
  {
    value: "dept",
    label: "按部门",
  },
  {
    value: "user",
    label: "按人员",
  },
]);
const defaultProps = {
  children: "children",
  label: "deptName",
};
onMounted(() => {
  getDeptTree();
  getExamList();
});
const getDeptTree = () => {
  const id = 1;
  getDeptTreeApi(1).then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
    }
  });
};
const getExamList = () => {
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  getQueryExamList(dateList.value).then((res) => {
    if (res.code == 200 && res.data.length > 0) {
      topicType.value = res.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      searchData.value.examId = topicType.value[0].value
    } else {
      topicType.value = []
      searchData.value.examId  = ""
    }
    loading.close()
    echartRef.value.initChange( searchData.value)
  }).catch(error =>{
    loading.close()
  });
};

const handleNodeClick = (event) => {
  searchData.value.deptId = event.id;
  echartRef.value.initChange( searchData.value)


};
const handleSearch = (event) => {
  dateList.value.queryStartTime = dateFormatYMD(event[0]),
  dateList.value.queryEndTime = dateFormatYMD(event[1]),
    getExamList();
};

const handleChange = (event) =>{
  // getExamList();
  echartRef.value.initChange( searchData.value)

}


// 初始化加载数据
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
