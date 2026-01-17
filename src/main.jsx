import { createRoot } from 'react-dom/client'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { toast, Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import { useRegisterSW } from 'virtual:pwa-register/react'

function PWAUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  // Show update notification
  if (needRefresh) {
    toast.info('New version available!', {
      description: 'Click to update and reload the app',
      duration: Infinity,
      action: {
        label: 'Update',
        onClick: () => {
          updateServiceWorker(true)
          close()
        },
      },
      cancel: {
        label: 'Later',
        onClick: () => close(),
      },
    })
  }

  // Show offline ready notification
  if (offlineReady) {
    toast.success('App is ready to work offline!', {
      duration: 3000,
    })
  }

  return null
}

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
        <AuthProvider>
          <PWAUpdatePrompt />
          <App />
          <Toaster 
            position="top-center"
            richColors
            expand={false}
            visibleToasts={3}
            closeButton={false}
            offset="16px"
            gap={12}
          />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </GoogleOAuthProvider>
)
