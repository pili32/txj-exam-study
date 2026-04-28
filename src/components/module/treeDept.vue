<template>
  <div class="main-container1" ref="myDiv">
    <BaseDialog
      v-model="dialogVisible"
      title="选择部门"
      @confirm="handleSubmit"
      :closeOnClickModal="false"
      :closeOnPressEscape="false"
      width="60%"
    >
      <div class="container">
        <!-- 左侧部门列表 -->
        <div class="left-panel">
          <!-- <el-card shadow="hover"> -->
          <!-- <template #header> -->
          <div class="card-header">
            <span>部门列表</span>
          </div>
          <!-- </template> -->
          <el-tree
            :data="departments"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            default-expand-all
            check-strictly
            highlight-current
            :default-expand-all="true"
            @node-click="handleDepartmentClick"
            @check-change="handleDepartmentClick"
            ref="treeRef"
          />
          <!-- </el-card> -->
        </div>

        <!-- 中间人员列表 -->
        <div class="middle-panel">
          <!-- <el-card shadow="hover"> -->
          <!-- <template #header> -->
          <div class="card-header">
            <span>部门人员列表 ({{ currentDepartmentName }})</span>
          </div>
          <!-- </template> -->
          <!-- <el-checkbox-group
            v-model="selectedUsers"
            @change="handleUserSelectionChange"
          > -->
            <div
              v-for="user in currentDepartData"
              :key="user.id"
              class="user-item"
            >
              <!-- <el-checkbox :label="user.id"   :checked="user.checked">{{ user.deptName }}</el-checkbox> -->
              <div>{{  user.deptName }}</div>
            </div>


          <!-- </el-checkbox-group> -->
          <!-- </el-card> -->
        </div>

        <!-- 右侧已确认人员 -->
        <div class="right-panel" v-if="false">
          <!-- <el-card shadow="hover"> -->
          <!-- <template #header> -->
          <div class="card-header">
            <span>已确认人员 ({{ confirmUser.length }})</span>
          </div>
          <!-- </template> -->
          <div v-if="confirmUser.length === 0" class="empty-tip">
            暂无已确认人员
          </div>
          <div v-else>
            <div
              v-for="user in confirmUser"
              :key="user.id"
              class="confirmed-user-item"
            >
              <span>{{ user.deptName }}</span>
              <el-button
                type="danger"
                size="small"
                @click="removeConfirmedUser(user.id)"
                circle
                plain
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <!-- </el-card> -->
        </div>
      </div>


    </BaseDialog>
  </div>
</template>
<script setup>
import { ref, computed, watch, reactive ,nextTick} from "vue";
import { getDeptTreeApi } from "@/api/system";
import { getDeptUserByIdApi } from "@/api/user";

const dialogVisible = ref(false);
const departments = ref([]);

// const departments = ref([
//   {
//     id: 1,
//     label: '技术部',
//     children: [
//       { id: 11, label: '前端开发组' },
//       { id: 12, label: '后端开发组' },
//       { id: 13, label: '测试组' }
//     ]
//   },
//   {
//     id: 2,
//     label: '产品部',
//     children: [
//       { id: 21, label: '产品策划组' },
//       { id: 22, label: '用户体验组' }
//     ]
//   },
//   {
//     id: 3,
//     label: '运营部',
//     children: [
//       { id: 31, label: '市场推广组' },
//       { id: 32, label: '客户服务组' }
//     ]
//   }
// ])

const allUsers = ref([
  // 技术部-前端开发组
  { id: 101, name: "张三", departmentId: 11 },
  { id: 102, name: "李四", departmentId: 11 },
  { id: 103, name: "王五", departmentId: 11 },

  // 技术部-后端开发组
  { id: 104, name: "赵六", departmentId: 12 },
  { id: 105, name: "钱七", departmentId: 12 },

  // 技术部-测试组
  { id: 106, name: "孙八", departmentId: 13 },
  { id: 107, name: "周九", departmentId: 13 },

  // 产品部-产品策划组
  { id: 201, name: "吴十", departmentId: 21 },
  { id: 202, name: "郑十一", departmentId: 21 },

  // 产品部-用户体验组
  { id: 203, name: "王十二", departmentId: 22 },

  // 运营部-市场推广组
  { id: 301, name: "冯十三", departmentId: 31 },
  { id: 302, name: "陈十四", departmentId: 31 },

  // 运营部-客户服务组
  { id: 303, name: "褚十五", departmentId: 32 },
]);

// 树形控件配置
const defaultProps = {
  children: "children",
  label: "deptName",
  disabled: 'disabled',
};
const emit = defineEmits(["childEvent"]);

// 响应式数据
const currentDepartmentId = ref();
const deptIdData = ref([]);   //获取的当前部门Id
const confirmUser = ref([])  //最终确认人员
const currentDepartData = ref([]); //获取到最终部门人员
const currentDepartmentName = ref("请选择部门");
const users = ref([]);
const selectedUsers = ref([]);
const confirmedUsers = ref([]);
const treeRef = ref("")
const getDeptTree = (state) => {
  getDeptTreeApi().then(async (res) => {
    if (res.code == 200) {
      if(  departments.value.length ==0) {
          departments.value.push(res.data);

      }
      departments.value[0].disabled =true

      if(state){
        await  nextTick()
        setTimeout(() => {
             deptIdData.value.forEach(  item =>{
            treeRef.value.setChecked(item, true); //设置父节点高亮
          })
        }, 1000);

      }

    }
  });
  // getDeptData();
};
// 监听当前部门变化
watch(currentDepartmentId, (newVal) => {
  if (newVal) {
    // 过滤出当前部门的人员（包括子部门）
    const departmentIds = getDepartmentAndChildrenIds(newVal);
    users.value = allUsers.value.filter((user) =>
      departmentIds.includes(user.departmentId)
    );
    // selectedUsers.value = [] // 切换部门时清空已选人员
  } else {
    users.value = [];
  }
});

