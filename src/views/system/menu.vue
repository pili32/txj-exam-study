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
            <div >
              <el-button
                size="small"
                link
                type="primary"
                @click="handleAdd(scope.row)"
                >新增子菜单</el-button
              >
              <el-button
                size="small"
                link
                type="primary"
                @click="handleEdit(scope.row)"
                v-if="childId !== '0'"
                >编辑</el-button
              >
              <el-button
                size="small"
                link
                type="danger"
                @click="handleDelete(scope.row)"
                v-if="childId !== '0'"
                >删除</el-button
              >
              <!-- <el-button
                size="small"
                link
                type="danger"
                @click="handleDelete(scope.row)"
                >详情</el-button
              > -->
            </div>
          </template>
        </base-table>
      </div>
    </div>
    <menuDialog
      ref="dialogRef"
      @childEvent="updateData"
      :dialogState="dialogVisible"
      :title="dialogTitle"

    ></menuDialog>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import {
  submitAuditApi,
  pageListWithConditionApi,
  getMenuQueryById,
  getSysMenuTree,
} from "@/api/system";
import BaseTable from "@/components/BaseTable.vue";
import BaseDialog from "@/components/BaseDialog.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";
import menuDialog from "./module/menuDialog.vue";
const dialogRef = ref(null);
const myDiv = ref(null);
const tableHeight = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false); //table数据loading
const handleSearch = () => {};
const handleReset = () => {};
const dialogTitle  = ref('')
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 55; // 获取高度并响应式更新
  }
});
const columns = ref([
  { prop: "name", label: "菜单名称", width: 180 },
  { prop: "path", label: "路径", width: 180 },
  { prop: "url", label: "地址" },
  { prop: "icon", label: "图标" },
  { prop: "description", label: "说明" },
]);
const searchItems = ref([
  {
    type: "input",
    prop: "keyword",
    label: "关键词",
  },
]);
const defaultParams = ref({
  status: "1",
});
const submitData = ref({
  moduleCode: "menu",
  auditStatus: 0,
  operParam: {},
});

let childId = ref("0");
const parentName = ref(""); //父级菜单名称
const total = ref(null);
let tableData = reactive([]);
const defaultProps = {
  children: "children",
  label: "name",
};
const query = ref({
  size: "10",
  current: "1",
});
onMounted(() => {
  initData();
});
const treeData = reactive([]);

const initData = () => {
  treeData.length = 0;
  tableData.length = 0;
  getDeptTree();
};

const getDeptTree = () => {
  getSysMenuTree().then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
    }
  });
  getMenuData();
};
const getMenuData = () => {
  tableLoading.value = true
  getMenuQueryById(childId.value).then((res) => {
    if (res.code == 200) {
      tableData.push(res.data);
      tableLoading.value = false
    }
  });
};
const updateData = (val) => {
  initData();
};
//
const handleNodeClick = (data) => {
  childId.value = data.id;
  tableData.length = 0;
  parentName.value = data.name

  getMenuData();
};

const handleAdd = (row) => {
  dialogTitle.value = "新增子菜单"
  const obj = {
    treeId: childId.value,
    parentName: row.name,
  };
  dialogRef.value.initChange(obj);
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
  dialogTitle.value = "编辑菜单"
  const {parentId,id} = row
  const result = filterTreeChange(treeData,parentId)
  const name = result.node.name
  const obj = {
    rowId: id,
    parentName:  name,
  };
  dialogRef.value.initChange(obj);
};
 const filterTreeChange = (tree,targetId,parentName="") =>{
    for (const node of tree) {
      if (node.id === targetId) {
        return { node, parentName };
      }
      if (node.children?.length) {
        const result = filterTreeChange(node.children, targetId, node.name);
        if (result) return result;
      }
    }
    return null;
 }
//新增
const addDeptHandler = () => {
  const childObj = {
    treeId: childId.value,
    parentName: parentName.value,
  };
  dialogRef.value.initChange(childObj, parentName);
};
</script>

<style lang="less" scoped>
@import "@/styles/system.css";
.tree-box{
  overflow: auto;
}
</style>
