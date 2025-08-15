import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type ProgressBarProps = {
  completed: number;
  total: number;
  loading: boolean;
  theme: any;
};

export default function ProgressBar({ completed, total, loading, theme }: ProgressBarProps) {
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.progressBarWrapper}>
      <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: theme.colors.accent,
              width: `${progressPercentage}%`,
            },
          ]}
        />
      </View>
      <View style={styles.progressTextContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.muted} />
        ) : (
          <Text style={[styles.progressText, { color: theme.colors.muted }]}>
            {completed} / {total} completed
            {` (${Math.round(progressPercentage)}%)`}
            {progressPercentage === 100 && ' 🎉'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressBarWrapper: {
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  progressBarBackground: {
    height: 8,
    width: "100%",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressTextContainer: {
    minHeight: 20,
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 12,
    textAlign: "center",
  },
});