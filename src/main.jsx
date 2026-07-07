import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './components/NotificationProvider.jsx'
import { LoadingProvider } from './components/LoadingProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </NotificationProvider>
  </StrictMode>,
)
