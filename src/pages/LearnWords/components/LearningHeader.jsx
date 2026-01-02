import { memo } from 'react'
import PropTypes from 'prop-types'
import ArrowIcon from '../../../components/ArrowIcon/ArrowIcon'

const LearningHeader = ({ onExit, currentIndex, totalWords, hideCounter = false }) => (
  <div className="learning-header">
    <button className="back-button" onClick={onExit}>
      <ArrowIcon direction="left" size={20} />
      <span>Back to Selection</span>
    </button>
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
  hideCounter: PropTypes.bool
}

export default memo(LearningHeader)

