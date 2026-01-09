# AI聊天界面

这是一个基于Vue 3 + Element Plus构建的现代化AI聊天界面，提供了丰富的交互功能和良好的用户体验。

## 🌟 核心功能

### 💬 消息功能
- **实时聊天**: 支持与AI助手的实时对话
- **消息历史**: 自动保存和管理聊天记录
- **多种消息类型**: 支持文本、文件、图片等多种消息格式
- **消息操作**: 复制、重新生成、删除消息
- **状态指示**: 显示发送状态、AI输入状态

### 🎨 界面特性
- **响应式设计**: 完美适配桌面和移动设备
- **深色/浅色主题**: 支持主题切换，保护用户视力
- **平滑动画**: 流畅的交互动画和过渡效果
- **Markdown支持**: 自动渲染Markdown格式的消息内容
- **代码高亮**: 支持代码块和行内代码的高亮显示

### 🛠️ 输入功能
- **快捷输入**: 支持Enter发送，Shift+Enter换行
- **表情贴图**: 丰富的表情和贴图选择
- **文件上传**: 支持多种文件格式的上传
- **语音输入**: 语音转文字功能（需要浏览器支持）
- **字符限制**: 智能字符计数和限制提示

### 📊 智能功能
- **快捷模板**: 预设的对话模板，快速开始对话
- **AI模型选择**: 支持多种AI模型切换
- **对话导出**: 一键导出聊天记录
- **会话管理**: 支持多个会话的管理和切换

## 🏗️ 技术架构

### 前端技术栈
- **Vue 3**: 使用Composition API
- **Element Plus**: UI组件库
- **Pinia**: 状态管理
- **Vue Router**: 路由管理
- **SCSS**: 样式预处理

### 项目结构
```
src/
├── views/ai/
│   ├── index.vue              # 主聊天界面
│   └── README.md             # 说明文档
├── components/Chat/
│   ├── MessageItem.vue       # 消息组件
│   ├── ChatInput.vue         # 输入组件
│   └── ChatTemplates.vue     # 模板组件
├── api/ai/
│   └── ai.js                 # API接口
└── store/modules/
    └── chat.js               # 状态管理
```

## 🚀 快速开始

### 1. 访问界面
在浏览器中访问 `/ai/chat` 即可进入AI聊天界面。

### 2. 基础使用
1. 在输入框中输入您的问题
2. 按Enter发送消息，或点击发送按钮
3. 等待AI助手的回复
4. 可以继续进行多轮对话

### 3. 高级功能
- **使用模板**: 点击模板按钮，选择预设的对话模板
- **上传文件**: 点击附件按钮上传相关文件
- **切换主题**: 点击主题切换按钮
- **导出对话**: 点击导出按钮保存聊天记录

## 🎯 使用场景

### 1. 工作助手
- 邮件撰写和优化
- 会议纪要整理
- 报告生成
- 数据分析

### 2. 学习辅导
- 概念解释
- 问题解答
- 学习计划制定
- 知识梳理

### 3. 创意支持
- 故事创作
- 诗歌写作
- 创意点子
- 设计建议

### 4. 生活助手
- 健康建议
- 时间管理
- 旅行规划
- 情感支持

## ⚙️ 配置说明

### API配置
在 `src/api/ai/ai.js` 中配置后端API接口：

```javascript
// 修改API基础URL
const baseURL = process.env.VUE_APP_BASE_API

// 配置各个接口的路径和参数
export function sendMessage(data) {
  return request({
    url: '/ai/chat/send',
    method: 'post',
    data: data
  })
}
```

### 主题配置
在 `src/store/modules/chat.js` 中配置主题选项：

```javascript
// 默认主题
theme: 'light' // 'light' | 'dark'

// 支持的主题颜色
const themes = {
  light: {
    background: '#ffffff',
    text: '#303133',
    border: '#ebeef5'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    border: '#444444'
  }
}
```

### 模型配置
支持的AI模型可以在配置中添加：

```javascript
// 可用模型列表
availableModels: [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'claude-3', name: 'Claude 3' }
]
```

## 🔧 自定义开发

### 1. 添加新消息类型
在 `MessageItem.vue` 中扩展消息类型支持：

```vue
<template>
  <!-- 添加新的消息类型处理 -->
  <div v-if="message.type === 'image'" class="image-message">
    <img :src="message.content" alt="图片" />
  </div>
</template>
```

### 2. 扩展快捷模板
在 `ChatTemplates.vue` 中添加新的模板：

```javascript
const newTemplate = {
  id: 16,
  category: 'custom',
  title: '自定义模板',
  description: '自定义功能描述',
  icon: 'CustomIcon',
  color: '#custom-color',
  prompt: '自定义提示词'
}
```

### 3. 添加新功能
1. 在 `store/modules/chat.js` 中添加状态和action
2. 在组件中调用新的action
3. 添加相应的UI界面

## 🐛 故障排除

### 常见问题

**Q: 消息发送失败怎么办？**
A: 检查网络连接和API配置，确认后端服务正常。

**Q: 文件上传不成功？**
A: 确认文件格式和大小符合要求，检查上传接口配置。

**Q: 主题切换无效？**
A: 检查本地存储和CSS变量配置是否正确。

**Q: 移动端显示异常？**
A: 确认响应式CSS和viewport配置正确。

### 调试模式
在浏览器控制台中启用调试模式：

```javascript
// 开启调试
localStorage.setItem('chat-debug', 'true')

// 查看状态
console.log(window.__VUE_DEVTOOLS_GLOBAL_HOOK__)
```

## 📱 移动端适配

### 响应式断点
- **桌面端**: > 768px
- **平板端**: 768px - 1024px  
- **手机端**: < 768px

### 移动端优化
- 触摸友好的按钮尺寸
- 简化的工具栏
- 优化的键盘体验
- 手势操作支持

## 🔒 安全考虑

### 数据安全
- 所有本地数据都存储在localStorage中
- API请求使用HTTPS加密传输
- 敏感信息不会记录在日志中

### 隐私保护
- 用户对话内容仅在本地存储
- 支持一键清空所有聊天记录
- 不收集用户个人信息

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发环境设置
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 代码规范
- 使用ESLint进行代码检查
- 遵循Vue 3 Composition API最佳实践
- 编写清晰的注释和文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交Issue到GitHub仓库
- 发送邮件到项目维护者
- 参与社区讨论

---

*最后更新时间: 2024年*