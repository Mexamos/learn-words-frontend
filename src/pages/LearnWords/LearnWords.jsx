import './LearnWords.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner, Select, Portal, createListCollection } from '@chakra-ui/react'
import { toast } from 'sonner'
import Layout from '../../components/Layout/Layout'
import FlipCard from '../../components/FlipCard/FlipCard'
import Congratulations from '../../components/Congratulations/Congratulations'
import { getVocabularies, getAllWords } from '../../services/wordsService'
import { LANGUAGE_NAMES } from '../../constants/languages'
import { LEARNING_MODES } from './constants'

export default function LearnWords() {
  const navigate = useNavigate()
  const [vocabularies, setVocabularies] = useState([])
  const [selectedMode, setSelectedMode] = useState(LEARNING_MODES.WORD_TO_TRANSLATION.value)
  const [selectedVocabulary, setSelectedVocabulary] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLearning, setIsLearning] = useState(false)
  const [showCongratulations, setShowCongratulations] = useState(false)
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchVocabularies()
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
      const allWords = await getAllWords(parseInt(selectedVocabulary[0]))
      
      if (allWords.length === 0) {
        toast.error('No words in this vocabulary')
        setIsLoading(false)
        return
      }

      const shuffled = shuffleArray(allWords)
      setWords(shuffled)
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

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      // Last word - show congratulations
      setShowCongratulations(true)
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
        <Layout pageTitle="Learn Words">
          <Congratulations 
            wordCount={words.length} 
            onClose={handleCongratulationsClose}
          />
        </Layout>
      )
    }

    const isFirstWord = currentIndex === 0
    const isLastWord = currentIndex === words.length - 1

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
                  <label className="radio-option">
                    <input
                      type="radio"
                      value={LEARNING_MODES.WORD_TO_TRANSLATION.value}
                      checked={selectedMode === LEARNING_MODES.WORD_TO_TRANSLATION.value}
                      onChange={(e) => setSelectedMode(e.target.value)}
                    />
                    <span>{LEARNING_MODES.WORD_TO_TRANSLATION.label}</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      value={LEARNING_MODES.TRANSLATION_TO_WORD.value}
                      checked={selectedMode === LEARNING_MODES.TRANSLATION_TO_WORD.value}
                      onChange={(e) => setSelectedMode(e.target.value)}
                    />
                    <span>{LEARNING_MODES.TRANSLATION_TO_WORD.label}</span>
                  </label>
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

