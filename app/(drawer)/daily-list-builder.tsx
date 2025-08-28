import { ALL_DAILY_ITEMS } from '@/constants/dailyItems';
import { EXERCISES } from '@/constants/exercises';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { db } from '@/utils/firebase';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

type DailyItem = typeof ALL_DAILY_ITEMS[number] & { enabled: boolean; order: number };

export default function DailyListBuilder() {
  const theme = useTheme();
  const { user } = useAuth();
  const [items, setItems] = useState<DailyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [morningExercises, setMorningExercises] = useState<string[]>([]);
  const [nightExercises, setNightExercises] = useState<string[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch user's daily list config
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      const colRef = collection(db, 'users', user.uid, 'dailyList');
      const snap = await getDocs(colRef);
      const userMap: Record<string, { enabled: boolean; order: number }> = {};
      snap.forEach(doc => {
        const { enabled = false, order = 999 } = doc.data() || {};
        userMap[doc.id] = { enabled, order };
      });
      // Merge with all possible items, preserving order
      const merged = ALL_DAILY_ITEMS.map((item, i) => ({
        ...item,
        enabled: userMap[item.id]?.enabled ?? false,
        order: userMap[item.id]?.order ?? i,
      }));
      // Sort by order
      merged.sort((a, b) => a.order - b.order);
      setItems(merged);

      // --- Fetch exercises config ---
      const exercisesDoc = await getDoc(doc(db, 'users', user.uid, 'dailyList', 'exercises'));
      if (exercisesDoc.exists()) {
        const data = exercisesDoc.data();
        setMorningExercises(Array.isArray(data.morning) ? data.morning : []);
        setNightExercises(Array.isArray(data.night) ? data.night : []);
      } else {
        setMorningExercises([]);
        setNightExercises([]);
      }
      setLoading(false);
      setInitialLoad(false);
    })();
  }, [user]);

  // Save exercises config when changed (but not during initial load)
  useEffect(() => {
    if (!user || loading || initialLoad) return;
    const saveExercises = async () => {
      setSaving(true);
      const docRef = doc(db, 'users', user.uid, 'dailyList', 'exercises');
      await setDoc(docRef, {
        morning: morningExercises,
        night: nightExercises,
      }, { merge: true });
      setSaving(false);
    };
    saveExercises();
  }, [morningExercises, nightExercises, user, loading, initialLoad]);

  // Toggle enable/disable
  const handleToggle = useCallback(
    async (itemId: string, value: boolean) => {
      if (!user) return;
      setSaving(true);
      setItems(prev =>
        prev.map(item => item.id === itemId ? { ...item, enabled: value } : item)
      );
      const docRef = doc(db, 'users', user.uid, 'dailyList', itemId);
      await setDoc(docRef, { enabled: value }, { merge: true });
      setSaving(false);
    },
    [user]
  );

  // Handle reorder
  const handleDragEnd = useCallback(
    async ({ data }: { data: DailyItem[] }) => {
      setSaving(true);
      setItems(data);
      if (!user) return;
      // Batch update order fields
      const batch = writeBatch(db);
      data.forEach((item, idx) => {
        const docRef = doc(db, 'users', user.uid, 'dailyList', item.id);
        batch.set(docRef, { order: idx }, { merge: true });
      });
      const docRef = doc(db, 'users', user.uid, 'dailyList', 'exercises');
      batch.set(docRef, {
        morning: morningExercises,
        night: nightExercises,
      }, { merge: true });
      await batch.commit();
      setSaving(false);
    },
    [user, morningExercises, nightExercises]
  );

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

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={{ color: theme.colors.muted, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.header, { color: theme.colors.text, ...theme.fonts.bold }]}>
        Customize Your Daily List
      </Text>
      <Text style={[styles.sub, { color: theme.colors.muted, ...theme.fonts.regular }]}>
        Enable, disable, and reorder your daily items.
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
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <Text style={{ color: theme.colors.muted, marginLeft: 8 }}>Saving...</Text>
        </View>
      )}
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
            />
            <Text style={{ marginLeft: 8, color: theme.colors.text }}>{ex}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, marginBottom: 4 },
  sub: { fontSize: 15, marginBottom: 8 },
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
  savingOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});