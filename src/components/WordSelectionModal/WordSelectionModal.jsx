import { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  Box,
  Text,
  VStack,
  HStack,
  Spinner,
  Heading,
  Icon
} from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';
import { toast } from 'sonner';
import { getVocabularies, createVocabulary, addWordsBatch } from '../../services/wordsService';
import { LANGUAGE_NAMES, DEFAULT_NATIVE_LANGUAGE } from '../../constants/languages';
import './WordSelectionModal.css';

export default function WordSelectionModal({ isOpen, onClose, words = [], language }) {
  const [selectedWords, setSelectedWords] = useState(new Set(words));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && words.length > 0) {
      setSelectedWords(new Set());
    }
  }, [isOpen, words]);

  const handleWordToggle = (word) => {
    if (isLoading) return;
    
    setSelectedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (isLoading) return;
    setSelectedWords(new Set(words));
  };

  const handleDeselectAll = () => {
    if (isLoading) return;
    setSelectedWords(new Set());
  };

  const handleSubmit = async () => {
    if (selectedWords.size === 0) {
      toast.error('Please select at least one word');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch all vocabularies
      const vocabularies = await getVocabularies();
      
      // 2. Check if vocabulary exists for this language (ISO 639-1 format)
      let vocabulary = vocabularies.find(v => v.language_from === language);
      
      // 3. If not exists, create it
      if (!vocabulary) {
        const languageName = LANGUAGE_NAMES[language] || language.toUpperCase();
        vocabulary = await createVocabulary({
          language_from: language,
          language_to: DEFAULT_NATIVE_LANGUAGE, // Default to Russian (ISO 639-1), user can configure their native_language
          name: `${languageName} Vocabulary`
        });
      }
      
      // 4. Add selected words in batch
      const wordsArray = Array.from(selectedWords);
      const addedWords = await addWordsBatch(vocabulary.id, wordsArray);
      
      const addedCount = addedWords.length;
      const duplicatesCount = selectedWords.size - addedCount;
      
      if (addedCount > 0) {
        let message = `${addedCount} word${addedCount > 1 ? 's' : ''} added successfully`;
        if (duplicatesCount > 0) {
          message += ` (${duplicatesCount} duplicate${duplicatesCount > 1 ? 's' : ''} skipped)`;
        }
        toast.success(message, {
          duration: 5000,
          closeButton: true,
        });
      } else {
        toast.info('All selected words already exist in this vocabulary', {
          duration: 5000,
          closeButton: true,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding words:', error);
      const errorMessage = error.response?.data?.detail?.message || error.message || 'Failed to add words';
      toast.error(errorMessage, {
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedWords(new Set());
      onClose();
    }
  };

  const languageName = LANGUAGE_NAMES[language] || language;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !isLoading && e.open === false && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px" className="word-selection-modal">
          <Dialog.Header>
            <VStack alignItems="flex-start" gap={1}>
              <Heading size="lg">Select Words to Learn</Heading>
              <Text fontSize="sm" color="fg.muted">
                Detected language: <strong>{languageName}</strong>
              </Text>
            </VStack>
            {!isLoading && (
              <Dialog.CloseTrigger asChild position="absolute" top="4" right="4">
                <Button variant="ghost" size="sm">
                  <Icon>
                    <LuX />
                  </Icon>
                </Button>
              </Dialog.CloseTrigger>
            )}
          </Dialog.Header>

          <Dialog.Body>
            {isLoading ? (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minH="200px"
                gap={4}
              >
                <Spinner size="xl" color="blue.500" />
                <Text color="fg.muted">Adding words to vocabulary...</Text>
              </Box>
            ) : (
              <VStack alignItems="stretch" gap={4}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="fg.muted">
                    {selectedWords.size} of {words.length} words selected
                  </Text>
                  <HStack gap={2}>
                    <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                      Deselect All
                    </Button>
                  </HStack>
                </HStack>

                <Box 
                  className="words-list-container"
                  maxH="400px" 
                  overflowY="auto" 
                  borderWidth="1px" 
                  borderRadius="md" 
                  p={2}
                >
                  <VStack alignItems="stretch" gap={0}>
                    {words.map((word, index) => {
                      const isSelected = selectedWords.has(word);
                      return (
                        <HStack
                          key={index}
                          p={3}
                          spacing={3}
                          cursor="pointer"
                          borderRadius="md"
                          bg={isSelected ? 'blue.50' : 'transparent'}
                          transition="background 0.15s ease"
                          _hover={{
                            bg: isSelected ? 'blue.100' : 'gray.50',
                          }}
                          onClick={() => handleWordToggle(word)}
                        >
                          <Box
                            w="20px"
                            h="20px"
                            borderRadius="sm"
                            borderWidth="2px"
                            borderColor={isSelected ? 'blue.500' : 'gray.300'}
                            bg={isSelected ? 'blue.500' : 'white'}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                            transition="all 0.15s ease"
                          >
                            {isSelected && (
                              <Box color="white" fontSize="xs" fontWeight="bold">
                                ✓
                              </Box>
                            )}
                          </Box>
                          <Text 
                            fontSize="md" 
                            fontWeight={isSelected ? 'semibold' : 'normal'}
                            color={isSelected ? 'blue.700' : 'gray.800'}
                          >
                            {word}
                          </Text>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Box>
              </VStack>
            )}
          </Dialog.Body>

          {!isLoading && (
            <Dialog.Footer justifyContent="center">
              <Button
                onClick={handleSubmit}
                colorScheme="blue"
                size="lg"
                disabled={selectedWords.size === 0}
              >
                Add {selectedWords.size} Word{selectedWords.size !== 1 ? 's' : ''} to Vocabulary
              </Button>
            </Dialog.Footer>
          )}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

