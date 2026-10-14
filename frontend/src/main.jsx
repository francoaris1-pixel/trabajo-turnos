import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Este es el encargado de inyectar todo tu diseño dentro del navegador
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
