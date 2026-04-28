
export default {
    plugins: {
      'autoprefixer': {
        overrideBrowserslist: [
          '> 1%', // 全球使用率大于1%的浏览器版本
          'last 2 versions', // 所有浏览器的最新两个版本
          'not dead', // 排除不再有官方支持的浏览器
          'Firefox >= 52', // 明确兼容 Firefox 52
        ],
        grid: 'autoplace' // 为 CSS Grid 布局添加自动放置的前缀
      }
    }
  };