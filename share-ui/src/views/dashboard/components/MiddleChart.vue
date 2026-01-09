<template>
  <el-row :gutter="24" class="row-container">
    <el-col :lg="17" :xl="17">
      <div class="middle-chart-card">
        <div class="chart-header">
          <div class="tabs">
            <div
              v-for="(item, index) in tabData"
              :key="index"
              class="tab-item"
              :class="{ active: tabActive === index }"
              @click="tabActive = index; changeTab()"
            >
              {{ item.name }}
            </div>
          </div>
          <div class="date-filters">
            <span
              v-for="(item, index) in dateData"
              :key="index"
              :class="{ active: active === index }"
              @click="changeActive(index)"
            >
              {{ item }}
            </span>
          </div>
        </div>
        <div class="chart-content">
          <div class="chart-info">{{ startDate }} 至 {{ endDate }}</div>
          <CommonChart
            :data="allDateArr"
            :time="allTimeArr"
            :type="currentChartConfig.type"
            :unit="currentChartConfig.unit"
            :seriesNames="currentChartConfig.seriesNames"
          />
        </div>
      </div>
    </el-col>
    <el-col :lg="7" :xl="7">
      <div class="common-func-card">
        <div class="card-header">
          <span class="title">常用功能</span>
          <div class="header-actions">
            <div class="category-tabs">
              <span 
                v-for="cat in QUICK_FUNCTION_CATEGORIES" 
                :key="cat.id"
                :class="{ active: activeCategory === cat.id }"
                @click="activeCategory = cat.id"
              >{{ cat.name }}</span>
            </div>
            <el-button 
              type="text" 
              class="edit-btn" 
              @click="isEditing = !isEditing"
            >
              {{ isEditing ? '完成' : '编辑' }}
            </el-button>
          </div>
        </div>

        <div class="func-grid-container" :class="{ 'is-collapsed': isCollapsed && !isEditing }">
          <div class="func-grid">
            <div 
              v-for="func in filteredFunctions" 
              :key="func.id"
              class="func-item"
              :class="{ 'is-editing': isEditing }"
              @click="handleFuncClick($event, func)"
            >
              <router-link :to="func.path" class="func-link" :style="{ pointerEvents: isEditing ? 'none' : 'auto' }">
                <div class="icon-wrapper">
                  <svg-icon :icon-class="func.icon" />
                </div>
                <span class="func-name">{{ func.name }}</span>
              </router-link>
              <div v-if="isEditing" class="drag-handle" title="点击置顶">
                <i class="el-icon-top"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div class="fold-trigger" v-if="filteredFunctions.length > 8 && !isEditing" @click="isCollapsed = !isCollapsed">
          <i :class="isCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
          {{ isCollapsed ? '展开更多' : '收起' }}
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  BACKLOG_DATA_A,
  BACKLOG_DATA_B,
  BACKLOG_DATA_C,
  MONTH_EARNING_NUM_A,
  MONTH_EARNING_NUM_B,
  MONTH_EARNING_NUM_C,
  MONTH_NUM_A,
  MONTH_NUM_B,
  MONTH_NUM_C,
  MONTH_SERVE_NUM_A,
  MONTH_SERVE_NUM_B,
  MONTH_SERVE_NUM_C,
  TODAY_EARNING_NUM_A,
  TODAY_EARNING_NUM_B,
  TODAY_EARNING_NUM_C,
  TODAY_NUM_A,
  TODAY_NUM_B,
  TODAY_NUM_C,
  TODAY_SERVE_NUM_A,
  TODAY_SERVE_NUM_B,
  TODAY_SERVE_NUM_C,
  TODAY_TIME,
  WEEK_DATA,
  WEEK_EARNING_NUM_A,
  WEEK_EARNING_NUM_B,
  WEEK_EARNING_NUM_C,
  WEEK_NUM_A,
  WEEK_NUM_B,
  WEEK_NUM_C,
  WEEK_SERVE_NUM_A,
  WEEK_SERVE_NUM_B,
  WEEK_SERVE_NUM_C,
  QUICK_FUNCTIONS,
  QUICK_FUNCTION_CATEGORIES
} from '../utils'
import { getDateInfo, getMonthInfo } from '@/utils/date'
import CommonChart from './CommonChart.vue'

// 常用功能逻辑
const activeCategory = ref('all')
const isCollapsed = ref(true)
const isEditing = ref(false)
const userFuncOrder = ref(JSON.parse(localStorage.getItem('dashboard_func_order') || '[]'))

