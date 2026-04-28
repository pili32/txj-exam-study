<template>
  <div class="main-container" ref="myDiv" v-if="showExam == 1">
    <!-- <div class="container-btn" v-if="!showExam">
      <el-button @click="handleAdd" type="primary" size="small">新增</el-button>
    </div> -->
    <div v-if="showExam == 1">
      <base-table
        :columns="columns"
        :data="tableData"
        :height="tableHeight"
        show-operation
        :total="total"
        :loading="tableLoading"
        @size-change="sizeChange"
        @current-change="currentChange"
        :currentPage="query.current"
      >
        <!-- 自定义状态列 -->

        <template #paperType="scope">
          <span>{{ filterPaperType(scope.row.paperType) }}</span>
        </template>
        <template #startTime="scope">
          <span>{{ filterTime(scope.row) }}</span>
        </template>
        <template #duration="scope">
          <span>{{ scope.row.duration }}分钟</span>
        </template>
        <template #allowRetake="scope">
          <span>{{ filterAllowRetake(scope.row.allowRetake) }}</span>
        </template>

        <!-- 操作列按钮 -->
        <template #operation="scope">
          <div>
            <el-button
              size="small"
              link
              type="primary"
              @click="previewChange(scope.row)"
              v-if="compareDate(scope.row.startTime)"
              >开始考试</el-button
            >

            <el-button size="small" link type="info" disabled v-else
              >未开始</el-button
            >
          </div>
        </template>
      </base-table>
    </div>
  </div>
  <div v-if="showExam == 3" class="exam-submit">
    <h1>考试结束</h1>
    <div class="submit-content">
      <div>
        <!-- <div>考试题目：{{ examData }}</div> -->
        <div>考试用时：{{ examData.duration }}</div>
        <div>考试得分：{{ examData.score }}分</div>
        <div>考试成绩：{{ examData.pass }}</div>
        <div>
          <span>考试回顾：</span>
          <el-button size="small" @click="errorsChange">错题查看</el-button>
        </div>
      </div>
      <div>
        <img
          :src="qualifiedImg"
          alt=""
          v-if="examData.pass == '合格'"
        />
        <img :src="unqualifiedImg" alt="" v-else />
      </div>
    </div>
    <div class="close-btn">
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </div>
  </div>
  <examination-page
    ref="dialogRef"
    v-if="showExam == 2"
    :height="tableHeight + 30"
    :tableRowId="rowId"
    @childEvent="outChange"
  ></examination-page>
  <!-- <study
    :height="tableHeight + 80"
    ref="dialogRef"
    @childChange="closeChange"
    :userExamId="userExamId"
    v-if="showExam == 4"
  ></study> -->
  <exam-history
    @childChange="closeChange"
    :examDetails="examData"
    isGetAll="1"
    v-if="showExam == 4"
  />
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted, h, nextTick } from "vue";
import { categoryTreeApi } from "@/api/topic";
import { storeToRefs } from "pinia";
import { ElLoading } from "element-plus";

import { examSelfPageList, userEndExam, userExamAction } from "@/api/examination";
import { menuStore } from "@/stores/menu.js";
const { activeIndex, menuTags } = storeToRefs(menuStore());
import BaseTable from "@/components/BaseTable.vue";
import ExaminationPage from "@/components/examCompontntsPage/ExaminationPage.vue";
import study from "@/views/practice/study.vue";
import ExamHistory from "@/components/examCompontntsPage/ExamHistory.vue";

import router from "@/router"; // 导入路由实例
import qualifiedImg from '@/assets/image/qualified.png';
import unqualifiedImg from '@/assets/image/unqualified.png';
const myDiv = ref(null);
const tableHeight = ref(0);

const dialogRef = ref("");
const examData = ref([]);
const userExamId = ref(""); //考试的id
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 60; // 获取高度并响应式更新
  }
});

