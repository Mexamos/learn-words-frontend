import './LearnWords.css'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, Select, Portal, createListCollection } from '@chakra-ui/react'
import { toast } from 'sonner'
import Layout from '../../components/Layout/Layout'
import FlipCard from '../../components/FlipCard/FlipCard'
import SelectCorrectAnswer from '../../components/SelectCorrectAnswer/SelectCorrectAnswer'
import MatchPairs from '../../components/MatchPairs/MatchPairs'
import MakeWord from '../../components/MakeWord/MakeWord'
import Congratulations from '../../components/Congratulations/Congratulations'
import LearningHeader from './components/LearningHeader'
import NavigationButtons from './components/NavigationButtons'
import { getVocabularies, getAllWords } from '../../services/wordsService'
import { getLearningModes, createLearningLog } from '../../services/learningService'
import { LANGUAGE_NAMES } from '../../constants/languages'
import { LEARNING_MODES, WORD_FETCH_MULTIPLIER } from './constants'
import { shuffleArray } from '../../utils/helpers'

export default function LearnWords() {
  const navigate = useNavigate()
  const [vocabularies, setVocabularies] = useState([])
  const [learningModes, setLearningModes] = useState([])
  const [selectedModes, setSelectedModes] = useState([])
  const [selectedModeIds, setSelectedModeIds] = useState([])
  const [currentModeIndex, setCurrentModeIndex] = useState(0)
  const [selectedVocabulary, setSelectedVocabulary] = useState([])
  const [wordCount, setWordCount] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [isLearning, setIsLearning] = useState(false)
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modeResults, setModeResults] = useState({})
  const [wordOptions, setWordOptions] = useState({})
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [allModesCompleted, setAllModesCompleted] = useState(false)

  useEffect(() => {
    fetchVocabularies()
    fetchLearningModes()
  }, [])

  const fetchVocabularies = async () => {
    try {
      setIsLoading(true)
      const data = await getVocabularies()
      setVocabularies(data)
      if (data.length > 0) {
        setSelectedVocabulary([data[0].id.toString()])
      }
    } catch (error) {
      console.error('Failed to fetch vocabularies:', error)
      toast.error('Failed to load vocabularies')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLearningModes = async () => {
    try {
      const modes = await getLearningModes()
      setLearningModes(modes)
    } catch (error) {
      console.error('Failed to fetch learning modes:', error)
      toast.error('Failed to load learning modes')
    }
  }

  const handleStartLearning = async () => {
    if (!selectedVocabulary || selectedVocabulary.length === 0) {
      toast.error('Please select a vocabulary')
      return
    }

    try {
      setIsLoading(true)
      const selectedCount = Math.max(1, parseInt(wordCount) || 10)
      
      // Request more words than needed for better randomization
      // This ensures we have variety even after shuffling
      const requestLimit = selectedCount * WORD_FETCH_MULTIPLIER
      let fetchedWords = await getAllWords(parseInt(selectedVocabulary[0]), requestLimit, true)
      if (fetchedWords.length === 0) {
        fetchedWords = await getAllWords(parseInt(selectedVocabulary[0]), requestLimit, false)
      }

      if (fetchedWords.length === 0) {
        toast.error('This vocabulary has no words. Please add some words first.')
        setIsLoading(false)
        return
      }

      // Shuffle the fetched words
      const shuffled = shuffleArray(fetchedWords)
      
      // Take only the requested amount (or all if less available)
      const limitedWords = shuffled.slice(0, Math.min(selectedCount, shuffled.length))
      
      setWords(limitedWords)
      setCurrentIndex(0)
      setModeResults({})
      setWordOptions({}) // Reset options when starting new session
      setIsLearning(true)
    } catch (error) {
      console.error('Failed to fetch words:', error)
      toast.error('Failed to load words')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeToggle = useCallback((mode, checked) => {
    if (checked) {
      setSelectedModes(prev => [...prev, mode.code])
      setSelectedModeIds(prev => [...prev, mode.id])
    } else {
      setSelectedModes(prev => prev.filter(m => m !== mode.code))
      setSelectedModeIds(prev => prev.filter(id => id !== mode.id))
    }
  }, [])

  const createFinalLearningLog = useCallback(async () => {
    try {
      const aggregatedResults = words.map(word => {
        let isCorrectInAllModes = true
        for (const modeCode of selectedModes) {
          const modeResult = modeResults[modeCode]
          const wordResult = modeResult?.[word.id]
          
          if (!wordResult || !wordResult.isCorrect) {
            isCorrectInAllModes = false
            break
          }
        }

        return {
          word_id: word.id,
          is_correct: isCorrectInAllModes
        }
      })

      await createLearningLog(
        parseInt(selectedVocabulary[0]),
        selectedModeIds,
        aggregatedResults
      )
      setShowCongratulations(true)
      setAllModesCompleted(false)
    } catch (error) {
      console.error('Failed to create learning logs:', error)
      toast.error('Failed to save learning progress')
      setShowCongratulations(true)
      setAllModesCompleted(false)
    }
  }, [words, selectedModes, selectedModeIds, modeResults, selectedVocabulary])
  
  useEffect(() => {
    if (allModesCompleted && Object.keys(modeResults).length === selectedModes.length) {
      createFinalLearningLog()
    }
  }, [allModesCompleted, modeResults, selectedModes.length, createFinalLearningLog])

  const handleExit = useCallback(() => {
    setIsLearning(false)
    setShowCongratulations(false)
    setWords([])
    setCurrentIndex(0)
    setCurrentModeIndex(0)
    setModeResults({})
    setWordOptions({})
    setIsTransitioning(false)
    setAllModesCompleted(false)
  }, [])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const currentModeCode = selectedModes[currentModeIndex] || ''

  const handleNext = useCallback(async () => {
    if (isTransitioning) {
      return
    }

    // For FlipCard modes (word-to-translation, translation-to-word), mark current word as viewed
    const isFlipCardMode = currentModeCode === LEARNING_MODES.WORD_TO_TRANSLATION.value || 
                           currentModeCode === LEARNING_MODES.TRANSLATION_TO_WORD.value

    const word = words[currentIndex]
    if (isFlipCardMode && word) {
      const currentModeResults = modeResults[currentModeCode] || {}
      if (!currentModeResults[word.id]) {
        setModeResults(prev => ({
          ...prev,
          [currentModeCode]: {
            ...(prev[currentModeCode] || {}),
            [word.id]: {
              isCorrect: true,
              isAnswered: true
            }
          }
        }))
      }
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsTransitioning(true)
      
      // Check if there are more modes to complete
      if (currentModeIndex < selectedModes.length - 1) {
        // More modes to go - show toast and transition
        const nextMode = learningModes.find(m => m.code === selectedModes[currentModeIndex + 1])
        toast.info(`Moving to mode ${currentModeIndex + 2}/${selectedModes.length}: ${nextMode?.name}`, {
          duration: 2000
        })
        
        setTimeout(() => {
          setCurrentModeIndex(prev => prev + 1)
          setCurrentIndex(0)
          setWordOptions({})
          setIsTransitioning(false)
        }, 2000)
      } else {
        setAllModesCompleted(true)
        setIsTransitioning(false)
      }
    }
  }, [isTransitioning, currentIndex, words, modeResults, currentModeCode, currentModeIndex, selectedModes, learningModes])

  // Generate options for select correct answer (4 options including correct answer)
  const generateSelectCorrectAnswerOptions = useCallback((currentWord, allWords) => {
    const correctAnswer = currentWord.translation
    const allTranslations = allWords.map(w => w.translation)

    const uniqueTranslations = [...new Set(allTranslations)]
    const wrongAnswers = uniqueTranslations.filter(t => t !== correctAnswer)
    const selectedWrong = wrongAnswers.length <= 3 
      ? wrongAnswers 
      : shuffleArray(wrongAnswers).slice(0, 3)
    
    const options = shuffleArray([...selectedWrong, correctAnswer])
    return options
  }, [])

  // Generate options for each word when words change (only for select-correct-answer mode)
  useEffect(() => {
    const isSelectCorrectAnswerMode = currentModeCode === LEARNING_MODES.SELECT_CORRECT_ANSWER.value
    if (isSelectCorrectAnswerMode && words.length > 0) {
      setWordOptions(prev => {
        const newOptions = {}
        words.forEach(word => {
          if (!prev[word.id]) {
            newOptions[word.id] = generateSelectCorrectAnswerOptions(word, words)
          }
        })
        if (Object.keys(newOptions).length > 0) {
          return { ...prev, ...newOptions }
        }
        return prev
      })
    }
  }, [words, currentModeCode, generateSelectCorrectAnswerOptions])

  // Current word and mode calculations
  const currentWord = words[currentIndex]
  const isSelectCorrectAnswer = currentModeCode === LEARNING_MODES.SELECT_CORRECT_ANSWER.value
  const isMatchPairs = currentModeCode === LEARNING_MODES.MATCH_PAIRS.value
  const isMakeWord = currentModeCode === LEARNING_MODES.MAKE_WORD.value
  const currentWordResult = currentWord && modeResults[currentModeCode] ? modeResults[currentModeCode][currentWord.id] : null

  // Keyboard navigation
  useEffect(() => {
    if (!isLearning) return

    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault()
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        // Only allow next if not in select-correct-answer or make-word mode, or answer is selected
        const canGoNext = (!isSelectCorrectAnswer && !isMakeWord) || (currentWordResult && currentWordResult.isAnswered)
        if (canGoNext) {
          handleNext()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleExit()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isLearning, currentIndex, isSelectCorrectAnswer, isMakeWord, currentWordResult, handleNext, handlePrevious, handleExit])

  const handleAnswerSelected = useCallback((wordId, selectedAnswer, isCorrect) => {
    setModeResults(prev => ({
      ...prev,
      [currentModeCode]: {
        ...(prev[currentModeCode] || {}),
        [wordId]: {
          selectedAnswer,
          isCorrect,
          isAnswered: true
        }
      }
    }))
  }, [currentModeCode])

  const handleMatchPairsComplete = useCallback(async (matchedPairs) => {
    if (isTransitioning) {
      return
    }
    
    setIsTransitioning(true)
    
    // Convert matched pairs to word results format
    const results = {}
    matchedPairs.forEach(pair => {
      results[pair.id] = {
        isCorrect: !pair.hasError,
        isAnswered: true
      }
    })
    
    setModeResults(prev => ({
      ...prev,
      [currentModeCode]: results
    }))
    
    // Check if there are more modes to complete
    if (currentModeIndex < selectedModes.length - 1) {
      // More modes to go - show toast and transition
      const nextMode = learningModes.find(m => m.code === selectedModes[currentModeIndex + 1])
      toast.info(`Moving to mode ${currentModeIndex + 2}/${selectedModes.length}: ${nextMode?.name}`, {
        duration: 2000
      })
      
      setTimeout(() => {
        setCurrentModeIndex(prev => prev + 1)
        setCurrentIndex(0)
        setWordOptions({})
        setIsTransitioning(false)
      }, 2000)
    } else {
      setAllModesCompleted(true)
      setIsTransitioning(false)
    }
  }, [isTransitioning, currentModeCode, currentModeIndex, selectedModes, learningModes])

  const handleMakeWordComplete = useCallback((wordId, isCorrect) => {
    setModeResults(prev => ({
      ...prev,
      [currentModeCode]: {
        ...(prev[currentModeCode] || {}),
        [wordId]: {
          isCorrect,
          isAnswered: true
        }
      }
    }))
  }, [currentModeCode])

  const handleCongratulationsClose = () => {
    handleExit()
  }

  const getLanguageName = (code) => {
    return LANGUAGE_NAMES[code] || code.toUpperCase()
  }

  const vocabularyCollection = createListCollection({
    items: vocabularies.map((vocab) => ({
      value: vocab.id.toString(),
      label: `${vocab.name} (${getLanguageName(vocab.language_from)} → ${getLanguageName(vocab.language_to)})`
    }))
  })

  const frontText = currentModeCode === LEARNING_MODES.WORD_TO_TRANSLATION.value ? currentWord?.word : currentWord?.translation
  const backText = currentModeCode === LEARNING_MODES.WORD_TO_TRANSLATION.value ? currentWord?.translation : currentWord?.word
  
  // For select correct answer mode
  const selectCorrectAnswerOptions = useMemo(() => {
    if (!isSelectCorrectAnswer || !currentWord) return []
    return wordOptions[currentWord.id] || []
  }, [isSelectCorrectAnswer, currentWord, wordOptions])

  if (isLoading) {
    return (
      <Layout pageTitle="Learn Words">
        <div className="loading-state">
          <Spinner size="xl" />
          <p style={{ marginTop: '1rem' }}>Loading...</p>
        </div>
      </Layout>
    )
  }

  if (isLearning && words.length > 0) {
    if (showCongratulations) {
      return (
        <Layout pageTitle="Learn Words" fullWidth={true}>
          <Congratulations 
            wordCount={words.length} 
            onClose={handleCongratulationsClose}
          />
        </Layout>
      )
    }

    const isFirstWord = currentIndex === 0

    return (
      <Layout pageTitle="Learn Words">
        <div className="learn-words-container">
          <LearningHeader 
            onExit={handleExit}
            currentIndex={currentIndex}
            totalWords={words.length}
            hideCounter={isMatchPairs}
            currentMode={learningModes.find(m => m.code === currentModeCode)?.name || ''}
            currentModeIndex={currentModeIndex}
            totalModes={selectedModes.length}
          />

          <div className="learning-content">
            {isMatchPairs ? (
              <MatchPairs
                words={words}
                onComplete={handleMatchPairsComplete}
              />
            ) : (
              <>
                <NavigationButtons
                  isFirstWord={isFirstWord || isMakeWord}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  isNextDisabled={(isSelectCorrectAnswer || isMakeWord) && (!currentWordResult || !currentWordResult.isAnswered)}
                />

            <div className="card-wrapper">
                  {isSelectCorrectAnswer ? (
                    <SelectCorrectAnswer
                      key={currentIndex}
                      word={currentWord?.word}
                      options={selectCorrectAnswerOptions}
                      correctAnswer={currentWord?.translation}
                      onAnswerSelected={(option, isCorrect) => 
                        handleAnswerSelected(currentWord.id, option, isCorrect)
                      }
                      selectedAnswer={currentWordResult?.selectedAnswer}
                      isAnswered={currentWordResult?.isAnswered || false}
                    />
                  ) : isMakeWord ? (
                    <MakeWord
                      key={currentIndex}
                      word={currentWord?.word}
                      translation={currentWord?.translation}
                      onAnswerComplete={(isCorrect) => 
                        handleMakeWordComplete(currentWord.id, isCorrect)
                      }
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
        </div>
      </Layout>
    )
  }

  return (
    <Layout pageTitle="Learn Words">
      <div className="learn-words-container">
        <div className="selection-screen">
          {vocabularies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <p>You don't have any vocabularies yet.</p>
              <p>Add words to create your first vocabulary.</p>
            </div>
          ) : (
            <div className="selection-form">
              <div className="form-group">
                <label className="form-label">Select Learning Modes (you can select multiple)</label>
                <div className="mode-selection-checkboxes">
                  {learningModes.map((mode) => (
                    <label key={mode.id}>
                      <input
                        type="checkbox"
                        checked={selectedModes.includes(mode.code)}
                        onChange={(e) => handleModeToggle(mode, e.target.checked)}
                      />
                      <span>{mode.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <Select.Root
                  collection={vocabularyCollection}
                  width="100%"
                  value={selectedVocabulary}
                  onValueChange={(e) => setSelectedVocabulary(e.value)}
                >
                  <Select.Label>Select Vocabulary</Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select a vocabulary" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>

                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {vocabularyCollection.items.map((vocab) => (
                          <Select.Item item={vocab} key={vocab.value}>
                            {vocab.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="word-count-input">
                  Number of Words
                </label>
                <input
                  id="word-count-input"
                  type="number"
                  className="word-count-input"
                  min="1"
                  value={wordCount}
                  onChange={(e) => {
                    setWordCount(e.target.value)
                  }}
                  onBlur={(e) => {
                    setWordCount(Math.max(1, parseInt(e.target.value) || 1))
                  }}
                  placeholder="Enter number of words"
                />
              </div>

              <button 
                className="start-button" 
                onClick={handleStartLearning}
                disabled={selectedVocabulary.length === 0 || selectedModes.length === 0}
              >
                Start Learning
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

