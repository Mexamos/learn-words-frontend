import './WordsLoader.css'
import { useState } from 'react'
import { 
  Select, Portal, createListCollection, Button
} from '@chakra-ui/react';
import { toast } from 'sonner';
import { importFromYoutube, importFromVideoOcr, importFromImagesOcr } from '../../services/wordsService'
import Layout from '../../components/Layout/Layout'
import YouTubeImportForm from './components/YouTubeImportForm'
import VideoOcrImportForm from './components/VideoOcrImportForm'
import ImageOcrImportForm from './components/ImageOcrImportForm'
import ImageUrlImportForm from './components/ImageUrlImportForm'
import WordSelectionModal from '../../components/WordSelectionModal/WordSelectionModal'
import { IMPORT_SOURCES } from './constants'

export default function WordsLoader() {
  const [selectorValue, setSelectorValue] = useState([])
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState(['spa'])
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWords, setModalWords] = useState([]);
  const [modalLanguage, setModalLanguage] = useState('');

  const sources = createListCollection({
    items: IMPORT_SOURCES,
    selectionMode: 'single',
  })

  const handleSelectorChange = (e) => {
    setSelectorValue(e.value);
  };

  const handleUrlChange = (e) => {
    const { name, value } = e.target
    setUrl(value)
  }

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitIsLoading(true);
    try {
      let result;
      
      if (selectorValue.includes('text-on-video-file')) {
        if (!files || files.length === 0) {
          toast.error('Please select a video file');
          return;
        }
        if (!selectedLanguage || selectedLanguage.length === 0) {
          toast.error('Please select a language');
          return;
        }
        result = await importFromVideoOcr({ 
          videoFile: files[0],
          language: selectedLanguage[0]
        });
      } else if (selectorValue.includes('images-ocr')) {
        if (!imageFiles || imageFiles.length === 0) {
          toast.error('Please select at least one image file');
          return;
        }
        if (imageFiles.length > 5) {
          toast.error('Maximum 5 images allowed');
          return;
        }
        if (!selectedLanguage || selectedLanguage.length === 0) {
          toast.error('Please select a language');
          return;
        }
        result = await importFromImagesOcr({ 
          imageFiles: imageFiles,
          language: selectedLanguage[0]
        });
      } else if (selectorValue.includes('youtube')) {
        result = await importFromYoutube({ source: selectorValue, url, files });
      } else if (selectorValue.includes('url-images-with-text')) {
        toast.error('There is no handler for this source');
      } else {
        toast.error('Please select a source');
        return;
      }
      
      console.log('Import result:', result);
      
      // Open modal with the imported words
      if (result && result.words && result.words.length > 0) {
        setModalWords(result.words);
        setModalLanguage(result.language);
        setIsModalOpen(true);
        setUrl('');
      } else {
        toast.error('No words found in the import');
      }
    } catch (error) {
      const errorCode = error.response?.data?.detail?.code;
      const errorTitle = error.response?.data?.detail?.title || 'Something went wrong';
      const errorMessage = error.response?.data?.detail?.message || String(error);
      
      if (errorCode === 'VIDEO_TOO_LONG_FOR_PLAN' || errorCode === 'NO_TEXT_FOUND' || errorCode === 'INVALID_FRAME_INTERVAL') {
        toast.error(
          errorTitle,
          {
            description: errorMessage,
            duration: 20000,
            closeButton: true,
          }
        );
        setUrl('');
      } else {
        console.error('Error submitting words:', error);
        toast.error(
          errorTitle,
          {
            description: errorMessage,
            duration: 5000,
            closeButton: true,
          }
        );
      }
    } finally {
      setSubmitIsLoading(false);
    }
  };

  return (
   <Layout pageTitle="Words loader">

        <Select.Root
          collection={sources}
          width="320px"
          value={selectorValue}
          onValueChange={handleSelectorChange}
        >
          <Select.Label>Words source</Select.Label>

          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select words source" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content>
                {sources.items.map((source) => (
                  <Select.Item item={source} key={source.value}>
                    {source.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        {selectorValue.includes('text-on-video-file') && (
          <VideoOcrImportForm
            files={files}
            onFilesChange={setFiles}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        )}

        {selectorValue.includes('images-ocr') && (
          <ImageOcrImportForm
            files={imageFiles}
            onFilesChange={setImageFiles}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        )}

        {selectorValue.includes('youtube') && (
          <YouTubeImportForm 
            url={url}
            onChange={handleUrlChange}
          />
        )}

        {selectorValue.includes('url-images-with-text') && (
          <ImageUrlImportForm 
            url={url}
            onChange={handleUrlChange}
          />
        )}

        {selectorValue.length > 0 && (
          <Button
            type="submit"
            variant="surface"
            loading={submitIsLoading}
            loadingText="Submitting"
            onClick={handleSubmit}
            mt={4}
            _active={{
              transform: "scale(0.94)",
              boxShadow: "inner-lg",
            }}
          >
            Submit
          </Button>
        )}

        <WordSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          words={modalWords}
          language={modalLanguage}
        />

    </Layout>
  )
}
