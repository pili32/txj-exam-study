<template>
  <div class="main-container" ref="myDiv" >
    <div v-if="showExam == 5">
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
        <template #examStatus="scope">
          <div v-if="scope.row.examStatus == 1" style="color: #67c23a">
            <p>可补考</p>
            <p>
              {{ scope.row.retakeStartTime }} 至 {{ scope.row.retakeEndTime }}
            </p>
          </div>
          <span v-else-if="scope.row.examStatus == 2" style="color: #e6a23c">
            <p>待补考</p>
            <p>
              {{ scope.row.retakeStartTime }} 至 {{ scope.row.retakeEndTime }}
            </p>
          </span>
          <span v-else style="color: #909399">已结束</span>
        </template>

        <!-- 操作列按钮 -->
        <template #operation="scope">
          <div>
            <el-button
              size="small"
              link
              type="primary"
              @click="releaseChange(scope.row)"
              >查看</el-button
            >
            <el-button
              size="small"
              type="success"
              @click="previewChange(scope.row)"
              v-if="scope.row.examStatus == 1"
              >进入补考</el-button
            >
          </div>
        </template>
      </base-table>
    </div>
    <div v-if="showExam == 1" :style="{ height: layoutHeight + 'px' }">
    <header>
      <el-date-picker
        v-model="dateYear"
        type="year"
        placeholder="请选择年份"
      />
    </header>
    <!-- <el-countdown title="Start to grab" :value="value"  @change="countdownChange"/> -->
    <div class="main-layout" v-if="initDataList.length > 0">
      <div
        class="main-layout-item"
        v-for="(child, index) in initDataList"
        :key="index"
      >
        <p class="mount">{{ child.month }}</p>
        <div
          class="main-layout-item-layout"
          v-for="(item, index) in child.arr"
          :key="item.id"
        >
          <div v-if="item.examStatus == 4" class="item-examStatus">
            <span class="textColor">缺考</span>
          </div>
          <div
            class="item-examStatus"
            :class="[item.examResult == '合格' ? 'qualified' : 'unqualified']"
            v-if="item.examStatus == 3"
          >
            <span>{{ item.score }}</span>
            <p>{{ item.examResult }}</p>
          </div>
          <div class="item-content">
            <span>{{ item.name }}</span>
            <div class="textColor">
              <span>{{ item.startTime }} —— {{ item.endTime }}</span>
              <span style="margin-left: 50px;">{{ item.duration }}分钟</span>
            </div>
          </div>
          <div class="item-operation">
            <el-button
              size="small"
              type="primary"
              @click="releaseChange(item)"
              v-if="item.examStatus == 3"
              >查看</el-button
            >
            <el-button
              size="small"
              v-if="false"
              type="success"
              @click="previewChange(scope.row)"
              >进入补考</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <el-empty description="暂无数据" v-else />
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
        <img :src="qualifiedImg" alt="" v-if="examData.pass == '合格'" />
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
    :height="tableHeight + 50"
    :tableRowId="rowId"
    @childEvent="outChange"
  ></examination-page>
  <exam-history
    @childChange="closeChange"
    :examDetails="examRow"
    v-if="showExam == 4"
    isGetAll="2"
  />
  </div>
  <tableDialog
    ref="tableRef"
    :tableHeight="tableHeight - 100"
    :columns="logColumns"
    logtitle="查看记录"
  ></tableDialog>

<!--
  <study
    :height="tableHeight + 80"
    ref="dialogRef"
    @childChange="closeChange"
    :userExamId="userExamId"
    v-if="showExam == 4"
  ></study> -->


</template>
<script setup>
import { ref, reactive, watchEffect, onMounted, h, nextTick, watch } from "vue";
import { submitAuditApi, getMenusByRole } from "@/api/system";
import { categoryTreeApi } from "@/api/topic";
import { selfUserExamHistory, userEndExam } from "@/api/examination";
import tableDialog from "@/components/module/tableDialog.vue";
import ExamHistory from "@/components/examCompontntsPage/ExamHistory.vue";
import { getToken } from "@/utils/auth";
import BaseTable from "@/components/BaseTable.vue";
import ReleasePage from "./module/ReleasePage.vue";
import study from "@/views/practice/study.vue";