// 获取部门及其子部门的ID数组
const getDepartmentAndChildrenIds = (departmentId) => {
  const result = [];
  const findDepartments = (id) => {
    for (const dept of departments.value) {
      if (dept.id === id) {
        result.push(dept.id);
        if (dept.children) {
          dept.children.forEach((child) => {
            result.push(child.id);
          });
        }
        break;
      } else if (dept.children) {
        for (const child of dept.children) {
          if (child.id === id) {
            result.push(child.id);
            // 如果需要包含父部门，可以取消下面这行的注释
            // result.push(dept.id)
            break;
          }
        }
      }
    }
  };

  findDepartments(departmentId);
  return result;
};

// 处理部门点击
const handleDepartmentClick = (data, checkedInfo) => {

  if (!data.children<1 && data.id!==1) {
    // 只有叶子节点（具体部门）才处理
    // currentDepartmentId.value = data.id
    // currentDepartmentName.value = data.label


    getDeptUser(data, checkedInfo);
  }
// data 当前勾选数据，checkedInfo当前候选状态
  //判断当前的节点是勾选状态
    // 只有叶子节点（具体部门）才处理
    // currentDepartmentId.value = data.id
    // currentDepartmentName.value = data.label
    // getDeptUser(data, checkedInfo);
};

const getDeptUser = (data, checkStatus) => {
    const {id} = data



    const deptIndex = deptIdData.value.findIndex(e => e === id)  //判断当前的树数据是否勾选了数据
    if(checkStatus){


      if(deptIndex==-1) {  //没有勾选
        deptIdData.value.push(id);
      }
    } else {
      if(deptIndex!=-1) {  //取消勾选
        deptIdData.value.splice(deptIndex, 1)
      }
    }
    filterUser(data,checkStatus);


};
//当checkStatus = false时，获取到已选择当前人员数据，并且删除人员和删除最终选择人员
//当checkStatus = false时，获取到已选择当前人员数据，如果不存在就添加
//currentDepartData  当前人员数据
const filterUser = (data, checkStatus) => {

  const index  = currentDepartData.value.findIndex( e =>e.id=== data.id)
  const {id,deptName} = data

   //当人员不存在的时候
  if(index == -1) {
      const obj = {
        deptName: deptName,
        id: id,
      };
        currentDepartData.value.push(obj)
    } else {
      if ( typeof checkStatus === 'boolean' && !checkStatus) {

        deleteDeptUser(id)
      }
    }

};
//删除当前选择人员，根据id匹配
const deleteDeptUser = (id) =>{
  const index =currentDepartData.value.findIndex(item => item.id === id);
  if (index !== -1) {
    currentDepartData.value.splice(index, 1); // 从数组中删除1项   //删除当前选项人员
  }
}
//删除最终确认人员
const deleteConfirmUser = () =>{

}

const initChange = (state,deptIds,detData) => {
  dialogVisible.value = state
if(deptIds){
  deptIdData.value = deptIds
  getDeptTree(true);


} else {
   getDeptTree();

}


};

// 处理用户选择变化
const handleUserSelectionChange = (selectedIds) => {
  confirmUser.value = []   //初始化数据,每次人员变化后都将确认人员设置为[]

  //获取到勾选人员  includes 方法用于检查数组是否包含某个元素
  const data = currentDepartData.value.filter(item => selectedIds.includes(item.id));
  data.forEach( item =>{
    confirmUser.value.push(item)
  })
   //向最终确认数据添加人员



// //   // 找出新勾选的用户（这次勾选但之前未勾选的）
//   const newlySelected = selectedIds.filter(
//     (id) => !confirmedUsers.value.some((u) => u.id === id)
//   );




//   // 将新勾选的用户添加到已确认列表
//   newlySelected.forEach((id) => {
//     const user = allUsers.value.find((u) => u.id === id);
//     if (user && !confirmedUsers.value.some((u) => u.id === id)) {
//       confirmedUsers.value.push({ ...user });
//     }
//   });



//   // 找出取消勾选的用户（之前在已确认列表中但现在取消勾选的）
//   const unselectedIds = allUsers.value
//     .filter((u) => u.departmentId === currentDepartmentId.value)
//     .map((u) => u.id)
//     .filter((id) => !selectedIds.includes(id));

//   // 从已确认列表中移除取消勾选的用户
//   confirmedUsers.value = confirmedUsers.value.filter(
//     (user) => !unselectedIds.includes(user.id)
//   );
};

// 移除已确认用户
const removeConfirmedUser = (userId) => {
  confirmUser.value = confirmUser.value.filter(
    (user) => user.id !== userId
  );
  selectedUsers.value = selectedUsers.value.filter((id) => id !== userId);

};

const handleSubmit = () =>{


emit("childEvent",deptIdData.value,currentDepartData.value);  //部门ids和人员Array

}
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
