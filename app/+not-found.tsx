import { useTheme } from '@/themes/theme';
import { Link, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from "react-native";

export default function NotFound() {
  const navigation = useNavigation();
  const theme = useTheme();
  
  // Hide this screen from the drawer
  useEffect(() => {
    navigation.setOptions({
      drawerItemStyle: { display: 'none' }
    });
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Link href="/">
        <Text style={{color: theme.colors.accent, textDecorationLine: 'underline'}}>
          Go back to Home screen!
        </Text>
      </Link>
    </View>
  );
}
