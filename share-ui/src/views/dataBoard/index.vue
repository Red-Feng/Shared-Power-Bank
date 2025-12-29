<template>
  <div class="board-container">
    <div v-if="showWhich" class="back-btn" @click="backHome"><img src="@/assets/images/home.png">共享充电宝</div>
    <img v-else src="@/assets/images/fullscreen.png" alt="" class="fullscreen-img" @click="toDataBoard">
    <div class="time-stamp">{{ nowTime }}</div>
    <div class="board-title"><span>共享充电宝数据可视化平台</span></div>
    <div class="board-content flex-between">
      <div class="content-left flex-column-between">
        <div class="content-overview">
          <div class="box-title">业务总览</div>
          <div class="box-content flex-between">
            <div class="overview-object flex-column-center">
              <div class="object-count">{{ stationTotal }}</div>
              <div class="object-name">站点总数</div>
            </div>
            <div class="overview-meter flex-column-center">
              <div class="object-count">{{ deviceTotal }}</div>
              <div class="object-name">设备总数</div>
            </div>
            <div class="overview-alarm flex-column-center">
              <div class="object-count">{{ orderTotal }}</div>
              <div class="object-name">订单总数</div>
            </div>
          </div>
        </div>
        <div class="content-status">
          <div class="box-title">设备状态</div>
          <div class="box-content">
            <CirclePieChartVue height="100%" :pieData="pieData"/>
          </div>
        </div>
        <div class="content-alarm">
          <div class="box-title">报警信息</div>
          <div class="box-content">
            <alarmInfo />
          </div>
        </div>
      </div>
      <div class="content-middle flex-column-between">
        <div class="content-map" id="boardMap"></div>
        <div class="content-chart">
          <div class="box-title">今日订单趋势</div>
          <div class="box-content">
            <el-tabs
              v-model="activeName"
              @tab-click="handleClick"
              class="trend-tabs"
            >
              <el-tab-pane label="订单量" name="total">
                <TrendLineChart
                  v-if="activeName === 'total'"
                  :height="'100%'"
                  :yName="'单'"
                  :xData="xData"
                  :yData="orderData"
                />
              </el-tab-pane>
              <el-tab-pane label="收入" name="revenue">
                <TrendLineChart
                  v-if="activeName === 'revenue'"
                  :height="'100%'"
                  :yName="'元'"
                  :xData="xData"
                  :yData="revenueData"
                />
              </el-tab-pane>
              <el-tab-pane label="用户数" name="user">
                <TrendLineChart
                  v-if="activeName === 'user'"
                  :height="'100%'"
                  :yName="'人'"
                  :xData="xData"
                  :yData="userData"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
      <div class="content-right flex-column-between">
        <div class="content-statistics">
          <div class="box-title">今日业务统计</div>
          <div class="box-content flex-between">
            <div class="statistics-item flex-column-center">
              <el-icon :size="25" color="#00d1ff"><ShoppingBag /></el-icon>
              <div class="item-count">{{ todayOrderCount }}</div>
              <div style="text-align: center">订单数(单)</div>
            </div>
            <div class="statistics-item flex-column-center">
              <el-icon :size="25" color="#00d1ff"><Money /></el-icon>
              <div class="item-count">{{ todayRevenue}}</div>
              <div style="text-align: center">收入(元)</div>
            </div>
            <div class="statistics-item flex-column-center">
              <el-icon :size="25" color="#00d1ff"><User /></el-icon>
              <div class="item-count">{{ todayUserCount}}</div>
              <div style="text-align: center">用户数(人)</div>
            </div>
          </div>
        </div>
        <div class="content-trend">
          <div class="box-title">订单量对比曲线</div>
          <div class="box-content">
            <LineChart height="100%" :chartData="dailyP" :yName="'单'" xName=""/>
          </div>
        </div>
        <div class="content-carbon">
          <div class="box-title">今日收入统计</div>
          <div class="box-content">
            <barChart
              :height="'100%'"
              :barColor="['#1c508e', '#1be5e7']"
              :yName="'元'"
              :xData="xData"
              :yData="revenueData"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CirclePieChartVue from "@/views/dataBoard/CirclePieChart.vue";
