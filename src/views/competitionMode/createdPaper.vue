<template>
    <div class="main-container" ref="myDiv" v-if="previewState">
      <div class="container-btn">
        <!-- <el-button @click="addUserHandler" type="primary" size="small"
          >新增</el-button
        > -->
        <HeaderSearch
          :items="searchItems"
          @search="handleSearch"
          @reset="handleReset"
          :rowSpan="rowSpan"
        >
          <template v-slot:click>
            <el-button type="primary" size="small" @click="addUserHandler"
              >新增</el-button
            >
          </template>
        </HeaderSearch>
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
        <template #sourceCodeList="scope">
          <span>{{ filterSource(scope.row.sourceCodeList) }}</span>
        </template>
        <template #paperType="scope">
          <span>{{ filterPaperType(scope.row.paperType) }}</span>
        </template>

        <!-- 操作列按钮 -->
        <template #operation="scope">
          <div>
            <el-button
              size="small"
              link
              type="info"
              @click="detailsChange(scope.row)"
              >详情</el-button
            >
            <!-- <el-button
              size="small"
              link
              type="primary"
              v-if="scope.row.paperType == 1"
              @click="previewChange(scope.row)"
              >预览</el-button
            >
            <el-button
              size="small"
              link
              type="warning"
              @click="downloadHandler(scope.row)"
              v-if="scope.row.paperType == 1"
              >导出</el-button
            > -->

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
    </div>
