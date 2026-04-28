
import request from "@/utils/request";


//获取用户累计积分和当日积分
export function getUserPoint() {
  return request({
    url: "/business/points/getUserTotalAndDailyPoint",
    method: "get",
  });
}



//获取用户累计积分和当日积分
export function updateReadingPoints(data) {
    return request({
      url: "/business/points/updateReadingPoints",
      method: "post",
      data
    });
  }
