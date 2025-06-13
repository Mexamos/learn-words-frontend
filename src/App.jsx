import { Routes, Route } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

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
    </Routes>
  )
}