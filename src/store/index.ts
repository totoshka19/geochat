import { configureStore } from '@reduxjs/toolkit'
import { mapSlice } from './mapSlice'

export const store = configureStore({
  reducer: {
    map: mapSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
