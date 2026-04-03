import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Message } from '@geochat/shared-types'

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload)
    },
    appendToLastMessage(state, action: PayloadAction<string>) {
      const last = state.messages[state.messages.length - 1]
      if (last && last.role === 'assistant') {
        last.content += action.payload
      }
    },
    finishStreaming(state) {
      const last = state.messages[state.messages.length - 1]
      if (last) last.isStreaming = false
      state.isLoading = false
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    clearMessages(state) {
      state.messages = []
      state.error = null
    },
  },
})

export const {
  addMessage, appendToLastMessage, finishStreaming,
  setLoading, setError, clearMessages,
} = chatSlice.actions
