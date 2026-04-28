<template>
  <div class="layout-box">
    <header></header>
    <div :style="{ height: height + 'px' }" class="layout-form">
      <h2>{{ ruleForm.title }}</h2>
      <div class="layout-content" >
        <span>发稿时间：{{ ruleForm.releaseTime }}</span>
        <span> 来源：{{ ruleForm.createUserName }}</span>
        <div class="font-size">
          <span @click="fontSizeChange(1.2)">调整字体：[ 大 </span>
          <span @click="fontSizeChange(1)">中 </span>
          <span @click="fontSizeChange(0.8)"> 小 ] </span>
        </div>
        <span>密级：{{ filterSecurity(ruleForm.security) }} </span>
      </div>
      <el-divider border-style="dotted" />


     <div  class="content"  :style="{ fontSize: fontSize + 'px' }" >
      <div

          v-html="ruleForm.content"
        ></div>
     </div>
      <el-divider border-style="dotted" />
      <!-- <div class="flex-user" v-if="userCheck">

        <div class="user-check" :style="{fontSize:fontSize+'px'}">
          <div v-for="item in userData">

            <span  v-if="ruleForm.readRange == 30">{{ item.userName }}</span>
            <span v-else>{{ item.deptName }}</span>
          </div>
        </div>
      </div> -->
      <div class="flex-user" :style="{ fontSize: fontSize + 'px' }" v-if="fileList.length > 0">
        <div>附件列表</div>

        <div class="upload-check" >
          <div v-for="item in fileList" class="flex gap-2">
            <div class="upload-content" @click="downloadHandler(item)">
              <span>{{ item.name }}</span>
              <!-- <el-icon><Delete /></el-icon> -->
            </div>
          </div>
        </div>
      </div>
      <el-button type="primary" @click="cancelChange()">关闭</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted,inject  } from "vue";
import { storeToRefs } from "pinia";
import { getToken } from "@/utils/auth";
import { queryByIdApi,  } from "@/api/knowledge";
import { getCurrentInstance } from "vue";

const { documentSecurityData } = storeToRefs(systemStore()); //引入store
import { systemStore } from "@/stores/common.js";
const $loading = inject('$loading') // 注入全局 Loading
defineProps({
  height: { type: Number, default: null },
  securityData: { type: Array, default: [] },
  mode: { type: String, default: "default" }, // 'default' 或 'simple'
});

const fileList = ref([]);
const fontSize = ref(18);
const apiUrl = ref(import.meta.env.VITE_API_BASE_URL);
import { useRoute } from "vue-router";
let ruleForm = reactive({
  title: "",
  content: "11",
  security: "",
  readRange: "",
  relatedAnnexIds: [],
  rangeDepts: [],
  rangeUsers: [],
  rangeDepIds: [],
});
const headers = ref({
  Authorization: getToken(), //headers属性中添加token，这个属性是el-upload自带的用来设置上传请求头部
});
const userData = ref([]);

const emit = defineEmits(["childChange"]);
onMounted(() => {
  const route = useRoute();
  const id = route.query.id;
  getData(id);
});
const cancelChange = () => {
    window.close()
};
const getData = (id) => {
  // $loading.open({ text: '加载中...' })

  queryByIdApi(id).then((res) => {

    const { article, range, annex } = res.data;
    ruleForm = article;
    ruleForm.readRange = String(range.readRange);
    if (ruleForm.readRange == "20") {
      ruleForm.rangeDepts = range.rangeDepts;
      userData.value = range.rangeDepts;
    } else {
      ruleForm.rangeUsers = range.rangeUsers;
      userData.value = range.rangeUsers;
    }
    fileList.value = annex;
    // $loading.close()

  });
};


// 删除文件时更新 fileList
const downloadHandler = (item) => {

  const origin =  window.location.origin
  if(item.ext == 'ofd' ||item.ext == 'pdf' ) {

    window.open(origin + "/#/openOfd?id=" + item.id+"&name="+item.name, "_blank");
    return
  } else if (item.ext == 'mp4') {
    window.open(origin + "/#/openVideo?id=" + item.id+"&name="+item.name, "_blank");
    return
  }

  const {name,id} = item
  let url = apiUrl.value+"/business/annex/downLoad?id=" + id;
  downloadFileWithToken(url,name);
};
const downloadFileWithToken = (url,name) => {
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
      a.download = name; // 设置默认文件名
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(downloadUrl); // 释放内存
    }
    xhr.send();
  };

  xhr.send();
};

const filterSecurity = (value) => {
  let val = "";
  if (String(value) && documentSecurityData.value.length > 0) {
    const { valueName } = documentSecurityData.value.find(
      (item) => item.valueCode == String(value)
    );
    val = valueName;
  }
  return val;
};


const fontSizeChange = (val) => {
  const size = 18
  fontSize.value = size * val;
};

</script>

<style scoped lang="less">
.layout-box {
  padding: 10px;
  display: flex;
  justify-content: center;
  color: #000;

}
.layout-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80vw;

}
header {
  display: flex;
  justify-content: center;
  padding: 5px 0;
}
.el-form-item__content {
  align-items: center;
}
.flex-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 29px;
  font-size: 14px;
  div {
    color: #606266;
  }
}
.flex-user {
  display: flex;
  flex-direction: column;
  padding-left: 29px;
  font-size: 14px;
  width: 100%;
  .upload-check{
    color: #409eff;
    cursor: pointer;
    margin: 10px 0;
  }
}
.gap-2 {
  gap: 0.5rem;
}
.flex {
  display: flex;
}
.el-tag {
  margin: 2px;
}
.layout-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  span {
    margin: 0 5px;
  }
}
.content {
  min-height: 200px;
  width: 100%;
}
.font-size {
  span {
    cursor: pointer;
  }
}
</style>
