import PropTypes from 'prop-types'

export default function LearningShell({ header, children, footer }) {
  return (
    <div className="learning-shell">
      {header && <div className="learning-shell-header">{header}</div>}
      <div className="learning-shell-content">{children}</div>
      {footer && <div className="learning-shell-footer">{footer}</div>}
    </div>
  )
}

LearningShell.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node
}

