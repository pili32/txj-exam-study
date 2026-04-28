<template>
  <div class="header-container">
    <div class="header-cetner">
      <el-image fit="cover" alt="首页" :src="logo" />
      <div class="header-search">
        <el-input
          v-model="searchValue"
          style="max-width: 400px; min-width: 200px"
          placeholder=""
          @keyup.enter="searchChange"
          suffix-icon="Search"
          v-if="needHomePage && !showBacImg"
        >
        </el-input>
      </div>
    </div>
    <div class="header-bottom">
      <!-- <div
        v-for="(item, index) in headerMenu"
        class="bottom-menu"
        :class="[currentIndex === index ? 'check-active' : 'active']"
      >
        <span @click="clickMenu(index)">{{ item.name }}</span>
      </div> -->
      <el-menu
        :default-active="currentIndex"
        class="el-menu-demo"
        background-color="#D81E16"
        text-color="#fff"
        mode="horizontal"
        active-text-color="#fff"
        :ellipsis="false"
      >
        <template v-for="(item, index) in headerMenu">
          <el-menu-item
            :index="item.id"
            v-if="!item.children"
            @click="navigateTo(item)"
          >
            <span v-if="item.label">{{ item.label }}</span>
            <span v-else>{{ item.name }}</span>
          </el-menu-item>
          <el-sub-menu v-else :index="item.id">
            <template #title>{{ item.name }}</template>
            <el-menu-item
              :index="child.id"
              @click="navigateTo(child)"
              v-for="(child, childIndex) in item.children"
            >
              <span v-if="child.label">{{ child.label }}</span>
              <span v-else>{{ child.description }}</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </div>
    <div class="header-right flex-box">
      <el-dropdown @visible-change="handleVisibleChange">
        <div class="flex-box">
          <el-avatar :src="avatarImg" :size="30" />
          <p>{{ userName }}</p>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              @click="changePoints"
              v-if="userPoints"
              :disabled="examDisabled"
              >个人积分</el-dropdown-item
            >
            <el-dropdown-item @click="changePass" :disabled="examDisabled"
              >修改密码</el-dropdown-item
            >
            <el-dropdown-item @click="handlerChange" :disabled="examDisabled"
              >退出</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <BaseDialog
      title="修改密码"
      v-model="dialogVisible"
      @confirm="submitForm"
      @close="() => (dialogVisible = false)"
      :confirm-loading="loading"
      width="30%"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        ref="ruleFormRef"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="ruleForm.oldPassword"
            placeholder="请输入旧密码"
          ></el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="ruleForm.newPassword"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>

        <el-form-item label="确定密码" prop="submit">
          <el-input
            v-model="ruleForm.submit"
            placeholder="请输入确认新密码"
          ></el-input>
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
  <points-dialog ref="pointsRef" />
</template>
<script setup>
import { ref, computed, watch, reactive, inject } from "vue";
import { useRouter } from "vue-router";

import { menuStore } from "@/stores/menu.js";
import { userStore } from "@/stores/user.js";
import { logout } from "@/api/user.js";
import { updatePassword } from "@/api/system.js";
import { ElLoading } from "element-plus";
import logo from "@/assets/image/layout/logo.png";

import BaseDialog from "@/components/BaseDialog.vue";
import PointsDialog from "@/components/module/PointsDialog.vue";
import avatarImg from "@/assets/image/user4.png";
import homeImg from "@/assets/image/home9.png";
import emblemImg from "@/assets/image/home/emblem.png";

import { removeToken } from "@/utils/auth";

import { storeToRefs } from "pinia";
const { isCollapse, crearStore, activeIndex } = storeToRefs(menuStore()); //引入store
const $loading = inject("$loading"); // 注入全局 Loading
const pointsRef = ref("");
const ruleFormRef = ref();
const searchValue = ref("");
const currentIndex = ref("1");
const collapseChange = () => {
  // 设置store.state.isCollapse的属性
  isCollapse.value = !isCollapse.value;
};
const examDisabled = ref(false);
const props = defineProps({
  showBacImg: {
    type: Boolean,
    default: () => true,
  },
  menuData: {
    type: String,
    default: () => [],
  },
});
const loading = ref(false);
const userStores = userStore();
const { userName } = userStores.userInfo.user;
const { enableUserPoints } = userStores.userInfo;
const { needHomePage } = userStores.userInfo;

