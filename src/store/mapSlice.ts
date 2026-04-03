import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

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
  locationsLoading: boolean
  locationsError: string | null
}

const initialState: MapState = {
  locations: [],
  selectedLocation: null,
  viewport: { longitude: 37.6173, latitude: 55.7558, zoom: 11 },
  locationsLoading: false,
  locationsError: null,
}

export const fetchLocations = createAsyncThunk<Location[]>(
  'map/fetchLocations',
  async () => {
    const res = await fetch('/api/locations')
    if (!res.ok) throw new Error('Failed to fetch locations')
    return res.json() as Promise<Location[]>
  }
)

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.locationsLoading = true
        state.locationsError = null
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locationsLoading = false
        state.locations = action.payload
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.locationsLoading = false
        state.locationsError = action.error.message ?? 'Ошибка загрузки локаций'
      })
  },
})

export const { setLocations, selectLocation, setViewport } = mapSlice.actions
