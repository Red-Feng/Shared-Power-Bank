"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const __default__ = {
  data() {
    return {};
  }
};

const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "service",
  setup(__props) {
    // 消息列表
    const messageList = common_vendor.ref([]);
    // 输入框内容
    const inputValue = common_vendor.ref("");
    // 是否正在发送（避免重复发送）
    const isSending = common_vendor.ref(false);
    // 滚动视图的scroll-top，用于自动滚动到底部
    const scrollTop = common_vendor.ref(0);
    // 对话ID，用于保持对话上下文
    const conversationId = common_vendor.ref("");

    // 初始化欢迎消息
    common_vendor.onMounted(() => {
      addAIMessage("您好！我是电击充电客服，有什么可以帮助您的吗？");
	   // addAIMessage("感谢您的喜欢，我是霉霉，你有什么要问我的吗？");
    });

    // 添加用户消息
    const addUserMessage = (content) => {
      messageList.value.push({
        type: "user",
        content: content,
        time: getCurrentTime()
      });
      scrollToBottom();
    };

    // 添加AI消息
    const addAIMessage = (content) => {
      messageList.value.push({
        type: "ai",
        content: content,
        time: getCurrentTime()
      });
      scrollToBottom();
    };

    // 获取当前时间（格式化）
    const getCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    // 滚动到底部
    const scrollToBottom = () => {
      setTimeout(() => {
        scrollTop.value = messageList.value.length * 1000;
      }, 100);
    };

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
      
      // 移除 <think>...</think> 标签及其内容（不区分大小写，支持多行）
      // 使用 [\s\S] 匹配包括换行符在内的所有字符
      filteredText = filteredText.replace(/<think>[\s\S]*?<\/think>/gi, "");
      
      // 移除 <think>...</think> 标签及其内容
      // 这是Dify常见的思考过程标签格式（用户反馈的问题标签）
      filteredText = filteredText.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, "");
      
      // 移除 <reasoning>...</reasoning> 标签及其内容
      filteredText = filteredText.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "");
      
      // 移除其他可能的思考过程标签格式（如 <thinking>、<thought> 等）
      filteredText = filteredText.replace(/<(?:thinking|thought|internal|reasoning)[^>]*>[\s\S]*?<\/(?:thinking|thought|internal|reasoning)>/gi, "");
      
      // 清理多余的空白字符（多个连续换行或空格）
      filteredText = filteredText.replace(/\n{3,}/g, "\n\n"); // 多个换行保留为两个
      filteredText = filteredText.replace(/[ \t]{2,}/g, " "); // 多个空格保留为一个
      
      // 去除首尾空白
      filteredText = filteredText.trim();
      
      return filteredText;
    };

    // 调用Dify AI接口（预留，用于本地对接dify）
    const callDifyAI = async (userMessage) => {
      return new Promise((resolve, reject) => {
        console.log("开始调用Dify AI，用户消息:", userMessage);
        // ========== 配置区域：请修改以下配置 ==========
        // Dify服务地址（本地部署默认端口8000）
        const DIFY_API_URL = "http://127.0.0.1/v1/chat-messages";
        // Dify API Key（请在Dify控制台获取）
        const DIFY_API_KEY = "Bearer app-KOKC4YXKvQ4ec9LGdTgM05hV"; // 请替换为你的实际API Key
        // ============================================
        
        common_vendor.index.request({
          url: DIFY_API_URL,
          method: "POST",
          header: {
            "Content-Type": "application/json",
            "Authorization": DIFY_API_KEY
          },
          data: {
            inputs: {},
            query: userMessage,
            response_mode: "blocking",
            conversation_id: conversationId.value, // 使用存储的对话ID保持上下文
            user: "wechat_mini_program_user"
          },
          success: (res) => {
            console.log("Dify AI 完整响应:", JSON.stringify(res, null, 2));
            console.log("Dify AI res.statusCode:", res.statusCode);
            console.log("Dify AI res.data:", res.data);
            
            // Dify API返回的数据结构可能是：
            // 1. res.data.answer (如果是标准格式)
            // 2. res.data (如果直接返回字符串)
            // 3. res.data.text (某些版本)
            // 4. res.data.message (某些版本)
            let aiReply = "抱歉，我暂时无法理解您的问题。";
            
            if (res.statusCode === 200 && res.data) {
              // 尝试多种可能的数据结构
              if (typeof res.data === "string") {
                aiReply = res.data;
              } else if (res.data.answer) {
                aiReply = res.data.answer;
              } else if (res.data.text) {
                aiReply = res.data.text;
              } else if (res.data.message) {
                aiReply = res.data.message;
              } else if (res.data.data && res.data.data.answer) {
                aiReply = res.data.data.answer;
              } else {
                // 如果都不匹配，尝试直接使用data（可能是JSON字符串）
                try {
                  const parsed = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
                  aiReply = parsed.answer || parsed.text || parsed.message || JSON.stringify(parsed);
                } catch (e) {
                  aiReply = "收到响应但无法解析内容";
                  console.error("解析Dify响应失败:", e);
                }
              }
            } else {
              console.warn("Dify返回状态码不是200或data为空:", res.statusCode, res.data);
              reject(new Error(`Dify API返回错误: ${res.statusCode || "无状态码"}`));
              return;
            }
            
            // 保存对话ID，用于保持对话上下文
            if (res.data && res.data.conversation_id) {
              conversationId.value = res.data.conversation_id;
              console.log("保存对话ID:", conversationId.value);
            }
            
            // ========== 原始代码（已注释，用于调试对比） ==========
            // console.log("解析后的AI回复（过滤前）:", aiReply);
            // resolve(aiReply); // 原始代码：直接返回，可能包含思考过程标签
            // ====================================================
            
            // ========== 新实现：过滤思考过程标签 ==========
            // 在返回给用户之前，过滤掉思考过程标签
            const originalReply = aiReply; // 保存原始回复，方便调试
            aiReply = filterReasoningTags(aiReply);
            
            // 调试日志：对比过滤前后的内容
            if (originalReply !== aiReply) {
              console.log("检测到思考过程标签，已过滤");
              console.log("原始回复（包含思考过程）:", originalReply);
              console.log("过滤后回复:", aiReply);
            } else {
              console.log("解析后的AI回复（无思考过程标签）:", aiReply);
            }
            
            resolve(aiReply);
            // ============================================
          },
          fail: (err) => {
            console.error("Dify AI 请求失败:", err);
            console.error("错误详情:", JSON.stringify(err, null, 2));
            reject(err);
          }
        });
      });
    };

    // 发送消息
    const sendMessage = async () => {
      const content = inputValue.value.trim();
      if (!content || isSending.value) {
        return;
      }

      // 清空输入框
      inputValue.value = "";
      
      // 添加用户消息
      addUserMessage(content);
      
      // 设置发送中状态
      isSending.value = true;

      try {
        // 调用Dify AI接口
        const aiReply = await callDifyAI(content);
        console.log("收到AI回复，准备添加到界面:", aiReply);
        addAIMessage(aiReply);
      } catch (error) {
        // 如果接口调用失败，显示错误信息
        console.error("AI接口调用失败，错误信息:", error);
        const errorMsg = error.errMsg || error.message || "网络请求失败";
        console.log("错误详情:", errorMsg);
        
        // 根据错误类型显示不同的提示
        let errorTitle = "AI服务连接失败";
        if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
          errorTitle = "API密钥错误，请检查配置";
        } else if (errorMsg.includes("404") || errorMsg.includes("Not Found")) {
          errorTitle = "API地址错误，请检查配置";
        } else if (errorMsg.includes("network") || errorMsg.includes("timeout")) {
          errorTitle = "网络连接失败，请检查Dify服务";
        }
        
        // 显示错误提示给用户
        common_vendor.index.showToast({
          title: errorTitle,
          icon: "none",
          duration: 3000
        });
        
        // 使用模拟回复（仅用于测试，生产环境建议移除）
        setTimeout(() => {
          const mockReplies = [
            "感谢您的咨询！关于充电宝使用问题，您可以在小程序首页查看附近门店，或直接扫描充电宝上的二维码进行租借。",
            "如果遇到充电宝无法归还的情况，请检查归还点是否有空位，或联系客服处理。",
            "您的订单信息可以在【我的订单】页面查看，包括使用时长、费用明细等。",
            "关于押金问题，您可以点击个人中心的【押金】进行查看和管理。"
          ];
          const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
          addAIMessage(randomReply);
        }, 500);
      } finally {
        isSending.value = false;
      }
    };

    // 输入框内容改变
    const onInputChange = (e) => {
      inputValue.value = e.detail.value;
    };

    return (_ctx, _cache) => {
      return {
        a: messageList.value,
        b: common_vendor.o(sendMessage),
        c: inputValue.value,
        d: common_vendor.o(onInputChange),
        e: isSending.value,
        f: scrollTop.value
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "C:/Users/liuyuan/Desktop/test/guli-chongdian/pages/service/service.vue"]]);
wx.createPage(MiniProgramPage);
