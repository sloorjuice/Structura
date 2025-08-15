import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { getObjectiveStatus, updateObjectiveStatus } from '@/utils/dailyObjectives';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-gesture-handler';

type Props = {
  id: string;       // Unique identifier for the objective
  title: string;    // Display title
  date: Date;       // Date for which to show/save the status
};

export default function DailyCard({ id, title, date }: Props) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();

  // Fetch the initial state when the component mounts or date changes
  useEffect(() => {
    const fetchStatus = async () => {
      if (authLoading) return; // Wait for auth to initialize
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const status = await getObjectiveStatus(id, date);
        setChecked(status);
      } catch (error) {
        console.error(`Error fetching objective status for ${id}:`, error);
        setError('Failed to load status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [id, date, user, authLoading]);

  // Handle status change
  const handleToggle = async (value: boolean) => {
    if (!user) return;

    setChecked(value); // Optimistic update
    setError(null);
    
    try {
      await updateObjectiveStatus(id, date, value);
      console.log(`Successfully toggled ${id} to ${value} on ${Platform.OS}`);
    } catch (error) {
      console.error(`Failed to update objective status for ${id}:`, error);
      setChecked(!value); // Revert on failure
      setError('Failed to update');
    }
  };

  // If not authenticated, show a disabled state
  if (!user && !authLoading) {
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
            opacity: 0.7
          },
        ]}
      >
        <Switch
          value={false}
          disabled={true}
          style={{ marginRight: theme.spacing.sm }}
          thumbColor={theme.colors.surface}
          trackColor={{ false: theme.colors.muted, true: theme.colors.accent }}
        />
        <Text style={[styles.title, { color: theme.colors.text, ...theme.fonts.medium }]}>
          {title} {error ? ' (Sign in required)' : ''}
        </Text>
      </View>
    );
  }

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
        },
      ]}
    >
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
            opacity: checked ? 0.7 : 1
          },
        ]}
      >
        {title} {error ? ` (${error})` : ''}
      </Text>
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