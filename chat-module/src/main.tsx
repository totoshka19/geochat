import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './standalone.css'

// Standalone entry — только для изолированной разработки chat-module
// В production ChatPanel монтируется host-app через Module Federation
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <div style={{ color: '#e2e8f0', padding: 20 }}>
        Chat module standalone — откройте host-app для полного UI
      </div>
    </Provider>
  </StrictMode>,
)