// allowRetake: "", //是否补考
//   duration: "", //考试时长
//   maxRetakeTimes: "", //最大补考次数
//   name: "", //考试名称
//   startTime: "", //开始时间
//   endTime: "", //结束时间
//   examRange: "", //考试范围
//   rangeDepts: [], //考试部门范围
//   rangeUsers: [], //考试用户范围
//   rangeDepIds: [],
//   templateId: [],
//   dateRange: "",
const columns = ref([
  { prop: "name", label: "考试名称" },
  { prop: "startTime", label: "开始时间" },
  { prop: "endTime", label: "结束时间" },
  { prop: "duration", label: "考试时长", slot: "duration" },
  // { prop: "leftCount", label: "剩余可考次数" },

  { prop: "totalScore", label: "总分" },
  { prop: "passingScore", label: "合格分" },
]);
const submitData = ref({
  moduleCode: "role",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const rowId = ref("");
const tableData = ref([]);
const treeData = ref([]);
const showExam = ref(1);
const query = ref({
  size: 10,
  current: 1,
  examMode:0
});

const paperTypeData = reactive([
  {
    value: "1",
    label: "固定题目",
  },
  {
    value: "2",
    label: "随机题目",
  },
]);
const allowRange = reactive([
  {
    value: "0",
    label: "否",
  },
  {
    value: "1",
    label: "是",
  },
]);
onMounted(() => {
  getIsExam();
  getDeptTree();
  initData();
});
const getIsExam = () => {
  if (localStorage.getItem("studyExamAction") &&  localStorage.getItem("studyExamParams")) {  //刷新浏览器失败获取保存的状态值
    const params = JSON.parse(localStorage.getItem("studyExamParams"));
    if(!params.userExamId) return
    userEndExam(JSON.parse(params)).then((res) => {
      if (res.code == 200) {
        localStorage.removeItem("studyExamAction");
        localStorage.removeItem("studyExamParams");
        // ElMessage({
        //   message: "提交成功",
        //   type: "warning",
        //   duration: 3 * 1000,
        // });

      }
    });
  }
};
const getDeptTree = () => {
  const id = 0;
  categoryTreeApi(id).then((res) => {
    if (res.code == 200) {
      treeData.value.push(res.data);
    }
  });
};

const initData = () => {
  tableLoading.value = true;

  examSelfPageList(query.value)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;
      }
      tableLoading.value = false;
    })
    .catch((error) => {
      tableLoading.value = false;
    });
};
const filterPaperType = (value) => {
  let val = "";
  if (value) {
    const { label } = paperTypeData.find((item) => item.value == value);
    val = label;
  }
  return val;
};

const filterAllowRetake = (value) => {
  let val = "";
  if (value) {
    const { label } = allowRange.find((item) => item.value == value);
    val = label;
  }
  return val;
};

const filterTime = (row) => {
  const { startTime, endTime } = row;
  return startTime + "至" + endTime;
};
const errorsChange = () => {
  showExam.value = 4;
};

const closeChange = () => {
  showExam.value = 1;
  initData();
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];
  initData();
};
const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10; //关闭重置每页条数
  tableData.value = [];
  initData();
};
const outChange = (flag, data, id) => {
  if (flag) {
    examData.value = data;
    examData.value.userExamId = id;
    showExam.value = 3;
    userExamId.value = id;
    return;
  }
  showExam.value = 1;
  initData();
};
  const previewChange = async (row) => {
    ElMessageBox({
      title: "考前提示",
      message: h("p", null, [
        h("p", null, "您即将开始考试："+ row.name),
        h("p",null, "考试时长："+ row.duration+'分钟'),
        h(
          "p",null,
          "考试中途不允许切换页面或者关闭页面，否则将结束考试!"
        ),
      ]),
      showCancelButton: true,
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      center: true,
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      beforeClose: async (action, instance, done) => {
        if (action === "confirm") {
          // await loadFromStorage();
        const loading = ElLoading.service({
          lock: true,
          text: "加载中...",
          background: "rgba(0, 0, 0, 0.7)",
        });
          await nextTick();
          const obj = {
            id: row.id,
            templateId: row.templateId,
            name: row.name,
            duration: row.duration,
            totalScore: row.totalScore,
            isRetakeExam: 0,
          };
           const params = {
            id: obj.id,
            templateId: obj.templateId,
            isRetakeExam: obj.isRetakeExam,
          };
            //调用开始考试计时，开始考试
            userExamAction(params).then( async (res) => {
              if (res.code == 200) {
                  showExam.value = 2;  //考试页面
                 obj.examId = res.data.userExamId; //考试id
                 console.log(dialogRef.value);
                 await nextTick();
                 dialogRef.value.initChange(obj); //初始化考试页面
              }
            }).catch(error =>{

            });
          loading.close()
          done();
        } else {
          //退出考试，返回到主页面
          done();
        }
      },
    }).then((action) => {
      // ElMessage({
      //   type: "info",
      //   message: `action: ${action}`,
      // });
    });
  };

const compareDate = (date) => {
  let state = false;
  const targetDate = new Date(date);
  // 当前时间
  const currentDate = new Date();
  // 比较两个时间
  if (currentDate > targetDate) state = true;
  return state;
};
const handleClose = () => {
  router.push("/examination/record");
  activeIndex.value = "/examination/record";
};
</script>

<style lang="less" scoped>
.main-container {
  height: 100%;
  padding: 0 5px 0 0 ;

  box-sizing: border-box;
}
.exam-submit {
  height: 100%;
  padding: 0 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  color: #000;
  .submit-content {
    font-size: 20px;
    line-height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    h1 {
      text-align: center;
    }
    .close-btn {
      text-align: center;
      margin-top: 50px;
    }
    img {
      margin-left: 50px;
    }
  }
}
.container-btn {
  width: 100%;
  text-align: right;
  padding: 3px;
  box-sizing: border-box;
  background: #fff;
  margin-bottom: 5px ;

  border-radius: 3px;
}
.el-dialog__header {
  text-align: center;
}
.dialog-tips {
  font-size: 12px;
  padding: 5px;
}
</style>
