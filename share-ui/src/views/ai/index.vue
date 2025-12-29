<template>
  <div class="chat-layout">
    <div class="history-panel">
      <button class="add-chat-btn" @click="addChat">+ 新增对话</button>
      <!-- AI类型选择 -->
      <div class="ai-type-selector">
        <div class="history-title">AI类型</div>
        <el-radio-group v-model="aiType" size="small" @change="onAiTypeChange">
          <el-radio label="ollama">Ollama</el-radio>
          <el-radio label="dify">Dify</el-radio>
        </el-radio-group>
      </div>
      <!-- 这里放历史记录内容 -->
      <div class="history-title">历史记录</div>
      <!-- 可用 v-for 渲染历史会话列表 -->
      <ul class="history-list">
        <li
          v-for="item in historyList"
          :key="item.id"
          class="history-item"
          :class="{ active: item.id === currentChatId }"
          @click="selectChat(item)"
          style="display: flex; align-items: center; justify-content: space-between;"
        >
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ item.name }}</span>
          <span v-if="item.id !== null" @click.stop="handleDelete(item.id)" style="margin-left:8px;cursor:pointer;display:flex;align-items:center;">
            <svg width="14" height="14" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M320 896c0 35.2 28.8 64 64 64h256c35.2 0 64-28.8 64-64V320H320v576zm576-704h-192l-32-64H352l-32 64H128v64h768v-64z" fill="#f56c6c"/>
            </svg>
          </span>
        </li>
      </ul>
    </div>
    <div class="ai-chat-simple" :class="{ 'dark': isDark }">
      <!-- 原有聊天内容不变 -->
      <div class="chat-main">
        <div class="messages" ref="messagesRef">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', message.role]"
          >
            <span class="role">
              <template v-if="message.role === 'user'"></template>
              <template v-else>
                <img src="../../assets/logo/logo.png" alt="AI Logo" class="ai-logo" />
              </template>
            </span>
            <span class="content" v-if="message.role === 'user'">{{ message.content }}</span>
            <span class="content" v-else v-html="renderMarkdown(message.content)"></span>
          </div>
        </div>
        <div class="input-area">
          <textarea
            v-model="userInput"
            @keydown="handleKeydown"
            placeholder="请输入您的问题..."
            rows="1"
            ref="inputRef"
          ></textarea>
          <button class="send-button" @click="sendMessage" :disabled="isStreaming || !userInput.trim()">
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'
import { sendChatMessage, sendDifyChatMessage, getChatHistoryIds, getChatHistoryDetail, deleteChatHistory } from '@/api/ai/ai'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置 marked 使用 highlight.js
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})

const route = useRoute()
const isDark = useDark()
const messagesRef = ref(null)
const inputRef = ref(null)
const userInput = ref('')
const isStreaming = ref(false)
const messages = ref([])
const currentChatId = ref(null) // 新对话时为null
const isNewChat = ref(true) // 标识是否为新对话
// 根据路由名称设置默认AI类型：DifyRag路由默认使用dify，其他路由默认使用ollama
const aiType = ref(route.name === 'DifyRag' ? 'dify' : 'ollama') // AI类型：ollama 或 dify
const difyConversationId = ref(null) // Dify会话ID
const difyUserId = ref('user-' + Date.now()) // Dify用户ID

const historyList = ref([])

// 数据转换函数：将 {query, answer} 格式转换为 {role, content} 格式
const transformHistoryData = (historyData) => {
  const transformedMessages = []
  historyData.forEach(item => {
    // 添加用户消息
    if (item.query) {
      transformedMessages.push({
        role: 'user',
        content: item.query
      })
    }
    // 添加AI回复消息
    if (item.answer !== undefined) {
      transformedMessages.push({
        role: 'assistant',
        content: item.answer
      })
    }
  })
  return transformedMessages
}

onMounted(async () => {
  const response = await getChatHistoryIds()
  if (response.data.length === 0) {
    // 没有历史记录，创建新对话
    historyList.value = [{ id: null, name: '新会话' }]
    currentChatId.value = null
    isNewChat.value = true
  } else {
    // 有历史记录，默认选择第一个历史对话
    historyList.value = response.data
    currentChatId.value = response.data[0].id
    isNewChat.value = false
    // 自动加载第一个会话内容
    const detail = await getChatHistoryDetail(response.data[0].id)
    messages.value = transformHistoryData(detail)
  }
})

// 新增对话
const addChat = () => {
  // 新对话不生成任何ID，直接设为null
  currentChatId.value = null
  difyConversationId.value = null
  isNewChat.value = true
  historyList.value.unshift({ id: null, name: '新会话' })
  messages.value = []
}

