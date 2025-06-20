import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize app
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Performance monitoring
if (import.meta.env.PROD) {
  // Report web vitals to analytics
  import('./lib/performance').then(({ initPerformanceMonitoring }) => {
    initPerformanceMonitoring();
  });
}