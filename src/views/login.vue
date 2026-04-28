<template>
  <div class="login-container">
    <el-image fit="cover" alt="首页" :src="logo" />
    <!-- <h1 class="login-title">全省党政专用通信业务知识学习系统</h1> -->

    <el-card shadow="hover">
      <div class="login-box">
        <el-form
          :model="ruleForm"
          label-width="auto"
          ref="ruleFormRef"
          :rules="rules"
          style="max-width: 600px"
        >
          <el-form-item label="账号" prop="account">
            <el-input v-model="ruleForm.account" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="ruleForm.password"
              placeholder="请输入密码"
              type="password"
              @keyup.enter="onSubmit"
            />
          </el-form-item>

          <el-form-item>
            <div class="botton-box">
              <el-button
                type="primary"
                color="#c91111"
                @click="onSubmit"
                :loading="loginLoading"
                >登录</el-button
              >
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  toRaw,
  onBeforeUnmount,
  onUnmounted,
  onMounted,
} from "vue";
import { storeToRefs } from "pinia";
import { sysDictionary } from "@/api/common";
import { getFileSec } from "@/api/user";
import { menuStore } from "@/stores/menu.js";

import { useRouter, useRoute } from "vue-router";
import loginMenu from "@/api/role";

import { userStore } from "@/stores/user.js";
import { systemStore } from "@/stores/common.js";
import logo from "@/assets/image/layout/logo.png";

const { token, activeIndex, routerList } = storeToRefs(menuStore());
import { ElLoading } from "element-plus";

const store = menuStore();
const loginStore = userStore();

const conmmonStore = systemStore();
const index = ref(1);
const ruleForm = reactive({
  account: "",
  password: "",
});
const router = useRouter();


//验证账号
const validateaAccount = (value) => {
  if (!value) {
    callback(new Error("请输入账号"));
  } else {
    callback();
  }
};
//验证密码
const validatepassword = (value) => {
  if (!value) {
    callback(new Error("请输入密码"));
  } else {
    callback();
  }
};
const ruleFormRef = ref(null);
const loginLoading = ref(false);
const rules = reactive({
  account: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    // { min: 4, message: "密码长度不能小于6位", trigger: "blur" },
  ],
});
onMounted(() => {
  localStorage.clear();
    sessionStorage.clear();
});

onUnmounted(() => {

});


const onSubmit = async () => {
  loginLoading.value = true;
  await ruleFormRef.value.validate((valid) => {
    let loginApi = ""
    if (valid) {
      if (ruleForm.account === "admin") {
        loginApi = loginMenu.adminRole;
      } else {
        loginApi = loginMenu.adminRole1;
      }
      // const loading = ElLoading.service({
      //   lock: true,
      //   text: "加载中...",
      //   background: "rgba(0, 0, 0, 0.7)",
      // });
      loginStore
        .login(ruleForm)
        .then((res) => {
          loginLoading.value = true;

          getSysDictionary();
          getDocumentDictionary();
          getQuestionDictionary();
          getStudyDictionary();

          loading.close()
        })
        .catch((error) => {
          loginLoading.value = false;

          //   ElMessage({
          //   message: error.msg,
          //   type: 'error',
          //   duration: 5 * 1000
          // })
        });
    } else {
      loginLoading.value = false;
      return false;
    }
  });
};
const getSysDictionary = () => {
  sysDictionary("人员密级")
    .then((res) => {
      if (res.code == 200) {
        conmmonStore.setData(res.data);
      }
    })
    .catch((error) => {});
};
const getDocumentDictionary = () => {
  getFileSec()
    .then((res) => {
      if (res.code == 200) {
        conmmonStore.setDocument(res.data);
      }
    })
    .catch((error) => {});
};

const getQuestionDictionary = () =>{
  sysDictionary("题目所属文件")
    .then((res) => {
      if (res.code == 200) {
        conmmonStore.setQuestionFile(res.data);
      }
    })
    .catch((error) => {});
}
const getStudyDictionary = () =>{
  sysDictionary("学习资料类别")
    .then((res) => {
      if (res.code == 200) {
        conmmonStore.setStudyType(res.data);
      }
    })
    .catch((error) => {});
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  width: 100%;
  //   background-color: #4982fc;
  text-align: center;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  // justify-content: center;
  padding-top: 20vh;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 100%;
  background: #409eff;
  flex-direction: column;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.5) url("@/assets/image/layout/layout.png");
  background-size: cover;
  // background: rgba(0, 0, 0, 0.5) url("@/assets/image/bg.png");

  background-position: center;
  background-repeat: no-repeat;
  .el-image{
    width: 50%;
    margin-bottom: 5vh;
  }
}
.login-box {
  border-radius: 6px;
  background: #fff;
  width: 300px;
  padding: 20px 10px 10px 10px;
  color: #000;
  .title {
    text-align: center;
    color: #707070;
  }
}
.title-container {
  text-align: center;
  font-size: 26px;
  color: #eee;
  margin: 0px auto 40px auto;
  text-align: center;
  font-weight: bold;
}
.svg-container {
  padding: 6px 5px 6px 15px;
  vertical-align: middle;
  width: 30px;
  display: inline-block;
}
.el-input-group__prepend {
  background: #fff;
  border-right: 0;
  padding: 0 10px;
}
.login-button {
  width: 100%;
  background: #4982fc;
}
.botton-box {
  width: 100%;
  text-align: center;
  button {
    color: #fff;
    width: 300px;
  }
}
h1 {
  color: #000;
  // background: -webkit-linear-gradient(left, #ff7e5f, #feb47b);
  // -webkit-background-clip: text;
  // -webkit-text-fill-color: transparent;
  // color: #ff7e5f; /* Fallback color for non-WebKit browsers */
}
</style>
