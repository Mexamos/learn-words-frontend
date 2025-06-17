import { NavLink } from 'react-router-dom'
import './SideMenu.css'

/**
 * SideMenu component
 * @param {Array<{label: string, path: string}>} items - Menu items
 * @param {boolean} isVisible - Whether the side menu is visible
 * @param {function} onCollapse - Callback to collapse/hide the side menu
 */
export default function SideMenu({ items, isVisible, onCollapse }) {
  if (!isVisible) return null

  return (
    <aside className="side-menu">
      <div className="side-menu-header">
        <button
          className="collapse-button"
          onClick={onCollapse}
          aria-label="Collapse side menu"
        >
        </button>
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