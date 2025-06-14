import './Layout.css'
import Header from '../Header/Header'

export default function Layout({ pageTitle, children }) {
  return (
    <div className="layout-container">
      <Header pageTitle={pageTitle}/>
      <main className="layout-main">
        {children}
      </main>
    </div>
  )
}
