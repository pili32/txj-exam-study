

import request from "@/utils/request";
//授权管理员审批分页查询待审核/已通过/不通过列表

export function auditPageList(data) {
    return request({
      url: "/business/audit/pageAuditList",
      method: "post",
      data,
    });
  }


//进行审核
export function doAuditApi(module,data) {
  const {auditStatus,id,relatedRecordId} = data
  return request({
    // url: "/business/audit/doAudit/"+module,
    url: `/business/audit/doAudit/${module}?auditStatus=${auditStatus}&id=${id}&relatedRecordId=${relatedRecordId}`,
    method: "get",
    data
  });
}