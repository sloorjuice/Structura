import { ALL_DAILY_ITEMS } from "@/constants/dailyItems";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { getTheme } from "@/themes/theme";
import { progressEventEmitter } from "@/utils/eventEmitter";
import { db } from "@/utils/firebase";
import * as Haptics from "expo-haptics";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import DailyCard from "@/components/DailyCard";
import DateSelector from "@/components/DateSelector";
import ExercisesCard from "@/components/ExercisesCard";
import { useFocusEffect } from '@react-navigation/native';

// Helper to get a string key for a date (YYYY-MM-DD)
const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Generates a range of dates from a start date to an end date
const generateDateRange = (start: Date, end: Date): Date[] => {
  const range = [];
  const current = new Date(start);
  while (current <= end) {
    range.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return range;
};

export default function Index() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const screenWidth = Dimensions.get("window").width;
  const flatListRef = useRef<FlatList>(null);

  const { user } = useAuth();
  const { getProgress, refreshProgress, invalidateAllProgress } = useProgress();

  // State for user's daily objectives
  const [dailyObjectives, setDailyObjectives] = useState<{ id: string; title: string; order: number }[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(true);

  // Add a state for refreshing
  const [refreshing, setRefreshing] = useState(false);

  // State for exercise configuration
  const [exerciseConfig, setExerciseConfig] = useState<{ morning: string[]; night: string[] }>({ morning: [], night: [] });

  // Progress state with realtime updates
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [progressLoading, setProgressLoading] = useState(false);
  const progressUpdateTimeoutRef = useRef<number | null>(null);
  const prevAllCompleteRef = useRef(false);

  // Extract fetch logic to a function so it can be reused
  const fetchDailyObjectives = useCallback(async () => {
    if (!user) {
      setDailyObjectives([]);
      setLoadingObjectives(false);
      return;
    }
    setLoadingObjectives(true);
    try {
      const colRef = collection(db, "users", user.uid, "dailyList");
      const snap = await getDocs(colRef);

      // Build a map of default titles for fallback
      const defaultTitleMap = Object.fromEntries(ALL_DAILY_ITEMS.map(item => [item.id, item.title]));

      const items: { id: string; title: string; order: number; enabled: boolean }[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.enabled) {
          items.push({
            id: doc.id,
            // Prefer Firestore title, else fallback to default
            title: data.title || defaultTitleMap[doc.id] || doc.id,
            order: typeof data.order === "number" ? data.order : 999,
            enabled: true,
          });
        }
      });
      items.sort((a, b) => a.order - b.order);
      setDailyObjectives(items);
    } catch (error) {
      console.error('Error fetching daily objectives:', error);
    } finally {
      setLoadingObjectives(false);
    }
  }, [user]);

  // Fetch exercise config on user change or screen focus
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      // Fetch exercise config
      getDoc(doc(db, "users", user.uid, "dailyList", "exercises")).then(snap => {
        if (snap.exists()) {
          setExerciseConfig({
            morning: snap.data().morning || [],
            night: snap.data().night || [],
          });
        }
      }).catch(error => {
        console.error('Error fetching exercise config:', error);
      });
    }, [user])
  );

  // Use the function in useEffect
  useEffect(() => {
    fetchDailyObjectives();
  }, [fetchDailyObjectives]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Invalidate all progress cache on refresh
    invalidateAllProgress();
    await fetchDailyObjectives();
    setRefreshing(false);
  }, [fetchDailyObjectives, invalidateAllProgress]);

  const { datePages, todayIndex } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 365); 
    const pages = generateDateRange(startDate, today);
    return { datePages: pages, todayIndex: pages.length - 1 };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(todayIndex);
  const selectedDate = datePages[currentIndex];
  const isProgrammaticScroll = useRef(false);

  const handleDateChange = useCallback((newDate: Date) => {
    const newDateKey = getDateKey(newDate);
    const newIndex = datePages.findIndex(d => getDateKey(d) === newDateKey);
    if (newIndex !== -1 && newIndex !== currentIndex) {
      isProgrammaticScroll.current = true;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  }, [datePages, currentIndex]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) {
      isProgrammaticScroll.current = false;
      return;
    }
    
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / screenWidth);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < datePages.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex(newIndex);
    }
  };

  // Optimized progress update with debouncing
  const updateProgress = useCallback(async () => {
    if (!user || !selectedDate || dailyObjectives.length === 0) {
      setProgress({ completed: 0, total: 0 });
      return;
    }
    
    setProgressLoading(true);
    try {
      const newProgress = await getProgress(selectedDate, dailyObjectives, exerciseConfig);
      setProgress(newProgress);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setProgress({ completed: 0, total: dailyObjectives.length });
    } finally {
      setProgressLoading(false);
    }
  }, [user, selectedDate, dailyObjectives, exerciseConfig, getProgress]);

  // Update progress with debouncing for better performance
  useEffect(() => {
    // Clear any existing timeout
    if (progressUpdateTimeoutRef.current) {
      clearTimeout(progressUpdateTimeoutRef.current);
    }

    // Set a new timeout to update progress
    progressUpdateTimeoutRef.current = setTimeout(() => {
      updateProgress();
    }, 100); // 100ms debounce

    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, [updateProgress]);

  // Listen for progress updates using our event emitter
  useEffect(() => {
    const handleProgressUpdate = () => {
      updateProgress();
    };

    progressEventEmitter.on('progressUpdate', handleProgressUpdate);

    return () => {
      progressEventEmitter.off('progressUpdate', handleProgressUpdate);
    };
  }, [updateProgress]);

  // Watch for all tasks completed and trigger a strong vibration
  useEffect(() => {
    const allComplete = progress.total > 0 && progress.completed === progress.total;
    if (allComplete && !prevAllCompleteRef.current) {
      // Celebratory vibration sequence
      (async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 400);
      })();
    }
    prevAllCompleteRef.current = allComplete;
  }, [progress.completed, progress.total]);

  // Progress bar component with smooth animations
  const renderProgressBar = useMemo(() => {
    const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
    
    return (
      <View style={styles.progressBarWrapper}>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: theme.colors.accent,
                width: `${progressPercentage}%`,
              },
            ]}
          />
        </View>
        <View style={styles.progressTextContainer}>
          {progressLoading ? (
            <ActivityIndicator size="small" color={theme.colors.muted} />
          ) : (
            <Text style={[styles.progressText, { color: theme.colors.muted }]}>
              {progress.completed} / {progress.total} completed
              {progressPercentage === 100 && ' 🎉'}
            </Text>
          )}
        </View>
      </View>
    );
  }, [progress, progressLoading, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DateSelector date={selectedDate} onDateChange={handleDateChange} />

      {/* Optimized Progress Bar */}
      {renderProgressBar}

      {loadingObjectives ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.muted }]}>Loading your daily list...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={datePages}
          keyExtractor={getDateKey}
          renderItem={({ item }) => {
            const cards: React.ReactNode[] = [];
            dailyObjectives
              .sort((a, b) => a.order - b.order)
              .forEach((obj) => {
                if (obj.id === "exercises-morning") {
                  cards.push(
                    <ExercisesCard
                      key={`exercises-morning-${getDateKey(item)}`}
                      period="morning"
                      date={item}
                      exercises={exerciseConfig.morning}
                      refreshing={refreshing}
                      onProgressUpdate={() => refreshProgress(item)}
                    />
                  );
                } else if (obj.id === "exercises-afternoon" || obj.id === "exercises-night") {
                  cards.push(
                    <ExercisesCard
                      key={`exercises-night-${getDateKey(item)}`}
                      period="night"
                      date={item}
                      exercises={exerciseConfig.night}
                      refreshing={refreshing}
                      onProgressUpdate={() => refreshProgress(item)}
                    />
                  );
                } else {
                  cards.push(
                    <DailyCard
                      key={`${getDateKey(item)}-${obj.id}`}
                      id={obj.id}
                      title={obj.title}
                      date={item}
                      onProgressUpdate={() => refreshProgress(item)}
                    />
                  );
                }
              });

            return (
              <View style={[styles.page, { width: screenWidth }]}>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={[theme.colors.accent]}
                      tintColor={theme.colors.accent}
                    />
                  }
                  showsVerticalScrollIndicator={false}
                >
                  {cards.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                      <Text style={[styles.emptyStateText, { color: theme.colors.muted }]}>
                        No daily items enabled.
                      </Text>
                      <Text style={[styles.emptyStateSubtext, { color: theme.colors.muted }]}>
                        Go to the Daily List Builder to customize your list.
                      </Text>
                    </View>
                  ) : (
                    cards
                  )}
                </ScrollView>
              </View>
            );
          }}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={todayIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={{ flex: 1 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flex: 1 },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  progressBarWrapper: {
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  progressBarBackground: {
    height: 8,
    width: "100%",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressTextContainer: {
    minHeight: 20,
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyStateContainer: {
    marginTop: 64,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});