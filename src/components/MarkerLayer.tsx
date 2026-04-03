import { useMemo, useState, useCallback, useEffect } from 'react'
import { Marker, useMap, type MarkerEvent } from 'react-map-gl/maplibre'
import Supercluster from 'supercluster'
import type { BBox } from 'geojson'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchLocations, selectLocation, setViewport } from '../store/mapSlice'
import type { Location } from '../store/mapSlice'

type MarkerClickEvent = MarkerEvent<MouseEvent>

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

interface ClusterProperties {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: number
}

export const MarkerLayer = () => {
  const dispatch = useAppDispatch()
  const locations = useAppSelector((s) => s.map.locations)
  const selectedId = useAppSelector((s) => s.map.selectedLocation?.id)
  const viewport = useAppSelector((s) => s.map.viewport)
  const { current: map } = useMap()

  const [bounds, setBounds] = useState<BBox>([-180, -85, 180, 85])
  const [zoom, setZoom] = useState(viewport.zoom)

  useEffect(() => {
    dispatch(fetchLocations())
  }, [dispatch])

  const updateView = useCallback(() => {
    if (!map) return
    const b = map.getBounds()
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
    setZoom(map.getZoom())
  }, [map])

  useEffect(() => {
    if (!map) return
    updateView()
    map.on('moveend', updateView)
    return () => { map.off('moveend', updateView) }
  }, [map, updateView])

  // GeoJSON points для Supercluster
  const points = useMemo<GeoJSON.Feature<GeoJSON.Point, Location>[]>(() =>
    locations.map((loc) => ({
      type: 'Feature',
      properties: loc,
      geometry: { type: 'Point', coordinates: [loc.longitude, loc.latitude] },
    })), [locations])

  const supercluster = useMemo(() => {
    const sc = new Supercluster<Location>({ radius: 60, maxZoom: 16 })
    sc.load(points)
    return sc
  }, [points])

  const clusters = useMemo(
    () => supercluster.getClusters(bounds, Math.floor(zoom)),
    [supercluster, bounds, zoom]
  )

  const handleClusterClick = useCallback((clusterId: number, lng: number, lat: number) => {
    const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 20)
    dispatch(setViewport({ longitude: lng, latitude: lat, zoom: expansionZoom }))
  }, [supercluster, dispatch])

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates as [number, number]

        // Кластер
        if ((cluster.properties as unknown as ClusterProperties).cluster) {
          const { cluster_id, point_count } = cluster.properties as unknown as ClusterProperties
          const size = 32 + Math.min(point_count, 20) * 1.5

          return (
            <Marker
              key={`cluster-${cluster_id}`}
              longitude={longitude}
              latitude={latitude}
              anchor="center"
              onClick={() => handleClusterClick(cluster_id, longitude, latitude)}
            >
              <div
                className="cursor-pointer flex items-center justify-center rounded-full font-semibold text-white transition-transform duration-150 hover:scale-110"
                style={{
                  width: size,
                  height: size,
                  background: 'rgba(99,179,237,0.2)',
                  border: '2px solid rgba(99,179,237,0.55)',
                  fontSize: 13,
                  boxShadow: '0 0 0 4px rgba(99,179,237,0.08)',
                }}
              >
                {point_count}
              </div>
            </Marker>
          )
        }

        // Одиночный маркер
        const loc = cluster.properties as Location
        const isActive = loc.id === selectedId
        const color = CATEGORY_COLORS[loc.category]

        return (
          <Marker
            key={loc.id}
            longitude={longitude}
            latitude={latitude}
            anchor="center"
            onClick={(e: MarkerClickEvent) => {
              e.originalEvent?.stopPropagation()
              dispatch(selectLocation(isActive ? null : loc))
            }}
          >
            <div className="relative cursor-pointer group" style={{ width: 20, height: 20 }}>
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
