import { getTheme } from '@/themes/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        headerStyle: {
          backgroundColor: theme.colors.headerBackground,
        },
        headerShadowVisible: false,
        headerTintColor: theme.colors.headerText,
        headerTitleAlign: "center",
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Daily Objectives',
          headerLeft: () => (
            <TouchableOpacity 
              style={{ marginLeft: 16 }} 
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            >
              <Ionicons name="menu" size={28} color={theme.colors.icon} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
              <Ionicons name="star" size={22} color={theme.colors.accent} style={{ marginRight: 6 }} />
              <Text style={{ color: theme.colors.text, fontWeight: "bold", fontSize: 16 }}>17 Days</Text>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          headerLeft: () => (
            <TouchableOpacity 
              style={{ marginLeft: 16 }} 
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            >
              <Ionicons name="menu" size={28} color={theme.colors.icon} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
              <Ionicons name="star" size={22} color={theme.colors.accent} style={{ marginRight: 6 }} />
              <Text style={{ color: theme.colors.text, fontWeight: "bold", fontSize: 16 }}>17 Days</Text>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
          ),
        }} 
      />  
    </Tabs>
  );
}
