
import request from "@/utils/request";


//获取用户累计积分和当日积分
export function feedBackSave(data) {
  return request({
    url: "/business/feedBack/save",
    method: "post",
    data
  });
}

//分页查询试题列表(乱序返回)
export function pageListWithCondition(data) {
  return request({
    url: "/business/feedBack/pageListWithCondition",
    method: "post",
    data,
  });
}

//分页查询试题列表(乱序返回)
export function queryById(data) {
  return request({
    url: "/business/feedBack/queryById?id="+data,
    method: "get",
  });
}
//回复反馈
export function feedBackReply(data) {
  return request({
    url: "/business/feedBack/reply",
    method: "post",
    data
  });
}