import { createRoot } from 'react-dom/client'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </GoogleOAuthProvider>
)
