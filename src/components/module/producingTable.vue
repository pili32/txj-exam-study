<template>
  <div class="main-container1" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="props.dialogTitle"
      @confirm="handleSubmit"
      :closeOnClickModal="false"
      :closeOnPressEscape="false"
      width="80%"
    >
      <div class="target">
        <div class="target-box">
          <div>
            <p>目标题型</p>
            <p>单选题：{{ questionType.singleChoiceCount }}</p>
            <p>多选题：{{ questionType.trueFalseCount }}</p>
            <p>判断题：{{ questionType.multipleChoiceCount }}</p>
            <p>填空题：{{ questionType.fillBlankCount }}</p>
          </div>
          <div>
            <p>已选择题型</p>
            <p>单选题：{{ typeAllLng.typeOneLng }}</p>
            <p>多选题：{{ typeAllLng.typeTwoLng }}</p>
            <p>判断题：{{ typeAllLng.typeThreeLng }}</p>
            <p>填空题：{{ typeAllLng.typeFourLng }}</p>
          </div>
        </div>
        <base-table
          ref="multipleTable"
          :columns="columns"
          :data="tableData"
          :height="props.tableHeight - 100"
          :total="total"
          :loading="tableLoading"
          :selection="true"
          @select="handleSelect"
          @selection-change="handleSelectionChange"
          rowKey="id"
          :reserveSelection="true"
          :header-selectable="false"
          @size-change="sizeChange"
          @current-change="currentChange"
          :currentPage="query.current"
        >
          <!-- 自定义状态列 -->
          <template #type="scope">
            <p>{{ filterType(scope.row.type) }}</p>
          </template>
          <!-- 操作列按钮 -->
        </base-table>
      </div>
    </BaseDialog>
  </div>
</template>
<script setup>
import { ref, computed, watch, reactive, onMounted, nextTick } from "vue";
import { pageListApi } from "@/api/practice";

import BaseTable from "@/components/BaseTable.vue";
const columns = ref([
  { prop: "title", label: "题干", width: "300" },
  { prop: "categoryName", label: "分类名称" },
  { prop: "type", label: "题型", slot: "type" },
  { prop: "createUserName", label: "创建人" },
]);
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
const tableData = ref([]);
const dialogVisible = ref(false);
const multipleSelection = ref([]);
const emit = defineEmits(["tableEvent"]);
const multipleTable = ref("");

const typeAllLng = ref({
  typeOneLng: null,
  typeTwoLng: null,
  typeThreeLng: null,
  typeFourLng: null,
});
const questionType = ref({});
const props = defineProps({
  tableHeight: {
    type: String,
    default: () => "500",
  },
  title: {
    type: String,
    default: () => "新增子部门",
  },
  topicType: {
    type: Array,
    default: () => [],
  },
  categoryIds: {
    type: Array,
    default: () => [],
  },
  dialogTitle:{
    type: String,
    default: () => '选择试卷',
  }
});
const query = ref({
  size: "10",
  current: "1",
});
onMounted(() => {
  //   getDeptTree();
});
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
const initChange = (obj) => {
  questionType.value = obj;
  dialogVisible.value = true;
  initData();
};
const filterType = (value) => {
  let val = "";
  if (value) {
    const { label } = props.topicType.find((item) => item.value == value);
    val = label;
  }
  return val;
};
const handleSubmit = () => {
  emit("tableEvent", multipleSelection.value, typeAllLng.value); //部门ids和人员Array
  dialogVisible.value = false;
};
const handleSelect = (selection, row) => {
  multipleSelection.value = row;
};
const handleSelectionChange = (val) => {
  multipleSelection.value = val;

  filterSelection(multipleSelection.value);
};
const filterSelection = (data) => {
  typeAllLng.value.typeOneLng = data.filter((item) => item.type == 1).length;
  typeAllLng.value.typeTwoLng = data.filter((item) => item.type == 2).length;
  typeAllLng.value.typeThreeLng = data.filter((item) => item.type == 3).length;
  typeAllLng.value.typeFourLng = data.filter((item) => item.type == 4).length;
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
defineExpose({
  initChange,
});
</script>

<style scoped>
.container {
  display: flex;
  height: 60vh;
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
}

.left-panel {
  width: 25%;
  min-width: 200px;
}

.middle-panel {
  flex: 1;
  min-width: 300px;
}

.right-panel {
  width: 25%;
  min-width: 200px;
}

.card-header {
  font-weight: bold;
}

.user-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.target {
  display: flex;
}
.target-box {
  width: 200px;
}

.user-item:last-child {
  border-bottom: none;
}

.confirmed-user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.confirmed-user-item:last-child {
  border-bottom: none;
}

.empty-tip {
  color: #999;
  text-align: center;
  padding: 20px 0;
}

.el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.el-card__body {
  flex: 1;
  overflow: auto;
}
</style>
