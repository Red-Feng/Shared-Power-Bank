import request from '@/utils/request'

// 获取电池分析数据
export function getBatteryAnalysis() {
  return request({
    url: '/sta/device/battery/analysis',
    method: 'get'
  })
}

// 获取电池数据统计
export function getBatteryStatistics() {
  return request({
    url: '/sta/device/battery/statistics',
    method: 'get'
  })
}