// 切换对话
const selectChat = async (item) => {
  currentChatId.value = item.id
  isNewChat.value = item.id === null
  messages.value = []
  // 只有历史会话才加载内容
  if (item.id !== null) {
    const detail = await getChatHistoryDetail(item.id)
    // 将 {query, answer} 格式转换为 {role, content} 格式
    messages.value = transformHistoryData(detail)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// AI类型切换
const onAiTypeChange = () => {
  // 切换AI类型时，清空当前会话
  messages.value = []
  difyConversationId.value = null
  currentChatId.value = null
  isNewChat.value = true
}

const sendMessage = async () => {
  if (isStreaming.value) return
  if (!userInput.value.trim()) return
  const prompt = userInput.value.trim()
  messages.value.push({ role: 'user', content: prompt })
  userInput.value = ''
  await scrollToBottom()
  const aiMsg = { role: 'assistant', content: '思考中...' }
  messages.value.push(aiMsg)
  isStreaming.value = true
  
  try {
    if (aiType.value === 'dify') {
      // 使用Dify
      await sendDifyMessage(prompt)
    } else {
      // 使用Ollama
      await sendOllamaMessage(prompt)
    }
  } catch (e) {
    console.error('发送消息失败:', e)
    aiMsg.content = '抱歉，发生了错误，请稍后重试。'
  } finally {
    isStreaming.value = false
    await scrollToBottom()
    refreshHistoryList()
  }
}

// 发送Ollama消息
const sendOllamaMessage = async (prompt) => {
  const chatId = isNewChat.value ? null : currentChatId.value
  const response = await sendChatMessage({ prompt, chatId })
  if (!response.body) throw new Error('无流式响应')
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let accumulated = ''
  let chatIdReceived = false

  while (true) {
    try {
      const { value, done } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (line.trim() === '') continue
        
        if (line.startsWith('event:')) {
          const eventType = line.substring(6).trim()
          if (eventType === 'chat-id') {
            chatIdReceived = true
            continue
          }
        } else if (line.startsWith('data:')) {
          const data = line.substring(5).trim()
          
          if (chatIdReceived && data.startsWith('chat_')) {
            const newChatId = data
            if (isNewChat.value && newChatId) {
              currentChatId.value = newChatId
              const newChatItem = historyList.value.find(item => item.id === null)
              if (newChatItem) {
                newChatItem.id = newChatId
              }
            }
            chatIdReceived = false
            continue
          }
          
          if (data && !data.startsWith('chat_')) {
            accumulated += data
            await nextTick(() => {
              const updatedMessage = {
                role: 'assistant',
                content: accumulated || '思考中...'
              }
              const lastIndex = messages.value.length - 1
              if (lastIndex >= 0) {
                messages.value.splice(lastIndex, 1, updatedMessage)
              }
            })
            await scrollToBottom()
          }
        } else if (line.trim() !== '') {
          accumulated += line
          await nextTick(() => {
            const updatedMessage = {
              role: 'assistant',
              content: accumulated || '思考中...'
            }
            const lastIndex = messages.value.length - 1
            if (lastIndex >= 0) {
              messages.value.splice(lastIndex, 1, updatedMessage)
            }
          })
          await scrollToBottom()
        }
      }
    } catch (readError) {
      console.error('读取流错误:', readError)
      break
    }
  }
  
  if (buffer.trim()) {
    accumulated += buffer
    await nextTick(() => {
      const updatedMessage = {
        role: 'assistant',
        content: accumulated || '思考中...'
      }
      const lastIndex = messages.value.length - 1
      if (lastIndex >= 0) {
        messages.value.splice(lastIndex, 1, updatedMessage)
      }
    })
  }
}

/**
 * 过滤AI回复中的思考过程标签
 * 用于移除Dify返回的answer中包含的<think>、<reasoning>等标签及其内容
 * @param {string} text - 原始AI回复文本
 * @returns {string} - 过滤后的纯文本回复
 */
const filterReasoningTags = (text) => {
  if (!text || typeof text !== "string") {
    return text;
  }
  
  let filteredText = text;
  
  // 移除 <think>...</think> 标签及其内容(不区分大小写,支持多行)
  // 使用 [\s\S] 匹配包括换行符在内的所有字符
  filteredText = filteredText.replace(/<think>[\s\S]*?<\/think>/gi, "");
  
  // 移除 <think>...</think> 标签及其内容
  // 这是Dify常见的思考过程标签格式(用户反馈的问题标签)
  filteredText = filteredText.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, "");
  
  // 移除 <reasoning>...</reasoning> 标签及其内容
  filteredText = filteredText.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "");
  
  // 移除其他可能的思考过程标签格式(如<thinking>、<thought>等)
  filteredText = filteredText.replace(/<(?:thinking|thought|internal)[^>]*>[\s\S]*?<\/(?:thinking|thought|internal)>/gi, "");
  
  // 清理多余的空白字符(多个连续换行或空格)
  filteredText = filteredText.replace(/\n{3,}/g, "\n\n"); //多个换行保留为两个
  filteredText = filteredText.replace(/[ \t]{2,}/g, " "); // 多个空格保留为一个
  
  // 去除首尾空白
  filteredText = filteredText.trim();
  
  return filteredText;
}

