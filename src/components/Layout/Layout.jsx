import './Layout.css'
import { useState } from 'react'
import Header from '../Header/Header'
import SideMenu from '../SideMenu/SideMenu'

export default function Layout({ pageTitle, children }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="layout-container">
      <SideMenu
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Learn Words', path: '/learn' },
          { label: 'My Vocabularies', path: '/vocabularies' },
          { label: 'Add new words', path: '/new-words' },
        ]}
        isVisible={sidebarVisible}
        onCollapse={() => setSidebarVisible(false)}
      />
      <div className='layout-content'>
        <Header
          pageTitle={pageTitle}
          isSideMenuVisible={sidebarVisible}
          onMenuToggle={() => setSidebarVisible(true)}
        />
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  )
}
