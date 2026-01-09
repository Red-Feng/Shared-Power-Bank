import dayjs from 'dayjs'
import {getChartListColor} from '@/utils/color'
import {getRandomArray} from '@/utils/charts'

// --- 数据常量 (Merged from constants.js) ---

// 数据概览（充电宝业务）
export const OLDMAN_NUM_A = { total: '1260', data: [{ value: 980, name: '在租中' }, { value: 280, name: '空闲中' }] }
export const OLDMAN_NUM_B = { total: '1310', data: [{ value: 1020, name: '在租中' }, { value: 290, name: '空闲中' }] }
export const OLDMAN_NUM_C = { total: '1295', data: [{ value: 1005, name: '在租中' }, { value: 290, name: '空闲中' }] }

export const BED_NUM_A = { total: '450', data: [{ value: 380, name: '在线点位' }, { value: 70, name: '离线点位' }] }
export const BED_NUM_B = { total: '460', data: [{ value: 390, name: '在线点位' }, { value: 70, name: '离线点位' }] }
export const BED_NUM_C = { total: '455', data: [{ value: 385, name: '在线点位' }, { value: 70, name: '离线点位' }] }

export const SERVE_NUM_A = { total: 100.05, data: [{ value: 35.17, name: '扫码租借' }, { value: 64.88, name: '小程序租借' }] }
export const SERVE_NUM_B = { total: 100.35, data: [{ value: 34.17, name: '扫码租借' }, { value: 66.18, name: '小程序租借' }] }
export const SERVE_NUM_C = { total: 100.66, data: [{ value: 33.18, name: '扫码租借' }, { value: 67.48, name: '小程序租借' }] }

export const STAFF_NUM_A = { total: 520, data: [{ value: 120, name: '直营商户' }, { value: 400, name: '合作商户' }] }
export const STAFF_NUM_B = { total: 540, data: [{ value: 130, name: '直营商户' }, { value: 410, name: '合作商户' }] }
export const STAFF_NUM_C = { total: 535, data: [{ value: 128, name: '直营商户' }, { value: 407, name: '合作商户' }] }

export const MONEY_NUM_A = { total: 401.23, data: [{ value: 320.59, name: '租借收入' }, { value: 80.64, name: '逾期费用' }] }
export const MONEY_NUM_B = { total: 410.81, data: [{ value: 330.85, name: '租借收入' }, { value: 79.96, name: '逾期费用' }] }
export const MONEY_NUM_C = { total: 411.92, data: [{ value: 332.1, name: '租借收入' }, { value: 79.82, name: '逾期费用' }] }

export const TODAY_TIME = ['0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00']

export const TODAY_NUM_A = { incomeData: [0, 0, 0, 0, 0, 629.22, 450, 480.45, 2032.22, 5900.12, 4569, 3476, 1020.22, 2409.39, 3647.13, 3838.2, 2232.29, 1753.45, 2777.93, 2459.27, 2495.92, 722.8, 489.22, 0], refundData: [0, 0, 0, 0, 0, 110, 200, 1300, 3799.22, 3567.23, 2200, 1387, 374.33, 2389.38, 4877.13, 2890.22, 1343.73, 1347.69, 1351.83, 350.27, 2342.86, 346.06, 350.88, 0] }
export const TODAY_NUM_B = { incomeData: [0, 0, 0, 0, 0, 778.22, 380, 320, 2789.09, 3767.98, 4728, 2978.03, 1273.33, 1821.94, 2295.2, 2349.02, 3479.22, 1503.34, 2533.36, 2602.07, 2461.21, 716.24, 276.22, 0], refundData: [0, 0, 0, 0, 0, 255, 200, 1450, 2200, 3656.98, 2239.03, 1973, 338.23, 2725.84, 2342, 1349, 1435.72, 1345.91, 1344.12, 346.82, 2346.68, 348.09, 352.05, 0] }
export const TODAY_NUM_C = { incomeData: [0, 0, 0, 0, 0, 778.98, 480, 170, 290.22, 2345.98, 2387, 3746.93, 2300.22, 2764.96, 3689.23, 3478, 2295.2, 1676.81, 2841.43, 2579.56, 2678.19, 338.74, 256.02, 0], refundData: [0, 0, 0, 0, 0, 300, 20.39, 1840, 1899.23, 2234.03, 2297.02, 1298.22, 1299, 2892.88, 2390, 1344.23, 1349.02, 346.35, 1343.47, 348.42, 2345.23, 341.19, 343.79, 0] }

export const WEEK_DATA = ['第一天', '第二天', '第三天', '第四天', '第五天', '第六天', '第七天']
export const WEEK_NUM_A = { incomeData: ['14248', '13593', '14297', '13929', '14919', '13932', '14066'], refundData: ['3393', '3024', '2970', '3254', '3170', '3223', '2964'] }
export const WEEK_NUM_B = { incomeData: ['13785', '14634', '13636', '13846', '14038', '14845', '14607'], refundData: ['2981', '3033', '3105', '3311', '3326', '3141', '3302'] }
export const WEEK_NUM_C = { incomeData: ['14002', '14128', '13995', '14551', '14421', '14295', '14235'], refundData: ['3137', '3035', '3083', '3262', '3067', '3189', '3486'] }

export const MONTH_NUM_A = { incomeData: ['13689', '14114', '13872', '14248', '13593', '14297', '13929', '14919', '13932', '14066', '13816', '13405', '14287', '14241', '14382', '14117', '14703', '14498', '14674', '13686', '14732', '13528', '13994', '13719', '14292', '13902', '14321', '14548', '14188', '14381', '13547'], refundData: ['3123', '3107', '3248', '3393', '3024', '2970', '3254', '3170', '3223', '2964', '3484', '3454', '3092', '3213', '3377', '3405', '3059', '3033', '3094', '3141', '3439', '3489', '3286', '3384', '3262', '3347', '2980', '3332', '3426', '3429', '3347'] }
export const MONTH_NUM_B = { incomeData: [14823, 14596, 14042, 13785, 14634, 13636, 13846, 14038, 14845, 14607, 13583, 13797, 13775, 14760, 14626, 13990, 14265, 13868, 13781, 14184, 14542, 13839, 14358, 13547, 13686, 13867, 14096, 14266, 14871, 14961, 13902], refundData: [3058, 3290, 3350, 2981, 3033, 3105, 3311, 3326, 3141, 3302, 3144, 3040, 2962, 3166, 3444, 3403, 3050, 3035, 3312, 3296, 3111, 3074, 3395, 3371, 3360, 3172, 3461, 2969, 3253, 3092, 3371] }
export const MONTH_NUM_C = { incomeData: [14356, 14408, 13942, 14002, 14128, 13995, 14551, 14421, 14295, 14235, 13996, 13579, 14899, 14292, 13867, 14187, 13696, 14908, 14435, 14424, 14218, 14168, 13640, 14226, 14184, 14732, 13362, 13464, 14212, 14858, 14184], refundData: [3016, 3035, 3331, 3137, 3035, 3083, 3262, 3067, 3189, 3486, 3462, 3024, 3186, 3231, 3036, 3449, 3367, 3113, 3314, 3032, 3225, 3284, 3063, 3391, 3063, 3173, 3327, 3271, 3306, 3425, 3360] }

