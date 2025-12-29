<template>
  <!-- 顶部一行：左右两张卡片高度不再强制等高，由内容自己撑开 -->
  <el-row :gutter="24" class="top-row">
    <!-- 左侧数据概览（保持原有高度，由图表内容自适应） -->
    <el-col :lg="17" :xl="17">
      <el-card class="top-panel-card">
        <template #header>
          <div class="tit">
            <span>数据概览</span
            ><span class="time">数据更新：{{ newDate }}</span>
          </div>
        </template>
        <div class="dataCon">
          <div
            id="oldContainer"
            ref="oldContainer"
            class="dashboard-chart-container"
          />
          <div
            id="bedContainer"
            ref="bedContainer"
            class="dashboard-chart-container"
          />
          <div
            id="serveContainer"
            ref="serveContainer"
            class="dashboard-chart-container"
          />
          <div
            id="staffContainer"
            ref="staffContainer"
            class="dashboard-chart-container"
          />
          <div
            id="moneyContainer"
            ref="moneyContainer"
            class="dashboard-chart-container"
          />
        </div>
      </el-card>
    </el-col>
    <!-- 右侧个人信息块（不再强制跟随左侧等高，通过 align-self 自身高度显示） -->
    <el-col class="dashboard-user-col" :lg="7" :xl="7">
      <el-card class="user-card">
        <div class="roleCon">
          <div class="head"> 
            <div class="img">
              <img :src="baseData.avatar ? baseData.avatar : avatar" />
            </div>
            <div class="rText">
              <p>Hello！{{ baseData.nickName }}</p>
              <p>今天也是充电满满的一天！</p>
            </div>
          </div>
          <div class="userInfo">
            <!-- 仅保留部门/岗位和角色信息，不展示邮箱和登录名 -->
            <p v-if="baseData.user.dept">
              <i class="icon3"></i>{{ baseData.user.dept.deptName }} / {{ baseData.postGroup }}
            </p>
            <p>
              <i class="icon4"></i>{{ baseData.roleGroup }}
            </p>
          </div>
          <div class="hFoot">
            <div class="fTit">重点点位</div>
            <ul class="imgItem">
              <li>
                <span><img src="../../../assets/images/img1.png" /></span>
              </li>
              <li>
                <span><img src="../../../assets/images/img2.png" /></span>
              </li>
              <li>
                <span><img src="../../../assets/images/img3.png" /></span>
              </li>
              <li>
                <span><img src="../../../assets/images/img4.png" /></span>
              </li>
              <li>
                <span><img src="../../../assets/images/img5.png" /></span>
              </li>
              <li>
                <span><img src="../../../assets/images/img6.png" /></span>
              </li>
              <li><span>+3</span></li>
            </ul>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'

import * as echarts from 'echarts/core'
import {GridComponent, LegendComponent, TooltipComponent} from 'echarts/components'
import {LineChart, PieChart} from 'echarts/charts'
import {CanvasRenderer} from 'echarts/renderers'
import useSettingStore from '@/store/modules/setColor'
import useUserStore from '@/store/modules/user'
import {getDateInfo, getMonthInfo} from '@/utils/date'
import {
  BED_NUM_A,
  BED_NUM_B,
  BED_NUM_C,
  MONEY_NUM_A,
  MONEY_NUM_B,
  MONEY_NUM_C,
  OLDMAN_NUM_A,
  OLDMAN_NUM_B,
  OLDMAN_NUM_C,
  SERVE_NUM_A,
  SERVE_NUM_B,
  SERVE_NUM_C,
  STAFF_NUM_A,
  STAFF_NUM_B,
  STAFF_NUM_C
} from '../constants'
import {
  getBedPieChartDataSet,
  getMoneyPieChartDataSet,
  getOldPieChartDataSet,
  getservePieChartDataSet,
  getStaffPieChartDataSet
} from '../index1'

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  GridComponent,
  LineChart,
  CanvasRenderer
])

