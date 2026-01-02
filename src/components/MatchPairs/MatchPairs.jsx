import { useState, useEffect, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import './MatchPairs.css'

const MatchPairs = ({ words, onComplete }) => {
  const [leftWords, setLeftWords] = useState([])
  const [rightWords, setRightWords] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [errorPair, setErrorPair] = useState(null)
  const [wordErrors, setWordErrors] = useState({}) // Track errors for each word

  // Initialize words on mount
  useEffect(() => {
    const left = words.map((word, index) => ({
      id: word.id,
      text: word.word,
      originalIndex: index
    }))
    
    const right = words.map((word, index) => ({
      id: word.id,
      text: word.translation,
      originalIndex: index
    }))
    
    // Shuffle right column
    const shuffled = [...right]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    setLeftWords(left)
    setRightWords(shuffled)
  }, [words])

  // Check if all pairs are matched
  useEffect(() => {
    if (matchedPairs.length === words.length && words.length > 0) {
      onComplete(matchedPairs)
    }
  }, [matchedPairs, words.length, onComplete])

  const handleLeftClick = useCallback((word) => {
    if (matchedPairs.some(pair => pair.id === word.id)) return
    
    setSelectedLeft(word)
    
    // If right word is already selected, check for match
    if (selectedRight) {
      checkMatch(word, selectedRight)
    }
  }, [selectedRight, matchedPairs])

  const handleRightClick = useCallback((word) => {
    if (matchedPairs.some(pair => pair.id === word.id)) return
    
    setSelectedRight(word)
    
    // If left word is already selected, check for match
    if (selectedLeft) {
      checkMatch(selectedLeft, word)
    }
  }, [selectedLeft, matchedPairs])

  const checkMatch = useCallback((left, right) => {
    if (left.id === right.id) {
      // Correct match
      setMatchedPairs(prev => [...prev, {
        id: left.id,
        word: left.text,
        translation: right.text,
        hasError: wordErrors[left.id] || false // Include error status
      }])
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      // Wrong match - mark both words as having an error
      setWordErrors(prev => ({
        ...prev,
        [left.id]: true,
        [right.id]: true
      }))
      setErrorPair({ left, right })
      
      // Clear error after 2 seconds
      setTimeout(() => {
        setErrorPair(null)
        setSelectedLeft(null)
        setSelectedRight(null)
      }, 1000)
    }
  }, [wordErrors])

  const getLeftItemClassName = (word) => {
    const isMatched = matchedPairs.some(pair => pair.id === word.id)
    const isSelected = selectedLeft?.id === word.id
    const isError = errorPair?.left?.id === word.id
    
    return `match-item ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isError ? 'error' : ''}`
  }

  const getRightItemClassName = (word) => {
    const isMatched = matchedPairs.some(pair => pair.id === word.id)
    const isSelected = selectedRight?.id === word.id
    const isError = errorPair?.right?.id === word.id
    
    return `match-item ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isError ? 'error' : ''}`
  }

  return (
    <div className="match-pairs-container">
      {/* Matched pairs section */}
      {matchedPairs.length > 0 && (
        <div className="matched-section">
          <h3>Matched Pairs ({matchedPairs.length}/{words.length})</h3>
          <div className="matched-pairs-display">
            <div className="matched-column">
              {matchedPairs.map(pair => (
                <div key={`matched-left-${pair.id}`} className="matched-item">
                  {pair.word}
                </div>
              ))}
            </div>
            <div className="matched-column">
              {matchedPairs.map(pair => (
                <div key={`matched-right-${pair.id}`} className="matched-item">
                  {pair.translation}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active matching section */}
      <div className="matching-section">
        <div className="match-column">
          {leftWords
            .filter(word => !matchedPairs.some(pair => pair.id === word.id))
            .map(word => (
              <button
                key={`left-${word.id}`}
                className={getLeftItemClassName(word)}
                onClick={() => handleLeftClick(word)}
                disabled={errorPair !== null}
              >
                {word.text}
              </button>
            ))}
        </div>
        
        <div className="match-column">
          {rightWords
            .filter(word => !matchedPairs.some(pair => pair.id === word.id))
            .map(word => (
              <button
                key={`right-${word.id}`}
                className={getRightItemClassName(word)}
                onClick={() => handleRightClick(word)}
                disabled={errorPair !== null}
              >
                {word.text}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

MatchPairs.propTypes = {
  words: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    word: PropTypes.string.isRequired,
    translation: PropTypes.string.isRequired
  })).isRequired,
  onComplete: PropTypes.func.isRequired
}

export default memo(MatchPairs)

