import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DevPreview } from './DevPreview.tsx'
import { PreferencesProvider } from './context/PreferencesProvider.tsx'

const USE_DEV_PREVIEW = false

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      {USE_DEV_PREVIEW ? <DevPreview /> : <App />}
    </PreferencesProvider>
  </StrictMode>,
)
