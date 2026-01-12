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
 * @param {Array<number>} learningModeIds - Array of learning mode IDs
 * @param {Array<{word_id: number, is_correct: boolean}>} words - Array of word objects with results
 */
export const createLearningLog = async (vocabularyId, learningModeIds, words) => {
  const response = await api.post('/api/v1/learning-logs', {
    vocabulary_id: vocabularyId,
    learning_mode_ids: learningModeIds,
    words: words
  })
  return response.data
}

/**
 * Get aggregated information about available words for learning across all vocabularies
 * @returns {Promise<{
 *   review_words_count: number,
 *   new_words_count: number,
 *   learned_today: number,
 *   remaining_today: number,
 *   daily_total_limit: number,
 *   overdue_count: number
 * }>}
 */
export const getAllAvailableWordsInfo = async () => {
  const response = await api.get('/api/v1/available-words-info')
  return response.data
}

/**
 * Get information about available words for learning
 * @param {number} vocabularyId - The vocabulary ID
 * @returns {Promise<{
 *   review_words_count: number,
 *   new_words_count: number,
 *   learned_today: number,
 *   remaining_today: number,
 *   daily_total_limit: number,
 *   overdue_count: number
 * }>}
 */
export const getAvailableWordsInfo = async (vocabularyId) => {
  const response = await api.get(`/api/v1/vocabularies/${vocabularyId}/available-words-info`)
  return response.data
}

