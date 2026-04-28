
import layout from '@/views/Main.vue'
export default [
  {
    path: "/car",
    name: "用车管理",
    component: layout,
    sort: 3,
    requiresAuth: true,
    meta: {
      title: "car",
      icon: "el-icon-user-solid",
      roule: ['22', '11', '44', '33'],
      icon: 'el-icon-truck'
    },
    //在这里将定义需要菜单显示的路由，并在menus.vue中去到
    children: [
      // {
      //   path: "/car/manage",
      //   name: "派车审批",
      //   component: () => import("@/views/car/manage/index.vue"),
      //   meta: {
      //     title: "car",
      //     icon: "el-icon-truck",
      //     requiresAuth: true,
      //     roule: ['22', '33'],
      //   }

      // }

    ]
  }
];
