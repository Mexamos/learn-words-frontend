import { memo } from 'react'
import PropTypes from 'prop-types'
import './SelectCorrectAnswer.css'

const SelectCorrectAnswer = ({ 
  word, 
  options, 
  correctAnswer, 
  onAnswerSelected, 
  selectedAnswer,
  isAnswered 
}) => {
  const handleOptionClick = (option) => {
    if (isAnswered) return // Prevent selecting after answer is chosen
    
    const isCorrect = option === correctAnswer
    onAnswerSelected(option, isCorrect)
  }

  const getOptionClassName = (option) => {
    if (!isAnswered) {
      return selectedAnswer === option ? 'option selected' : 'option'
    }
    
    // After answer is selected
    if (option === selectedAnswer) {
      // Highlight selected answer: green if correct, red if incorrect
      return option === correctAnswer ? 'option correct' : 'option incorrect'
    }
    // Don't highlight correct answer if wrong answer was selected
    return 'option disabled'
  }

  return (
    <div className="select-correct-answer-container">
      <div className="select-correct-answer-word">
        {word}
      </div>
      <div className="select-correct-answer-options">
        {options.map((option) => (
          <button
            key={option}
            className={getOptionClassName(option)}
            onClick={() => handleOptionClick(option)}
            disabled={isAnswered}
            aria-label={`Answer option: ${option}`}
            aria-pressed={selectedAnswer === option}
            aria-disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

SelectCorrectAnswer.propTypes = {
  word: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  correctAnswer: PropTypes.string.isRequired,
  onAnswerSelected: PropTypes.func.isRequired,
  selectedAnswer: PropTypes.string,
  isAnswered: PropTypes.bool.isRequired
}

export default memo(SelectCorrectAnswer)

