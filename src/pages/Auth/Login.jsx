import './Login.css';
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { AuthContext } from '../../contexts/AuthContext'
import { BookOpen } from 'lucide-react'

export default function Login() {
  const { user, login } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="lognin-container">
      <div className="login-left">
        <div className="blob"></div>
      </div>

      <div className="login-right">
        <div className="loging-card">
          <BookOpen className="book-icon" />
          <h1>MyLingo</h1>
          <p>Sign in to your account</p>

          <div className='google-button-container'>
            <GoogleLogin
              onSuccess={credentialResponse => {
                login(credentialResponse.credential)
              }}
              onError={() => {
                console.error('Login Failed')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
