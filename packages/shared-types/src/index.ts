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

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  timestamp: number
}
