// src/contexts/TasksContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveTasks, checkImportStatus } from '../services/wordsService';
import { toast } from 'sonner';
import { AuthContext } from './AuthContext';
import { showImportCompletedToast } from '../utils/importNotifications';

const TasksContext = createContext();

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
};

export const TasksProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTasks, setActiveTasks] = useState([]);
  const [polling, setPolling] = useState(false);
  const [pollingErrorCount, setPollingErrorCount] = useState(0);
  const completedTasksRef = useRef(new Set()); // Track notified completed tasks
  
  // Safe navigation wrapper
  const safeNavigate = useCallback((path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('[TasksContext] Navigation error:', error);
    }
  }, [navigate]);

  // Загрузка активных задач при монтировании
  const loadActiveTasks = useCallback(async () => {
    // Загружаем задачи только если пользователь авторизован
    if (!user) {
      return;
    }
    
    console.log('🔄 [TasksContext] Loading active tasks...');
    
    try {
      const { tasks } = await getActiveTasks();
      console.log('✅ [TasksContext] Active tasks loaded:', {
        count: tasks?.length || 0,
        tasks: tasks
      });
      setActiveTasks(tasks || []);
      
      // Если есть активные задачи и polling не запущен - запускаем
      if (tasks && tasks.length > 0 && !polling) {
        console.log('🔁 [TasksContext] Starting polling for active tasks');
        setPolling(true);
      }
    } catch (error) {
      console.error('❌ [TasksContext] Error loading active tasks:', error);
      // Не показываем toast при ошибке загрузки - это фоновый процесс
    }
  }, [user, polling]);

  // Инициализация: загружаем активные задачи когда пользователь авторизуется
  useEffect(() => {
    if (user) {
      console.log('👤 [TasksContext] User authenticated, loading tasks');
      loadActiveTasks();
    } else {
      console.log('👋 [TasksContext] User logged out, clearing tasks');
      // Если пользователь вышел - очищаем задачи
      setActiveTasks([]);
      setPolling(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Периодический опрос активных задач с exponential backoff при ошибках
  useEffect(() => {
    // Не делаем polling если пользователь не авторизован или нет активных задач
    if (!user || activeTasks.length === 0) {
      setPollingErrorCount(0); // Reset error count
      return;
    }

    // Calculate polling interval with exponential backoff on errors
    // Base: 15s, max: 60s
    const baseInterval = 15000;
    const maxInterval = 60000;
    const backoffMultiplier = Math.min(Math.pow(2, pollingErrorCount), maxInterval / baseInterval);
    const pollingInterval = Math.min(baseInterval * backoffMultiplier, maxInterval);

    console.log('⏰ [TasksContext] Setting up background polling:', {
      interval: `${pollingInterval / 1000}s`,
      errorCount: pollingErrorCount,
      tasksCount: activeTasks.length
    });

    const interval = setInterval(async () => {
      console.log('🔄 [TasksContext] Background polling tick...');
      try {
        // Store previous tasks for comparison
        const previousTasksMap = new Map(activeTasks.map(t => [t.id, t]));
        
        const { tasks } = await getActiveTasks();
        console.log('📊 [TasksContext] Background poll result:', {
          previousCount: activeTasks.length,
          currentCount: tasks?.length || 0,
          tasks
        });
        
        // Reset error count on successful poll
        setPollingErrorCount(0);
        
        // Check for newly completed tasks and show notifications
        if (tasks) {
          tasks.forEach(task => {
            const prevTask = previousTasksMap.get(task.id);
            
            // Task just completed
            if (prevTask && 
                (prevTask.status === 'pending' || prevTask.status === 'processing') &&
                task.status === 'completed' &&
                !completedTasksRef.current.has(task.id)) {
              
              console.log('🎉 [TasksContext] Task completed:', task.id);
              completedTasksRef.current.add(task.id);
              
              showImportCompletedToast(task.result, () => safeNavigate('/imports'));
            }
            
            // Task failed
            if (prevTask && 
                (prevTask.status === 'pending' || prevTask.status === 'processing') &&
                task.status === 'failed' &&
                !completedTasksRef.current.has(task.id)) {
              
              console.log('❌ [TasksContext] Task failed:', task.id);
              completedTasksRef.current.add(task.id);
              
              toast.error('Import failed', {
                description: task.error_message || 'Unknown error',
                duration: 8000,
                action: {
                  label: 'View Details',
                  onClick: () => safeNavigate('/imports')
                }
              });
            }
          });
        }
        
        setActiveTasks(tasks || []);
        
        // Если все задачи завершились - останавливаем polling
        if (!tasks || tasks.length === 0) {
          console.log('✅ [TasksContext] All tasks completed, stopping polling');
          setPolling(false);
        }
      } catch (error) {
        console.error('❌ [TasksContext] Error polling active tasks:', error);
        
        // Increment error count for backoff
        setPollingErrorCount(prev => prev + 1);
        
        // Only show toast on first error to avoid spam
        if (pollingErrorCount === 0) {
          toast.error('Connection issue', {
            description: 'Retrying with slower polling...',
            duration: 4000
          });
        }
      }
    }, pollingInterval);

    return () => {
      console.log('🛑 [TasksContext] Clearing background polling interval');
      clearInterval(interval);
    };
  }, [user, activeTasks.length, pollingErrorCount, safeNavigate]);

  // Проверка статуса конкретной задачи
  const checkTaskStatus = useCallback(async (taskId) => {
    console.log('🔍 [TasksContext] Checking task status:', taskId);
    try {
      const task = await checkImportStatus(taskId);
      console.log('📋 [TasksContext] Task status:', {
        taskId,
        status: task.status,
        result: task.result
      });
      
      // Обновляем задачу в списке
      setActiveTasks(prev => {
        const index = prev.findIndex(t => t.id === taskId);
        if (index === -1) return prev;
        
        const updated = [...prev];
        updated[index] = task;
        
        // Если задача завершилась - убираем её из активных
        if (task.status === 'completed' || task.status === 'failed') {
          console.log('✅ [TasksContext] Task completed/failed, removing from active tasks:', taskId);
          return updated.filter(t => t.id !== taskId);
        }
        
        return updated;
      });
      
      return task;
    } catch (error) {
      console.error('❌ [TasksContext] Error checking task status:', error);
      throw error;
    }
  }, []);

  // Добавление новой задачи
  const addTask = useCallback((task) => {
    console.log('➕ [TasksContext] Adding new task:', task);
    setActiveTasks(prev => {
      // Проверяем, нет ли уже такой задачи
      if (prev.some(t => t.id === task.id)) {
        console.warn('⚠️ [TasksContext] Task already exists, skipping:', task.id);
        return prev;
      }
      return [...prev, task];
    });
    setPolling(true);
  }, []);

  // Удаление задачи (при завершении)
  const removeTask = useCallback((taskId) => {
    console.log('➖ [TasksContext] Removing task:', taskId);
    setActiveTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  // Проверка, есть ли активная задача для конкретного видео
  const hasActiveTaskForVideo = useCallback((videoId) => {
    const hasTask = activeTasks.some(task => 
      task.task_type === 'youtube' && 
      task.input_params?.video_id === videoId &&
      (task.status === 'pending' || task.status === 'processing')
    );
    
    if (hasTask) {
      console.log('🔒 [TasksContext] Active task found for video:', videoId);
    }
    
    return hasTask;
  }, [activeTasks]);

  const value = {
    activeTasks,
    polling,
    loadActiveTasks,
    checkTaskStatus,
    addTask,
    removeTask,
    hasActiveTaskForVideo
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

