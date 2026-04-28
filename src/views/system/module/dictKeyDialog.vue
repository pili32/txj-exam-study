<template>
  <div class="dialog-box" ref="myDiv">
    <div>
      <BaseDialog
        v-model="dialogVisible"
        :title="title"
        :confirm-loading="dialogLoading"
        @confirm="handleSubmit"
        width="50%"
        @close="dialogVisible = false"
      >
        <div class="dialogHeader">
          <el-button
            type="primary"
            size="small"
            @click="addDialogForm"
            v-if="!formReadlony"
            >新增</el-button
          >
        </div>
        <div v-if="rowTypeName">类别名称：{{ rowTypeName }}</div>
        <base-table
          ref="multipleTable"
          :columns="columns"
          :data="tableData"
          :height="!rowTypeName ? props.height - 150 : 450"
          :total="total"
          :loading="tableLoading"
          rowKey="id"
          :show-operation="!formReadlony"
          :pagination="false"
          @size-change="sizeChange"
          @current-change="currentChange"
          :currentPage="query.current"
        >
          <!-- 操作列按钮 -->
          <template #operation="scope">
            <div>
              <el-button
                size="small"
                link
                type="danger"
                @click="handleDeleteRow(scope.row)"
                >删除</el-button
              >
            </div>
          </template>
        </base-table>
        <template #footer v-if="footerButton">
          <slot name="footer">
            <div class="footer-btn">
              <span class="dialog-footer">
                <el-button @click="examineChange(1)" type="primary">
                  通过
                </el-button>
                <el-button @click="examineChange(2)" type="info">
                  不通过
                </el-button>
                <el-button @click="dialogVisible = false"> 取消 </el-button>
              </span>
            </div>
          </slot>
        </template>
      </BaseDialog>
    </div>
    <div>
      <BaseDialog
        v-model="dialogForm"
        :title="formTitle"
        :confirm-loading="dialogLoading"
        @confirm="submitEditHandler"
        width="40%"
        @close="dialogForm = false"
      >
        <div class="main-dialog">
          <el-form
            :model="ruleForm"
            label-width="100px"
            ref="ruleFormRef"
            :rules="rules"
            v-if="userType == 'user'"
          >
            <el-row>
              <el-col :span="24">
                <el-form-item label="类别名称" prop="typeName">
                  <el-input
                    v-model="ruleForm.typeName"
                    readonly
                    placeholder="请输入类别名称"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="值编码" prop="valueCode">
                  <el-input
                    v-model="ruleForm.valueCode"
                    :readonly="formReadlony"
                    placeholder="请输入值编码"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label="值名称" prop="valueName">
                  <el-input
                    v-model="ruleForm.valueName"
                    :readonly="formReadlony"
                    placeholder="请输入值名称"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label="排序" prop="sort">
                  <el-input
                    type="number"
                    v-model="ruleForm.sort"
                    :readonly="formReadlony"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input
                    v-model="ruleForm.remark"
                    :readonly="formReadlony"
                    placeholder="请输入备注"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </BaseDialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";
import BaseTable from "@/components/BaseTable.vue";

import { submitAuditApi, sysDictDataPageList } from "@/api/system";

const props = defineProps({
  userType: {
    type: String,
    default: "user",
  },
  height: {
    type: Number,
    default: () => null,
  },
  formReadlony: {
    type: Boolean,
    default: () => false,
  },
  title: {
    type: String,
    default: () => "新增人员",
  },
});
const dialogVisible = ref(false);
const dialogForm = ref(false);
const footerButton = ref(false);
const submitState = ref(true);
const formTitle = ref("");
const emit = defineEmits(["childEvent"]);
const tableData = ref([]);

const columns = ref([
  { prop: "valueCode", label: "值编码" },
  { prop: "valueName", label: "值名称" },
  { prop: "remark", label: "备注" },
  { prop: "sort", label: "排序" },
]);

const ruleForm = reactive({
  valueName: "",
  valueCode: "",
  remark: "",
  typeName: "",
  typeId: "",
  sort: "",
});

