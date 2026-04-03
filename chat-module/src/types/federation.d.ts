declare module 'mapModule/mapSlice' {
  import type { Location } from '@geochat/shared-types'
  import type { Slice, PayloadAction } from '@reduxjs/toolkit'

  interface Viewport { longitude: number; latitude: number; zoom: number }
  interface MapState {
    locations: Location[]
    selectedLocation: Location | null
    viewport: Viewport
    locationsLoading: boolean
    locationsError: string | null
  }

  export const mapSlice: Slice<MapState>
  export const selectLocation: (payload: Location | null) => PayloadAction<Location | null>
}
