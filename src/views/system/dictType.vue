<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn">
      <el-button @click="addUserHandler" type="primary" size="small"
        >新增</el-button
      >
    </div>
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
      :operationWidth="200"


    >
      <!-- 自定义状态列 -->
      <template #status="scope">
        <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
          {{ scope.row.status === "1" ? "启用" : "禁用" }}
        </el-tag>
      </template>

      <!-- 操作列按钮 -->
      <template #operation="scope">
        <div>
          <el-button type="success" link @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button type="primary" link @click="toKey(scope.row)"
            >配置字典</el-button
          >
          <el-button
            size="small"
            link
            type="danger"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >

        </div>
      </template>
    </base-table>
    <dict-type
      ref="dialogRef"
      :dialogState="dialogVisible"
      :title="dialogTitle"
    ></dict-type>
    <dict-key
      ref="keyRef"
      :dialogState="dialogVisible"
      title="字典管理"
      :height="tableHeight"
    ></dict-key>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import { submitAuditApi, getMenusByRole, getSysDictType } from "@/api/system";
import BaseTable from "@/components/BaseTable.vue";
import DictType from "./module/dictTypeDialog.vue";
import DictKey from "./module/dictKeyDialog.vue";

const myDiv = ref(null);
const tableHeight = ref(0);
const dialogVisible = ref(false);
const formDialogVisible = ref(false);
const dialogRef = ref("");
const keyRef = ref("");
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 100; // 获取高度并响应式更新
  }
});
const columns = ref([
  { prop: "typeCode", label: "类别编码" },
  { prop: "typeName", label: "类别名称", width: 180 },
  { prop: "remark", label: "备注" },
]);

const submitData = ref({
  moduleCode: "dictType",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const parentName = ref(""); //父级菜单名称
const dialogTitle = ref(""); //弹框title
const total = ref(null); //总数
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
let checkedKeysArr = reactive([]); //获取到的选择的tree数据
const ruleForm = reactive({
  name: "",
  description: "",
});

const ruleFormId = ref("");
const tableData = ref([]);
const query = ref({
  size: "10",
  current: "1",
});

const treeData = ref([]);
onMounted(() => {
  initData();
});
const initData = () => {
  tableLoading.value = true;

  getSysDictType(query.value)
    .then((res) => {
      if (res.code == 200) {
        tableData.value = res.data.records;
        total.value = res.data.total;
        tableLoading.value = false;
      }
    })
    .catch((error) => {});
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
//删除数据
const handleDelete = (row) => {
  const { id } = row;
  ElMessageBox.confirm("是否要删除数据?", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const serviceLoading = ElLoading.service({
          lock: true,
          text: "加载中...",
          background: "rgba(0, 0, 0, 0.7)",
        });
      submitData.value.operParam = JSON.stringify(row);

      submitAuditApi("delete", submitData.value)
        .then((res) => {
          if (res.code == 200) {
            ElMessage({
              message: "操作成功,等待审核",
              type: "success",
              duration: 3 * 1000,
            });
            initData();
            resetForm();
          serviceLoading.close()
          }
        })
        .catch((error) => {
          serviceLoading.close()
        });

    })
    .catch(() => {});
};
//编辑表单信息
const handleEdit = (row) => {
  dialogTitle.value = "编辑字典类型";
  const obj = {
    rowId: row.id,
  };
  dialogRef.value.initChange(obj);
};

const addUserHandler = () => {
  dialogTitle.value = "新增字典类型";
  dialogRef.value.initChange({});
};

const toKey = (row) => {
  const obj = {
    typeId: row.id,
    typeName: row.typeName,
  };
  dialogTitle.value = "新增字典值";
  keyRef.value.initChange(obj);
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
</script>

<style lang="less" scoped>
.main-container {
  height: 100%;
  padding: 0 5px;
  box-sizing: border-box;
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
