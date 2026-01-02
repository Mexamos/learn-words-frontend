import { memo } from 'react'
import PropTypes from 'prop-types'
import ArrowIcon from '../../../components/ArrowIcon/ArrowIcon'

const NavigationButtons = ({ 
  isFirstWord, 
  onPrevious, 
  onNext, 
  isNextDisabled 
}) => (
  <>
    {!isFirstWord && (
      <button className="nav-button nav-button-left" onClick={onPrevious}>
        <ArrowIcon direction="left" size={32} />
      </button>
    )}
    
    <button 
      className="nav-button nav-button-right" 
      onClick={onNext}
      disabled={isNextDisabled}
    >
      <ArrowIcon direction="right" size={32} />
    </button>
  </>
)

NavigationButtons.propTypes = {
  isFirstWord: PropTypes.bool.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  isNextDisabled: PropTypes.bool
}

NavigationButtons.defaultProps = {
  isNextDisabled: false
}

export default memo(NavigationButtons)

