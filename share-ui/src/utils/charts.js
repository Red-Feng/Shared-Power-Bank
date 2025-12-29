// 图表通用工具方法

/**
 * 生成一个指定范围内的随机整数数组元素（用于模拟图表数据）
 * @param {number} min 最小值（含），默认 10
 * @param {number} max 最大值（含），默认 100
 * @returns {number}
 */
export function getRandomArray(min = 10, max = 100) {
  if (min > max) {
    const tmp = min
    min = max
    max = tmp
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}


