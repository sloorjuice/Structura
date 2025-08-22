import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Hobby = {
  id: string;
  title: string;
  icon: string;
  category: string;
};

export default function HobbyButton({
  hobby,
  isSelected,
  onPress,
  theme,
}: {
  hobby: Hobby;
  isSelected: boolean;
  onPress: () => void;
  theme: any;
}) {
  return (
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
}