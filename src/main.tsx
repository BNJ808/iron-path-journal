
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/pwaUtils'
import { TimerProvider } from './contexts/TimerContext'

// Enregistrer le service worker
if (import.meta.env.PROD) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(
  <TimerProvider>
    <App />
  </TimerProvider>
);
