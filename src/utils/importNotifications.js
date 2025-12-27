import { toast } from 'sonner';

/**
 * Shows a success notification for completed import task
 * @param {Object} result - Import result or task object
 * @param {Array} result.words - Array of imported words
 * @param {Function} onReviewClick - Callback function when Review button is clicked
 */
export const showImportCompletedToast = (result, onReviewClick) => {
  const words = result?.words || [];
  const wordsCount = words.length;
  
  // Count words with translations
  const translationsCount = words.filter(word => 
    typeof word === 'object' && word.translation
  ).length;
  
  let description = `Found ${wordsCount} word${wordsCount !== 1 ? 's' : ''}`;
  if (translationsCount > 0) {
    description += ` (${translationsCount} with translation${translationsCount !== 1 ? 's' : ''})`;
  }
  description += '. Click to review.';
  
  if (wordsCount === 0) {
    description = 'No words found. Click to review.';
  }
  
  toast.success('Import completed!', {
    description: description,
    duration: 5000,
    action: {
      label: 'Review',
      onClick: onReviewClick
    }
  });
};

