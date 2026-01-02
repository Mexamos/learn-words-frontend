import { memo } from 'react'
import PropTypes from 'prop-types'

/**
 * Arrow icon component for navigation
 * @param {string} direction - Direction of the arrow: 'left' or 'right'
 * @param {number} size - Size of the icon in pixels
 * @param {string} className - Additional CSS classes
 */
const ArrowIcon = ({ direction = 'right', size = 20, className = '', ...props }) => {
  const arrows = {
    left: <polyline points="15 18 9 12 15 6" />,
    right: <polyline points="9 18 15 12 9 6" />
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {arrows[direction]}
    </svg>
  )
}

ArrowIcon.propTypes = {
  direction: PropTypes.oneOf(['left', 'right']).isRequired,
  size: PropTypes.number,
  className: PropTypes.string
}

export default memo(ArrowIcon)

