import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'
import { selectLocation } from 'mapModule/mapSlice'
import { clearMessages } from '../store/chatSlice'
import { useStreamingChat } from '../hooks/useStreamingChat'
import type { Location } from '@geochat/shared-types'

const CATEGORY_LABEL: Record<Location['category'], string> = {
  cafe: 'кафе', park: 'парк', museum: 'музей', bar: 'бар', shop: 'магазин',
}
const CATEGORY_COLOR: Record<Location['category'], string> = {
  cafe: '#ed8936', park: '#48bb78', museum: '#9f7aea', bar: '#fc8181', shop: '#63b3ed',
}
const CATEGORY_EMOJI: Record<Location['category'], string> = {
  cafe: '☕', park: '🌳', museum: '🏛️', bar: '🍸', shop: '🛍️',
}

export const ChatPanel = () => {
  const dispatch = useDispatch<AppDispatch>()
  const location = useSelector((s: RootState) => s.map.selectedLocation)
  const messages = useSelector((s: RootState) => s.chat.messages)
  const isLoading = useSelector((s: RootState) => s.chat.isLoading)
  const error = useSelector((s: RootState) => s.chat.error)
  const { sendMessage } = useStreamingChat()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevLocationId = useRef<string | null>(null)

  useEffect(() => {
    if (location?.id !== prevLocationId.current) {
      dispatch(clearMessages())
      prevLocationId.current = location?.id ?? null
    }
  }, [location?.id, dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage(text, location)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!location) return null

  const color = CATEGORY_COLOR[location.category]

  return (
    <div className="absolute top-0 right-0 h-full z-20 flex flex-col p-4 pl-0" style={{ width: 360 }}>
      <div className="glass rounded-2xl flex flex-col h-full overflow-hidden">

        {/* Заголовок */}
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #48bb78' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                AI Ассистент
              </span>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => dispatch(clearMessages())}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150 text-xs"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent' }}
                  title="Очистить чат"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 3.5h12M5 3.5V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M11.5 3.5l-.7 7.5a1 1 0 0 1-1 .9H4.2a1 1 0 0 1-1-.9L2.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 6.5v3M8.5 6.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
              <button
                onClick={() => dispatch(selectLocation(null))}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="rounded-xl px-3 py-2.5 flex items-center gap-3"
            style={{ background: `${color}14`, border: `1px solid ${color}33` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
              style={{ background: color, opacity: 0.9 }}>
              {CATEGORY_EMOJI[location.category]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>{location.name}</div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {location.address} · {CATEGORY_LABEL[location.category]}
              </div>
            </div>
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto chat-scroll px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <>
              <div className="flex justify-center">
                <div className="text-xs px-3 py-1 rounded-full"
                  style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Выбрана локация · {location.name}
                </div>
              </div>
              <div className="flex gap-2 msg-fade">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                  style={{ background: 'rgba(99,179,237,0.15)', border: '1px solid rgba(99,179,237,0.3)' }}>✦</div>
                <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-sm flex-1"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#cbd5e0', lineHeight: 1.6 }}>
                  Привет! Я расскажу всё об этом месте. Можете спросить про режим работы, что здесь интересного, как добраться — или любой другой вопрос.
                </div>
              </div>
            </>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex msg-fade ${msg.role === 'user' ? 'justify-end' : 'gap-2'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                  style={{ background: 'rgba(99,179,237,0.15)', border: '1px solid rgba(99,179,237,0.3)' }}>✦</div>
              )}
              <div
                className={`max-w-[85%] px-3 py-2 text-sm ${msg.role === 'user' ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm flex-1'}`}
                style={msg.role === 'user'
                  ? { background: 'rgba(99,179,237,0.2)', border: '1px solid rgba(99,179,237,0.25)', color: '#e2e8f0', lineHeight: 1.5 }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#cbd5e0', lineHeight: 1.6 }
                }
              >
                {msg.isStreaming && !msg.content
                  ? <span className="flex items-center gap-1 py-0.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                  : <>{msg.content}{msg.isStreaming && <span className="streaming-cursor" />}</>
                }
              </div>
            </div>
          ))}

          {error && (
            <div className="text-xs text-center px-3 py-2 rounded-lg msg-fade"
              style={{ color: '#fc8181', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)' }}>
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Инпут */}
        <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спросите про локацию..."
              rows={1}
              disabled={isLoading}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm resize-none outline-none transition-colors duration-200"
              style={{
                minHeight: 40, maxHeight: 120, lineHeight: 1.5,
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${input ? 'rgba(99,179,237,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: '#e2e8f0',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
              style={{
                background: input.trim() && !isLoading ? 'rgba(99,179,237,0.8)' : 'rgba(99,179,237,0.2)',
                color: input.trim() && !isLoading ? '#0d1117' : 'rgba(99,179,237,0.5)',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              }}
            >
              {isLoading ? '…' : '➤'}
            </button>
          </div>
          <div className="text-center mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Groq · Llama 3.3 70B · GeoChat
          </div>
        </div>

      </div>
    </div>
  )
}
