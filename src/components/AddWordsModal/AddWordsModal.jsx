import './AddWordsModal.css'
import { useState, useCallback } from 'react'
import {
  Dialog,
  Button,
  VStack,
  HStack,
  Text,
  Textarea,
  Input,
  Spinner,
} from '@chakra-ui/react'
import { toast } from 'sonner'
import { translateWordsPreview } from '../../services/wordsService'

export default function AddWordsModal({ isOpen, onClose, onAdd, vocabulary }) {
  const [step, setStep] = useState(1)
  const [inputWords, setInputWords] = useState('')
  const [translatedWords, setTranslatedWords] = useState([])
  const [isTranslating, setIsTranslating] = useState(false)

  const handleClose = useCallback(() => {
    setStep(1)
    setInputWords('')
    setTranslatedWords([])
    onClose()
  }, [onClose])

  const handleTranslateAndPreview = useCallback(async () => {
    // Parse words from textarea (one per line)
    const words = inputWords
      .split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 0)

    if (words.length === 0) {
      toast.error('Please enter at least one word')
      return
    }

    try {
      setIsTranslating(true)
      const translations = await translateWordsPreview(
        words,
        vocabulary.language_from,
        vocabulary.language_to
      )
      setTranslatedWords(translations)
      setStep(2)
    } catch (error) {
      console.error('Failed to translate words:', error)
      toast.error('Failed to translate words')
    } finally {
      setIsTranslating(false)
    }
  }, [inputWords, vocabulary])

  const handleTranslationChange = useCallback((index, newTranslation) => {
    setTranslatedWords(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], translation: newTranslation }
      return updated
    })
  }, [])

  const handleAddWords = useCallback(async () => {
    try {
      await onAdd(translatedWords)
      handleClose()
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error in AddWordsModal:', error)
    }
  }, [translatedWords, onAdd, handleClose])

  const handleBack = useCallback(() => {
    setStep(1)
  }, [])

  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={(e) => !isTranslating && e.open === false && handleClose()}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="700px">
          <Dialog.Header>
            <Dialog.Title>
              {step === 1 ? 'Add New Words' : 'Review Translations'}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger disabled={isTranslating} />

          <Dialog.Body>
            {step === 1 ? (
              <VStack alignItems="stretch" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Enter words you want to add (one per line):
                </Text>
                <Textarea
                  placeholder="word1&#10;word2&#10;word3"
                  value={inputWords}
                  onChange={(e) => setInputWords(e.target.value)}
                  minHeight="200px"
                  disabled={isTranslating}
                />
                <Text fontSize="xs" color="gray.500">
                  Translation: {vocabulary.language_from.toUpperCase()} → {vocabulary.language_to.toUpperCase()}
                </Text>
              </VStack>
            ) : (
              <VStack alignItems="stretch" gap={4}>
                <Text fontSize="sm" color="gray.600">
                  Review and edit translations before adding:
                </Text>
                <div className="translations-table-container">
                  <table className="translations-table">
                    <thead>
                      <tr>
                        <th>Word</th>
                        <th>Translation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {translatedWords.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <span className="word-text">{item.word}</span>
                          </td>
                          <td>
                            <Input
                              value={item.translation}
                              onChange={(e) => handleTranslationChange(index, e.target.value)}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </VStack>
            )}
          </Dialog.Body>

          <Dialog.Footer>
            {step === 1 ? (
              <HStack gap={3}>
                <Button variant="outline" onClick={handleClose} disabled={isTranslating}>
                  Cancel
                </Button>
                <Button
                  colorPalette="blue"
                  onClick={handleTranslateAndPreview}
                  loading={isTranslating}
                  disabled={isTranslating || !inputWords.trim()}
                >
                  {isTranslating ? 'Translating...' : 'Translate & Preview'}
                </Button>
              </HStack>
            ) : (
              <HStack gap={3}>
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  colorPalette="blue"
                  onClick={handleAddWords}
                >
                  Add {translatedWords.length} Word{translatedWords.length !== 1 ? 's' : ''}
                </Button>
              </HStack>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