const userPoints = ref(false);
const router = useRouter();
const menu = [
  {
    name: "首页",
    path: "home",
    id: "1",
  },
  {
    name: "技术资料",
    label: "技术资料",
    path: "home",
    id: "2",
    children: [
      {
        name: "资料学习",
        path: "/knowledge/study",
        valueCode: "1",
        label: "设备技术资料",

        meta: {
          name: "资料学习",
          path: "/knowledge/study",
        },
      },
      {
        name: "资料学习",
        valueCode: "2",
        path: "/knowledge/study",
        label: "线路技术资料",

        meta: {
          name: "资料学习",
          path: "/knowledge/study",
        },
      },
      {
        name: "资料学习",
        valueCode: "3",
        label: "会电技术资料",

        path: "/knowledge/study",
        meta: {
          name: "资料学习",
          path: "/knowledge/study",
        },
      },
    ],
  },
  {
    name: "资料学习",
    valueCode: "4",
    label: "培训教材",

    path: "/knowledge/study",
    id: "3",

    meta: {
      name: "资料学习",
      path: "/knowledge/study",
    },
  },
  {
    name: "资料学习",
    valueCode: "5",
    label: "新技术新业务",

    path: "/knowledge/study",
    id: "4",
    meta: {
      name: "资料学习",
      path: "/knowledge/study",
    },
  },
  {
    name: "资料学习",
    valueCode: "6",
    label: "政策文件",
    path: "/knowledge/study",
    id: "5",
    meta: {
      name: "资料学习",
      path: "/knowledge/study",
    },
  },
];
let headerMenu = reactive({});
watch(
  () => enableUserPoints,
  (val) => {
    if (val == 1) {
      userPoints.value = true;
    }
  },
  { immediate: true }
);
watch(
  () => props.menuData,
  (val) => {
    let data = menu.concat(val);
    headerMenu = data.filter((item) => item.name !== "知识管理");
    console.log(data);

    console.log(val.length);
    // console.log(headerMenu);
  },
  { immediate: true }
);