const store = useSettingStore()
const userStore = useUserStore()

// 使用与右上角一致的头像
const avatar = computed(() => userStore.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
const newDate = getDateInfo(new Date())
const chartColors = computed(() => store.chartColors)
// 获取父组件值、方法
defineProps({
  // 搜索对象
  baseData: {
    type: Object,
    default: () => ({})
  },
  roleListData: {
    type: String,
    default: ''
  }
})
// monitorChart
let oldContainer= null // 老人
let bedContainer= null // 床位
let serveContainer= null // 服务
let staffContainer= null // 员工
let moneyContainer= null // 收入
let countChart =null
// 老人数量
const oldNumData = ref(OLDMAN_NUM_A)
const bedNumData = ref(BED_NUM_A)
const serveNumData = ref(SERVE_NUM_A)
const staffNumData = ref(STAFF_NUM_A)
const moneyNumData = ref(MONEY_NUM_A)
const renderCountChart = () => {
  if (!oldContainer) {
    oldContainer = document.getElementById('oldContainer')
  }
  countChart = echarts.init(oldContainer)
  countChart.setOption(
    getOldPieChartDataSet((chartColors).value, oldNumData.value)
  )
}
// 床位数量
const bedCountChart = () => {
  if (!bedContainer) {
    bedContainer = document.getElementById('bedContainer')
  }
  countChart = echarts.init(bedContainer)
  countChart.setOption(
    getBedPieChartDataSet((chartColors).value, bedNumData.value)
  )
}
// 服务数量
const serveCountChart = () => {
  if (!serveContainer) {
    serveContainer = document.getElementById('serveContainer')
  }
  countChart = echarts.init(serveContainer)
  countChart.setOption(
    getservePieChartDataSet((chartColors).value, serveNumData.value)
  )
}
// 员工数量
const staffCountChart = () => {
  if (!staffContainer) {
    staffContainer = document.getElementById('staffContainer')
  }
  countChart = echarts.init(staffContainer)
  countChart.setOption(
    getStaffPieChartDataSet((chartColors).value, staffNumData.value)
  )
}
// 收入金额
const moneyCountChart = () => {
  if (!moneyContainer) {
    moneyContainer = document.getElementById('moneyContainer')
  }
  countChart = echarts.init(moneyContainer)
  countChart.setOption(
    getMoneyPieChartDataSet((chartColors).value, moneyNumData.value)
  )
}
const renderCharts = () => {
  renderCountChart()
  bedCountChart()
  serveCountChart()
  staffCountChart()
  moneyCountChart()
}

onMounted(() => {
  // 3套数据3天出现一次
  const date = getMonthInfo(new Date())
  const num = (date.surplusDay + 1) % 3
  if (num === 1) {
    oldNumData.value = OLDMAN_NUM_A
    bedNumData.value = BED_NUM_A
    serveNumData.value = SERVE_NUM_A
    staffNumData.value = STAFF_NUM_A
    moneyNumData.value = MONEY_NUM_A
  } else if (num === 2) {
    oldNumData.value = OLDMAN_NUM_B
    bedNumData.value = BED_NUM_B
    serveNumData.value = SERVE_NUM_B
    staffNumData.value = STAFF_NUM_B
    moneyNumData.value = MONEY_NUM_B
  } else {
    oldNumData.value = OLDMAN_NUM_C
    bedNumData.value = BED_NUM_C
    serveNumData.value = SERVE_NUM_C
    staffNumData.value = STAFF_NUM_C
    moneyNumData.value = MONEY_NUM_C
  }
  renderCharts()
})
</script>

<style lang="scss" scoped>
.top-panel-card {
  // 减小上下内边距，缩短整体高度
  :deep(.el-card__body) {
    padding: 4px 20px 1px;
  }
}

// 右侧个人信息卡：与左侧数据概览的 el-card__body 对齐
.user-card {
  :deep(.el-card__body) {
    padding: 4px 20px 10px;
  }
}
</style>
