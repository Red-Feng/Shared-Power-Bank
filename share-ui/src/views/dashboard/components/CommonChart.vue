<template>
  <div ref="chartRef" class="monitorContainer"></div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';

/**
 * 通用图表组件
 * 支持折线图和柱状图，可动态配置数据、时间轴和单位
 */
const props = defineProps({
  // 图表数据 { incomeData: [], refundData: [] }
  data: {
    type: Object,
    default: () => ({ incomeData: [], refundData: [] }),
  },
  // 时间轴数据
  time: {
    type: Array,
    default: () => [],
  },
  // 图表类型：'line' | 'bar'
  type: {
    type: String,
    default: 'line',
  },
  // 数值单位：'元' | '人' | '次'
  unit: {
    type: String,
    default: '元',
  },
  // 系列名称配置
  seriesNames: {
    type: Array,
    default: () => ['收入', '支出'],
  },
});

const chartRef = ref(null);
let myChart = null;

/**
 * 初始化并设置图表配置项
 */
const setOption = () => {
  if (!chartRef.value) return;

  if (!myChart) {
    myChart = echarts.init(chartRef.value);
  }

  const isLine = props.type === 'line';
  
  const option = {
    color: ['#007AFF', '#34C759'], // Apple Blue and Green
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderWidth: 0,
      textStyle: {
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
      },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      formatter(params) {
        let relVal = `<div style="font-weight: 600; margin-bottom: 4px;">${params[0].name}</div>`;
        params.forEach(item => {
          relVal += `<div style="display: flex; justify-content: space-between; gap: 20px;">
            <span>${item.marker}${item.seriesName}</span>
            <span style="font-weight: 600;">${item.value}${props.unit}</span>
          </div>`;
        });
        return relVal;
      },
    },
    grid: {
      left: '0',
      right: '10px',
      top: '40px',
      bottom: '10px',
      containLabel: true,
    },
    legend: {
      show: true,
      icon: 'circle',
      right: 0,
      top: 0,
      textStyle: {
        color: 'rgba(60, 60, 67, 0.6)',
        fontSize: 12
      }
    },
    xAxis: {
      type: 'category',
      data: props.time,
      boundaryGap: !isLine,
      axisLabel: { 
        color: 'rgba(60, 60, 67, 0.6)',
        fontSize: 11,
        fontFamily: 'SF Pro Text'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        color: 'rgba(60, 60, 67, 0.6)',
        fontSize: 11,
        fontFamily: 'SF Pro Text'
      },
      splitLine: {
        lineStyle: { 
          color: 'rgba(60, 60, 67, 0.1)',
          type: 'solid'
        },
      },
    },
    series: [
      {
        name: props.seriesNames[0],
        data: props.data.incomeData,
        type: props.type,
        smooth: true,
        symbolSize: 0,
        lineStyle: { width: 3 },
        areaStyle: isLine ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 122, 255, 0.2)' },
            { offset: 1, color: 'rgba(0, 122, 255, 0)' }
          ])
        } : undefined,
        barWidth: !isLine ? '12px' : undefined,
        itemStyle: !isLine ? { borderRadius: [4, 4, 0, 0] } : undefined
      },
      {
        name: props.seriesNames[1],
        data: props.data.refundData,
        type: props.type,
        smooth: true,
        symbolSize: 0,
        lineStyle: { width: 3 },
        areaStyle: isLine ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(52, 199, 89, 0.2)' },
            { offset: 1, color: 'rgba(52, 199, 89, 0)' }
          ])
        } : undefined,
        barWidth: !isLine ? '12px' : undefined,
        itemStyle: !isLine ? { borderRadius: [4, 4, 0, 0] } : undefined
      },
    ],
  };

  myChart.setOption(option, true);
};

// 监听数据变化重新渲染
watch(() => [props.data, props.time, props.type], () => {
  nextTick(setOption);
}, { deep: true });

// 窗口缩放自适应
const handleResize = () => {
  myChart?.resize();
};

onMounted(() => {
  setOption();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
  myChart = null;
});
</script>

<style scoped>
.monitorContainer {
  width: 100%;
  height: 210px;
}
</style>
