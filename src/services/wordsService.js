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
