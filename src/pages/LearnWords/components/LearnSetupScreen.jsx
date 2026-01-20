import PropTypes from 'prop-types'
import { Select, Portal, createListCollection } from '@chakra-ui/react'
import { LANGUAGE_NAMES } from '../../../constants/languages'

const getLanguageName = (code) => {
  return LANGUAGE_NAMES[code] || code.toUpperCase()
}

export default function LearnSetupScreen({
  vocabularies,
  learningModes,
  selectedModes,
  selectedVocabulary,
  wordCount,
  onModeToggle,
  onVocabularyChange,
  onWordCountChange,
  onWordCountBlur,
  onStartLearning
}) {
  const vocabularyCollection = createListCollection({
    items: vocabularies.map((vocab) => ({
      value: vocab.id.toString(),
      label: `${vocab.name} (${getLanguageName(vocab.language_from)} → ${getLanguageName(vocab.language_to)})`
    }))
  })

  return (
    <div className="learn-words-container">
      <div className="selection-screen">
        {vocabularies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p>You don&apos;t have any vocabularies yet.</p>
            <p>Add words to create your first vocabulary.</p>
          </div>
        ) : (
          <div className="selection-form">
            <div className="form-group">
              <label className="form-label">Select Learning Modes (you can select multiple)</label>
              <div className="mode-selection-checkboxes">
                {learningModes.map((mode) => (
                  <label key={mode.id}>
                    <input
                      type="checkbox"
                      checked={selectedModes.includes(mode.code)}
                      onChange={(e) => onModeToggle(mode, e.target.checked)}
                    />
                    <span>{mode.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <Select.Root
                collection={vocabularyCollection}
                width="100%"
                value={selectedVocabulary}
                onValueChange={(e) => onVocabularyChange(e.value)}
              >
                <Select.Label>Select Vocabulary</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select a vocabulary" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>

                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {vocabularyCollection.items.map((vocab) => (
                        <Select.Item item={vocab} key={vocab.value}>
                          {vocab.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="word-count-input">
                Number of Words
              </label>
              <input
                id="word-count-input"
                type="number"
                className="word-count-input"
                min="1"
                value={wordCount}
                onChange={onWordCountChange}
                onBlur={onWordCountBlur}
                placeholder="Enter number of words"
              />
            </div>

            <button
              className="start-button"
              onClick={onStartLearning}
              disabled={selectedVocabulary.length === 0 || selectedModes.length === 0}
            >
              Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

LearnSetupScreen.propTypes = {
  vocabularies: PropTypes.array.isRequired,
  learningModes: PropTypes.array.isRequired,
  selectedModes: PropTypes.array.isRequired,
  selectedVocabulary: PropTypes.array.isRequired,
  wordCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onModeToggle: PropTypes.func.isRequired,
  onVocabularyChange: PropTypes.func.isRequired,
  onWordCountChange: PropTypes.func.isRequired,
  onWordCountBlur: PropTypes.func.isRequired,
  onStartLearning: PropTypes.func.isRequired
}

