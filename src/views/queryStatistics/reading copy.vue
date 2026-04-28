<template>
    <div class="echart-box" ref="myDiv">
      <div class="echart-header">
        <el-form label-width="100px">
          <el-row>
            <el-col :span="10">
              <el-form-item label="资料名称：">
                <el-select
                  v-model="searchData.fileid"
                  placeholder="请选择类型"
                  prop="type"
                  style="min-width: 300px"
                  @change="handleChange"


                >
                  <el-option
                    v-for="item in fileData"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="部门：">
                <el-select
                  v-model="searchData.deptId"
                  placeholder="请选择类型"
                  prop="type"
                  style="min-width: 300px"
                  @change="handleChange"


                >
                  <el-option
                    v-for="item in deptData"
                    :key="item.id"
                    :label="item.deptName"
                    :value="item.id"
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
  import { getArticleAnnexWithCondition } from "@/api/knowledge";
  import {
    dateFormatYMDHMS,
    getDateMonthsAgo,
    dateFormatYMD,
  } from "@/utils/dateFormat";
  import WeEcharts from "@/components/WeEcharts/index.vue";
  import { pageListWithCondition } from "@/api/system";
  // 模拟数据
  const layoutHeight = ref(0);
  const myDiv = ref("");
  const searchData = ref({
    fileid: "",
    deptId:"",
    searchStatus:'reading'
  });
  const echartRef = ref("");
  watchEffect(() => {
    if (myDiv.value) {
      layoutHeight.value = myDiv.value.clientHeight - 150; //
    }
  });

  const fileData = ref([]);
  const deptData = ref([]);

  onMounted(() => {
    getFilesData();
    getDeptData();


  });
  const getFilesData = () => {
    getArticleAnnexWithCondition().then(res =>{
      fileData.value = res.data
      searchData.value.fileid = res.data[0].id
    })
  };
  const getDeptData = () => {
    const params ={
      size:-1,
      current:1,
      deptName:'专用通信局'
    }
    pageListWithCondition(params).then(res =>{
      deptData.value = res.data.records
      searchData.value.deptId = res.data.records[0].id
      echartRef.value.initChange( searchData.value)

    })
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
