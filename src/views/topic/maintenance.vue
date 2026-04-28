<template>
  <div class="main-container" ref="myDiv">
    <!-- <div class="container-btn">
      <HeaderSearch
        :showButton="false"
        :default-params="defaultParams"
        :hasHiddenItems="false"
        @search="handleSearch"
        @reset="handleReset"
      > -->
    <!-- <template v-slot:click>
          <el-button type="primary" size="small" @click="addDeptHandler"
            >新增</el-button
          >
        </template> -->
    <!-- </HeaderSearch>

    </div> -->
    <div class="latout-box" :style="{ height: layoutHeight + 25 + 'px' }">
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
            <div>
              <el-button
                size="small"
                link
                type="primary"
                @click="handleAdd(scope.row)"
                v-if="mark"
                >新增子分类</el-button
              >
              <el-button
                size="small"
                link
                type="primary"
                @click="handleEdit(scope.row)"
                v-if="childId!=='0'"
                >编辑</el-button
              >
              <el-button
                v-if="childId !== '0'"
                size="small"
                link
                type="danger"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </div>
          </template>
        </base-table>
      </div>
    </div>
    <maintenanceDialog
      ref="dialogRef"
      @childEvent="updateData"
      :dialogState="dialogVisible"
      :defaultProps="defaultProps"
      :propsTree="treeData"
    ></maintenanceDialog>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import { categoryTreeApi, queryByIdApi, deleteApi } from "@/api/topic";
import BaseTable from "@/components/BaseTable.vue";
import maintenanceDialog from "./module/maintenanceDialog.vue";
const myDiv = ref(null);
const tableHeight = ref(0);
const layoutHeight = ref(0);
const dialogVisible = ref(false);
const tableLoading = ref(false); //table数据loading
const dialogLoading = ref(false); //提交数据loading
const dialogRef = ref(null);
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 20; //
    layoutHeight.value = myDiv.value.clientHeight - 30; //
  }
});
const columns = ref([
  { prop: "name", label: "名称", width: 180 },
  { prop: "description", label: "描述" },
  { prop: "sort", label: "排序" },

]);
const searchItems = ref([
  {
    type: "input",
    prop: "keyword",
    label: "关键词",
  },
]);

const mark = ref(true);
const defaultParams = ref({
  status: "1",
});
const treeRef = ref(); // 获取树组件的引用
let treeData = reactive([]);

const defaultProps = {
  children: "children",
  label: "name",
};
const loading = ref(false);
const parentName = ref("根节点"); //父级菜单名称
const total = ref(null);
let tableData = reactive([]);
let childId = ref("0");
onMounted(() => {
  initData();
});

const initData = () => {
  treeData.length = 0;
  tableData.length = 0;
  let treeName = parentName.value;
  parentName.value = treeName;
  getDeptTree();
};

const getDeptTree = () => {
  tableLoading.value = true;
  const id = 0;
  categoryTreeApi(id).then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
    }
  });
  getDeptData();
};

const getDeptData = () => {
  queryByIdApi(childId.value).then((res) => {
    if (res.code == 200) {
      tableData.push(res.data);
    } else {
    }
    tableLoading.value = false;
  });
};
const handleNodeClick = (data) => {
  console.log(data);
  if(data.children && data.children.length>0){
    //添加标记
    mark.value = true;
  } else {
    mark.value = false;

  }
  console.log(mark.value);
  childId.value = data.id;
  parentName.value = data.name;
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
      const loading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      deleteApi(id)
        .then((res) => {
          if (res.code == 200) {
            ElMessage({
              message: "操作成功",
              type: "success",
              duration: 3 * 1000,
            });
            loading.close();

            childId.value = "0";
            initData();
          }
        })
        .catch((error) => {
          loading.close();
        });
    })
    .catch(() => {});
};
//新增表单信息
const handleAdd = (row) => {
  const { id } = row;
  const obj = {
    treeId: id,
    parentName: parentName.value,
  };
  dialogRef.value.initChange(obj);
};
const handleEdit = (row) => {
  const result = findParentNode(treeData, parentName.value); //递归查找父节点的名称
  const { id,name } = result;
  const obj = {
    treeId: id,
    parentName:name,
    rowId:row.id

  };
  dialogRef.value.initChange(obj);
};

const findParentNode = (tree, name, childrenKey = "children") => {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];

    // 检查子节点中是否包含目标ID
    if (node[childrenKey] && node[childrenKey].length > 0) {
      const found = node[childrenKey].find((child) => child.name === name);
      if (found) {
        return node; // 找到父节点
      }
      // 递归查找子节点
      const parent = findParentNode(node[childrenKey], name, childrenKey);
      if (parent) {
        return parent;
      }
    }
  }

  return null; // 未找到
};
const updateData = (val) => {
  initData();
  treeData = []
};
</script>

<style lang="less" scoped>
@import "@/styles/system.css";
.advanced-search-container {
  padding: 5px;
}
.tree-box {
  overflow-y: auto;
}
</style>
