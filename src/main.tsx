import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { runAmplitudeDiag } from './diagnostico';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Diagnóstico de Amplitude: solo se ejecuta si la URL trae ?diag=1
runAmplitudeDiag();
