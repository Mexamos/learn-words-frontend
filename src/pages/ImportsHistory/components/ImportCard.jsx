import { Box, HStack, VStack, Text, Button, Badge } from '@chakra-ui/react';
import { LuCheck, LuX, LuClock, LuRefreshCw } from 'react-icons/lu';
import { LANGUAGE_NAMES } from '../../../constants/languages';

const STATUS_CONFIGS = {
  completed: {
    icon: LuCheck,
    colorScheme: 'green',
    label: 'Completed'
  },
  failed: {
    icon: LuX,
    colorScheme: 'red',
    label: 'Failed'
  },
  processing: {
    icon: LuRefreshCw,
    colorScheme: 'blue',
    label: 'Processing'
  },
  pending: {
    icon: LuClock,
    colorScheme: 'gray',
    label: 'Pending'
  }
};

const TYPE_LABELS = {
  youtube: 'YouTube',
  video_ocr: 'Video OCR',
  images_ocr: 'Images OCR'
};

export default function ImportCard({ task, onReview, onMarkAsViewed }) {
  const statusConfig = STATUS_CONFIGS[task.status] || STATUS_CONFIGS.pending;
  const StatusIcon = statusConfig.icon;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceInfo = () => {
    if (task.task_type === 'youtube' && task.input_params?.video_id) {
      return `Video ID: ${task.input_params.video_id}`;
    }
    return TYPE_LABELS[task.task_type] || task.task_type;
  };

  const languageName = task.result?.language 
    ? LANGUAGE_NAMES[task.result.language] || task.result.language
    : 'Unknown';

  const wordsCount = task.result?.words?.length || 0;
  const hasWords = wordsCount > 0;

  return (
    <Box
      className="import-card"
      borderWidth="1px"
      borderRadius="md"
      p={4}
      bg={task.viewed ? 'gray.50' : 'white'}
      position="relative"
    >
      <HStack justifyContent="space-between" alignItems="flex-start">
        
        {/* Left side: Info */}
        <VStack alignItems="flex-start" gap={2} flex="1">
          
          {/* Header row: Type badge + Status badge */}
          <HStack gap={2}>
            <Badge colorScheme="blue" variant="subtle">
              {TYPE_LABELS[task.task_type] || task.task_type}
            </Badge>
            
            <Badge colorScheme={statusConfig.colorScheme} variant="subtle">
              <HStack gap={1}>
                <StatusIcon size={14} />
                <span>{statusConfig.label}</span>
              </HStack>
            </Badge>
          </HStack>

          {/* Source info */}
          <Text fontSize="sm" fontWeight="medium" color="gray.700">
            {getSourceInfo()}
          </Text>

          {/* Date */}
          <Text fontSize="xs" color="gray.500">
            {formatDate(task.created_at)}
          </Text>

          {/* Results (for completed tasks) */}
          {task.status === 'completed' && hasWords && (
            <HStack gap={4} fontSize="sm">
              <Text>
                <strong>{wordsCount}</strong> {wordsCount === 1 ? 'word' : 'words'}
              </Text>
              <Text color="gray.600">
                Language: <strong>{languageName}</strong>
              </Text>
            </HStack>
          )}

          {/* Error message (for failed tasks) */}
          {task.status === 'failed' && task.error_message && (
            <Text fontSize="sm" color="red.600" maxWidth="500px">
              Error: {task.error_message}
            </Text>
          )}
        </VStack>

        {/* Right side: Actions */}
        <VStack gap={2} alignItems="flex-end" justifyContent="space-between" minHeight="100px">
          {/* Top: Mark as viewed button */}
          {task.status === 'completed' && (
            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={() => onMarkAsViewed(task.id)}
            >
              Mark as viewed
            </Button>
          )}
          
          {task.status === 'processing' && (
            <Badge colorScheme="blue" variant="outline">
              <HStack gap={1}>
                <LuRefreshCw className="spinning-icon" size={12} />
                <span>In Progress</span>
              </HStack>
            </Badge>
          )}
          
          {/* Bottom: Review Words button (only if has words) */}
          {task.status === 'completed' && hasWords && (
            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={() => onReview(task)}
            >
              Review Words
            </Button>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}