const filteredFunctions = computed(() => {
  let funcs = [...QUICK_FUNCTIONS]
  
  // 应用用户排序
  if (userFuncOrder.value.length > 0) {
    funcs.sort((a, b) => {
      const indexA = userFuncOrder.value.indexOf(a.id)
      const indexB = userFuncOrder.value.indexOf(b.id)
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }

  if (activeCategory.value === 'all') return funcs
  return funcs.filter(f => f.category === activeCategory.value)
})

const saveOrder = () => {
  localStorage.setItem('dashboard_func_order', JSON.stringify(userFuncOrder.value))
}

const moveFuncToTop = (id) => {
  const currentOrder = userFuncOrder.value.length > 0 
    ? [...userFuncOrder.value] 
    : QUICK_FUNCTIONS.map(f => f.id)
  
  const index = currentOrder.indexOf(id)
  if (index > -1) {
    currentOrder.splice(index, 1)
    currentOrder.unshift(id)
    userFuncOrder.value = currentOrder
    saveOrder()
  }
}

const handleFuncClick = (e, func) => {
  if (isEditing.value) {
    e.preventDefault()
    moveFuncToTop(func.id)
  }
}

watch(isEditing, (val) => {
  if (!val) {
    saveOrder()
  }
})

const dateData = ref(['今日', '本周', '本月'])
const tabData = ref([
  { id: 0, name: '收益情况' },
  { id: 1, name: '入退情况' },
  { id: 2, name: '服务情况' }
])

// 图表配置映射
const chartConfigs = {
  0: { type: 'line', unit: '元', seriesNames: ['收入', '支出'] },
  1: { type: 'bar', unit: '人', seriesNames: ['入住人数', '退住人数'] },
  2: { type: 'bar', unit: '次', seriesNames: ['服务次数', '完成次数'] }
}

const currentChartConfig = computed(() => chartConfigs[tabActive.value])

// 本日 / 本周 / 本月：默认选中「今日」
const active = ref(0)
const tabActive = ref(0)
const days = ref([])
const startDate = ref()
const endDate = ref()
const todayNumData = ref(TODAY_NUM_A) // 收益今日
const weekNumData = ref(WEEK_NUM_A) // 收益周
const monNumData = ref(MONTH_NUM_A) // 收益月
const todayEarningData = ref(TODAY_EARNING_NUM_A) // 入退今日
const weekEarningData = ref(WEEK_EARNING_NUM_A) // 入退周
const montyEarningData = ref(MONTH_EARNING_NUM_A) // 入退月
const todayServeData = ref(TODAY_SERVE_NUM_A) // 服务情况今日
const weekServeData = ref(WEEK_SERVE_NUM_A) // 服务情况周
const montyServeData = ref(MONTH_SERVE_NUM_A) // 服务情况月
const backlogData = ref(BACKLOG_DATA_A) // 待办事项
const allDateArr = ref([])
const allTimeArr = ref([])

onMounted(() => {
  getDate()
  nextTick(() => {
    // 3套数据3天出现一次
    const date = getMonthInfo(new Date())
    const num = (date.surplusDay + 1) % 3
    if (num === 1) {
      todayNumData.value = TODAY_NUM_A
      weekNumData.value = WEEK_NUM_A
      monNumData.value = MONTH_NUM_A
      todayEarningData.value = TODAY_EARNING_NUM_A // 入退今日
      weekEarningData.value = WEEK_EARNING_NUM_A
      montyEarningData.value = MONTH_EARNING_NUM_A
      todayServeData.value = TODAY_SERVE_NUM_A // 服务今日
      weekServeData.value = WEEK_SERVE_NUM_A
      montyServeData.value = MONTH_SERVE_NUM_A
      backlogData.value = BACKLOG_DATA_A
    } else if (num === 2) {
      todayNumData.value = TODAY_NUM_B
      weekNumData.value = WEEK_NUM_B
      monNumData.value = MONTH_NUM_B
      todayEarningData.value = TODAY_EARNING_NUM_B
      weekEarningData.value = WEEK_EARNING_NUM_B
      montyEarningData.value = MONTH_EARNING_NUM_B
      todayServeData.value = TODAY_SERVE_NUM_B
      weekServeData.value = WEEK_SERVE_NUM_B
      montyServeData.value = MONTH_SERVE_NUM_B
      backlogData.value = BACKLOG_DATA_B
    } else {
      todayNumData.value = TODAY_NUM_C
      weekNumData.value = WEEK_NUM_C
      monNumData.value = MONTH_NUM_C
      todayEarningData.value = TODAY_EARNING_NUM_C
      weekEarningData.value = WEEK_EARNING_NUM_C
      montyEarningData.value = MONTH_EARNING_NUM_C
      todayServeData.value = TODAY_SERVE_NUM_C
      weekServeData.value = WEEK_SERVE_NUM_C
      montyServeData.value = MONTH_SERVE_NUM_C
      backlogData.value = BACKLOG_DATA_C
    }

    // 初始化时按「今日」的规则计算数据和时间轴
    getDataInfo()
  })
})
// 触发 tab
const changeTab = () => {
  active.value = 1
  nextTick(() => {
    getDataInfo()
  })
}
const getDataInfo = () => {
  const dayArr = [] // 天数
  let timeArr = [] // 日、周、月份
  let dateArr = [] // 数据
  let todayData = null // 今天数据
  let weekData = null // 周数据
  let montyData = null // 月数据
  if (tabActive.value === 0) {
    todayData = todayNumData.value
    weekData = weekNumData.value
    montyData = monNumData.value
  } else if (tabActive.value === 1) {
    todayData = todayEarningData.value
    weekData = weekEarningData.value
    montyData = montyEarningData.value
  } else {
    todayData = todayServeData.value
    weekData = weekServeData.value
    montyData = montyServeData.value
  }
  if (active.value === 0) {
    getDate()
    timeArr = TODAY_TIME
    dateArr = todayData
  } else if (active.value === 1) {
    // 本周：如果本周还没结束，则默认展示上周的区间
    const now = new Date()
    const thisWeekEnd = new Date(getEndDayOfWeek(now))
    const baseDate =
      now.getTime() < thisWeekEnd.getTime()
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        : now
    startDate.value = getStartDayOfWeek(baseDate)
    endDate.value = getEndDayOfWeek(baseDate)
    timeArr = WEEK_DATA
    dateArr = weekData
  } else {
    // 本月：如果本月还没结束，则默认展示上个月的区间
    const now = new Date()
    let baseDate = now
    const thisMonth = getMonty(now)
    if (now.getTime() < thisMonth.lastDay.getTime()) {
      // 取上个月任意一天作为基准
      baseDate = new Date(now.getFullYear(), now.getMonth() - 1, 15)
    }
    const date = getMonty(baseDate)
    startDate.value = getDateInfo(date.firstDay)
    endDate.value = getDateInfo(date.lastDay)
    const month = getMonthInfo(baseDate)
    days.value = month.days

    for (let i = 0; i < days.value; i++) {
      dayArr.push(i + 1)
    }
    timeArr = dayArr
    dateArr = montyData
  }
  allDateArr.value = dateArr
  allTimeArr.value = timeArr
  console.log(allDateArr.value,allTimeArr.value)
}
// 触发本日、本周、本月
const changeActive = (i) => {
  active.value = i
  getDataInfo()
}
// 获取本日
const getDate = () => {
  startDate.value = getDateInfo(new Date())
  endDate.value = getDateInfo(new Date())
}
// 获得本周的开始时间：
const getStartDayOfWeek = (time) => {
  const now = new Date(time) // 当前日期
  const nowDayOfWeek = now.getDay() // 今天本周的第几天
  const day = nowDayOfWeek || 7
  const nowDay = now.getDate() // 当前日
  const nowMonth = now.getMonth() // 当前月
  return formatDate(new Date(now.getFullYear(), nowMonth, nowDay + 0 - day)) // 0代表从周日至周六；1代表周一至周日
}
// 获得本周的结束时间：
const getEndDayOfWeek = (time) => {
  const now = new Date(time) // 当前日期
  const nowDayOfWeek = now.getDay() // 今天本周的第几天
  const day = nowDayOfWeek || 7
  const nowDay = now.getDate() // 当前日
  const nowMonth = now.getMonth() // 当前月
  return formatDate(new Date(now.getFullYear(), nowMonth, nowDay + 6 - day)) // 6代表从周日至周六；7代表周一至周日
}
// 日期格式化
const formatDate = (date) => {
  const myyear = date.getFullYear()
  let mymonth = date.getMonth() + 1
  let myweekday = date.getDate()
  if (mymonth < 10) {
    mymonth = `0${mymonth}`
  }
  if (myweekday < 10) {
    myweekday = `0${myweekday}`
  }
  return `${myyear}-${mymonth}-${myweekday}`
}
// 本月的开始结束时间（支持传入任意日期所在的月份）
const getMonty = (time = new Date()) => {
  const today = new Date(time)
  // 获取当前月份的第一天
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  // 获取当前月份的最后一天
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const date = {
    firstDay,
    lastDay
  }
  return date
}
</script>

<style lang="scss" scoped>
@import "../styles/apple-hig-variables.scss";

.middle-chart-card {
  @include apple-card;
  margin-top: $space-2;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-2 0;
  border-bottom: 0.5px solid $separator;
  margin-bottom: $space-4;

  .tabs {
    display: flex;
    background: $system-gray6;
    padding: 2px;
    border-radius: $radius-lg;
    gap: 2px;

    .tab-item {
      padding: 6px 16px;
      font-size: $text-subhead;
      font-weight: $font-weight-medium;
      color: $label-secondary;
      cursor: pointer;
      border-radius: $radius-md;
      transition: all $duration-fast $ease-out;

      &:hover {
        color: $label-primary;
      }

      &.active {
        background: $bg-primary;
        color: $label-primary;
        box-shadow: $shadow-sm;
        transform: scale(1.02);
      }
    }
  }

  .date-filters {
    display: flex;
    gap: $space-4;

    span {
      font-size: $text-subhead;
      color: $label-secondary;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: $radius-md;
      transition: all $duration-fast $ease-out;

      &:hover {
        background: $fill-quaternary;
        color: $label-primary;
      }

      &.active {
        color: $system-blue;
        font-weight: $font-weight-semibold;
      }
    }
  }
}

.chart-content {
  position: relative;
  min-height: 320px;
  
  .chart-info {
    position: absolute;
    top: 0;
    right: 0;
    font-size: $text-footnote;
    color: $label-tertiary;
    background: rgba(255,255,255,0.7);
    padding: 4px 12px;
    border-radius: $radius-full;
    backdrop-filter: blur(10px);
    border: 0.5px solid rgba(0,0,0,0.05);
    z-index: 1;
  }
}

// 常用功能样式重构
.common-func-card {
  @include apple-card;
  margin-top: $space-2;
  padding: $space-4;
  height: 100%;
  display: flex;
  flex-direction: column;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-4;

    .title {
      font-size: $text-headline;
      font-weight: $font-weight-semibold;
      color: $label-primary;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: $space-3;

      .category-tabs {
        display: flex;
        background: $system-gray6;
        padding: 2px;
        border-radius: $radius-md;
        
        span {
          padding: 4px 10px;
          font-size: $text-caption2;
          border-radius: 6px;
          cursor: pointer;
          transition: all $duration-fast $ease-out;
          color: $label-secondary;

          &.active {
            background: $bg-primary;
            color: $label-primary;
            box-shadow: $shadow-sm;
          }
        }
      }

      .edit-btn {
        padding: 0;
        font-size: $text-caption1;
        color: $system-blue;
      }
    }
  }

  .func-grid-container {
    flex: 1;
    overflow: hidden;
    transition: max-height $duration-normal $ease-in-out;
    
    &.is-collapsed {
      max-height: 180px; // 大约显示两行
    }
  }

  .func-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: $space-4 $space-2;
    padding: $space-2 0;

    .func-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all $duration-fast $ease-out;

      &:hover:not(.is-editing) {
        transform: translateY(-2px);
        
        .icon-wrapper {
          background: $fill-tertiary;
        }
      }

      &.is-editing {
        animation: shake 0.3s infinite ease-in-out;
        cursor: grab;
      }

      .func-link {
        text-decoration: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }

      .icon-wrapper {
        width: 48px;
        height: 48px;
        background: $system-gray6;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: $space-2;
        transition: background $duration-fast $ease-out;

        .svg-icon {
          font-size: 24px;
          color: $label-primary;
        }
      }

      .func-name {
        font-size: $text-caption2;
        color: $label-secondary;
        line-height: 1.2;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .drag-handle {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 16px;
        height: 16px;
        background: $system-blue;
        color: white;
        border-radius: 50%;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: $shadow-sm;
      }
    }
  }

  .fold-trigger {
    margin-top: $space-3;
    padding: $space-2;
    text-align: center;
    font-size: $text-caption2;
    color: $label-tertiary;
    cursor: pointer;
    border-top: 0.5px solid $separator;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: color $duration-fast $ease-out;

    &:hover {
      color: $label-primary;
    }
  }
}

@keyframes shake {
  0% { transform: rotate(-1deg); }
  50% { transform: rotate(1deg); }
  100% { transform: rotate(-1deg); }
}

@media (max-width: 1200px) {
  .common-func-card .func-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .common-func-card .func-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

:deep(.el-card__header) {
  display: none;
}
</style>
