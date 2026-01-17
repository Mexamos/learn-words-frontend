import './VocabulariesList.css'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Spinner,
  Button,
  Dialog,
  Box,
  Text,
  VStack,
  HStack,
  Input,
  Select,
  createListCollection,
} from '@chakra-ui/react'
import { toast } from 'sonner'
import Layout from '../../components/Layout/Layout'
import { getVocabularies, createVocabulary, deleteVocabulary } from '../../services/wordsService'
import { LANGUAGE_NAMES, AVAILABLE_LANGUAGES } from '../../constants/languages'

// Custom hook for form management
const useVocabularyForm = (initialState) => {
  const [formData, setFormData] = useState(initialState)

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData(initialState)
  }, [initialState])

  const isValid = useMemo(() => {
    return formData.language_from !== formData.language_to
  }, [formData.language_from, formData.language_to])

  return { formData, updateField, resetForm, isValid }
}

export default function VocabulariesList() {
  const navigate = useNavigate()
  const [vocabularies, setVocabularies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Language collection for Select components
  const languageCollection = createListCollection({
    items: AVAILABLE_LANGUAGES,
    selectionMode: 'single',
  })
  
  // Create vocabulary modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { formData, updateField, resetForm, isValid } = useVocabularyForm({
    language_from: 'en',
    language_to: 'ru',
    name: ''
  })
  
  // Delete vocabulary confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [vocabularyToDelete, setVocabularyToDelete] = useState(null)

  const fetchVocabularies = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getVocabularies()
      setVocabularies(data)
    } catch (error) {
      console.error('Failed to fetch vocabularies:', error)
      toast.error('Failed to load vocabularies')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVocabularies()
  }, [fetchVocabularies])

  const handleVocabularyClick = useCallback((vocabularyId) => {
    navigate(`/vocabularies/${vocabularyId}`)
  }, [navigate])

  const getLanguageName = useCallback((code) => {
    return LANGUAGE_NAMES[code] || code.toUpperCase()
  }, [])

  const handleCreateModalClose = useCallback(() => {
    setIsCreateOpen(false)
    resetForm()
  }, [resetForm])

  const handleCreateVocabulary = useCallback(async () => {
    if (!isValid) {
      toast.error('Source and target languages must be different')
      return
    }

    try {
      setIsCreating(true)
      await createVocabulary({
        language_from: formData.language_from,
        language_to: formData.language_to,
        name: formData.name || undefined
      })
      toast.success('Vocabulary created successfully')
      handleCreateModalClose()
      await fetchVocabularies()
    } catch (error) {
      console.error('Failed to create vocabulary:', error)
      toast.error('Failed to create vocabulary')
    } finally {
      setIsCreating(false)
    }
  }, [isValid, formData, handleCreateModalClose, fetchVocabularies])

  const handleDeleteClick = useCallback((e, vocabulary) => {
    e.stopPropagation()
    setVocabularyToDelete(vocabulary)
    setIsDeleteOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!vocabularyToDelete) return
    
    try {
      setIsDeleting(true)
      await deleteVocabulary(vocabularyToDelete.id)
      toast.success('Vocabulary deleted successfully')
      setIsDeleteOpen(false)
      setVocabularyToDelete(null)
      await fetchVocabularies()
    } catch (error) {
      console.error('Failed to delete vocabulary:', error)
      toast.error('Failed to delete vocabulary')
    } finally {
      setIsDeleting(false)
    }
  }, [vocabularyToDelete, fetchVocabularies])

  return (
    <Layout pageTitle="My Vocabularies">
      <div className="vocabularies-list-container">
        {/* Header with Create button */}
        <div className="vocabularies-header">
          <Button colorPalette="blue" onClick={() => setIsCreateOpen(true)}>
            Create Vocabulary
          </Button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="loading-state">
            <Spinner size="xl" />
            <p className="loading-text">Loading vocabularies...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && vocabularies.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-text">You don't have any vocabularies yet</div>
            <div className="empty-state-subtext">
              Add words through "Add new words", and a vocabulary will be created automatically
            </div>
          </div>
        )}

        {/* Vocabularies grid */}
        {!isLoading && vocabularies.length > 0 && (
          <div className="vocabularies-grid">
            {vocabularies.map((vocab) => (
              <div
                key={vocab.id}
                className="vocabulary-card"
                onClick={() => handleVocabularyClick(vocab.id)}
              >
                <button
                  className="vocabulary-delete-btn"
                  onClick={(e) => handleDeleteClick(e, vocab)}
                  aria-label="Delete vocabulary"
                >
                  ✕
                </button>
                <div className="vocabulary-card-name">{vocab.name}</div>
                <div className="vocabulary-card-languages">
                  <span>{getLanguageName(vocab.language_from)}</span>
                  <span className="vocabulary-card-arrow">→</span>
                  <span>{getLanguageName(vocab.language_to)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Vocabulary Modal */}
      <Dialog.Root open={isCreateOpen} onOpenChange={(e) => e.open ? setIsCreateOpen(true) : handleCreateModalClose()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content 
            maxW={{ base: 'full', sm: '95vw', md: '500px' }}
            maxH={{ base: '100vh', md: 'auto' }}
            borderRadius={{ base: 0, md: 'md' }}
            m={{ base: 0, md: 4 }}
          >
            <Dialog.Header>
              <Dialog.Title>Create New Vocabulary</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger />

            <Dialog.Body>
              <VStack alignItems="stretch" gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Language From
                  </Text>
                  <Select.Root
                    collection={languageCollection}
                    value={[formData.language_from]}
                    onValueChange={(e) => updateField('language_from', e.value[0])}
                    width="100%"
                    disabled={isCreating}
                    positioning={{ sameWidth: true }}
                  >
                    <Select.Control bg="white">
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>

                    <Select.Positioner>
                      <Select.Content>
                        {languageCollection.items.map((lang) => (
                          <Select.Item item={lang} key={lang.value}>
                            {lang.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Language To
                  </Text>
                  <Select.Root
                    collection={languageCollection}
                    value={[formData.language_to]}
                    onValueChange={(e) => updateField('language_to', e.value[0])}
                    width="100%"
                    disabled={isCreating}
                    positioning={{ sameWidth: true }}
                  >
                    <Select.Control bg="white">
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>

                    <Select.Positioner>
                      <Select.Content>
                        {languageCollection.items.map((lang) => (
                          <Select.Item item={lang} key={lang.value}>
                            {lang.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Box>

                {!isValid && (
                  <Text color="red.500" fontSize="sm">
                    Source and target languages must be different
                  </Text>
                )}

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Name (Optional)
                  </Text>
                  <Input
                    placeholder="e.g., Travel Vocabulary"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    disabled={isCreating}
                  />
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3}>
                <Button variant="outline" onClick={handleCreateModalClose} disabled={isCreating}>
                  Cancel
                </Button>
                <Button
                  colorPalette="blue"
                  onClick={handleCreateVocabulary}
                  loading={isCreating}
                  disabled={!isValid || isCreating}
                >
                  Create
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root 
        open={isDeleteOpen} 
        onOpenChange={(e) => !isDeleting && setIsDeleteOpen(e.open)}
        closeOnInteractOutside={!isDeleting}
        closeOnEscape={!isDeleting}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content 
            maxW={{ base: 'full', sm: '95vw', md: '500px' }}
            maxH={{ base: '100vh', md: 'auto' }}
            borderRadius={{ base: 0, md: 'md' }}
            m={{ base: 0, md: 4 }}
          >
            <Dialog.Header>
              <Dialog.Title>Delete Vocabulary</Dialog.Title>
            </Dialog.Header>
            {!isDeleting && <Dialog.CloseTrigger />}

            <Dialog.Body>
              <Text>
                Are you sure you want to delete "{vocabularyToDelete?.name}"? This will also delete all words in this vocabulary.
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={3}>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteOpen(false)} 
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="red"
                  onClick={handleConfirmDelete}
                  loading={isDeleting}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Layout>
  )
}