const dialogVisible = ref(false);
const store = menuStore();
const ruleForm = ref({ oldPassword: "", newPassword: "", submit: "" });
const validatePass = (rule, value, callback) => {
  const regexp = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=~`\{\}\[\]\|\\:;\"'<>,.?/])(?!.*\s).{8,15}$/
  );
  if (!regexp.test(value)) {
    callback(
      new Error("请输入需包含大小写字母，数字，特殊字符的8-15位的新密码")
    );
  } else {
    callback();
  }
};
const fnvalidate = (rule, val, callback) => {
  if (val == "") {
    callback(new Error("请输入确定密码"));
  } else if (val !== ruleForm.value.newPassword) {
    callback(new Error("和新密码输入不一致!"));
  } else {
    callback();
  }
};
const rules = reactive({
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [{ required: true, validator: validatePass, trigger: "blur" }],
  submit: [{ required: true, validator: fnvalidate, trigger: "blur" }],
});

const changePass = () => {
  dialogVisible.value = true;
};

const handleVisibleChange = (visible) => {
  const examStatus = localStorage.getItem("examStatus");
  let examinationStatus = false;
  if (JSON.stringify(examStatus) !== "null") {
    examinationStatus = JSON.parse(examStatus).examinationStatus;
  }
  if (visible) {
    if (examinationStatus) {
      ElMessage({
        message: "正在答题中，请不要切换页面",
        type: "error",
        duration: 1 * 1000,
      });
      examDisabled.value = true;
      return;
    } else {
      examDisabled.value = false;
    }
  }
};

const changePoints = () => {
  pointsRef.value.initChange();
};

const searchChange = (value) => {
  if (searchValue.value) {
    const path = "/knowledge/study";
    router.push({ path: path, query: { serchTitle: searchValue.value } });
    activeIndex.value = path; //设置首页第一个menu菜单
  }
};

const toHome = () => {
  router.push({ path: "/home" });
};
const handlerChange = () => {
  ElMessageBox.confirm("确定退出吗？", {
    // if you want to disable its autofocus
    // autofocus: false,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      logoutChange("退出成功");
    })
    .catch(() => {});
};
const navigateTo = (menu) => {
  console.log(menu);
  activeIndex.value = menu.path;
  if (!menu.valueCode) {
    router.push(menu.path);
  } else {
    router.push({
      path: menu.path,
      query: { typeCode: menu.valueCode },
    });
  }
  console.log(menu);
  store.selectMenu(menu);
};
const logoutChange = (msg) => {
  // $loading.open({ text: '加载中...' })
  // loading.value = true
  const loading = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
  logout()
    .then((res) => {
      ElMessage({
        type: "success",
        message: msg,
        duration: 1 * 1000,
      });
      loading.close();
      setTimeout(() => {
        removeToken();
        // $loading.close()
        userStores.crearStore();
        store.crearStore();
      }, 1000);
    })
    .catch((error) => {
      loading.close();

      // $loading.close()
    });
};
const handlerClick = (item) => {
  console.log(item);
};
const submitForm = () => {
  loading.value = true;
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      const serviceLoading = ElLoading.service({
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      updatePassword(ruleForm.value)
        .then((res) => {
          dialogVisible.value = false;
          serviceLoading.close();
          logoutChange("操作成功,请重新登录");
        })
        .catch((error) => {
          serviceLoading.close();
        });
      loading.value = false;
      return;
    } else {
      loading.value = false;
    }
  });
};
</script>
<style scoped lang="less">
.header-container {
  width: 100%;
  height: 160px;
  display: flex;
  justify-content: center;
  // align-items: center;
  background: rgba(0, 0, 0, 0.5) url("@/assets/image/layout/group.png");

  background-size: cover;
  // background-position: center;
  background-repeat: no-repeat;
  position: relative;

  .header-cetner{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80%;
    height: 50px;
    margin-top: 30px;
    .el-image{
      height: 6vh;
    }
  }
  .header-bottom{
   position: absolute;
    bottom: 0;
    color: #fff;
    display: flex;
    flex-direction: row;
    padding: 5px;
    box-sizing: border-box;
    .bottom-menu{
      border-right: 2px solid red;
      padding: 5px 10px;
      cursor: pointer;
    }
    .el-menu-demo{
      height: 5vh;
      padding-top: 5px ;
      box-sizing: border-box;
      .el-menu-item{
        width: 8vw;
        border-right: 2px solid red;
      }
      .el-sub-menu{
        border-right: 2px solid red;

      }
    }
    .el-menu-item:last-child {
      border: none;
    }
    .el-sub-menu:last-child {
      border: none;
    }
  }
  .header-right{
    position: absolute;
    right: 0;
    bottom: 10px;
    p{
      color: #fff;
    }
  }
}
.el-menu{
  border-bottom: none !important; /* 可选：去掉下边框 */

}

.backImg {
  background: rgba(0, 0, 0, 0.5) url("@/assets/image/header.png");
  background-size: cover;
  // background-position: center;
  background-repeat: no-repeat;
}
.noImg {
  position: absolute;
  width: 100%;
  top: 0;
}
.header-left {
  height: 100%;
  display: flex;
  flex: 1;
  align-items: center;
  padding-left: 5vw;
  span{
    margin-left: 10px
  }
  .icon {
    width: 45px;
    height: 100%;
  }
  .logo-text {
    color: #000;
    margin-left: 20px
    // font-size: 20px;
  }
}
.header-search{
  display: flex;
  align-items: center;
  padding: 2px;

  ::v-deep {
  .el-input__wrapper{
    border-radius: 20px;
  }
}
}
.check-active{
  background: #D81E16;
}
.active{
  background: #D81E16;

}
:deep(.el-menu-item.is-active) {
  background: #C91111 !important;
}


.header-home{
  cursor: pointer;
  display: flex;
  align-items: center
}
.flex-box {
  display: flex;
  align-items: center;
  padding-right: 10px;
  p {
    margin: 0 5px;
  }
}

::v-deep .el-button:focus {
  outline: none;
}
.flex-box {
  border: none; /* 确保没有边框 */
}
::v-deep .el-dropdown {
  border: none; /* 确保没有边框 */
}
.el-avatar {
  background: #fff;
  padding: 4px;
}

.header-log{
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  width: 100%;
  height: 20vh;
  background: red;



}
</style>
