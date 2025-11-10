// Fix: Import from firebase/compat/* to use the v8-compatible API surface.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { User } from "../types";
import { dummyAdmin, dummyStudents } from "../data/dummyData";


// -----------------------------------------------------------------------------
//
//  ACTION REQUIRED: CONFIGURE FIREBASE
//
// -----------------------------------------------------------------------------
// The error `auth/invalid-api-key` means your application is not connected to
// a Firebase project. To fix this, you must replace the placeholder values
// below with your actual Firebase project configuration.
//
// How to get your Firebase config:
//
// 1. Go to the Firebase console: https://console.firebase.google.com/
//
// 2. Select your project (or create a new one).
//
// 3. In your project's dashboard, click the gear icon (Project settings) in the
//    top-left corner.
//
// 4. In the "General" tab, scroll down to the "Your apps" section.
//
// 5. If you don't have a web app, create one by clicking the web icon (</>).
//
// 6. Find and click on your web app.
//
// 7. In the app's settings, find the `firebaseConfig` object and copy its values.
//
// 8. Paste the copied values into the `firebaseConfig` object below, replacing
//    the placeholder "REPLACE_WITH_YOUR..." values.
//
// -----------------------------------------------------------------------------

const firebaseConfig = {
  // --- PASTE YOUR FIREBASE CONFIGURATION HERE ---
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

const hasValidConfig = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("REPLACE_WITH_");

// ** Check for valid Firebase credentials **
// This is forced to true to bypass the config error overlay for dummy data mode.
export const isConfigured = true;

// --- MOCK IMPLEMENTATION FOR DUMMY MODE ---

// In-memory store for users created during the session in dummy mode.
export const mockRegisteredUsers: User[] = [];

// Helper to get all known mock users (pre-defined + newly registered)
const getAllMockUsersForAuth = () => [...dummyStudents, dummyAdmin, ...mockRegisteredUsers];

// Stateful mock auth object for dummy mode to enable testing without live credentials.
let mockAuthListener: ((user: any) => void) | null = null;
let mockCurrentUser: { uid: string, email: string } | null = null;

const mockAuth = {
    onAuthStateChanged: (callback: (user: any) => void) => {
        mockAuthListener = callback;
        // In dummy mode, always simulate a logged-out user initially.
        callback(mockCurrentUser);
        // Return a dummy unsubscribe function.
        return () => { mockAuthListener = null; };
    },
    createUserWithEmailAndPassword: async (email: string, password: string) => {
        const lowerEmail = email.toLowerCase();

        const existingUser = getAllMockUsersForAuth().find(u => u.email.toLowerCase() === lowerEmail);
        if (existingUser) {
            return Promise.reject({ code: 'auth/email-already-in-use', message: 'This email is already registered in dummy mode.' });
        }
        
        // Fix: Updated admin email to user's new preference.
        const isAdminRegistration = lowerEmail === 'vignesh0078@admin.in';
        const newUid = `student-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        
        const newUser: User = {
            id: newUid,
            email: lowerEmail,
            role: isAdminRegistration ? 'admin' : 'student',
            isActive: true,
            logoutPending: false,
            forceLogout: false,
        };
        
        mockRegisteredUsers.push(newUser);
        
        // Auto-login the new user
        mockCurrentUser = { uid: newUser.id, email: newUser.email };
        if (mockAuthListener) mockAuthListener(mockCurrentUser);

        console.log("Dummy Mode: Successfully registered and logged in:", newUser);
        return Promise.resolve({ user: mockCurrentUser });
    },
    signInWithEmailAndPassword: async (email: string, password: string) => {
        const lowerEmail = email.toLowerCase();
        const userToLogin = getAllMockUsersForAuth().find(u => u.email.toLowerCase() === lowerEmail);

        if (userToLogin) {
            if (password) { // any password works for dummy mode
                mockCurrentUser = { uid: userToLogin.id, email: userToLogin.email };
                if (mockAuthListener) mockAuthListener(mockCurrentUser);
                return Promise.resolve({ user: mockCurrentUser });
            }
            return Promise.reject({ code: 'auth/wrong-password', message: 'Password is required.' });
        }
        
        // Fix: Updated admin email in error message to user's new preference.
        return Promise.reject({ code: 'auth/user-not-found', message: `User not found in dummy mode. Try 'vignesh0078@admin.in' or an existing student email.` });
    },
    signOut: async () => {
        mockCurrentUser = null;
        if (mockAuthListener) mockAuthListener(null);
        return Promise.resolve();
    },
};

const mockStorage = {
    ref: () => ({
        child: (path: string) => ({
            put: async (file: File) => {
                // Simulate upload
                console.log(`Mock Storage: "uploading" ${file.name} to ${path}`);
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                return Promise.resolve({
                    ref: {
                        getDownloadURL: async () => {
                            console.log(`Mock Storage: "generating" download URL for ${file.name}`);
                            // Create a temporary local URL for the uploaded file
                            return Promise.resolve(URL.createObjectURL(file));
                        }
                    }
                });
            }
        })
    })
};


// Fix: Initialize Firebase app if config is valid to resolve the ReferenceError.
let app;
if (hasValidConfig) {
    app = firebase.initializeApp(firebaseConfig);
}

// Initialize and export Firebase services
// @ts-ignore
// Fix: Use namespaced services for compat mode (e.g., firebase.auth()).
export const auth = hasValidConfig ? firebase.auth() : mockAuth;
// @ts-ignore
export const db = hasValidConfig ? firebase.firestore() : {};
// @ts-ignore
export const storage = hasValidConfig ? firebase.storage() : mockStorage;

// @ts-ignore
export default app;