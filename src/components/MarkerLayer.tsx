import { Marker, type MarkerEvent } from 'react-map-gl/maplibre'

type MarkerClickEvent = MarkerEvent<MouseEvent>
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setLocations, selectLocation } from '../store/mapSlice'
import type { Location } from '../store/mapSlice'
import locationsData from '../data/locations.json'

const CATEGORY_COLORS: Record<Location['category'], string> = {
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

export const MarkerLayer = () => {
  const dispatch = useAppDispatch()
  const locations = useAppSelector((s) => s.map.locations)
  const selectedId = useAppSelector((s) => s.map.selectedLocation?.id)

  useEffect(() => {
    dispatch(setLocations(locationsData as Location[]))
  }, [dispatch])

  return (
    <>
      {locations.map((loc) => {
        const isActive = loc.id === selectedId
        const color = CATEGORY_COLORS[loc.category]

        return (
          <Marker
            key={loc.id}
            longitude={loc.longitude}
            latitude={loc.latitude}
            anchor="center"
            onClick={(e: MarkerClickEvent) => {
              e.originalEvent?.stopPropagation()
              dispatch(selectLocation(isActive ? null : loc))
            }}
          >
            <div className="relative cursor-pointer group" style={{ width: 20, height: 20 }}>
              {/* Пульсирующее кольцо у активного маркера */}
              {isActive && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: color,
                    opacity: 0.3,
                    animation: 'pulse-ring 2s ease-out infinite',
                    transform: 'scale(2.2)',
                  }}
                />
              )}

              {/* Сам маркер */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200"
                style={{
                  background: color,
                  border: `2px solid rgba(255,255,255,${isActive ? 0.9 : 0.5})`,
                  transform: isActive ? 'scale(1.4)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 0 3px ${color}40` : 'none',
                  fontSize: 9,
                }}
                title={loc.name}
              >
                {CATEGORY_EMOJI[loc.category]}
              </div>

              {/* Tooltip при hover */}
              <div
                className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap
                           text-xs px-2 py-1 rounded-lg pointer-events-none
                           opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{
                  background: 'rgba(13,17,23,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                }}
              >
                {loc.name}
              </div>
            </div>
          </Marker>
        )
      })}
    </>
  )
}
