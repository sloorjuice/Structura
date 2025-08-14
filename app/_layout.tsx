import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.headerBackground },
            headerTintColor: theme.colors.headerText,
            drawerStyle: { 
              backgroundColor: theme.colors.tabBarBackground,
              width: 280, // More comfortable width
            },
            drawerActiveTintColor: theme.colors.accent,
            drawerInactiveTintColor: theme.colors.text,
            // Fix icon and label alignment
            drawerLabelStyle: {
              fontSize: 16,    // Slightly larger text
              marginLeft: -5,  // Less negative margin to prevent overlap
            },
            // Add some spacing between items
            drawerItemStyle: {
              marginVertical: 2,
              borderRadius: 8,
              paddingLeft: 5,  // Add some padding to fix alignment
            },
            // Add subtle background for active item
            drawerActiveBackgroundColor: theme.dark 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.05)',
            // Instead of drawerIconStyle (which isn't in the type definition),
            // we'll configure each icon individually in the drawer items
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              title: 'Daily Tracker',
              headerShown: false,
              drawerIcon: ({ color, size }) => (
                <Ionicons 
                  name="home" 
                  size={size} 
                  color={color} 
                  style={{ width: 24, marginRight: 12 }}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="(drawer)/hobbies"
            options={{
              title: 'Hobbies',
              drawerIcon: ({ color, size }) => (
                <Ionicons 
                  name="heart" 
                  size={size} 
                  color={color} 
                  style={{ width: 24, marginRight: 12 }}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="(drawer)/projects"
            options={{
              title: 'Projects',
              drawerIcon: ({ color, size }) => (
                <Ionicons 
                  name="folder" 
                  size={size} 
                  color={color} 
                  style={{ width: 24, marginRight: 12 }}
                />
              ),
            }}
          />
          {/* Hidden screens */}
          <Drawer.Screen 
            name="+not-found" 
            options={{ 
              drawerItemStyle: { height: 0 } 
            }} 
          />
        </Drawer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}