import Map, { NavigationControl, AttributionControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setViewport } from '../store/mapSlice'
import { MarkerLayer } from './MarkerLayer'

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

export const MapView = () => {
  const dispatch = useAppDispatch()
  const viewport = useAppSelector((s) => s.map.viewport)

  return (
    <Map
      longitude={viewport.longitude}
      latitude={viewport.latitude}
      zoom={viewport.zoom}
      onMove={(e) => dispatch(setViewport(e.viewState))}
      style={{ width: '100%', height: '100%' }}
      mapStyle={`https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`}
      attributionControl={false}
    >
      <NavigationControl position="top-left" />
      <AttributionControl position="bottom-left" compact={true} />
      <MarkerLayer />
    </Map>
  )
}
