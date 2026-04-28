<template>
  <div class="points" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="props.dialogTitle"
      width="30%"
      :showClose="false"
    >
      <div>
        <div class="layout-box">
          <p>累计积分</p>
          <p class="nums">{{ pointsData.totalPoints }}</p>
        </div>
        <div class="layout-content">
          <div class="card-header borders">
            <span>积分规则</span>
            <span>今日已累积 <span style="color: #409EFF;font-size: 16px;"> {{todaysPoints}}积分</span></span>
          </div>
          <div class="borders">
            <div class="card-content">
              <div class="card-left">
                <span>登录</span>
                <span>1分/每日首次登录</span>
                <span>每日上限1分</span>
              </div>
              <div class="card-right">
                <el-button type="default" size="small" v-if=" pointsData.loginPoints == 1">已完成</el-button>
              </div>
            </div>
            <div class="card-content">
              <div class="card-left" style="width: 50%">
                <el-progress
                  :percentage="loginPercentage"
                  :status="loginStatus"
                />
              </div>
              <div class="card-right">{{ pointsData.loginPoints }}分/1分</div>
            </div>
          </div>
          <div class="borders">
            <div class="card-content">
              <div class="card-left">
                <span>资料学习</span>
                <span>
                  1分/有效学习文件或视频
                </span>
                <span>每日上限12分</span>
              </div>
              <div class="card-right">
                <el-button type="default" size="small" v-if=" pointsData.readingPoints == 12">已完成</el-button>
              </div>
            </div>
            <div class="card-content">
              <div style="width: 50%" class="card-left">
                <el-progress
                  :percentage="readingPercentage"
                  :status="readingStatus"
                />
              </div>
              <div class="card-right">
                {{ pointsData.readingPoints }}分/12分
              </div>
            </div>
          </div>
          <div>
            <div class="card-content">
              <div class="card-left">
                <span>试题练习</span>
                <span>
                  1分/试题练习作答正确
                </span>
                <span>每日上限20分</span>

              </div>
              <div class="card-right">
                <el-button type="default" size="small" v-if=" pointsData.practicePoints == 20">已完成</el-button>
              </div>
            </div>
            <div class="card-content">
              <div style="width: 50%" class="card-left">
                <el-progress
                  :percentage="practicePercentage"
                  :status="practiceStatus"
                />
              </div>
              <div class="card-right">
                {{ pointsData.practicePoints }}分/20分
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <slot name="footer">
          <div class="footer-btn">
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false" type="default">
                关闭
              </el-button>
            </span>
          </div>
        </slot>
      </template>
    </BaseDialog>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, reactive } from "vue";
import { getUserPoint } from "@/api/points";

const columns = ref([
  { prop: "title", label: "题干", width: "300" },
  { prop: "categoryName", label: "分类名称" },
  { prop: "type", label: "题型", slot: "type" },
  { prop: "createUserName", label: "创建人" },
]);

const dialogVisible = ref(false);
const multipleSelection = ref([]);
const emit = defineEmits(["tableEvent"]);
const multipleTable = ref("");
const questionType = ref({});

let pointsData = reactive({});

const loginPercentage = ref(0);
const loginStatus = ref("exception");
const readingStatus = ref("exception");
const readingPercentage = ref(100);
const practicePercentage = ref(100);
const practiceStatus = ref("exception");
const todaysPoints = ref(0)

const props = defineProps({
  dialogTitle: {
    type: String,
    default: () => "积分中心",
  },
});
const query = ref({
  size: "10",
  current: "1",
});
onMounted(() => {});
const initData = () => {
  const params = {
    categoryIds: questionType.value.categoryIds,
  };
  Object.assign(params, query.value);
  pageListApi(params)
    .then(async (res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;

        if (id) {
          const rowToSelect = tableData.value.find((row) => row.id == id);
          multipleSelection.value = rowToSelect;
          await nextTick();
          if (rowToSelect && multipleTable.value) {
            multipleTable.value.toggleRowSelection(rowToSelect, true);
          }
        }

        multipleSelection.value;
      }
    })
    .catch((error) => {});
};
const initChange = () => {
  dialogVisible.value = true;
  getUserPoint().then((res) => {
    pointsData = res.data;
    const {loginPoints,readingPoints,practicePoints} = res.data
    //计算login进度条
    loginPercentage.value = parseInt((loginPoints / 1) * 100);
    loginStatus.value = loginPercentage.value == 100 ? "success" : "exception";
    //计算reading进度条
    readingPercentage.value = parseInt((readingPoints / 10) * 100);
    readingStatus.value =readingPercentage.value == 100 ? "success" : "exception";
    //计算practice进度条
    practicePercentage.value = parseInt((practicePoints / 20) * 100);
    practiceStatus.value =practicePercentage.value == 100 ? "success" : "exception";
    todaysPoints.value = loginPoints+readingPoints+practicePoints

  });

  // const points1  =ref("1")
  // const loginPercentage = ref("40")
  // const loginStatus = ref("success")
  // const readingPercentage = ref("100")
  // const practicePercentage= ref("100")
};
defineExpose({
  initChange,
});
</script>

<style scoped lang="less">
.demo-progress .el-progress--line {
  margin-bottom: 15px;
  max-width: 200px;
}
.layout-box {
  display: flex;
  // flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 30px;
  p {
    line-height: 0;
  }
  .nums {
    font-size: 28px;
  }
}
.layout-content {
  border-radius: 5px;
  border: 1px solid #ddd;
  padding: 5px;
  .card-content {
    display: flex;
    justify-content: space-around;
  }
  .card-left {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-right: 10px;
    box-sizing: border-box;
  }
  .card-right {
    display: flex;
    align-items: center;
    width: 30%;
    justify-content: center;
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 5px;
}
.borders {
  border-bottom: 1px solid #ddd;
}
</style>
