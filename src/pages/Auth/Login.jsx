import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

export default function Login() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex items-center justify-center h-screen">
        <GoogleLogin
          onSuccess={credentialResponse => {
            // TODO: отправить credentialResponse.credential на ваш бэкенд
            console.log(credentialResponse)
          }}
          onError={() => {
            console.error('Login Failed')
          }}
        />
      </div>
    </GoogleOAuthProvider>
  )
}