import { getTheme } from "@/themes/theme";
import { ScrollView, StyleSheet, View, useColorScheme } from "react-native";

import DailyCard from "@/components/DailyCard";
import DateSelector from "@/components/DateSelector";

const dailyObjectives = [
  { title: "Breakfast"},
  { title: "Brush Teeth"},
  { title: "Exercises"},
  { title: "Shower (Morning)"},
  { title: "Meditation"},
  { title: "Journal"},
  { title: "Hobby"},
  { title: "Lunch"},
  { title: "Brush Teeth"},
  { title: "Hobby"},
  { title: "Dinner"},
  { title: "Journal"},
  { title: "Hobby"},
  { title: "Brush Teeth"},
]

export default function Index() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DateSelector />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {dailyObjectives.map((obj, idx) => (
          <DailyCard key={idx} title={obj.title} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 24,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
});