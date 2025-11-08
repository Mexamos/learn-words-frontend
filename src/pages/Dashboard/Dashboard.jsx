import './Dashboard.css'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import Layout from '../../components/Layout/Layout'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  return (
   <Layout pageTitle="Dashboard">
      <p>
        Welcome, <strong>{user?.name}</strong>!
      </p>
      {/* rest of content */}
    </Layout>
  )
}
