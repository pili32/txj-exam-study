
import { defineStore, createPinia } from "pinia";
export const examStore = defineStore("examStatus", {
  state: () => ({
    examinationStatus:false  //设置当前是否考试的状态
  }),
  actions: {
    selectMenu(state) {
        this.examinationStatus =state
      },
  },
  persist: {
    enabled: true, // 开启持久化

  },
});

const store = createPinia();
export default store;
