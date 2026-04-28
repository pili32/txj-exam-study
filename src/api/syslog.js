
import request from "@/utils/request";


//分页查询试题列表(乱序返回)
export function pageListLogApi(data) {
  return request({
    url: "/business/sysLoginLog/pageListWithCondition",
    method: "post",
    data,
  });
}


//系统用户带条件查询日志列表
export function pageListOperLogApi(data) {
  return request({
    url: "/business/sysOperLog/pageListWithCondition",
    method: "post",
    data,
  });
}


//系统管理员分页带条件查询系统管理员操作列表
export function pageListAdminLogApi(data) {
  return request({
    url: "/business/sysAdminRecord/pageListWithCondition",
    method: "post",
    data,
  });
}



//授权管理员分页带条件查询系统管理员操作列表
export function pageListAuditLogApi(data) {
  return request({
    url: "/business/audit/pageOperationList",
    method: "post",
    data,
  });
}
