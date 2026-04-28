import request from "@/utils/request";

//菜单管理获取菜单树实体对象

export function sysDictionary(data) {
    return request({
      url: "/business/annex/delete?id="+data,
      method: "get",
    });
  }



//删除数据
export function deleteFileApi(data) {
    return request({
      url: "/business/annex/delete?id="+data,
      method: "get",
    });
  }