const rowTypeId = ref("");
const rowTypeName = ref("");
const rules = reactive({
  valueName: [{ required: true, message: "请输入值编码", trigger: "blur" }],
  valueCode: [{ required: true, message: "请输入值名称", trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
});
const query = ref({
  size: -1,
  current: 1,
});
//分配权限事件
const submitData = ref({
  moduleCode: "dictData",
  operParam: {
    typeName: "",
    typeId: "",
    dictData: [],
  },
});
const total = ref(0);
const ruleUserForm = reactive({
  ids: [],
});

const dialogLoading = ref(false);
const loading = ref(false);
const ruleFormReadonly = ref(false); //表单是否可以编辑
let userName = ref("");
const tableLoading = ref(false);
const initChange = (obj) => {
  dialogVisible.value = true;
  ruleForm.typeName = obj.typeName;
  ruleForm.typeId = obj.typeId;
  rowTypeId.value = obj.typeId;
  rowTypeName.value = obj.typeName;

  const params = {
    typeId: ruleForm.typeId,
  };
  initData(params);
};

let checkedKeysArr = ref([]); //获取到的选择的tree数据

//编辑菜单

const initData = (params = {}) => {
  Object.assign(params, query.value);
  tableLoading.value = true;

  sysDictDataPageList(params)
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

watch(
  () => props.title,
  (val) => {
    formTitle.value = props.title;
  }
);

watch(
  () => props.ids,
  (val) => {
    ruleUserForm.ids = val;
    checkedKeysArr.value = val;
  }
);

const ruleFormRef = ref(null);
const ruleUserFormRef = ref(null);

const sizeChange = (val) => {
  query.value.size = val;
  query.value.current = 1;
  tableData.value = [];
  const params = {
    typeId: rowTypeId.value,
  };
  initData(params);
};
const currentChange = (val) => {
  query.value.current = val;
  // query.value.size = 10;  //关闭重置每页条数
  tableData.value = [];
  const params = {
    typeId: rowTypeId.value,
  };
  initData(params);
};

const inFoChange = (obj, state, button) => {
  userName.value = obj.userName;
  dialogVisible.value = true;
  footerButton.value = button;
  submitState.value = false;

  rowTypeName.value = obj.typeName;
  tableData.value = obj.dictData;
  // initData(params);
};

const submitEditHandler = () => {
  loading.value = true;
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      const data = ruleForm;

      tableData.value.push(JSON.parse(JSON.stringify(data)));
      dialogForm.value = false;
      loading.value = false;
      return;
    } else {
      loading.value = false;
    }
  });
};

const addDialogForm = () => {
  dialogForm.value = true;
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
  ruleForm.typeName = rowTypeName.value;
};
//提交数据新增和修改的提交
const handleSubmit = async () => {
  if (!submitState.value) {
    {
      dialogVisible.value = false;
      return;
    }
  }
  const params = tableData.value.map((item) => {
    return {
      valueName: item.valueName,
      valueCode: item.valueCode,
      remark: item.remark,
      sort: item.sort,
    };
  });
  loading.value = true;
  submitData.value.operParam;
  const sumbmitParam = {
    typeName: rowTypeName.value,
    typeId: rowTypeId.value,
    dictData: params,
  };
  submitData.value.operParam = JSON.stringify(sumbmitParam);
  const serviceLoading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  submitAuditApi("config", submitData.value)
    .then((res) => {
      ElMessage({
        message: "操作成功,等待审核",
        type: "success",
        duration: 3 * 1000,
      });
      dialogForm.value = false;
      dialogVisible.value = false;
      serviceLoading.close();
    })
    .catch((error) => {
      serviceLoading.close();
    });
  loading.value = false;
  return;
};

//重置表单数据
const resetForm = () => {
  dialogForm.value = false;
  ruleFormRef.value.resetFields();
  Object.keys(ruleForm).forEach((key) => {
    ruleForm[key] = "";
  });
  ruleFormReadonly.value = false;
  ruleForm.typeName = rowTypeName.value;
};
const handleDeleteRow = (row) => {
  const { valueName } = row;
  const index = tableData.value.findIndex(
    (item) => item.valueName === valueName
  );
  tableData.value.splice(index, 1);
};
//删除数据
const handleDelete = (row) => {
  row.typeName = ruleForm.typeName;

  ElMessageBox.confirm("是否要删除数据?", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      submitData.value.operParam = JSON.stringify(row);
      submitAuditApi("delete", submitData.value)
        .then((res) => {
          if (res.code == 200) {
            ElMessage({
              message: "操作成功,等待审核",
              type: "success",
              duration: 3 * 1000,
            });
            const params = {
              typeId: rowTypeId.value,
            };
            initData(params);
          }
        })
        .catch((error) => {
        });
    })
    .catch(() => {});
};
const examineChange = (val) => {
  emit("childEvent", val);
  dialogVisible.value = false;
};
defineExpose({
  initChange,
  inFoChange,
});
</script>

<style lang="less" scoped>
.footer-btn {
  width: 100%;
  display: flex;
  justify-content: center;
}
.name-class {
  padding: 10px 20px;
  color: #409eff;
}
.main-dialog {
  max-height: 70vh;
  overflow-y: auto;
}
.dialogHeader {
  display: flex;
  justify-content: flex-end;
  padding: 5px;
}
</style>