import alarmInfo from "@/views/dataBoard/alarmInfo";
import LineChart from "@/views/dataBoard/LineChart.vue";
import barChart from "@/views/dataBoard/BarChart";
import TrendLineChart from "@/views/dataBoard/TrendLineChart";
import { ShoppingBag, Money, User } from "@element-plus/icons-vue";
export default {
  name: "dataBoard",
  components: {
    CirclePieChartVue,
    alarmInfo,
    LineChart,
    ShoppingBag,
    Money,
    User,
    barChart,
    TrendLineChart
  },
  data() {
    return {
      map: null,
      activeName: "total",
      nowTime: "",
      timer: null, // 定时任务
      showWhich: false, // 全屏按钮切换
      pieData: [],
      stationTotal: 0, // 站点总数
      deviceTotal: 0, // 设备总数
      orderTotal: 0, // 订单总数
      todayOrderCount: 0, // 今日订单数
      todayRevenue: 0, // 今日收入
      todayUserCount: 0, // 今日用户数
      xData:[],
      orderData:[], // 订单数据
      revenueData:[], // 收入数据
      userData:[], // 用户数据
      dailyP:{}, // 订单量对比数据
    };
  },
  methods: {
    // 获取设备状态统计（静态假数据）
    getEquipmentData() {
      // 静态假数据
      this.pieData = [
        { value: 156, name: "正常", itemStyle: {color: '#6be6c3'} },
        { value: 23, name: "故障", itemStyle: {color: '#e0c464'} },
        { value: 31, name: "未投入", itemStyle: {color: '#297ef8'} },
      ];
      this.deviceTotal = 210;
    },
    // 获取站点总数（静态假数据）
    getStationTotal() {
      this.stationTotal = 128;
    },
    // 获取订单总数（静态假数据）
    getOrderTotal() {
      this.orderTotal = 15680;
    },
    // 日期格式化辅助函数
    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    // 获取一天的开始时间
    getStartOfDay(date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    },
    // 获取一天的结束时间
    getEndOfDay(date) {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    },
    // 获取今日业务统计（静态假数据）
    getTodayStatistics() {
      this.todayOrderCount = 342;
      this.todayRevenue = 12850.60;
      this.todayUserCount = 298;
    },
    // 获取今日订单趋势数据（静态假数据）
    getOrderTrend() {
      this.xData = [];
      // 初始化24小时数据
      for (let i = 0; i < 24; i++) {
        this.xData.push(i < 10 ? '0' + i : i.toString());
      }
      
      // 静态假数据 - 订单量
      this.orderData = [5, 8, 12, 15, 18, 25, 32, 45, 58, 65, 72, 68, 75, 82, 78, 85, 92, 88, 75, 65, 45, 32, 20, 12];
      
      // 静态假数据 - 收入（元）
      this.revenueData = [180, 288, 432, 540, 648, 900, 1152, 1620, 2088, 2340, 2592, 2448, 2700, 2952, 2808, 3060, 3312, 3168, 2700, 2340, 1620, 1152, 720, 432];
      
      // 静态假数据 - 用户数
      this.userData = [4, 7, 10, 12, 15, 22, 28, 38, 48, 55, 62, 58, 65, 72, 68, 75, 82, 78, 65, 55, 38, 28, 18, 10];
    },
    // 获取订单量对比曲线（今日vs昨日）- 静态假数据
    getDailyPData() {
      // 今日数据
      const todayData = [5, 8, 12, 15, 18, 25, 32, 45, 58, 65, 72, 68, 75, 82, 78, 85, 92, 88, 75, 65, 45, 32, 20, 12];
      // 昨日数据
      const yesterdayData = [3, 6, 10, 13, 16, 22, 28, 42, 55, 62, 68, 65, 72, 78, 75, 82, 88, 85, 72, 62, 42, 28, 18, 10];
      
      this.dailyP = {
        todayData,
        yesterdayData
      };
    },
    initMap() {
      this.map = new BMapGL.Map("boardMap");

      var myIcon = new BMapGL.Icon(
        "https://szcloudpulse.com:9000/cp-portal/2023/04/27/d85f358bb44a4cf69e843acecf7b0c2c.png",
        new BMapGL.Size(23, 25),
        {
          anchor: new BMapGL.Size(11, 25)
        }
      );

      // 默认中心点（北京）
      var defaultPoint = new BMapGL.Point(116.404, 39.915);
      this.map.centerAndZoom(defaultPoint, 12);

      //设置地图样式
      this.map.setMapStyleV2({ styleId: "d9955f6e8bd01669bfd15a998f109283" });

      this.map.enableScrollWheelZoom(); //启用滚轮放大缩小
      this.map.enableContinuousZoom(); //启用地图惯性拖拽

      // 加载站点数据并在地图上标注
      this.loadStationsToMap();
    },
    // 加载站点到地图（静态假数据）
    loadStationsToMap() {
      // 静态假数据 - 北京地区的几个站点
      const mockStations = [
        { name: '北京朝阳区站点', longitude: 116.404, latitude: 39.915, fullAddress: '北京市朝阳区建国路88号', status: '1' },
        { name: '北京海淀区站点', longitude: 116.314, latitude: 39.959, fullAddress: '北京市海淀区中关村大街1号', status: '1' },
        { name: '北京西城区站点', longitude: 116.366, latitude: 39.913, fullAddress: '北京市西城区西单北大街176号', status: '1' },
        { name: '北京东城区站点', longitude: 116.417, latitude: 39.909, fullAddress: '北京市东城区王府井大街255号', status: '1' },
        { name: '北京丰台区站点', longitude: 116.286, latitude: 39.858, fullAddress: '北京市丰台区南三环西路15号', status: '1' },
      ];
      
      let points = [];
      mockStations.forEach(station => {
        const point = new BMapGL.Point(parseFloat(station.longitude), parseFloat(station.latitude));
        points.push({ point, station });
        
        var myIcon = new BMapGL.Icon(
          "https://szcloudpulse.com:9000/cp-portal/2023/04/27/d85f358bb44a4cf69e843acecf7b0c2c.png",
          new BMapGL.Size(23, 25),
          { anchor: new BMapGL.Size(11, 25) }
        );
        
        var marker = new BMapGL.Marker(point, { icon: myIcon });
        this.map.addOverlay(marker);
        
        // 信息窗口
        var opts = {
          width: 250,
          height: 120,
          title: station.name || '充电站点',
        };
        var infoWindow = new BMapGL.InfoWindow(
          `<div style="color: #333;">
            <p><strong>站点名称：</strong>${station.name || '未知'}</p>
            <p><strong>地址：</strong>${station.fullAddress || '未知'}</p>
            <p><strong>状态：</strong>${station.status == '1' ? '正常' : '停用'}</p>
          </div>`, 
          opts
        );
        
        marker.addEventListener("click", function () {
          this.openInfoWindow(infoWindow);
        });
      });
      
      // 调整地图中心到第一个站点
      if (points.length > 0) {
        this.map.centerAndZoom(points[0].point, 12);
      }
    },
    handleClick(tab, event) {
      // 切换标签时重新加载对应数据
      this.getOrderTrend();
    },
    getNowTime() {
      this.nowTime = this.formatDateTime(new Date());
    },
    toDataBoard() {
      this.$router.push('/system/data-board')
    },
    backHome() {
      this.$router.push('/data-board')
      // this.$router.push('/dashboard')
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initMap();
    })
  },
  created() {
    let { getNowTime } = this;
    getNowTime();
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(getNowTime, 1000);

    this.showWhich = this.$router.currentRoute.path == '/data-board' ? false : true
    this.getEquipmentData()
    this.getStationTotal()
    this.getOrderTotal()
    this.getTodayStatistics()
    this.getOrderTrend()
    this.getDailyPData()
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.map = null
  },
};
</script>

