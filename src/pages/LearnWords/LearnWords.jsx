import './LearnWords.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, Select, Portal, createListCollection } from '@chakra-ui/react'
import { toast } from 'sonner'
import Layout from '../../components/Layout/Layout'
import FlipCard from '../../components/FlipCard/FlipCard'
import Congratulations from '../../components/Congratulations/Congratulations'
import { getVocabularies, getAllWords } from '../../services/wordsService'
import { getLearningModes, createLearningLog } from '../../services/learningService'
import { LANGUAGE_NAMES } from '../../constants/languages'
import { LEARNING_MODES } from './constants'

export default function LearnWords() {
  const navigate = useNavigate()
  const [vocabularies, setVocabularies] = useState([])
  const [learningModes, setLearningModes] = useState([])
  const [selectedMode, setSelectedMode] = useState(LEARNING_MODES.WORD_TO_TRANSLATION.value)
  const [selectedModeId, setSelectedModeId] = useState(null)
  const [selectedVocabulary, setSelectedVocabulary] = useState([])
  const [wordCount, setWordCount] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [isLearning, setIsLearning] = useState(false)
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

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
      if (modes.length > 0) {
        // Set default mode
        const defaultMode = modes.find(m => m.code === LEARNING_MODES.WORD_TO_TRANSLATION.value) || modes[0]
        setSelectedMode(defaultMode.code)
        setSelectedModeId(defaultMode.id)
      }
    } catch (error) {
      console.error('Failed to fetch learning modes:', error)
      toast.error('Failed to load learning modes')
      // Fallback to hardcoded modes
      setLearningModes([
        { id: 1, code: LEARNING_MODES.WORD_TO_TRANSLATION.value, name: LEARNING_MODES.WORD_TO_TRANSLATION.label },
        { id: 2, code: LEARNING_MODES.TRANSLATION_TO_WORD.value, name: LEARNING_MODES.TRANSLATION_TO_WORD.label }
      ])
      setSelectedModeId(1)
    }
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleStartLearning = async () => {
    if (!selectedVocabulary || selectedVocabulary.length === 0) {
      toast.error('Please select a vocabulary')
      return
    }

    try {
      setIsLoading(true)
      const selectedCount = Math.max(1, parseInt(wordCount) || 10)
      
      // Request more words than needed for better randomization (2x)
      // This ensures we have variety even after shuffling
      const requestLimit = selectedCount * 2
      
      // Exclude words already learned today
      const fetchedWords = await getAllWords(parseInt(selectedVocabulary[0]), requestLimit, true)
      
      if (fetchedWords.length === 0) {
        toast.info('No new words available today. You\'ve already learned all words from this vocabulary today!')
        setIsLoading(false)
        return
      }

      // Shuffle the fetched words
      const shuffled = shuffleArray(fetchedWords)
      
      // Take only the requested amount (or all if less available)
      const limitedWords = shuffled.slice(0, Math.min(selectedCount, shuffled.length))
      
      setWords(limitedWords)
      setCurrentIndex(0)
      setIsLearning(true)
    } catch (error) {
      console.error('Failed to fetch words:', error)
      toast.error('Failed to load words')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExit = () => {
    setIsLearning(false)
    setShowCongratulations(false)
    setWords([])
    setCurrentIndex(0)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleNext = async () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Last word - create learning log then show congratulations
      try {
        const wordIds = words.map(w => w.id)
        await createLearningLog(
          parseInt(selectedVocabulary[0]), 
          selectedModeId,
          wordIds
        )
        setShowCongratulations(true)
      } catch (error) {
        console.error('Failed to create learning log:', error)
        // Still show congratulations even if logging fails
        toast.error('Failed to save learning progress, but great job learning!')
        setShowCongratulations(true)
      }
    }
  }

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

  const currentWord = words[currentIndex]
  const frontText = selectedMode === LEARNING_MODES.WORD_TO_TRANSLATION.value ? currentWord?.word : currentWord?.translation
  const backText = selectedMode === LEARNING_MODES.WORD_TO_TRANSLATION.value ? currentWord?.translation : currentWord?.word

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
          <div className="learning-header">
            <button className="back-button" onClick={handleExit}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Back to Selection</span>
            </button>
            <div className="word-counter">
              {currentIndex + 1} / {words.length}
            </div>
          </div>

          <div className="learning-content">
            {!isFirstWord && (
              <button className="nav-button nav-button-left" onClick={handlePrevious}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            <div className="card-wrapper">
              <FlipCard 
                key={currentIndex}
                frontText={frontText} 
                backText={backText}
              />
            </div>

            <button className="nav-button nav-button-right" onClick={handleNext}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
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
                <label className="form-label">Select Learning Mode</label>
                <div className="radio-group">
                  {learningModes.map((mode) => (
                    <label key={mode.id} className="radio-option">
                      <input
                        type="radio"
                        value={mode.code}
                        checked={selectedMode === mode.code}
                        onChange={(e) => {
                          setSelectedMode(e.target.value)
                          setSelectedModeId(mode.id)
                        }}
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

              <button className="start-button" onClick={handleStartLearning}>
                Start Learning
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

