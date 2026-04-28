<template>
  <div class="main-container" ref="myDiv">
    <div class="latout-box" :style="{ height: tableHeight + 50 + 'px' }">
      <div class="tree-box">
        <el-tree
          style="max-width: 100%"
          :data="treeData"
          node-key="id"
          default-expand-all
          :props="defaultProps"
          ref="treeRef"
          :highlight-current="true"
          @node-click="handleNodeClick"
        />
      </div>
      <div class="table-box">
        <base-table
          :columns="columns"
          :data="tableData"
          :height="tableHeight"
          show-operation
          :total="total"
          :pagination="false"
          :loading="tableLoading"


        >
          <!-- 自定义状态列 -->
          <template #status="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === "1" ? "启用" : "禁用" }}
            </el-tag>
          </template>

          <!-- 操作列按钮 -->
          <template #operation="scope">
            <div  >
              <el-button
                size="small"
                link
                type="primary"
                @click="addDeptHandler(scope.row)"
                >新增子部门</el-button
              >
              <el-button
                size="small"
                link
                type="primary"
                @click="handleEdit(scope.row)"
                v-if="childId!=='1'"
                >编辑</el-button
              >
              <el-button
                size="small"
                link
                type="danger"
                @click="handleDelete(scope.row)"
                v-if="childId!=='1'"
                >删除</el-button
              >
            </div>
          </template>
        </base-table>
      </div>
    </div>

    <!-- <BaseDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :confirm-loading="loading"
      @confirm="handleSubmit"
      @close="resetForm"
    >
      <el-form
        :model="ruleForm"
        label-width="100px"
        ref="ruleFormRef"
        :rules="rules"
      >
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="ruleForm.deptName" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="ruleForm.phone" type="number" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="ruleForm.sort" type="sort" />
        </el-form-item>
      </el-form>
    </BaseDialog> -->

    <deptDialog  ref="dialogRef"  @childEvent="updateData" :dialogState="dialogVisible" :title="dialogTitle"></deptDialog>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import { submitAuditApi, deptQueryById, getDeptTreeApi } from "@/api/system";
import BaseTable from "@/components/BaseTable.vue";
import BaseDialog from "@/components/BaseDialog.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";
import deptDialog from "./module/deptDialog.vue";

const myDiv = ref(null);
const tableHeight = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false);  //table数据loading
const dialogLoading =  ref(false);//提交数据loading
const handleSearch = () => {};
const handleReset = () => {};
const dialogTitle = ref("")
const dialogRef = ref(null)
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 55; // 获取高度并响应式更新

  }
});
const columns = ref([
  { prop: "deptName", label: "部门名称", width: 180 },
  { prop: "phone", label: "电话" },
]);
const searchItems = ref([
  {
    type: "input",
    prop: "keyword",
    label: "关键词",
  },
]);

const treeRef = ref(); // 获取树组件的引用


const submitData = ref({
  moduleCode: "dept",
  status: 0,
  auditStatus: 0,
  operParam: {},
});
const treeData = reactive([]);

const defaultProps = {
  children: "children",
  label: "deptName",
};
const parentName = ref("根节点"); //父级菜单名称
const total = ref(null);
let tableData = reactive([]);
let childId = ref("1");

onMounted(() => {
  initData();
});

const initData = () => {
  treeData.length = 0;
  tableData.length = 0;
  getDeptTree();
};

const getDeptTree = () => {
  getDeptTreeApi(1).then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
    }
  });
  getDeptData();
};

const getDeptData = () => {
  deptQueryById(childId.value).then((res) => {
    if (res.code == 200) {
      tableData.push(res.data);
    }
  });
};

const addDeptHandler = () => {
  dialogTitle.value = "新增子部门"
  if (!childId.value) {
    ElMessage({
      message: "请先选择部门",
      type: "success",
      duration: 3 * 1000,
    });
    return;
  }
  const childObj ={
    treeId:childId.value,
    parentName:parentName.value
  }
  dialogRef.value.initChange(childObj)
};

const handleNodeClick = (data) => {
  childId.value = data.id;
  parentName.value = data.deptName

  tableData.length = 0;
  getDeptData();
};


//删除数据
const handleDelete = (row) => {
  const { id } = row;
  ElMessageBox.confirm("是否要删除数据?", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // let obj = ref({
      //   id: id,
      // });
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
            dialogVisible.value = false;
            serviceLoading.close()
            initData();
            resetForm();
          }
        })
        .catch((error) => {
          serviceLoading.close()
        });
      // ElMessage({
      //   type: 'success',
      //   message: 'Delete completed',
      // })
    })
    .catch(() => {

    });
};
//编辑表单信息
const handleEdit = (row) => {
  dialogTitle.value = "编辑部门"
  const name = findParentNode(treeData,parentName.value)  //递归查找父节点的名称
  const { id } = row;
  const obj = {
    rowId:id,
    parentName:name.deptName

  }

  dialogRef.value.initChange(obj)
};
const findParentNode = ( tree, name, childrenKey = 'children') =>{
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]

    // 检查子节点中是否包含目标ID
    if (node[childrenKey] && node[childrenKey].length > 0) {
      const found = node[childrenKey].find(child => child.deptName === name)
      if (found) {
        return node // 找到父节点
      }

      // 递归查找子节点
      const parent = findParentNode(node[childrenKey], name, childrenKey)
      if (parent) {
        return parent
      }
    }
  }

  return null // 未找到
}

const updateData = (val) =>{
  initData();
}
</script>

<style lang="less">
@import '@/styles/system.css';


</style>
