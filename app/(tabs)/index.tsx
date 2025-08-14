import { ScrollView, StyleSheet, View } from "react-native";

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
  return (
    <View style={styles.container}>
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
    backgroundColor: "#f8f8f8",
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