import './VocabularyDetail.css'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spinner } from '@chakra-ui/react'
import { toast } from 'sonner'
import Layout from '../../components/Layout/Layout'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal/DeleteConfirmationModal'
import EditWordsModal from '../../components/EditWordsModal/EditWordsModal'
import AddWordsModal from '../../components/AddWordsModal/AddWordsModal'
import {
  getVocabularyWithStats,
  getWordsPaginated,
  deleteWordsBatch,
  updateWordsBatch,
  addWordsWithTranslations
} from '../../services/wordsService'
import { LANGUAGE_NAMES } from '../../constants/languages'

export default function VocabularyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [vocabulary, setVocabulary] = useState(null)
  const [words, setWords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedWordIds, setSelectedWordIds] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page on search
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Fetch vocabulary details
  useEffect(() => {
    fetchVocabulary()
  }, [id])

  // Fetch words when page, search, or vocabulary changes
  useEffect(() => {
    if (vocabulary) {
      fetchWords()
    }
  }, [vocabulary, page, debouncedSearch])

  const fetchVocabulary = async () => {
    try {
      const data = await getVocabularyWithStats(id)
      setVocabulary(data)
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error)
      toast.error('Failed to load vocabulary')
      navigate('/vocabularies')
    }
  }

  const fetchWords = async () => {
    try {
      setIsLoading(true)
      const data = await getWordsPaginated(id, {
        search: debouncedSearch,
        page,
        limit
      })
      setWords(data.words)
      setTotal(data.total)
      setSelectedWordIds(new Set()) // Clear selection on fetch
    } catch (error) {
      console.error('Failed to fetch words:', error)
      toast.error('Failed to load words')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedWordIds(new Set(words.map((w) => w.id)))
    } else {
      setSelectedWordIds(new Set())
    }
  }

  const handleSelectWord = (wordId) => {
    setSelectedWordIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(wordId)) {
        newSet.delete(wordId)
      } else {
        newSet.add(wordId)
      }
      return newSet
    })
  }

  const handleDeleteWords = async () => {
    try {
      await deleteWordsBatch(id, Array.from(selectedWordIds))
      toast.success(`${selectedWordIds.size} word(s) deleted successfully`)
      fetchWords() // Refresh the list
    } catch (error) {
      console.error('Failed to delete words:', error)
      toast.error('Failed to delete words')
      throw error
    }
  }

  const handleUpdateWords = async (updates) => {
    try {
      await updateWordsBatch(id, updates)
      toast.success(`${updates.length} word(s) updated successfully`)
      fetchWords() // Refresh the list
    } catch (error) {
      console.error('Failed to update words:', error)
      toast.error('Failed to update words')
      throw error
    }
  }

  const handleAddWords = async (wordsWithTranslations) => {
    try {
      const createdWords = await addWordsWithTranslations(id, wordsWithTranslations)
      toast.success(`${createdWords.length} word(s) added successfully`)
      fetchWords() // Refresh the list
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Failed to add words:', error)
      toast.error('Failed to add words')
      throw error
    }
  }

  const getLanguageName = (code) => {
    return LANGUAGE_NAMES[code] || code.toUpperCase()
  }

  const totalPages = Math.ceil(total / limit)
  const selectedWords = words.filter((w) => selectedWordIds.has(w.id))

  if (!vocabulary) {
    return (
      <Layout pageTitle="Loading...">
        <div className="loading-state">
          <Spinner size="xl" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout pageTitle={vocabulary.name}>
      <div className="vocabulary-detail-container">
        <div className="vocabulary-header">
          <div className="vocabulary-info">
            <span>{getLanguageName(vocabulary.language_from)}</span>
            <span>→</span>
            <span>{getLanguageName(vocabulary.language_to)}</span>
          </div>
        </div>

        <div className="search-and-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search words, translations, or context..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="actions-group">
            <Button
              colorPalette="blue"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Words
            </Button>
            <Button
              colorPalette="red"
              size="sm"
              disabled={selectedWordIds.size === 0}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete {selectedWordIds.size > 0 ? `(${selectedWordIds.size})` : ''}
            </Button>
            <Button
              colorPalette="blue"
              size="sm"
              disabled={selectedWordIds.size === 0}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit {selectedWordIds.size > 0 ? `(${selectedWordIds.size})` : ''}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <Spinner size="xl" />
            <p className="loading-text">Loading words...</p>
          </div>
        ) : words.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div>
              {debouncedSearch
                ? 'No words found matching your search'
                : 'No words in this vocabulary yet'}
            </div>
          </div>
        ) : (
          <div className="words-table-container">
            <table className="words-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="word-checkbox"
                      checked={selectedWordIds.size === words.length && words.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Word</th>
                  <th>Translation</th>
                  <th>Status</th>
                  <th>Context</th>
                  <th>Examples</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr
                    key={word.id}
                    className={selectedWordIds.has(word.id) ? 'selected' : ''}
                    onClick={() => handleSelectWord(word.id)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="word-checkbox"
                        checked={selectedWordIds.has(word.id)}
                        onChange={() => handleSelectWord(word.id)}
                      />
                    </td>
                    <td>{word.word}</td>
                    <td>{word.translation}</td>
                    <td>
                      <span className={`status-badge ${word.status}`}>
                        {word.status}
                      </span>
                    </td>
                    <td className="truncate" title={word.context || '-'}>
                      {word.context || '-'}
                    </td>
                    <td 
                      className="truncate" 
                      title={word.examples && word.examples.length > 0 ? word.examples.join(', ') : '-'}
                    >
                      {word.examples && word.examples.length > 0
                        ? word.examples.join(', ')
                        : '-'}
                    </td>
                    <td>{word.source_video_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
                  {total} words
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span className="page-number">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="pagination-button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteWords}
          wordCount={selectedWordIds.size}
        />

        <EditWordsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateWords}
          words={selectedWords}
        />

        <AddWordsModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddWords}
          vocabulary={vocabulary}
        />
      </div>
    </Layout>
  )
}