export const TODAY_EARNING_NUM_A = { incomeData: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 2, 4, 1, 4, 3, 0, 2, 3, 1, 1, 0, 0, 0], refundData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1, 4, 4, 0, 0, 0, 0] }
export const TODAY_EARNING_NUM_B = { incomeData: [0, 0, 0, 0, 0, 0, 1, 2, 4, 3, 0, 1, 3, 3, 3, 4, 1, 2, 1, 1, 0, 0, 0, 0], refundData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 1, 1, 2, 1, 1, 1, 3, 1, 1, 0, 0, 0] }
export const TODAY_EARNING_NUM_C = { incomeData: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2, 1, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 0], refundData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 2, 2, 1, 1, 1, 2, 0, 1, 0, 0] }

export const WEEK_EARNING_NUM_A = { incomeData: [24, 0, 14, 13, 11, 10, 20], refundData: [21, 17, 12, 13, 19, 24, 12] }
export const WEEK_EARNING_NUM_B = { incomeData: [29, 18, 26, 6, 28, 19, 18], refundData: [17, 8, 23, 23, 22, 21, 16] }
export const WEEK_EARNING_NUM_C = { incomeData: [15, 16, 13, 15, 5, 19, 17], refundData: [21, 15, 27, 20, 24, 15, 16] }

export const MONTH_EARNING_NUM_A = { incomeData: [12, 19, 10, 24, 0, 14, 13, 11, 10, 20, 8, 15, 9, 9, 21, 13, 21, 21, 13, 28, 13, 12, 14, 18, 17, 22, 10, 20, 30, 22, 17], refundData: [19, 19, 27, 21, 17, 12, 13, 19, 24, 12, 11, 12, 17, 24, 8, 14, 18, 21, 9, 33, 11, 24, 24, 18, 16, 32, 27, 25, 10, 16, 16] }
export const MONTH_EARNING_NUM_B = { incomeData: [8, 26, 22, 29, 18, 26, 6, 28, 19, 18, 23, 4, 25, 18, 18, 5, 29, 18, 28, 7, 12, 11, 23, 8, 15, 10, 7, 25, 12, 13, 12], refundData: [9, 28, 7, 17, 8, 23, 23, 22, 21, 16, 20, 20, 21, 21, 14, 7, 29, 33, 14, 9, 25, 16, 16, 6, 12, 14, 9, 11, 9, 20, 15] }
export const MONTH_EARNING_NUM_C = { incomeData: [5, 8, 14, 15, 16, 13, 15, 5, 19, 17, 16, 14, 2, 18, 14, 6, 6, 13, 10, 16, 7, 7, 32, 13, 6, 17, 20, 14, 24, 9, 14], refundData: [14, 21, 16, 21, 15, 27, 20, 24, 15, 16, 30, 19, 25, 14, 14, 10, 16, 15, 17, 18, 19, 11, 19, 13, 29, 8, 8, 14, 22, 26, 10] }

export const TODAY_SERVE_NUM_A = { incomeData: [54, 64, 34, 50, 63, 89, 102, 132, 124, 179, 147, 142, 160, 99, 112, 138, 102, 167, 144, 122, 94, 63, 59, 52], refundData: [44, 54, 24, 40, 53, 79, 92, 122, 114, 169, 137, 132, 150, 89, 102, 128, 92, 157, 134, 112, 84, 53, 49, 42] }
export const TODAY_SERVE_NUM_B = { incomeData: [74, 56, 34, 44, 62, 67, 110, 128, 137, 176, 140, 139, 157, 108, 121, 123, 117, 143, 141, 163, 102, 61, 61, 52], refundData: [64, 46, 24, 34, 52, 57, 100, 118, 127, 166, 130, 129, 147, 98, 111, 113, 107, 133, 131, 153, 92, 51, 51, 42] }
export const TODAY_SERVE_NUM_C = { incomeData: [84, 60, 32, 49, 47, 67, 87, 129, 122, 164, 125, 115, 142, 97, 113, 109, 112, 115, 129, 153, 102, 82, 46, 49], refundData: [74, 50, 22, 39, 37, 57, 77, 119, 112, 154, 115, 105, 132, 87, 103, 99, 102, 105, 119, 143, 92, 72, 36, 39] }

export const WEEK_SERVE_NUM_A = { incomeData: [2492, 2656, 2789, 2578, 2656, 2767, 2521], refundData: [2392, 2556, 2689, 2478, 2556, 2667, 2421] }
export const WEEK_SERVE_NUM_B = { incomeData: [2516, 2267, 2678, 2567, 2878, 2567, 2878], refundData: [2416, 2167, 2578, 2467, 2778, 2467, 2778] }
export const WEEK_SERVE_NUM_C = { incomeData: [2330, 2467, 2565, 2376, 2567, 2545, 2754], refundData: [2230, 2367, 2465, 2276, 2467, 2445, 2654] }

export const MONTH_SERVE_NUM_A = { incomeData: [2720, 2713, 2728, 2492, 2656, 2789, 2578, 2656, 2767, 2521, 2672, 2773, 2890, 2838, 2690, 2529, 2491, 2745, 2869, 2811, 2904, 2796, 2822, 2592, 2961, 2883, 2766, 2540, 2759, 2973, 2869], refundData: [2620, 2613, 2628, 2392, 2556, 2689, 2478, 2556, 2667, 2421, 2572, 2673, 2790, 2738, 2590, 2429, 2391, 2645, 2769, 2711, 2804, 2696, 2722, 2492, 2861, 2783, 2666, 2440, 2659, 2873, 2769] }
export const MONTH_SERVE_NUM_B = { incomeData: [2762, 2799, 2762, 2516, 2267, 2678, 2567, 2878, 2567, 2878, 2869, 2718, 2645, 2638, 2884, 2617, 2852, 2691, 2856, 2698, 2940, 2861, 3003, 2633, 2778, 2712, 2780, 2846, 2686, 2812, 2566], refundData: [2662, 2699, 2662, 2416, 2167, 2578, 2467, 2778, 2467, 2778, 2769, 2618, 2545, 2538, 2784, 2517, 2752, 2591, 2756, 2598, 2840, 2761, 2903, 2533, 2678, 2612, 2680, 2746, 2586, 2712, 2466] }
export const MONTH_SERVE_NUM_C = { incomeData: [2760, 2776, 2513, 2330, 2467, 2565, 2376, 2567, 2545, 2754, 2856, 2688, 2800, 2750, 2665, 2889, 2881, 2672, 2801, 2927, 2675, 2611, 2552, 2915, 3022, 2579, 2835, 2628, 2849, 2667, 2722], refundData: [2660, 2676, 2413, 2230, 2367, 2465, 2276, 2467, 2445, 2654, 2756, 2588, 2700, 2650, 2565, 2789, 2781, 2572, 2701, 2827, 2575, 2511, 2452, 2815, 2922, 2479, 2735, 2528, 2749, 2567, 2622] }

