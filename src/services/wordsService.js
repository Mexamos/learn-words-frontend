import api from './index';

/**
 * Start async YouTube import task
 * @param {{ url: string }} params
 * @returns {Promise<{ task_id: string, status: string, cached?: boolean, words?: string[], language?: string }>}
 */
export const startYoutubeImport = async ({ url }) => {
  const response = await api.post('/import/youtube', { 
    youtube_url: url 
  });
  return response.data;
};

/**
 * Check import task status
 * @param {string} taskId
 * @returns {Promise<{ 
 *   id: string, 
 *   status: 'pending' | 'processing' | 'completed' | 'failed', 
 *   result?: { words: string[], language: string },
 *   error_message?: string,
 *   progress?: object 
 * }>}
 */
export const checkImportStatus = async (taskId) => {
  const response = await api.get(`/import/status/${taskId}`);
  return response.data;
};

/**
 * Get active (pending/processing) tasks for current user
 * @returns {Promise<{ tasks: Array, count: number }>}
 */
export const getActiveTasks = async () => {
  const response = await api.get('/import/active');
  return response.data;
};

/**
 * Get import history with pagination and filters
 * @param {{ page?: number, limit?: number, status?: string, task_type?: string, viewed?: boolean }} params
 * @returns {Promise<{ tasks: Array, total: number, skip: number, limit: number }>}
 */
export const getImportHistory = async ({ page = 1, limit = 20, status = null, task_type = null, viewed = null } = {}) => {
  const params = new URLSearchParams();
  params.append('skip', ((page - 1) * limit).toString());
  params.append('limit', limit.toString());
  if (status) params.append('status', status);
  if (task_type) params.append('task_type', task_type);
  if (viewed !== null) params.append('viewed', viewed.toString());
  
  const response = await api.get(`/import/history?${params.toString()}`);
  return response.data;
};

/**
 * Get count of unviewed completed imports
 * @returns {Promise<{ count: number }>}
 */
export const getUnviewedImportsCount = async () => {
  const response = await api.get('/import/unviewed-count');
  return response.data;
};

/**
 * Check if a YouTube video has been imported and viewed before
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{ imported: boolean, viewed: boolean, task?: object }>}
 */
export const checkVideoImportStatus = async (videoId) => {
  try {
    const { tasks } = await getImportHistory({
      page: 1,
      limit: 100,
      status: 'completed',
      task_type: 'youtube'
    });
    
    // Find task with matching video_id in input_params
    const task = tasks.find(t => t.input_params?.video_id === videoId);
    
    return {
      imported: !!task,
      viewed: task?.viewed || false,
      task: task || null
    };
  } catch (error) {
    console.error('Error checking video import status:', error);
    return { imported: false, viewed: false, task: null };
  }
};

/**
 * Mark import as viewed
 * @param {string} taskId
 * @returns {Promise<{ message: string, task: object }>}
 */
export const markImportAsViewed = async (taskId) => {
  const response = await api.post(`/import/tasks/${taskId}/mark-viewed`);
  return response.data;
};

/**
 * Poll for task completion (internal helper)
 * @param {string} taskId - Task ID to poll
 * @param {(status: string, progress?: object) => void} onProgress - Progress callback
 * @returns {Promise<{ words: string[], language: string, cached: boolean }>}
 */
export const pollTaskCompletion = async (taskId, onProgress = null) => {
  console.log('⏳ [Task Polling] Starting polling for task:', taskId);
  
  return new Promise((resolve, reject) => {
    const pollInterval = 2000; // 2 seconds
    const maxAttempts = 60; // 2 minutes max (60 * 2s = 120s)
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        
        if (attempts > maxAttempts) {
          console.error('❌ [Task Polling] Task timeout after', attempts, 'attempts');
          clearInterval(intervalId);
          reject(new Error('Task timeout: took too long to complete'));
          return;
        }
        
        const statusResponse = await checkImportStatus(taskId);
        console.log(`🔄 [Task Polling] Attempt ${attempts}/${maxAttempts} - Status: ${statusResponse.status}`, statusResponse.progress);
        
        // Notify progress callback
        if (onProgress) {
          onProgress(statusResponse.status, statusResponse.progress);
        }
        
        if (statusResponse.status === 'completed') {
          console.log('✅ [Task Polling] Task completed successfully!', {
            taskId,
            wordsCount: statusResponse.result?.words?.length || 0,
            language: statusResponse.result?.language,
            attempts,
            totalTime: `${attempts * pollInterval / 1000}s`
          });
          clearInterval(intervalId);
          resolve({
            words: statusResponse.result.words,
            language: statusResponse.result.language,
            cached: false
          });
        } else if (statusResponse.status === 'failed') {
          console.error('❌ [Task Polling] Task failed!', {
            taskId,
            errorCode: statusResponse.error_code,
            errorMessage: statusResponse.error_message,
            attempts,
            totalTime: `${attempts * pollInterval / 1000}s`
          });
          clearInterval(intervalId);
          reject(new Error(statusResponse.error_message || 'Task failed'));
        }
        // If 'pending' or 'processing', continue polling
      } catch (error) {
        console.error('❌ [Task Polling] Polling error:', {
          taskId,
          error: error.message,
          attempts,
          response: error.response?.data
        });
        clearInterval(intervalId);
        reject(error);
      }
    };
    
    const intervalId = setInterval(poll, pollInterval);
    poll(); // First check immediately
  });
};

/**
 * Import words from video file using OCR.
 * @param {{ videoFile: File, frameInterval?: number, language: string }} params
 * @returns {Promise<{ words: string[], language: string }>}
 */
