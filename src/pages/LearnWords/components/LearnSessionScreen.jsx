import PropTypes from 'prop-types'

import LearningShell from './LearningShell'
import LearningHeader from './LearningHeader'
import LearningBottomBar from './LearningBottomBar'

import FlipCard from '../../../components/FlipCard/FlipCard'
import SelectCorrectAnswer from '../../../components/SelectCorrectAnswer/SelectCorrectAnswer'
import MatchPairs from '../../../components/MatchPairs/MatchPairs'
import MakeWord from '../../../components/MakeWord/MakeWord'
import { LEARNING_MODES } from '../constants'

export default function LearnSessionScreen({
  words,
  currentIndex,
  currentModeIndex,
  selectedModes,
  learningModes,
  currentModeCode,
  isMatchPairs,
  isSelectCorrectAnswer,
  isMakeWord,
  currentWord,
  currentWordResult,
  selectCorrectAnswerOptions,
  frontText,
  backText,
  onExit,
  onPrevious,
  onNext,
  onMatchPairsComplete,
  onAnswerSelected,
  onMakeWordComplete
}) {
  const currentModeName = learningModes.find((m) => m.code === currentModeCode)?.name || ''
  const isFirstWord = currentIndex === 0
  const canGoPrevious = !isMatchPairs && !isMakeWord && !isFirstWord
  const isNextDisabled =
    !isMatchPairs &&
    (isSelectCorrectAnswer || isMakeWord) &&
    (!currentWordResult || !currentWordResult.isAnswered)

  return (
    <LearningShell
      header={
        <LearningHeader
          onExit={onExit}
          currentIndex={currentIndex}
          totalWords={words.length}
          hideCounter={isMatchPairs}
          currentMode={currentModeName}
          currentModeIndex={currentModeIndex}
          totalModes={selectedModes.length}
        />
      }
      footer={
        isMatchPairs ? null : (
          <LearningBottomBar
            onPrevious={onPrevious}
            onNext={onNext}
            canGoPrevious={canGoPrevious}
            isNextDisabled={isNextDisabled}
          />
        )
      }
    >
      <div className="learning-content">
        {isMatchPairs ? (
          <MatchPairs words={words} onComplete={onMatchPairsComplete} />
        ) : (
          <>
            <div className="card-wrapper">
              {isSelectCorrectAnswer ? (
                <SelectCorrectAnswer
                  key={currentIndex}
                  word={currentWord?.word}
                  options={selectCorrectAnswerOptions}
                  correctAnswer={currentWord?.translation}
                  onAnswerSelected={(option, isCorrect) =>
                    onAnswerSelected(currentWord.id, option, isCorrect)
                  }
                  selectedAnswer={currentWordResult?.selectedAnswer}
                  isAnswered={currentWordResult?.isAnswered || false}
                />
              ) : isMakeWord ? (
                <MakeWord
                  key={currentIndex}
                  word={currentWord?.word}
                  translation={currentWord?.translation}
                  onAnswerComplete={(isCorrect) => onMakeWordComplete(currentWord.id, isCorrect)}
                />
              ) : (
                <FlipCard
                  key={currentIndex}
                  frontText={frontText}
                  backText={backText}
                />
              )}
            </div>
          </>
        )}
      </div>
    </LearningShell>
  )
}

LearnSessionScreen.propTypes = {
  words: PropTypes.array.isRequired,
  currentIndex: PropTypes.number.isRequired,
  currentModeIndex: PropTypes.number.isRequired,
  selectedModes: PropTypes.array.isRequired,
  learningModes: PropTypes.array.isRequired,
  currentModeCode: PropTypes.oneOf(Object.values(LEARNING_MODES).map((m) => m.value))
    .isRequired,
  isMatchPairs: PropTypes.bool.isRequired,
  isSelectCorrectAnswer: PropTypes.bool.isRequired,
  isMakeWord: PropTypes.bool.isRequired,
  currentWord: PropTypes.object,
  currentWordResult: PropTypes.object,
  selectCorrectAnswerOptions: PropTypes.array.isRequired,
  frontText: PropTypes.string,
  backText: PropTypes.string,
  onExit: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onMatchPairsComplete: PropTypes.func.isRequired,
  onAnswerSelected: PropTypes.func.isRequired,
  onMakeWordComplete: PropTypes.func.isRequired
}

