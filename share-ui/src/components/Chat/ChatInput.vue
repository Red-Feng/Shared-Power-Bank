<template>
  <div class="chat-input" :class="{ 'dark-theme': isDark }">
    <!-- 工具栏 -->
    <div class="input-toolbar">
      <div class="toolbar-left">
        <!-- 文件上传 -->
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept=".txt,.doc,.docx,.pdf,.jpg,.png,.gif,.mp3,.mp4"
          multiple
        >
          <el-tooltip content="上传文件" placement="top">
            <el-button type="text" icon="Paperclip" size="small"></el-button>
          </el-tooltip>
        </el-upload>
        
        <el-divider direction="vertical" />
        
        <!-- 表情选择 -->
        <el-tooltip content="表情" placement="top">
          <el-button 
            type="text" 
            icon="Star" 
            size="small" 
            @click="toggleEmojiPicker"
          />
        </el-tooltip>
        
        <!-- 语音输入 -->
        <el-tooltip content="语音输入" placement="top">
          <el-button 
            type="text" 
            :icon="isRecording ? 'VideoCameraFilled' : 'Microphone'" 
            size="small" 
            @click="toggleVoiceInput"
            :class="{ 'recording': isRecording }"
          />
        </el-tooltip>
      </div>
      
      <div class="toolbar-right">
        <!-- 字符计数 -->
        <div class="char-count">
          {{ messageLength }}/{{ maxLength }}
        </div>
        
        <!-- 发送快捷键提示 -->
        <div class="shortcut-hint">
          <span class="hint-text">Enter 发送，Shift+Enter 换行</span>
        </div>
      </div>
    </div>
    
    <!-- 文本输入框 -->
    <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="rows"
        :placeholder="placeholder"
        @keydown.enter.exact.prevent="handleSend"
        @keydown.shift.enter.exact="handleNewLine"
        @input="handleInput"
        :maxlength="maxLength"
        :disabled="disabled"
        resize="none"
        class="chat-textarea"
    />
    
    <!-- 表情选择器 -->
    <div v-if="showEmojiPicker" class="emoji-picker">
      <div class="emoji-tabs">
        <el-tabs v-model="activeEmojiTab" size="small">
          <el-tab-pane label="表情" name="emoji">
            <div class="emoji-grid">
              <span 
                v-for="emoji in emojis" 
                :key="emoji" 
                class="emoji-item"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </span>
            </div>
          </el-tab-pane>
          <el-tab-pane label="贴图" name="sticker">
            <div class="sticker-grid">
              <div 
                v-for="sticker in stickers" 
                :key="sticker.id" 
                class="sticker-item"
                @click="insertSticker(sticker)"
              >
                <img :src="sticker.url" :alt="sticker.name" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <!-- 语音录制界面 -->
    <div v-if="isRecording" class="voice-recorder">
      <div class="recording-wave">
        <div class="wave" v-for="i in 5" :key="i"></div>
      </div>
      <div class="recording-text">正在录音...</div>
      <el-button type="danger" size="small" @click="stopRecording">停止</el-button>
    </div>
    
    <!-- 附件预览 -->
    <div v-if="attachments.length" class="attachment-preview">
      <div class="attachment-list">
        <div 
          v-for="(file, index) in attachments" 
          :key="index"
          class="attachment-item"
        >
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <el-button 
            type="text" 
            icon="Close" 
            size="small" 
            @click="removeAttachment(index)"
          />
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="chat-actions">
      <el-button
          type="primary"
          @click="handleSend"
          :disabled="!canSend || disabled"
          :loading="loading"
      >
        {{ loading ? '发送中...' : '发送' }}
      </el-button>
      
      <el-button v-if="showCancel" @click="$emit('cancel')">
        取消
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: 2000
  },
  rows: {
    type: Number,
    default: 3
  },
  placeholder: {
    type: String,
    default: '请输入您的问题...（Shift+Enter 换行，Enter 发送）'
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'send', 'cancel'])

// 响应式数据
const inputMessage = ref(props.modelValue)
const showEmojiPicker = ref(false)
const activeEmojiTab = ref('emoji')
const isRecording = ref(false)
const attachments = ref([])

// 表情数据
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '😴',
  '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
  '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮',
  '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢',
  '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
  '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
  '👺', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '😾', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈',
  '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '⚡',
  '🔥', '💥', '💢', '💨', '🕳️', '💤', '💨', '💯', '💢', '🎯'
]

// 贴图数据
const stickers = [
  { id: 1, name: '猫咪', url: 'https://example.com/cat1.gif' },
  { id: 2, name: '狗狗', url: 'https://example.com/dog1.gif' },
  { id: 3, name: '熊猫', url: 'https://example.com/panda1.gif' },
  // 更多贴图...
]

// 计算属性
const messageLength = computed(() => inputMessage.value.length)
const canSend = computed(() => inputMessage.value.trim() || attachments.value.length > 0)

