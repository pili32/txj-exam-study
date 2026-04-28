import request from "@/utils/request";

//分页带条件查询列表
export function pageListWithConditionApi(data) {
  return request({
    url: "/business/article/pageListWithCondition",
    method: "post",
    data,
  });
}

//分页带条件查询列表
export function articleSave(data) {
  return request({
    url: "/business/article/save",
    method: "post",
    data,
  });
}

//分页带条件查询列表
export function updateSave(data) {
  return request({
    url: "/business/article/update",
    method: "post",
    data,
  });
}

//根据主键查询文章信息
export function queryByIdApi(data) {
  return request({
    url: "/business/article/queryById?id=" + data,
    method: "get",
  });
}

//根据主键查询文章信息
export function releaseApi(data) {
  return request({
    url:
      "/business/article/release?id=" +
      data.id +
      "&releaseStatus=" +
      data.releaseStatus,
    method: "get",
  });
}

//删除
export function deleteApi(data) {
  return request({
    url: "/business/article/delete?id=" + data,
    method: "get",
  });
}

//查询个人的可以查看的文章列表
export function selfArticlePageListApi(data) {
  return request({
    url: "/business/article/selfArticlePageList",
    method: "post",
    data,
  });
}

//获取已发布的资料文件列表（ofd或者pdf格式）
export function getArticleAnnexWithCondition() {
  return request({
    url: "/business/article/getArticleAnnexWithCondition",
    method: "get",
  });
}

//获取已发布的资料文件列表（ofd或者pdf格式）
export function readingStatistics(data) {
  return request({
    url: "/business/article/readingStatistics",
    method: "post",
    data,
  });
}

//获取已发布的资料文件列表（ofd或者pdf格式）
export function homeArticlePageList(data) {
  return request({
    url: "/business/article/homeArticlePageList",
    method: "get",
  });
}

//首页滚动查看人的可以查看的已发布文章列表（当前时间1个月内）
export function homeArticleRollList(data) {
  return request({
    url: "/business/article/homeArticleRollList",
    method: "get",
  });
}