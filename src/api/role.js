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
        path: "/system/dept",
        name: "部门管理",
        meta: {
          id: "1-1",
          name: "部门管理",
          icon: "Comment",
          path: "/system/dept",
          description: "这是第一个页面",
        },
        url: "system/dept",
        component: () => import("@/views/system/dept.vue"),
      },
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
        path: "/system/role",
        name: "角色管理",
        meta: {
          id: "1-1",
          name: "角色管理",
          icon: "Comment",
          path: "/system/role",
          description: "这是第一个页面",
        },
        url: "system/role",
        component: () => import("@/views/system/role.vue"),
      },
    ],
  },
  {
    path: "/operation",
    meta: {
      id: "2",
      name: "操作记录",
      icon: "grid",
      description: "这是操作记录页面",
      path: "/operation",
    },
    name: "操作记录",
    component: () => import("@/views/operation/index.vue"),
    url: "operation/index",
  }
  ]
const   adminRole1 = []



  export default{
      adminRole,
      adminRole1
  }