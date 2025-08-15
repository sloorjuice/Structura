import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { auth } from '@/utils/firebase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function VerifyEmailScreen() {
  const { user, refreshUser, logout, deleteAccount } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleResend = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setSending(true);
    try {
      await sendEmailVerification(currentUser);
      Alert.alert('Verification Email Sent', 'Please check your inbox.');
    } catch (e: any) {
      if (e.code === 'auth/too-many-requests') {
        Alert.alert(
          'Too Many Requests',
          'You have requested verification emails too frequently. Please wait a while before trying again.'
        );
      } else {
        Alert.alert('Error', e.message);
      }
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

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out.');
    }
  };

  const handleOpenInbox = async () => {
    const url = Platform.OS === 'ios' ? 'message://' : 'mailto:';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Could not open mail app', 'Please open your email app manually.');
    }
  };

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 24,
    }}>
      <View style={{
        width: '100%',
        maxWidth: 400,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: 28,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: Platform.OS === 'android' ? 4 : 0,
        alignItems: 'center',
      }}>
        <Ionicons name="mail-open-outline" size={64} color={theme.colors.accent} style={{ marginBottom: 20 }} />
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.colors.text,
          marginBottom: 8,
        }}>
          Verify Your Email
        </Text>
        <View style={{
          backgroundColor: theme.colors.infoBackground,
          borderRadius: theme.radius.sm,
          padding: 12,
          marginBottom: 18,
          width: '100%',
        }}>
          <Text style={{
            color: theme.colors.infoText,
            textAlign: 'center',
            fontSize: 15,
          }}>
            We've sent a verification link to your email address.
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.infoBackground,
            borderRadius: 999,
            paddingVertical: 8,
            paddingHorizontal: 18,
            marginBottom: 18,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={handleOpenInbox}
        >
          <Ionicons name="mail" size={18} color={theme.colors.infoText} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.colors.infoText, fontWeight: 'bold', fontSize: 15 }}>
            Open Inbox
          </Text>
        </TouchableOpacity>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.accent + '22',
          borderRadius: 999,
          paddingVertical: 6,
          paddingHorizontal: 16,
          marginBottom: 24,
        }}>
          <MaterialIcons name="alternate-email" size={20} color={theme.colors.accent} style={{ marginRight: 6 }} />
          <Text style={{
            color: theme.colors.text,
            fontWeight: 'bold',
            fontSize: 16,
          }}>
            {user?.email}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.accent,
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: theme.radius.md,
            marginBottom: 14,
            width: '100%',
            alignItems: 'center',
            opacity: sending ? 0.7 : 1,
            shadowColor: theme.colors.accent,
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
          onPress={handleResend}
          disabled={sending}
        >
          {sending
            ? <ActivityIndicator color="#000" />
            : (
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
                Resend Email
              </Text>
            )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: theme.radius.md,
            marginBottom: 10,
            width: '100%',
            alignItems: 'center',
            opacity: checking ? 0.7 : 1,
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
          onPress={handleCheck}
          disabled={checking}
        >
          {checking
            ? <ActivityIndicator color="#fff" />
            : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                I've Verified
              </Text>
            )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 8 }}>
          <Text style={{ color: theme.colors.error, fontWeight: '600', fontSize: 15 }}>
            <Ionicons name="log-out-outline" size={16} color={theme.colors.error} /> Sign Out
          </Text>
        </TouchableOpacity>
      </View>
      {/* Move delete account to bottom, subtle style */}
      <View style={{ marginTop: 32, alignItems: 'center', width: '100%' }}>
        <Text style={{ color: theme.colors.textSecondary ?? '#888', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
          Can&apos;t verify this account?
        </Text>
        <TouchableOpacity
          onPress={handleDeleteAccount}
          disabled={deleting}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderRadius: theme.radius.md,
            opacity: deleting ? 0.7 : 1,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.colors.error, fontWeight: 'bold', fontSize: 15 }}>
            {deleting ? 'Deleting...' : 'Delete this account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}