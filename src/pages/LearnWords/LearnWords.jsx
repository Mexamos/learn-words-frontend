import './LearnWords.css'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@chakra-ui/react'
import { toast } from 'sonner'
import Layout from '../../components/Layout/Layout'
import Congratulations from '../../components/Congratulations/Congratulations'
import LearnSetupScreen from './components/LearnSetupScreen'
import LearnSessionScreen from './components/LearnSessionScreen'
import { getVocabularies, getAllWords } from '../../services/wordsService'
import { getLearningModes, createLearningLog } from '../../services/learningService'
import { LEARNING_MODES, DEFAULT_WORD_COUNT } from './constants'
import { shuffleArray } from '../../utils/helpers'

export default function LearnWords() {
  const navigate = useNavigate()
  const [vocabularies, setVocabularies] = useState([])
  const [learningModes, setLearningModes] = useState([])
  const [selectedModes, setSelectedModes] = useState([])
  const [selectedModeIds, setSelectedModeIds] = useState([])
  const [currentModeIndex, setCurrentModeIndex] = useState(0)
  const [selectedVocabulary, setSelectedVocabulary] = useState([])
  const [wordCount, setWordCount] = useState(DEFAULT_WORD_COUNT)
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

    if (!selectedModes || selectedModes.length === 0) {
      toast.error('Please select at least one learning mode')
      return
    }

    try {
      setIsLoading(true)
      const selectedCount = Math.max(1, parseInt(wordCount))
      
      // Get words (backend will handle prioritization: review words first, then new words)
      const fetchedWords = await getAllWords(
        parseInt(selectedVocabulary[0]), selectedCount
      )

      if (fetchedWords.length === 0) {
        toast.info('No words available to learn right now. Try again tomorrow!')
        setIsLoading(false)
        return
      }
      
      setWords(fetchedWords)
      setCurrentIndex(0)
      setModeResults({})
      setWordOptions({}) // Reset options when starting new session
      setIsLearning(true)
    } catch (error) {
      console.error('Failed to fetch words:', error)
      
      // Handle 429 Too Many Requests
      if (error.response?.status === 429) {
        const detail = error.response.data.detail
        toast.error(
          `Daily limit reached! You've studied ${detail.learned_today}/${detail.daily_limit} words today.`
        )
      } else {
        toast.error('Failed to load words')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeToggle = useCallback((mode, checked) => {
    if (checked) {
      setSelectedModes(prev => {
        const updated = [...prev, mode.code]
        return updated.sort((a, b) => {
          const modeA = learningModes.find(m => m.code === a)
          const modeB = learningModes.find(m => m.code === b)
          return (modeA?.id || 0) - (modeB?.id || 0)
        })
      })
      setSelectedModeIds(prev => {
        const updated = [...prev, mode.id]
        return updated.sort((a, b) => a - b)
      })
    } else {
      setSelectedModes(prev => {
        const updated = prev.filter(m => m !== mode.code)
        return updated.sort((a, b) => {
          const modeA = learningModes.find(m => m.code === a)
          const modeB = learningModes.find(m => m.code === b)
          return (modeA?.id || 0) - (modeB?.id || 0)
        })
      })
      setSelectedModeIds(prev => {
        const updated = prev.filter(id => id !== mode.id)
        return updated.sort((a, b) => a - b)
      })
    }
  }, [learningModes])

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
    return (
      <Layout pageTitle="Learn Words">
        <LearnSessionScreen
          words={words}
          currentIndex={currentIndex}
          currentModeIndex={currentModeIndex}
          selectedModes={selectedModes}
          learningModes={learningModes}
          currentModeCode={currentModeCode}
          isMatchPairs={isMatchPairs}
          isSelectCorrectAnswer={isSelectCorrectAnswer}
          isMakeWord={isMakeWord}
          currentWord={currentWord}
          currentWordResult={currentWordResult}
          selectCorrectAnswerOptions={selectCorrectAnswerOptions}
          frontText={frontText}
          backText={backText}
          onExit={handleExit}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onMatchPairsComplete={handleMatchPairsComplete}
          onAnswerSelected={handleAnswerSelected}
          onMakeWordComplete={handleMakeWordComplete}
        />
      </Layout>
    )
  }

  return (
    <Layout pageTitle="Learn Words">
      <LearnSetupScreen
        vocabularies={vocabularies}
        learningModes={learningModes}
        selectedModes={selectedModes}
        selectedVocabulary={selectedVocabulary}
        wordCount={wordCount}
        onModeToggle={handleModeToggle}
        onVocabularyChange={setSelectedVocabulary}
        onWordCountChange={(e) => setWordCount(e.target.value)}
        onWordCountBlur={(e) => setWordCount(Math.max(1, parseInt(e.target.value) || 1))}
        onStartLearning={handleStartLearning}
      />
    </Layout>
  )
}

