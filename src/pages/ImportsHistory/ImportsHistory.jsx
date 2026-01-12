import './ImportsHistory.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Badge,
  Select,
  createListCollection,
  Portal
} from '@chakra-ui/react';
import { toast } from 'sonner';
import { getImportHistory, markImportAsViewed } from '../../services/wordsService';
import Layout from '../../components/Layout/Layout';
import ImportCard from './components/ImportCard';
import WordSelectionModal from '../../components/WordSelectionModal/WordSelectionModal';
import { useTasks } from '../../contexts/TasksContext';

const TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Video OCR', value: 'video_ocr' },
  { label: 'Images OCR', value: 'images_ocr' }
];

const VIEWED_OPTIONS = [
  { label: 'All', value: 'all', apiValue: null },
  { label: 'Unviewed', value: 'unviewed', apiValue: false },
  { label: 'Viewed', value: 'viewed', apiValue: true }
];

export default function ImportsHistory() {
  const navigate = useNavigate();
  const { activeTasks } = useTasks();
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState(['all']);
  const [viewedFilter, setViewedFilter] = useState(['unviewed']); // Default: Unviewed
  
  // Track previous active tasks count to detect changes
  const prevActiveTasksCountRef = useRef(activeTasks.length);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWords, setModalWords] = useState([]);
  const [modalLanguage, setModalLanguage] = useState('');

  const limit = 20;

  const typeCollection = createListCollection({
    items: TYPE_OPTIONS,
    selectionMode: 'single',
  });

  const viewedCollection = createListCollection({
    items: VIEWED_OPTIONS,
    selectionMode: 'single',
  });

  const loadImports = async () => {
    setLoading(true);
    try {
      const task_type = typeFilter[0] === 'all' ? null : typeFilter[0];
      
      // Convert viewed filter to API value
      const viewedOption = VIEWED_OPTIONS.find(opt => opt.value === viewedFilter[0]);
      const viewed = viewedOption ? viewedOption.apiValue : null;
      
      const data = await getImportHistory({ 
        page, 
        limit, 
        status: 'completed',
        task_type,
        viewed,
      });
      
      console.log('📚 [ImportsHistory] Loaded imports:', {
        count: data.tasks?.length || 0,
        total: data.total,
        page
      });
      
      // Sort imports: unviewed first (viewed=false), then by created_at descending
      const sortedImports = (data.tasks || []).sort((a, b) => {
        // First priority: unviewed tasks first
        if (a.viewed !== b.viewed) {
          return a.viewed ? 1 : -1; // false (unviewed) comes first
        }
        // Second priority: newer tasks first
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setImports(sortedImports);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('❌ [ImportsHistory] Error loading imports:', error);
      toast.error('Failed to load imports', {
        description: error.response?.data?.detail?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImports();
  }, [page, typeFilter, viewedFilter]);

  // Watch for changes in active tasks - reload when a task completes
  useEffect(() => {
    const prevCount = prevActiveTasksCountRef.current;
    const currentCount = activeTasks.length;
    
    // If active tasks count decreased, a task likely completed
    // Reload imports to show the new completed task
    if (prevCount > currentCount && currentCount >= 0) {
      console.log('📋 [ImportsHistory] Active task completed, reloading imports list');
      loadImports();
    }
    
    // Update ref for next comparison
    prevActiveTasksCountRef.current = currentCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTasks.length]);

  const handleReviewWords = (task) => {
    if (!task.result?.words || task.result.words.length === 0) {
      toast.error('No words found in this import');
      return;
    }
    
    console.log('📝 [ImportsHistory] Opening word selection modal for task:', task.id);
    
    setModalWords(task.result.words);
    setModalLanguage(task.result.language);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalWords([]);
    setModalLanguage('');
    // Reload imports to update viewed status
    loadImports();
  };

  const handleMarkAsViewed = async (taskId) => {
    try {
      console.log('✅ [ImportsHistory] Marking task as viewed:', taskId);
      await markImportAsViewed(taskId);
      toast.success('Marked as viewed');
      // Reload imports to remove from list
      loadImports();
    } catch (error) {
      console.error('❌ [ImportsHistory] Error marking as viewed:', error);
      toast.error('Failed to mark as viewed', {
        description: error.response?.data?.detail?.message || error.message
      });
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout pageTitle="Review Imports">
      <VStack alignItems="stretch" gap={6} width="100%" maxWidth="1200px">

        {/* Filters */}
        <HStack gap={4} flexWrap="wrap" justifyContent="flex-start" width="100%">
          <Select.Root
            collection={viewedCollection}
            value={viewedFilter}
            onValueChange={(e) => {
              setViewedFilter(e.value);
              setPage(1); // Reset to first page on filter change
            }}
            width="200px"
          >
            <Select.Label>Status</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Unviewed" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {viewedCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          <Select.Root
            collection={typeCollection}
            value={typeFilter}
            onValueChange={(e) => {
              setTypeFilter(e.value);
              setPage(1); // Reset to first page on filter change
            }}
            width="200px"
          >
            <Select.Label>Import Type</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="All Types" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {typeCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          <Text fontSize="sm" color="fg.muted" alignSelf="flex-end" pb={2}>
            {total} import{total !== 1 ? 's' : ''} ready to review
          </Text>
        </HStack>

        {/* Content */}
        {loading ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="300px"
          >
            <Spinner size="xl" color="blue.500" />
          </Box>
        ) : imports.length === 0 ? (
          <Box 
            textAlign="center" 
            py={12}
            borderWidth="1px"
            borderRadius="md"
            borderStyle="dashed"
          >
            <Text fontSize="lg" color="fg.muted" mb={4}>
              No imports to review
            </Text>
          </Box>
        ) : (
          <VStack alignItems="stretch" gap={3}>
            {imports.map((importTask) => (
              <ImportCard
                key={importTask.id}
                task={importTask}
                onReview={handleReviewWords}
                onMarkAsViewed={handleMarkAsViewed}
              />
            ))}
          </VStack>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <HStack justifyContent="center" gap={2} pt={4}>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              size="sm"
            >
              Previous
            </Button>
            
            <Text fontSize="sm" px={4}>
              Page {page} of {totalPages}
            </Text>
            
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              size="sm"
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>

      {/* Word Selection Modal */}
      <WordSelectionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        words={modalWords}
        language={modalLanguage}
      />
    </Layout>
  );
}

