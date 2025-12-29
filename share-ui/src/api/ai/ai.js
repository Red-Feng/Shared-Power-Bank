import { getToken } from '@/utils/auth.js'

// 发送Ollama聊天消息
export function sendChatMessage({ prompt, chatId }) {
  // 直接连接到AI模块，绕过网关
  const baseURL = 'http://localhost:9505'
  return fetch(baseURL + '/ai/chat?prompt=' + encodeURIComponent(prompt) + '&chatId=' + (chatId || ''), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getToken() ? 'Bearer ' + getToken() : undefined
    }
  })
}

// 发送Dify聊天消息
export function sendDifyChatMessage({ prompt, conversationId, userId = 'default-user' }) {
  // 通过后端代理调用Dify API
  const baseURL = 'http://localhost:9505'
  return fetch(baseURL + '/ai/dify/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getToken() ? 'Bearer ' + getToken() : undefined
    },
    body: JSON.stringify({
      query: prompt,
      conversation_id: conversationId || '',
      user: userId,
      response_mode: 'streaming'
    })
  })
}

export function getChatHistoryIds() {
  // 直接连接到AI模块，绕过网关
  const baseURL = 'http://localhost:9505'
  return fetch(baseURL + '/ai/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getToken() ? 'Bearer ' + getToken() : undefined
    }
  })
    .then(res => res.json())
    .then(res => {
      if (res.code === 200) {
        return { data: res.data || [] }
      } else {
        throw new Error(res.msg || '获取历史记录失败')
      }
    })
}

export function getChatHistoryDetail(chatId) {
  // 直接连接到AI模块，绕过网关
  const baseURL = 'http://localhost:9505'
  return fetch(baseURL + '/ai/history/' + chatId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getToken() ? 'Bearer ' + getToken() : undefined
    }
  })
    .then(res => res.json())
    .then(res => {
      if (res.code === 200) {
        return res.data || []
      } else {
        throw new Error(res.msg || '获取历史对话详情失败')
      }
    })
}

export function deleteChatHistory(chatId) {
  // 直接连接到AI模块，绕过网关
  const baseURL = 'http://localhost:9505'
  return fetch(baseURL + '/ai/history/' + chatId, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getToken() ? 'Bearer ' + getToken() : undefined
    }
  }).then(res => res.json())
}