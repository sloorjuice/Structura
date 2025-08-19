import { HOBBIES } from "@/constants/hobbies";
import { useAuth } from "@/contexts/AuthContext";
import { getUserHobbies, setUserHobbies } from "@/services/hobbies";
import { useTheme } from '@/themes/theme';
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

const HobbyButton = ({
  hobby,
  isSelected,
  onPress,
  theme,
}: {
  hobby: typeof HOBBIES[number];
  isSelected: boolean;
  onPress: () => void;
  theme: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={{
      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 16,
      margin: 8,
      alignItems: "center",
      minWidth: 90,
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
      shadowColor: isSelected ? theme.colors.primary : "#000",
      shadowOpacity: isSelected ? 0.18 : 0.08,
      shadowRadius: 8,
      elevation: isSelected ? 4 : 1,
      position: "relative",
    }}
  >
    <Text style={{ fontSize: 28 }}>{hobby.icon}</Text>
    <Text
      style={{
        color: isSelected ? "#fff" : theme.colors.text,
        fontWeight: isSelected ? "bold" : "500",
        marginTop: 6,
        fontSize: 14,
        textAlign: "center",
      }}
    >
      {hobby.title}
    </Text>
    {isSelected && (
      <View
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "#fff",
          borderRadius: 10,
          padding: 2,
        }}
      >
        <Text style={{ fontSize: 14, color: theme.colors.primary }}>✓</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function Hobbies() {
  const theme = useTheme();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ alignItems: "center", marginTop: theme.spacing.lg }}>
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold" }}>Your Hobbies</Text>
        {Object.keys(groupedSelected).length === 0 ? (
          <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.md }}>No hobbies selected yet.</Text>
        ) : (
          Object.entries(groupedSelected).map(([category, hobbies]) => (
            <View key={category} style={{ marginTop: theme.spacing.md, width: "100%" }}>
              <Text style={{ color: theme.colors.textSecondary, fontWeight: "bold", marginBottom: 4, marginLeft: 12 }}>{category}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
                {hobbies.map(hobby => (
                  <View key={hobby.id} style={{ margin: 8, alignItems: "center" }}>
                    <Text style={{ fontSize: 28 }}>{hobby.icon}</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 14 }}>{hobby.title}</Text>
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
          <View
            key={category}
            style={{
              marginBottom: theme.spacing.lg,
              backgroundColor: theme.colors.card,
              borderRadius: 18,
              padding: 14,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontWeight: "bold",
                marginBottom: 8,
                marginLeft: 4,
                fontSize: 16,
                textAlign: "left",
                letterSpacing: 0.2,
              }}
            >
              {category}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
              {hobbies.map(hobby => (
                <HobbyButton
                  key={hobby.id}
                  hobby={hobby}
                  isSelected={selected.includes(hobby.id)}
                  onPress={() => toggleHobby(hobby.id)}
                  theme={theme}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}