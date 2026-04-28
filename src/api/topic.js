import request from "@/utils/request";


//获取部门中的机构树
export function getDeptTreeApi(data) {
  return request({
    url: "/business/sysDept/getDeptTree?id="+data,
    method: "get",
  });
}


// 用户管理
//用户添加分类
export function saveApi(data) {
  return request({
    url: "/business/questionCategory/save",
    method: "post",
    data,
  });
}

//获取分类树
export function categoryTreeApi(data) {
  return request({
    url: "/business/questionCategory/categoryTree?id="+data,
    method: "get",
  });
}

//根据主键id查询分类信息
export function queryByIdApi(data) {
    return request({
      url: "/business/questionCategory/queryById?id="+data,
      method: "get",
    });
  }

//根据主键id删除分类信息
export function deleteApi(data) {
  return request({
    url: "/business/questionCategory/delete?id="+data,
    method: "get",
  });
}


//修改分类信息
export function updateApi(data) {
  return request({
    url: "/business/questionCategory/update",
    method: "post",
    data,

  });
}

//用户管理查询列表接口
export function pageListApi(data) {
  return request({
    url: "/business/question/pageListWithCondition",
    method: "post",
    data,
  });
}


//添加试题
export function saveQuestionApi(data) {
  return request({
    url: "/business/question/save",
    method: "post",
    data,
  });
}


//根据主键id查询分类信息
export function questionQueryByIdApi(data) {
  return request({
    url: "/business/question/queryById?id="+data,
    method: "get",
  });
}

//角色管理获取用户角色id集合
export function questionUpdate(data) {
  return request({
    url: "/business/question/update",
    method: "post",
    data
  });
}


//删除试题
export function questiondelete(data) {
  return request({
    url: "/business/question/delete?id="+data,
    method: "get",
  });
}
