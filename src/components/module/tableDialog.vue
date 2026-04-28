<template>
  <div class="main-container1" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      :title="props.logtitle"
      @confirm="handleSubmit"
      :closeOnClickModal="false"
      :closeOnPressEscape="false"
      width="60%"
    >
      <base-table
        ref="multipleTable"
        :columns="props.columns"
        :data="tableData"
        :height="props.tableHeight - 100"
        :total="total"
        :loading="tableLoading"
        :selection="pageState"
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
        <template #paperType="scope">
          <span>{{ filterPaperType(scope.row.paperType) }}</span>
        </template>


        <!-- 操作列按钮 -->
      </base-table>
    </BaseDialog>
  </div>
</template>
<script setup>
import { ref, computed, watch, reactive, onMounted, nextTick } from "vue";
import { allPageList, paperDelete ,getSelfUserExamDetail} from "@/api/examination";

import BaseTable from "@/components/BaseTable.vue";

const dialogTitle = ref("新增角色"); //弹框title
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
const tableData = ref([]);
const dialogVisible = ref(false);
const multipleSelection = ref([]);
const emit = defineEmits(["tableEvent"]);
const multipleTable = ref("");
const pageState = ref(true)
const rowId = ref("")
const props = defineProps({
  tableHeight: {
    type: Number,
    default: () => null,
  },
  title: {
    type: String,
    default: () => "新增子部门",
  },
  paperTypeData: {
    type: Array,
    default: () => [],
  },
  columns:{
    type: Array,
    default: () => [],
  },
  showSelection:{
    type: Boolean,
    default: () => true,
  },
  logtitle:{
    type: String,
    default: () => "选择试卷",
  },
  paperMode:{
    type: String,
    default: () => "0",
  }

});
const query = ref({
  size: 10,
  current: 1,
  paperMode:props.paperMode
});
onMounted(() => {
});
const initData = (page) => {
  if(page){
    getExamDetail()
    pageState.value = false
  } else {
    getExamPage()
  }


};
//获取考试试卷
const getExamPage = () =>{
  allPageList(query.value)
    .then( async (res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;
        if (rowId.value) {
          const rowToSelect = tableData.value.find((row) => row.id == rowId.value);
        multipleSelection.value =rowToSelect
          await nextTick()
          if (rowToSelect && multipleTable.value) {
            multipleTable.value.toggleRowSelection(rowToSelect, true);

          }
        }

        multipleSelection.value
      }
    })
    .catch((error) => {});
}
//获取考试记录
const getExamDetail = () =>{

  query.value.examId = rowId.value
  getSelfUserExamDetail(query.value)
    .then( async (res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;
      }
    })
    .catch((error) => {});
}
const initChange = (id,page="") => {
  rowId.value = id
  dialogVisible.value = true;
  initData(page);

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
const filterPaperType = (value) => {
  let val = "";
  if (value) {
    const { label } = props.paperTypeData.find((item) => item.value == value);
    val = label;
  }
  return val;
};
const handleSubmit = () => {
  emit("tableEvent", multipleSelection.value); //部门ids和人员Array
  dialogVisible.value = false;
};
const handleSelect = (selection, row) => {
  // 如果用户尝试选中多行，强制只保留当前选中的行


  if (selection.length > 1  && multipleTable.value) {

    multipleTable.value.clearSelection();
    multipleTable.value.toggleRowSelection(row, true);
    multipleSelection.value = row
  } else {
    if(selection.length > 0) {
        multipleSelection.value = row

    } else {
      multipleSelection.value  = []
    }

  }
};
const handleSelectionChange = (val) => {
  return false
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
