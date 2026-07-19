import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

window.addEventListener('error', (e) => {
  fetch('http://localhost:9999', { method: 'POST', body: e.error?.stack || e.message }).catch(()=>null);
});
window.addEventListener('unhandledrejection', (e) => {
  fetch('http://localhost:9999', { method: 'POST', body: e.reason?.stack || String(e.reason) }).catch(()=>null);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
