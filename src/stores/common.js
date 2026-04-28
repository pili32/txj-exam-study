
import { defineStore, createPinia } from "pinia";
export const systemStore= defineStore("commomState", {
  state: () => ({
    securityData:'',
    documentSecurityData:'',
    questionFileData:'',
    setStudyTypeData:'',
    examineTotal:{
      waitTotal:0,
      passTotal:0,
      failTotal:0,
    }
  }),
  actions: {
    setData(value){
        this.securityData = value
    },
    setDocument(value){
      this.documentSecurityData = value

    },
    setQuestionFile(value){
      this.questionFileData = value

    },
    setStudyType(value){
      this.setStudyTypeData = value

    },
    setTotal(type,total){

      if(type == 1) {
        this.examineTotal.waitTotal = total

      } else if (type == 2) {
        this.examineTotal.passTotal = total
      } else {
        this.examineTotal.failTotal = total

      }
    }
    //更新tags的状态
  },
  persist: {
    enabled: true, // 开启持久化
  },
});

const store = createPinia();
export default store;
