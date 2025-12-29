<template>
  <div class="app-container">
    <div style="padding: 0 0 20px 0;">
      <el-input v-model="keyword" placeholder="请输入关键字" style="width: 92%;margin-right: 10px;"/>
      <el-button type="primary" @click="search()" style="width: 5%;">搜索</el-button>
    </div>
    <div v-if="isOfflineMode" class="offline-container">
      <div class="offline-notice">
        <el-alert
          title="离线模式"
          description="当前处于离线环境，使用简化地图显示。支持拖拽和缩放查看站点位置。"
          type="warning"
          :closable="false"
          show-icon>
        </el-alert>
      </div>
      <div class="offline-map-wrapper">
        <canvas 
          ref="offlineMapCanvas" 
          id="offlineMapCanvas"
          @mousedown="onCanvasMouseDown"
          @mousemove="onCanvasMouseMove"
          @mouseup="onCanvasMouseUp"
          @mouseleave="onCanvasMouseLeave"
          @wheel="onCanvasWheel">
        </canvas>
        <div v-if="selectedStation" class="offline-info-window" :style="infoWindowStyle">
          <div class="info-window-content">
            <div class="info-window-header">
              <span style="font-weight: bold;">{{ selectedStation.name }}</span>
              <el-button 
                text 
                type="primary" 
                @click="selectedStation = null"
                style="float: right; padding: 0; min-height: auto;">
                ✕
              </el-button>
            </div>
            <div class="info-window-body">
              <p style="font-size: 12px; margin: 5px 0;">{{ selectedStation.fullAddress }}</p>
              <p style="margin: 5px 0;">运营时间：{{ selectedStation.businessHours }}</p>
              <p style="margin: 5px 0;">
                <el-tag :type="selectedStation.isUsable == '1' ? 'success' : 'danger'" size="small">
                  {{ selectedStation.isUsable == '1' ? '可借' : '不可借' }}
                </el-tag>
                <el-tag :type="selectedStation.isReturn == '1' ? 'success' : 'danger'" size="small" style="margin-left: 10px;">
                  {{ selectedStation.isReturn == '1' ? '可还' : '不可还' }}
                </el-tag>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="container" v-else></div>

  </div>
</template>

<script setup name="Station">
import { calculateLatLng } from "@/api/device/map";
import { nearbyStation } from "@/api/device/station";
import { ElMessage } from 'element-plus';
import mapImage from "@/assets/images/map.png";
const { proxy } = getCurrentInstance();

let map;
let markerLayer;
const keyword = ref("");
const isOfflineMode = ref(false);
const offlineStations = ref([]);
const offlineMapCanvas = ref(null);

// 离线地图状态
const offlineMapState = ref({
  centerLat: 39.984104,
  centerLng: 116.307503,
  zoom: 12,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragStartCenterX: 0,
  dragStartCenterY: 0
});

const selectedStation = ref(null);
const infoWindowStyle = ref({});
const mapImageLoaded = ref(false);
const mapImageObj = ref(null);

