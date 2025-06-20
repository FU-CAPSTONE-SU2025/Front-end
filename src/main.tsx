import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'antd/dist/reset.css';
import App from './App.tsx'
import AppProvider from './components/provider.tsx';
createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
     <AppProvider>
     <App/>
     </AppProvider>
 
  </StrictMode>,
)
