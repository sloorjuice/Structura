import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useTheme } from '@/themes/theme';
import { getObjectiveStatus, updateObjectiveStatus } from '@/utils/dailyObjectives';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  period: 'morning' | 'night';
  date: Date;
  exercises: string[];
  refreshing?: boolean;
  onProgressUpdate?: () => void;
};

export default function ExercisesCard({ period, date, exercises, refreshing, onProgressUpdate }: Props) {
  const theme = useTheme();
  const { user } = useAuth();
  const { emitProgressUpdate } = useProgress();
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Helper to check if date is today
  const isToday = useMemo(() => {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }, [date]);

  // Add a ref to track toggle operations and prevent refetching during toggles
  const isTogglingRef = useRef(false);
  // Track the last updated exercise to avoid race conditions
  const lastUpdatedRef = useRef<{exercise: string, timestamp: number, checked: boolean} | null>(null);

  // Memoized progress calculation
  const progress = useMemo(() => {
    const total = exercises.length;
    const completed = exercises.filter(ex => checked[ex]).length;
    return { total, completed, percentage: total > 0 ? completed / total : 0 };
  }, [exercises, checked]);

  // Fetch exercise statuses
  useEffect(() => {
    if (!user || isTogglingRef.current) return;
    
    setLoading(true);
    Promise.all(
      exercises.map(ex => {
        const lastUpdated = lastUpdatedRef.current;
        if (lastUpdated && 
            lastUpdated.exercise === ex && 
            Date.now() - lastUpdated.timestamp < 2000) {
          return Promise.resolve(lastUpdated.checked);
        }
        return getObjectiveStatus(user.uid, `exercise-${period}-${ex}`, date);
      })
    ).then(results => {
      const obj: Record<string, boolean> = {};
      exercises.forEach((ex, i) => { obj[ex] = results[i]; });
      setChecked(obj);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching exercise statuses:', error);
      setLoading(false);
    });
  }, [user, exercises, date, period]);  // Remove refreshing from dependencies
  
  // Separate effect just for refreshing
  useEffect(() => {
    if (!refreshing || !user) return;
    
    // Only refresh when explicitly told to via the refreshing prop
    setLoading(true);
    Promise.all(
      exercises.map(ex => getObjectiveStatus(user.uid, `exercise-${period}-${ex}`, date))
    ).then(results => {
      const obj: Record<string, boolean> = {};
      exercises.forEach((ex, i) => { obj[ex] = results[i]; });
      setChecked(obj);
      setLoading(false);
    }).catch(error => {
      console.error('Error refreshing exercise statuses:', error);
      setLoading(false);
    });
  }, [refreshing, user, exercises, date, period]);  // Only depends on refreshing

  // Optimized toggle handler with race condition prevention
  const handleToggle = useCallback(async (ex: string) => {
    if (!user) return;
    
    // Set the toggling flag to prevent concurrent refetches
    isTogglingRef.current = true;
    
    const newVal = !checked[ex];
    setChecked(prev => ({ ...prev, [ex]: newVal }));
    
    // Update the last updated reference
    lastUpdatedRef.current = {
      exercise: ex,
      timestamp: Date.now(),
      checked: newVal
    };
    
    // Haptic feedback
    Haptics.impactAsync(
      newVal ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    
    try {
      await updateObjectiveStatus(user.uid, `exercise-${period}-${ex}`, date, newVal);
      // Trigger progress update callback
      onProgressUpdate?.();
      // Emit progress update event
      emitProgressUpdate?.();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Revert on error
      setChecked(prev => ({ ...prev, [ex]: !newVal }));
      lastUpdatedRef.current = null;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      // Clear the toggling flag after a delay to prevent immediate refetches
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 500);
    }
  }, [user, checked, period, date, onProgressUpdate, emitProgressUpdate]);

  // Handle expansion toggle
  const handleExpansionToggle = useCallback(() => {
    setExpanded(e => !e);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {/* Progress Bar */}
      <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: theme.colors.accent,
              width: `${progress.percentage * 100}%`,
            },
          ]}
        />
      </View>
      
      <TouchableOpacity
        style={styles.header}
        onPress={handleExpansionToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {period === 'morning' ? 'Morning Exercises' : 'Night Exercises'}
            {progress.percentage === 1 && ' ✅'}
          </Text>
          <Text style={[styles.progressLabel, { color: theme.colors.muted }]}>
            {progress.completed} / {progress.total}
            {progress.total > 0 && ` (${Math.round(progress.percentage * 100)}%)`}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={theme.colors.icon || theme.colors.text}
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.accent} />
              <Text style={[styles.loadingText, { color: theme.colors.muted }]}>Loading exercises...</Text>
            </View>
          ) : exercises.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
              No exercises selected. Configure in Daily List Builder.
            </Text>
          ) : (
            exercises.map((ex, index) => (
              <TouchableOpacity
                key={ex}
                style={[
                  styles.exerciseRow, 
                  { 
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: index < exercises.length - 1 ? 0.5 : 0,
                    opacity: isToday ? 1 : 0.5,
                  }
                ]}
                onPress={() => isToday && handleToggle(ex)}
                activeOpacity={isToday ? 0.7 : 1}
                disabled={!isToday}
              >
                <Ionicons
                  name={checked[ex] ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={checked[ex] ? theme.colors.accent : theme.colors.muted}
                />
                <Text 
                  style={[
                    styles.exerciseText, 
                    { 
                      color: theme.colors.text,
                      textDecorationLine: checked[ex] ? 'line-through' : 'none',
                      opacity: checked[ex] ? 0.7 : 1,
                    }
                  ]}
                >
                  {ex}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  progressBarBackground: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  dropdown: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  exerciseText: {
    marginLeft: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});