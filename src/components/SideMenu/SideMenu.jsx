import { NavLink } from 'react-router-dom'
import './SideMenu.css'

/**
 * SideMenu component
 * @param {Array<{label: string, path: string}>} items - Menu items
 * @param {boolean} isVisible - Whether the side menu is visible
 * @param {function} onCollapse - Callback to collapse/hide the side menu
 */
export default function SideMenu({ items, isVisible, onCollapse }) {
  return (
    <aside className={`side-menu${isVisible ? ' open' : ''}`}>
      <div className="side-menu-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke={'currentColor'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            onClick={onCollapse}
            className="side-menu-hide-button"
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
                activeClassName="active"
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}