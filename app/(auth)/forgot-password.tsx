// app/(auth)/forgot-password.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  
  const { resetPassword } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email.trim());
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) {
      setError('');
    }
  };

  // Success screen when email is sent
  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={styles.successHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.accent}20` }]}>
              <Ionicons 
                name="mail-outline" 
                size={48} 
                color={theme.colors.accent} 
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.text, ...theme.fonts.bold }]}>
              Check Your Email
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted, ...theme.fonts.regular }]}>
              We&apos;ve sent a password reset link to
            </Text>
            <Text style={[styles.emailText, { color: theme.colors.text, ...theme.fonts.medium }]}>
              {email.trim()}
            </Text>
          </View>

          <View style={styles.instructionContainer}>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
              <Text style={[styles.instructionText, { color: theme.colors.muted, ...theme.fonts.regular }]}>
                Check your email inbox
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
              <Text style={[styles.instructionText, { color: theme.colors.muted, ...theme.fonts.regular }]}>
                Click the reset password link
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
              <Text style={[styles.instructionText, { color: theme.colors.muted, ...theme.fonts.regular }]}>
                Create your new password
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.radius.md,
                }
              ]}
              onPress={() => router.replace('/(auth)/login')} // Use replace
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, theme.fonts.bold]}>
                Back to Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={() => {
                setEmailSent(false);
                setEmail('');
                emailRef.current?.focus();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text, ...theme.fonts.medium }]}>
                Try Different Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Initial form screen
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.replace('/(auth)/login')} // Use replace instead of back
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.accent}20` }]}>
              <Ionicons 
                name="key-outline" 
                size={48} 
                color={theme.colors.accent} 
              />
            </View>
            <Text style={[styles.title, { color: theme.colors.text, ...theme.fonts.bold }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted, ...theme.fonts.regular }]}>
              Enter your email address and we&apos;ll send you a secure link to reset your password
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.colors.text, ...theme.fonts.medium }]}>
              Email Address
            </Text>
            <TextInput
              ref={emailRef}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: error ? '#ef4444' : theme.colors.border,
                  color: theme.colors.text,
                  borderRadius: theme.radius.md,
                }
              ]}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email address"
              placeholderTextColor={theme.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleResetPassword}
              editable={!loading}
              autoFocus
            />
            {error && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {error}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: loading ? theme.colors.muted : theme.colors.accent,
                  borderRadius: theme.radius.md,
                  opacity: loading ? 0.7 : 1,
                }
              ]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
                  <Text style={[styles.buttonText, theme.fonts.bold]}>
                    Sending Reset Link...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, theme.fonts.bold]}>
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.helpText, { color: theme.colors.muted, ...theme.fonts.regular }]}>
              Remember your password?{' '}
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity disabled={loading} activeOpacity={0.7}>
                  <Text style={[styles.linkText, { color: theme.colors.accent, ...theme.fonts.medium }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 32,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  instructionContainer: {
    marginBottom: 32,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  instructionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8,
    minHeight: 50,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 54,
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
  },
  actionButtons: {
    width: '100%',
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  helpText: {
    fontSize: 16,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
  },
});