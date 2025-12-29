<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="100px">
      <el-form-item label="查询" prop="orderNo">
        <el-input
            v-model="searchObj.select"
            placeholder="请输入订单报表需求（如：11月、本月、今天等）"
            clearable/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="showChart">查询</el-button>
        <el-button type="success" icon="DataAnalysis" @click="generateChartDirectly">直接生成图表</el-button>
      </el-form-item>
    </el-form>
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">订单统计图表</span>
          <el-button
            v-if="xData.length > 0 && yData.length > 0"
            type="text"
            icon="Download"
            @click="exportChart"
          >
            导出图表
          </el-button>
        </div>
      </template>
    <div ref="chart" style="width: 100%; height: 500px;"></div>
    </el-card>
  </div>
</template>
 
<script>
import * as echarts from 'echarts';
import { getOrderCount } from "@/api/sta/sta";

export default {
    data() {
        return {
            searchObj: {
                select: ''
            },
            btnDisabled: false,
            chart: null,
            title: '',
            xData: [], // x轴数据
            yData: [] // y轴数据
        }
    },
    methods: {
        // 直接生成图表（不经过AI和数据库）
        generateChartDirectly() {
            const message = this.searchObj.select ? this.searchObj.select.trim().toLowerCase() : '';
            
            // 根据用户输入生成模拟数据
            let xData = [];
            let yData = [];
            let chartTitle = '订单统计';
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1; // 月份从0开始，所以+1
            const currentDay = today.getDate();
            
            // 辅助函数：格式化日期为 YYYY-MM-DD
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            // 生成模拟数据
            if (message.includes('11月') || message.includes('十一月')) {
                chartTitle = '11月订单统计';
                const targetMonth = 11;
                const targetYear = currentMonth > 11 ? currentYear : (currentMonth === 11 ? currentYear : currentYear - 1);
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('12月') || message.includes('十二月')) {
                chartTitle = '12月订单统计';
                const targetMonth = 12;
                const targetYear = currentMonth === 12 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('1月') || message.includes('一月')) {
                chartTitle = '1月订单统计';
                const targetMonth = 1;
                const targetYear = currentMonth >= 1 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('2月') || message.includes('二月')) {
                chartTitle = '2月订单统计';
                const targetMonth = 2;
                const targetYear = currentMonth >= 2 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('3月') || message.includes('三月')) {
                chartTitle = '3月订单统计';
                const targetMonth = 3;
                const targetYear = currentMonth >= 3 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('4月') || message.includes('四月')) {
                chartTitle = '4月订单统计';
                const targetMonth = 4;
                const targetYear = currentMonth >= 4 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('5月') || message.includes('五月')) {
                chartTitle = '5月订单统计';
                const targetMonth = 5;
                const targetYear = currentMonth >= 5 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('6月') || message.includes('六月')) {
                chartTitle = '6月订单统计';
                const targetMonth = 6;
                const targetYear = currentMonth >= 6 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('7月') || message.includes('七月')) {
                chartTitle = '7月订单统计';
                const targetMonth = 7;
                const targetYear = currentMonth >= 7 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('8月') || message.includes('八月')) {
                chartTitle = '8月订单统计';
                const targetMonth = 8;
                const targetYear = currentMonth >= 8 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('9月') || message.includes('九月')) {
                chartTitle = '9月订单统计';
                const targetMonth = 9;
                const targetYear = currentMonth >= 9 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('10月') || message.includes('十月')) {
                chartTitle = '10月订单统计';
                const targetMonth = 10;
                const targetYear = currentMonth >= 10 ? currentYear : currentYear - 1;
                const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
                const maxDay = targetYear === currentYear && targetMonth === currentMonth ? currentDay : daysInMonth;
                xData = [];
                yData = [];
                for (let i = 1; i <= maxDay; i++) {
                    xData.push(`${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('本月') || message.includes('这个月')) {
                chartTitle = '本月订单统计';
                const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                xData = [];
                yData = [];
                for (let i = 1; i <= currentDay; i++) {
                    xData.push(formatDate(new Date(currentYear, currentMonth - 1, i)));
                    yData.push(Math.floor(Math.random() * 30) + 10);
                }
            } else if (message.includes('今天') || message.includes('今日')) {
                chartTitle = '今日订单统计';
                const hours = [];
                const counts = [];
                for (let i = 0; i < 24; i++) {
                    hours.push(`${String(i).padStart(2, '0')}:00`);
                    counts.push(Math.floor(Math.random() * 20) + 5);
                }
                xData = hours;
                yData = counts;
            } else {
                // 默认生成最近7天的数据（从今天向前推7天）
                chartTitle = '最近7天订单统计';
                const dates = [];
                const counts = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    dates.push(formatDate(date));
                    counts.push(Math.floor(Math.random() * 30) + 10);
                }
                xData = dates;
                yData = counts;
            }
            
            this.xData = xData;
            this.yData = yData;
            this.title = chartTitle;
            this.setChartData();
            this.$message.success('图表已生成（模拟数据）');
        },
        
        // 初始化图表数据（通过API）
        showChart() {
          // 检查查询条件
          if (!this.searchObj.select || this.searchObj.select.trim() === '') {
              this.$message.warning('请输入订单报表需求')
              return
          }
          
          getOrderCount(this.searchObj.select).then(response => {
                // 检查响应数据是否存在
                if (response && response.data) {
                    // 检查必要的数据字段是否存在
                    if (response.data.countList && response.data.dateList) {
                        this.yData = response.data.countList
                        this.xData = response.data.dateList
                        // 检查数据是否为空
                        if (this.xData.length === 0 || this.yData.length === 0) {
                            this.$message.warning('查询结果为空，没有找到相关订单数据')
                            // 清空图表
                            if (this.chart) {
                                this.chart.dispose()
                                this.chart = null
                            }
                        } else {
                            this.title = this.searchObj.select + '订单统计';
                            this.setChartData()
                        }
                    } else {
                        this.$message.error('返回数据格式不正确，缺少countList或dateList字段')
                    }
                } else {
                    this.$message.error('未获取到有效数据')
                }
            }).catch(error => {
                console.error('获取订单数据失败:', error)
                // 清空图表
                if (this.chart) {
                    this.chart.dispose()
                    this.chart = null
                }
                // 显示具体的错误信息
                let errorMessage = '获取订单数据失败，请检查查询条件或联系管理员'
                if (error && error.message) {
                    errorMessage = error.message
                } else if (typeof error === 'string') {
                    errorMessage = error
                }
                this.$message.error(errorMessage)
            })
        },
        
        setChartData() {
            // 如果已有图表实例，先销毁
            if (this.chart) {
                this.chart.dispose()
            }
            // 基于准备好的dom，初始化echarts实例
            this.chart = echarts.init(this.$refs.chart)
            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: this.title || '订单统计',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['订单数量'],
                    top: 30
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: this.xData,
                    axisLabel: {
                        rotate: 45, // 如果标签太长，旋转45度
                        interval: 0 // 显示所有标签
                    }
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1,
                    name: '订单数量'
                },
                series: [{
                    name: '订单数量',
                    type: 'bar',
                    data: this.yData,
                    itemStyle: {
                        color: '#409EFF'
                    },
                    label: {
                        show: true,
                        position: 'top'
                    }
                }]
            }
            // 使用刚指定的配置项和数据显示图表。
            this.chart.setOption(option)
        },
        
        // 导出图表
        exportChart() {
            if (!this.chart) {
                this.$message.warning('暂无图表可导出')
                return
            }
            
            const url = this.chart.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#fff'
            })
            
            const link = document.createElement('a')
            const fileName = this.title || '订单统计'
            link.download = `${fileName}_${new Date().getTime()}.png`
            link.href = url
            link.click()
            
            this.$message.success('图表导出成功')
        }
    }
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.box-card {
  margin-top: 20px;
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
</style>