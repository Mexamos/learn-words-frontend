import { useState, useEffect } from 'react';
import { Box, Tooltip } from '@chakra-ui/react';
import { getAllAvailableWordsInfo } from '../../services/learningService';

const STORAGE_KEY = 'availableWordsInfo';
const POLLING_INTERVAL = 2000;

export default function AvailableWordsInfo() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    // Load from localStorage first
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        setInfo(JSON.parse(cached));
      } catch (error) {
        console.error('[AvailableWordsInfo] Error parsing cached data:', error);
      }
    }

    const fetchInfo = async () => {
      try {
        const data = await getAllAvailableWordsInfo();
        setInfo(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('[AvailableWordsInfo] Error fetching info:', error);
      }
    };

    // Initial fetch
    fetchInfo();

    // Set up polling
    const interval = setInterval(fetchInfo, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  if (!info) {
    return null;
  }

  const hasOverdue = info.overdue_count > 0;
  const hasReview = info.review_words_count > 0;

  return (
    <Tooltip.Root 
      openDelay={100}
      positioning={{ placement: 'bottom' }}
    >
      <Tooltip.Trigger asChild>
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          px={3}
          py={1.5}
          borderRadius="md"
          bg={hasOverdue ? 'red.50' : hasReview ? 'blue.50' : 'gray.50'}
          border="1px solid"
          borderColor={hasOverdue ? 'red.200' : hasReview ? 'blue.200' : 'gray.200'}
          cursor="default"
          fontSize="sm"
          fontWeight="medium"
        >
          <Box display="flex" alignItems="center" gap={1}>
            <span>🔁</span>
            <span style={{ color: hasOverdue ? '#c53030' : hasReview ? '#2c5282' : '#2d3748' }}>
              {info.review_words_count}
            </span>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <span>✅</span>
            <span style={{ color: '#2d3748' }}>
              {info.learned_today}/{info.daily_total_limit}
            </span>
          </Box>

          {hasOverdue && (
            <Box display="flex" alignItems="center" gap={1}>
              <span>⚠️</span>
              <span style={{ color: '#c53030', fontWeight: 'bold' }}>
                {info.overdue_count}
              </span>
            </Box>
          )}
        </Box>
      </Tooltip.Trigger>
      
      <Tooltip.Positioner>
        <Tooltip.Content>
          <Box fontSize="sm">
            <div>🔁 Words to repeat: <strong>{info.review_words_count}</strong></div>
            <div>✅ Studied today: <strong>{info.learned_today}/{info.daily_total_limit}</strong></div>
            {hasOverdue && (
              <div style={{ color: '#fc8181' }}>
                ⚠️ Overdue words: <strong>{info.overdue_count}</strong>
              </div>
            )}
          </Box>
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}
