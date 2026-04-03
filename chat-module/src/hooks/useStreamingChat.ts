import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store'
import type { Location } from '@geochat/shared-types'
import {
  addMessage, appendToLastMessage,
  finishStreaming, setLoading, setError,
} from '../store/chatSlice'

export const useStreamingChat = () => {
  const dispatch = useDispatch<AppDispatch>()

  const sendMessage = async (text: string, location?: Location | null) => {
    dispatch(addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }))

    dispatch(addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    }))

    dispatch(setLoading(true))

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          locationContext: location
            ? { name: location.name, description: location.description, category: location.category }
            : undefined,
        }),
      })

      if (!response.ok || !response.body) {
        dispatch(setError('Ошибка соединения с сервером'))
        dispatch(finishStreaming())
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') {
            dispatch(finishStreaming())
            return
          }
          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string }
            if (parsed.text) dispatch(appendToLastMessage(parsed.text))
            if (parsed.error) dispatch(setError(parsed.error))
          } catch { /* неполный chunk */ }
        }
      }

      dispatch(finishStreaming())
    } catch {
      dispatch(setError('Нет соединения с сервером'))
      dispatch(finishStreaming())
    }
  }

  return { sendMessage }
}
