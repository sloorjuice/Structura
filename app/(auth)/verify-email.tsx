import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

export default function VerifyEmailScreen() {
  const { user, refreshUser, logout, deleteAccount } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleResend = async () => {
    if (!user) return;
    setSending(true);
    try {
      await sendEmailVerification(user);
      Alert.alert('Verification Email Sent', 'Please check your inbox.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      await refreshUser();
      if (user?.emailVerified) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Not Verified', 'Please verify your email and try again.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setChecking(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account and all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 24 }}>
      <Ionicons name="mail-open-outline" size={64} color={theme.colors.accent} style={{ marginBottom: 24 }} />
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 }}>
        Verify Your Email
      </Text>
      <Text style={{ color: theme.colors.muted, textAlign: 'center', marginBottom: 24 }}>
        We've sent a verification link to:
      </Text>
      <Text style={{ color: theme.colors.text, fontWeight: 'bold', marginBottom: 24 }}>
        {user?.email}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.accent,
          padding: 16,
          borderRadius: theme.radius.md,
          marginBottom: 16,
          opacity: sending ? 0.7 : 1,
        }}
        onPress={handleResend}
        disabled={sending}
      >
        {sending ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontWeight: 'bold' }}>Resend Email</Text>}
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.accent,
          padding: 16,
          borderRadius: theme.radius.md,
          marginBottom: 16,
          opacity: checking ? 0.7 : 1,
        }}
        onPress={handleCheck}
        disabled={checking}
      >
        {checking ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>I've Verified</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={logout}>
        <Text style={{ color: theme.colors.error, marginTop: 16 }}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          marginTop: 24,
          backgroundColor: theme.colors.error,
          padding: 16,
          borderRadius: theme.radius.md,
          opacity: deleting ? 0.7 : 1,
        }}
        onPress={handleDeleteAccount}
        disabled={deleting}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {deleting ? 'Deleting...' : 'Delete Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}