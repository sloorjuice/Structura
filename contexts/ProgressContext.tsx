import { useAuth } from '@/contexts/AuthContext';
import { getObjectiveStatus } from '@/utils/dailyObjectives';
import { progressEventEmitter } from '@/utils/eventEmitter';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface ProgressContextType {
  getProgress: (date: Date, dailyObjectives: any[], exerciseConfig: any) => Promise<{ completed: number; total: number }>;
  refreshProgress: (date: Date) => void;
  progressCache: Map<string, { completed: number; total: number; timestamp: number }>;
  invalidateAllProgress: () => void;
  emitProgressUpdate: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

const CACHE_DURATION = 5000; // 5 seconds for more frequent updates

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progressCache, setProgressCache] = useState(new Map());

  const getDateKey = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const getProgress = useCallback(async (
    date: Date, 
    dailyObjectives: any[], 
    exerciseConfig: any
  ): Promise<{ completed: number; total: number }> => {
    if (!user || !date || dailyObjectives.length === 0) {
      return { completed: 0, total: 0 };
    }

    const dateKey = getDateKey(date);
    const cacheKey = `${user.uid}-${dateKey}`;
    const now = Date.now();
    
    // Check cache first
    const cached = progressCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return { completed: cached.completed, total: cached.total };
    }

    let completed = 0;
    let total = 0;

    // Use Promise.allSettled for better error handling
    const progressPromises = dailyObjectives.map(async (obj) => {
      if (
        obj.id === "exercises-morning" ||
        obj.id === "exercises-afternoon" ||
        obj.id === "exercises-night"
      ) {
        let period: "morning" | "night" | null = null;
        if (obj.id === "exercises-morning") period = "morning";
        if (obj.id === "exercises-afternoon" || obj.id === "exercises-night") period = "night";
        
        if (period) {
          const exercises = exerciseConfig[period] || [];
          if (exercises.length === 0) {
            return { completed: 1, total: 1 };
          } else {
            try {
              const statuses = await Promise.all(
                exercises.map(ex =>
                  getObjectiveStatus(user.uid, `exercise-${period}-${ex}`, date)
                )
              );
              const isCompleted = statuses.every(Boolean);
              return { completed: isCompleted ? 1 : 0, total: 1 };
            } catch {
              return { completed: 0, total: 1 };
            }
          }
        }
      } else {
        try {
          const status = await getObjectiveStatus(user.uid, obj.id, date);
          return { completed: status ? 1 : 0, total: 1 };
        } catch {
          return { completed: 0, total: 1 };
        }
      }
      return { completed: 0, total: 0 };
    });

    try {
      const results = await Promise.allSettled(progressPromises);
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          completed += result.value.completed;
          total += result.value.total;
        } else {
          // If a promise fails, count it as incomplete
          total += 1;
        }
      });
    } catch (error) {
      console.error('Error calculating progress:', error);
      return { completed: 0, total: dailyObjectives.length };
    }

    // Update cache
    const newCache = new Map(progressCache);
    newCache.set(cacheKey, { completed, total, timestamp: now });
    setProgressCache(newCache);

    return { completed, total };
  }, [user, progressCache, getDateKey]);

  const refreshProgress = useCallback((date: Date) => {
    if (!user) return;
    const dateKey = getDateKey(date);
    const cacheKey = `${user.uid}-${dateKey}`;
    const newCache = new Map(progressCache);
    newCache.delete(cacheKey);
    setProgressCache(newCache);
  }, [progressCache, getDateKey, user]);

  const invalidateAllProgress = useCallback(() => {
    setProgressCache(new Map());
  }, []);

  const emitProgressUpdate = useCallback(() => {
    progressEventEmitter.emit('progressUpdate');
  }, []);

  const value = useMemo(() => ({
    getProgress,
    refreshProgress,
    progressCache,
    invalidateAllProgress,
    emitProgressUpdate,
  }), [getProgress, refreshProgress, progressCache, invalidateAllProgress, emitProgressUpdate]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};