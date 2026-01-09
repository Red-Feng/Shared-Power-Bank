# Dashboard 重构设计规范文档 (Apple HIG 风格)

## 1. 视觉系统概述
本次重构完全遵循 Apple Human Interface Guidelines (HIG)，旨在为用户提供清晰、优雅且一致的交互体验。

### 1.1 色彩方案 (Color Palette)
- **系统主色**: 
  - Blue: `#007AFF` (主要操作、链接)
  - Green: `#34C759` (成功状态、正向增长)
  - Red: `#FF3B30` (警告、错误)
- **背景色**:
  - Primary Background: `#FFFFFF` (卡片背景)
  - Secondary Background: `#F2F2F7` (页面底色)
- **文字颜色**:
  - Primary Label: `#000000` (标题、正文)
  - Secondary Label: `rgba(60, 60, 67, 0.6)` (描述、副标题)

### 1.2 字体系统 (Typography)
- **字体族**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif`
- **层级**:
  - Title 1: `28px`, Bold
  - Headline: `17px`, Semibold
  - Body: `17px`, Regular
  - Footnote: `13px`, Regular

### 1.3 布局与间距 (Layout & Spacing)
- **网格系统**: 基于 8pt 网格系统。
- **圆角**: 
  - 卡片: `16px` (XL)
  - 按钮/标签: `9999px` (Full/Capsule)
  - 输入框/小组件: `8px` (MD)

## 2. 组件重构说明
- **卡片 (Apple Card)**: 移除了传统的边框，改用极其柔和的投影 (`0 1px 3px rgba(0,0,0,0.04)`) 和 `1px` 的极浅边框。增加了 `hover` 时的位移和阴影增强动效。
- **Tab 切换**: 重新设计为 Apple 经典的胶囊式切换器，背景色为 `System Gray 6`，激活项具有白色背景和微弱投影。
- **图表美化**: ECharts 统一使用 Apple 调色板，增加了渐变面积填充，优化了 Tooltip 的毛玻璃模糊效果 (`backdrop-filter`)。

## 3. 跨浏览器兼容性测试报告
- **Chrome / Edge**: 完全兼容，动效流畅，毛玻璃效果表现完美。
- **Safari**: 原生支持最好，SF Pro 字体渲染最清晰。
- **Firefox**: 兼容，毛玻璃效果需确保 `layout.css.backdrop-filter.enabled` 开启（现代版本默认开启）。
- **移动端**: 响应式布局适配良好，卡片堆叠逻辑正常。

## 4. 性能优化记录
- 采用 SCSS Mixins 减少重复代码。
- 减少了不必要的 DOM 嵌套。
- 动效全部采用 `transform` 和 `opacity` 以利用 GPU 加速，确保 60fps。
