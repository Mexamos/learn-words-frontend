import { NavLink } from 'react-router-dom'
import { useResponsive } from '../../constants/breakpoints'
import './SideMenu.css'

/**
 * SideMenu component with responsive drawer for mobile
 * @param {Array<{label: string, path: string, badge?: number}>} items - Menu items
 * @param {boolean} isVisible - Whether the side menu is visible
 * @param {function} onCollapse - Callback to collapse/hide the side menu
 */
export default function SideMenu({ items, isVisible, onCollapse }) {
  const { isMobileMenu } = useResponsive()

  // На мобильном закрываем меню при клике на ссылку
  const handleLinkClick = () => {
    if (isMobileMenu && isVisible) {
      onCollapse()
    }
  }

  return (
    <>
      {/* Backdrop для мобильных устройств */}
      {isMobileMenu && isVisible && (
        <div 
          className="side-menu-backdrop" 
          onClick={onCollapse}
          aria-hidden="true"
        />
      )}

      {/* Side Menu */}
      <aside 
        className={`side-menu${isVisible ? ' open' : ''}${isMobileMenu ? ' mobile' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="side-menu-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={36}
            height={36}
            viewBox="0 0 24 24"
            fill="none"
            stroke={'currentColor'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            onClick={onCollapse}
            className="side-menu-hide-button"
            aria-label="Close menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onCollapse()
              }
            }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>

        <nav className="menu-nav">
          <ul className="menu-list">
            {items.map(item => (
              <li key={item.path} className="menu-list-item">
                <NavLink
                  to={item.path}
                  className="menu-link"
                  onClick={handleLinkClick}
                >
                  <span className="menu-link-label">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="menu-link-badge">{item.badge}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}