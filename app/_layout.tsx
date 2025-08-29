// app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { useTheme } from '@/themes/theme';
import { isFirstLaunch } from '@/utils/firstLaunch'; // Add this import
import { Ionicons } from '@expo/vector-icons';
import { SplashScreen, useRouter, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function LoadingScreen() {
  const theme = useTheme();
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: theme.colors.background 
    }}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={{ 
        color: theme.colors.muted, 
        marginTop: 16, 
        fontSize: 16,
        ...theme.fonts.regular 
      }}>
        Loading...
      </Text>
    </View>
  );
}

// Custom hook to manage redirection based on auth state
function useProtectedRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // First launch logic
    (async () => {
      if (!user && inAuthGroup && segments[1] === 'login') {
        if (await isFirstLaunch()) {
          router.replace('/(auth)/register');
          return;
        }
      }
    })();

    // If not logged in and not in (auth) group, redirect to login
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    // If logged in and verified but in (auth), redirect to main app
    else if (user && user.emailVerified && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);
}

function AppContent() {
  const { loading } = useAuth();
  const theme = useTheme();
  useProtectedRoute();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors
      });
    }
  }, [loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  // A stable navigator structure is used. The useProtectedRoute hook handles swapping screens.
  return (
    <Drawer
      screenOptions={{
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
        drawerStyle: { 
          backgroundColor: theme.colors.tabBarBackground,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.accent,
        drawerInactiveTintColor: theme.colors.text,
        drawerLabelStyle: {
          fontSize: 16,
          marginLeft: -5,
          ...theme.fonts.medium,
        },
        drawerItemStyle: {
          marginVertical: 2,
          borderRadius: 8,
          paddingLeft: 5,
        },
        drawerActiveBackgroundColor: theme.dark 
          ? 'rgba(255,255,255,0.1)' 
          : 'rgba(0,0,0,0.05)',
        lazy: true,
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      {/* Main App Screens */}
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
        name="(drawer)/daily-list-builder"
        options={{
          title: 'Daily List Builder',
          drawerIcon: ({ color, size }) => (
            <Ionicons 
              name="checkbox" 
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
      
      {/* Authentication screens are grouped and configured to have no header and not appear in the drawer. */}
      <Drawer.Screen 
        name="(auth)" 
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }} 
      />

      {/* Not Found Screen */}
      <Drawer.Screen 
        name="+not-found" 
        options={{ 
          drawerItemStyle: { height: 0 } 
        }} 
      />
    </Drawer>
  );
}

export default function RootLayout() {
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ProgressProvider>
            <AppContent />
          </ProgressProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}