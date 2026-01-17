import './Header.css'
import { useContext, useState, useRef, useEffect } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { useResponsive } from '../../constants/breakpoints'
import AvailableWordsInfo from './AvailableWordsInfo'

export default function Header({ pageTitle, isSideMenuVisible, onMenuToggle }) {
  const { user, logout } = useContext(AuthContext)
  const { isMobileMenu } = useResponsive()
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
      {/* Hamburger menu - показываем только на mobile/tablet (<992px) и когда sidebar не виден */}
      {(isMobileMenu || !isSideMenuVisible) && (
        <div className='header-side-menu-toggle-container'>
          <button
            className="menu-toggle-button"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            aria-expanded={isSideMenuVisible}
          >
            ☰
          </button>
        </div>
      )}

      <h1 className="header-component-title">{pageTitle}</h1>

      <div className="avatar-wrapper">
        <AvailableWordsInfo />
        
        <button 
          onClick={() => setMenuOpen(o => !o)} 
          className="avatar-button"
          aria-label="User menu"
          aria-expanded={menuOpen}
        >
          {avatar}
        </button>
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