import { Dialog as ChakraDialog } from '@chakra-ui/react'
import { forwardRef } from 'react'

export const DialogRoot = ChakraDialog.Root
export const DialogBackdrop = ChakraDialog.Backdrop
export const DialogTrigger = ChakraDialog.Trigger
export const DialogCloseTrigger = ChakraDialog.CloseTrigger
export const DialogPositioner = ChakraDialog.Positioner

export const DialogContent = forwardRef(function DialogContent(props, ref) {
  return <ChakraDialog.Content ref={ref} {...props} />
})

export const DialogHeader = forwardRef(function DialogHeader(props, ref) {
  return <ChakraDialog.Header ref={ref} {...props} />
})

export const DialogTitle = forwardRef(function DialogTitle(props, ref) {
  return <ChakraDialog.Title ref={ref} {...props} />
})

export const DialogDescription = forwardRef(function DialogDescription(props, ref) {
  return <ChakraDialog.Description ref={ref} {...props} />
})

export const DialogBody = forwardRef(function DialogBody(props, ref) {
  return <ChakraDialog.Body ref={ref} {...props} />
})

export const DialogFooter = forwardRef(function DialogFooter(props, ref) {
  return <ChakraDialog.Footer ref={ref} {...props} />
})

export const DialogActionTrigger = forwardRef(function DialogActionTrigger(props, ref) {
  return <ChakraDialog.ActionTrigger ref={ref} {...props} />
})

