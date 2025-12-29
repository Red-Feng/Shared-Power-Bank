import { defineStore } from 'pinia'
import { sendMessage, getChatHistory, clearChatHistory, exportChatHistory } from '@/api/ai/ai'

const useChatStore = defineStore('chat', {
  state: () => ({
    // 当前会话消息
    messages: [],
    // 会话列表
    sessions: [],
    // 当前会话ID
    currentSessionId: null,
    // 发送状态
    isSending: false,
    // AI输入状态
    isTyping: false,
    // 主题模式
    theme: 'light',
    // AI模型
    currentModel: 'gpt-3.5-turbo',
    // 可用模型列表
    availableModels: []
  }),

  getters: {
    // 获取最后一条消息
    lastMessage: (state) => {
      return state.messages[state.messages.length - 1]
    },
    
    // 获取未读消息数量
    unreadCount: (state) => {
      return state.messages.filter(msg => msg.role === 'ai' && !msg.read).length
    },
    
    // 检查是否为空会话
    isEmptySession: (state) => {
      return state.messages.length <= 1
    }
  },

  actions: {
    // 初始化会话
    initSession() {
      this.messages = [{
        role: 'ai',
        content: '您好！我是AI智能助手，有什么我可以帮您的吗？',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        id: Date.now()
      }]
      this.currentSessionId = Date.now().toString()
    },

    // 发送消息
    async sendMessage(content) {
      if (!content.trim() || this.isSending) return

      const userMessage = {
        role: 'user',
        content: content.trim(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        id: Date.now()
      }

      this.messages.push(userMessage)
      this.isSending = true
      this.isTyping = true

      try {
        // 调用API
        const response = await sendMessage({
          modelId: 1, // 默认使用模型ID为1，后续可以从模型列表获取
          sessionId: this.currentSessionId,
          messages: [
            {
              role: 'user',
              content: content
            }
          ],
          stream: false
        })

        // 处理响应数据，从R.data.choices中获取content
        let aiResponseContent = this.getSimulatedResponse(content); // 默认使用模拟响应
        
        // R封装的响应结构是: response.data -> ChatResponse
        // ChatResponse结构是: choices[0].message.content
        if (response.data && response.data.data && response.data.data.choices && response.data.data.choices.length > 0) {
          const choice = response.data.data.choices[0];
          if (choice.message && choice.message.content) {
            aiResponseContent = choice.message.content;
          }
        }
        
        const aiMessage = {
          role: 'ai',
          content: aiResponseContent,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          id: Date.now(),
          read: false
        }

        this.messages.push(aiMessage)
        return aiMessage
      } catch (error) {
        console.error('发送消息失败:', error)
        
        const errorMessage = {
          role: 'ai',
          content: '抱歉，我遇到了一些问题，请稍后再试。',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          id: Date.now(),
          error: true
        }

        this.messages.push(errorMessage)
        throw error
      } finally {
        this.isSending = false
        this.isTyping = false
      }
    },

    // 模拟AI回复（当API不可用时）
    getSimulatedResponse(userInput) {
      const responses = [
        `我理解您说的"${userInput}"。这是一个很好的问题！`,
        `关于"${userInput}"，我可以为您提供详细的解答。`,
        `感谢您的提问"${userInput}"，让我来帮助您。`,
        `针对"${userInput}"这个问题，我的建议是...`,
        `这是一个很有趣的问题"${userInput}"，我认为...`,
        `根据我的知识库，关于"${userInput}"的信息如下：`
      ]

      // 简单的关键词匹配
      if (userInput.includes('你好') || userInput.includes('您好')) {
        return '您好！很高兴为您服务。有什么我可以帮助您的吗？'
      } else if (userInput.includes('天气')) {
        return '我无法获取实时天气信息，建议您查看天气预报应用或网站。'
      } else if (userInput.includes('时间')) {
        return `现在是${new Date().toLocaleString('zh-CN')}`
      } else if (userInput.includes('帮助')) {
        return '我可以帮助您解答问题、提供建议、进行对话等。请告诉我您需要什么帮助！'
      } else {
        return responses[Math.floor(Math.random() * responses.length)]
      }
    },

    // 清空聊天记录
    async clearChat() {
      try {
        if (this.currentSessionId) {
          await clearChatHistory()
        }
        this.initSession()
      } catch (error) {
        console.error('清空聊天记录失败:', error)
        // 本地清空
        this.initSession()
      }
    },

    // 加载聊天历史
    async loadChatHistory(sessionId) {
      try {
        const response = await getChatHistory({ sessionId })
        this.messages = response.data.messages || []
        this.currentSessionId = sessionId
      } catch (error) {
        console.error('加载聊天历史失败:', error)
      }
    },

    // 导出聊天记录
    async exportChat() {
      try {
        const response = await exportChatHistory({ 
          sessionId: this.currentSessionId 
        })
        
        // 创建下载链接
        const blob = new Blob([response.data], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.txt`
        a.click()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('导出聊天记录失败:', error)
      }
    },

    // 复制消息
    copyMessage(message) {
      navigator.clipboard.writeText(message.content).then(() => {
        // 可以添加成功提示
      }).catch(error => {
        console.error('复制失败:', error)
      })
    },

    // 标记消息为已读
    markAsRead(messageId) {
      const message = this.messages.find(msg => msg.id === messageId)
      if (message) {
        message.read = true
      }
    },

    // 删除消息
    deleteMessage(messageId) {
      const index = this.messages.findIndex(msg => msg.id === messageId)
      if (index > -1) {
        this.messages.splice(index, 1)
      }
    },

    // 重新生成AI回复
    async regenerateResponse(userMessageIndex) {
      if (userMessageIndex < 0 || userMessageIndex >= this.messages.length) return
      
      const userMessage = this.messages[userMessageIndex]
      if (userMessage.role !== 'user') return

      // 删除该用户消息之后的所有消息
      this.messages = this.messages.slice(0, userMessageIndex)
      
      // 重新发送消息
      await this.sendMessage(userMessage.content)
    },

    // 设置主题
    setTheme(theme) {
      this.theme = theme
      localStorage.setItem('chat-theme', theme)
    },

    // 设置AI模型
    setCurrentModel(model) {
      this.currentModel = model
      localStorage.setItem('chat-model', model)
    }
  }
})

export default useChatStore