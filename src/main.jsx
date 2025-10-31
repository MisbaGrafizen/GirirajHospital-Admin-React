import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/react';
import { Provider } from 'react-redux'



createRoot(document.getElementById('root')).render(
  
    <StrictMode>
      <NextUIProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NextUIProvider>
    </StrictMode>


);
