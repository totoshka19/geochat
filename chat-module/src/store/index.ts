import { configureStore } from '@reduxjs/toolkit'
import { chatSlice } from './chatSlice'
import type { Location } from '@geochat/shared-types'

// Standalone store — только для изолированной разработки модуля
export const store = configureStore({
  reducer: { chat: chatSlice.reducer },
})

// Локальный тип для standalone-режима
type LocalState = ReturnType<typeof store.getState>

// В production host внедряет map-слайс в store.
// Расширяем RootState, чтобы ChatPanel знал о s.map.*
interface MapState {
  locations: Location[]
  selectedLocation: Location | null
  viewport: { longitude: number; latitude: number; zoom: number }
  locationsLoading: boolean
  locationsError: string | null
}

export type RootState = LocalState & { map: MapState }
export type AppDispatch = typeof store.dispatch
