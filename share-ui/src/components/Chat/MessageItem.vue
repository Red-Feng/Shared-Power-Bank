<template>
  <div 
    :class="['message-item', `message-${message.role}`, { 'message-error': message.error }]"
  >
    <!-- 头像 -->
    <div class="message-avatar">
      <el-avatar 
        :icon="avatarIcon" 
        :size="avatarSize"
        :style="{ backgroundColor: avatarColor }"
      />
    </div>
    
    <!-- 消息内容 -->
    <div class="message-wrapper">
      <div class="message-content">
        <!-- 消息文本 -->
        <div class="message-text" v-html="formattedContent"></div>
        
        <!-- 附件显示 -->
        <div v-if="message.attachments && message.attachments.length" class="message-attachments">
          <div 
            v-for="(attachment, index) in message.attachments" 
            :key="index"
            class="attachment-item"
          >
            <el-icon><Paperclip /></el-icon>
            <span>{{ attachment.name }}</span>
            <el-button type="text" size="small" @click="downloadAttachment(attachment)">
              下载
            </el-button>
          </div>
        </div>
        
        <!-- 消息操作 -->
        <div class="message-actions" v-if="showActions">
          <el-tooltip content="复制" placement="top">
            <el-button 
              type="text" 
              size="small" 
              icon="CopyDocument" 
              @click="handleCopy"
            />
          </el-tooltip>
          
          <el-tooltip content="重新生成" placement="top" v-if="canRegenerate">
            <el-button 
              type="text" 
              size="small" 
              icon="Refresh" 
              @click="$emit('regenerate', messageIndex)"
              :loading="isRegenerating"
            />
          </el-tooltip>
          
          <el-tooltip content="删除" placement="top" v-if="canDelete">
            <el-button 
              type="text" 
              size="small" 
              icon="Delete" 
              @click="handleDelete"
            />
          </el-tooltip>
        </div>
        
        <!-- 状态指示 -->
        <div class="message-status">
          <span class="message-time">{{ message.time }}</span>
          <el-tag v-if="message.error" type="danger" size="small">发送失败</el-tag>
          <el-tag v-else-if="message.sending" type="info" size="small">发送中...</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Refresh, Delete, Paperclip } from '@element-plus/icons-vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  messageIndex: {
    type: Number,
    default: 0
  },
  showActions: {
    type: Boolean,
    default: true
  },
  isRegenerating: {
    type: Boolean,
    default: false
  },
  canRegenerate: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  avatarSize: {
    type: Number,
    default: 36
  }
})

const emit = defineEmits(['copy', 'regenerate', 'delete'])

// 头像图标
const avatarIcon = computed(() => {
  return props.message.role === 'user' ? 'User' : 'Operation'
})

// 头像颜色
const avatarColor = computed(() => {
  return props.message.role === 'user' ? '#409eff' : '#67c23a'
})

// 格式化消息内容
const formattedContent = computed(() => {
  let content = props.message.content
  
  // Markdown 格式化
  content = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 粗体
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体
    .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>') // 代码块
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>') // 行内代码
    .replace(/^### (.*$)/gim, '<h3>$1</h3>') // H3
    .replace(/^## (.*$)/gim, '<h2>$1</h2>') // H2
    .replace(/^# (.*$)/gim, '<h1>$1</h1>') // H1
    .replace(/\n/g, '<br>') // 换行
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>') // 链接
  
  return content
})

// 复制消息
const handleCopy = () => {
  try {
    const textContent = props.message.content.replace(/<[^>]*>/g, '')
    navigator.clipboard.writeText(textContent)
    ElMessage.success('已复制到剪贴板')
    emit('copy', props.message)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 删除消息
const handleDelete = () => {
  emit('delete', props.messageIndex)
}

// 下载附件
const downloadAttachment = (attachment) => {
  // 这里实现附件下载逻辑
  const link = document.createElement('a')
  link.href = attachment.url
  link.download = attachment.name
  link.click()
}
</script>

<style lang="scss" scoped>
.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
  animation: fadeIn 0.3s ease;

  &.message-user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .message-wrapper {
      text-align: right;
    }

    .message-content {
      background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
      color: white;
      border: none;

      .message-text {
        color: white;
      }

      .message-actions {
        justify-content: flex-end;
      }

      .message-time {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  &.message-ai {
    align-self: flex-start;

    .message-content {
      background-color: #ffffff;
      border: 1px solid #ebeef5;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  }

  &.message-error {
    .message-content {
      border-color: #f56c6c;
      background-color: #fef0f0;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
}

.message-wrapper {
  flex: 1;
}

.message-content {
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
  transition: all 0.2s ease;

  .message-text {
    font-size: 14px;
    line-height: 1.6;
    color: #606266;
    white-space: pre-wrap;
    word-break: break-word;

    :deep(.code-block) {
      background-color: #f5f7fa;
      border-radius: 4px;
      padding: 12px;
      margin: 8px 0;
      overflow-x: auto;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      line-height: 1.4;
    }

    :deep(.inline-code) {
      background-color: #f5f7fa;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
    }

    :deep(h1), :deep(h2), :deep(h3) {
      margin: 8px 0 4px 0;
      color: #303133;
    }

    :deep(a) {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .message-attachments {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);

    .attachment-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;

      .el-icon {
        color: #909399;
      }

      span {
        flex: 1;
        color: #606266;
      }
    }
  }

  .message-actions {
    margin-top: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;

    .el-button {
      padding: 2px 6px;
      height: auto;
      min-height: auto;
      font-size: 12px;
      color: #909399;
      border: none;
      background: none;

      &:hover {
        color: #409eff;
        background-color: rgba(64, 158, 255, 0.1);
      }
    }
  }

  .message-status {
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .message-time {
    color: #909399;
  }

  &:hover .message-actions {
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 深色主题适配
.message-item.message-ai .message-content {
  .message-text {
    color: #e0e0e0;

    :deep(.code-block) {
      background-color: #444;
      color: #f8f8f2;
    }

    :deep(.inline-code) {
      background-color: #444;
      color: #f8f8f2;
    }

    :deep(h1), :deep(h2), :deep(h3) {
      color: #fff;
    }

    :deep(a) {
      color: #66b3ff;
    }
  }

  .message-attachments .attachment-item {
    span {
      color: #e0e0e0;
    }
  }

  .message-actions .el-button {
    color: #666;

    &:hover {
      color: #409eff;
      background-color: #333;
    }
  }

  .message-time {
    color: #999;
  }
}
</style>