import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
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
            <Dashboard />
         </ProtectedRoute>
       }
      />
      <Route
        path="/new-words"
        element={
          <ProtectedRoute>
            <WordsLoader />
         </ProtectedRoute>
       }
      />
    </Routes>
  )
}