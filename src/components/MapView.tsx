import Map, { NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setViewport } from '../store/mapSlice'
import { MarkerLayer } from './MarkerLayer'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export const MapView = () => {
  const dispatch = useAppDispatch()
  const viewport = useAppSelector((s) => s.map.viewport)

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      longitude={viewport.longitude}
      latitude={viewport.latitude}
      zoom={viewport.zoom}
      onMove={(e) => dispatch(setViewport(e.viewState))}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      <NavigationControl position="top-right" />
      <MarkerLayer />
    </Map>
  )
}
