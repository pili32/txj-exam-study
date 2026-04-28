import request from '@/utils/request'
import loginMenu from "@/api/role"
// export function login(data) {
//     const userInfo ={
//        data:{
//         name:'湛山',
//         phone:'10101',
//         token:'dwdwd5510',
//         menu:loginMenu
//        }
//     }
//     return new Promise((res,req) =>{
//         return res(userInfo)
//     })
// //   return request({
// //     url: '/vue-element-admin/user/login',
// //     method: 'post',
// //     data
// //   })
// }

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}


export function logout(data) {
  return request({
    url: '/logout',
    method: 'get',

  })
}
export function getInfo(token) {
  return request({
    url: '/vue-element-admin/user/info',
    method: 'get',
    params: { token }
  })
}


//获取用户可选择的文件密级列表
export function getFileSec() {
  return request({
    url: '/business/sysUser/getFileSecWithUserSec',
    method: 'get',
  })
}


//根据部门id查询部门下的人员（不含子部门
export function getDeptUserByIdApi(data) {
  return request({
    url: '/business/sysUser/getUserListByDeptId?deptId='+data,
    method: 'get',
  })
}



// import request from '@/utils/request'
// import loginMenu from "@/api/role"


// export function getInfo(token) {
//   return request({
//     url: '/vue-element-admin/user/info',
//     method: 'get',
//     params: { token }
//   })
// }

// export function logout() {
//   return request({
//     url: '/vue-element-admin/user/logout',
//     method: 'post'
//   })
// }