// 处理发送
const handleSend = () => {
  if (!canSend.value || props.loading) return
  
  const messageData = {
    content: inputMessage.value.trim(),
    attachments: attachments.value
  }
  
  emit('send', messageData)
  
  // 清空输入
  inputMessage.value = ''
  attachments.value = []
  showEmojiPicker.value = false
  
  // 同步到父组件
  emit('update:modelValue', '')
}

// 处理换行
const handleNewLine = () => {
  inputMessage.value += '\n'
  emit('update:modelValue', inputMessage.value)
}

// 处理输入
const handleInput = (value) => {
  inputMessage.value = value
  emit('update:modelValue', value)
}

// 切换表情选择器
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// 插入表情
const insertEmoji = (emoji) => {
  inputMessage.value += emoji
  emit('update:modelValue', inputMessage.value)
  showEmojiPicker.value = false
}

// 插入贴图
const insertSticker = (sticker) => {
  inputMessage.value += `[贴图:${sticker.name}]`
  emit('update:modelValue', inputMessage.value)
  showEmojiPicker.value = false
}

// 切换语音输入
const toggleVoiceInput = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 开始录音
const startRecording = () => {
  isRecording.value = true
  // 这里实现录音逻辑
  ElMessage.info('开始录音...')
}

// 停止录音
const stopRecording = () => {
  isRecording.value = false
  // 这里实现停止录音逻辑
  ElMessage.info('录音已停止')
}

// 处理文件选择
const handleFileChange = (file) => {
  if (file.size > 10 * 1024 * 1024) { // 10MB限制
    ElMessage.error('文件大小不能超过10MB')
    return
  }
  
  attachments.value.push(file.raw)
  ElMessage.success(`已添加文件: ${file.name}`)
}

// 移除附件
const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 点击外部关闭表情选择器
document.addEventListener('click', (e) => {
  if (!e.target.closest('.chat-input')) {
    showEmojiPicker.value = false
  }
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  inputMessage.value = newValue
})
</script>

<style lang="scss" scoped>
.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background-color: #ffffff;
  position: relative;
  transition: all 0.3s ease;

  &.dark-theme {
    background-color: #2a2a2a;
    border-color: #444;
  }

  .input-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-button {
        padding: 4px 8px;
        color: #606266;

        &:hover {
          color: #409eff;
          background-color: #f5f7fa;
        }

        &.recording {
          color: #f56c6c;
          animation: pulse 1.5s infinite;
        }
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .char-count {
        font-size: 12px;
        color: #909399;
      }

      .shortcut-hint {
        .hint-text {
          font-size: 11px;
          color: #c0c4cc;
        }
      }
    }
  }

  .chat-textarea {
    margin-bottom: 16px;

    :deep(.el-textarea__inner) {
      border-radius: 8px;
      transition: all 0.3s ease;

      &:focus {
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
  }

  .emoji-picker {
    position: absolute;
    bottom: 80px;
    left: 20px;
    background-color: white;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 12px;
    z-index: 1000;
    min-width: 320px;

    .emoji-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 4px;
      max-height: 200px;
      overflow-y: auto;

      .emoji-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 18px;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #f5f7fa;
        }
      }
    }

    .sticker-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;

      .sticker-item {
        cursor: pointer;
        border-radius: 4px;
        overflow: hidden;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.05);
        }

        img {
          width: 100%;
          height: 60px;
          object-fit: cover;
        }
      }
    }
  }

  .voice-recorder {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 1000;
    text-align: center;

    .recording-wave {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-bottom: 12px;

      .wave {
        width: 4px;
        height: 20px;
        background-color: #f56c6c;
        border-radius: 2px;
        animation: wave 0.5s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.1s; }
        &:nth-child(3) { animation-delay: 0.2s; }
        &:nth-child(4) { animation-delay: 0.3s; }
        &:nth-child(5) { animation-delay: 0.4s; }
      }
    }

    .recording-text {
      margin-bottom: 12px;
      color: #606266;
    }
  }

  .attachment-preview {
    margin-bottom: 12px;
    padding: 8px;
    background-color: #f5f7fa;
    border-radius: 6px;

    .attachment-list {
      .attachment-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        font-size: 12px;

        .file-name {
          flex: 1;
          color: #606266;
        }

        .file-size {
          color: #909399;
        }
      }
    }
  }

  .chat-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes wave {
  0%, 100% { height: 20px; }
  50% { height: 10px; }
}

// 深色主题
.dark-theme {
  .char-count {
    color: #999 !important;
  }

  .emoji-picker {
    background-color: #333;
    border-color: #555;
  }

  .voice-recorder {
    background-color: #333;
    border-color: #555;

    .recording-text {
      color: #e0e0e0;
    }
  }

  .attachment-preview {
    background-color: #444;

    .attachment-item {
      .file-name {
        color: #e0e0e0;
      }

      .file-size {
        color: #999;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-input {
    padding: 16px;

    .emoji-picker {
      left: 16px;
      right: 16px;
      min-width: auto;

      .emoji-grid {
        grid-template-columns: repeat(6, 1fr);
      }
    }
  }
}
</style>