export const BACKLOG_DATA_A = [{ type: 3, num: 'RZ202310181126491', title: '刘信俊的入住申请', name: '宋湘婷', date: '2023-10-18 11:26:00' }, { type: 3, num: 'RZ202310181144772', title: '李美治的入住申请', name: '王姿吟', date: '2023-10-18 11:44:00' }, { type: 1, num: 'TZ202310181217777', title: '汤筠霞的退住申请', name: '马荣真', date: '2023-10-18 12:17:00' }]
export const BACKLOG_DATA_B = [{ type: 1, num: 'TZ202310220800769', title: '张昆元的退住申请', name: '龚静雯', date: '2023-10-22 08:00:00' }, { type: 1, num: 'TZ202310230932323', title: '林国芸的退住申请', name: '曹智强', date: '2023-10-23 09:32:00' }, { type: 3, num: 'RZ202310232217987', title: '游石如的入住申请', name: '葛真珍', date: '2023-10-23 22:17:00' }]
export const BACKLOG_DATA_C = [{ type: 3, num: 'RZ202310131703287', title: '陈冠廷的入住申请', name: '叶静宜', date: '2023-10-13 17:03:00' }, { type: 1, num: 'TZ202310131829109', title: '庾雅婷的退住申请', name: '曹智强', date: '2023-10-13 18:29:00' }, { type: 3, num: 'TZ202310132102640', title: '陈采勇的退住申请', name: '林宜蓁', date: '2023-10-13 21:02:00' }]

export const SUBSCRIBE_DATA = [
  [{ type: 1, phone: '17062479244', name: '张伟', time: '09:00' }, { type: 1, phone: '17395096135', name: '林建华', time: '12:00' }, { type: 2, phone: '13470504971', name: '马荣真', time: '18:00' }],
  [{ type: 1, phone: '16133295231', name: '李思远', time: '07:35' }, { type: 1, phone: '13505066198', name: '王刚', time: '11:20' }, { type: 2, phone: '15650105031', name: '张宏伟', time: '18:00' }],
  [{ type: 1, phone: '17705167560', name: '黄成立', time: '12:00' }, { type: 2, phone: '17714515848', name: '周安', time: '13:00' }, { type: 2, phone: '14144928346', name: '刘翱川云', time: '14:00' }],
  [{ type: 2, phone: '19424354614', name: '杨雪莉', time: '09:00' }, { type: 2, phone: '16472588080', name: '陈琳', time: '15:00' }, { type: 2, phone: '19321315213', name: '徐秀娟', time: '16:30' }],
  [{ type: 1, phone: '19334274595', name: '刘强', time: '07:45' }, { type: 2, phone: '13267734773', name: '陈鹏', time: '08:00' }, { type: 1, phone: '15240724014', name: '袁文轩', time: '09:00' }],
  [{ type: 2, phone: '19224279107', name: '刘毅豪', time: '09:50' }, { type: 1, phone: '13267739898', name: '许浩然', time: '10:00' }, { type: 1, phone: '15424276235', name: '王婷', time: '11:15' }],
  [{ type: 1, phone: '15576572508', name: '谢杰', time: '11:10' }, { type: 2, phone: '14779915659', name: '李婉娜', time: '11:30' }, { type: 2, phone: '13047879330', name: '陈进', time: '11:45' }],
  [{ type: 1, phone: '19161592761', name: '袁洋', time: '08:00' }, { type: 1, phone: '13348740172', name: '张晓丽', time: '12:00' }, { type: 2, phone: '14144969481', name: '刘鑫', time: '18:00' }],
  [{ type: 1, phone: '15378283924', name: '张雨静涵', time: '07:00' }, { type: 1, phone: '15018246673', name: '张豪', time: '14:00' }, { type: 1, phone: '16157278889', name: '刘莉', time: '18:00' }],
  [{ type: 2, phone: '16006983031', name: '王美惠', time: '09:00' }, { type: 1, phone: '14440882401', name: '刘易空麟', tme: '09:20' }, { type: 2, phone: '19546590654', name: '孙鹏', time: '16:00' }]
]

export const ELDER_RANK_DATA_A = [{ value: 43, name: '在线设备' }, { value: 89, name: '离线设备' }, { value: 192, name: '维护中' }, { value: 319, name: '故障设备' }]
export const ELDER_RANK_DATA_B = [{ value: 42, name: '在线设备' }, { value: 91, name: '离线设备' }, { value: 191, name: '维护中' }, { value: 331, name: '故障设备' }]
export const ELDER_RANK_DATA_C = [{ value: 37, name: '在线设备' }, { value: 91, name: '离线设备' }, { value: 196, name: '维护中' }, { value: 325, name: '故障设备' }]

export const ELDER_AGE_DATA_A = { man: [19, 51, 124, 98, 7], woman: [22, 40, 164, 102, 16] }
export const ELDER_AGE_DATA_B = { man: [19, 54, 128, 98, 8], woman: [25, 40, 164, 102, 17] }
export const ELDER_AGE_DATA_C = { man: [18, 47, 128, 99, 8], woman: [26, 38, 165, 102, 18] }

// --- 工具函数 (Original utils.js) ---

/**
 * 首页 dashboard 基础图表配置 (用于 TopPanel 等小型图表)
 * @param {string} type - 'line' | 'bar'
 */
export function constructInitDashboardDataset(type) {
  const dateArray = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const datasetAxis = {
    xAxis: { type: 'category', show: false, data: dateArray },
    yAxis: { show: false, type: 'value' },
    grid: { top: 0, left: 0, right: 0, bottom: 0 }
  }

  if (type === 'line') {
    return {
      ...datasetAxis,
      color: ['#fff'],
      series: [{
        data: [150, 230, 224, 218, 135, 147, 260],
        type,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 0,
        markPoint: { data: [{ type: 'max', name: '最大值' }, { type: 'min', name: '最小值' }] },
        lineStyle: { width: 2 }
      }]
    }
  }
  
  return {
    ...datasetAxis,
    color: getChartListColor(),
    series: [{
      data: [100, 130, 184, 218, { value: 135, itemStyle: { opacity: 0.2 } }, { value: 118, itemStyle: { opacity: 0.2 } }, { value: 60, itemStyle: { opacity: 0.2 } }],
      type,
      barWidth: 9
    }]
  }
}

/**
 * 设备状态分布饼图
 */
export const getElderRankDistribution = (data) => {
  return {
    color: ['#47CBBA', '#9891df', '#8EBEF3', '#FFB057', '#FE6E6E'],
    tooltip: {
      trigger: 'item',
      formatter(params) {
        return `<div>${params.name}<br/><div>${params.marker} <span style="font-weight:bold;">${params.value}台 &nbsp;  ${params.percent}% </span></div></div>`
      }
    },
    legend: { icon: 'circle', itemHeight: 6, orient: 'vertical', left: '60%', top: 'center', align: 'left' },
    grid: { top: '10%', bottom: '5%' },
    series: [{ name: '', type: 'pie', radius: ['30%', '60%'], center: ['30%', '50%'], label: { show: false, position: 'center' }, labelLine: { show: false }, startAngle: 225, data }]
  }
}

/**
 * 用户活跃度分布柱状图
 */
