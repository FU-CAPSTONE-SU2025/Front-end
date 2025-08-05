import { GoogleOAuthProvider } from '@react-oauth/google'
import './App.css'
import '@ant-design/v5-patch-for-react-19';
import { routes } from './router/Route'
import { RouterProvider } from 'react-router'
import LoadingScreen from './components/LoadingScreen'
import { useLoading } from './hooks/useLoading'
import ConsoleWarning from './components/common/consoleWarning';

function App() {
  const router = routes
  const googleClientId = import.meta.env.VITE_API_GOOGLE_CLIENT_ID
  const isProd = import.meta.env.PROD
  if(isProd){
    ConsoleWarning()
  }
  const { isLoading, message } = useLoading()
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LoadingScreen isLoading={isLoading} message={message} />
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  )
}

export default App
