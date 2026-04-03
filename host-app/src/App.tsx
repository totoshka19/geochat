import { lazy, Suspense } from 'react'

const MapView  = lazy(() => import('mapModule/MapView').then((m) => ({ default: m.MapView })))
const ChatPanel = lazy(() => import('chatModule/ChatPanel').then((m) => ({ default: m.ChatPanel })))

export default function App() {
  return (
    <div className="relative w-full h-full bg-[#0d1117]">
      <Suspense fallback={<div className="w-full h-full bg-[#0d1117]" />}>
        <MapView />
      </Suspense>
      <Suspense fallback={null}>
        <ChatPanel />
      </Suspense>
    </div>
  )
}
