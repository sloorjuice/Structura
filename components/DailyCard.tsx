import { useTheme } from '@/themes/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-gesture-handler';

type Props = {
  title: string;
};

export default function DailyCard({ title }: Props) {
  const [checked, setChecked] = useState(false);
  const theme = useTheme();

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
      <Switch
        value={checked}
        onValueChange={setChecked}
        style={[styles.checkbox, { marginRight: theme.spacing.sm }]}
        thumbColor={checked ? theme.colors.accent : theme.colors.surface}
        trackColor={{ false: theme.colors.muted, true: theme.colors.accent }}
      />
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, ...theme.fonts.medium },
        ]}
      >
        {title}
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