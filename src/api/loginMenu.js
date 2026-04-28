// const adminRole = [
//   {
//     path: "/learning",
//     meta: {
//       id: "4",
//       name: "知识管理",
//       icon: "grid",
//       description: "这是第一个页面",
//       path: "/learning",
//     },
//     name: "知识管理",
//     component: () => import("@/views/learning/enter.vue"),
//     url: "learning/enter",

//     children: [
//       {
//         path: "/learning/enter",
//         name: "资料录入",
//         meta: {
//           id: "1-1",
//           name: "资料录入",
//           icon: "Comment",
//           path: "/learning/enter",
//           description: "这是第一个页面",
//         },
//         component: () => import("@/views/learning/enter.vue"),
//       },
//       {
//         path: "/learning/distribute",
//         name: "资料分发",
//         meta: {
//           id: "1-2",
//           name: "资料分发",
//           icon: "Comment",
//           path: "/learning/distribute",
//           description: "这是第一个页面",
//         },
//         component: () => import("@/views/learning/distribute.vue"),
//       },
//     ],
//   },

//     {
//         path: "/examination",  //路径
//         name: "考试",  //名称
//         url: "examination/index",  //页面路径
//         meta: {
//           id: "1",
//           name: "考试",
//           icon: "Comment",    //图标
//           path: "/examination",
//           description: "这是第一个页面",
//         },
//         // component: () => import("@/views/examination/index.vue"),
//       },
//       {
//         path: "/study",
//         name: "个人学习",
//         url: "study/index",
//         meta: {
//           id: "2",
//           name: "个人学习",
//           icon: "Comment",
//           path: "/study",
//           description: "这是第一个页面",
//         },
//         // component: () => import("@/views/study/index.vue"),
//       },
//       {
//         path: "/system",
//         name: "个人设置",
//         url: "system/index",
//         meta: {
//           id: "3",
//           name: "个人设置",
//           icon: "Tools",
//           path: "/system",
//           description: "这是第一个页面",
//         },
//         // component: () => import("@/views/system/index.vue"),
//       },
//       {
//         path: "/system",
//         meta: {
//           id: "4",
//           name: "权限管理",
//           icon: "grid",
//           description: "这是第一个页面",
//           path: "/system",
//         },
//         name: "权限管理",
//         component: () => import("@/views/system/user.vue"),
//         url: "system/user",
//         children: [
//           {
//             path: "/system/user",
//             name: "菜单管理",
//             meta: {
//               id: "1-1",
//               name: "菜单管理",
//               icon: "Comment",
//               path: "/system/user",
//               description: "这是第一个页面",
//             },
//             component: () => import("@/views/system/user.vue"),
//           },
//         ],
//       },
//       {
//         path: "/pageOne",
//         name: "pageOne",
//         meta: {
//           id: "5",
//           name: "pageOne",
//           icon: "Comment",
//           path: "/pageOne",
//           description: "这是第一个页面",
//         },
//         component: () => import("@/views/pageOne/index.vue"),
//         children: [],
//       },
// ]

const adminRole = [

  {
    path: "/system",
    meta: {
      id: "1",
      name: "系统设置",
      icon: "grid",
      description: "这是第一个页面",
      path: "/system/index",
    },
    name: "系统设置",
    component: () => import("@/views/system/index.vue"),
    url: "system/index",
    children: [
      {
        path: "/system/user",
        name: "人员管理",
        meta: {
          id: "1-1",
          name: "人员管理",
          icon: "Comment",
          path: "/system/user",
          description: "这是第一个页面",
        },
        component: () => import("@/views/system/user.vue"),
        url: "system/user",

      },
      {
        path: "/system/menu",
        name: "菜单管理",
        meta: {
          id: "1-1",
          name: "菜单管理",
          icon: "Comment",
          path: "/system/menu",
          description: "这是第一个页面",
        },
        component: () => import("@/views/system/menu.vue"),
        url: "system/menu",

      },
      {
        path: "/system/role",
        name: "权限管理",
        meta: {
          id: "1-1",
          name: "权限管理",
          icon: "Comment",
          path: "/system/role",
          description: "这是第一个页面",
        },
        url: "system/role",
        component: () => import("@/views/system/role.vue"),
      },
    ],
  },
]
 const adminRole1 = [

      {
        path: "/study",
        name: "个人学习",
        url: "study/index",
        meta: {
          id: "2",
          name: "个人学习",
          icon: "Comment",
          path: "/study",
          description: "这是第一个页面",
        },
        // component: () => import("@/views/study/index.vue"),
      },
      {
        path: "/system",
        name: "个人设置",
        url: "system/index",
        meta: {
          id: "3",
          name: "个人设置",
          icon: "Tools",
          path: "/system",
          description: "这是第一个页面",
        },
        // component: () => import("@/views/system/index.vue"),
      },
      {
        path: "/system",
        meta: {
          id: "4",
          name: "权限管理",
          icon: "grid",
          description: "这是第一个页面",
          path: "/system",
        },
        name: "权限管理",
        component: () => import("@/views/system/user.vue"),
        url: "system/user",
        children: [
          {
            path: "/system/user",
            name: "菜单管理",
            meta: {
              id: "1-1",
              name: "菜单管理",
              icon: "Comment",
              path: "/system/user",
              description: "这是第一个页面",
            },
            component: () => import("@/views/system/user.vue"),
          },
        ],
      },
]


export default{
    adminRole,
    adminRole1
}