import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Location {
  id: string
  name: string
  description: string
  address: string
  longitude: number
  latitude: number
  category: 'cafe' | 'park' | 'museum' | 'bar' | 'shop'
  rating?: number
  workingHours?: string
}

interface Viewport {
  longitude: number
  latitude: number
  zoom: number
}

interface MapState {
  locations: Location[]
  selectedLocation: Location | null
  viewport: Viewport
}

const initialState: MapState = {
  locations: [],
  selectedLocation: null,
  viewport: { longitude: 37.6173, latitude: 55.7558, zoom: 11 },
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setLocations(state, action: PayloadAction<Location[]>) {
      state.locations = action.payload
    },
    selectLocation(state, action: PayloadAction<Location | null>) {
      state.selectedLocation = action.payload
    },
    setViewport(state, action: PayloadAction<Viewport>) {
      state.viewport = action.payload
    },
  },
})

export const { setLocations, selectLocation, setViewport } = mapSlice.actions
