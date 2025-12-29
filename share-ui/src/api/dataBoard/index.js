import request from '@/utils/request'

// 获取站点总数
export function getStationCount() {
  return request({
    url: '/device/station/list',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 1
    }
  })
}

// 获取设备状态统计
export function getDeviceStatus() {
  return request({
    url: '/device/cabinet/list',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 1000
    }
  })
}

// 获取今日订单统计
export function getTodayOrderStatistics() {
  const today = new Date()
  const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
  const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
  
  return request({
    url: '/order/orderInfo/getOrderStatisticsData',
    method: 'get',
    params: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    }
  })
}

// 获取今日订单趋势（按小时）
export function getTodayOrderTrend() {
  const today = new Date()
  const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
  const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
  
  return request({
    url: '/order/orderInfo/getOrderStatisticsData',
    method: 'get',
    params: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      groupBy: 'hour'
    }
  })
}

// 获取所有站点（用于地图显示）
export function getAllStations() {
  return request({
    url: '/device/station/list',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 1000
    }
  })
}

// 获取设备总数（充电柜+充电宝）
export function getDeviceTotal() {
  return Promise.all([
    request({
      url: '/device/cabinet/list',
      method: 'get',
      params: {
        pageNum: 1,
        pageSize: 1
      }
    }),
    request({
      url: '/device/powerBank/list',
      method: 'get',
      params: {
        pageNum: 1,
        pageSize: 1
      }
    })
  ])
}