// 检查TMap是否可用
function checkTMapAvailable() {
  return new Promise((resolve) => {
    // 如果TMap已经加载
    if (window.TMap) {
      resolve(true);
      return;
    }
    
    // 等待最多3秒检查TMap是否加载
    let checkCount = 0;
    const maxChecks = 30; // 3秒，每100ms检查一次
    const checkInterval = setInterval(() => {
      checkCount++;
      if (window.TMap) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

function search() {
  if(keyword.value == '') return;
  
  if (isOfflineMode.value) {
    ElMessage.warning('离线模式下无法使用搜索功能');
    return;
  }
  
  calculateLatLng(keyword.value).then(response => {
    let data = response.data;
    let position = new TMap.LatLng(data.lat, data.lng)
    map.setCenter(position);

    //渲染地图数据
    initMapData(position);
  }).catch(error => {
    ElMessage.error('搜索失败，请检查网络连接');
  });

}

let infoWindowList = Array(100);
function initMap() {
  // 检查TMap是否可用
  checkTMapAvailable().then(available => {
    if (!available) {
      // 进入离线模式
      isOfflineMode.value = true;
      console.warn('TMap不可用，进入离线模式');
      // 加载站点数据（离线模式）
      loadOfflineStations();
      return;
    }
    
    // 正常初始化地图
    try {
      let center = new TMap.LatLng(39.984104, 116.307503);
      //初始化地图
      map = new TMap.Map(document.getElementById('container'), {
        rotation: 20,//设置地图旋转角度
        pitch:30, //设置俯仰角度（0~45）
        zoom:12,//设置地图缩放级别
        center: center//设置地图中心点坐标
      });

      //初始化marker图层
      markerLayer = new TMap.MultiMarker({
        id: 'marker-layer',
        map: map
      });

      initMapData(center);

      //监听地图中心点变化
      map.addListener('center_changed', function() {
        console.log("latlng:" + map.getCenter());
      });
    } catch (error) {
      console.error('地图初始化失败:', error);
      // 如果初始化失败，也进入离线模式
      isOfflineMode.value = true;
      loadOfflineStations();
    }
  });
}

// 离线模式下加载站点数据
function loadOfflineStations() {
  const defaultCenter = { lat: 39.984104, lng: 116.307503 };
  
  // 尝试从API获取数据
  nearbyStation(defaultCenter.lat, defaultCenter.lng).then(response => {
    let latLngList = response.data || [];
    
    // 如果数据太少或为空，使用模拟数据补充
    if (latLngList.length < 10) {
      const mockCount = Math.max(15 - latLngList.length, 15);
      const mockStations = generateMockStations(defaultCenter.lat, defaultCenter.lng, mockCount);
      latLngList = [...latLngList, ...mockStations];
    }
    
    offlineStations.value = latLngList;
    console.log('加载站点数据:', latLngList.length, '个站点');
    // 初始化离线地图
    nextTick(() => {
      initOfflineMap();
    });
  }).catch(error => {
    console.error('获取附近站点失败，使用模拟数据:', error);
    // API 失败时，直接使用模拟数据
    const mockStations = generateMockStations(defaultCenter.lat, defaultCenter.lng, 20);
    offlineStations.value = mockStations;
    console.log('使用模拟站点数据:', mockStations.length, '个站点');
    // 初始化离线地图
    nextTick(() => {
      initOfflineMap();
    });
  });
}

// 初始化离线地图
function initOfflineMap() {
  if (!offlineMapCanvas.value) return;
  
  const canvas = offlineMapCanvas.value;
  const container = canvas.parentElement;
  
  // 设置canvas尺寸
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  
  // 加载地图图片
  const img = new Image();
  img.onload = () => {
    mapImageObj.value = img;
    mapImageLoaded.value = true;
    drawOfflineMap();
  };
  img.onerror = () => {
    console.error('地图图片加载失败');
    mapImageLoaded.value = false;
    drawOfflineMap(); // 即使图片加载失败也绘制站点
  };
  img.src = mapImage;
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  if (!offlineMapCanvas.value) return;
  const canvas = offlineMapCanvas.value;
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  drawOfflineMap();
}

// 经纬度转像素坐标
function latLngToPixel(lat, lng) {
  const state = offlineMapState.value;
  const canvas = offlineMapCanvas.value;
  if (!canvas) return { x: 0, y: 0 };
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // 计算相对偏移（使用更合理的缩放因子）
  const centerLatRad = state.centerLat * Math.PI / 180;
  
  // 1度约111.32公里 = 111320米
  const dLat = (lat - state.centerLat) * 111320; // 米
  const dLng = (lng - state.centerLng) * 111320 * Math.cos(centerLatRad); // 米
  
  // 根据缩放级别计算像素/米比例
  // zoom 12 时，1像素约等于 2米，这样站点更容易看到
  const basePixelPerMeter = 1.0; // 基础比例（zoom 12时）
  const scale = Math.pow(1.5, state.zoom - 12); // 缩放因子
  const pixelPerMeter = basePixelPerMeter * scale;
  
  const x = centerX + dLng * pixelPerMeter;
  const y = centerY - dLat * pixelPerMeter; // Y轴反向（屏幕坐标系）
  
  return { x, y };
}

// 像素坐标转经纬度
function pixelToLatLng(x, y) {
  const state = offlineMapState.value;
  const canvas = offlineMapCanvas.value;
  if (!canvas) return { lat: state.centerLat, lng: state.centerLng };
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  const basePixelPerMeter = 1.0;
  const scale = Math.pow(1.5, state.zoom - 12);
  const pixelPerMeter = basePixelPerMeter * scale;
  
  const dLng = (x - centerX) / pixelPerMeter;
  const dLat = -(y - centerY) / pixelPerMeter;
  
  const lat = state.centerLat + dLat / 111320;
  const lng = state.centerLng + dLng / (111320 * Math.cos(state.centerLat * Math.PI / 180));
  
  return { lat, lng };
}

// 绘制离线地图
function drawOfflineMap() {
  const canvas = offlineMapCanvas.value;
  if (!canvas) {
    console.warn('Canvas 未初始化');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  const state = offlineMapState.value;
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制地图图片背景
  if (mapImageLoaded.value && mapImageObj.value) {
    // 计算图片缩放以适应canvas，保持宽高比
    const img = mapImageObj.value;
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      // 图片更宽，以高度为准
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgAspect;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    } else {
      // 图片更高，以宽度为准
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgAspect;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    }
    
    // 根据缩放级别调整图片大小
    const scale = Math.pow(1.2, state.zoom - 12);
    const scaledWidth = drawWidth * scale;
    const scaledHeight = drawHeight * scale;
    const scaledX = drawX - (scaledWidth - drawWidth) / 2;
    const scaledY = drawY - (scaledHeight - drawHeight) / 2;
    
    ctx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight);
  } else {
    // 如果图片未加载，使用灰色背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 显示加载提示
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('正在加载地图...', canvas.width / 2, canvas.height / 2);
  }
  
  // 绘制站点标记
  if (offlineStations.value && offlineStations.value.length > 0) {
    offlineStations.value.forEach((station, index) => {
      if (!station) {
        return;
      }
      
      // 确保坐标值是数字类型
      const lat = parseFloat(station.latitude);
      const lng = parseFloat(station.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('站点坐标无效:', station);
        return;
      }
      
      const pixel = latLngToPixel(lat, lng);
      
      // 检查是否在可见区域（扩大范围以确保标记可见）
      if (pixel.x < -50 || pixel.x > canvas.width + 50 || 
          pixel.y < -50 || pixel.y > canvas.height + 50) {
        return;
      }
      
      // 绘制标记点（更大的标记）
      ctx.fillStyle = station.isUsable == '1' ? '#67C23A' : '#F56C6C';
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制外圈
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pixel.x, pixel.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      
      // 绘制数字
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), pixel.x, pixel.y);
    });
  } else {
    // 如果没有站点数据，显示提示
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('正在加载站点数据...', canvas.width / 2, canvas.height / 2);
  }
  
  // 绘制坐标信息
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`中心: ${state.centerLat.toFixed(4)}, ${state.centerLng.toFixed(4)}`, 10, 10);
  ctx.fillText(`缩放: ${state.zoom.toFixed(1)}`, 10, 25);
  ctx.fillText(`站点数: ${offlineStations.value ? offlineStations.value.length : 0}`, 10, 40);
  
  // 调试信息：显示第一个站点的坐标
  if (offlineStations.value && offlineStations.value.length > 0) {
    const firstStation = offlineStations.value[0];
    const firstPixel = latLngToPixel(firstStation.latitude, firstStation.longitude);
    ctx.fillText(`第一个站点: (${firstPixel.x.toFixed(0)}, ${firstPixel.y.toFixed(0)})`, 10, 55);
  }
}

// Canvas 鼠标事件
function onCanvasMouseDown(e) {
  if (!isOfflineMode.value) return;
  
  // 先检查是否点击了站点
  let clickedStation = false;
  const clickRadius = 15;
  for (let i = offlineStations.value.length - 1; i >= 0; i--) {
    const station = offlineStations.value[i];
    if (!station) continue;
    
    const lat = parseFloat(station.latitude);
    const lng = parseFloat(station.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;
    
    const pixel = latLngToPixel(lat, lng);
    const dx = e.offsetX - pixel.x;
    const dy = e.offsetY - pixel.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= clickRadius) {
      clickedStation = true;
      selectedStation.value = station;
      const canvas = offlineMapCanvas.value;
      if (canvas) {
        infoWindowStyle.value = {
          left: (pixel.x + 20) + 'px',
          top: (pixel.y - 10) + 'px',
          position: 'absolute'
        };
      }
      break;
    }
  }
  
  // 如果没有点击站点，开始拖拽
  if (!clickedStation) {
    const state = offlineMapState.value;
    state.isDragging = true;
    state.dragStartX = e.offsetX;
    state.dragStartY = e.offsetY;
    state.dragStartCenterX = state.centerLng;
    state.dragStartCenterY = state.centerLat;
    selectedStation.value = null; // 清除选中的站点
  }
}

function onCanvasMouseMove(e) {
  if (!isOfflineMode.value) return;
  const state = offlineMapState.value;
  
  if (state.isDragging) {
    const canvas = offlineMapCanvas.value;
    if (!canvas) return;
    
    const dx = e.offsetX - state.dragStartX;
    const dy = e.offsetY - state.dragStartY;
    
    // 计算新的中心点
    const basePixelPerMeter = 1.0;
    const scale = Math.pow(1.5, state.zoom - 12);
    const pixelPerMeter = basePixelPerMeter * scale;
    const dLat = -dy / pixelPerMeter / 111320;
    const dLng = dx / pixelPerMeter / (111320 * Math.cos(state.centerLat * Math.PI / 180));
    
    state.centerLat = state.dragStartCenterY + dLat;
    state.centerLng = state.dragStartCenterX + dLng;
    
    drawOfflineMap();
  }
}

function onCanvasMouseUp(e) {
  if (!isOfflineMode.value) return;
  offlineMapState.value.isDragging = false;
}

function onCanvasMouseLeave(e) {
  if (!isOfflineMode.value) return;
  offlineMapState.value.isDragging = false;
}

function onCanvasWheel(e) {
  if (!isOfflineMode.value) return;
  e.preventDefault();
  
  const state = offlineMapState.value;
  const delta = e.deltaY > 0 ? -0.5 : 0.5;
  state.zoom = Math.max(8, Math.min(18, state.zoom + delta));
  
  drawOfflineMap();
}

// 生成模拟站点数据
function generateMockStations(centerLat, centerLng, count = 15) {
  const stations = [];
  const stationNames = [
    '天安门广场充电站', '王府井商业街站点', '西单购物中心站', '三里屯太古里站',
    '国贸CBD充电站', '中关村科技园站', '望京SOHO站点', '朝阳大悦城站',
    '五棵松体育场站', '鸟巢国家体育场站', '水立方站点', '颐和园景区站',
    '北京南站充电站', '首都机场T3站', '北京西站站点', '东直门交通枢纽站',
    '西直门地铁站', '建国门商务区站', '金融街充电站', '亚运村站点'
  ];
  
  const addresses = [
    '北京市东城区天安门广场', '北京市东城区王府井大街255号', '北京市西城区西单北大街176号',
    '北京市朝阳区三里屯路19号', '北京市朝阳区建国门外大街1号', '北京市海淀区中关村大街1号',
    '北京市朝阳区望京街10号', '北京市朝阳区朝阳北路101号', '北京市海淀区复兴路69号',
    '北京市朝阳区国家体育场南路1号', '北京市朝阳区天辰东路11号', '北京市海淀区新建宫门路19号',
    '北京市丰台区永外大街12号', '北京市顺义区首都机场', '北京市丰台区莲花池东路118号',
    '北京市东城区东直门外大街', '北京市西城区西直门外大街', '北京市朝阳区建国门外大街',
    '北京市西城区金融大街', '北京市朝阳区亚运村'
  ];
  
  const businessHours = [
    '24小时营业', '06:00-22:00', '07:00-23:00', '08:00-21:00',
    '24小时营业', '06:30-22:30', '07:00-23:00', '08:00-20:00'
  ];
  
  const imageUrls = [
    'https://via.placeholder.com/120x120?text=Station',
    'https://picsum.photos/120/120?random=1',
    'https://picsum.photos/120/120?random=2'
  ];
  
  for (let i = 0; i < count; i++) {
    // 在中心点周围随机生成位置（半径约5-15公里）
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5; // 均匀分布 + 随机偏移
    const radius = 0.05 + Math.random() * 0.1; // 约5-15公里
    const latOffset = radius * Math.cos(angle);
    const lngOffset = radius * Math.sin(angle);
    
    const lat = centerLat + latOffset;
    const lng = centerLng + lngOffset;
    
    stations.push({
      id: 1000 + i,
      name: stationNames[i % stationNames.length] + (i > stationNames.length - 1 ? ` ${Math.floor(i / stationNames.length) + 1}` : ''),
      latitude: lat,
      longitude: lng,
      fullAddress: addresses[i % addresses.length],
      businessHours: businessHours[i % businessHours.length],
      imageUrl: imageUrls[i % imageUrls.length],
      isUsable: Math.random() > 0.3 ? '1' : '0', // 70%概率可借
      isReturn: Math.random() > 0.2 ? '1' : '0'  // 80%概率可还
    });
  }
  
  return stations;
}

function initMapData(center) {
  markerLayer.setGeometries([])
  nearbyStation(center.getLat(), center.getLng()).then(response => {
    let latLngList = response.data || [];
    
    // 如果数据太少或为空，使用模拟数据补充
    if (latLngList.length < 10) {
      const mockCount = Math.max(15 - latLngList.length, 15); // 确保总共至少有15个站点
      const mockStations = generateMockStations(center.getLat(), center.getLng(), mockCount);
      latLngList = [...latLngList, ...mockStations];
    }
    
    renderStations(latLngList);
  }).catch(error => {
    console.error('获取附近站点失败，使用模拟数据:', error);
    // API 失败时，直接使用模拟数据
    const mockStations = generateMockStations(center.getLat(), center.getLng(), 20);
    renderStations(mockStations);
  });
}

function renderStations(latLngList) {
  // 重新初始化 infoWindowList
  infoWindowList = Array(latLngList.length);
  
  for (let i = 0; i < latLngList.length; i++) {
      let station = latLngList[i];
      let position = new TMap.LatLng(station.latitude, station.longitude)

      // 参考示例 https://lbs.qq.com/webDemoCenter/glAPI/glServiceLib/search
      let geometries = markerLayer.getGeometries();
      geometries.push({
        id: String(i), // 点标注数据数组
        position: position
      });
      markerLayer.updateGeometries(geometries); // 绘制地点标注
      // markerLayer.add({
      //   position: position
      // })

      let isUsable = "不可借";
      if(station.isUsable == '1') {
        isUsable = "可借";
      }
      let isReturn = "不可还";
      if(station.isReturn == '1') {
        isReturn = "可还";
      }
      //创建InfoWindow实例，并进行初始化
      var infoWindow = new TMap.InfoWindow({
        map: map,
        position: position,
        offset: { x: 0, y: -32 },
        //设置infoWindow，content支持直接传入html代码，以实现各类内容格式需求
        content: "<div class=\"info-container\">\n" +
            "  <div class=\"image-container\">\n" +
            "    <img src=\""+station.imageUrl+"\">\n" +
            "  </div>\n" +
            "  <div class=\"text-container\">\n" +
            "   <p style='font-weight: bold;'>"+station.name+"</p>\n" +
            "   <p style='font-size: 12px;'>"+station.fullAddress+"</p>\n" +
            "   <p>运营时间："+station.businessHours+"</p>\n" +
            "   <p>"+isUsable+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+isReturn+"</p>\n" +
            "  </div>\n" +
            "</div>"
      });
      infoWindowList[i] = infoWindow;
      infoWindow.close();//初始关闭信息窗关闭
    }
    
    //监听标注点击事件（只绑定一次）
    markerLayer.off("click"); // 先移除之前的监听
    markerLayer.on("click", function (evt) {
      //关闭全部信息窗
      infoWindowList.forEach(item => {
        if (item) item.close();
      });
      // 打开点击的信息窗
      const clickedIndex = Number(evt.geometry.id);
      if (infoWindowList[clickedIndex]) {
        infoWindowList[clickedIndex].open();
      }
    });
}

onMounted(() => {
  initMap();
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('resize', handleResize);
})
</script>
<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
<style>

.info-container {
  display: flex;
  align-items: flex-start; /* 垂直居中对齐 */
  gap: 20px; /* 图片和文字之间的间距 */
}

.image-container {
  flex: 1; /* 图片区域占一半的空间 */
}

.image-container img {
  width: 120px; /* 图片自适应容器大小 */
  height: 120px; /* 保持图片的宽高比 */
}

.text-container {
  flex: 2; /* 文字区域占三分之二的空间 */
  width: 210px;
  margin-top: -10px;
}
.text-container p{
  text-align: left;
  margin: 10px 0;
}

/* 离线模式样式 */
.offline-container {
  width: 100%;
  height: calc(100vh - 200px);
  min-height: 600px;
}

.offline-notice {
  margin-bottom: 20px;
}

.offline-map-wrapper {
  position: relative;
  width: 100%;
  height: calc(100% - 80px);
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

#offlineMapCanvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  display: block;
}

#offlineMapCanvas:active {
  cursor: grabbing;
}

.offline-info-window {
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
  z-index: 1000;
  min-width: 250px;
  max-width: 300px;
}

.info-window-header {
  padding: 10px 15px;
  border-bottom: 1px solid #ebeef5;
  background: #f5f7fa;
  border-radius: 4px 4px 0 0;
}

.info-window-body {
  padding: 10px 15px;
  font-size: 12px;
  line-height: 1.5;
}

.info-window-body p {
  margin: 8px 0;
}

.offline-stations {
  height: calc(100% - 80px);
  overflow: auto;
}

#container {
  width: 100%;
  height: calc(100vh - 200px);
  min-height: 600px;
}
</style>
