import api from './index';

/**
 * Submit words to the backend.
 * @param {{ source: string, url?: string, files?: File[] }} params
 * @returns {Promise<{ words: string[], language: string }>}
 */
export const importFromYoutube = async ({ url }) => {
  const formData = new FormData();
  formData.append('youtube_url', url);

  const response = await api.post(
    '/import/youtube', 
    { youtube_url: url }
  );
  console.log('importFromYoutube response:', response);
  return response.data;
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
 * Get paginated words from a vocabulary with optional search.
 * @param {number} vocabularyId
 * @param {{ search?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ words: Array, total: number, page: number, limit: number }>}
 */
export const getWordsPaginated = async (vocabularyId, { search = '', page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

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
 * @returns {Promise<Array<{ id: number, word: string, translation: string, status: string, context?: string, examples?: string[] }>>}
 */
export const getAllWords = async (vocabularyId) => {
  const response = await api.get(`/api/v1/vocabularies/${vocabularyId}/words?limit=10000`);
  return response.data;
};
