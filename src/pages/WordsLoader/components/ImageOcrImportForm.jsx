import { 
  Select, Portal, createListCollection, Box, VStack, FileUpload, Icon, Text
} from '@chakra-ui/react';
import { LuUpload } from "react-icons/lu";
import { OCR_AVAILABLE_LANGUAGES } from '../constants';

export default function ImageOcrImportForm({ 
  files, 
  onFilesChange, 
  selectedLanguage, 
  onLanguageChange 
}) {
  const ocrLanguages = createListCollection({
    items: OCR_AVAILABLE_LANGUAGES.map(lang => ({
      label: lang.label,
      value: lang.code,
    })),
    selectionMode: 'single',
  });

  return (
    <VStack spacing={4} mt={4} maxW="xl" alignItems="stretch">
      <FileUpload.Root 
        maxFiles={5}
        accept="image/*"
        onFileAccept={(details) => {
          const actualFiles = details.files || details.acceptedFiles || [];
          onFilesChange(actualFiles);
        }}
        onFileChange={(details) => {
          const actualFiles = details.files || details.acceptedFiles || [];
          onFilesChange(actualFiles);
        }}
      >
        <FileUpload.HiddenInput />
        <FileUpload.Dropzone>
          <Icon size="md" color="fg.muted">
            <LuUpload />
          </Icon>
          <FileUpload.DropzoneContent>
            <Box>Drag and drop images here (max 5)</Box>
            <Box color="fg.muted">.jpg, .jpeg, .png, .webp</Box>
          </FileUpload.DropzoneContent>
        </FileUpload.Dropzone>
        {files.length > 0 && <FileUpload.List clearable />}
      </FileUpload.Root>

      <Select.Root
        collection={ocrLanguages}
        width="320px"
        value={selectedLanguage}
        onValueChange={onLanguageChange}
      >
        <Select.Label>Select OCR Language</Select.Label>

        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select language" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>

        <Portal>
          <Select.Positioner>
            <Select.Content>
              {ocrLanguages.items.map((lang) => (
                <Select.Item item={lang} key={lang.value}>
                  {lang.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </VStack>
  );
}

