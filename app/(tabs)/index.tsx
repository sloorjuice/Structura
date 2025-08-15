import { useAuth } from "@/contexts/AuthContext";
import { getTheme } from "@/themes/theme";
import { db } from "@/utils/firebase";
import * as Haptics from "expo-haptics"; // 1. Import Haptics
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, RefreshControl, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import DailyCard from "@/components/DailyCard";
import DateSelector from "@/components/DateSelector";

// Helper to get a string key for a date (YYYY-MM-DD)
const getDateKey = (date: Date): string => {
  // Always use local date, not UTC
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

// Add ALL_DAILY_ITEMS here or import from a shared file if you prefer
const ALL_DAILY_ITEMS = [
  { id: "breakfast", title: "Eat Breakfast" },
  { id: "brush-teeth-morning", title: "Brush Teeth (Morning)" },
  { id: "exercises-morning", title: "Exercises (Morning)" },
  { id: "shower-morning", title: "Shower (Morning)" },
  { id: "meditation", title: "Meditate" },
  { id: "journal-morning", title: "Journal – Plan Your Day" },
  { id: "hobby-morning", title: "Work on a Hobby (Morning)" },
  { id: "lunch", title: "Eat Lunch" },
  { id: "brush-teeth-afternoon", title: "Brush Teeth (Afternoon)" },
  { id: "hobby-afternoon", title: "Work on a Hobby (Afternoon)" },
  { id: "exercises-afternoon", title: "Exercises (Afternoon)" },
  { id: "dinner", title: "Eat Dinner" },
  { id: "shower-night", title: "Shower (Night)" },
  { id: "journal-evening", title: "Journal – Reflect on Your Day" },
  { id: "hobby-evening", title: "Work on a Hobby (Evening)" },
  { id: "brush-teeth-night", title: "Brush Teeth (Night)" },
];

export default function Index() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const screenWidth = Dimensions.get("window").width;
  const flatListRef = useRef<FlatList>(null);

  const { user } = useAuth();

  // 1. State for user's daily objectives
  const [dailyObjectives, setDailyObjectives] = useState<{ id: string; title: string; order: number }[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(true);

  // Add a state for refreshing
  const [refreshing, setRefreshing] = useState(false);

  // Extract fetch logic to a function so it can be reused
  const fetchDailyObjectives = useCallback(async () => {
    if (!user) {
      setDailyObjectives([]);
      setLoadingObjectives(false);
      return;
    }
    setLoadingObjectives(true);
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
    setLoadingObjectives(false);
  }, [user]);

  // Use the function in useEffect
  useEffect(() => {
    fetchDailyObjectives();
  }, [fetchDailyObjectives]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDailyObjectives();
    setRefreshing(false);
  }, [fetchDailyObjectives]);

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

    if (newIndex !== currentIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 2. Add rumble on slide
      setCurrentIndex(newIndex);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DateSelector date={selectedDate} onDateChange={handleDateChange} />

      {loadingObjectives ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={datePages}
          keyExtractor={getDateKey}
          renderItem={({ item }) => (
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
              >
                {dailyObjectives.length === 0 ? (
                  <Text style={{ color: theme.colors.muted, marginTop: 32, textAlign: "center" }}>
                    No daily items enabled. Go to the Daily List Builder to customize your list.
                  </Text>
                ) : (
                  [...dailyObjectives]
                    .sort((a, b) => a.order - b.order)
                    .map((obj) => (
                      <DailyCard
                        key={`${getDateKey(item)}-${obj.id}`}
                        id={obj.id}
                        title={obj.title}
                        date={item}
                      />
                    ))
                )}
              </ScrollView>
            </View>
          )}
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
});