<template>
  <div class="chat-templates">
    <div class="templates-header">
      <h3>快捷对话模板</h3>
      <el-button 
        type="text" 
        size="small" 
        icon="Close" 
        @click="$emit('close')"
      />
    </div>
    
    <div class="templates-content">
      <!-- 分类标签 -->
      <div class="template-categories">
        <el-tabs v-model="activeCategory" size="small">
          <el-tab-pane 
            v-for="category in categories" 
            :key="category.key"
            :label="category.name" 
            :name="category.key"
          />
        </el-tabs>
      </div>
      
      <!-- 模板列表 -->
      <div class="template-list">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          class="template-item"
          @click="selectTemplate(template)"
        >
          <div class="template-icon">
            <el-icon :color="template.color">
              <component :is="template.icon" />
            </el-icon>
          </div>
          <div class="template-content">
            <div class="template-title">{{ template.title }}</div>
            <div class="template-description">{{ template.description }}</div>
          </div>
          <div class="template-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
      
      <!-- 自定义输入 -->
      <div class="custom-template">
        <el-input
          v-model="customPrompt"
          type="textarea"
          :rows="2"
          placeholder="输入自定义问题..."
          maxlength="200"
          show-word-limit
        />
        <el-button 
          type="primary" 
          size="small"
          @click="selectCustomTemplate"
          :disabled="!customPrompt.trim()"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  ChatLineSquare, 
  Document, 
  MagicStick, 
  Edit, 
  QuestionFilled, 
  Star,
  ArrowRight,
  TrendCharts,
  Reading,
  Brush,
  VideoPlay
} from '@element-plus/icons-vue'

const emit = defineEmits(['select', 'close'])

// 响应式数据
const activeCategory = ref('common')
const customPrompt = ref('')

// 分类数据
const categories = [
  { key: 'common', name: '通用' },
  { key: 'work', name: '工作' },
  { key: 'study', name: '学习' },
  { key: 'life', name: '生活' },
  { key: 'creative', name: '创意' }
]

// 模板数据
const templates = [
  // 通用模板
  {
    id: 1,
    category: 'common',
    title: '自我介绍',
    description: '让AI介绍自己的功能和特点',
    icon: 'ChatLineSquare',
    color: '#409eff',
    prompt: '请介绍一下你的功能和特点，你能帮我做什么？'
  },
  {
    id: 2,
    category: 'common',
    title: '询问帮助',
    description: '获取使用指南和帮助信息',
    icon: 'QuestionFilled',
    color: '#67c23a',
    prompt: '我该如何更好地使用你的功能？有什么使用技巧吗？'
  },
  {
    id: 3,
    category: 'common',
    title: '反馈建议',
    description: '提供反馈或改进建议',
    icon: 'Star',
    color: '#e6a23c',
    prompt: '我有一些建议想告诉你，希望能帮助你改进。'
  },
  
  // 工作模板
  {
    id: 4,
    category: 'work',
    title: '邮件撰写',
    description: '帮助撰写商务邮件',
    icon: 'Document',
    color: '#f56c6c',
    prompt: '请帮我写一封专业的商务邮件，内容是关于...'
  },
  {
    id: 5,
    category: 'work',
    title: '会议总结',
    description: '生成会议纪要和总结',
    icon: 'Document',
    color: '#f56c6c',
    prompt: '请帮我整理以下会议内容并生成会议纪要：'
  },
  {
    id: 6,
    category: 'work',
    title: '报告撰写',
    description: '协助撰写工作报告',
    icon: 'TrendCharts',
    color: '#909399',
    prompt: '请帮我撰写一份关于...的工作报告'
  },
  
  // 学习模板
  {
    id: 7,
    category: 'study',
    title: '概念解释',
    description: '解释复杂概念和术语',
    icon: 'Reading',
    color: '#409eff',
    prompt: '请详细解释一下...这个概念'
  },
  {
    id: 8,
    category: 'study',
    title: '学习计划',
    description: '制定个性化学习计划',
    icon: 'MagicStick',
    color: '#67c23a',
    prompt: '请帮我制定一个关于...的学习计划'
  },
  {
    id: 9,
    category: 'study',
    title: '问题解答',
    description: '解答学习中的疑问',
    icon: 'QuestionFilled',
    color: '#e6a23c',
    prompt: '我在学习...时遇到了一个问题，请帮我解答：'
  },
  
  // 生活模板
  {
    id: 10,
    category: 'life',
    title: '健康建议',
    description: '获取健康生活建议',
    icon: 'Star',
    color: '#f56c6c',
    prompt: '请给我一些关于保持健康生活方式的建议'
  },
  {
    id: 11,
    category: 'life',
    title: '时间管理',
    description: '时间管理技巧和方法',
    icon: 'MagicStick',
    color: '#909399',
    prompt: '请分享一些有效的时间管理方法'
  },
  {
    id: 12,
    category: 'life',
    title: '旅行规划',
    description: '制定旅行计划和攻略',
    icon: 'VideoPlay',
    color: '#409eff',
    prompt: '请帮我制定一个...的旅行计划'
  },
  
  // 创意模板
  {
    id: 13,
    category: 'creative',
    title: '故事创作',
    description: '协助创作故事和小说',
    icon: 'Edit',
    color: '#67c23a',
    prompt: '请帮我创作一个关于...的故事'
  },
  {
    id: 14,
    category: 'creative',
    title: '诗歌写作',
    description: '创作诗歌和韵文',
    icon: 'Brush',
    color: '#e6a23c',
    prompt: '请帮我写一首关于...的诗'
  },
  {
    id: 15,
    category: 'creative',
    title: '创意点子',
    description: '提供创意和灵感',
    icon: 'MagicStick',
    color: '#f56c6c',
    prompt: '请给我一些关于...的创意点子'
  }
]

// 过滤后的模板
const filteredTemplates = computed(() => {
  return templates.filter(template => template.category === activeCategory.value)
})

// 选择模板
const selectTemplate = (template) => {
  emit('select', template.prompt)
}

// 选择自定义模板
const selectCustomTemplate = () => {
  if (customPrompt.value.trim()) {
    emit('select', customPrompt.value.trim())
    customPrompt.value = ''
  }
}
</script>

<style lang="scss" scoped>
.chat-templates {
  width: 320px;
  height: 400px;
  background-color: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .templates-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .templates-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .template-categories {
      border-bottom: 1px solid #ebeef5;

      :deep(.el-tabs__header) {
        margin: 0;
      }

      :deep(.el-tabs__nav-scroll) {
        padding: 0 16px;
      }
    }

    .template-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      .template-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #f5f7fa;
        }

        .template-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .template-content {
          flex: 1;
          min-width: 0;

          .template-title {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .template-description {
            font-size: 12px;
            color: #909399;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }

        .template-arrow {
          flex-shrink: 0;
          color: #c0c4cc;
        }
      }
    }

    .custom-template {
      padding: 16px;
      border-top: 1px solid #ebeef5;

      .el-textarea {
        margin-bottom: 12px;

        :deep(.el-textarea__inner) {
          border-radius: 6px;
        }
      }

      .el-button {
        width: 100%;
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .chat-templates {
    background-color: #2a2a2a;
    border-color: #444;

    .templates-header {
      border-color: #444;

      h3 {
        color: #fff;
      }
    }

    .template-categories {
      border-color: #444;
    }

    .template-list .template-item:hover {
      background-color: #333;
    }

    .custom-template {
      border-color: #444;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-templates {
    width: 280px;
    height: 350px;
  }
}
</style>