// 发送Dify消息
const sendDifyMessage = async (prompt) => {
  const response = await sendDifyChatMessage({
    prompt,
    conversationId: difyConversationId.value,
    userId: difyUserId.value
  })
  
  if (!response.body) throw new Error('无流式响应')
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let accumulated = ''

  while (true) {
    try {
      const { value, done } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      // 处理SSE格式的数据（每行一个data:）
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后不完整的行
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine === '') continue
        
        // Dify格式: data: {"event": "message", "answer": "chunk", ...}
        if (trimmedLine.startsWith('data:')) {
          // 去掉 "data: " 前缀（注意可能有空格）
          let jsonStr = trimmedLine.substring(5).trim()
          
          // 如果还有 "data: " 前缀（可能是后端重复添加了），继续去掉
          while (jsonStr.startsWith('data:')) {
            jsonStr = jsonStr.substring(5).trim()
          }
          
          if (!jsonStr) continue
          
          try {
            const data = JSON.parse(jsonStr)
            
            // 处理message事件
            if (data.event === 'message' && data.answer) {
              accumulated += data.answer
              
              // 更新conversation_id
              if (data.conversation_id && !difyConversationId.value) {
                difyConversationId.value = data.conversation_id
              }
              
              await nextTick(() => {
                // 过滤思考过程标签
                const filteredContent = filterReasoningTags(accumulated)
                const updatedMessage = {
                  role: 'assistant',
                  content: filteredContent || '思考中...'
                }
                const lastIndex = messages.value.length - 1
                if (lastIndex >= 0) {
                  messages.value.splice(lastIndex, 1, updatedMessage)
                }
              })
              await scrollToBottom()
            }
            
            // 处理message_end事件
            if (data.event === 'message_end') {
              if (data.conversation_id) {
                difyConversationId.value = data.conversation_id
              }
              // 流式结束，退出循环
              return
            }
            
            // 处理error事件
            if (data.event === 'error') {
              const errorMsg = data.message || 'Dify API错误'
              console.error('Dify API错误:', errorMsg)
              // 显示错误信息给用户
              await nextTick(() => {
                const updatedMessage = {
                  role: 'assistant',
                  content: `❌ 错误: ${errorMsg}\n\n请检查：\n1. Dify API Key 是否正确配置\n2. Dify 服务是否正常运行\n3. 网络连接是否正常`
                }
                const lastIndex = messages.value.length - 1
                if (lastIndex >= 0) {
                  messages.value.splice(lastIndex, 1, updatedMessage)
                }
              })
              return
            }
            
            // 忽略其他事件（workflow_started, node_started等）
          } catch (parseError) {
            // JSON解析失败，记录详细信息用于调试
            console.error('解析Dify响应失败:', {
              error: parseError.message,
              rawLine: trimmedLine.substring(0, 200),
              extractedJson: jsonStr ? jsonStr.substring(0, 200) : 'empty'
            })
            
            // 如果是错误消息，尝试手动提取
            if (trimmedLine.includes('"event":"error"')) {
              try {
                // 尝试找到JSON部分
                const jsonMatch = trimmedLine.match(/\{.*\}/)
                if (jsonMatch) {
                  const errorData = JSON.parse(jsonMatch[0])
                  if (errorData.event === 'error') {
                    await nextTick(() => {
                      const updatedMessage = {
                        role: 'assistant',
                        content: `❌ 错误: ${errorData.message || '未知错误'}\n\n请检查：\n1. Dify API Key 是否正确配置\n2. Dify 服务是否正常运行\n3. 网络连接是否正常`
                      }
                      const lastIndex = messages.value.length - 1
                      if (lastIndex >= 0) {
                        messages.value.splice(lastIndex, 1, updatedMessage)
                      }
                    })
                    return
                  }
                }
              } catch (e) {
                // 如果还是解析失败，显示原始错误
                console.error('无法解析错误消息:', e)
              }
            }
          }
        }
      }
    } catch (readError) {
      console.error('读取Dify流错误:', readError)
      break
    }
  }
  
  // 处理剩余数据
  if (buffer.trim()) {
    const line = buffer.trim()
    if (line.startsWith('data:')) {
      const jsonStr = line.substring(5).trim()
      if (jsonStr) {
        try {
          const data = JSON.parse(jsonStr)
          if (data.event === 'message' && data.answer) {
            accumulated += data.answer
            await nextTick(() => {
              // 过滤思考过程标签
              const filteredContent = filterReasoningTags(accumulated)
              const updatedMessage = {
                role: 'assistant',
                content: filteredContent || '思考中...'
              }
              const lastIndex = messages.value.length - 1
              if (lastIndex >= 0) {
                messages.value.splice(lastIndex, 1, updatedMessage)
              }
            })
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

// 处理输入框回车和换行
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
  // Shift+Enter 默认行为为换行，无需处理
}

// 渲染markdown为html
const renderMarkdown = (text) => {
  return marked.parse(text || '')
}

// 刷新历史列表
const refreshHistoryList = async () => {
  try {
    const response = await getChatHistoryIds()
    console.log('刷新历史列表响应:', response)
    
    if (response.data && response.data.length > 0) {
      // 更新历史列表
      historyList.value = response.data
      
      // 如果是新对话，尝试匹配最新的历史记录
      if (isNewChat.value && messages.value.length > 0) {
        // 找到第一个用户消息作为对话名称
        const firstUserMessage = messages.value.find(msg => msg.role === 'user')
        if (firstUserMessage) {
          // 尝试通过消息内容匹配找到对应的历史记录
          // 查找名称包含第一个用户消息的历史记录
          const matchingItem = response.data.find(item => 
            item.name && item.name.includes(firstUserMessage.content.substring(0, 10))
          )
          
          if (matchingItem) {
            // 找到匹配的历史记录，更新当前对话ID
            currentChatId.value = matchingItem.id
            isNewChat.value = false
            console.log('通过消息内容匹配到历史记录:', matchingItem)
          } else {
            // 如果没有找到匹配的，可能是最新的记录
            // 检查是否有新的记录（通过时间戳或其他标识）
            const latestItem = response.data[0] // 假设最新的记录在第一位
            if (latestItem && !latestItem.name.includes('新会话')) {
              // 如果最新的记录不是"新会话"，可能是我们刚创建的
              currentChatId.value = latestItem.id
              isNewChat.value = false
              console.log('使用最新的历史记录:', latestItem)
            }
          }
          
          // 更新对话名称
          const currentHistoryItem = historyList.value.find(item => item.id === currentChatId.value)
          if (currentHistoryItem) {
            currentHistoryItem.name = firstUserMessage.content.length > 20 
              ? firstUserMessage.content.substring(0, 20) + '...' 
              : firstUserMessage.content
          }
        }
      }
      
      // 如果不是新对话，调用当前对话的历史详情接口更新消息记录
      if (!isNewChat.value && currentChatId.value) {
        try {
          const detail = await getChatHistoryDetail(currentChatId.value)
          // 将历史数据转换为消息格式并更新到当前messages
          const updatedMessages = transformHistoryData(detail)
          messages.value = updatedMessages
        } catch (detailError) {
          console.error('获取当前对话历史详情失败:', detailError)
        }
      }
    }
  } catch (error) {
    console.error('刷新历史列表失败:', error)
  }
}

// 删除时刷新逻辑
const handleDelete = async (chatId) => {
  await deleteChatHistory(chatId)
  // 重新获取历史会话id
  const response = await getChatHistoryIds()
  if (response.data.length === 0) {
    // 没有历史会话，创建新对话
    historyList.value = [{ id: null, name: '新会话' }]
    currentChatId.value = null
    isNewChat.value = true
    messages.value = []
  } else {
    historyList.value = response.data
    // 如果当前删除的是选中的会话，则切到第一个
    if (currentChatId.value === chatId) {
      currentChatId.value = historyList.value[0].id
      isNewChat.value = false
      messages.value = []
    }
  }
}
</script>

<style scoped>
.chat-layout {
  display: flex;
  /* width: 100vw; */
  height:calc( 100vh - 85px);
  background: var(--bg-color, #f5f6fa);
}

.history-panel {
  width: 200px;
  background: #f7f7fa;
  border-right: 1px solid #e0e0e0;
  padding: 2rem 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.add-chat-btn {
  width: 100%;
  padding: 0.75em 0;
  margin-bottom: 1em;
  background: #007cf0;
  color: #fff;
  border: none;
  border-radius: 0.5em;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.add-chat-btn:hover {
  background: #005fa3;
}
.history-item.active {
  background: #e6f0fd;
  font-weight: bold;
}

.history-title {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 1.5rem;
}

.ai-type-selector {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.ai-type-selector .history-title {
  margin-bottom: 0.75rem;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.history-item {
  padding: 0.75em 0.5em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: background 0.2s;
}
.history-item:hover {
  background: #e6f0fd;
}
.ai-chat-simple {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background: var(--bg-color, #f5f6fa);
  box-sizing: border-box;
  padding: 30px;
  font-size: 1.05rem;
}
.chat-main {
  width: 100%;
  /* max-width: 1110px; */
  min-width:800px;
  margin: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 90vh; /* 放大高度 */
  min-height: 605px;
  overflow: hidden;
  border-radius:8px;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1rem; /* 放大内边距 */
  box-sizing: border-box;
}
.message {
  width: 100%;
  display: flex;
  margin-bottom: 1rem; /* 放大间距 */
}
.message.user {
  justify-content: flex-end;
}
.message .content {
  padding-top:5px;
}
.message.user .content {
  background: #e6f0fd;
  color: #222;
  border-radius: 1.0em 0.2em 1.0em 1.25em; /* 放大圆角 */
  padding: 0.50em 1.2em; /* 放大气泡内边距 */
  max-width: 90%; /* 放大最大宽度 */
  word-break: break-all;
  display: inline-block;
  text-align: left;
  margin-left: 3rem;
  margin-right: 0;
  font-size: 16px;
}
.message.user .role {
  color: #007CF0;
  font-weight: bold;
  margin-left: 0.5em;
  margin-right: 0;
}
.message.assistant {
  justify-content: flex-start;
}
.message.assistant .content {
  color: #222;
  border-radius: 0.2em 1.25em 1.25em 1.25em; /* 放大圆角 */
  padding: 0.50em 1.2em; /* 放大气泡内边距 */
  max-width: 90%; /* 放大最大宽度 */
  word-break: break-all;
  display: inline-block;
  text-align: left;
  margin-right: 3rem;
  margin-left: 0;
  font-size: 16px;
}
.message.assistant .role {
  color: #ff9800;
  font-weight: bold;
  margin-right: 0.5em;
}
.input-area {
  display: flex;
  gap: 0.5rem; /* 放大间距 */
  align-items: flex-end;
  background: #fafbfc;
  padding: 1.5rem 2rem; /* 放大内边距 */
  border-top: 1px solid #eee;
}
textarea {
  flex: 1;
  resize: none;
  border: none;
  background: transparent;
  padding: 1rem;
  font-size: 16px; /* 放大输入字体 */
  line-height: 24px;
  max-height: 180px;
  border-radius: 0.75rem;
  outline: none;
  min-height: 1.5rem; /* 输入框更高 */
}
.send-button {
  min-width: 80px;
  height: 3rem;
  border: none;
  border-radius: 0.75rem;
  background: #007CF0;
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.dark .chat-main {
  /* background: #222; */
  color: #333;
  font-size:16px;
  line-height:26px;
}
/* .dark .input-area 样式已合并到上方 */
.dark textarea {
  background: #f3f3f3;
  color: #000;
}
.dark textarea::placeholder{
  color:#ccc;
}
.ai-logo {
  width: 32px;
  height: 32px;
  vertical-align: middle;
  margin-right: 0.5em;
  border-radius: 8px;
  background: #fff;
}
.content p {
font-size:16px;
}
.content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}
.content th,
.content td {
  border: 1px solid #d0d7de;
  padding: 8px 12px;
  text-align: left;
}
.content th {
  background: #f6f8fa;
  font-weight: bold;
}
.preview-area {
  background: #f6f8fa;
  border-top: 1px solid #e0e0e0;
  padding: 1.2em 2em 1.2em 2em;
  margin: 0;
}
.preview-title {
  font-weight: bold;
  margin-bottom: 0.5em;
  color: #007cf0;
}
.preview-content {
  font-size: 1em;
}
</style>
<style>
@import '../../../node_modules/highlight.js/styles/github.css';
.preview-content pre {
  background: #f6f8fa;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}
.preview-content code {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
  font-size: 1em;
}
</style>