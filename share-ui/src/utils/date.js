// 日期工具函数，供 dashboard 等页面使用

/**
 * 将日期格式化为 `YYYY-MM-DD`
 * @param {Date | string | number} date
 * @returns {string}
 */
export function getDateInfo(date) {
  const d = date ? new Date(date) : new Date()
  const year = d.getFullYear()
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取当前月份信息
 * @param {Date | string | number} date
 * @returns {{ days: number; surplusDay: number }}
 *  - days: 当月总天数
 *  - surplusDay: 当月剩余天数（含当天）
 */
export function getMonthInfo(date) {
  const d = date ? new Date(date) : new Date()
  const year = d.getFullYear()
  const month = d.getMonth()
  const today = d.getDate()

  const lastDayOfMonth = new Date(year, month + 1, 0)
  const days = lastDayOfMonth.getDate()
  const surplusDay = days - today

  return {
    days,
    surplusDay
  }
}

/**
 * 获取某周的日期数组
 * @param {{ baselineDate?: Date | string | number; range?: number }} options
 *  - baselineDate: 基准日期（默认当天）
 *  - range: 相对基准日期偏移天数（例如 -7 获取上一周，7 获取下一周的起始周）
 * @returns {Array<{ week: string; day: number; dateStr: string }>}
 *  - week: 周几文案，如 "周一"
 *  - day: 作为索引用的天数（从 0 开始，对应当月第 N 天 - 1）
 *  - dateStr: `YYYY-MM-DD`
 */
export function getWeekDate(options = {}) {
  const { baselineDate, range = 0 } = options
  const base = baselineDate ? new Date(baselineDate) : new Date()

  // 应用偏移（上一周/下一周）
  base.setDate(base.getDate() + range)

  // 以周一为一周的开始
  const currentDay = base.getDay() || 7 // 周日返回 0，按 7 处理
  const monday = new Date(base)
  monday.setDate(base.getDate() - (currentDay - 1))

  const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const result = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)

    result.push({
      week: weekLabels[i],
      // 作为 SUBSCRIBE_DATA 的索引使用：当月第 N 天 - 1
      day: d.getDate() - 1,
      dateStr: getDateInfo(d)
    })
  }

  return result
}


