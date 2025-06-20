import { GoogleOAuthProvider } from '@react-oauth/google'
import './App.css'
import '@ant-design/v5-patch-for-react-19';
import { routes } from './router/Route'
import { RouterProvider } from 'react-router'

function App() {
  const router = routes
  const googleClientId = import.meta.env.VITE_API_GOOGLE_CLIENT_ID
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
    <RouterProvider router={router} />
    </GoogleOAuthProvider>
  )
}

export default App
