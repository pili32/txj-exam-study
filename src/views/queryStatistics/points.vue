<template>
  <div class="main-container" ref="myDiv">
    <div class="container-btn">
      <HeaderSearch
        :items="searchItems"
        :default-params="defaultParams"
        @search="handleSearch"
        @reset="handleReset"
      >
      </HeaderSearch>
    </div>
    <div class="latout-box" :style="{ height: tableHeight + 60 + 'px' }">
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
          :total="total"
          :loading="tableLoading"
          @size-change="sizeChange"
          @current-change="currentChange"
          :currentPage="query.current"
        >
        </base-table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, watchEffect, onMounted } from "vue";
import { userPointsList, getDeptTreeApi } from "@/api/system";
import BaseTable from "@/components/BaseTable.vue";
import HeaderSearch from "@/components/HeaderSearch.vue";

const myDiv = ref(null);
const tableHeight = ref(0);

const handleSearch = (value) => {
  userName.value = value.userName;
  value.deptId = ruleForm.deptId;
  query.value.current = 1;
  const params = {
    userName: value.userName,
    deptId: ruleForm.deptId,
  };
  initData(params);
};
const handleReset = () => {
  const params = {
    userName: "",
    deptId:ruleForm.deptId,
  };
  initData(params);
};
watchEffect(() => {
  if (myDiv.value) {
    tableHeight.value = myDiv.value.clientHeight - 120; // 获取高度并响应式更新
  }
});
const columns = ref([
  { prop: "userName", label: "用户名" },
  { prop: "totalPoints", label: "累计积分" },
  // { prop: "password", label: "密码" },
]);
const searchItems = ref([
  {
    type: "input",
    prop: "userName",
    label: "用户名",
  },
]);

const defaultParams = ref({});

const treeData = reactive([]);
const defaultProps = {
  children: "children",
  label: "deptName",
};
const tableLoading = ref(false); //table数据loading
const total = ref(null);
const ruleForm = reactive({
  account: "",
  deptName: "根节点",
  duty: "",
  phone: "",
  userName: "",
  password: "",
  sort: null,
  security: "",
  deptId: "1",
});
const tableData = ref([]);
const userName = ref("")
const query = ref({
  size: 10,
  current: 1,
});
onMounted(() => {
  getDeptTree();
  tableLoading.value = true;
});

const getDeptTree = () => {
  getDeptTreeApi(1).then((res) => {
    if (res.code == 200) {
      treeData.push(res.data);
    }
  });
  treeData.length = 0;
  const params = {
    deptId: "1",
  };
  initData(params);
};
const initData = (params = {}) => {
  // proxy.$loading.show({
  //   text: "正在加载数据...",
  // });
  Object.assign(params, query.value);
  tableLoading.value = true;

  userPointsList(params)
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
const handleNodeClick = (data) => {
  // this.loading = true;
  ruleForm.deptId = data.id;
  ruleForm.deptName = data.deptName;
  tableData.value = [];
  const params = {
    deptId: data.id,
  };
  initData(params);
};
const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];
  const params = {
    userName: userName.value,
    deptId: ruleForm.deptId,
  };
  initData(params);
};
const currentChange = (val) => {
  query.value.current = val;
  query.value.size = 10;
  tableData.value = [];
  const params = {
    userName: userName.value,
    deptId: ruleForm.deptId,
  };
  initData(params);
};
</script>

<style lang="less">
.main-container {
  height: 100%;
  padding: 0 5px 0 0 ;

  box-sizing: border-box;
}
.container-btn {
  width: 100%;
  text-align: right;
  padding: 3px 0;
  box-sizing: border-box;
}
.el-dialog__header {
  text-align: center;
}
.dialog-tips {
  font-size: 12px;
  padding: 5px;
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
.latout-box {
  display: flex;
  flex-direction: row;
  .tree-box {
    width: 15%;
    background: #fff;
    height: 100%;
    margin-right: 3px;
    padding: 3px;
    box-sizing: border-box;
    border-radius: 5px;
    .title {
      font-size: 12px;
    }
  }
  .table-box {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-basis: auto;
    flex-direction: row;
    min-width: 0;
    background: #fff;
    border-radius: 5px;
  }
}
</style>