export const getElderAgeDistribution = (data) => {
  const xAxisData = ['低活跃', '中活跃', '高活跃', '沉睡用户', '新注册']
  return {
    color: ['#27C2AE', '#FE6E6E'],
    legend: { data: ['新用户', '老用户'], icon: 'circle', itemHeight: 6, top: 'bottom' },
    tooltip: {
      trigger: 'item',
      formatter(params) {
        return `<div>${params.name}<br/><div>${params.marker}<span style="font-weight:bold;">${params.seriesName}&nbsp;${params.value}人</span></div></div>`
      }
    },
    xAxis: { data: xAxisData, axisLine: { onZero: true }, splitLine: { show: false }, splitArea: { show: false }, axisLabel: { show: true, interval: 0 } },
    yAxis: {},
    grid: { left: '15%', top: '10%', bottom: '25%' },
    series: [
      { name: '新用户', type: 'bar', barWidth: 20, stack: 'one', data: data.man },
      { name: '老用户', type: 'bar', barWidth: 20, stack: 'one', data: data.woman }
    ]
  }
}

/**
 * 基础饼图通用配置
 */
function getBasePieChartDataSet({ textColor, containerColor, colors, unit, labelName }, data) {
  return {
    color: colors || getChartListColor(),
    tooltip: { trigger: 'item', formatter: `{b}: {c} ${unit}` },
    legend: false,
    series: [{
      name: labelName,
      type: 'pie',
      radius: ['65%', '80%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: containerColor, borderWidth: 1 },
      label: {
        show: true,
        position: 'center',
        formatter: [`{value|${data.total}${unit}}`, `{name|${labelName}}`].join('\n'),
        rich: {
          value: { color: textColor, fontSize: 18, fontWeight: 'normal', lineHeight: 46 },
          name: { color: '#909399', fontSize: 14, lineHeight: 14 }
        }
      },
      labelLine: { show: false },
      data: data.data
    }]
  }
}

export function getOldPieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, unit: '台', labelName: '充电宝数量' }, data) }
export function getBedPieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, colors: ['#d7f1ed', '#689FFF'], unit: '个', labelName: '设备点位' }, data) }
export function getservePieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, colors: ['#d7f1ed', '#ADA5EE'], unit: '万次', labelName: '使用次数' }, data) }
export function getStaffPieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, colors: ['#d7f1ed', '#FFB056'], unit: '个', labelName: '合作商户' }, data) }
export function getMoneyPieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, colors: ['#d7f1ed', '#FE8585'], unit: '万元', labelName: '租借收入' }, data) }

// --- Quick Functions Metadata ---

export const QUICK_FUNCTION_CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'system', name: '系统管理' },
  { id: 'business', name: '业务管理' }
]

// --- 设备管理图标元数据 (Apple HIG 风格) ---

