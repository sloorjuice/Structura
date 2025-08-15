import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useTheme } from '@/themes/theme';
import { getObjectiveStatus, updateObjectiveStatus } from '@/utils/dailyObjectives';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-gesture-handler';

type Props = {
  id: string;
  title: string;
  date: Date;
  onProgressUpdate?: () => void;
};

export default function DailyCard({ id, title, date, onProgressUpdate }: Props) {
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { emitProgressUpdate } = useProgress();

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch status when ready
  useEffect(() => {
    let ignore = false;

    const fetchStatus = async () => {
      if (!user || authLoading) {
        setLoading(false);
        setChecked(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const status = await getObjectiveStatus(user.uid, id, date);
        if (!ignore) setChecked(status);
      } catch (e) {
        if (!ignore) setError('Failed to load status');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchStatus();
    return () => { ignore = true; };
  }, [id, date, user, authLoading]);

  // Handle toggle with haptic feedback and progress refresh
  const handleToggle = async (value: boolean) => {
    if (!user) return;
    setChecked(value);
    setError(null);
    
    // Haptic feedback
    Haptics.impactAsync(
      value ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    
    try {
      await updateObjectiveStatus(user.uid, id, date, value);
      // Trigger progress update callback
      onProgressUpdate?.();
      // Emit progress update event
      emitProgressUpdate();
    } catch {
      setChecked(!value);
      setError('Failed to update');
      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Loading auth state
  if (authLoading) {
    return (
      <CardContainer theme={theme} opacity={0.7}>
        <ActivityIndicator size="small" color={theme.colors.accent} style={{ marginRight: theme.spacing.sm }} />
        <Text style={[styles.title, { color: theme.colors.text, ...theme.fonts.medium }]}>{title}</Text>
      </CardContainer>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <CardContainer theme={theme} opacity={0.7}>
        <Switch
          value={false}
          disabled
          style={{ marginRight: theme.spacing.sm }}
          thumbColor={theme.colors.surface}
          trackColor={{ false: theme.colors.muted, true: theme.colors.accent }}
        />
        <Text style={[styles.title, { color: theme.colors.text, ...theme.fonts.medium }]}>
          {title} (Sign in required)
        </Text>
      </CardContainer>
    );
  }

  // Main card
  return (
    <CardContainer theme={theme}>
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.accent} style={{ marginRight: theme.spacing.sm }} />
      ) : (
        <Switch
          value={checked}
          onValueChange={handleToggle}
          style={[styles.checkbox, { marginRight: theme.spacing.sm }]}
          thumbColor={checked ? theme.colors.accent : theme.colors.surface}
          trackColor={{ false: theme.colors.muted, true: theme.colors.accent }}
        />
      )}
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            ...theme.fonts.medium,
            textDecorationLine: checked ? 'line-through' : 'none',
            opacity: checked ? 0.7 : 1,
          },
        ]}
      >
        {title}{error ? ` (${error})` : ''}
      </Text>
    </CardContainer>
  );
}

// Extracted for DRYness
function CardContainer({ children, theme, opacity = 1 }: { children: React.ReactNode, theme: any, opacity?: number }) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          opacity,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    marginVertical: 8,
    height: 60,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkbox: {},
});