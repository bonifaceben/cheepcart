import { StrictMode } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'   // 🔥 add this

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>        {/* 🔥 wrap here */}
      <App />
    </AuthProvider>
  </StrictMode>,
)
