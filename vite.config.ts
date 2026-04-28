import { defineConfig } from "vite";

import legacy from "@vitejs/plugin-legacy";
import autoprefixer from "autoprefixer";
//自动导入element-plus-ui
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000, // 指定端口号
    proxy: {
      "/api": {
        target: "http://192.168.1.105:9999", // 代理目标地址
        changeOrigin: true, // 是否改变源地址
        rewrite: (path) => path.replace(/^\/api/, ""), // 重写路径
      },
    },
    host: "0.0.0.0",
  },
  plugins: [
    vue(),

    legacy({
      targets: ["firefox 52"], // 明确指定需要兼容的浏览器版本
      modernPolyfills: true, // 为现代浏览器也提供必要的 polyfill
      // 可以根据需要额外指定需要 polyfill 的特性
      /*
      polyfills: [
        'es.array.find',
        'es.promise',
        'es.object.assign',
        // ... 其他你项目中用到了且目标浏览器不支持的 API
      ],
      */
    }),

    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  build: {
    // 确保 CSS 目标也与旧浏览器兼容
    cssTarget: ["firefox52"],
  },
  // CSS 相关配置
  css: {
    postcss: {
      // 插件配置移到了单独的 postcss.config.cjs 文件
      // 这样避免与 Vite 配置中的模块系统冲突
    },
  },
  //这个resolve是添加的别名，方便引入时使用“@/来代替从src引入”
  resolve: {
    alias: [
      {
        find: "@",
        replacement: "/src",
      },
    ],
  },
});
