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
 * @param {number[]} wordIds - Array of word IDs that were learned
 */
export const createLearningLog = async (vocabularyId, learningModeId, wordIds) => {
  const response = await api.post('/api/v1/learning-logs', {
    vocabulary_id: vocabularyId,
    learning_mode_id: learningModeId,
    word_ids: wordIds
  })
  return response.data
}

