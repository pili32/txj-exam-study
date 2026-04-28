// 时间日期转换年-月-日-时-分-秒
export const dateFormatYMDHMS = (time) => {
  let date = time ? new Date(time) : new Date();
  let year = date.getFullYear();
  // 在日期格式中，月份是从0开始的，因此要加0，使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
  let month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  let minutes =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  let seconds =
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  // 拼接
  return (
    year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds
  );
};

// 时间日期转换年-月-日-时-分-秒
export const dateFormatYMD = (time) => {
  let date = time ? new Date(time) : new Date();
  let year = date.getFullYear();
  // 在日期格式中，月份是从0开始的，因此要加0，使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
  let month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  let minutes =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  let seconds =
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  // 拼接
  return year + "-" + month + "-" + day;
};

// 时间日期转换年-月-日-时-分-秒
export const getCurrentFormattedTime = () => {
  const now = new Date();

  // 获取年月日时分秒
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要+1
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // 拼接成 YYYYMMDD-HHmmss 格式
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

export const getDateMonthsAgo = (date, months) => {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = newDate.getMonth();
  const day = newDate.getDate();

  // 计算新的年月
  let newMonth = month - months;
  let newYear = year;

  if (newMonth < 0) {
    newYear -= Math.ceil(Math.abs(newMonth) / 12);
    newMonth = ((newMonth % 12) + 12) % 12;
  }

  // 处理月末日期问题（如 5月31日减3个月变成2月28日）
  const targetDate = new Date(newYear, newMonth + 1, 0); // 下个月的第0天=上个月的最后一天
  const maxDay = targetDate.getDate();
  const finalDay = Math.min(day, maxDay);
  return new Date(newYear, newMonth, finalDay);
};
