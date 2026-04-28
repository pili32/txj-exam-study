
import request from "@/utils/request";


//分页查询试题列表(乱序返回)
export function pageListApi(data) {
  return request({
    url: "/business/question/pageListOutOfOrder",
    method: "post",
    data,
  });
}

//获取练习时试题列表(排查已答对的题)
export function questionList(data) {
  return request({
    url: "/business/userPractice/practiceQuestionList",
    method: "post",
    data,
  });
}


//获取练习时试题列表(排查已答对的题)
export function quickRaceQuestionList(data) {
  return request({
    url: "/business/userPractice/quickRaceQuestionList?templateId="+data.templateId+"&practiceCount="+data.practiceCount,
    method: "get",
    data,
  });
}


//获取竞赛模式--必答题列表
export function raceCompulsoryQuestionList(data) {
  return request({
    url: "/business/userPractice/raceCompulsoryQuestionList?type="+data.type+"&practiceCount="+data.practiceCount,
    method: "get",
    data,
  });
}


//获取竞赛模式--抢答题列表
export function raceBuzzerQuestionList(data) {
  return request({
    url: "/business/userPractice/raceBuzzerQuestionList?remark="+data.remark+"&practiceCount="+data.practiceCount,
    method: "get",
    data,
  });
}

//获取竞赛模式--抢答题列表
export function getUserPracticeListWithRemark(data) {
  return request({
    url: "/business/userPractice/getUserPracticeListWithRemark",
    method: "get",
    data,
  });
}

//加载练习时试题列表时，重置已答对的题的状态
export function resetQuestionList(data) {
  return request({
    url: "/business/userPractice/resetQuestionSearchStatus",
    method: "post",
    data,
  });
}
//考试考试进入倒计时
export function startPracticeApi(data) {
  return request({
    url: "/business/userPractice/startPractice",
    method: "post",
    data
  });
}


//提交答案
export function submitAnswerApi(data) {
  return request({
    url: "/business/userPractice/submitAnswerOneByOne",
    method: "post",
    data
  });
}


//提交答案
export function endPracticeApi(data) {
  return request({
    url: "/business/userPractice/endPractice",
    method: "post",
    data
  });
}

//角色管理获取用户角色id集合
export function practicePageHistoryApi(data) {
  return request({
    url: "/business/userPractice/practicePageHistory",
    method: "post",
    data
  });
}




//一次性加载用户练习详情（含正确答案和用户答案）
export function getUserPracticeQuestionWithUserAnswer(data) {
  return request({
    url: "/business/userPractice/getUserPracticeQuestionWithUserAnswer?id="+data,
    method: "get",
  });
}



//角色管理获取用户角色id集合
export function WrongPageListApi(data) {
  return request({
    url: "/business/userWrongQuestion/pageList",
    method: "post",
    data
  });
}



//角色管理获取用户角色id集合
export function wrongListWithCondition(data) {
  return request({
    url: "/business/userWrongQuestion/wrongListWithCondition",
    method: "post",
    data
  });
}


//角色管理获取用户角色id集合
export function submitAnswerOneByOne(data) {
  return request({
    url: "/business/userWrongQuestion/submitAnswerOneByOne",
    method: "post",
    data
  });
}
