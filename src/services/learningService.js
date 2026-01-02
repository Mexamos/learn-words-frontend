import api from './index'

/**
 * Get all available learning modes
 */
export const getLearningModes = async () => {
  const response = await api.get('/api/v1/learning-modes')
  return response.data
}

/**
 * Create a learning log after completing a learning session
 * @param {number} vocabularyId - The vocabulary ID
 * @param {number} learningModeId - The learning mode ID
 * @param {Array<{word_id: number, is_correct: boolean}>} words - Array of word objects with results
 */
export const createLearningLog = async (vocabularyId, learningModeId, words) => {
  const response = await api.post('/api/v1/learning-logs', {
    vocabulary_id: vocabularyId,
    learning_mode_id: learningModeId,
    words: words
  })
  return response.data
}

