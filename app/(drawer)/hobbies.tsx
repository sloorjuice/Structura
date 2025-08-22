import { HOBBIES } from "@/constants/hobbies";
import { useAuth } from "@/contexts/AuthContext";
import { getUserHobbies, setUserHobbies } from "@/services/hobbies";
import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

// Helper to group hobbies by category
const groupByCategory = (hobbies: typeof HOBBIES) => {
  return hobbies.reduce((acc, hobby) => {
    acc[hobby.category] = acc[hobby.category] || [];
    acc[hobby.category].push(hobby);
    return acc;
  }, {} as Record<string, typeof HOBBIES>);
};

export default function Hobbies() {
  const theme = useTheme();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const HOBBIES_PER_CATEGORY = 5; // Number to show before "Show More"

  // Fetch user's hobbies from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchHobbies = async () => {
      setLoading(true);
      setSelected(await getUserHobbies(user.uid));
      setLoading(false);
    };
    fetchHobbies();
  }, [user]);

  const saveHobbies = async (newList: string[]) => {
    if (!user) return;
    await setUserHobbies(user.uid, newList);
  };

  // Toggle hobby selection
  const toggleHobby = (id: string) => {
    let newList;
    if (selected.includes(id)) {
      newList = selected.filter(h => h !== id);
    } else {
      newList = [...selected, id];
    }
    setSelected(newList);
    saveHobbies(newList);
  };

  const groupedAll = groupByCategory(HOBBIES);
  const groupedSelected = groupByCategory(HOBBIES.filter(h => selected.includes(h.id)));

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Please sign in to manage your hobbies.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={{ marginTop: theme.spacing.lg, paddingHorizontal: theme.spacing.md }}>
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginBottom: theme.spacing.md }}>Your Hobbies</Text>
        {Object.keys(groupedSelected).length === 0 ? (
          <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.md }}>No hobbies selected yet.</Text>
        ) : (
          Object.entries(groupedSelected).map(([category, hobbies]) => (
            <View key={category} style={{ marginTop: theme.spacing.md }}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: "bold", marginBottom: 4, marginLeft: 4 }}>{category}</Text>
              <View style={{ flexDirection: "column", width: "100%" }}>
                {hobbies.map(hobby => (
                  <View
                    key={hobby.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.colors.card,
                      borderRadius: 12,
                      marginBottom: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      shadowColor: "#000",
                      shadowOpacity: 0.03,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Text style={{ fontSize: 26, marginRight: 14 }}>{hobby.icon}</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 16 }}>{hobby.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>
      <View style={{ marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.md }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: theme.spacing.md }}>All Hobbies</Text>
        {Object.entries(groupedAll).map(([category, hobbies]) => (
          <View key={category} style={{ marginBottom: theme.spacing.lg }}>
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontWeight: "bold",
                marginBottom: 8,
                marginLeft: 4,
                fontSize: 16,
                textAlign: "left",
                letterSpacing: 0.2,
                marginTop: 8,
              }}
            >
              {category}
            </Text>
            <View style={{ flexDirection: "column", width: "100%" }}>
              {(showAll ? hobbies : hobbies.slice(0, HOBBIES_PER_CATEGORY)).map((hobby, idx, arr) => (
                <View
                  key={hobby.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.colors.card,
                    borderRadius: 12,
                    marginBottom: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    shadowColor: "#000",
                    shadowOpacity: 0.03,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 26, marginRight: 14 }}>{hobby.icon}</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 16 }}>{hobby.title}</Text>
                  <TouchableOpacity
                    onPress={() => toggleHobby(hobby.id)}
                    style={{
                      marginLeft: "auto",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    {selected.includes(hobby.id) ? (
                      <Ionicons name="remove" size={16} color={theme.colors.primary} />
                    ) : (
                      <Ionicons name="add" size={16} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
              {!showAll && hobbies.length > HOBBIES_PER_CATEGORY && (
                <TouchableOpacity onPress={() => setShowAll(true)} style={{ paddingVertical: 10, alignItems: "center" }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>Show More</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}