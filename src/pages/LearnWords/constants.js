export const LEARNING_MODES = {
  WORD_TO_TRANSLATION: {
    value: 'word-to-translation',
    label: 'Double-sided card: Word → Translation'
  },
  TRANSLATION_TO_WORD: {
    value: 'translation-to-word',
    label: 'Double-sided card: Translation → Word'
  },
  SELECT_CORRECT_ANSWER: {
    value: 'select-correct-answer',
    label: 'Select correct answer'
  },
  MATCH_PAIRS: {
    value: 'match-pairs',
    label: 'Match pairs: find matching words'
  },
  MAKE_WORD: {
    value: 'make-word',
    label: 'Make word from letters'
  }
};

export const LEARNING_MODE_VALUES = Object.values(LEARNING_MODES);

export const WORD_FETCH_MULTIPLIER = 2;
