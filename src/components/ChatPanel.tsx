import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectLocation } from '../store/mapSlice'
import type { Location } from '../store/mapSlice'

const CATEGORY_LABEL: Record<Location['category'], string> = {
  cafe:   'кафе',
  park:   'парк',
  museum: 'музей',
  bar:    'бар',
  shop:   'магазин',
}

const CATEGORY_COLOR: Record<Location['category'], string> = {
  cafe:   '#ed8936',
  park:   '#48bb78',
  museum: '#9f7aea',
  bar:    '#fc8181',
  shop:   '#63b3ed',
}

const CATEGORY_EMOJI: Record<Location['category'], string> = {
  cafe:   '☕',
  park:   '🌳',
  museum: '🏛️',
  bar:    '🍸',
  shop:   '🛍️',
}

export const ChatPanel = () => {
  const dispatch = useAppDispatch()
  const location = useAppSelector((s) => s.map.selectedLocation)

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
            <button
              onClick={() => dispatch(selectLocation(null))}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              ✕
            </button>
          </div>

          {/* Карточка локации */}
          <div
            className="rounded-xl px-3 py-2.5 flex items-center gap-3"
            style={{
              background: `${color}14`,
              border: `1px solid ${color}33`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
              style={{ background: color, opacity: 0.9 }}
            >
              {CATEGORY_EMOJI[location.category]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>
                {location.name}
              </div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {location.address} · {CATEGORY_LABEL[location.category]}
              </div>
            </div>
          </div>
        </div>

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto chat-scroll px-4 py-4 flex flex-col gap-3">

          {/* Системное сообщение */}
          <div className="flex justify-center">
            <div
              className="text-xs px-3 py-1 rounded-full"
              style={{
                color: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Выбрана локация · {location.name}
            </div>
          </div>

          {/* Карточка с деталями локации */}
          <div
            className="rounded-2xl rounded-tl-sm px-3 py-2.5 flex gap-2"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
              style={{
                background: 'rgba(99,179,237,0.15)',
                border: '1px solid rgba(99,179,237,0.3)',
              }}
            >
              ✦
            </div>
            <div className="text-sm" style={{ color: '#cbd5e0', lineHeight: 1.6 }}>
              <p>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{location.name}</span>
                {' '}— {location.description}
              </p>
              {(location.rating || location.workingHours) && (
                <p className="mt-2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                  {location.rating && `Рейтинг ${location.rating}`}
                  {location.rating && location.workingHours && ' · '}
                  {location.workingHours && `Работает ${location.workingHours}`}
                </p>
              )}
            </div>
          </div>

          {/* Заглушка AI */}
          <div className="flex justify-center mt-2">
            <div
              className="text-xs px-3 py-1.5 rounded-lg text-center"
              style={{
                color: 'rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              AI-чат появится в Этапе 3
            </div>
          </div>
        </div>

        {/* Инпут (заглушка) */}
        <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 rounded-xl px-3 py-2.5 text-sm"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              Спросите про локацию...
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,179,237,0.3)', color: '#63b3ed' }}
            >
              ➤
            </div>
          </div>
          <div className="text-center mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Groq · Llama 3.3 70B · GeoChat
          </div>
        </div>

      </div>
    </div>
  )
}
