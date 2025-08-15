import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, deleteAccount } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
    if (isWeb) {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        setLoggingOut(true);
        try {
          await logout();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: any) {
          window.alert('Failed to sign out. Please try again.');
        } finally {
          setLoggingOut(false);
        }
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              setLoggingOut(true);
              try {
                await logout();
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (error: any) {
                Alert.alert('Error', 'Failed to sign out. Please try again.');
              } finally {
                setLoggingOut(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleDeleteAccount = async () => {
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
    if (isWeb) {
      const confirmed = window.confirm(
        'Are you sure you want to permanently delete your account and all your data? This action cannot be undone.'
      );
      if (confirmed) {
        setDeleting(true);
        try {
          await deleteAccount();
        } catch (error: any) {
          window.alert(error.message || 'Failed to delete account.');
        } finally {
          setDeleting(false);
        }
      }
    } else {
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
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.displayName, { color: theme.colors.text, ...theme.fonts.bold }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[styles.email, { color: theme.colors.muted, ...theme.fonts.regular }]}>
            {user?.email}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.colors.error,
              borderRadius: theme.radius.md,
              opacity: loggingOut ? 0.7 : 1,
            }
          ]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={[styles.logoutButtonText, theme.fonts.medium]}>
            {loggingOut ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.colors.error,
              borderRadius: theme.radius.md,
              opacity: deleting ? 0.7 : 1,
              marginTop: 16,
            }
          ]}
          onPress={handleDeleteAccount}
          disabled={deleting}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={[styles.logoutButtonText, theme.fonts.medium]}>
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  displayName: {
    fontSize: 24,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 140,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