export const DEVICE_ICONS = {
  // 设备状态
  status: {
    online: {
      label: '使用中',
      color: '#34C759', // Apple Green
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="6" fill="#34C759">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="12" r="10" stroke="#34C759" stroke-width="2" opacity="0.2" />
      </svg>`
    },
    offline: {
      label: '未投入',
      color: '#8E8E93', // Apple Gray
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="6" fill="#8E8E93" />
        <circle cx="12" cy="12" r="10" stroke="#8E8E93" stroke-width="2" opacity="0.2" />
      </svg>`
    },
    error: {
      label: '故障',
      color: '#FF3B30', // Apple Red
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="6" fill="#FF3B30" />
        <path d="M12 8V13M12 16H12.01" stroke="white" stroke-width="2" stroke-linecap="round" />
        <circle cx="12" cy="12" r="10" stroke="#FF3B30" stroke-width="2" opacity="0.2" />
      </svg>`
    }
  },
  // 设备分类
  types: {
    server: {
      label: '服务器',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="6" rx="2" stroke="currentColor" stroke-width="2"/>
        <rect x="3" y="14" width="18" height="6" rx="2" stroke="currentColor" stroke-width="2"/>
        <circle cx="7" cy="7" r="1" fill="currentColor"/>
        <circle cx="7" cy="17" r="1" fill="currentColor"/>
      </svg>`
    },
    cabinet: {
      label: '充电柜',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3H19V21H5V3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M5 9H19M5 15H19" stroke="currentColor" stroke-width="2"/>
        <path d="M9 6H15M9 12H15M9 18H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    network: {
      label: '网络设备',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 13L12 21L4 13M4 11L12 3L20 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    terminal: {
      label: '终端设备',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="16" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
        <path d="M8 20H16M12 15V20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    default: {
      label: '通用设备',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L4 9V21H20V9L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2"/>
      </svg>`
    }
  },
  // 操作图标
  actions: {
    configure: {
      label: '配置',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2"/>
        <path d="M19.4 15L21.7 13.7C22.1 13.5 22.2 13 22 12.6L21 10.9C20.8 10.5 20.3 10.4 19.9 10.6L17.6 11.9C17.3 11.7 17.1 11.5 16.8 11.3L16.8 8.6C16.8 8.2 16.5 7.9 16.1 7.9H14.1C13.7 7.9 13.4 8.2 13.4 8.6L13.4 11.3C13.1 11.5 12.8 11.7 12.6 11.9L10.3 10.6C9.9 10.4 9.4 10.5 9.2 10.9L8.2 12.6C8 13 8.1 13.5 8.5 13.7L10.8 15C10.8 15.3 10.8 15.7 10.8 16L8.5 17.3C8.1 17.5 8 18 8.2 18.4L9.2 20.1C9.4 20.5 9.9 20.6 10.3 20.4L12.6 19.1C12.8 19.3 13.1 19.5 13.4 19.7V22.4C13.4 22.8 13.7 23.1 14.1 23.1H16.1C16.5 23.1 16.8 22.8 16.8 22.4V19.7C17.1 19.5 17.3 19.3 17.6 19.1L19.9 20.4C20.3 20.6 20.8 20.5 21 20.1L22 18.4C22.2 18 22.1 17.5 21.7 17.3L19.4 16C19.4 15.7 19.4 15.3 19.4 15Z" stroke="currentColor" stroke-width="2"/>
      </svg>`
    },
    restart: {
      label: '重启',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 7L12 3L8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    delete: {
      label: '删除',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    }
  }
}

export const QUICK_FUNCTIONS = [
  { id: 'user', name: '用户管理', icon: 'user', path: '/system/user', category: 'system' },
  { id: 'role', name: '角色管理', icon: 'peoples', path: '/system/role', category: 'system' },
  { id: 'menu', name: '菜单管理', icon: 'tree-table', path: '/system/menu', category: 'system' },
  { id: 'dept', name: '部门管理', icon: 'tree', path: '/system/dept', category: 'system' },
  { id: 'post', name: '岗位管理', icon: 'post', path: '/system/post', category: 'system' },
  { id: 'dict', name: '字典管理', icon: 'dict', path: '/system/dict', category: 'system' },
  { id: 'config', name: '参数设置', icon: 'edit', path: '/system/config', category: 'system' },
  { id: 'log', name: '操作日志', icon: 'log', path: '/monitor/operlog', category: 'system' },
  { id: 'job', name: '定时任务', icon: 'job', path: '/monitor/job', category: 'system' },
  { id: 'cabinet', name: '柜机管理', icon: 'server', path: '/device/cabinet', category: 'business' },
  { id: 'device', name: '设备管理', icon: 'monitor', path: '/device/device', category: 'business' },
  { id: 'order', name: '订单管理', icon: 'shopping', path: '/order/orderInfo', category: 'business' },
  { id: 'fee', name: '规则管理', icon: 'money', path: '/rule/feeRule', category: 'business' },
  { id: 'member', name: '会员管理', icon: 'user', path: '/user/userInfo', category: 'business' }
]


import dayjs from 'dayjs'
import {getChartListColor} from '@/utils/color'
import {getRandomArray} from '@/utils/charts'

// --- 数据常量 (Merged from constants.js) ---

// 数据概览（充电宝业务）
export const OLDMAN_NUM_A = { total: '1260', data: [{ value: 980, name: '在租中' }, { value: 280, name: '空闲中' }] }
export const OLDMAN_NUM_B = { total: '1310', data: [{ value: 1020, name: '在租中' }, { value: 290, name: '空闲中' }] }
export const OLDMAN_NUM_C = { total: '1295', data: [{ value: 1005, name: '在租中' }, { value: 290, name: '空闲中' }] }

export const BED_NUM_A = { total: '450', data: [{ value: 380, name: '在线点位' }, { value: 70, name: '离线点位' }] }
export const BED_NUM_B = { total: '460', data: [{ value: 390, name: '在线点位' }, { value: 70, name: '离线点位' }] }
export const BED_NUM_C = { total: '455', data: [{ value: 385, name: '在线点位' }, { value: 70, name: '离线点位' }] }

export const SERVE_NUM_A = { total: 100.05, data: [{ value: 35.17, name: '扫码租借' }, { value: 64.88, name: '小程序租借' }] }
export const SERVE_NUM_B = { total: 100.35, data: [{ value: 34.17, name: '扫码租借' }, { value: 66.18, name: '小程序租借' }] }
export const SERVE_NUM_C = { total: 100.66, data: [{ value: 33.18, name: '扫码租借' }, { value: 67.48, name: '小程序租借' }] }

export const STAFF_NUM_A = { total: 520, data: [{ value: 120, name: '直营商户' }, { value: 400, name: '合作商户' }] }
export const STAFF_NUM_B = { total: 540, data: [{ value: 130, name: '直营商户' }, { value: 410, name: '合作商户' }] }
export const STAFF_NUM_C = { total: 535, data: [{ value: 128, name: '直营商户' }, { value: 407, name: '合作商户' }] }

export const MONEY_NUM_A = { total: 401.23, data: [{ value: 320.59, name: '租借收入' }, { value: 80.64, name: '逾期费用' }] }
export const MONEY_NUM_B = { total: 410.81, data: [{ value: 330.85, name: '租借收入' }, { value: 79.96, name: '逾期费用' }] }
export const MONEY_NUM_C = { total: 411.92, data: [{ value: 332.1, name: '租借收入' }, { value: 79.82, name: '逾期费用' }] }

export const TODAY_TIME = ['0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00']

export const TODAY_NUM_A = { incomeData: [0, 0, 0, 0, 0, 629.22, 450, 480.45, 2032.22, 5900.12, 4569, 3476, 1020.22, 2409.39, 3647.13, 3838.2, 2232.29, 1753.45, 2777.93, 2459.27, 2495.92, 722.8, 489.22, 0], refundData: [0, 0, 0, 0, 0, 110, 200, 1300, 3799.22, 3567.23, 2200, 1387, 374.33, 2389.38, 4877.13, 2890.22, 1343.73, 1347.69, 1351.83, 350.27, 2342.86, 346.06, 350.88, 0] }
export const TODAY_NUM_B = { incomeData: [0, 0, 0, 0, 0, 778.22, 380, 320, 2789.09, 3767.98, 4728, 2978.03, 1273.33, 1821.94, 2295.2, 2349.02, 3479.22, 1503.34, 2533.36, 2602.07, 2461.21, 716.24, 276.22, 0], refundData: [0, 0, 0, 0, 0, 255, 200, 1450, 2200, 3656.98, 2239.03, 1973, 338.23, 2725.84, 2342, 1349, 1435.72, 1345.91, 1344.12, 346.82, 2346.68, 348.09, 352.05, 0] }
export const TODAY_NUM_C = { incomeData: [0, 0, 0, 0, 0, 778.98, 480, 170, 290.22, 2345.98, 2387, 3746.93, 2300.22, 2764.96, 3689.23, 3478, 2295.2, 1676.81, 2841.43, 2579.56, 2678.19, 338.74, 256.02, 0], refundData: [0, 0, 0, 0, 0, 300, 20.39, 1840, 1899.23, 2234.03, 2297.02, 1298.22, 1299, 2892.88, 2390, 1344.23, 1349.02, 346.35, 1343.47, 348.42, 2345.23, 341.19, 343.79, 0] }

export const WEEK_DATA = ['第一天', '第二天', '第三天', '第四天', '第五天', '第六天', '第七天']
export const WEEK_NUM_A = { incomeData: ['14248', '13593', '14297', '13929', '14919', '13932', '14066'], refundData: ['3393', '3024', '2970', '3254', '3170', '3223', '2964'] }
export const WEEK_NUM_B = { incomeData: ['13785', '14634', '13636', '13846', '14038', '14845', '14607'], refundData: ['2981', '3033', '3105', '3311', '3326', '3141', '3302'] }
export const WEEK_NUM_C = { incomeData: ['14002', '14128', '13995', '14551', '14421', '14295', '14235'], refundData: ['3137', '3035', '3083', '3262', '3067', '3189', '3486'] }

export const MONTH_NUM_A = { incomeData: ['13689', '14114', '13872', '14248', '13593', '14297', '13929', '14919', '13932', '14066', '13816', '13405', '14287', '14241', '14382', '14117', '14703', '14498', '14674', '13686', '14732', '13528', '13994', '13719', '14292', '13902', '14321', '14548', '14188', '14381', '13547'], refundData: ['3123', '3107', '3248', '3393', '3024', '2970', '3254', '3170', '3223', '2964', '3484', '3454', '3092', '3213', '3377', '3405', '3059', '3033', '3094', '3141', '3439', '3489', '3286', '3384', '3262', '3347', '2980', '3332', '3426', '3429', '3347'] }
export const MONTH_NUM_B = { incomeData: [14823, 14596, 14042, 13785, 14634, 13636, 13846, 14038, 14845, 14607, 13583, 13797, 13775, 14760, 14626, 13990, 14265, 13868, 13781, 14184, 14542, 13839, 14358, 13547, 13686, 13867, 14096, 14266, 14871, 14961, 13902], refundData: [3058, 3290, 3350, 2981, 3033, 3105, 3311, 3326, 3141, 3302, 3144, 3040, 2962, 3166, 3444, 3403, 3050, 3035, 3312, 3296, 3111, 3074, 3395, 3371, 3360, 3172, 3461, 2969, 3253, 3092, 3371] }
export const MONTH_NUM_C = { incomeData: [14356, 14408, 13942, 14002, 14128, 13995, 14551, 14421, 14295, 14235, 13996, 13579, 14899, 14292, 13867, 14187, 13696, 14908, 14435, 14424, 14218, 14168, 13640, 14226, 14184, 14732, 13362, 13464, 14212, 14858, 14184], refundData: [3016, 3035, 3331, 3137, 3035, 3083, 3262, 3067, 3189, 3486, 3462, 3024, 3186, 3231, 3036, 3449, 3367, 3113, 3314, 3032, 3225, 3284, 3063, 3391, 3063, 3173, 3327, 3271, 3306, 3425, 3360] }

export const TODAY_EARNING_NUM_A = { incomeData: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 2, 4, 1, 4, 3, 0, 2, 3, 1, 1, 0, 0, 0], refundData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1, 4, 4, 0, 0, 0, 0] }
export const TODAY_EARNING_NUM_B = { incomeData: [0, 0, 0, 0, 0, 0, 1, 2, 4, 3, 0, 1, 3, 3, 3, 4, 1, 2, 1, 1, 0, 0, 0, 0], refundData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 1, 1, 2, 1, 1, 1, 3, 1, 1, 0, 0, 0] }
export const TODAY_EARNING_NUM_C = { incomeData: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2, 1, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 0], refundData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 3, 2, 2, 1, 1, 1, 2, 0, 1, 0, 0] }

