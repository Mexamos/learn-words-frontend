import { toast } from 'sonner';
import { 
  importFromVideoOcr, 
  importFromImagesOcr, 
  startYoutubeImport, 
  pollTaskCompletion,
  checkVideoImportStatus 
} from '../../services/wordsService';
import { showImportCompletedToast } from '../../utils/importNotifications';

export async function handleYoutubeImport({
  url,
  hasActiveTaskForVideo,
  addTask,
  removeTask,
  setUrl,
  navigate
}) {
  if (!url || url.trim() === '') {
    toast.error('Please enter a YouTube URL');
    return { shouldReturn: true };
  }
  
  console.log('📺 [WordsLoader] YouTube import initiated for URL:', url);
  
  const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  
  if (!videoId) {
    toast.error('Invalid YouTube URL', {
      description: 'Please enter a valid YouTube video URL'
    });
    return { shouldReturn: true };
  }
  
  console.log('🔍 [WordsLoader] Extracted video ID:', videoId);
  
  if (videoId && hasActiveTaskForVideo(videoId)) {
    console.warn('⚠️ [WordsLoader] Video is already being processed:', videoId);
    toast.info('Video is already being processed', {
      description: 'Please wait for the current task to complete',
      duration: 5000
    });
    return { shouldReturn: true };
  }
  
  if (videoId) {
    const importStatus = await checkVideoImportStatus(videoId);
    if (importStatus.imported && importStatus.viewed) {
      console.log('ℹ️ [WordsLoader] Video already imported and viewed:', videoId);
      toast.info('Already processed', {
        description: 'This video has been imported and reviewed before.',
        duration: 4000
      });
      return { shouldReturn: true };
    }
  }
  
  const startResponse = await startYoutubeImport({ url });
  
  if (startResponse.cached && startResponse.words) {
    console.log('✅ [WordsLoader] Loaded from cache:', {
      wordsCount: startResponse.words.length,
      language: startResponse.language
    });
    
    toast.success('Video imported from cache!', {
      description: `Found ${startResponse.words.length} words. Check Imports History.`,
      duration: 4000
    });
    
    setUrl('');
    return { shouldReturn: true };
  }
  
  const taskId = startResponse.task_id;
  console.log('⏳ [WordsLoader] Task created:', taskId);
  
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
  
  try {
    const result = await pollTaskCompletion(taskId);
    
    console.log('🎉 [WordsLoader] Local polling completed:', {
      wordsCount: result.words?.length,
      language: result.language
    });
    
    removeTask(taskId);
    showImportCompletedToast(result, () => navigate('/imports'));
    setUrl('');
    return { shouldReturn: true };
    
  } catch (error) {
    console.log('⏸️ [WordsLoader] Local polling interrupted, TasksContext will continue');
    setUrl('');
    return { shouldReturn: true };
  }
}

export async function handleVideoOcrImport({
  files,
  selectedLanguage,
  setFiles,
  addTask,
  removeTask,
  navigate
}) {
  if (!files || files.length === 0) {
    toast.error('Please select a video file');
    return { shouldReturn: true };
  }
  if (!selectedLanguage || selectedLanguage.length === 0) {
    toast.error('Please select a language');
    return { shouldReturn: true };
  }
  
  const startResponse = await importFromVideoOcr({
    videoFile: files[0],
    language: selectedLanguage[0]
  });
  
  if (startResponse.cached || startResponse.words) {
    console.log('✅ [WordsLoader] Video OCR result from cache');
    
    toast.success('Video imported from cache!', {
      description: `Found ${startResponse.words.length} words. Check Imports History.`,
      duration: 4000
    });
    
    setFiles([]);
    return { shouldReturn: true };
  }
  
  const taskId = startResponse.task_id;
  console.log('⏳ [WordsLoader] Video OCR task created:', taskId);
  
  addTask(taskId, null);
  
  try {
    const result = await pollTaskCompletion(taskId);
    console.log('✅ [WordsLoader] Video OCR task completed:', {
      taskId,
      wordsCount: result.words?.length || 0,
      language: result.language
    });
    
    removeTask(taskId);
    showImportCompletedToast(result, () => navigate('/imports'));
    setFiles([]);
    return { shouldReturn: true };
    
  } catch (error) {
    console.log('⏸️ [WordsLoader] Local polling interrupted, TasksContext will continue');
    setFiles([]);
    return { shouldReturn: true };
  }
}

export async function handleImagesOcrImport({
  imageFiles,
  selectedLanguage,
  setImageFiles,
  addTask,
  removeTask,
  navigate
}) {
  if (!imageFiles || imageFiles.length === 0) {
    toast.error('Please select at least one image file');
    return { shouldReturn: true };
  }
  if (imageFiles.length > 5) {
    toast.error('Maximum 5 images allowed');
    return { shouldReturn: true };
  }
  if (!selectedLanguage || selectedLanguage.length === 0) {
    toast.error('Please select a language');
    return { shouldReturn: true };
  }
  
  const startResponse = await importFromImagesOcr({ 
    imageFiles: imageFiles,
    language: selectedLanguage[0]
  });
  
  if (startResponse.cached || startResponse.words) {
    console.log('✅ [WordsLoader] Images OCR result from cache');
    
    toast.success('Images imported from cache!', {
      description: `Found ${startResponse.words.length} words. Check Imports History.`,
      duration: 4000
    });
    
    setImageFiles([]);
    return { shouldReturn: true };
  }
  
  const taskId = startResponse.task_id;
  console.log('⏳ [WordsLoader] Images OCR task created:', taskId);
  
  addTask(taskId, null);
  
  try {
    const result = await pollTaskCompletion(taskId);
    console.log('✅ [WordsLoader] Images OCR task completed:', {
      taskId,
      wordsCount: result.words?.length || 0,
      language: result.language
    });
    
    removeTask(taskId);
    showImportCompletedToast(result, () => navigate('/imports'));
    setImageFiles([]);
    return { shouldReturn: true };
    
  } catch (error) {
    console.log('⏸️ [WordsLoader] Local polling interrupted, TasksContext will continue');
    setImageFiles([]);
    return { shouldReturn: true };
  }
}

