import { toast } from 'sonner';

/**
 * Shows a success notification for completed import task
 * @param {Object} result - Import result or task object
 * @param {Array} result.words - Array of imported words
 * @param {Function} onReviewClick - Callback function when Review button is clicked
 */
export const showImportCompletedToast = (result, onReviewClick) => {
  const wordsCount = result?.words?.length || 0;
  
  let description = `Found ${wordsCount} word${wordsCount !== 1 ? 's' : ''}. Click to review.`;
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