export const WEEK_EARNING_NUM_A = { incomeData: [24, 0, 14, 13, 11, 10, 20], refundData: [21, 17, 12, 13, 19, 24, 12] }
export const WEEK_EARNING_NUM_B = { incomeData: [29, 18, 26, 6, 28, 19, 18], refundData: [17, 8, 23, 23, 22, 21, 16] }
export const WEEK_EARNING_NUM_C = { incomeData: [15, 16, 13, 15, 5, 19, 17], refundData: [21, 15, 27, 20, 24, 15, 16] }

export const MONTH_EARNING_NUM_A = { incomeData: [12, 19, 10, 24, 0, 14, 13, 11, 10, 20, 8, 15, 9, 9, 21, 13, 21, 21, 13, 28, 13, 12, 14, 18, 17, 22, 10, 20, 30, 22, 17], refundData: [19, 19, 27, 21, 17, 12, 13, 19, 24, 12, 11, 12, 17, 24, 8, 14, 18, 21, 9, 33, 11, 24, 24, 18, 16, 32, 27, 25, 10, 16, 16] }
export const MONTH_EARNING_NUM_B = { incomeData: [8, 26, 22, 29, 18, 26, 6, 28, 19, 18, 23, 4, 25, 18, 18, 5, 29, 18, 28, 7, 12, 11, 23, 8, 15, 10, 7, 25, 12, 13, 12], refundData: [9, 28, 7, 17, 8, 23, 23, 22, 21, 16, 20, 20, 21, 21, 14, 7, 29, 33, 14, 9, 25, 16, 16, 6, 12, 14, 9, 11, 9, 20, 15] }
export const MONTH_EARNING_NUM_C = { incomeData: [5, 8, 14, 15, 16, 13, 15, 5, 19, 17, 16, 14, 2, 18, 14, 6, 6, 13, 10, 16, 7, 7, 32, 13, 6, 17, 20, 14, 24, 9, 14], refundData: [14, 21, 16, 21, 15, 27, 20, 24, 15, 16, 30, 19, 25, 14, 14, 10, 16, 15, 17, 18, 19, 11, 19, 13, 29, 8, 8, 14, 22, 26, 10] }

export const TODAY_SERVE_NUM_A = { incomeData: [54, 64, 34, 50, 63, 89, 102, 132, 124, 179, 147, 142, 160, 99, 112, 138, 102, 167, 144, 122, 94, 63, 59, 52], refundData: [44, 54, 24, 40, 53, 79, 92, 122, 114, 169, 137, 132, 150, 89, 102, 128, 92, 157, 134, 112, 84, 53, 49, 42] }
export const TODAY_SERVE_NUM_B = { incomeData: [74, 56, 34, 44, 62, 67, 110, 128, 137, 176, 140, 139, 157, 108, 121, 123, 117, 143, 141, 163, 102, 61, 61, 52], refundData: [64, 46, 24, 34, 52, 57, 100, 118, 127, 166, 130, 129, 147, 98, 111, 113, 107, 133, 131, 153, 92, 51, 51, 42] }
export const TODAY_SERVE_NUM_C = { incomeData: [84, 60, 32, 49, 47, 67, 87, 129, 122, 164, 125, 115, 142, 97, 113, 109, 112, 115, 129, 153, 102, 82, 46, 49], refundData: [74, 50, 22, 39, 37, 57, 77, 119, 112, 154, 115, 105, 132, 87, 103, 99, 102, 105, 119, 143, 92, 72, 36, 39] }

export const WEEK_SERVE_NUM_A = { incomeData: [2492, 2656, 2789, 2578, 2656, 2767, 2521], refundData: [2392, 2556, 2689, 2478, 2556, 2667, 2421] }
export const WEEK_SERVE_NUM_B = { incomeData: [2516, 2267, 2678, 2567, 2878, 2567, 2878], refundData: [2416, 2167, 2578, 2467, 2778, 2467, 2778] }
export const WEEK_SERVE_NUM_C = { incomeData: [2330, 2467, 2565, 2376, 2567, 2545, 2754], refundData: [2230, 2367, 2465, 2276, 2467, 2445, 2654] }

export const MONTH_SERVE_NUM_A = { incomeData: [2720, 2713, 2728, 2492, 2656, 2789, 2578, 2656, 2767, 2521, 2672, 2773, 2890, 2838, 2690, 2529, 2491, 2745, 2869, 2811, 2904, 2796, 2822, 2592, 2961, 2883, 2766, 2540, 2759, 2973, 2869], refundData: [2620, 2613, 2628, 2392, 2556, 2689, 2478, 2556, 2667, 2421, 2572, 2673, 2790, 2738, 2590, 2429, 2391, 2645, 2769, 2711, 2804, 2696, 2722, 2492, 2861, 2783, 2666, 2440, 2659, 2873, 2769] }
export const MONTH_SERVE_NUM_B = { incomeData: [2762, 2799, 2762, 2516, 2267, 2678, 2567, 2878, 2567, 2878, 2869, 2718, 2645, 2638, 2884, 2617, 2852, 2691, 2856, 2698, 2940, 2861, 3003, 2633, 2778, 2712, 2780, 2846, 2686, 2812, 2566], refundData: [2662, 2699, 2662, 2416, 2167, 2578, 2467, 2778, 2467, 2778, 2769, 2618, 2545, 2538, 2784, 2517, 2752, 2591, 2756, 2598, 2840, 2761, 2903, 2533, 2678, 2612, 2680, 2746, 2586, 2712, 2466] }
export const MONTH_SERVE_NUM_C = { incomeData: [2760, 2776, 2513, 2330, 2467, 2565, 2376, 2567, 2545, 2754, 2856, 2688, 2800, 2750, 2665, 2889, 2881, 2672, 2801, 2927, 2675, 2611, 2552, 2915, 3022, 2579, 2835, 2628, 2849, 2667, 2722], refundData: [2660, 2676, 2413, 2230, 2367, 2465, 2276, 2467, 2445, 2654, 2756, 2588, 2700, 2650, 2565, 2789, 2781, 2572, 2701, 2827, 2575, 2511, 2452, 2815, 2922, 2479, 2735, 2528, 2749, 2567, 2622] }

