<template>
  <div class="header-container" :class="[showBacImg ? 'backImg' : 'noImg']">
    <div class="header-left" @click="collapseChange" v-loading="loading">
      <!-- <el-image   style="width: 26px; height: 26px" fit="cover" alt="首页" :src="emblemImg" @click="toHome"/>

      <h3  class="logo-text"
        >全省党政专用通信业务知识学习系统</h3
      > -->
      <el-image fit="cover" alt="首页" :src="logo" />
    </div>
    <div class="header-search">
      <!-- <el-input v-model="searchValue" size="mini" placeholder="输入关键字搜索" v-if="!showBacImg" /> -->
      <el-input
        v-model="searchValue"
        style="max-width: 600px; min-width: 300px"
        placeholder="输入资料名称搜索"
        @keyup.enter="searchChange"
        suffix-icon="Search"
        v-if="needHomePage && !showBacImg"
      >
      </el-input>
      <!-- <el-button icon="search" size="mini"  type="default"  v-if="!showBacImg"  @click="searchChange">搜索</el-button> -->
    </div>
    <div class="header-home" v-if="needHomePage && showBacImg">
      <el-tooltip class="item" effect="dark" content="首页" placement="bottom">
        <el-image
          style="width: 26px; height: 26px"
          fit="cover"
          alt="首页"
          :src="homeImg"
          @click="toHome"
        />
      </el-tooltip>
      <!-- <el-button  icon="HomeFilled"size="mini"  ></el-button>
      <el-button type="primary" icon="HomeFilled" /> -->
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

import BaseDialog from "@/components/BaseDialog.vue";
import PointsDialog from "@/components/module/PointsDialog.vue";
import avatarImg from "@/assets/image/user4.png";
import homeImg from "@/assets/image/home.png";
import emblemImg from "@/assets/image/home/emblem.png";

import { removeToken } from "@/utils/auth";

import { storeToRefs } from "pinia";
const { isCollapse, crearStore, activeIndex } = storeToRefs(menuStore()); //引入store
const $loading = inject("$loading"); // 注入全局 Loading
const pointsRef = ref("");
const ruleFormRef = ref();
const searchValue = ref("");
const collapseChange = () => {
  // 设置store.state.isCollapse的属性
  isCollapse.value = !isCollapse.value;
};

const props = defineProps({
  showBacImg: {
    type: Boolean,
    default: () => true,
  },
  title: {
    type: String,
    default: () => "新增子部门",
  },
});
const loading = ref(false);
const userStores = userStore();
const { userName } = userStores.userInfo.user;
const { enableUserPoints } = userStores.userInfo;
const { needHomePage } = userStores.userInfo;

const userPoints = ref(false);
const router = useRouter();
import logo from "@/assets/image/layout/logo.png";
const examDisabled = ref(false);

watch(
  () => enableUserPoints,
  (val) => {
    if (val == 1) {
      userPoints.value = true;
    }
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
    if(getExamStatus()){
      ElMessage({
        message: "正在答题中，请不要切换页面",
        type: "error",
        duration: 1 * 1000,
      });
    } else {
      router.push({ path: "/home" });
    }

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
const handleVisibleChange = (visible) => {
  if (visible) {
   if( getExamStatus()) {
      examDisabled.value = true;
   }
  }
};

const getExamStatus = () => {
  const examStatus = localStorage.getItem("examStatus");
  let examinationStatus = false;
  if (JSON.stringify(examStatus) !== "null") {
    examinationStatus = JSON.parse(examStatus).examinationStatus;
  }

  return  examinationStatus
};
</script>
<style scoped lang="less">
.header-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
  line-height: 40px;
  .header-right {
    width: 150px;
    padding: 10px;
    box-sizing: border-box;
    p{
      color: #fff;
    }
  }
}
.backImg {
  // background: rgba(0, 0, 0, 0.5) url("@/assets/image/header.png");
  // background: rgba(0, 0, 0, 0.5) url("@/assets/image/layout/heng.png");
  background: #cc0117;

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
  .el-image{
    height: 25px;
    width: 400px;
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
</style>