import qualifiedImg from "@/assets/image/qualified.png";
import unqualifiedImg from "@/assets/image/unqualified.png";


const myDiv = ref(null);
const tableHeight = ref(0);
const layoutHeight = ref(0);
const dialogVisible = ref(false);
const formDialogVisible = ref(false);
const dialogRef = ref("");
const previewState = ref(true);
const tableRef = ref();
const userExamId = ref(""); //考试的id
const showExam = ref(1);
const examRow= ref({})
const dateYear = ref(new Date());
const queryYear = ref(new Date().getFullYear());
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 60; // 获取高度并响应式更新
    layoutHeight.value = myDiv.value.clientHeight;
  }
});

watch(
  () => dateYear,
  (val) => {
    queryYear.value = new Date(dateYear.value).getFullYear();
    initData();
  },
  { deep: true }
);

const columns = ref([
  { prop: "name", label: "考试名称" },
  { prop: "examStatus", label: "考试状态", slot: "examStatus", width: "500" },
  { prop: "examResult", label: "考试结果" },
  { prop: "score", label: "成绩" },

  // { prop: "participateCount", label: "参考次数" },
  // { prop: "score", label: "最佳成绩" },
]);

const logColumns = ref([
  { prop: "startTime", label: "答题开始时间" },
  { prop: "endTime", label: "答题结束时间" },
  { prop: "duration", label: "答题时长" },
  { prop: "score", label: "分数" },
]);
const submitData = ref({
  moduleCode: "role",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const loading = ref(false);
const parentName = ref(""); //父级菜单名称
const ruleFormRef = ref(null); //form表单ref
const dialogTitle = ref("新增角色"); //弹框title
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
let checkedKeysArr = reactive([]); //获取到的选择的tree数据
const rowId = ref("");
const value = ref(Date.now() + 61 * 60 * 1000);
const ruleForm = reactive({
  name: "",
  description: "",
});
const ruleFormId = ref("");
const tableData = ref([]);
const initDataList = ref([]);
const treeRef = ref(); // 获取树组件的引用
const treeData = ref([]);
const query = ref({
  size: 10,
  current: 1,
});
const typeDialog = ref("user");
const examData = ref([]);
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

    //刷新浏览器失败获取保存的状态值
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
const clickChange = async (checkedNodes, checkedKeys) => {
  let parentId = checkedNodes.parentId ? checkedNodes.parentId : ""; //获取当前的父节点id
  if (parentId) {
    //如果父节点id存在，则设置即使只选择一个子节点父节点也是高亮
    if (parentId) {
      await treeRef.value.setChecked(parentId, true); //设置父节点高亮
    }
  }
  const keys = await treeRef.value.getCheckedKeys(); //获取到当前所有选中的节点
  checkedKeysArr = keys;
};
const initData = () => {
  tableLoading.value = true;
  const params = {
    queryYear: queryYear.value,
  };
  selfUserExamHistory(params)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data;
        groupedByMonthOnly(res.data);
        total.value = res.data.total;
      }
      tableLoading.value = false;
    })
    .catch((error) => {
      tableLoading.value = false;
    });
};
const groupedByMonthOnly = (data) => {
  const result = [];
  data
    .filter((item) => item.startTime)
    .forEach((item) => {
      const date = new Date(item.startTime);
      const month = date.getMonth() + 1;
      const monthKey = month.toString().padStart(2) + "月"; // 格式： "09"
      const group = result.find((g) => g.month === monthKey);
      item.examResult =
        Number(item.score) >= Number(item.passingScore) ? "合格" : "不合格";
      if (group) {
        group.arr.push(item);
      } else {
        result.push({ month: monthKey, arr: [item] });
      }
      // let obj = {
      //   month:month,
      //   date:item,
      // }
      // result.push(obj)
    });

  initDataList.value = result.sort(
    (a, b) => parseInt(b.month) - parseInt(a.month)
  );
  return result;
};
// // 如果只需要月份（不按年份区分）
// const groupedByMonthOnly = computed(() => {
//   const result = {};

