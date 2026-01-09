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
  STAFF_NUM_C,
  getBedPieChartDataSet,
  getMoneyPieChartDataSet,
  getOldPieChartDataSet,
  getservePieChartDataSet,
  getStaffPieChartDataSet
} from '../utils'

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
@import "../styles/apple-hig-variables.scss";

.top-row {
  align-items: flex-start;
  margin-bottom: $space-4;
}

.top-panel-card {
  @include apple-card;
  height: 100%;
}

.dataCon {
  display: flex;
  padding-top: $space-3;
  justify-content: space-around;
  flex-wrap: wrap;
}

.dashboard-chart-container {
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.user-card {
  @include apple-card;
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(242,242,247,0.8) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(0,122,255,0.05) 0%, transparent 70%);
    z-index: 0;
  }
}

.roleCon {
  position: relative;
  z-index: 1;
  padding-top: $space-1;

  .head {
    display: flex;
    padding: $space-2 0;
    align-items: center;

    .img {
      width: 42px;
      height: 42px;
      margin-right: $space-2;
      
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .rText {
      p {
        margin: 0;
        line-height: 1.4;
        
        &:first-child {
          font-size: $text-headline;
          font-weight: $font-weight-bold;
          color: $label-primary;
        }
        &:last-child {
          font-size: $text-subhead;
          color: $label-secondary;
        }
      }
    }
  }

  .userInfo {
    margin: $space-4 0;
    padding: $space-3;
    background: rgba(255,255,255,0.5);
    border-radius: $radius-lg;
    backdrop-filter: blur(10px);
    border: 0.5px solid rgba(0,0,0,0.03);

    p {
      display: flex;
      align-items: center;
      font-size: $text-subhead;
      color: $label-secondary;
      margin: $space-2 0;
      gap: $space-2;

      i {
        display: inline-block;
        width: 18px;
        height: 18px;
        background-size: contain;
        background-repeat: no-repeat;
        opacity: 0.6;
        
        &.icon3 { background-image: url("@/assets/icons/dept.svg"); }
        &.icon4 { background-image: url("@/assets/icons/role.svg"); }
      }
    }
  }

  .hFoot {
    margin-top: $space-5;

    .fTit {
      font-size: $text-footnote;
      font-weight: $font-weight-semibold;
      color: $label-tertiary;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: $space-3;
    }

    .imgItem {
      display: flex;
      padding: 0;
      margin: 0;
      list-style: none;
      align-items: center;

      li {
        margin-right: -10px;
        transition: transform $duration-fast $ease-out;

        &:hover {
          transform: translateY(-4px) scale(1.1);
          z-index: 10;
        }

        span {
          display: flex;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid $bg-primary;
          overflow: hidden;
          background: $system-gray6;
          align-items: center;
          justify-content: center;
          box-shadow: $shadow-sm;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        &:last-child {
          margin-right: 0;
          span {
            background: $system-gray5;
            color: $label-secondary;
            font-size: 11px;
            font-weight: $font-weight-bold;
          }
        }
      }
    }
  }
}

:deep(.el-card__header) {
  border-bottom: none;
  padding-bottom: 0;
}
</style>
