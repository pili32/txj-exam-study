<template>
    <div class="main-container" ref="myDiv" v-if="!showExam">
      <div class="container-btn" v-if="!showExam">
        <!-- <el-button @click="" type="primary" size="small">新增</el-button> -->

        <HeaderSearch
          :items="searchItems"
          @search="handleSearch"
          @reset="handleReset"
        >
          <template v-slot:click>
            <el-button type="primary" size="small" @click="handleAdd"
              >新增</el-button
            >
          </template>
        </HeaderSearch>
      </div>
      <div v-if="!showExam">
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
          <template #paperType="scope">
            <span>{{ filterPaperType(scope.row.paperType) }}</span>
          </template>
          <template #startTime="scope">
            <span>{{ filterTime(scope.row) }}</span>
          </template>
          <template #allowRetake="scope">
            <span>{{ filterAllowRetake(String(scope.row.allowRetake)) }}</span>
          </template>
          <template #duration="scope">
            <span>{{ scope.row.duration }}分钟</span>
          </template>

          <template #releaseStatus="scope">
            <span v-if="scope.row.releaseStatus == '1'"  style="color: #409EFF">已发布</span>
            <span v-else>未发布</span>
          </template>

          <!-- 操作列按钮 -->
          <template #operation="scope">
            <div>

              <el-button
                size="small"
                link
                type="success"
                @click="modifyChange(scope.row.id)"
                v-if="scope.row.releaseStatus == '1'   && scope.row.allowRetake == 1"
                >编辑</el-button
              >
              <el-button
                size="small"
                link
                type="success"
                @click="editChange(scope.row)"
                v-if="scope.row.releaseStatus == '0'"
                >编辑</el-button
              >
              <el-button
                size="small"
                link
                type="primary"
                v-if="scope.row.releaseStatus == 0"
                @click="releaseChange(scope.row)"
                >发布</el-button
              >
              <el-button
                size="small"
                link
                type="info"
                @click="detailsChange(scope.row.id)"
                >详情</el-button
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
      </div>
    </div>

    <!-- <ExamPreview
      :rowId="previewId"
      :state="previewState"
      @childEvent="outChange"
      v-if="!previewState"
    ></ExamPreview> -->
    <release-page
      ref="dialogRef"
      @releaseEvent="updateData"
      :dialogState="dialogVisible"
      :userType="typeDialog"
      :paperTypeData="paperTypeData"
      :tree="treeData"
      :allowRange="allowRange"
      v-if="showExam"
      :height="tableHeight"
      :tableRowId="rowId"
      :formReadlony="pageState"
    ></release-page>
  </template>
  <script setup>
  import { ref, reactive, watchEffect, onMounted } from "vue";
  import { submitAuditApi, getMenusByRole } from "@/api/system";
  import { categoryTreeApi } from "@/api/topic";
  import { examPageList, examDelete, examRelease } from "@/api/examination";
  import { ElLoading } from "element-plus";

  import ExamPreview from "@/components/examCompontntsPage/ExamPreview.vue";
  import { getToken } from "@/utils/auth";

  import BaseTable from "@/components/BaseTable.vue";
  import ReleasePage from "./module/ReleasePage.vue";

  const myDiv = ref(null);
  const tableHeight = ref(0);
  const dialogVisible = ref(false);
  const formDialogVisible = ref(false);
  const dialogRef = ref("");
  const previewState = ref(true);
  watchEffect(() => {
    if (myDiv.value) {
      tableHeight.value = myDiv.value.clientHeight - 115; // 获取高度并响应式更新
    }
  });

  const searchItems = ref([
    {
      type: "input",
      prop: "name",
      label: "考试名称",
    },
  ]);
  // allowRetake: "", //是否补考
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
  const columns = ref([
    { prop: "name", label: "考试名称" },
    { prop: "startTime", label: "考试时间", slot: "startTime", width: 400 },
    { prop: "duration", label: "考试时长", slot: "duration" },
    // { prop: "allowRetake", label: "是否允许补考", slot: "allowRetake" },
    { prop: "releaseStatus", label: "发布状态", slot: "releaseStatus" },

    //   { prop: "totalScore", label: "总分数" },
    //   { prop: "passingScore", label: "及格分" },
    //   { prop: "paperType", label: "试卷类型", slot: "paperType" },
    //   { prop: "createTime", label: "创建时间" },
    //   { prop: "createUserName", label: "创建人" },
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
  const pageState = ref(1);
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
  const showExam = ref(false);
  const query = ref({
    size: 10,
    current: 1,
    examMode:1
  });
  const typeDialog = ref("user");
  const searchName = ref("");

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
  const allowRange = reactive([
    {
      value: "0",
      label: "否",
    },
    {
      value: "1",
      label: "是",
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
    rowId.value = "";
    examPageList(params)
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


  const filterPaperType = (value) => {
    let val = "";
    if (value) {
      const { label } = paperTypeData.find((item) => item.value == value);
      val = label;
    }
    return val;
  };

  const handleSearch = (value) => {
    searchName.value = value.name;
    query.value.current = 1;

    const params = {
      name: searchName.value,
    };
    initData(params);
  };

  const handleReset = () => {
    searchName.value = "";
    initData();
  };
  const filterAllowRetake = (value) => {
    let val = "";
    if (value) {
      const { label } = allowRange.find((item) => item.value == value);
      val = label;
    }
    return val;
  };

  const filterTime = (row) => {
    const { startTime, endTime } = row;
    return startTime + " 至 " + endTime;
  };

  const handleAdd = () => {
    pageState.value = 1;
    showExam.value = true;
    rowId.value = "";
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
        examDelete(id)
          .then((res) => {
            if (res.code == 200) {
              ElMessage({
                message: "操作成功",
                type: "success",
                duration: 3 * 1000,
              });
              const params = {
                name: searchName.value,
              };
              initData(params);
              resetForm();
              loading.close()
              tableLoading.value = false;
            }
          })
          .catch((error) => {
            loading.close()
            tableLoading.value = false;
          });
        // ElMessage({
        //   type: 'success',
        //   message: 'Delete completed',
        // })
      })
      .catch(() => {});
  };
  const sizeChange = (val) => {
    query.value.size = val;
    query.value.current = 1;
    tableData.value = [];
    const params = {
      name: searchName.value,
    };
    initData(params);
  };
  const currentChange = (val) => {
    query.value.current = val;
    // query.value.size = 10; //关闭重置每页条数
    tableData.value = [];
    const params = {
      name: searchName.value,
    };
    initData(params);
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
  const releaseChange = (row) => {
    const params = {
      id: row.id,
      releaseStatus: 1,
    };

    ElMessageBox.confirm("确定发布考试？发布后无法撤销！", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        const loading = ElLoading.service({
          lock: true,
          text: "加载中...",
          background: "rgba(0, 0, 0, 0.7)",
        });
        examRelease(params).then((res) => {
          if (res.code == 200) {
            ElMessage({
              message: "操作成功",
              type: "success",
              duration: 3 * 1000,
            });
            loading.close()
            initData();
          }
        }).catch(error =>{
          loading.close()

        });
      })
      .catch(() => {});
  };
  //补考修改
  const modifyChange = (id) => {
    pageState.value = 0;
    rowId.value = id;
    showExam.value = true;
  };
  const detailsChange = (id) =>{
    pageState.value = 0;
    rowId.value = id;
    showExam.value = true;
  }
  //修改
  const editChange = (row) => {
    rowId.value = row.id;
    showExam.value = true;
    pageState.value = 1;
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
  const updateData = (id) => {
    console.log(id);
    showExam.value = false;
    initData();
  };
  const addUserHandler = () => {
    typeDialog.value = "role";

    dialogRef.value.initChange({});
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
    padding: 0 5px 0 0 ;

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
  .scope-color {
    color: #409eff !important;
  }
  </style>
