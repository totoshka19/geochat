declare module 'mapModule/MapView' {
  import type { FC } from 'react'
  export const MapView: FC
}

declare module 'mapModule/mapSlice' {
  import type { Location } from '@geochat/shared-types'
  import type { Slice, PayloadAction, AsyncThunk } from '@reduxjs/toolkit'

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
  export const setLocations: (payload: Location[]) => PayloadAction<Location[]>
  export const setViewport: (payload: Viewport) => PayloadAction<Viewport>
  export const fetchLocations: AsyncThunk<Location[], void, object>
}

declare module 'chatModule/ChatPanel' {
  import type { FC } from 'react'
  export const ChatPanel: FC
}

declare module 'chatModule/chatSlice' {
  import type { Message } from '@geochat/shared-types'
  import type { Slice, PayloadAction } from '@reduxjs/toolkit'

  interface ChatState {
    messages: Message[]
    isLoading: boolean
    error: string | null
  }
  export const chatSlice: Slice<ChatState>
  export const addMessage: (payload: Message) => PayloadAction<Message>
  export const clearMessages: () => PayloadAction<void>
  export const appendToLastMessage: (payload: string) => PayloadAction<string>
  export const finishStreaming: () => PayloadAction<void>
  export const setLoading: (payload: boolean) => PayloadAction<boolean>
  export const setError: (payload: string | null) => PayloadAction<string | null>
}
