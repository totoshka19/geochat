import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { MapView } from './components/MapView'
import './standalone.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <MapView />
      </div>
    </Provider>
  </StrictMode>,
)
