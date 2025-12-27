import './WordsLoader.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Select, Portal, createListCollection, Button
} from '@chakra-ui/react';
import { toast } from 'sonner';
import { useTasks } from '../../contexts/TasksContext'
import Layout from '../../components/Layout/Layout'
import YouTubeImportForm from './components/YouTubeImportForm'
import VideoOcrImportForm from './components/VideoOcrImportForm'
import ImageOcrImportForm from './components/ImageOcrImportForm'
import ImageUrlImportForm from './components/ImageUrlImportForm'
import { IMPORT_SOURCES } from './constants'
import { 
  handleYoutubeImport, 
  handleVideoOcrImport, 
  handleImagesOcrImport 
} from './importHandlers'

export default function WordsLoader() {
  const navigate = useNavigate();
  const [selectorValue, setSelectorValue] = useState([])
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState(['spa'])
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  
  const { hasActiveTaskForVideo, addTask, removeTask } = useTasks();

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
      if (selectorValue.includes('youtube')) {
        await handleYoutubeImport({
          url,
          hasActiveTaskForVideo,
          addTask,
          removeTask,
          setUrl,
          navigate
        });
        
      } else if (selectorValue.includes('text-on-video-file')) {
        await handleVideoOcrImport({
          files,
          selectedLanguage,
          setFiles,
          addTask,
          removeTask,
          navigate
        });
        
      } else if (selectorValue.includes('images-ocr')) {
        await handleImagesOcrImport({
          imageFiles,
          selectedLanguage,
          setImageFiles,
          addTask,
          removeTask,
          navigate
        });
        
      } else {
        toast.error('Please select a source');
      }
      
    } catch (error) {
      const errorCode = error.response?.data?.detail?.code;
      const errorTitle = error.response?.data?.detail?.title || 'Import failed';
      const errorMessage = error.response?.data?.detail?.message || error.message || String(error);
      
      console.error('❌ [WordsLoader] Import error:', {
        errorCode,
        errorTitle,
        errorMessage,
        fullError: error,
        response: error.response?.data
      });
      
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 8000,
        closeButton: true,
      });
      
    } finally {
      console.log('🏁 [WordsLoader] Import process finished, loading state reset');
      setSubmitIsLoading(false);
    }
  };

  return (
   <Layout pageTitle="Import Words">

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

        {selectorValue.length > 0 && (
          <Button
            type="submit"
            variant="surface"
            loading={submitIsLoading}
            loadingText="Processing..."
            onClick={handleSubmit}
            mt={4}
            width="fit-content"
            alignSelf="flex-start"
            disabled={submitIsLoading}
            _active={{
              transform: "scale(0.94)",
              boxShadow: "inner-lg",
            }}
          >
            Submit
          </Button>
        )}

    </Layout>
  )
}
