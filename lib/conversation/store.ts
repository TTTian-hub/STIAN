// 对话历史存储管理 - 仅在客户端使用
import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feature?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  feature: string;
  context?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

interface ConversationStore {
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;

  createConversation: (feature: string, title: string, context?: Record<string, unknown>) => string;
  addMessage: (conversationId: string, role: 'user' | 'assistant', content: string) => void;
  getConversation: (conversationId: string) => Conversation | undefined;
  getCurrentConversation: () => Conversation | undefined;
  setCurrentConversation: (id: string | null) => void;
  clearConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  updateContext: (conversationId: string, context: Record<string, unknown>) => void;
  getMessagesForAPI: (conversationId: string, maxMessages?: number) => Array<{ role: string; content: string }>;
}

// 简单的内存存储，不持久化到 localStorage 以避免 hydration 问题
export const useConversationStore = create<ConversationStore>()(
  (set, get) => ({
    conversations: {},
    currentConversationId: null,

    createConversation: (feature, title, context) => {
      const id = `${feature}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const conversation: Conversation = {
        id,
        title,
        messages: [],
        feature,
        context,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set((state) => ({
        conversations: { ...state.conversations, [id]: conversation },
        currentConversationId: id,
      }));

      return id;
    },

    addMessage: (conversationId, role, content) => {
      const message: Message = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role,
        content,
        timestamp: Date.now(),
      };

      set((state) => {
        const conversation = state.conversations[conversationId];
        if (!conversation) return state;

        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...conversation,
              messages: [...conversation.messages, message],
              updatedAt: Date.now(),
            },
          },
        };
      });
    },

    getConversation: (conversationId) => {
      return get().conversations[conversationId];
    },

    getCurrentConversation: () => {
      const { currentConversationId, conversations } = get();
      return currentConversationId ? conversations[currentConversationId] : undefined;
    },

    setCurrentConversation: (id) => {
      set({ currentConversationId: id });
    },

    clearConversation: (conversationId) => {
      set((state) => {
        const conversation = state.conversations[conversationId];
        if (!conversation) return state;

        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...conversation,
              messages: [],
              updatedAt: Date.now(),
            },
          },
        };
      });
    },

    deleteConversation: (conversationId) => {
      set((state) => {
        const { [conversationId]: _, ...rest } = state.conversations;
        return {
          conversations: rest,
          currentConversationId:
            state.currentConversationId === conversationId ? null : state.currentConversationId,
        };
      });
    },

    updateContext: (conversationId, context) => {
      set((state) => {
        const conversation = state.conversations[conversationId];
        if (!conversation) return state;

        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...conversation,
              context: { ...conversation.context, ...context },
              updatedAt: Date.now(),
            },
          },
        };
      });
    },

    getMessagesForAPI: (conversationId, maxMessages = 10) => {
      const conversation = get().conversations[conversationId];
      if (!conversation) return [];

      const recentMessages = conversation.messages.slice(-maxMessages);

      return recentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    },
  })
);

// 生成系统prompt，包含对话历史
export function generateContextualPrompt(
  baseSystemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  currentContext?: Record<string, unknown>
): string {
  let prompt = baseSystemPrompt;

  if (currentContext) {
    prompt += '\n\n【当前咨询的背景信息】\n';
    Object.entries(currentContext).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        prompt += `${key}: ${value}\n`;
      }
    });
  }

  if (conversationHistory.length > 0) {
    prompt += '\n\n【对话历史】这是用户和之前的对话记录，请保持上下文的连贯性，像老朋友聊天一样自然回应。\n';
  }

  return prompt;
}
