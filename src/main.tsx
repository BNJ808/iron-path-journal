
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/pwaUtils'
import { TimerProvider } from './contexts/TimerContext'

// Enregistrer le service worker
if (import.meta.env.PROD) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <TimerProvider>
      <App />
    </TimerProvider>
  </HelmetProvider>
);

