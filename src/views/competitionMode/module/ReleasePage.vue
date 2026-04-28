<template>
  <div class="layout-box" :style="{ height: height + 100 + 'px' }">
    <div class="layout-center">
      <header>
        <el-button type="primary" @click="submitFile()" v-if="formReadlony">保存并发布</el-button>
        <el-button type="primary" @click="cancelChange()">取消</el-button>
      </header>
      <div :style="{ height: height + 'px' }" class="layout-form">
        <el-form
          :model="ruleForm"
          label-width="160px"
          ref="ruleFormRef"
          :rules="rules"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="考试名称" prop="name">
                <el-input
                  v-model="ruleForm.name"
                  :readonly="formReadlony == 0"
                  placeholder="请输入考试名称"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="false">
            <el-col :span="24">
              <el-form-item label="考试时间" prop="dateRange">
                <el-date-picker
                  v-model="ruleForm.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="请选择开始时间"
                  end-placeholder="请选择结束时间"
                  :default-value="defaultDate"
                  @change="dateChange"
                  :readonly="formReadlony == 0"
                  :default-time="defaultTime"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="考试时长(单位为分钟)" prop="duration">
                <el-input-number
                  v-model="ruleForm.duration"
                  :min="1"
                  :max="120"
                  :readonly="formReadlony == 0"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="false">
            <el-col :span="8">
              <el-form-item label="是否允许补考" prop="allowRetake">
                <el-select
                  v-model="ruleForm.allowRetake"
                  placeholder="请选择是否允许补考"
                  @change="allowRangeChange"
                >
                  <el-option
                    v-for="item in props.allowRange"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <!-- <el-form-item
                label="最大可考数"
                prop="maxRetakeTimes"
                v-if="maxRetakeTimesState"
              >
                <el-input-number
                  v-model="ruleForm.maxRetakeTimes"
                  :min="2"
                  :max="14"
                  :readonly="formReadlony==0"

                />
              </el-form-item> -->

              <el-form-item
                label="补考时间"
                v-if="maxRetakeTimesState"
                prop="retakeDateRange"
              >
                <el-date-picker
                  v-model="ruleForm.retakeDateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="请选择补考开始时间"
                  end-placeholder="请选择补考结束时间"
                  :default-value="defaultDate"
                  @change="retakeDateChange"
                  :teleported="false"
                  :default-time="defaultTime"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="考试范围" prop="examRange">
                <el-select
                  v-model="ruleForm.examRange"
                  placeholder="请选择考试范围"
                  :disabled="formReadlony == 0"
                  @change="examRangeChange"
                >
                  <el-option
                    v-for="item in readData"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="flex-user pl1" v-if="userCheck">
          <el-button
            type="primary"
            size="small"
            @click="checkChange"
            :disabled="formReadlony == 0"
            >选择</el-button
          >
          <div class="user-check">
            <div v-for="item in userData" class="flex gap-2">
              <el-tag type="primary" v-if="ruleForm.examRange == '30'">{{
                item.userName
              }}</el-tag>
              <el-tag type="primary" v-else>{{ item.deptName }}</el-tag>
            </div>
          </div>
        </div>
        <div class="flex-user pl2">
          <el-button
            type="primary"
            size="small"
            @click="checkExam"
            :disabled="formReadlony == 0"
            >选择试卷</el-button
          >
          <div class="user-check">
            <div class="flex gap-2">
              <el-tag type="primary" v-if="ruleForm.templateName">{{
                ruleForm.templateName
              }}</el-tag>
            </div>
          </div>
        </div>
        <el-row>
            <el-col :span="24">
              <el-form-item label="合格分数" prop="passingScore">
                <el-input
                  v-model="ruleForm.passingScore"
                  :readonly="formReadlony == 0"
                  type="number"
                  placeholder="请输入合格分数"
                  min="0"
                />
              </el-form-item>
            </el-col>
          </el-row>
        <!-- <p v-if="formReadlony == 0">注：当前页面仅可修改补考时间</p> -->
        </el-form>

      </div>
    </div>
    <component
      :is="components[currentTab]"
      ref="dialogRef"
      @childEvent="updateData"
      :readRange="ruleForm.examRange"
    />
    <tableDialog
      ref="tableRef"
      :tableHeight="props.height - 100"
      :paperTypeData="props.paperTypeData"
      @tableEvent="tableCallbackChange"
      :columns="columns"
      paperMode="1"
    ></tableDialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, inject, watch } from "vue";
