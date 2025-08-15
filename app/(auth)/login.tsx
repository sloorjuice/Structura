// app/(auth)/login.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn } = useAuth();
  const theme = useTheme();
  
  // Refs for form inputs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      await signIn(email, password);
      // Navigation will be handled by the auth state change
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed', 
        error.message,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons 
            name="shield-checkmark" 
            size={64} 
            color={theme.colors.accent} 
            style={styles.logo}
          />
          <Text style={[styles.title, { color: theme.colors.text, ...theme.fonts.bold }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted, ...theme.fonts.regular }]}>
            Sign in to continue to Structura
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text, ...theme.fonts.medium }]}>
              Email Address
            </Text>
            <TextInput
              ref={emailRef}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: errors.email ? '#ef4444' : theme.colors.border,
                  color: theme.colors.text,
                  borderRadius: theme.radius.md,
                }
              ]}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {errors.email}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text, ...theme.fonts.medium }]}>
              Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordRef}
                style={[
                  styles.passwordInput,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.password ? '#ef4444' : theme.colors.border,
                    color: theme.colors.text,
                    borderRadius: theme.radius.md,
                  }
                ]}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {errors.password}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: loading ? theme.colors.muted : theme.colors.accent,
                borderRadius: theme.radius.md,
                opacity: loading ? 0.7 : 1,
              }
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
                <Text style={[styles.loginButtonText, theme.fonts.bold]}>
                  Signing In...
                </Text>
              </View>
            ) : (
              <Text style={[styles.loginButtonText, theme.fonts.bold]}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity 
              style={styles.forgotPassword}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.linkText, { color: theme.colors.accent, ...theme.fonts.medium }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </Link>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.muted, ...theme.fonts.regular }]}>
              or
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.muted, ...theme.fonts.regular }]}>
              Don&apos;t have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity disabled={loading} activeOpacity={0.7}>
                <Text style={[styles.linkText, { color: theme.colors.accent, ...theme.fonts.medium }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
    minHeight: 50,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    minHeight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    minHeight: 54,
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  linkText: {
    fontSize: 16,
  },
});