export const importFromVideoOcr = async ({ videoFile, frameInterval = 1, language }) => {
  const formData = new FormData();
  formData.append('video_file', videoFile);
  formData.append('frame_interval', frameInterval.toString());
  formData.append('language', language);

  const response = await api.post('/import/video-ocr', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('importFromVideo response:', response);
  return response.data;
};

/**
 * Import words from image files using OCR.
 * @param {{ imageFiles: File[], language: string }} params
 * @returns {Promise<{ words: string[], language: string }>}
 */
export const importFromImagesOcr = async ({ imageFiles, language }) => {
  const formData = new FormData();
  
  // Append all image files with the same field name
  imageFiles.forEach(file => {
    formData.append('image_files', file);
  });
  
  formData.append('language', language);

  const response = await api.post('/import/images-ocr', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('importFromImages response:', response);
  return response.data;
};

/**
 * Get all vocabularies for the current user.
 * @returns {Promise<Array<{ id: number, language_from: string, language_to: string, name: string }>>}
 */
export const getVocabularies = async () => {
  const response = await api.get('/api/v1/vocabularies');
  return response.data;
};

/**
 * Create a new vocabulary.
 * @param {{ language_from: string, language_to: string, name?: string }} data
 * @returns {Promise<{ id: number, language_from: string, language_to: string, name: string }>}
 */
export const createVocabulary = async (data) => {
  const response = await api.post('/api/v1/vocabularies', data);
  return response.data;
};

/**
 * Add multiple words to a vocabulary with automatic translation.
 * @param {number} vocabularyId
 * @param {string[]} words
 * @returns {Promise<Array>}
 */
export const addWordsBatch = async (vocabularyId, words) => {
  const response = await api.post(`/api/v1/vocabularies/${vocabularyId}/words/batch`, {
    words
  });
  return response.data;
};

/**
 * Get vocabulary details with statistics.
 * @param {number} vocabularyId
 * @returns {Promise<object>}
 */
export const getVocabularyWithStats = async (vocabularyId) => {
  const response = await api.get(`/api/v1/vocabularies/${vocabularyId}`);
  return response.data;
};

/**
 * Get paginated words from a vocabulary with optional search and sorting.
 * @param {number} vocabularyId
 * @param {{ search?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: string }} params
 * @returns {Promise<{ words: Array, total: number, page: number, limit: number }>}
 */
export const getWordsPaginated = async (vocabularyId, { search = '', page = 1, limit = 20, sortBy = null, sortOrder = 'asc' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (sortBy) {
    params.append('sort_by', sortBy);
    params.append('sort_order', sortOrder);
  }

  const response = await api.get(`/api/v1/vocabularies/${vocabularyId}/words/paginated?${params.toString()}`);
  return response.data;
};

/**
 * Delete multiple words from a vocabulary.
 * @param {number} vocabularyId
 * @param {number[]} wordIds
 * @returns {Promise<{ deleted_count: number }>}
 */
export const deleteWordsBatch = async (vocabularyId, wordIds) => {
  const response = await api.delete(`/api/v1/vocabularies/${vocabularyId}/words/batch`, {
    data: { word_ids: wordIds }
  });
  return response.data;
};

/**
 * Update multiple words in a vocabulary.
 * @param {number} vocabularyId
 * @param {Array<{ id: number, word?: string, translation?: string, status?: string, context?: string, examples?: string[] }>} updates
 * @returns {Promise<Array>}
 */
export const updateWordsBatch = async (vocabularyId, updates) => {
  const response = await api.put(`/api/v1/vocabularies/${vocabularyId}/words/batch`, {
    updates
  });
  return response.data;
};

/**
 * Get all words from a vocabulary.
 * @param {number} vocabularyId
 * @param {number} limit - Maximum number of words to fetch
 * @param {boolean} excludeLearnedToday - If true, exclude words learned today
 * @returns {Promise<Array<{ id: number, word: string, translation: string, status: string, context?: string, examples?: string[] }>>}
 */
export const getAllWords = async (vocabularyId, limit = 10000) => {
  const params = new URLSearchParams({ limit: limit.toString() });
  const response = await api.get(`/api/v1/vocabularies/${vocabularyId}/words?${params.toString()}`);
  return response.data;
};

/**
 * Get translations for words without saving to database.
 * @param {string[]} words - Array of words to translate
 * @param {string} languageFrom - Source language code
 * @param {string} languageTo - Target language code
 * @returns {Promise<Array<{word: string, translation: string}>>}
 */
export const translateWordsPreview = async (words, languageFrom, languageTo) => {
  const response = await api.post('/api/v1/vocabularies/translate', {
    words,
    language_from: languageFrom,
    language_to: languageTo
  });
  return response.data;
};

/**
 * Add words with custom translations to vocabulary.
 * @param {number} vocabularyId
 * @param {Array<{word: string, translation: string}>} wordsWithTranslations
 * @returns {Promise<Array>}
 */
export const addWordsWithTranslations = async (vocabularyId, wordsWithTranslations) => {
  const response = await api.post(
    `/api/v1/vocabularies/${vocabularyId}/words/batch-with-translations`,
    { words: wordsWithTranslations }
  );
  return response.data;
};

/**
 * Delete a vocabulary and all its words.
 * @param {number} vocabularyId
 * @returns {Promise<void>}
 */
export const deleteVocabulary = async (vocabularyId) => {
  const response = await api.delete(`/api/v1/vocabularies/${vocabularyId}`);
  return response.data;
};