import treeUser from "@/components/module/treeUser.vue";
import treeDept from "@/components/module/treeDept.vue";
import tableDialog from "@/components/module/tableDialog.vue";
import { ElLoading } from "element-plus";

import { getToken } from "@/utils/auth";
import { dateFormatYMDHMS,dateFormatYMD,getCurrentFormattedTime } from "@/utils/dateFormat";
import { saveAndRelease } from "@/api/competitionMode";
import {  examQueryById, examUpdate } from "@/api/examination";


const components = {
  treeUser,
  treeDept,
};

const columns = ref([
  { prop: "name", label: "试卷名称" },
  { prop: "totalScore", label: "总分数" },
  { prop: "paperType", label: "试卷类型", slot: "paperType" },
  { prop: "createTime", label: "创建时间" },
  { prop: "createUserName", label: "创建人" },
]);

const currentTab = ref("treeUser");
const props = defineProps({
  height: { type: Number, default: null },
  securityData: { type: Array, default: [] },
  mode: { type: String, default: "default" }, // 'default' 或 'simple'
  paperTypeData: { type: Array, default: [] }, // 'default' 或 'simple'
  allowRange: { type: Array, default: [] },
  tableRowId: { type: String, default: null },

  formReadlony: {
    type: Number,
    default: () => "",
  },
});

watch(
  () => props.tableRowId,
  async (val) => {
    if (val) {
      await nextTick();
      await getFromData(val);
    }
  },
  { immediate: true },
  { deep: true }
);
const ruleFormRef = ref(null);
const $loading = inject("$loading"); // 注入全局 Loading
const defaultDate = new Date();
const tableRef = ref();
const ruleForm = ref({
  allowRetake: "0", //是否补考
  duration:20, //考试时长
  maxRetakeTimes: 1, //最大补考次数
  name: "竞赛考试-" + getCurrentFormattedTime(), //考试名称
  startTime: dateFormatYMD()+" 00:00:00", //开始时间
  endTime: dateFormatYMD()+" 23:59:59", //结束时间
  examRange: "10", //考试范围
  rangeDepts: [], //考试部门范围
  rangeUsers: [], //考试用户范围
  rangeDepIds: [],
  templateId: "",
  templateName: "",
  dateRange: "",
  retakeEndTime: "", //补考结束时间
  retakeStartTime: "", //补考开始时间
  retakeDateRange: "",
  passingScore: 15,
  examMode:1
});
const templateName = ref("");
const defaultTime = ref([
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 1, 1, 23, 59, 59),
]);

const dialogRef = ref();
const userData = ref([]);
const retakeDateValidator = (rule, val, callback) => {
  const date1 = new Date(val[0]).getTime();
  const date2 = new Date(ruleForm.value.endTime).getTime();
  if (ruleForm.value.endTime) {
    if (!val) {
      callback(new Error("请选择补考时间范围"));
    } else if (!compareDate(date1, date2)) {
      callback(new Error("补考开始时间必须大于考试结束时间"));
    } else {
      callback();
    }
  } else {
    callback(new Error("请先选择补考范围"));
  }
};

