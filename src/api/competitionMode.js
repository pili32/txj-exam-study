

import request from "@/utils/request";
//授权管理员审批分页查询待审核/已通过/不通过列表

export function raceSave(data) {
    return request({
      url: "/business/paperTemplate/raceSave",
      method: "post",
      data,
    });
  }


  //根据主键id查询试卷模板详情
export function paperqQueryById(data) {
  return request({
    url: "/business/paperTemplate/queryById?id="+data,
    method: "get",
  });
}




//根据结束时间查询指定的考试列表
export function getQueryExamList(data) {
  return request({
    url: "/business/exam/queryExamListByEndTime",
    method: "post",
    data
  });
}



//预分页查询自己创建的考试
export function saveAndRelease(data) {
  return request({
    url: "/business/exam/saveAndRelease",
    method: "post",
    data,
  });
}


//根据结束时间查询指定的考试列表
export function queryExamList(data) {
  return request({
    url: "/business/exam/queryExamList",
    method: "post",
    data
  });
}
