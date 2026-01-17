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
  Icon,
  Input
} from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';
import { toast } from 'sonner';
import { getVocabularies, createVocabulary, addWordsBatch, addWordsWithTranslations } from '../../services/wordsService';
import { LANGUAGE_NAMES, DEFAULT_NATIVE_LANGUAGE } from '../../constants/languages';
import './WordSelectionModal.css';

export default function WordSelectionModal({ isOpen, onClose, words = [], language }) {
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [editableWords, setEditableWords] = useState([]);

  useEffect(() => {
    if (isOpen && words.length > 0) {
      setSelectedWords(new Set());
      // Initialize editable words with original data
      const initialEditableWords = words.map(wordObj => ({
        word: typeof wordObj === 'string' ? wordObj : wordObj.word,
        translation: typeof wordObj === 'object' ? wordObj.translation || '' : ''
      }));
      setEditableWords(initialEditableWords);
    }
  }, [isOpen, words]);

  const handleWordToggle = (index) => {
    if (isLoading) return;
    
    setSelectedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (isLoading) return;
    // Use indices instead of word texts
    const indices = words.map((_, index) => index);
    setSelectedWords(new Set(indices));
  };

  const handleDeselectAll = () => {
    if (isLoading) return;
    setSelectedWords(new Set());
  };

  const handleWordChange = (index, field, value) => {
    setEditableWords(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
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
      const selectedWordObjs = Array.from(selectedWords).map(index => editableWords[index]);
      
      // Check if any selected words have translations
      const hasTranslations = selectedWordObjs.some(wordObj => 
        wordObj.translation && wordObj.translation.trim() !== ''
      );
      
      let addedWords;
      if (hasTranslations) {
        // Use endpoint for words with translations
        const wordsWithTranslations = selectedWordObjs.map(wordObj => ({
          word: wordObj.word,
          translation: wordObj.translation || ''
        }));
        addedWords = await addWordsWithTranslations(vocabulary.id, wordsWithTranslations);
      } else {
        // Use regular endpoint for words without translations  
        const wordsArray = selectedWordObjs.map(wordObj => wordObj.word);
        addedWords = await addWordsBatch(vocabulary.id, wordsArray);
      }
      
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
      setEditableWords([]);
      onClose();
    }
  };

  const languageName = LANGUAGE_NAMES[language] || language;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !isLoading && e.open === false && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content 
          maxW={{ base: 'full', sm: '95vw', md: '600px' }}
          maxH={{ base: '100vh', md: 'auto' }}
          borderRadius={{ base: 0, md: 'md' }}
          m={{ base: 0, md: 4 }}
          className="word-selection-modal"
        >
          <Dialog.Header>
            <VStack alignItems="flex-start" gap={1}>
              <Heading size="lg">Select words to add to the dictionary</Heading>
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

          <Dialog.Body className="word-selection-dialog-body">
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
              <VStack alignItems="stretch" gap={4} className="word-selection-content">
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="fg.muted">
                    {selectedWords.size} of {words.length} words selected
                  </Text>
                  <HStack gap={2} minH={"40px"}>
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
                  <VStack alignItems="stretch" gap={1}>
                    {editableWords.map((wordObj, index) => {
                      const isSelected = selectedWords.has(index);
                      
                      return (
                        <HStack
                          key={index}
                          p={3}
                          spacing={3}
                          alignItems="center"
                          borderRadius="md"
                          bg={isSelected ? 'blue.50' : 'transparent'}
                          transition="background 0.15s ease"
                          _hover={{
                            bg: isSelected ? 'blue.100' : 'gray.50',
                          }}
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
                            cursor="pointer"
                            onClick={() => handleWordToggle(index)}
                          >
                            {isSelected && (
                              <Box color="white" fontSize="xs" fontWeight="bold">
                                ✓
                              </Box>
                            )}
                          </Box>
                          
                          {/* Word input */}
                          <Input
                            value={wordObj.word}
                            onChange={(e) => handleWordChange(index, 'word', e.target.value)}
                            placeholder="Word"
                            size="sm"
                            variant="outline"
                            bg="white"
                            flex="1"
                            minW="120px"
                            fontSize="md"
                            fontWeight={isSelected ? 'semibold' : 'normal'}
                            color={isSelected ? 'blue.700' : 'gray.800'}
                            borderColor={isSelected ? 'blue.300' : 'gray.300'}
                            _focus={{
                              borderColor: 'blue.500',
                              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                            }}
                          />
                          
                          {/* Translation input */}
                          <Input
                            value={wordObj.translation}
                            onChange={(e) => handleWordChange(index, 'translation', e.target.value)}
                            placeholder="Translation (optional)"
                            size="sm"
                            variant="outline"
                            bg="white"
                            flex="1"
                            minW="120px"
                            fontSize="sm"
                            color="gray.600"
                            fontStyle="italic"
                            borderColor={isSelected ? 'blue.300' : 'gray.300'}
                            _focus={{
                              borderColor: 'blue.500',
                              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                            }}
                          />
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
                colorPalette="blue"
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