const compareDate = (date1, date2) => {

  return date1 > date2;
};
const rules = reactive({
  name: [{ required: true, message: "请输入考试名称", trigger: "blur" }],
  dateRange: [
    { required: true, message: "请选择考试时间范围", trigger: "blur" },
  ],
  examRange: [{ required: true, message: "请选择考试范围", trigger: "blur" }],
  retakeDateRange: [
    { required: true, validator: retakeDateValidator, trigger: "blur" },
  ],
  passingScore: [
    { required: true, message: "请输入合格分数", trigger: "blur" },
  ],

  maxRetakeTimes: [
    { required: true, message: "请输入最大补考次数", trigger: "blur" },
  ],
  allowRetake: [{ required: true, message: "请选择是否补考", trigger: "blur" }],
  duration: [{ required: true, message: "请输入考试时长", trigger: "blur" }],
});
const emit = defineEmits(["releaseEvent"]);
const uploadRef = ref(null); // 获取 el-upload 的实例
const handleContentChange = (val) => {};
const userCheck = ref(false);
const maxRetakeTimesState = ref(false);
const readData = reactive([
  {
    value: "10",
    label: "全部",
  },
  {
    value: "20",
    label: "限定部门",
  },
  // {
  //   value: "30",
  //   label: "限定人员",
  // },
]);
const cancelChange = () => {
  emit("releaseEvent"); //部门ids和人员Array
};

const submitForm = async () => {
  if (userCheck.value) {
    if (
      ruleForm.value.examRange == "20" &&
      ruleForm.value.rangeDepIds.length == 0
    ) {
      ElMessage({
        message: "请选择部门",
        type: "warning",
        duration: 1 * 1000,
      });
      return;
    } else if (
      ruleForm.value.examRange == "30" &&
      ruleForm.value.rangeDepIds.length == 0
    ) {
      ElMessage({
        message: "请选择人员",
        type: "warning",
        duration: 1 * 1000,
      });
      return;
    }
  }
  if (!ruleForm.value.templateName) {
    ElMessage({
      message: "请选择试卷",
      type: "warning",
      duration: 1 * 1000,
    });
    return;
  }


  console.log(ruleForm.value)

  // $loading.open({ text: "加载中..." });

  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      ruleForm.value.id = props.tableRowId;
      const loading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      if (ruleForm.value.id) {
        await examUpdate(ruleForm.value)
          .then((res) => {
            if (res.code == 200) {
              ElMessage({
                message: "操作成功",
                type: "success",
                duration: 3 * 1000,
              });
            }
            loading.close()
            // $loading.close();
            emit("releaseEvent",0); //部门ids和人员Array
          })
          .catch((error) => {
            loading.close()
            // $loading.close();
          });

        return;
      } else {
        delete ruleForm.value.id;
        await saveAndRelease(ruleForm.value)
          .then((res) => {
            if (res.code == 200) {
              ElMessage({
                message: "操作成功",
                type: "success",
                duration: 3 * 1000,
              });
            }
            // $loading.close();
            loading.close()

            emit("releaseEvent"); //部门ids和人员Array
          })
          .catch((error) => {
            loading.close()

            // $loading.close();
          });
        return;
      }
    } else {
    }
  });
};

const dateChange = (event) => {
  ruleForm.value.startTime = dateFormatYMDHMS(event[0]);
  ruleForm.value.endTime = dateFormatYMDHMS(event[1]);
};

const retakeDateChange = (event) => {
  ruleForm.value.retakeStartTime = dateFormatYMDHMS(event[0]);
  ruleForm.value.retakeEndTime = dateFormatYMDHMS(event[1]);
};
const allowRangeChange = (value) => {
  if (value == 1) {
    maxRetakeTimesState.value = true;
  } else {
    maxRetakeTimesState.value = false;
    ruleForm.value.retakeStartTime = "";
    ruleForm.value.retakeEndTime = "";
  }
};
const examRangeChange = (value) => {
  if (value != 10) {
    userCheck.value = true;
  } else {
    userCheck.value = false;
  }
  userData.value = [];
  ruleForm.value.rangeDepts = [];
  ruleForm.value.rangeDepIds = [];
  ruleForm.value.rangeUsers = [];
};
const updateData = (deptIds, userArr) => {
  userData.value = userArr;
  if (ruleForm.value.examRange == 30) {
    ruleForm.value.rangeUsers = userArr;
  } else {
    ruleForm.value.rangeDepts = userArr;
  }
  ruleForm.value.rangeDepIds = deptIds;
  dialogRef.value.initChange(false);
};

const checkExam = () => {
  tableRef.value.initChange(ruleForm.value.templateId);
};

