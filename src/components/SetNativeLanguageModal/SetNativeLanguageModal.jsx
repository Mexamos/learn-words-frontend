import { useState } from 'react';
import {
  Dialog,
  Button,
  Box,
  Text,
  VStack,
  Heading,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { toast } from 'sonner';
import { AVAILABLE_LANGUAGES, DEFAULT_NATIVE_LANGUAGE } from '../../constants/languages';
import './SetNativeLanguageModal.css';

export default function SetNativeLanguageModal({ isOpen, onLanguageSet }) {
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_NATIVE_LANGUAGE);
  const [isLoading, setIsLoading] = useState(false);

  const languageCollection = createListCollection({
    items: AVAILABLE_LANGUAGES,
    selectionMode: 'single',
  });

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.value[0]);
  };

  const handleSubmit = async () => {
    if (!selectedLanguage) {
      toast.error('Please select a language');
      return;
    }

    setIsLoading(true);
    try {
      await onLanguageSet(selectedLanguage);
      toast.success('Native language set successfully', {
        duration: 3000,
        closeButton: true,
      });
    } catch (error) {
      console.error('Error setting native language:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to set native language';
      toast.error(errorMessage, {
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root 
      open={isOpen} 
      closeOnInteractOutside={false} 
      closeOnEscape={false}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content 
          maxW={{ base: 'full', sm: '95vw', md: '500px' }}
          maxH={{ base: '100vh', md: 'auto' }}
          borderRadius={{ base: 0, md: 'md' }}
          m={{ base: 0, md: 4 }}
          className="set-native-language-modal"
        >
          <Dialog.Header>
            <VStack alignItems="flex-start" gap={2}>
              <Heading size="lg">Welcome! Set Your Native Language</Heading>
              <Text fontSize="sm" color="fg.muted">
                This will be used to translate words you're learning. You can change it later in settings.
              </Text>
            </VStack>
          </Dialog.Header>

          <Dialog.Body>
            <VStack alignItems="stretch" gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Select Your Native Language
                </Text>
                <Select.Root
                  collection={languageCollection}
                  value={[selectedLanguage]}
                  onValueChange={handleLanguageChange}
                  width="100%"
                  disabled={isLoading}
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
                      {languageCollection.items.map((language) => (
                        <Select.Item item={language} key={language.value}>
                          {language.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer justifyContent="center">
            <Button
              onClick={handleSubmit}
              colorPalette="blue"
              size="lg"
              disabled={!selectedLanguage}
              loading={isLoading}
              loadingText="Saving..."
            >
              Continue
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

