import { configureStore } from '@reduxjs/toolkit'
import { mapSlice } from './mapSlice'

// Standalone store — только для изолированной разработки модуля
// В production store создаётся в host-app и шарится через react-redux singleton
export const store = configureStore({
  reducer: { map: mapSlice.reducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