export const BACKLOG_DATA_A = [{ type: 3, num: 'RZ202310181126491', title: '刘信俊的入住申请', name: '宋湘婷', date: '2023-10-18 11:26:00' }, { type: 3, num: 'RZ202310181144772', title: '李美治的入住申请', name: '王姿吟', date: '2023-10-18 11:44:00' }, { type: 1, num: 'TZ202310181217777', title: '汤筠霞的退住申请', name: '马荣真', date: '2023-10-18 12:17:00' }]
export const BACKLOG_DATA_B = [{ type: 1, num: 'TZ202310220800769', title: '张昆元的退住申请', name: '龚静雯', date: '2023-10-22 08:00:00' }, { type: 1, num: 'TZ202310230932323', title: '林国芸的退住申请', name: '曹智强', date: '2023-10-23 09:32:00' }, { type: 3, num: 'RZ202310232217987', title: '游石如的入住申请', name: '葛真珍', date: '2023-10-23 22:17:00' }]
export const BACKLOG_DATA_C = [{ type: 3, num: 'RZ202310131703287', title: '陈冠廷的入住申请', name: '叶静宜', date: '2023-10-13 17:03:00' }, { type: 1, num: 'TZ202310131829109', title: '庾雅婷的退住申请', name: '曹智强', date: '2023-10-13 18:29:00' }, { type: 3, num: 'TZ202310132102640', title: '陈采勇的退住申请', name: '林宜蓁', date: '2023-10-13 21:02:00' }]

export const SUBSCRIBE_DATA = [
  [{ type: 1, phone: '17062479244', name: '张伟', time: '09:00' }, { type: 1, phone: '17395096135', name: '林建华', time: '12:00' }, { type: 2, phone: '13470504971', name: '马荣真', time: '18:00' }],
  [{ type: 1, phone: '16133295231', name: '李思远', time: '07:35' }, { type: 1, phone: '13505066198', name: '王刚', time: '11:20' }, { type: 2, phone: '15650105031', name: '张宏伟', time: '18:00' }],
  [{ type: 1, phone: '17705167560', name: '黄成立', time: '12:00' }, { type: 2, phone: '17714515848', name: '周安', time: '13:00' }, { type: 2, phone: '14144928346', name: '刘翱川云', time: '14:00' }],
  [{ type: 2, phone: '19424354614', name: '杨雪莉', time: '09:00' }, { type: 2, phone: '16472588080', name: '陈琳', time: '15:00' }, { type: 2, phone: '19321315213', name: '徐秀娟', time: '16:30' }],
  [{ type: 1, phone: '19334274595', name: '刘强', time: '07:45' }, { type: 2, phone: '13267734773', name: '陈鹏', time: '08:00' }, { type: 1, phone: '15240724014', name: '袁文轩', time: '09:00' }],
  [{ type: 2, phone: '19224279107', name: '刘毅豪', time: '09:50' }, { type: 1, phone: '13267739898', name: '许浩然', time: '10:00' }, { type: 1, phone: '15424276235', name: '王婷', time: '11:15' }],
  [{ type: 1, phone: '15576572508', name: '谢杰', time: '11:10' }, { type: 2, phone: '14779915659', name: '李婉娜', time: '11:30' }, { type: 2, phone: '13047879330', name: '陈进', time: '11:45' }],
  [{ type: 1, phone: '19161592761', name: '袁洋', time: '08:00' }, { type: 1, phone: '13348740172', name: '张晓丽', time: '12:00' }, { type: 2, phone: '14144969481', name: '刘鑫', time: '18:00' }],
  [{ type: 1, phone: '15378283924', name: '张雨静涵', time: '07:00' }, { type: 1, phone: '15018246673', name: '张豪', time: '14:00' }, { type: 1, phone: '16157278889', name: '刘莉', time: '18:00' }],
  [{ type: 2, phone: '16006983031', name: '王美惠', time: '09:00' }, { type: 1, phone: '14440882401', name: '刘易空麟', tme: '09:20' }, { type: 2, phone: '19546590654', name: '孙鹏', time: '16:00' }]
]

export const ELDER_RANK_DATA_A = [{ value: 43, name: '在线设备' }, { value: 89, name: '离线设备' }, { value: 192, name: '维护中' }, { value: 319, name: '故障设备' }]
export const ELDER_RANK_DATA_B = [{ value: 42, name: '在线设备' }, { value: 91, name: '离线设备' }, { value: 191, name: '维护中' }, { value: 331, name: '故障设备' }]
export const ELDER_RANK_DATA_C = [{ value: 37, name: '在线设备' }, { value: 91, name: '离线设备' }, { value: 196, name: '维护中' }, { value: 325, name: '故障设备' }]

export const ELDER_AGE_DATA_A = { man: [19, 51, 124, 98, 7], woman: [22, 40, 164, 102, 16] }
export const ELDER_AGE_DATA_B = { man: [19, 54, 128, 98, 8], woman: [25, 40, 164, 102, 17] }
export const ELDER_AGE_DATA_C = { man: [18, 47, 128, 99, 8], woman: [26, 38, 165, 102, 18] }

// --- 工具函数 (Original utils.js) ---

/**
 * 首页 dashboard 基础图表配置 (用于 TopPanel 等小型图表)
 * @param {string} type - 'line' | 'bar'
 */
export function constructInitDashboardDataset(type) {
  const dateArray = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const datasetAxis = {
    xAxis: { type: 'category', show: false, data: dateArray },
    yAxis: { show: false, type: 'value' },
    grid: { top: 0, left: 0, right: 0, bottom: 0 }
  }

  if (type === 'line') {
    return {
      ...datasetAxis,
      color: ['#fff'],
      series: [{
        data: [150, 230, 224, 218, 135, 147, 260],
        type,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 0,
        markPoint: { data: [{ type: 'max', name: '最大值' }, { type: 'min', name: '最小值' }] },
        lineStyle: { width: 2 }
      }]
    }
  }
  
  return {
    ...datasetAxis,
    color: getChartListColor(),
    series: [{
      data: [100, 130, 184, 218, { value: 135, itemStyle: { opacity: 0.2 } }, { value: 118, itemStyle: { opacity: 0.2 } }, { value: 60, itemStyle: { opacity: 0.2 } }],
      type,
      barWidth: 9
    }]
  }
}

/**
 * 设备状态分布饼图
 */
export const getElderRankDistribution = (data) => {
  return {
    color: ['#47CBBA', '#9891df', '#8EBEF3', '#FFB057', '#FE6E6E'],
    tooltip: {
      trigger: 'item',
      formatter(params) {
        return `<div>${params.name}<br/><div>${params.marker} <span style="font-weight:bold;">${params.value}台 &nbsp;  ${params.percent}% </span></div></div>`
      }
    },
    legend: { icon: 'circle', itemHeight: 6, orient: 'vertical', left: '60%', top: 'center', align: 'left' },
    grid: { top: '10%', bottom: '5%' },
    series: [{ name: '', type: 'pie', radius: ['30%', '60%'], center: ['30%', '50%'], label: { show: false, position: 'center' }, labelLine: { show: false }, startAngle: 225, data }]
  }
}

/**
 * 用户活跃度分布柱状图
 */
export const getElderAgeDistribution = (data) => {
  const xAxisData = ['低活跃', '中活跃', '高活跃', '沉睡用户', '新注册']
  return {
    color: ['#27C2AE', '#FE6E6E'],
    legend: { data: ['新用户', '老用户'], icon: 'circle', itemHeight: 6, top: 'bottom' },
    tooltip: {
      trigger: 'item',
      formatter(params) {
        return `<div>${params.name}<br/><div>${params.marker}<span style="font-weight:bold;">${params.seriesName}&nbsp;${params.value}人</span></div></div>`
      }
    },
    xAxis: { data: xAxisData, axisLine: { onZero: true }, splitLine: { show: false }, splitArea: { show: false }, axisLabel: { show: true, interval: 0 } },
    yAxis: {},
    grid: { left: '15%', top: '10%', bottom: '25%' },
    series: [
      { name: '新用户', type: 'bar', barWidth: 20, stack: 'one', data: data.man },
      { name: '老用户', type: 'bar', barWidth: 20, stack: 'one', data: data.woman }
    ]
  }
}

