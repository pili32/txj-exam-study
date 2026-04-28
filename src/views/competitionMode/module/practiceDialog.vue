<template>
  <div class="main-container1" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      title="试题练习"
      @confirm="handleSubmit"
      :closeOnClickModal="false"
      :closeOnPressEscape="false"
    >
        <div class="dialog-box">
          <el-tree-select
            v-model="categoryId"
            :data="treeData"
            :props="defaultProps"
            @node-click="handleNodeClick"
            @check-change="handleNodeClick"
            node-key="id"
            ref="treeRef"
            placeholder="请选择题目分类"
            style="width: 260px"
            multiple
            show-checkbox
            :default-expand-all="true"
          />
          <el-select
            v-model="types"
            multiple
            placeholder="请选择题目类型"
            style="width: 260px"
            @change="typeHandler"
          >
            <el-option
              v-for="item in topicType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

      <template #footer>
        <slot name="footer" >
          <div class="footer-btn">
            <span class="dialog-footer">
              <el-button @click="startChange()" type="primary"> 开始练习 </el-button>
            </span>
          </div>
        </slot>
      </template>
    </BaseDialog>
  </div>
</template>
<script setup>
import { saveApi, queryByIdApi ,categoryTreeApi} from "@/api/topic";

import { ref, reactive, defineExpose, watch } from "vue";
defineProps({
    topicType: Array,
    treeData: Array,
});
const emit = defineEmits(["childEvent"]);
const dialogVisible = ref(false);
const initChange = (state) => {
  dialogVisible.value = state;
};
const treeRef = ref()

const categoryIds = ref([]);
const categoryId= ref()
const types = ref([]);
const handleSubmit = () => {};
const clickState = ref(true)

const defaultProps = {
  children: "children",
  label: "name",
  value: "id",
};
//题目分类事件
const handleNodeClick = (checkedNode) => {
      if(!clickState.value) return
      const keys = treeRef.value.getCheckedKeys(); //获取到当前所有选中的节点
      categoryIds.value = keys;
      clickState.value = false
      setTimeout(()=>{
          clickState.value = true
      },500)
};


const typeHandler = (event) => {
  types.value = event
};

const startChange = () =>{
    // dialogVisible.value = false
    emit("childEvent",types.value,categoryIds.value);

}
defineExpose({
  initChange,
});
</script>

<style lang="less" scoped>
.footer-btn {
  width: 100%;
  display: flex;
  justify-content: center;
}
.dialog-box{
    display:flex;
    justify-content: space-between;

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

</style>
