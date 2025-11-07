import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LanguageSetupGuard from './components/LanguageSetupGuard/LanguageSetupGuard'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import WordsLoader from './pages/WordsLoader/WordsLoader'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LanguageSetupGuard>
              <Dashboard />
            </LanguageSetupGuard>
         </ProtectedRoute>
       }
      />
      <Route
        path="/new-words"
        element={
          <ProtectedRoute>
            <LanguageSetupGuard>
              <WordsLoader />
            </LanguageSetupGuard>
         </ProtectedRoute>
       }
      />
    </Routes>
  )
}