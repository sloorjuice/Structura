import { ALL_DAILY_ITEMS } from '@/constants/dailyItems';
import { EXERCISES } from '@/constants/exercises';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { db } from '@/utils/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, writeBatch } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';

type DailyItem = typeof ALL_DAILY_ITEMS[number] & { enabled: boolean; order: number };

export default function DailyListSetup() {
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<DailyItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [morningExercises, setMorningExercises] = useState<string[]>([]);
  const [nightExercises, setNightExercises] = useState<string[]>([]);

  // Initialize with all enabled and default order
  useEffect(() => {
    setItems(
      ALL_DAILY_ITEMS.map((item, i) => ({
        ...item,
        enabled: true,
        order: i,
      }))
    );
  }, []);

  // Toggle enable/disable
  const handleToggle = useCallback(
    (itemId: string, value: boolean) => {
      setItems(prev =>
        prev.map(item => item.id === itemId ? { ...item, enabled: value } : item)
      );
    },
    []
  );

  // Handle reorder
  const handleDragEnd = useCallback(
    ({ data }: { data: DailyItem[] }) => {
      setItems(data.map((item, idx) => ({ ...item, order: idx })));
    },
    []
  );

  // Save to Firestore and go to next step
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const batch = writeBatch(db);
    items.forEach((item, idx) => {
      const docRef = doc(db, 'users', user.uid, 'dailyList', item.id);
      batch.set(docRef, { enabled: item.enabled, order: idx, title: item.title }, { merge: true });
    });
    const docRef = doc(db, 'users', user.uid, 'dailyList', 'exercises');
    batch.set(docRef, {
      morning: morningExercises,
      night: nightExercises,
    }, { merge: true });
    await batch.commit();
    setSaving(false);
    router.replace('/(tabs)');
  };

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<DailyItem>) => (
      <View
        style={[
          styles.card,
          {
            backgroundColor: isActive
              ? theme.colors.accent
              : theme.colors.card,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
            opacity: saving ? 0.7 : 1,
          },
        ]}
      >
        <Ionicons
          name="menu"
          size={22}
          color={theme.colors.icon}
          style={{ marginRight: 12 }}
          onLongPress={drag}
        />
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              ...theme.fonts.medium,
              flex: 1,
            },
          ]}
          onLongPress={drag}
        >
          {item.title}
        </Text>
        <Switch
          value={item.enabled}
          onValueChange={v => handleToggle(item.id, v)}
          thumbColor={item.enabled ? theme.colors.accent : theme.colors.surface}
          trackColor={{ false: theme.colors.muted, true: theme.colors.accent }}
          disabled={saving}
        />
      </View>
    ),
    [theme, handleToggle, saving]
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.header, { color: theme.colors.text, ...theme.fonts.bold }]}>
          Set Up Your Daily List
        </Text>
        <Text style={[styles.sub, { color: theme.colors.muted, ...theme.fonts.regular }]}>
          Enable, disable, and reorder your daily items. You can always change this later!
        </Text>
        <DraggableFlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onDragEnd={handleDragEnd}
          activationDistance={12}
          containerStyle={{ marginTop: 16 }}
          contentContainerStyle={{ paddingBottom: 16 }}
          scrollEnabled={false}
        />
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.header, { color: theme.colors.text, ...theme.fonts.bold }]}>
            Morning Exercises
          </Text>
          {EXERCISES.map(ex => (
            <View key={ex} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Switch
                value={morningExercises.includes(ex)}
                onValueChange={v => setMorningExercises(prev =>
                  v ? [...prev, ex] : prev.filter(e => e !== ex)
                )}
                disabled={saving}
              />
              <Text style={{ marginLeft: 8, color: theme.colors.text }}>{ex}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 16, marginBottom: 32 }}>
          <Text style={[styles.header, { color: theme.colors.text, ...theme.fonts.bold }]}>
            Night Exercises
          </Text>
          {EXERCISES.map(ex => (
            <View key={ex} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Switch
                value={nightExercises.includes(ex)}
                onValueChange={v => setNightExercises(prev =>
                  v ? [...prev, ex] : prev.filter(e => e !== ex)
                )}
                disabled={saving}
              />
              <Text style={{ marginLeft: 8, color: theme.colors.text }}>{ex}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.md,
              opacity: saving ? 0.7 : 1,
            }
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
          ) : null}
          <Text style={[styles.saveButtonText, theme.fonts.bold]}>
            {saving ? 'Saving...' : 'Save & Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, marginBottom: 4, textAlign: 'center' },
  sub: { fontSize: 15, marginBottom: 8, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 17 },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
    minHeight: 54,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 18,
  },
});