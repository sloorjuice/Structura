// app/(auth)/register.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const { signUp, user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  
  // Refs for form inputs
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      await signUp(email, password, name);
      router.replace('/(auth)/daily-list-setup'); // <-- Change this line
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed', 
        error.message,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  React.useEffect(() => {
    if (user) {
      // Navigation will be handled by the global useProtectedRoute hook,
      // but you can optionally close the keyboard or reset form here.
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [user]);

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
          {/* Replace Ionicons with Image */}
          <Image
            source={require('@/assets/images/tree.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.text, ...theme.fonts.bold }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted, ...theme.fonts.regular }]}>
            Sign up to get started with Structura
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text, ...theme.fonts.medium }]}>
              Full Name
            </Text>
            <TextInput
              ref={nameRef}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: errors.name ? '#ef4444' : theme.colors.border,
                  color: theme.colors.text,
                  borderRadius: theme.radius.md,
                }
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError('name');
              }}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.muted}
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!loading}
            />
            {errors.name && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {errors.name}
              </Text>
            )}
          </View>

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
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
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
                onChangeText={(text) => {
                  setPassword(text);
                  clearError('password');
                  if (confirmPassword && text !== confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                  } else if (confirmPassword && text === confirmPassword) {
                    clearError('confirmPassword');
                  }
                }}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text, ...theme.fonts.medium }]}>
              Confirm Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                ref={confirmPasswordRef}
                style={[
                  styles.passwordInput,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.confirmPassword ? '#ef4444' : theme.colors.border,
                    color: theme.colors.text,
                    borderRadius: theme.radius.md,
                  }
                ]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                  if (password && text !== password) {
                    setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                  }
                }}
                placeholder="Confirm your password"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              {
                backgroundColor: loading ? theme.colors.muted : theme.colors.accent,
                borderRadius: theme.radius.md,
                opacity: loading ? 0.7 : 1,
              }
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
                <Text style={[styles.registerButtonText, theme.fonts.bold]}>
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text style={[styles.registerButtonText, theme.fonts.bold]}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.muted, ...theme.fonts.regular }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity disabled={loading} activeOpacity={0.7}>
                <Text style={[styles.linkText, { color: theme.colors.accent, ...theme.fonts.medium }]}>
                  Sign In
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
    marginBottom: 32,
  },
  // Add new style for the image logo
  logoImage: {
    width: 128,
    height: 128,
    marginBottom: -16,
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
  registerButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    minHeight: 54,
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#000',
    fontSize: 18,
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