/**
 * 基础饼图通用配置
 */
function getBasePieChartDataSet({ textColor, containerColor, colors, unit, labelName }, data) {
  return {
    color: colors || getChartListColor(),
    tooltip: { trigger: 'item', formatter: `{b}: {c} ${unit}` },
    legend: false,
    series: [{
      name: labelName,
      type: 'pie',
      radius: ['65%', '80%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: containerColor, borderWidth: 1 },
      label: {
        show: true,
        position: 'center',
        formatter: [`{value|${data.total}${unit}}`, `{name|${labelName}}`].join('\n'),
        rich: {
          value: { color: textColor, fontSize: 18, fontWeight: 'normal', lineHeight: 46 },
          name: { color: '#909399', fontSize: 14, lineHeight: 14 }
        }
      },
      labelLine: { show: false },
      data: data.data
    }]
  }
}

export function getOldPieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, unit: '台', labelName: '充电宝数量' }, data) }
export function getBedPieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, colors: ['#d7f1ed', '#689FFF'], unit: '个', labelName: '设备点位' }, data) }
export function getservePieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, colors: ['#d7f1ed', '#ADA5EE'], unit: '万次', labelName: '使用次数' }, data) }
export function getStaffPieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, colors: ['#d7f1ed', '#FFB056'], unit: '个', labelName: '合作商户' }, data) }
export function getMoneyPieChartDataSet(config, data) { return getBasePieChartDataSet({ ...config, colors: ['#d7f1ed', '#FE8585'], unit: '万元', labelName: '租借收入' }, data) }

// --- Quick Functions Metadata ---

export const QUICK_FUNCTION_CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'system', name: '系统管理' },
  { id: 'business', name: '业务管理' }
]

// --- 设备管理图标元数据 (Apple HIG 风格) ---

export const DEVICE_ICONS = {
  // 设备状态
  status: {
    online: {
      label: '使用中',
      color: '#34C759', // Apple Green
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="6" fill="#34C759">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="12" r="10" stroke="#34C759" stroke-width="2" opacity="0.2" />
      </svg>`
    },
    offline: {
      label: '未投入',
      color: '#8E8E93', // Apple Gray
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="6" fill="#8E8E93" />
        <circle cx="12" cy="12" r="10" stroke="#8E8E93" stroke-width="2" opacity="0.2" />
      </svg>`
    },
    error: {
      label: '故障',
      color: '#FF3B30', // Apple Red
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="6" fill="#FF3B30" />
        <path d="M12 8V13M12 16H12.01" stroke="white" stroke-width="2" stroke-linecap="round" />
        <circle cx="12" cy="12" r="10" stroke="#FF3B30" stroke-width="2" opacity="0.2" />
      </svg>`
    }
  },
  // 设备分类
  types: {
    server: {
      label: '服务器',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="6" rx="2" stroke="currentColor" stroke-width="2"/>
        <rect x="3" y="14" width="18" height="6" rx="2" stroke="currentColor" stroke-width="2"/>
        <circle cx="7" cy="7" r="1" fill="currentColor"/>
        <circle cx="7" cy="17" r="1" fill="currentColor"/>
      </svg>`
    },
    cabinet: {
      label: '充电柜',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3H19V21H5V3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M5 9H19M5 15H19" stroke="currentColor" stroke-width="2"/>
        <path d="M9 6H15M9 12H15M9 18H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    network: {
      label: '网络设备',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 13L12 21L4 13M4 11L12 3L20 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    terminal: {
      label: '终端设备',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="16" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
        <path d="M8 20H16M12 15V20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    },
    default: {
      label: '通用设备',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L4 9V21H20V9L12 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2"/>
      </svg>`
    }
  },
  // 操作图标
  actions: {
    configure: {
      label: '配置',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2"/>
        <path d="M19.4 15L21.7 13.7C22.1 13.5 22.2 13 22 12.6L21 10.9C20.8 10.5 20.3 10.4 19.9 10.6L17.6 11.9C17.3 11.7 17.1 11.5 16.8 11.3L16.8 8.6C16.8 8.2 16.5 7.9 16.1 7.9H14.1C13.7 7.9 13.4 8.2 13.4 8.6L13.4 11.3C13.1 11.5 12.8 11.7 12.6 11.9L10.3 10.6C9.9 10.4 9.4 10.5 9.2 10.9L8.2 12.6C8 13 8.1 13.5 8.5 13.7L10.8 15C10.8 15.3 10.8 15.7 10.8 16L8.5 17.3C8.1 17.5 8 18 8.2 18.4L9.2 20.1C9.4 20.5 9.9 20.6 10.3 20.4L12.6 19.1C12.8 19.3 13.1 19.5 13.4 19.7V22.4C13.4 22.8 13.7 23.1 14.1 23.1H16.1C16.5 23.1 16.8 22.8 16.8 22.4V19.7C17.1 19.5 17.3 19.3 17.6 19.1L19.9 20.4C20.3 20.6 20.8 20.5 21 20.1L22 18.4C22.2 18 22.1 17.5 21.7 17.3L19.4 16C19.4 15.7 19.4 15.3 19.4 15Z" stroke="currentColor" stroke-width="2"/>
      </svg>`
    },
    restart: {
      label: '重启',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 7L12 3L8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    delete: {
      label: '删除',
      svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    }
  }
}

export const QUICK_FUNCTIONS = [
  { id: 'user', name: '用户管理', icon: 'peoples', path: '/system/user', category: 'system' },
  { id: 'role', name: '角色管理', icon: 'peoples', path: '/system/role', category: 'system' },
  { id: 'menu', name: '菜单管理', icon: 'tree-table', path: '/system/menu', category: 'system' },
  { id: 'dept', name: '部门管理', icon: 'tree', path: '/system/dept', category: 'system' },
  { id: 'post', name: '岗位管理', icon: 'post', path: '/system/post', category: 'system' },
  { id: 'dict', name: '字典管理', icon: 'dict', path: '/system/dict', category: 'system' },
  { id: 'config', name: '参数设置', icon: 'edit', path: '/system/config', category: 'system' },
  { id: 'log', name: '操作日志', icon: 'log', path: '/monitor/operlog', category: 'system' },
  { id: 'job', name: '定时任务', icon: 'job', path: '/monitor/job', category: 'system' },
  { id: 'cabinet', name: '柜机管理', icon: 'server', path: '/device/cabinet', category: 'business' },
  { id: 'device', name: '设备管理', icon: 'monitor', path: '/device/device', category: 'business' },
  { id: 'order', name: '订单管理', icon: 'shopping', path: '/order/orderInfo', category: 'business' },
  { id: 'fee', name: '规则管理', icon: 'money', path: '/rule/feeRule', category: 'business' },
  { id: 'member', name: '会员管理', icon: 'user', path: '/user/userInfo', category: 'business' }
]

