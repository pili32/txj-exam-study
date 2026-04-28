

import request from "@/utils/request";
//授权管理员审批分页查询待审核/已通过/不通过列表

export function paperSaveApi(data) {
    return request({
      url: "/business/paperTemplate/save",
      method: "post",
      data,
    });
  }


//分页查询自己生成的试卷
export function selfPageList(data) {
  return request({
    url: "/business/paperTemplate/selfPageList",
    method: "post",
    data,
  });
}


//分页查询自己生成的试卷
export function allPageList(data) {
  return request({
    url: "/business/paperTemplate/pageAllList",
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


//删除自己创建的试卷
export function paperDelete(data) {
  return request({
    url: "/business/paperTemplate/delete?id="+data,
    method: "get",
  });
}

//预览查询自己创建的试卷
export function paperPreview(data) {
  return request({
    url: "/business/paperTemplate/preview?id="+data,
    method: "get",
  });
}



//预分页查询自己创建的考试
export function examPageList(data) {
  return request({
    url: "/business/exam/selfPageList",
    method: "post",
    data,
  });
}



//预分页查询自己创建的考试
export function examSave(data) {
  return request({
    url: "/business/exam/save",
    method: "post",
    data,
  });
}




//预分页查询自己创建的考试
export function examQueryById(data) {
  return request({
    url: "/business/exam/queryById?id="+data,
    method: "get",
  });
}

//修改自己创建的考试
export function examRelease(data) {
  return request({
    url: "/business/exam/release?id="+data.id+"&releaseStatus="+data.releaseStatus,
    method: "get",
  });
}


//修改自己创建的考试
export function examUpdate(data) {
  return request({
    url: "/business/exam/update",
    method: "post",
    data
  });
}


//删除自己创建的试卷
export function examDelete(data) {
  return request({
    url: "/business/exam/delete?id="+data,
    method: "get",
  });
}


//预分页查询自己创建的考试
export function examSelfPageList(data) {
  return request({
    url: "/business/userExam/selfParticipationPageList",
    method: "post",
    data,
  });
}


//开始考试
export function userExamAction(data) {
  return request({
    url: "/business/userExam/startExam?id="+data.id+"&templateId="+data.templateId+"&isRetakeExam="+data.isRetakeExam,
    method: "get",
  });
}




//一题一题提交答案详情
export function submitAnswerOneByOne(data) {
  return request({
    url: "/business/userExam/submitAnswerOneByOne",
    method: "post",
    data,
  });
}


//一次性加载用户考试题目
export function getUserExamPaper(userExamId) {
  return request({
    url: "/business/userExam/getUserExamPaper?userExamId="+userExamId,
    method: "get",
  });
}


//结束考试
export function userEndExam(data) {
  return request({
    url: "/business/userExam/endExam",
    method: "post",
    data,
  });
}


//根据examId详细查询用户考试记录（含补考）
export function selfUserExamDetail(data) {
  return request({
    url: "/business/userExam/selfUserExamDetail",
    method: "post",
    data,
  });
}




//根据examId详细查询用户考试记录（含补考）
export function selfUserExamPageList(data) {
  return request({
    url: "/business/userExam/selfUserExamPageList",
    method: "post",
    data,
  });
}


//加载用户考试错题
export function getUserExamWrongQuestion(data) {
  return request({
    url: "/business/userExam/getUserExamWrongQuestion",
    method: "post",
    data
  });
}




//根据examId查询用户考试记录
export function getSelfUserExamDetail(data) {
  return request({
    url: "/business/userExam/selfUserExamDetail",
    method: "post",
    data
  });
}


//历史成绩（考试名称、考试状态、考试结果、成绩
export function selfUserExamHistory(data) {
  return request({
    url: "/business/userExam/selfUserExamHistory",
    method: "post",
    data
  });
}


//从历史成绩点击查看答卷
export function getUserExamWithUserAnswer(data) {
  return request({
    url: "/business/userExam/getUserExamWithUserAnswer",
    method: "post",
    data
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




//根据结束时间查询指定的考试列表
export function getStatistics(data) {
  return request({
    url: "/business/exam/statistics",
    method: "post",
    data
  });
}


//根据结束时间查询指定的考试列表
export function raceExamStatistics(data) {
  return request({
    url: "/business/exam/raceExamStatistics?id="+data,
    method: "get",
  });
}


//获取每个分类下每种题型的数量
export function getQuestionCountByCategoryIds(data) {
  return request({
    url: "/business/questionCategory/getQuestionCountByCategoryIds",
    method: "post",
    data
  });
}
