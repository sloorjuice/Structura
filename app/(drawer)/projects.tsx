import { useTheme } from '@/themes/theme';
import { Text, View } from "react-native";

export default function Projects() {
  const theme = useTheme();
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 18 }}>Projects Screen.</Text>
    </View>
  );
}