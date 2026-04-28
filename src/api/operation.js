import request from "@/utils/request";

//系统设置公共接口，根据type分类型，add,delete,update
export function submitAuditApi(type, data) {
  return request({
    url: "/business/audit/submitAudit/" + type,
    method: "post",
    data,
  });
}


//操作记录分页
export function adminPageList(data) {
    return request({
      url: "/business/sysAdminRecord/pageListWithCondition",
      method: "post",
      data,
    });
  }
