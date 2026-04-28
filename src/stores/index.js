
import { createPinia } from 'pinia'
const store  = createPinia()

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
store.use(piniaPluginPersistedstate); // 注册插件
export default store
