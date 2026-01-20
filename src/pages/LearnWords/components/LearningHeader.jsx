import { memo } from 'react'
import PropTypes from 'prop-types'
import ArrowIcon from '../../../components/ArrowIcon/ArrowIcon'

const LearningHeader = ({ 
  onExit, 
  currentIndex, 
  totalWords, 
  hideCounter = false,
  currentMode = '',
  currentModeIndex = 0,
  totalModes = 1
}) => (
  <div className="learning-header">
    <button className="back-button" onClick={onExit}>
      <ArrowIcon direction="left" size={20} />
      <span>Exit</span>
    </button>
    {totalModes > 1 && (
      <div className="mode-progress">
        Mode {currentModeIndex + 1}/{totalModes}: {currentMode}
      </div>
    )}
    {!hideCounter && (
      <div className="word-counter">
        {currentIndex + 1} / {totalWords}
      </div>
    )}
  </div>
)

LearningHeader.propTypes = {
  onExit: PropTypes.func.isRequired,
  currentIndex: PropTypes.number.isRequired,
  totalWords: PropTypes.number.isRequired,
  hideCounter: PropTypes.bool,
  currentMode: PropTypes.string,
  currentModeIndex: PropTypes.number,
  totalModes: PropTypes.number
}

export default memo(LearningHeader)

