import './WordsLoader.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Select, Portal, createListCollection, Button
} from '@chakra-ui/react';
import { toast } from 'sonner';
import { importFromVideoOcr, importFromImagesOcr, startYoutubeImport, pollTaskCompletion, checkVideoImportStatus } from '../../services/wordsService'
import { useTasks } from '../../contexts/TasksContext'
import Layout from '../../components/Layout/Layout'
import YouTubeImportForm from './components/YouTubeImportForm'
import VideoOcrImportForm from './components/VideoOcrImportForm'
import ImageOcrImportForm from './components/ImageOcrImportForm'
import ImageUrlImportForm from './components/ImageUrlImportForm'
import WordSelectionModal from '../../components/WordSelectionModal/WordSelectionModal'
import { IMPORT_SOURCES } from './constants'
import { showImportCompletedToast } from '../../utils/importNotifications'

export default function WordsLoader() {
  const navigate = useNavigate();
  const [selectorValue, setSelectorValue] = useState([])
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState(['spa'])
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWords, setModalWords] = useState([]);
  const [modalLanguage, setModalLanguage] = useState('');
  
  // Подключаем TasksContext
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
      let result;
      
      if (selectorValue.includes('youtube')) {
        // Валидация URL
        if (!url || url.trim() === '') {
          toast.error('Please enter a YouTube URL');
          setSubmitIsLoading(false);
          return;
        }
        
        console.log('📺 [WordsLoader] YouTube import initiated for URL:', url);
        
        // Извлекаем video_id из URL
        const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        
        // Валидация формата URL
        if (!videoId) {
          toast.error('Invalid YouTube URL', {
            description: 'Please enter a valid YouTube video URL'
          });
          setSubmitIsLoading(false);
          return;
        }
        
        console.log('🔍 [WordsLoader] Extracted video ID:', videoId);
        
        // Проверяем, нет ли уже активной задачи для этого видео
        if (videoId && hasActiveTaskForVideo(videoId)) {
          console.warn('⚠️ [WordsLoader] Video is already being processed:', videoId);
          toast.info('Video is already being processed', {
            description: 'Please wait for the current task to complete',
            duration: 5000
          });
          setSubmitIsLoading(false);
          return;
        }
        
        // Проверяем, был ли этот импорт уже просмотрен
        if (videoId) {
          const importStatus = await checkVideoImportStatus(videoId);
          if (importStatus.imported && importStatus.viewed) {
            console.log('ℹ️ [WordsLoader] Video already imported and viewed:', videoId);
            toast.info('Already processed', {
              description: 'This video has been imported and reviewed before.',
              duration: 4000
            });
            setSubmitIsLoading(false);
            return;
          }
        }
        
        // Создаем задачу
        const startResponse = await startYoutubeImport({ url });
        
        // Если из кэша - показываем модальное окно сразу
        if (startResponse.cached && startResponse.words) {
          console.log('✅ [WordsLoader] Loaded from cache:', {
            wordsCount: startResponse.words.length,
            language: startResponse.language
          });
          
          result = {
            words: startResponse.words,
            language: startResponse.language,
            cached: true
          };
          
          // Открываем модальное окно со словами
          setModalWords(result.words);
          setModalLanguage(result.language);
          setIsModalOpen(true);
          setUrl('');
          setSubmitIsLoading(false);
          return;
        } else {
          // Новая задача - регистрируем в TasksContext и делаем быстрый локальный polling
          const taskId = startResponse.task_id;
          
          console.log('⏳ [WordsLoader] Task created:', taskId);
          
          // 1. Добавляем задачу в TasksContext для фонового отслеживания
          //    (на случай если пользователь закроет страницу или polling прервется)
          addTask({
            id: taskId,
            task_type: 'youtube',
            status: 'pending',
            input_params: { video_id: videoId }
          });
          
          toast.success('Video submitted!', {
            description: 'Processing... You\'ll be notified when ready to review.',
            duration: 4000
          });
          
          // 2. Запускаем быстрый локальный polling (2s интервал)
          //    Пока пользователь на странице - быстрая обратная связь
          try {
            result = await pollTaskCompletion(taskId);
            
            console.log('🎉 [WordsLoader] Local polling completed:', {
              wordsCount: result.words?.length,
              language: result.language
            });
            
            // Успешно дождались - убираем из TasksContext 
            // (чтобы не было дублирующего уведомления)
            removeTask(taskId);
            
            showImportCompletedToast(result, () => navigate('/imports'));
            
            setUrl('');
            setSubmitIsLoading(false);
            return;
            
          } catch (error) {
            // Если локальный polling прервался (timeout, закрытие страницы)
            // TasksContext продолжит фоновое отслеживание (15s интервал)
            console.log('⏸️ [WordsLoader] Local polling interrupted, TasksContext will continue');
            setUrl('');
            setSubmitIsLoading(false);
            return;
          }
        }
        
      } else if (selectorValue.includes('text-on-video-file')) {
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
        
      } else if (selectorValue.includes('url-images-with-text')) {
        toast.error('There is no handler for this source');
        return;
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
      
      setUrl('');
      
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

        <WordSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          words={modalWords}
          language={modalLanguage}
        />

    </Layout>
  )
}
