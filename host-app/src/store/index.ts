import { configureStore } from '@reduxjs/toolkit'
import { mapSlice } from 'mapModule/mapSlice'
import { chatSlice } from 'chatModule/chatSlice'

export const store = configureStore({
  reducer: {
    map: mapSlice.reducer,
    chat: chatSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
