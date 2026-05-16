import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './context/StoreContext'
import { RoleProvider } from './context/RoleContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StoreProvider>
        <RoleProvider>
          <App />
        </RoleProvider>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