//   dateStrings.value
//     .filter(dateStr => dateStr && dateStr.trim() !== '')
//     .forEach(dateStr => {
//       const date = new Date(dateStr);
//       const month = date.getMonth() + 1;

//       if (!result[month]) {
//         result[month] = [];
//       }
//       result[month].push(dateStr);
//     });

//   return result;
// });

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
        showExam.value = 2;
        await nextTick();
        const obj = {
          id: row.id,
          templateId: row.templateId,
          name: row.name,
          duration: row.duration,
          totalScore: row.totalScore,
          isRetakeExam: 1,
        };
        await dialogRef.value.initChange(obj);
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

//编辑表单信息
const getMenuId = (id) => {
  dialogTitle.value = "编辑菜单";
  getMenusByRole(id).then((res) => {
    if (res.code == 200) {
      dialogVisible.value = true;
      if (res.data.menuIds && res.data.menuIds.length > 0) {
        checkedKeysArr = res.data.menuIds;
        res.data.menuIds.forEach(async (item) => {
          await treeRef.value.setChecked(item, true); //设置父节点高亮
        });
      }
    }
  });
};
const releaseChange = (row) => {
  // tableRef.value.initChange(row.id, "record");
  examRow.value = row
  showExam.value = 4;

};
const errorsChange = () => {
  showExam.value = 4;
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];
  initData();
};
const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  tableData.value = [];
  initData();
};
const closeChange = () => {
  showExam.value = 1;
  initData();
};
//重置表单数据
const resetForm = () => {
  dialogVisible.value = false;
  formDialogVisible.value = false;
  dialogLoading.value = false;
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
  treeData.value = [];
  parentName.value = "";
  ruleFormId.value = "";
};
const outChange = (flag, data, id) => {
  if (flag) {
    examData.value = data;
    showExam.value = 3;
    userExamId.value = id;
    return;
  }
  showExam.value = 1;
  initData();
};
</script>

<style lang="less" scoped>
header {
  display: flex;
  padding-left: 20px;
}
.main-layout {
  display: flex;
  height: calc(100% - 40px);
  width: 100%;
  overflow-y: auto;
  flex-direction: column;
  .main-layout-item {
    width: 100%;
    padding: 20px 0;
    box-sizing: border-box;

    .mount {
      padding-bottom: 10px;
      font-size: 24px;
      padding-left: 5px;
    }
  }
}
.qualified {
  color: #67c23a;
}
.unqualified {
  color: #f56c6c;
}

.main-layout-item-layout {
  display: flex;
  flex-direction: row;
  background: #fff;
  padding: 10px;
  box-sizing: border-box;
  align-items: center;
  margin: 5px;
  .item-examStatus {
    box-sizing: border-box;
    width: 140px;
    text-align: center;
    span {
      font-size: 15px;
    }
    p {
      font-size: 12px;
    }
  }
  .textColor {
    color: #909399;

  }
  .item-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    span {
      font-size: 16px;
      color: #000;
      padding-bottom: 5px;
      box-sizing: border-box;
    }
    div span {
      font-size: 12px;

    }

  }
}
.main-container {
  height: 100%;
  padding: 0 5px 0 0 ;

  background: #f0f2f5;
  box-sizing: border-box;
}
.container-btn {
  width: 100%;
  text-align: right;
  padding: 3px;
  box-sizing: border-box;
  background: #fff;
  margin-bottom: 5px;
  border-radius: 3px;
}
.el-dialog__header {
  text-align: center;
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
.dialog-tips {
  font-size: 12px;
  padding: 5px;
  box-sizing: border-box;
}
.scope-color {
  color: #409eff !important;
}
p {
  margin: 0;
}
</style>
