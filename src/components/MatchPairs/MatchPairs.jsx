import { useMemo, useRef, useState, useEffect, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import './MatchPairs.css'

const MatchPairs = ({ words, onComplete }) => {
  const [matchedPairs, setMatchedPairs] = useState([])
  const [wordErrors, setWordErrors] = useState({}) // Track errors for each word
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [feedback, setFeedback] = useState(null) // { type: 'error' | 'success', message: string }
  const hasCompletedRef = useRef(false)

  const leftItems = useMemo(() => {
    return words.map((word) => ({
      id: word.id,
      text: word.word
    }))
  }, [words])

  const rightItems = useMemo(() => {
    const base = words.map((word) => ({
      id: word.id,
      text: word.translation
    }))
    // Shuffle translations once per words change
    const shuffled = [...base]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [words])

  const remainingLeftItems = useMemo(() => {
    const matchedIds = new Set(matchedPairs.map((p) => p.id))
    return leftItems.filter((w) => !matchedIds.has(w.id))
  }, [leftItems, matchedPairs])

  const remainingRightItems = useMemo(() => {
    const matchedIds = new Set(matchedPairs.map((p) => p.id))
    return rightItems.filter((w) => !matchedIds.has(w.id))
  }, [rightItems, matchedPairs])

  // Reset internal state when words change
  useEffect(() => {
    setMatchedPairs([])
    setWordErrors({})
    setSelectedLeft(null)
    setSelectedRight(null)
    setFeedback(null)
    hasCompletedRef.current = false
  }, [words])

  // Check if all pairs are matched
  useEffect(() => {
    if (!hasCompletedRef.current && matchedPairs.length === words.length && words.length > 0) {
      hasCompletedRef.current = true
      onComplete(matchedPairs)
    }
  }, [matchedPairs, words.length, onComplete])

  const clearFeedbackSoon = useCallback(() => {
    window.setTimeout(() => setFeedback(null), 700)
  }, [])

  const confirmPair = useCallback(
    (left, right) => {
      if (!left || !right) return

      if (left.id === right.id) {
        setMatchedPairs((prev) => [
          ...prev,
          {
            id: left.id,
            word: left.text,
            translation: right.text,
            hasError: wordErrors[left.id] || false
          }
        ])
        setSelectedLeft(null)
        setSelectedRight(null)
        setFeedback({ type: 'success', message: 'Matched!' })
        clearFeedbackSoon()
      } else {
        setWordErrors((prev) => ({
          ...prev,
          [left.id]: true,
          [right.id]: true
        }))
        setFeedback({ type: 'error', message: 'Not a match — try again' })
        clearFeedbackSoon()
        // Keep left selection: lets the user quickly retry choosing the translation
        setSelectedRight(null)
      }
    },
    [wordErrors, clearFeedbackSoon]
  )

  const handleLeftClick = useCallback(
    (item) => {
      setSelectedLeft(item)
      setSelectedRight(null)
      setFeedback(null)
    },
    []
  )

  const handleRightClick = useCallback(
    (item) => {
      if (!selectedLeft) return
      setSelectedRight(item)
      confirmPair(selectedLeft, item)
    },
    [selectedLeft, confirmPair]
  )

  const getItemClassName = (item, side) => {
    const isSelected = side === 'left' ? selectedLeft?.id === item.id : selectedRight?.id === item.id
    const hasEverErrored = Boolean(wordErrors[item.id])
    return `match-item${isSelected ? ' selected' : ''}${hasEverErrored ? ' has-error' : ''}`
  }

  const stepLabel = selectedLeft ? 'Step 2/2: Choose the translation' : 'Step 1/2: Choose the word'

  return (
    <div className="match-pairs-container">
      <div className="match-pairs-header">
        <div className="match-pairs-progress">
          Matched {matchedPairs.length}/{words.length}
        </div>
        <div className="match-pairs-step">{stepLabel}</div>
      </div>

      {selectedLeft && (
        <div className="match-pairs-selected">
          <div className="match-pairs-selected-label">Selected word</div>
          <div className="match-pairs-selected-value">{selectedLeft.text}</div>
          <button className="match-pairs-clear" onClick={() => setSelectedLeft(null)} type="button">
            Change
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`match-pairs-feedback ${feedback.type}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {feedback.message}
        </div>
      )}

      <div className={`match-pairs-panels${selectedLeft ? ' step-2' : ' step-1'}`}>
        <div className="match-panel">
          <div className="match-panel-title">Words</div>
          <div className="match-panel-list">
            {remainingLeftItems.map((item) => (
              <button
                key={`left-${item.id}`}
                className={getItemClassName(item, 'left')}
                onClick={() => handleLeftClick(item)}
                type="button"
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>

        <div className="match-panel">
          <div className="match-panel-title">Translations</div>
          <div className="match-panel-list">
            {remainingRightItems.map((item) => (
              <button
                key={`right-${item.id}`}
                className={getItemClassName(item, 'right')}
                onClick={() => handleRightClick(item)}
                type="button"
                disabled={!selectedLeft}
                aria-disabled={!selectedLeft}
              >
                {item.text}
              </button>
            ))}
          </div>
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

