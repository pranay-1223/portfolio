import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// No StrictMode per spec
createRoot(document.getElementById('root')!).render(<App />);
