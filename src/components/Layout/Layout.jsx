import './Layout.css'
import { useState, useEffect } from 'react'
import Header from '../Header/Header'
import SideMenu from '../SideMenu/SideMenu'
import { getUnviewedImportsCount } from '../../services/wordsService'

export default function Layout({ pageTitle, children, fullWidth = false }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [unviewedCount, setUnviewedCount] = useState(0);

  // Load unviewed count for badge
  useEffect(() => {
    const loadUnviewedCount = async () => {
      try {
        const data = await getUnviewedImportsCount();
        setUnviewedCount(data.count || 0);
      } catch (error) {
        console.error('[Layout] Error loading unviewed count:', error);
      }
    };

    loadUnviewedCount();

    // Refresh every 3 seconds
    const interval = setInterval(loadUnviewedCount, 3 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="layout-container">
      <SideMenu
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Practice', path: '/learn' },
          { label: 'My Vocabularies', path: '/vocabularies' },
          { label: 'Import Words', path: '/import-words' },
          { label: 'Review Imports', path: '/imports', badge: unviewedCount },
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
        <main className={`layout-main ${fullWidth ? 'layout-main-full' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
