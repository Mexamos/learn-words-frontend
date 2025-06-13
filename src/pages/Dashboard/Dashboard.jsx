import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
        >
          Logout
        </button>
      </div>

      <p className="text-lg">
        Welcome, <span className="font-semibold">{user?.name}</span>!
      </p>

      {/* Здесь можно разместить остальной контент дашборда */}
    </div>
  )
}
