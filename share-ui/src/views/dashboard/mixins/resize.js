import { debounce } from '@/utils/index.js'

export default {
  data() {
    return {
      $_resizeHandler: null
    }
  },
  mounted() {
    this.$_resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.$_resizeHandler)
  },
  beforeDestroy() {
    if (this.$_resizeHandler) {
      window.removeEventListener('resize', this.$_resizeHandler)
    }
  }
}