const tableCallbackChange = (data) => {
  ruleForm.value.templateId = data.id;
  ruleForm.value.templateName = data.name;
  templateName.value = data.name;
};
const checkChange = async () => {
  currentTab.value =
    String(ruleForm.value.examRange) == "30" ? "treeUser" : "treeDept";
  await nextTick(); // 等待DOM更新完成
  if (props.tableRowId && currentTab.value == "treeDept") {
    dialogRef.value.initChange(
      true,
      ruleForm.value.rangeDepIds,
      ruleForm.value.rangeDepts
    );
  } else if (props.tableRowId && currentTab.value == "treeUser") {
    dialogRef.value.initChange(
      true,
      ruleForm.value.rangeDepIds,
      ruleForm.value.rangeUsers
    );
  }
  dialogRef.value.initChange(true);
};
const getFromData = (id) => {
  examQueryById(id).then((res) => {
    Object.keys(ruleForm.value).forEach((key) => {
      ruleForm.value[key] = res.data.exam[key];
    });
    const {
      allowRetake,
      startTime,
      endTime,
      templateName,
      retakeStartTime,
      retakeEndTime,
    } = res.data.exam;
    ruleForm.value.allowRetake = String(allowRetake);
    if (ruleForm.value.allowRetake == "1") {
      maxRetakeTimesState.value = true;
    }
    ruleForm.value.dateRange = [startTime, endTime];
    ruleForm.value.retakeDateRange = [retakeStartTime, retakeEndTime];
    const { examRange, rangeDepIds, rangeDepts, rangeUsers } = res.data.range;
    ruleForm.value.examRange = String(examRange);
    ruleForm.value.rangeDepIds = rangeDepIds;
    ruleForm.value.rangeDepts = rangeDepts;

    if (ruleForm.value.examRange == 20) {
      ruleForm.value.rangeDepts = rangeDepts;
      userData.value = rangeDepts;
      userCheck.value = true;

    } else {
      ruleForm.value.rangeUsers = rangeUsers;
      userData.value = rangeUsers;
    }

    //     const ruleForm = ref({
    //   allowRetake: "", //是否补考
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
    // });
  });
};

//提交上传文件
const submitFile = async () => {
  submitForm();
};
</script>

<style scoped lang="less">
.layout-box {
  display: flex;
  justify-content: center;
  background: #ebeef5;
  flex-direction: column;
  align-items: center;
  color: #000;

  .layout-center {
    width: 74%;
  }
}
.layout-form {
  overflow-y: auto;
  padding-right: 50px;
}
header {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.el-form-item__content {
  align-items: center;
  div {
    width: 100%;
  }
}
.flex-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 29px;
  font-size: 14px;
  div {
    color: #606266;
  }
}
.pl1 {
  padding-left: 88px;
}

.pl2 {
  padding-left: 63px;
}
p {
  padding-left: 160px;
  color: #f56c6c;
  font-size: 12px;
}
.flex-user {
  display: flex;
  flex-direction: row;
  font-size: 14px;
  align-items: center;
  padding-bottom: 10px;
  box-sizing: border-box;
  button {
    margin-left: 16px;
  }
  .user-check {
    display: flex;
    border: 1px solid #ddd;
    flex: 1;
    margin-left: 8px;
    min-height: 50px;
    background: #fff;
  }
  .upload-check {
    display: flex;
    border: 1px solid #ddd;
    width: 500px;
    min-height: 50px;
    background: #fff;
    flex-direction: column;
    margin-left: 8px;
    border-radius: 3px;
    cursor: pointer;
  }
  .upload-content {
    display: flex;
    align-items: center;
  }
  .upload-content :hover {
    color: #409eff;
  }
}
.gap-2 {
  gap: 0.5rem;
}
.flex {
  display: flex;
}
.el-tag {
  margin: 2px;
}
::v-deep .el-select-dropdown {
  min-width: 200px !important;
}
::v-deep .el-tree {
  min-width: 200px !important;
}
::v-deep .el-tag {
  max-width: 230px !important;
}
</style>
