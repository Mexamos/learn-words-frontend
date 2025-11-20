import { useState } from 'react'
import { DialogRoot, DialogBackdrop, DialogPositioner, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogActionTrigger } from '../ui/dialog'
import { Button, Spinner, HStack } from '@chakra-ui/react'

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, wordCount }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (details) => {
    if (!isDeleting && !details.open) {
      onClose()
    }
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={handleOpenChange}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>
              Are you sure you want to delete <strong>{wordCount}</strong> word{wordCount !== 1 ? 's' : ''}?
            </p>
            <p style={{ marginTop: '0.5rem', color: '#718096' }}>
              This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter>
            <HStack gap={3}>
              <DialogActionTrigger asChild>
                <Button variant="outline" disabled={isDeleting} onClick={onClose}>
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button
                colorPalette="red"
                onClick={handleConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Spinner size="sm" mr={2} /> Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

