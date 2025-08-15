// contexts/AuthContext.tsx
import { auth, db } from '@/utils/firebase';
import {
  AuthError,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password:string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>; // <-- Add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been temporarily disabled. Contact support for assistance.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a moment before trying again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/requires-recent-login':
      return 'This operation requires recent authentication. Please log in again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    default:
      console.error('Unhandled Firebase Auth Error:', error.code, error.message);
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

const deleteUserData = async (uid: string) => {
  // Example: Delete user document and all their subcollections
  // Adjust this logic to match your Firestore structure
  // Delete main user doc
  await deleteDoc(doc(db, 'users', uid));

  // Example: Delete all user's projects
  const projectsSnap = await getDocs(query(collection(db, 'projects'), where('ownerId', '==', uid)));
  for (const projectDoc of projectsSnap.docs) {
    await deleteDoc(projectDoc.ref);
  }

  // Add more collections as needed...
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 Setting up Firebase Auth listener...');

    const unsubscribe = onAuthStateChanged(
      auth,
      (authUser) => {
        console.log('🔄 Auth state changed:', {
          user: authUser ? {
            uid: authUser.uid,
            email: authUser.email,
            emailVerified: authUser.emailVerified
          } : null,
          timestamp: new Date().toISOString()
        });
        
        setUser(authUser);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Auth state listener error:', error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up Auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Email and password are required');
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      console.log('✅ Sign in successful:', result.user.uid);
    } catch (error) {
      console.error('❌ Sign in error:', error);
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError));
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedDisplayName = displayName.trim();
      
      const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      await updateProfile(result.user, {
        displayName: trimmedDisplayName,
      });

      // Send verification email
      await sendEmailVerification(result.user);

      console.log('✅ Sign up successful, verification email sent:', result.user.uid);
    } catch (error) {
      console.error('❌ Sign up error:', error);
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError));
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!email.trim()) {
      throw new Error('Email address is required');
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, trimmedEmail);
      console.log('✅ Password reset email sent to:', trimmedEmail);
    } catch (error) {
      console.error('❌ Password reset error:', error);
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError));
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      await reload(auth.currentUser);
      console.log('✅ User profile refreshed');
    } catch (error) {
      console.error('❌ User refresh error:', error);
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError));
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    const uid = auth.currentUser.uid;
    try {
      // Delete user data from Firestore
      await deleteUserData(uid);

      // Delete user from Auth
      await deleteUser(auth.currentUser);

      setUser(null);
      console.log('✅ Account and data deleted');
    } catch (error) {
      console.error('❌ Delete account error:', error);
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
    refreshUser,
    deleteAccount, // <-- Add here
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};