<template>
  <div class="app-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">总数据量</div>
            <div class="stat-value">{{ statistics.total || 0 }}</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" color="#409EFF"><DataAnalysis /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">平均健康度</div>
            <div class="stat-value">{{ statistics.average || 0 }}%</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" color="#67C23A"><TrendCharts /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">最高健康度</div>
            <div class="stat-value">{{ statistics.max || 0 }}%</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" color="#E6A23C"><Top /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-label">最低健康度</div>
            <div class="stat-value">{{ statistics.min || 0 }}%</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40" color="#F56C6C"><Bottom /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 健康度分布 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">健康度分布</span>
          </template>
          <div ref="healthDistributionChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">健康度统计</span>
          </template>
          <div class="health-stats">
            <div class="health-item">
              <span class="health-label excellent">优秀 (≥80%)</span>
              <span class="health-value">{{ statistics.excellent || 0 }}</span>
            </div>
            <div class="health-item">
              <span class="health-label good">良好 (60%-80%)</span>
              <span class="health-value">{{ statistics.good || 0 }}</span>
            </div>
            <div class="health-item">
              <span class="health-label fair">一般 (40%-60%)</span>
              <span class="health-value">{{ statistics.fair || 0 }}</span>
            </div>
            <div class="health-item">
              <span class="health-label poor">较差 (报修) (&lt;40%)</span>
              <span class="health-value">{{ statistics.poor || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 电池模型训练分析 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">损失曲线</span>
            </div>
          </template>
          <div class="chart-image-container">
            <img 
              :src="lossImageUrl" 
              alt="损失曲线" 
              class="chart-image"
              @error="handleImageError('loss')"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">准确率曲线</span>
          </template>
          <div class="chart-image-container">
            <img 
              :src="accuracyImageUrl" 
              alt="准确率曲线" 
              class="chart-image"
              @error="handleImageError('accuracy')"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 机器学习模型分析 -->
    <el-row :gutter="20" class="mb20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">线性回归分析</span>
          </template>
          <div v-if="mlModelData.linear_regression" class="ml-info">
            <div class="ml-equation">
              <div class="equation-title">
                <el-icon><Document /></el-icon>
                <span>回归方程</span>
              </div>
              <div class="equation-content">
                <div class="equation-formula">
                  <span class="equation-var">Health</span>
                  <span class="equation-equals">=</span>
                  <template v-if="mlModelData.linear_regression.coefficients && mlModelData.linear_regression.coefficients.length >= 2">
                    <span class="equation-coeff">{{ formatCoefficient(mlModelData.linear_regression.coefficients[0]) }}</span>
                    <span class="equation-var">× Cycles</span>
                    <span class="equation-op">{{ formatOperator(mlModelData.linear_regression.coefficients[1]) }}</span>
                    <span class="equation-coeff">{{ formatCoefficient(Math.abs(mlModelData.linear_regression.coefficients[1])) }}</span>
                    <span class="equation-var">× Temp</span>
                    <span class="equation-op">{{ formatOperator(mlModelData.linear_regression.intercept) }}</span>
                    <span class="equation-coeff">{{ formatCoefficient(Math.abs(mlModelData.linear_regression.intercept)) }}</span>
                  </template>
                  <template v-else>
                    <span class="equation-simple-text">{{ mlModelData.linear_regression.equation || 'N/A' }}</span>
                  </template>
                </div>
              </div>
            </div>
            <div class="ml-metrics">
              <div class="metrics-title">
                <el-icon><TrendCharts /></el-icon>
                <span>模型评估指标</span>
              </div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="metric-card">
                    <div class="metric-header">
                      <span class="metric-label">训练集 R²</span>
                      <el-tag :type="getR2TagType(mlModelData.linear_regression.r2_train)" size="small" effect="dark">
                        {{ getR2Level(mlModelData.linear_regression.r2_train) }}
                      </el-tag>
                    </div>
                    <div class="metric-value" :style="{ color: getR2Color(mlModelData.linear_regression.r2_train) }">
                      {{ formatR2(mlModelData.linear_regression.r2_train) }}
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="metric-card">
                    <div class="metric-header">
                      <span class="metric-label">测试集 R²</span>
                      <el-tag :type="getR2TagType(mlModelData.linear_regression.r2_test)" size="small" effect="dark">
                        {{ getR2Level(mlModelData.linear_regression.r2_test) }}
                      </el-tag>
                    </div>
                    <div class="metric-value" :style="{ color: getR2Color(mlModelData.linear_regression.r2_test) }">
                      {{ formatR2(mlModelData.linear_regression.r2_test) }}
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-empty description="暂无线性回归数据" :image-size="100" />
          </div>
          <div ref="linearRegressionChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">机器学习模型训练历史</span>
          </template>
          <div v-if="mlModelData.ml_model">
            <div class="ml-info">
              <div class="metrics-title">
                <el-icon><DataAnalysis /></el-icon>
                <span>模型性能指标</span>
              </div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="metric-card">
                    <div class="metric-header">
                      <span class="metric-label">训练损失</span>
                      <el-icon class="metric-icon" :color="getLossColor(mlModelData.ml_model.final_train_loss)"><ArrowDown /></el-icon>
                    </div>
                    <div class="metric-value loss-value">
                      {{ formatLoss(mlModelData.ml_model.final_train_loss) }}
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="metric-card">
                    <div class="metric-header">
                      <span class="metric-label">测试损失</span>
                      <el-icon class="metric-icon" :color="getLossColor(mlModelData.ml_model.final_test_loss)"><ArrowDown /></el-icon>
                    </div>
                    <div class="metric-value loss-value">
                      {{ formatLoss(mlModelData.ml_model.final_test_loss) }}
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="metric-card">
                    <div class="metric-header">
                      <span class="metric-label">训练准确率</span>
                      <el-tag :type="getR2TagType(mlModelData.ml_model.final_train_acc)" size="small" effect="dark">
                        {{ getR2Level(mlModelData.ml_model.final_train_acc) }}
                      </el-tag>
                    </div>
                    <div class="metric-value" :style="{ color: getR2Color(mlModelData.ml_model.final_train_acc) }">
                      {{ formatR2(mlModelData.ml_model.final_train_acc) }}
                    </div>
                    <div class="metric-subtitle">R² 决定系数</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="metric-card">
                    <div class="metric-header">
                      <span class="metric-label">测试准确率</span>
                      <el-tag :type="getR2TagType(mlModelData.ml_model.final_test_acc)" size="small" effect="dark">
                        {{ getR2Level(mlModelData.ml_model.final_test_acc) }}
                      </el-tag>
                    </div>
                    <div class="metric-value" :style="{ color: getR2Color(mlModelData.ml_model.final_test_acc) }">
                      {{ formatR2(mlModelData.ml_model.final_test_acc) }}
                    </div>
                    <div class="metric-subtitle">R² 决定系数</div>
                  </div>
                </el-col>
              </el-row>
            </div>
            <div class="ml-charts-container">
               <div ref="mlLossChart" class="chart-container-small"></div>
               <div ref="mlAccuracyChart" class="chart-container-small"></div>
               <div ref="mlLearningRateChart" class="chart-container-small"></div>
             </div>
          </div>
          <div v-else class="empty-state">
            <el-empty description="暂无训练数据" :image-size="100" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">电池数据列表</span>
          <el-button type="text" icon="Download" @click="exportData">导出数据</el-button>
        </div>
      </template>
      <el-table 
        v-loading="loading" 
        :data="paginatedDataList" 
        stripe 
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="充放电次数" label="充放电次数" width="130" align="center" />
        <el-table-column prop="环境温度" label="环境温度(℃)" width="140" align="center">
          <template #default="scope">
            <span :style="{ color: getTemperatureColor(parseFloat(scope.row.环境温度 || 0)) }">
              {{ parseFloat(scope.row.环境温度 || 0).toFixed(1) }}℃
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="电池量" label="电池健康度" width="180" align="center">
          <template #default="scope">
            <el-progress 
              :percentage="parseFloat(scope.row.电池量 || 0) * 100" 
              :color="getHealthColor(parseFloat(scope.row.电池量 || 0))"
              :format="format => format.toFixed(2) + '%'"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column label="健康状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getHealthTagType(parseFloat(scope.row.电池量 || 0))" effect="dark">
              {{ getHealthStatus(parseFloat(scope.row.电池量 || 0)) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="dataList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getBatteryAnalysis, getBatteryStatistics } from '@/api/device/battery'
import { ElMessage } from 'element-plus'
import { DataAnalysis, TrendCharts, Top, Bottom, Document, ArrowDown } from '@element-plus/icons-vue'

const loading = ref(false)
const dataList = ref([])
const statistics = reactive({
  total: 0,
  average: 0,
  max: 0,
  min: 0,
  excellent: 0,
  good: 0,
  fair: 0,
  poor: 0
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const paginatedDataList = ref([])

const healthDistributionChart = ref(null)
const linearRegressionChart = ref(null)
const mlLossChart = ref(null)
const mlAccuracyChart = ref(null)
const mlLearningRateChart = ref(null)
let healthChartInstance = null
let linearRegressionChartInstance = null
let mlLossChartInstance = null
let mlAccuracyChartInstance = null
let mlLearningRateChartInstance = null

// 图片URL - 直接使用前端 assets 目录下的图片
import lossImage from '@/assets/images/image1.png'
import accuracyImage from '@/assets/images/image.png'

const lossImageUrl = ref(lossImage)
const accuracyImageUrl = ref(accuracyImage)

// 机器学习模型数据
const mlModelData = reactive({
  linear_regression: null,
  ml_model: null
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 先加载统计数据（更快，使用缓存）
    const statisticsPromise = getBatteryStatistics()
    
    // 立即显示统计数据，不等待分析数据
    statisticsPromise.then(statisticsRes => {
      if (statisticsRes && statisticsRes.data) {
        Object.assign(statistics, statisticsRes.data)
        nextTick().then(() => {
          renderHealthDistributionChart()
        })
      }
    }).catch(err => {
      console.warn('统计数据加载失败:', err)
    })
    
    // 加载分析数据
    const analysisRes = await getBatteryAnalysis()
    
    // 基础数据加载 - 即使没有 ML 数据也要显示图表
    if (analysisRes && analysisRes.data) {
      dataList.value = analysisRes.data.dataList || []
      updatePaginatedData()
      
      // 保存机器学习模型数据（可选）
      if (analysisRes.data.mlModel) {
        mlModelData.linear_regression = analysisRes.data.mlModel.linear_regression || null
        mlModelData.ml_model = analysisRes.data.mlModel.ml_model || null
      } else {
        // 如果没有 ML 数据，清空相关数据
        mlModelData.linear_regression = null
        mlModelData.ml_model = null
      }
      
      // 立即渲染基础图表（不依赖 ML 数据）
      await nextTick()
      renderCharts(analysisRes.data)
    }
    
    // 等待统计数据完成（如果还没完成）
    const statisticsRes = await statisticsPromise
    if (statisticsRes && statisticsRes.data) {
      Object.assign(statistics, statisticsRes.data)
      await nextTick()
      renderHealthDistributionChart()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    const errorMsg = error?.response?.data?.msg || error?.message || '加载数据失败，请稍后重试'
    ElMessage.error(errorMsg)
    
    // 即使失败也尝试渲染图表（使用已有数据）
    await nextTick()
    renderCharts({})
  } finally {
    loading.value = false
  }
}

// 分页处理
const updatePaginatedData = () => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  paginatedDataList.value = dataList.value.slice(start, end)
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  updatePaginatedData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  updatePaginatedData()
}

// 渲染分析图表
const renderCharts = (data) => {
  renderHealthDistributionChart()
  
  // ML 相关图表，只有在有数据时才渲染
  if (mlModelData.linear_regression || mlModelData.ml_model) {
    renderLinearRegressionChart(data)
    renderMLLossChart()
    renderMLAccuracyChart()
    renderMLLearningRateChart()
  }
}

// 图片直接通过 img 标签显示，不再需要渲染函数

// 渲染健康度分布图表
const renderHealthDistributionChart = () => {
  if (!healthDistributionChart.value) return
  
  if (healthChartInstance) {
    healthChartInstance.dispose()
  }
  
  healthChartInstance = echarts.init(healthDistributionChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '健康度分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: statistics.excellent, name: '优秀', itemStyle: { color: '#67C23A' } },
          { value: statistics.good, name: '良好', itemStyle: { color: '#409EFF' } },
          { value: statistics.fair, name: '一般', itemStyle: { color: '#E6A23C' } },
          { value: statistics.poor, name: '较差 (报修)', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }
  
  healthChartInstance.setOption(option)
  
  window.addEventListener('resize', () => {
    if (healthChartInstance) {
      healthChartInstance.resize()
    }
  })
}

// 获取健康度颜色
const getHealthColor = (health) => {
  if (health >= 0.8) return '#67C23A'
  if (health >= 0.6) return '#409EFF'
  if (health >= 0.4) return '#E6A23C'
  return '#F56C6C'
}

// 获取健康状态
const getHealthStatus = (health) => {
  if (health >= 0.8) return '优秀'
  if (health >= 0.6) return '良好'
  if (health >= 0.4) return '一般'
  return '较差 (报修)'
}

// 获取健康标签类型
const getHealthTagType = (health) => {
  if (health >= 0.8) return 'success'
  if (health >= 0.6) return 'primary'
  if (health >= 0.4) return 'warning'
  return 'danger'
}

// 获取温度颜色
const getTemperatureColor = (temp) => {
  if (temp < 0) return '#409EFF'  // 蓝色 - 低温
  if (temp < 15) return '#67C23A'  // 绿色 - 适宜
  if (temp < 30) return '#E6A23C'  // 橙色 - 偏高
  return '#F56C6C'  // 红色 - 高温
}

// 获取 R² 颜色
const getR2Color = (r2) => {
  if (r2 >= 0.8) return '#67C23A'  // 绿色 - 优秀
  if (r2 >= 0.6) return '#409EFF'  // 蓝色 - 良好
  if (r2 >= 0.3) return '#E6A23C'  // 橙色 - 一般
  return '#909399'  // 灰色 - 较差
}

// 获取 R² 标签类型
const getR2TagType = (r2) => {
  if (r2 >= 0.8) return 'success'
  if (r2 >= 0.6) return 'primary'
  if (r2 >= 0.3) return 'warning'
  return 'info'
}

// 获取 R² 等级
const getR2Level = (r2) => {
  if (r2 >= 0.8) return '优秀'
  if (r2 >= 0.6) return '良好'
  if (r2 >= 0.3) return '一般'
  return '较差'
}

// 格式化 R² 值
const formatR2 = (r2) => {
  if (r2 === null || r2 === undefined || isNaN(r2)) return 'N/A'
  const percent = r2 * 100
  if (percent < 0.01 && percent > -0.01) return '0.00%'
  if (percent < 1 && percent > -1) return percent.toFixed(2) + '%'
  return percent.toFixed(2) + '%'
}

// 格式化损失值
const formatLoss = (loss) => {
  if (loss === null || loss === undefined || isNaN(loss)) return 'N/A'
  if (loss < 0.0001) {
    return loss.toExponential(2)
  }
  if (loss < 1) {
    return loss.toFixed(4)
  }
  return loss.toFixed(2)
}

// 获取损失值颜色
const getLossColor = (loss) => {
  if (loss === null || loss === undefined || isNaN(loss)) return '#909399'
  if (loss < 0.001) return '#67C23A'  // 绿色 - 很好
  if (loss < 0.01) return '#409EFF'  // 蓝色 - 良好
  if (loss < 0.1) return '#E6A23C'  // 橙色 - 一般
  return '#F56C6C'  // 红色 - 较差
}

// 格式化系数
const formatCoefficient = (coeff) => {
  if (coeff === null || coeff === undefined || isNaN(coeff)) return '0'
  if (Math.abs(coeff) < 0.0001) {
    return coeff.toExponential(2)
  }
  if (Math.abs(coeff) < 1) {
    return coeff.toFixed(4)
  }
  return coeff.toFixed(2)
}

// 格式化运算符
const formatOperator = (value) => {
  return value >= 0 ? '+' : '-'
}

// 格式化方程
const formatEquation = (equation) => {
  if (!equation) return ''
  // 美化方程显示
  return equation
    .replace(/Health\s*=/g, '<span class="eq-var">Health</span> =')
    .replace(/\* Cycles/g, '<span class="eq-op">×</span> <span class="eq-var">Cycles</span>')
    .replace(/\* Temp/g, '<span class="eq-op">×</span> <span class="eq-var">Temp</span>')
    .replace(/([+-]?\d+\.?\d*)/g, '<span class="eq-num">$1</span>')
}

// 渲染线性回归图表
const renderLinearRegressionChart = (data) => {
  if (!linearRegressionChart.value || !mlModelData.linear_regression) return
  
  if (linearRegressionChartInstance) {
    linearRegressionChartInstance.dispose()
  }
  
  linearRegressionChartInstance = echarts.init(linearRegressionChart.value)
  
  const cyclesList = data?.cyclesList || []
  const tempList = data?.tempList || []
  const healthList = data?.healthList || []
  
  if (cyclesList.length === 0 || healthList.length === 0) {
    return
  }
  
  // 准备散点数据
  const scatterData = cyclesList.map((cycles, index) => [
    cycles,
    healthList[index] || 0
  ]).sort((a, b) => a[0] - b[0])
  
  // 计算回归线数据
  const lr = mlModelData.linear_regression
  const minCycles = Math.min(...cyclesList)
  const maxCycles = Math.max(...cyclesList)
  
  // 使用 coefficients 数组计算回归线（如果有两个系数：Cycles 和 Temp）
  // 为了简化，我们使用平均温度来计算回归线
  const avgTemp = tempList.length > 0 ? tempList.reduce((a, b) => a + b, 0) / tempList.length : 0
  const cyclesCoeff = lr.coefficients && lr.coefficients.length > 0 ? lr.coefficients[0] : 0
  const tempCoeff = lr.coefficients && lr.coefficients.length > 1 ? lr.coefficients[1] : 0
  const intercept = lr.intercept || 0
  
  const regressionLine = [
    [minCycles, cyclesCoeff * minCycles + tempCoeff * avgTemp + intercept],
    [maxCycles, cyclesCoeff * maxCycles + tempCoeff * avgTemp + intercept]
  ]
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        if (params.length > 0) {
          const param = params[0]
          if (param.seriesName === '回归线') {
            return `回归线<br/>充放电次数: ${param.value[0].toFixed(1)}<br/>预测健康度: ${param.value[1].toFixed(4)}`
          } else {
            return `充放电次数: ${param.value[0].toFixed(1)}<br/>健康度: ${param.value[1].toFixed(4)}`
          }
        }
        return ''
      }
    },
    legend: {
      data: ['实际数据', '回归线'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '充放电次数',
      nameLocation: 'middle',
      nameGap: 30,
      scale: true
    },
    yAxis: {
      type: 'value',
      name: '健康度',
      nameLocation: 'middle',
      nameGap: 50,
      min: 0,
      max: 1
    },
    series: [
      {
        name: '实际数据',
        type: 'scatter',
        data: scatterData,
        symbolSize: (val) => {
          const health = val[1]
          return health >= 0.8 ? 8 : health >= 0.6 ? 6 : health >= 0.4 ? 5 : 4
        },
        itemStyle: {
          color: (params) => {
            const health = params.value[1]
            return getHealthColor(health)
          },
          opacity: 0.7
        }
      },
      {
        name: '回归线',
        type: 'line',
        data: regressionLine,
        lineStyle: {
          color: '#409EFF',
          width: 2,
          type: 'dashed'
        },
        symbol: 'none',
        smooth: false
      }
    ]
  }
  
  linearRegressionChartInstance.setOption(option)
  
  window.addEventListener('resize', () => {
    if (linearRegressionChartInstance) {
      linearRegressionChartInstance.resize()
    }
  })
}

// 渲染机器学习训练损失图表
const renderMLLossChart = () => {
  if (!mlLossChart.value || !mlModelData.ml_model) return
  
  if (mlLossChartInstance) {
    mlLossChartInstance.dispose()
  }
  
  mlLossChartInstance = echarts.init(mlLossChart.value)
  
  const mlModel = mlModelData.ml_model
  const trainLoss = mlModel.history?.train_loss || []
  const testLoss = mlModel.history?.test_loss || []
  
  if (trainLoss.length === 0) return
  
  const epochs = trainLoss.map((_, index) => index + 1)
  
  const option = {
    title: {
      text: '训练与测试损失 (Loss)',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['训练损失', '测试损失'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: epochs,
      name: 'Epoch'
    },
    yAxis: {
      type: 'value',
      name: 'Loss'
    },
    series: [
      {
        name: '训练损失',
        type: 'line',
        data: trainLoss,
        smooth: true,
        lineStyle: { color: '#F56C6C', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
            ]
          }
        }
      },
      {
        name: '测试损失',
        type: 'line',
        data: testLoss,
        smooth: true,
        lineStyle: { color: '#E6A23C', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
              { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
            ]
          }
        }
      }
    ]
  }
  
  mlLossChartInstance.setOption(option)
  
  window.addEventListener('resize', () => {
    if (mlLossChartInstance) mlLossChartInstance.resize()
  })
}

// 渲染机器学习训练准确率图表
const renderMLAccuracyChart = () => {
  if (!mlAccuracyChart.value || !mlModelData.ml_model) return
  
  if (mlAccuracyChartInstance) {
    mlAccuracyChartInstance.dispose()
  }
  
  mlAccuracyChartInstance = echarts.init(mlAccuracyChart.value)
  
  const mlModel = mlModelData.ml_model
  const trainAcc = mlModel.history?.train_accuracy || []
  const testAcc = mlModel.history?.test_accuracy || []
  
  if (trainAcc.length === 0) return
  
  const epochs = trainAcc.map((_, index) => index + 1)
  
  const option = {
    title: {
      text: '训练与测试准确率 (R²)',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['训练准确率 (R²)', '测试准确率 (R²)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: epochs,
      name: 'Epoch'
    },
    yAxis: {
      type: 'value',
      name: 'R²',
      min: 0,
      max: 1,
      axisLabel: {
        formatter: (value) => (value * 100).toFixed(0) + '%'
      }
    },
    series: [
      {
        name: '训练准确率 (R²)',
        type: 'line',
        data: trainAcc,
        smooth: true,
        lineStyle: { color: '#67C23A', width: 2 }
      },
      {
        name: '测试准确率 (R²)',
        type: 'line',
        data: testAcc,
        smooth: true,
        lineStyle: { color: '#409EFF', width: 2 }
      }
    ]
  }
  
  mlAccuracyChartInstance.setOption(option)
   
   window.addEventListener('resize', () => {
     if (mlAccuracyChartInstance) mlAccuracyChartInstance.resize()
   })
 }
 
 // 渲染机器学习学习率图表
 const renderMLLearningRateChart = () => {
   if (!mlLearningRateChart.value || !mlModelData.ml_model) return
   
   if (mlLearningRateChartInstance) {
     mlLearningRateChartInstance.dispose()
   }
   
   mlLearningRateChartInstance = echarts.init(mlLearningRateChart.value)
   
   const mlModel = mlModelData.ml_model
   const learningRate = mlModel.history?.learning_rate || []
   
   if (learningRate.length === 0) return
   
   const epochs = learningRate.map((_, index) => index + 1)
   
   const option = {
     title: {
       text: '学习率衰减 (Learning Rate)',
       left: 'center',
       textStyle: { fontSize: 14 }
     },
     tooltip: {
       trigger: 'axis'
     },
     grid: {
       left: '3%',
       right: '4%',
       bottom: '15%',
       containLabel: true
     },
     xAxis: {
       type: 'category',
       boundaryGap: false,
       data: epochs,
       name: 'Epoch'
     },
     yAxis: {
       type: 'value',
       name: 'LR'
     },
     series: [
       {
         name: '学习率',
         type: 'line',
         data: learningRate,
         step: 'end',
         lineStyle: { color: '#909399', width: 2 },
         areaStyle: {
           color: 'rgba(144, 147, 153, 0.1)'
         }
       }
     ]
   }
   
   mlLearningRateChartInstance.setOption(option)
   
   window.addEventListener('resize', () => {
     if (mlLearningRateChartInstance) mlLearningRateChartInstance.resize()
   })
 }

// 导出数据
const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

// 处理图片加载错误
const handleImageError = (type) => {
  console.error(`${type} 图片加载失败`)
  ElMessage.error(`${type === 'loss' ? '损失曲线' : '准确率曲线'} 图片加载失败`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
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

.stat-icon {
  margin-left: 20px;
  opacity: 0.8;
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

.chart-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
}

.ml-charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-container-small {
  width: 100%;
  height: 220px;
  min-height: 220px;
}

.chart-image-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fafafa;
}

.chart-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.chart-container-large {
  width: 100%;
  height: 500px;
  min-height: 500px;
}

.health-stats {
  padding: 20px;
}

.health-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.health-label {
  font-size: 14px;
  font-weight: 500;

  &.excellent {
    color: #67C23A;
  }

  &.good {
    color: #409EFF;
  }

  &.fair {
    color: #E6A23C;
  }

  &.poor {
    color: #F56C6C;
  }
}

.health-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

.ml-info {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ml-equation {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.equation-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  
  .el-icon {
    color: #409EFF;
    font-size: 18px;
  }
}

.equation-content {
  padding: 15px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.equation-formula {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 15px;
  line-height: 1.8;
  
  .equation-var {
    color: #409EFF;
    font-weight: 600;
    padding: 0 2px;
  }
  
  .equation-equals {
    color: #303133;
    font-weight: bold;
    margin: 0 4px;
  }
  
  .equation-coeff {
    color: #E6A23C;
    font-weight: 600;
    padding: 0 2px;
  }
  
  .equation-op {
    color: #67C23A;
    font-weight: 600;
    margin: 0 4px;
  }
  
  .equation-simple-text {
    color: #606266;
    font-size: 14px;
    word-break: break-all;
  }
}

.equation-simple {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #606266;
  font-size: 13px;
  word-break: break-all;
}

.ml-metrics {
  margin-top: 20px;
}

.metrics-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  
  .el-icon {
    color: #67C23A;
    font-size: 18px;
  }
}

.metric-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 12px;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-label {
  color: #606266;
  font-size: 13px;
  font-weight: 500;
}

.metric-icon {
  font-size: 16px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
  
  &.loss-value {
    font-family: 'Courier New', monospace;
    font-size: 18px;
  }
}

.metric-subtitle {
  margin-top: 5px;
  font-size: 11px;
  color: #909399;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.empty-state {
  padding: 20px;
  text-align: center;
}
</style>

