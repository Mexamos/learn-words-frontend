import './FlipCard.css'
import { useState } from 'react'

export default function FlipCard({ frontText, backText }) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="flip-card-container" onClick={handleClick}>
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="flip-card-front">
          <div className="flip-card-content">
            {frontText}
          </div>
        </div>
        <div className="flip-card-back">
          <div className="flip-card-content">
            {backText}
          </div>
        </div>
      </div>
    </div>
  )
}

