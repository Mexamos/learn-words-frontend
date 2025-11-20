import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Box } from '@chakra-ui/react';
import { LuClock } from 'react-icons/lu';
import { getUnviewedImportsCount } from '../../services/wordsService';
import { useTasks } from '../../contexts/TasksContext';

export default function UnviewedImportsBadge() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const { activeTasks } = useTasks();

  const loadCount = async () => {
    try {
      const data = await getUnviewedImportsCount();
      setCount(data.count || 0);
    } catch (error) {
      console.error('[UnviewedImportsBadge] Error loading count:', error);
      // Silent fail - не критично
    }
  };

  useEffect(() => {
    // Load initial count
    loadCount();

    // Refresh count every 3 seconds
    const interval = setInterval(loadCount, 3 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Refresh count when active tasks change (task completed)
  useEffect(() => {
    // Если активных задач нет, возможно какая-то завершилась - обновим счетчик
    if (activeTasks.length === 0) {
      loadCount();
    }
  }, [activeTasks.length]);

  if (count === 0) {
    return null; // Don't show badge if no unviewed imports
  }

  return (
    <Box
      position="relative"
      cursor="pointer"
      onClick={() => navigate('/imports')}
      title={`${count} unviewed import${count !== 1 ? 's' : ''}`}
      display="flex"
      alignItems="center"
      gap={1}
      px={2}
      py={1}
      borderRadius="md"
      _hover={{
        bg: 'gray.100'
      }}
      transition="background 0.2s"
    >
      <LuClock size={20} color="#3182ce" />
      <Badge colorScheme="blue" variant="solid" fontSize="xs">
        {count}
      </Badge>
    </Box>
  );
}

