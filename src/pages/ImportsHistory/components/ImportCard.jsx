import { Box, HStack, VStack, Text, Button, Badge } from '@chakra-ui/react';
import { LuCheck, LuX, LuClock, LuRefreshCw } from 'react-icons/lu';
import { LANGUAGE_NAMES } from '../../../constants/languages';

const STATUS_CONFIGS = {
  completed: {
    icon: LuCheck,
    colorPalette: 'green',
    label: 'Completed'
  },
  failed: {
    icon: LuX,
    colorPalette: 'red',
    label: 'Failed'
  },
  processing: {
    icon: LuRefreshCw,
    colorPalette: 'blue',
    label: 'Processing'
  },
  pending: {
    icon: LuClock,
    colorPalette: 'gray',
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
      borderLeftWidth={!task.viewed ? "4px" : "1px"}
      borderLeftColor={!task.viewed ? "blue.500" : "gray.200"}
      borderRadius="md"
      bg="white"
      boxShadow={!task.viewed ? "sm" : "none"}
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: "md" }}
    >
      {/* Header: Status + Type + Date */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={3}
        bg={task.viewed ? 'gray.50' : 'blue.50'}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <HStack gap={3}>
          <Badge 
            colorPalette={statusConfig.colorPalette} 
            variant="solid"
            fontSize="xs"
          >
            <HStack gap={1}>
              <StatusIcon size={12} />
              <span>{statusConfig.label}</span>
            </HStack>
          </Badge>
          
          <Text fontSize="sm" fontWeight="medium" color="gray.700">
            {TYPE_LABELS[task.task_type] || task.task_type}
          </Text>
        </HStack>
        
        <Text fontSize="xs" color="gray.500">
          {formatDate(task.created_at)}
        </Text>
      </HStack>

      {/* Content */}
      <VStack alignItems="stretch" gap={3} p={4}>
        {/* Source info - prominent */}
        <Text fontSize="md" fontWeight="semibold" color="gray.800">
          {getSourceInfo()}
        </Text>

        {/* Results (for completed tasks) */}
        {task.status === 'completed' && hasWords && (
          <HStack gap={3} fontSize="sm" color="gray.600">
            <HStack gap={1}>
              <Text>📚</Text>
              <Text fontWeight="medium">{wordsCount}</Text>
              <Text>{wordsCount === 1 ? 'word' : 'words'}</Text>
            </HStack>
            <Text color="gray.400">•</Text>
            <HStack gap={1}>
              <Text>🌐</Text>
              <Text fontWeight="medium">{languageName}</Text>
            </HStack>
          </HStack>
        )}

        {/* Processing indicator */}
        {task.status === 'processing' && (
          <HStack gap={2} fontSize="sm" color="blue.600">
            <LuRefreshCw className="spinning-icon" size={16} />
            <Text fontWeight="medium">Processing...</Text>
          </HStack>
        )}

        {/* Error message (for failed tasks) */}
        {task.status === 'failed' && task.error_message && (
          <Box bg="red.50" p={3} borderRadius="md" borderLeft="3px solid" borderColor="red.500">
            <Text fontSize="sm" color="red.700" fontWeight="medium">
              Error: {task.error_message}
            </Text>
          </Box>
        )}

        {/* Actions */}
        {task.status === 'completed' && (hasWords || !task.viewed) && (
          <HStack gap={2} mt={2}>
            {hasWords && (
              <Button
                colorPalette="blue"
                size="md"
                onClick={() => onReview(task)}
              >
                Review Words →
              </Button>
            )}
            
            {!task.viewed && (
              <Button
                variant="outline"
                size="md"
                onClick={() => onMarkAsViewed(task.id)}
              >
                Mark as viewed
              </Button>
            )}
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

