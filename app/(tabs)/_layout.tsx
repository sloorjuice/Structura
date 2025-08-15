import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Tabs } from 'expo-router';


export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { 
          backgroundColor: theme.colors.headerBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.headerText,
        headerTitleStyle: {
          ...theme.fonts.bold,
          fontSize: 18,
        },
        headerLeft: () => <DrawerToggleButton tintColor={theme.colors.headerText} />,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.tabBarActiveTint,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          ...theme.fonts.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daily Tracker',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="today" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
