import { useState, useEffect, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import { shuffleArray } from '../../utils/helpers'
import './MakeWord.css'

const MakeWord = ({ word, translation, onAnswerComplete }) => {
  const [placedLetters, setPlacedLetters] = useState([]) // Letters placed in slots
  const [availableLetters, setAvailableLetters] = useState([]) // Letters available to select
  const [errors, setErrors] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Initialize letters on mount or when word changes
  useEffect(() => {
    const letters = word.split('').map((letter, index) => ({
      char: letter,
      originalIndex: index,
      id: `${letter}-${index}` // Unique ID for each letter
    }))
    
    setAvailableLetters(shuffleArray(letters))
    setPlacedLetters(new Array(word.length).fill(null))
    setErrors(0)
    setIsCompleted(false)
  }, [word])

  // Check if word is completed
  useEffect(() => {
    if (placedLetters.length > 0 && 
        placedLetters.every(letter => letter !== null) && 
        !isCompleted) {
      setIsCompleted(true)
      // Report result: correct if errors < 3
      const isCorrect = errors < 3
      onAnswerComplete(isCorrect)
    }
  }, [placedLetters, isCompleted, errors, onAnswerComplete])

  const handleLetterClick = useCallback((letter) => {
    if (isCompleted) return

    // Find next empty slot
    const nextEmptyIndex = placedLetters.findIndex(slot => slot === null)
    if (nextEmptyIndex === -1) return // All slots filled

    // Check if letter is correct for this position
    const isCorrect = letter.char === word[nextEmptyIndex]

    if (isCorrect) {
      // Place letter in slot
      const newPlacedLetters = [...placedLetters]
      newPlacedLetters[nextEmptyIndex] = letter
      setPlacedLetters(newPlacedLetters)

      // Remove letter from available
      setAvailableLetters(prev => prev.filter(l => l.id !== letter.id))
    } else {
      // Wrong letter - increment errors
      setErrors(prev => prev + 1)
    }
  }, [placedLetters, word, isCompleted])

  const handleSlotClick = useCallback((index) => {
    if (isCompleted) return
    
    const letter = placedLetters[index]
    if (!letter) return // Empty slot

    // Remove letter from slot
    const newPlacedLetters = [...placedLetters]
    newPlacedLetters[index] = null
    setPlacedLetters(newPlacedLetters)

    // Add letter back to available
    setAvailableLetters(prev => shuffleArray([...prev, letter]))
  }, [placedLetters, isCompleted])

  return (
    <div className="make-word-container">
      {/* Translation (clue) */}
      <div className="make-word-translation">
        {translation}
      </div>

      {/* Letter slots */}
      <div className="make-word-slots">
        {placedLetters.map((letter, index) => (
          <button
            key={index}
            className={`make-word-slot ${letter ? 'filled' : 'empty'} ${isCompleted ? 'completed' : ''}`}
            onClick={() => handleSlotClick(index)}
            disabled={!letter || isCompleted}
          >
            {letter ? letter.char : ''}
          </button>
        ))}
      </div>

      {/* Error indicators */}
      <div className="make-word-errors">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className={`error-mark ${index < errors ? 'active' : ''}`}
          >
            ✕
          </div>
        ))}
      </div>

      {/* Available letters */}
      <div className="make-word-letters">
        {availableLetters.map((letter) => (
          <button
            key={letter.id}
            className="make-word-letter"
            onClick={() => handleLetterClick(letter)}
            disabled={isCompleted}
          >
            {letter.char}
          </button>
        ))}
      </div>

      {/* Status message */}
      {isCompleted && (
        <div className={`make-word-result ${errors < 3 ? 'success' : 'failure'}`}>
          {errors < 3 ? '✓ Correct!' : '✗ Too many errors'}
        </div>
      )}
    </div>
  )
}

MakeWord.propTypes = {
  word: PropTypes.string.isRequired,
  translation: PropTypes.string.isRequired,
  onAnswerComplete: PropTypes.func.isRequired
}

export default memo(MakeWord)

