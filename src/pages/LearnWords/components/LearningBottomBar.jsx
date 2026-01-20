import PropTypes from 'prop-types'
import ArrowIcon from '../../../components/ArrowIcon/ArrowIcon'

export default function LearningBottomBar({
  onPrevious,
  onNext,
  canGoPrevious,
  isNextDisabled
}) {
  return (
    <div className="learning-bottom-bar" role="navigation" aria-label="Learning navigation">
      {canGoPrevious && (
        <button
          className="learning-bottom-bar-icon-button"
          onClick={onPrevious}
          type="button"
          aria-label="Previous word"
        >
          <ArrowIcon direction="left" size={22} />
        </button>
      )}

      <button
        className="learning-bottom-bar-icon-button primary"
        onClick={onNext}
        type="button"
        disabled={isNextDisabled}
        aria-label="Next word"
      >
        <ArrowIcon direction="right" size={22} />
      </button>
    </div>
  )
}

LearningBottomBar.propTypes = {
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  canGoPrevious: PropTypes.bool.isRequired,
  isNextDisabled: PropTypes.bool.isRequired
}