<style scoped>
.board-container {
  width: 100%;
  height: 100vh;
  background-image: url("../../assets/images/board-bg.png");
  background-size: 100% 100%;
  color: #fff;
  position: relative;
}
.back-btn {
  position: absolute;
  left: 2.5%;
  top: 5%;
  height: 3%;
  color: #00d0ff;
  font-size: 17px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.back-btn img {
  height: 100%;
  margin-right: 6px;
}
.fullscreen-img {
  position: absolute;
  left: 2.5%;
  top: 5%;
  height: 3%;
  cursor: pointer;
}
.time-stamp {
  position: absolute;
  right: 2.5%;
  top: 5%;
  color: #00d1ff;
  font-size: 20px;
}
.board-title {
  background-image: linear-gradient(to top, #2571e9, #00e7ff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  font-size: 40px;
  font-weight: bold;
  letter-spacing: 8px;
  height: 9%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.board-content {
  height: 86%;
  width: 95%;
  margin: 6px auto 0;
}
.content-left {
  width: calc(25% - 12px);
  margin-right: 12px;
}
.content-overview,
.content-status,
.content-alarm,
.content-statistics,
.content-trend,
.content-carbon,
.content-chart {
  background-image: url("../../assets/images/box-bg1.png");
  background-size: 100% 100%;
}
.content-overview {
  height: 20%;
  margin-bottom: 12px;
  padding: 12px 16px;
}
.box-title {
  height: 20px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  color: #01d1ff;
}
.box-title::before {
  content: " ";
  width: 6px;
  height: 100%;
  border-radius: 10px;
  display: inline-block;
  margin-right: 6px;
  background: linear-gradient(to bottom, #00d1ff, #2869e8);
}
.box-content {
  height: calc(100% - 20px);
  /* padding: 20px 10px; */
}
.overview-object,
.overview-meter,
.overview-alarm {
  width: calc(33% - 10px);
  align-items: center;
}
.object-count {
  color: #1be5e7;
  font-size: 35px;
  font-weight: bold;
  margin-bottom: 6px;
}
.object-name {
  font-size: 12px;
}
.content-status {
  height: calc(40% - 12px);
  margin-bottom: 12px;
  padding: 20px 16px;
}
.content-alarm {
  height: calc(40% - 12px);
  padding: 16px 16px;
}
.content-middle {
  width: 50%;
  margin-right: 12px;
}
.content-map {
  height: 65%;
}
.content-chart {
  height: calc(35% - 12px);
  padding: 18px 30px;
}
.content-right {
  width: calc(25% - 12px);
}
.content-statistics {
  height: 20%;
  padding: 12px 16px;
}
.content-trend {
  height: calc(40% - 12px);
  padding: 18px 16px;
}
.content-carbon {
  height: calc(40% - 12px);
  padding: 18px 16px;
}
.statistics-item {
  width: calc(33% - 8px);
  align-items: center;
  font-size: 12px;
}
.item-count {
  font-size: 28px;
  font-weight: bold;
  color: #1be5e7;
  margin: 6px 0 6px;
}
.trend-tabs {
  height: 100%;
}
</style>
<style>
.trend-tabs,
.trend-tabs .el-tabs__content .el-tab-pane {
  height: 100%;
}
.trend-tabs .el-tabs__item {
  color: #fff;
}
.trend-tabs .el-tabs__item:hover,
.trend-tabs .el-tabs__item.is-active {
  color: #00d0fe;
}
.trend-tabs .el-tabs__active-bar {
  background-color: #00d0fe;
}
.trend-tabs .el-tabs__nav-wrap::after {
  background-color: #1d3666;
}
.trend-tabs .el-tabs__content {
  height: calc(100% - 55px);
}

/* 地图信息窗口样式修改 */
#boardMap .BMap_bubble_pop {
  background-color: rgba(28, 37, 80, 0.8) !important;
  border: 1px solid #186dbf !important;
}
#boardMap .BMap_bubble_pop img {
  display: none;
}
#boardMap .BMap_bubble_pop .BMap_bubble_top .BMap_bubble_title,
#boardMap .BMap_bubble_pop .BMap_bubble_center .BMap_bubble_content {
  color: #fff !important;
}
</style>
