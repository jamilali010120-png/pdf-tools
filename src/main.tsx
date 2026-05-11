import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ FIX: ambil root dengan aman
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Element #root tidak ditemukan di index.html');
}

// ✅ FIX: render aman
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);