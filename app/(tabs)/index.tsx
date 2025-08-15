import { getTheme } from "@/themes/theme";
import * as Haptics from "expo-haptics"; // 1. Import Haptics
import { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, useColorScheme, View } from "react-native";

import DailyCard from "@/components/DailyCard";
import DateSelector from "@/components/DateSelector";

// Mock Data with unique IDs
const dailyObjectives = [
  { id: "breakfast", title: "Eat Breakfast" },
  { id: "brush-teeth-morning", title: "Brush Teeth (Morning)" },
  { id: "exercises", title: "Exercises" },
  { id: "shower-morning", title: "Shower (Morning)" },
  { id: "meditation", title: "Meditate" },
  { id: "journal-morning", title: "Journal – Plan Your Day" },
  { id: "hobby-morning", title: "Work on a Hobby (Morning)" },
  { id: "lunch", title: "Eat Lunch" },
  { id: "hobby-afternoon", title: "Work on a Hobby (Afternoon)" },
  { id: "dinner", title: "Eat Dinner" },
  { id: "journal-evening", title: "Journal – Reflect on Your Day" },
  { id: "hobby-evening", title: "Work on a Hobby (Evening)" },
  { id: "brush-teeth-night", title: "Brush Teeth (Night)" },
];

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

export default function Index() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const screenWidth = Dimensions.get("window").width;
  const flatListRef = useRef<FlatList>(null);

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
      
      <FlatList
        ref={flatListRef}
        data={datePages}
        keyExtractor={getDateKey}
        renderItem={({ item }) => (
          <View style={[styles.page, { width: screenWidth }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {dailyObjectives.map((obj) => (
                <DailyCard 
                  key={`${getDateKey(item)}-${obj.id}`}
                  id={obj.id}
                  title={obj.title}
                  date={item}
                />
              ))}
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