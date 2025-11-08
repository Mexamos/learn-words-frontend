import './VocabulariesList.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@chakra-ui/react'
import { toast } from 'sonner'
import Layout from '../../components/Layout/Layout'
import { getVocabularies } from '../../services/wordsService'
import { LANGUAGE_NAMES } from '../../constants/languages'

export default function VocabulariesList() {
  const navigate = useNavigate()
  const [vocabularies, setVocabularies] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVocabularies()
  }, [])

  const fetchVocabularies = async () => {
    try {
      setIsLoading(true)
      const data = await getVocabularies()
      setVocabularies(data)
    } catch (error) {
      console.error('Failed to fetch vocabularies:', error)
      toast.error('Failed to load vocabularies')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVocabularyClick = (vocabularyId) => {
    navigate(`/vocabularies/${vocabularyId}`)
  }

  const getLanguageName = (code) => {
    return LANGUAGE_NAMES[code] || code.toUpperCase()
  }

  if (isLoading) {
    return (
      <Layout pageTitle="My Vocabularies">
        <div className="loading-state">
          <Spinner size="xl" />
          <p style={{ marginTop: '1rem' }}>Loading vocabularies...</p>
        </div>
      </Layout>
    )
  }

  if (vocabularies.length === 0) {
    return (
      <Layout pageTitle="My Vocabularies">
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-text">You don't have any vocabularies yet</div>
          <div className="empty-state-subtext">
            Add words through "Add new words", and a vocabulary will be created automatically
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout pageTitle="My Vocabularies">
      <div className="vocabularies-list-container">
        <div className="vocabularies-grid">
          {vocabularies.map((vocab) => (
            <div
              key={vocab.id}
              className="vocabulary-card"
              onClick={() => handleVocabularyClick(vocab.id)}
            >
              <div className="vocabulary-card-name">{vocab.name}</div>
              <div className="vocabulary-card-languages">
                <span>{getLanguageName(vocab.language_from)}</span>
                <span className="vocabulary-card-arrow">→</span>
                <span>{getLanguageName(vocab.language_to)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