<!--
    <ExamPreview
      :rowId="previewId"
      :state="previewState"
      @childEvent="outChange"
      v-if="!previewState"
    ></ExamPreview> -->
    <producing
      ref="dialogRef"
      @childEvent="updateData"
      :userType="typeDialog"
      :paperTypeData="paperTypeData"
      :chooseData="chooseData"
      :tree="treeData"
      :fileData="questionFileData"
    ></producing>
  </template>
  <script setup>
  import { ref, reactive, watchEffect, onMounted, computed } from "vue";
  import { submitAuditApi, getMenusByRole } from "@/api/system";
  import { categoryTreeApi } from "@/api/topic";
  import { selfPageList, paperDelete } from "@/api/examination";
  import tableDialog from "@/components/module/tableDialog.vue";
  import { systemStore } from "@/stores/common.js";
  import { ElLoading } from "element-plus";

  import ExamPreview from "@/components/examCompontntsPage/ExamPreview.vue";
  import { getToken } from "@/utils/auth";

  import BaseTable from "@/components/BaseTable.vue";
  import producing from "./module/producing.vue";

  const myDiv = ref(null);
  const tableHeight = ref(0);
  const dialogVisible = ref(false);
  const formDialogVisible = ref(false);
  const dialogRef = ref("");
  const previewState = ref(true);
  const rowSpan = ref(8);
  let { questionFileData } = systemStore(); //引入store
  const questionData = computed(() => {
    return questionFileData.map((item) => {
      return {
        value: item.valueCode,
        label: item.valueName,
      };
    });
  });
  const searchItems = ref([
    {
      type: "input",
      prop: "name",
      label: "试卷名称",
    },
    // {
    //   type: "select",
    //   prop: "sourceCodeList",
    //   label: "题目所属文件",
    //   multiple: true,
    //   options: questionData,
    // },
  ]);
  watchEffect(() => {
    if (myDiv.value) {
      tableHeight.value = myDiv.value.clientHeight - 115; // 获取高度并响应式更新
    }
  });

  const columns = ref([
    { prop: "name", label: "试卷名称" },
    // { prop: "sourceCodeList", label: "题目所属文件", slot: "sourceCodeList" },
    { prop: "totalScore", label: "总分数" },
    { prop: "paperType", label: "试卷类型", slot: "paperType" },
    { prop: "createTime", label: "创建时间" },
    { prop: "createUserName", label: "创建人" },
  ]);

  const submitData = ref({
    moduleCode: "role",
    status: 0,
    auditStatus: 0,
    operParam: {},
  });
  const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
  const loading = ref(false);
  const parentName = ref(""); //父级菜单名称
  const ruleFormRef = ref(null); //form表单ref
  const dialogTitle = ref("新增角色"); //弹框title
  const total = ref(null); //总数
  const tableLoading = ref(false); //table数据loading
  const dialogLoading = ref(false); //提交数据loading
  let checkedKeysArr = reactive([]); //获取到的选择的tree数据
  const rowId = ref("");
  const ruleForm = reactive({
    name: "",
    description: "",
  });
  const ruleFormId = ref("");
  const previewId = ref("");
  const rules = reactive({
    name: [{ required: true, message: "请输入名称", trigger: "blur" }],
    description: [{ required: true, message: "请输入菜单描述", trigger: "blur" }],
  });
  const tableData = ref([]);
  const treeRef = ref(); // 获取树组件的引用
  const treeData = ref([]);

  const query = ref({
    size: 10,
    current: 1,
    paperMode: 1,
  });
  const searchParam = ref({
    name:"",
    sourceCodeList:[]
  });
  const typeDialog = ref("user");

  const defaultProps = {
    children: "children",
    label: "name",
  };
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
  const chooseData = reactive([
    {
      value: "1",
      label: "是",
    },
    {
      value: "2",
      label: "否",
    },
  ]);
  onMounted(() => {
    getDeptTree();
    initData();
  });
  const getDeptTree = () => {
    const id = 0;
    categoryTreeApi(id).then((res) => {
      if (res.code == 200) {
        res.data.disabled = true
        console.log( res.data);
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
  const initData = (params = {}) => {
    Object.assign(params, query.value);
    tableLoading.value = true;

    selfPageList(params)
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

  const handleSearch = (value) => {
    query.value.current = 1;
    searchParam.value = value
    initData(searchParam.value);
  };

  const handleReset = () => {
    Object.keys(searchParam.value).forEach((key) => {
      searchParam.value[key] = "";
    });
    initData();
  };

  const handleSubmit = async () => {
    const data = {
      roleId: ruleFormId.value,
      menuIds: checkedKeysArr,
    };
    const submitTree = {
      moduleCode: "roleMenu",

      status: 0,
      auditStatus: 0,
      operParam: JSON.stringify(data),
    };

    submitAuditApi("config", submitTree).then((res) => {
      ElMessage({
        message: "操作成功",
        type: "success",
        duration: 3 * 1000,
      });
      resetForm();
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
  const filterSource = (value) => {
    let val = "";
    if (value) {
      const itemData = value.split(";");
      const ids = itemData.map((item) => item);
      const names = questionFileData
        .filter((e) => ids.includes(e.valueCode))
        .map((item) => item.valueName);
      val = names.join(", ");
    }
    return val;

  };
  const sizeChange = (val) => {
    query.value.size = val;
    query.value.current = 1;
    tableData.value = [];
    initData(searchParam.value);
  };
  const currentChange = (val) => {
    query.value.current = val;
    // query.value.size = 10; //关闭重置每页条数
    tableData.value = [];

    initData(searchParam.value);
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
        tableLoading.value = true;
        const loading = ElLoading.service({
          lock: true,
          text: "加载中...",
          background: "rgba(0, 0, 0, 0.7)",
        });
        paperDelete(id)
          .then((res) => {
            if (res.code == 200) {
              ElMessage({
                message: "操作成功",
                type: "success",
                duration: 3 * 1000,
              });
              initData(searchParam.value);
              resetForm();
              tableLoading.value = false;

            }
            loading.close();
          })
          .catch((error) => {
            tableLoading.value = false;
            loading.close();

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
    typeDialog.value = "roleMenu";

    const obj = {
      rowId: row.id,
    };
    dialogRef.value.initChange(obj);

    // dialogTitle.value = "编辑菜单";
    // const { id } = row;
    // ruleFormId.value = id;
    // getMenuTree().then((res) => {
    //   if (res.code == 200) {
    //     dialogVisible.value = true;
    //     treeData.value.push(res.data);
    //     getMenuId(id);
    //   }
    // });
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
  const outChange = () => {
    previewState.value = true;
  };
  const previewChange = (row) => {
    previewId.value = row.id;
    previewState.value = false;
  };

  const downloadHandler = (row) => {
    const { id, name } = row;
    let url = apiUrl.value + "/business/paperTemplate/exportPaper?id=" + id;
    downloadFileWithToken(url, name);
  };
  const downloadFileWithToken = (url, name) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`); // 设置Token头
    xhr.responseType = "blob"; // 关键：指定响应类型为二进制流
    xhr.onload = function () {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = name + ".docx"; // 设置默认文件名
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(downloadUrl); // 释放内存
      }
      xhr.send();
    };

    xhr.send();
  };
  const updateData = (val) => {
    initData();
  };
  const addUserHandler = () => {

    dialogRef.value.initChange({});
  };

  const detailsChange = (row) =>{
    const params ={
      rowId:row.id
    }
  dialogRef.value.initChange(params);
  }

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

  <style lang="less">
  .main-container {
    height: 100%;
    padding: 0 5px 0 0 ;

    box-sizing: border-box;
    color: #000;
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
