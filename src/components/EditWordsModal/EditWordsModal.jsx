import './EditWordsModal.css'
import { useState, useEffect } from 'react'
import { DialogRoot, DialogBackdrop, DialogPositioner, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogActionTrigger } from '../ui/dialog'
import { Button, Spinner, HStack, Select, createListCollection } from '@chakra-ui/react'

const WORD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'learning', label: 'Learning' },
  { value: 'learned', label: 'Learned' }
]

export default function EditWordsModal({ isOpen, onClose, onSave, words }) {
  const [editedWords, setEditedWords] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  const statusCollection = createListCollection({
    items: WORD_STATUSES,
    selectionMode: 'single',
  })

  useEffect(() => {
    if (words && words.length > 0) {
      // Initialize edited words with current values
      setEditedWords(
        words.map((word) => ({
          id: word.id,
          word: word.word || '',
          translation: word.translation || '',
          status: word.status || 'new',
          context: word.context || '',
          examples: Array.isArray(word.examples) ? word.examples.join('\n') : ''
        }))
      )
    }
  }, [words])

  const handleFieldChange = (index, field, value) => {
    setEditedWords((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSave = async () => {
    // Validate required fields
    const hasEmptyRequired = editedWords.some((w) => !w.word.trim() || !w.translation.trim())
    if (hasEmptyRequired) {
      alert('Word and translation are required fields')
      return
    }

    try {
      setIsSaving(true)
      // Convert examples back to array
      const updates = editedWords.map((w) => ({
        id: w.id,
        word: w.word.trim(),
        translation: w.translation.trim(),
        status: w.status,
        context: w.context.trim() || null,
        examples: w.examples ? w.examples.split('\n').map((ex) => ex.trim()).filter(Boolean) : []
      }))
      await onSave(updates)
      onClose()
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenChange = (details) => {
    if (!isSaving && !details.open) {
      onClose()
    }
  }

  return (
    <DialogRoot 
      open={isOpen} 
      onOpenChange={handleOpenChange}
      size="xl"
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent 
          maxW={{ base: 'full', sm: '95vw', md: '700px' }}
          maxH={{ base: '100vh', md: 'auto' }}
          borderRadius={{ base: 0, md: 'md' }}
          m={{ base: 0, md: 4 }}
        >
          <DialogHeader>
            <DialogTitle>Edit Words ({editedWords.length})</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="edit-words-modal-content">
              {editedWords.map((word, index) => (
                <div key={word.id} className="edit-word-item">
                  <div>
                    <label className="edit-word-label">
                      Word <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="edit-word-input"
                      value={word.word}
                      onChange={(e) => handleFieldChange(index, 'word', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="edit-word-label">
                      Translation <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="edit-word-input"
                      value={word.translation}
                      onChange={(e) => handleFieldChange(index, 'translation', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="edit-word-label">Status</label>
                    <Select.Root
                      collection={statusCollection}
                      value={[word.status]}
                      onValueChange={(e) => handleFieldChange(index, 'status', e.value[0])}
                      width="100%"
                      disabled={isSaving}
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
                          {statusCollection.items.map((status) => (
                            <Select.Item item={status} key={status.value}>
                              {status.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  </div>

                  <div>
                    <label className="edit-word-label">Examples (one per line)</label>
                    <textarea
                      className="edit-word-textarea"
                      value={word.examples}
                      onChange={(e) => handleFieldChange(index, 'examples', e.target.value)}
                      disabled={isSaving}
                      placeholder="Example 1
Example 2
Example 3"
                    />
                  </div>

                  <div>
                    <label className="edit-word-label">Context</label>
                    <textarea
                      className="edit-word-textarea"
                      value={word.context}
                      onChange={(e) => handleFieldChange(index, 'context', e.target.value)}
                      disabled={isSaving}
                      placeholder="Optional context for this word..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="edit-words-modal-footer">
              <HStack gap={3} className="edit-words-buttons-container">
                <DialogActionTrigger asChild>
                  <Button variant="outline" disabled={isSaving} onClick={onClose}>
                    Cancel
                  </Button>
                </DialogActionTrigger>
                <Button colorPalette="blue" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Spinner size="sm" mr={2} /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </HStack>
            </div>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

