import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// Fix: Import firebase from compat to get the User type.
import firebase from 'firebase/compat/app';
import { auth } from '../firebase/config';
import { 
    getUserData, 
    studentSignIn, 
    adminSignIn, 
    registerStudent, 
    signOutUser,
    requestLogout as requestLogoutService,
    listenToUserDocument
} from '../firebase/services';
import { User } from '../types';

// Fix: Define FirebaseUser type using the compat library's namespaced User.
type FirebaseUser = firebase.User;

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  studentLogin: (email: string, password?: string) => Promise<{success: boolean, message: string}>;
  studentRegister: (email: string, password?: string) => Promise<{success: boolean, message: string}>;
  adminLogin: (username: string, password?: string) => Promise<{success: boolean, message: string}>;
  logout: () => void;
  requestLogout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    // Fix: Use auth.onAuthStateChanged for compat mode.
    const unsubscribeAuth = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // User is signed in, get their custom data from Firestore
        const userData = await getUserData(fbUser.uid);
        if (userData && userData.isActive) {
          setUser(userData);
        } else {
          // User document not found or user is inactive
          setUser(null);
          await signOutUser();
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;
    if (firebaseUser) {
        // Listen to real-time changes on the user's document
        unsubscribeFirestore = listenToUserDocument(firebaseUser.uid, (userData) => {
            if (userData) {
                if (userData.forceLogout) {
                    signOutUser(); // Admin forced a logout
                } else {
                    setUser(userData);
                }
            } else {
                signOutUser();
            }
        });
    }
    
    return () => {
        if (unsubscribeFirestore) {
            unsubscribeFirestore();
        }
    };
  }, [firebaseUser]);


  const studentLogin = async (email: string, password?: string): Promise<{success: boolean, message: string}> => {
    return await studentSignIn(email, password || '');
  };

  const studentRegister = async (email: string, password?: string): Promise<{success: boolean, message: string}> => {
    return await registerStudent(email, password || '');
  };

  const adminLogin = async (username: string, password?: string): Promise<{success: boolean, message: string}> => {
    return await adminSignIn(username, password || '');
  };

  const requestLogout = async () => {
    if (user) {
      await requestLogoutService(user.id);
    }
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
  };

  const value = {
    user,
    firebaseUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    studentLogin,
    studentRegister,
    adminLogin,
logout,
    requestLogout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};