import { MapView } from './components/MapView'
import { ChatPanel } from './components/ChatPanel'

export default function App() {
  return (
    <div className="relative w-full h-full bg-[#0d1117]">
      <MapView />
      <ChatPanel />
    </div>
  )
}
