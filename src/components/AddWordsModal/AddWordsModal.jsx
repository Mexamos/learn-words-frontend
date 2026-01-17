import './AddWordsModal.css'
import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  Button,
  HStack,
  Input,
} from '@chakra-ui/react'
import { toast } from 'sonner'
import { translateWordsPreview } from '../../services/wordsService'

export default function AddWordsModal({ isOpen, onClose, onAdd, vocabulary }) {
  const [wordPairs, setWordPairs] = useState([{ word: '', translation: '' }])
  const [isAdding, setIsAdding] = useState(false)
  const [translatingIndex, setTranslatingIndex] = useState(null)

  const handleClose = useCallback(() => {
    setWordPairs([{ word: '', translation: '' }])
    onClose()
  }, [onClose])

  // Add new empty row when last row's word field is filled
  useEffect(() => {
    const lastPair = wordPairs[wordPairs.length - 1]
    if (lastPair.word.trim()) {
      setWordPairs(prev => [...prev, { word: '', translation: '' }])
    }
  }, [wordPairs])

  const handleWordChange = useCallback((index, value) => {
    setWordPairs(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], word: value }
      
      // Remove empty rows except the last one
      const filtered = updated.filter((pair, idx) => {
        if (idx === updated.length - 1) return true // Keep last row
        return pair.word.trim() || pair.translation.trim() // Keep non-empty rows
      })
      
      return filtered
    })
  }, [])

  const handleTranslationChange = useCallback((index, value) => {
    setWordPairs(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], translation: value }
      return updated
    })
  }, [])

  const handleWordBlur = useCallback(async (index) => {
    const pair = wordPairs[index]
    
    // Only auto-translate if word is filled and translation is empty
    if (pair.word.trim() && !pair.translation.trim()) {
      try {
        setTranslatingIndex(index)
        const translations = await translateWordsPreview(
          [pair.word.trim()],
          vocabulary.language_from,
          vocabulary.language_to
        )
        
        if (translations.length > 0) {
          setWordPairs(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], translation: translations[0].translation }
            return updated
          })
        }
      } catch (error) {
        console.error('Failed to auto-translate word:', error)
        // Silently fail - user can manually enter translation
      } finally {
        setTranslatingIndex(null)
      }
    }
  }, [wordPairs, vocabulary])

  const handleAddWords = useCallback(async () => {
    // Filter out empty pairs
    const filledPairs = wordPairs.filter(pair => pair.word.trim())
    
    if (filledPairs.length === 0) {
      toast.error('Please enter at least one word')
      return
    }

    // Check if any word is missing translation
    const wordsWithoutTranslation = filledPairs.filter(pair => !pair.translation.trim())
    
    if (wordsWithoutTranslation.length > 0) {
      // Auto-translate missing translations
      try {
        setIsAdding(true)
        const wordsToTranslate = wordsWithoutTranslation.map(pair => pair.word)
        const translations = await translateWordsPreview(
          wordsToTranslate,
          vocabulary.language_from,
          vocabulary.language_to
        )
        
        // Merge translations
        const translationMap = new Map(translations.map(t => [t.word, t.translation]))
        const finalPairs = filledPairs.map(pair => ({
          word: pair.word.trim(),
          translation: pair.translation.trim() || translationMap.get(pair.word.trim()) || ''
        }))
        
        await onAdd(finalPairs)
        handleClose()
      } catch (error) {
        console.error('Failed to translate words:', error)
        toast.error('Failed to translate words')
      } finally {
        setIsAdding(false)
      }
    } else {
      // All translations are filled
      try {
        setIsAdding(true)
        const finalPairs = filledPairs.map(pair => ({
          word: pair.word.trim(),
          translation: pair.translation.trim()
        }))
        await onAdd(finalPairs)
        handleClose()
      } catch (error) {
        console.error('Error adding words:', error)
      } finally {
        setIsAdding(false)
      }
    }
  }, [wordPairs, vocabulary, onAdd, handleClose])

  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={(e) => !isAdding && e.open === false && handleClose()}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content 
          maxW={{ base: 'full', sm: '95vw', md: '700px' }}
          maxH={{ base: '100vh', md: 'auto' }}
          borderRadius={{ base: 0, md: 'md' }}
          m={{ base: 0, md: 4 }}
        >
          <Dialog.Header>
            <Dialog.Title>Add New Words</Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger disabled={isAdding} />

          <Dialog.Body>
            <div className="add-words-container">
              <div className="add-words-info">
                Translation: {vocabulary.language_from.toUpperCase()} → {vocabulary.language_to.toUpperCase()}
              </div>
              <div className="word-pairs-list">
                {wordPairs.map((pair, index) => (
                  <div key={index} className="word-pair-row">
                    <Input
                      placeholder="Word"
                      value={pair.word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      onBlur={() => handleWordBlur(index)}
                      disabled={isAdding}
                      className="word-input"
                    />
                    <Input
                      placeholder="Translation"
                      value={pair.translation}
                      onChange={(e) => handleTranslationChange(index, e.target.value)}
                      disabled={isAdding || translatingIndex === index}
                      className="translation-input"
                    />
                    {translatingIndex === index && (
                      <span className="translating-indicator">⏳</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack gap={3}>
              <Button variant="outline" onClick={handleClose} disabled={isAdding}>
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleAddWords}
                loading={isAdding}
                disabled={isAdding || wordPairs.every(pair => !pair.word.trim())}
              >
                {isAdding ? 'Adding...' : `Add Words`}
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

