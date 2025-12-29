<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-card class="box-card" shadow="never">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px">
        <el-form-item label="年份" prop="year">
          <el-date-picker
            v-model="queryParams.year"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            @change="handleQuery"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="月份" prop="month">
          <el-select
            v-model="queryParams.month"
            placeholder="选择月份"
            clearable
            @change="handleQuery"
            style="width: 150px"
          >
            <el-option label="全年" :value="null" />
            <el-option
              v-for="item in monthOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图表类型" prop="chartType">
          <el-radio-group v-model="chartType" @change="handleChartTypeChange">
            <el-radio-button label="bar">柱状图</el-radio-button>
            <el-radio-button label="line">折线图</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery" :loading="loading">
            查询
          </el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">总注册用户</div>
            <div class="stat-value">{{ totalUsers }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" color="#409EFF"><User /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">本月新增</div>
            <div class="stat-value">{{ currentMonthCount }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" color="#67C23A"><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">平均每日</div>
            <div class="stat-value">{{ averageDaily }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" color="#E6A23C"><DataAnalysis /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">峰值日期</div>
            <div class="stat-value-small">{{ peakDate || '暂无' }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" color="#F56C6C"><Top /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表容器 -->
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">用户注册统计</span>
          <el-button
            v-if="chartData.length > 0"
            type="text"
            icon="Download"
            @click="exportChart"
          >
            导出图表
          </el-button>
        </div>
      </template>
      <div v-loading="loading" class="chart-container">
        <div ref="chartRef" class="chart" v-if="chartData.length > 0"></div>
        <el-empty v-else description="暂无数据" :image-size="100" />
      </div>
    </el-card>
  </div>
</template>
 
<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { getUserCount } from '@/api/sta/sta'
import { ElMessage } from 'element-plus'
import { User, TrendCharts, DataAnalysis, Top } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const chartRef = ref(null)
let chartInstance = null
const chartType = ref('bar')
const chartData = ref([])
const xData = ref([])
const yData = ref([])

// 查询参数
const queryParams = reactive({
  year: new Date().getFullYear().toString(), // 默认当前年份
  month: null
})

// 月份选项
const monthOptions = [
  { label: '1月', value: '01' },
  { label: '2月', value: '02' },
  { label: '3月', value: '03' },
  { label: '4月', value: '04' },
  { label: '5月', value: '05' },
  { label: '6月', value: '06' },
  { label: '7月', value: '07' },
  { label: '8月', value: '08' },
  { label: '9月', value: '09' },
  { label: '10月', value: '10' },
  { label: '11月', value: '11' },
  { label: '12月', value: '12' }
];

// 计算属性
const totalUsers = computed(() => {
  return yData.value.reduce((sum, val) => sum + (val || 0), 0)
})

const currentMonthCount = computed(() => {
  const currentMonth = new Date().getMonth() + 1
  const monthStr = String(currentMonth).padStart(2, '0')
  const currentYear = new Date().getFullYear().toString()
  
  let count = 0
  xData.value.forEach((date, index) => {
    if (date && date.startsWith(`${currentYear}-${monthStr}`)) {
      count += yData.value[index] || 0
    }
  })
  return count
})

const averageDaily = computed(() => {
  if (yData.value.length === 0) return 0
  const sum = totalUsers.value
  const days = yData.value.length
  return Math.round((sum / days) * 10) / 10
})

const peakDate = computed(() => {
  if (yData.value.length === 0) return null
  const maxValue = Math.max(...yData.value)
  const maxIndex = yData.value.indexOf(maxValue)
  return xData.value[maxIndex] || null
})

// 方法
const handleQuery = () => {
  fetchData()
}

const resetQuery = () => {
  queryParams.year = new Date().getFullYear().toString()
  queryParams.month = null
  handleQuery()
}

const handleChartTypeChange = () => {
  if (chartData.value.length > 0) {
    renderChart()
  }
}

// 生成模拟数据
const generateMockData = (year, month = null) => {
  const dateList = []
  const countList = []
  
  if (month) {
    // 生成指定月份的数据（按天）
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate()
    const currentDate = new Date()
    const isCurrentMonth = currentDate.getFullYear() === parseInt(year) && 
                          (currentDate.getMonth() + 1) === parseInt(month)
    const maxDay = isCurrentMonth ? currentDate.getDate() : daysInMonth
    
    for (let day = 1; day <= maxDay; day++) {
      const dayStr = String(day).padStart(2, '0')
      dateList.push(`${year}-${month}-${dayStr}`)
      // 生成随机注册人数，范围在 10-150 之间，周末稍少
      const dayOfWeek = new Date(parseInt(year), parseInt(month) - 1, day).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const baseCount = isWeekend ? 30 : 80
      const randomCount = Math.floor(Math.random() * 50) + baseCount
      countList.push(randomCount)
    }
  } else {
    // 生成全年数据（按月）
    for (let m = 1; m <= 12; m++) {
      const monthStr = String(m).padStart(2, '0')
      dateList.push(`${year}-${monthStr}`)
      // 生成随机注册人数，范围在 200-800 之间
      const baseCount = 300
      const randomCount = Math.floor(Math.random() * 400) + baseCount
      countList.push(randomCount)
    }
  }
  
  return { dateList, countList }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 使用模拟数据
    const selectedYear = queryParams.year || new Date().getFullYear().toString()
    const selectedMonth = queryParams.month
    
    // 生成模拟数据
    const mockData = generateMockData(selectedYear, selectedMonth)
    let dateList = mockData.dateList
    let countList = mockData.countList

    // 如果没有数据，提示用户
    if (dateList.length === 0 || countList.length === 0) {
      ElMessage.warning('暂无用户注册数据')
      xData.value = []
      yData.value = []
      chartData.value = []
      return
    }

    // 设置查询参数
    if (!queryParams.year) {
      queryParams.year = selectedYear
    }

    // 直接使用生成的数据
    xData.value = dateList
    yData.value = countList

    chartData.value = yData.value.map((val, index) => ({
      name: xData.value[index],
      value: val
    }))

    if (xData.value.length > 0 && yData.value.length > 0) {
      await nextTick()
      renderChart()
    } else {
      ElMessage.warning('查询结果为空，没有找到相关数据')
    }
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
    ElMessage.error(error.message || '获取数据失败，请稍后重试')
    xData.value = []
    yData.value = []
    chartData.value = []
  } finally {
    loading.value = false
  }
}

// 根据年份和月份过滤数据
const filterDataByYearMonth = (dateList, countList, year, month) => {
  const filteredDateList = []
  const filteredCountList = []

  dateList.forEach((date, index) => {
    if (!date) return
    
    const dateYear = date.split('-')[0]
    const dateMonth = date.split('-')[1]

    // 匹配年份
    if (dateYear === year) {
      // 如果指定了月份，则只匹配该月份
      if (month) {
        if (dateMonth === month) {
          filteredDateList.push(date)
          filteredCountList.push(countList[index] || 0)
        }
      } else {
        // 不指定月份，返回该年所有数据
        filteredDateList.push(date)
        filteredCountList.push(countList[index] || 0)
      }
    }
  })

  return {
    dateList: filteredDateList,
    countList: filteredCountList
  }
}

// 渲染图表
const renderChart = () => {
  if (!chartRef.value) return

  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 创建新实例
  chartInstance = echarts.init(chartRef.value)

  // 图表配置
  const option = {
                title: {
      text: queryParams.month 
        ? `${queryParams.year}年${parseInt(queryParams.month)}月用户注册统计`
        : `${queryParams.year}年用户注册统计`,
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
                },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const param = params[0]
        return `${param.name}<br/>${param.seriesName}: ${param.value}人`
      }
    },
                legend: {
      data: ['注册人数'],
      top: 40
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
                },
                xAxis: {
      type: 'category',
      data: xData.value,
      axisLabel: {
        rotate: xData.value.length > 10 ? 45 : 0,
        interval: 0,
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#E4E7ED'
        }
      }
                },
                yAxis: {
      type: 'value',
      name: '注册人数',
      minInterval: 1,
      axisLabel: {
        formatter: '{value}人'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#E4E7ED'
        }
      }
                },
    series: [
      {
        name: '注册人数',
        type: chartType.value,
        data: yData.value,
        smooth: chartType.value === 'line',
        itemStyle: {
          color: chartType.value === 'bar' 
            ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            : '#409EFF'
        },
        areaStyle: chartType.value === 'line' ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        } : null,
        label: {
          show: true,
          position: chartType.value === 'bar' ? 'top' : 'top',
          formatter: '{c}人',
          fontSize: 11
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    dataZoom: xData.value.length > 10 ? [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 50
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100
      }
    ] : []
  }

  chartInstance.setOption(option)

  // 响应式调整
  window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 导出图表
const exportChart = () => {
  if (!chartInstance) return
  
  const url = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  
  const link = document.createElement('a')
  link.download = `用户注册统计_${queryParams.year}${queryParams.month || ''}.png`
  link.href = url
  link.click()
  
  ElMessage.success('图表导出成功')
}

// 生命周期
onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.mb20 {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-card__body) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    height: 100%;
  }
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-value-small {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-icon {
  margin-left: 20px;
  opacity: 0.8;
}

.chart-container {
  width: 100%;
  height: 500px;
  min-height: 500px;
}

.chart {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 10px;
  }

  .chart-container {
    height: 400px;
  }
}
</style>
