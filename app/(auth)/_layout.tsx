// app/(auth)/_layout.tsx
import { useTheme } from '@/themes/theme';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();

  // Redirect to /register if at /auth
  useEffect(() => {
    // If the current segment is exactly /auth, redirect to /auth/register
    if (segments[segments.length - 1] === '(auth)') {
      router.replace('/(auth)/login');
    }
  }, [segments, router]);

  return (
    // Only Stack.Screen children here!
    <Stack
      screenOptions={{
        headerShown: false, // Hide header for ALL auth screens
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
      initialRouteName="register"
    >
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      <Stack.Screen name="daily-list-setup" options={{ title: 'Daily List Setup' }} /> {/* <-- Add this */}
      <Stack.Screen name="forgot-password" options={{ title: 'Reset Password' }} />
      <Stack.Screen name="verify-email" options={{ title: 'Verify Email' }} />
    </Stack>
  );
}