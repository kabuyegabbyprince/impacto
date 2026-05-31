import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/i18n';

// Forces light mode by default unless stored otherwise
const initialTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", initialTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
