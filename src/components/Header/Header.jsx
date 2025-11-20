import './Header.css'
import { useContext, useState, useRef, useEffect } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import UnviewedImportsBadge from './UnviewedImportsBadge'

export default function Header({ pageTitle, isSideMenuVisible, onMenuToggle }) {
  const { user, logout } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const avatar = user?.picture ? (
    <img src={user.picture} alt={user.name} className="avatar-img" />
  ) : (
    <div className="avatar-placeholder">
      {user?.name?.[0]?.toUpperCase()}
    </div>
  )

  return (
    <header className="header-component" ref={menuRef}>
      {!isSideMenuVisible && (
        <div className='header-side-menu-toggle-container'>
          <div
            className="menu-toggle-button"
            onClick={onMenuToggle}
          >
            ☰
          </div>
        </div>
      )}

      <h1 className="header-component-title">{pageTitle}</h1>

      <div className="avatar-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <UnviewedImportsBadge />
        
        <div onClick={() => setMenuOpen(o => !o)} className="avatar-button">
          {avatar}
        </div>
        {menuOpen && (
          <ul className="dropdown-menu">
            <li>
              <button onClick={logout} className="dropdown-item">
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </header>
  )
}