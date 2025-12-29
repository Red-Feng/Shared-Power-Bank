// 仪表盘配色相关的简单 Pinia store

const useSettingStore = defineStore(
  'dashboard-color-settings',
  {
    state: () => ({
      // 图表配色（与 utils/color 中默认值保持一致）
      chartColors: {
        textColor: '#303133',
        containerColor: '#ffffff'
      }
    }),
    actions: {
      setChartColors(payload) {
        if (!payload || typeof payload !== 'object') return
        this.chartColors = {
          ...this.chartColors,
          ...payload
        }
      }
    }
  }
)

export default useSettingStore


