import request from "@/utils/request";

//系统设置公共接口，根据type分类型，add,delete,update
export function submitAuditApi(type, data) {
  return request({
    url: "/business/audit/submitAudit/" + type,
    method: "post",
    data,
  });
}

//菜单管理查询列表接口
export function pageListWithConditionApi(data) {
  return request({
    url: "/business/sysMenu/pageListWithCondition",
    method: "post",
    data,
  });
}
//菜单管理根据id查详情
export function queryByIdApi(data) {
  return request({
    url: "/business/sysMenu/queryById?id="+data,
    method: "get",
  });
}


// 角色管理
//菜单管理查询列表接口
export function userRolePageList(data) {
  return request({
    url: "/business/sysRole/pageListWithCondition",
    method: "post",
    data,
  });
}

//角色管理查询列表接口
export function sysRoleDelete(data) {
  return request({
    url: "/business/sysRole/delete",
    method: "post",
    data,
  });
}


//角色管理查询列表接口
export function getMenuTree(data) {
  return request({
    url: "/business/sysMenu/MenuTree",
    method: "get",
  });
}

//角色管理查询列表接口
export function getMenusByRole(data) {
  return request({
    url: "/business/roleMenu/getMenusByRole?id="+data,
    method: "get",
  });
}


//获取部门中的机构树
export function getDeptTreeApi(root=0) {
  return request({
    url: "/business/sysDept/getDeptTree?isGetFromRoot="+root,
    method: "get",
  });
}

//获取机构树的部门
export function deptQueryById(data) {
  return request({
    url: "/business/sysDept/queryById?id="+data,
    method: "get",
  });
}


//带条件查询部门列表
export function pageListWithCondition(data) {
  return request({
    url: "/business/sysDept/pageListWithCondition",
    method: "post",
    data,
  });
}




// 用户管理
//用户管理查询列表接口
export function userDeptPageList(data) {
  return request({
    url: "/business/sysUser/pageListWithCondition",
    method: "post",
    data,
  });
}


//用户积分统计列表
export function userPointsList(data) {
  return request({
    url: "/business/sysUser/userPointsList",
    method: "post",
    data,
  });
}

//用户管理查询列表接口
export function sysUserQueryById(data) {
  return request({
    url: "/business/sysUser/queryById?id="+data,
    method: "get",
  });
}


//菜单管理获取菜单树
export function getSysMenuTree() {
  return request({
    url: "/business/sysMenu/MenuTree",
    method: "get",
  });
}

//菜单管理获取菜单树实体对象
export function getMenuQueryById(data) {
  return request({
    url: "/business/sysMenu/queryById?id="+data,
    method: "get",
  });
}


//角色管理查询角色列表
export function getUserList() {
  return request({
    url: "/business/sysRole/getList",
    method: "get",
  });
}


//角色管理获取用户角色id集合
export function getUserRoleList(id) {
  return request({
    url: "/business/userRole/getUserRoleList?userId="+id,
    method: "get",
  });
}

//角色管理获取用户角色id集合
export function roleQueryById(id) {
  return request({
    url: "/business/sysRole/queryById?id="+id,
    method: "get",
  });
}



//角色管理获取用户角色id集合
export function updatePassword(data) {
  return request({
    url: "/business/sysUser/modifyPassword",
    method: "post",
    data
  });
}


//带条件查询SysDictType列表
export function getSysDictType(data) {
  return request({
    url: "/business/sysDictType/pageListWithCondition",
    method: "post",
    data,
  });
}



//添加字典类别
export function sysDictTypeSave(data) {
  return request({
    url: "/business/sysDictType/save",
    method: "post",
    data,
  });
}

//修改SysDictType对象
export function sysDictTypeUpdate(data) {
  return request({
    url: "/business/sysDictType/update",
    method: "post",
    data,
  });
}


//查询SysDictType实体对象
export function dictTypeQueryById(id) {
  return request({
    url: "/business/sysDictType/queryById?id="+id,
    method: "get",
  });
}


//删除SysDictType对象
export function dictTypeDelete(id) {
  return request({
    url: "/business/sysDictType/delete?id="+id,
    method: "get",
  });
}


//带条件查询SysDictType列表
export function sysDictDataPageList(data) {
  return request({
    url: "/business/sysDictData/pageListWithCondition",
    method: "post",
    data,
  });
}
