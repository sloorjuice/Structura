import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { db } from '@/utils/firebase';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type HobbyEntry = {
  hobby: string;
  minutes: number;
};

type Props = {
  date: Date;
  period: 'morning' | 'afternoon' | 'evening'; // <-- Add this
  hobbies: string[];
  refreshing?: boolean;
  onProgressUpdate?: () => void;
};

// Helper to get a unique key for each card
const getDatePeriodKey = (date: Date, period: string) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}_${period}`;

export default function HobbyCard({ date, period, hobbies, refreshing, onProgressUpdate }: Props) {
  const theme = useTheme();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateHobbies, setDateHobbies] = useState<HobbyEntry[]>([]);
  const [selectedHobby, setSelectedHobby] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string>("");

  // Helper to check if date is today
  const isToday = useMemo(() => {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }, [date]);

  // Fetch hobbies for this date
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetch = async () => {
      const dateKey = getDatePeriodKey(date, period);
      const ref = doc(db, "users", user.uid, "hobbyLogs", dateKey);
      const snap = await getDoc(ref);
      setDateHobbies(snap.exists() ? snap.data().entries || [] : []);
      setLoading(false);
    };
    fetch();
  }, [user, date, period, refreshing]);

  // Save hobbies for this date
  const saveDateHobbies = async (entries: HobbyEntry[]) => {
    if (!user) return;
    const dateKey = getDatePeriodKey(date, period);
    const ref = doc(db, "users", user.uid, "hobbyLogs", dateKey);
    await setDoc(ref, { entries }, { merge: true });
    setDateHobbies(entries);
    onProgressUpdate?.();
  };

  // Add a hobby entry
  const handleAddHobby = async () => {
    if (!selectedHobby || !minutes) return;
    const min = parseInt(minutes, 10);
    if (isNaN(min) || min <= 0) return;
    const newEntries = [...dateHobbies, { hobby: selectedHobby, minutes: min }];
    await saveDateHobbies(newEntries);
    setModalVisible(false);
    setSelectedHobby(null);
    setMinutes("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Edit minutes for a hobby
  const handleEditMinutes = async (idx: number, newMinutes: string) => {
    const min = parseInt(newMinutes, 10);
    if (isNaN(min) || min < 0) return;
    const newEntries = [...dateHobbies];
    newEntries[idx] = { ...newEntries[idx], minutes: min };
    await saveDateHobbies(newEntries);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Remove a hobby entry
  const handleRemoveHobby = async (idx: number) => {
    const newEntries = dateHobbies.filter((_, i) => i !== idx);
    await saveDateHobbies(newEntries);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Progress calculation: complete if at least one hobby is logged
  const progress = useMemo(() => ({
    completed: dateHobbies.length > 0 ? 1 : 0,
    total: 1,
    percentage: dateHobbies.length > 0 ? 1 : 0,
  }), [dateHobbies]);

  // UI
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {/* Progress Bar */}
      <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: theme.colors.accent,
              width: `${progress.percentage * 100}%`,
            },
          ]}
        />
      </View>

      <TouchableOpacity
        style={styles.header}
        onPress={() => { setExpanded(e => !e); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Hobbies {dateHobbies.length > 0 && `(${dateHobbies.length})`}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={theme.colors.icon || theme.colors.text}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.accent} />
              <Text style={[styles.loadingText, { color: theme.colors.muted }]}>Loading hobbies...</Text>
            </View>
          ) : (
            <>
              {dateHobbies.length === 0 && (
                <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
                  No hobbies logged for this day.
                </Text>
              )}
              {dateHobbies.map((entry, idx) => (
                <View key={idx} style={styles.hobbyRow}>
                  <Text style={[styles.hobbyText, { color: theme.colors.text }]}>
                    {entry.hobby}
                  </Text>
                  <TextInput
                    style={[styles.minutesInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={String(entry.minutes)}
                    keyboardType="numeric"
                    editable={isToday}
                    onChangeText={val => handleEditMinutes(idx, val)}
                  />
                  <Text style={{ color: theme.colors.muted, marginLeft: 4 }}>min</Text>
                  {isToday && (
                    <TouchableOpacity onPress={() => handleRemoveHobby(idx)} style={{ marginLeft: 8 }}>
                      <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {/* Add Hobby Button */}
              <TouchableOpacity
                style={[styles.addRow, { borderBottomWidth: 0 }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={theme.colors.accent}
                />
                <Text style={[styles.addText, { color: theme.colors.accent }]}>
                  Add a hobby...
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Modal for selecting a hobby and entering minutes */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: theme.colors.card,
                padding: 24,
                borderRadius: 12,
                width: '80%',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: 18, marginBottom: 16, color: theme.colors.text }}>
                  Select a hobby
                </Text>
                {/* Replace this with your hobby picker */}
                {hobbies.map(hobby => (
                  <TouchableOpacity
                    key={hobby}
                    style={{
                      padding: 10,
                      marginVertical: 4,
                      backgroundColor: selectedHobby === hobby ? theme.colors.accent : theme.colors.surface,
                      borderRadius: 8,
                      width: '100%',
                      alignItems: 'center'
                    }}
                    onPress={() => setSelectedHobby(hobby)}
                  >
                    <Text style={{ color: theme.colors.text }}>{hobby}</Text>
                  </TouchableOpacity>
                ))}
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 16,
                    width: '100%',
                    color: theme.colors.text,
                  }}
                  placeholder="Minutes spent"
                  placeholderTextColor={theme.colors.muted}
                  keyboardType="numeric"
                  value={minutes}
                  onChangeText={setMinutes}
                />
                <View style={{ flexDirection: 'row', marginTop: 16 }}>
                  <Button title="Add" onPress={handleAddHobby} disabled={!selectedHobby || !minutes} />
                  <View style={{ width: 16 }} />
                  <Button title="Cancel" color={theme.colors.muted} onPress={() => setModalVisible(false)} />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  dropdown: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hobbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  hobbyText: {
    flex: 1,
    fontSize: 16,
  },
  minutesInput: {
    width: 48,
    borderWidth: 1,
    borderRadius: 6,
    padding: 4,
    textAlign: 'center',
    marginLeft: 8,
    marginRight: 2,
    fontSize: 15,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  addText: {
    marginLeft: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  progressBarBackground: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});