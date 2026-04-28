import request from "@/utils/request";

//菜单管理获取菜单树实体对象

export function sysDictionary(data) {
    return request({
      url: "/business/sysDictData/queryByTypeName?typeName="+data,
      method: "get",
    });
  }
