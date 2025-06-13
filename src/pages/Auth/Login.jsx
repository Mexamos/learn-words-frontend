
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { AuthContext } from '../../contexts/AuthContext'

export default function Login() {
  const { user, login } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="flex items-center justify-center h-screen">
      <GoogleLogin
        onSuccess={credentialResponse => {
          login(credentialResponse.credential)
        }}
        onError={() => {
          console.error('Login Failed')
        }}
      />
    </div>
  )
}
