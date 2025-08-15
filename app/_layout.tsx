// app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
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

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && !user.emailVerified && !inAuthGroup) {
      // If user is logged in but not verified, redirect to verify screen
      router.replace('/(auth)/verify-email');
    } else if (user && user.emailVerified && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);
}

function AppContent() {
  const { user, loading } = useAuth();
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

  // The navigation is now handled by the useProtectedRoute hook
  // We can return the correct navigator based on the user state
  if (!user) {
    // User is not authenticated, show auth stack
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="(auth)" 
          options={{
            title: 'Authentication',
          }}
        />
      </Stack>
    );
  }

  // User is authenticated, show main app with drawer
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
      <Drawer.Screen
        name="(auth)"
        options={{
          drawerItemStyle: { display: 'none' }, // Hide from drawer
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
          <AppContent />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}