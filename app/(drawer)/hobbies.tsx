import { HOBBIES } from "@/constants/hobbies";
import { useAuth } from "@/contexts/AuthContext";
import { getUserHobbies, setUserHobbies } from "@/services/hobbies";
import { useTheme } from '@/themes/theme';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: theme.spacing.md, justifyContent: "center" }}>
          {selected.length === 0 ? (
            <Text style={{ color: theme.colors.textSecondary }}>No hobbies selected yet.</Text>
          ) : (
            HOBBIES.filter(h => selected.includes(h.id)).map(hobby => (
              <View key={hobby.id} style={{ margin: 8, alignItems: "center" }}>
                <Text style={{ fontSize: 28 }}>{hobby.icon}</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14 }}>{hobby.title}</Text>
              </View>
            ))
          )}
        </View>
      </View>
      <View style={{ marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.md }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: theme.spacing.md }}>All Hobbies</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
          {HOBBIES.map(hobby => {
            const isSelected = selected.includes(hobby.id);
            return (
              <TouchableOpacity
                key={hobby.id}
                onPress={() => toggleHobby(hobby.id)}
                style={{
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                  borderRadius: theme.radius.md,
                  padding: 12,
                  margin: 6,
                  alignItems: "center",
                  minWidth: 80,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Text style={{ fontSize: 24 }}>{hobby.icon}</Text>
                <Text style={{ color: isSelected ? "#fff" : theme.colors.text, fontWeight: isSelected ? "bold" : "normal", marginTop: 4, fontSize: 13 }}>
                  {hobby.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}