import {
  auth,
  db,
  storage,
  mockRegisteredUsers
} from './config';
import {
  User,
  Faculty,
  Review,
  NewFacultySuggestion,
  ChatMessage,
  SiteSettings,
  QuestionPaper
} from '../types';
import {
  dummyFaculties,
  dummyReviews,
  dummyStudents,
  dummySuggestions,
  dummyAdmin,
  dummyChatMessages,
  dummyQuestionPapers
} from '../data/dummyData';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Mock state for chat and settings
let mockSiteSettings: SiteSettings = { isChatEnabled: true, isAboutPageEnabled: true };
let mockChatMessages: ChatMessage[] = [...dummyChatMessages];
let mockQuestionPapers: QuestionPaper[] = [...dummyQuestionPapers];

// In-memory store for mock users to simulate a live database
let mockUserStore: User[] = [...dummyStudents, dummyAdmin, ...mockRegisteredUsers];
let studentListeners: ((users: User[]) => void)[] = [];

// Helper to notify listeners when student data changes
const notifyStudentListeners = () => {
    const allStudents = mockUserStore.filter(u => u.role === 'student');
    studentListeners.forEach(cb => cb(allStudents));
};


// --- Authentication Functions ---
// These functions are kept as is. To use authentication, you must configure Firebase in firebase/config.ts

export const registerStudent = async (email: string, password: string): Promise < {
  success: boolean;message: string
} > => {
  const lowercasedEmail = email.toLowerCase();
  // Fix: Updated admin email to user's new preference.
  const isAdminRegistration = lowercasedEmail === 'vignesh0078@admin.in';

  if (!isAdminRegistration && !lowercasedEmail.endsWith('@vitstudent.ac.in')) {
    return {
      success: false,
      message: 'Please use a valid VIT student email.'
    };
  }

  try {
    // Fix: Use auth.createUserWithEmailAndPassword for compat mode.
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (!user) {
      throw new Error("User not created");
    }

    const userDocument: User = {
      id: user.uid,
      email: user.email!,
      role: isAdminRegistration ? 'admin' : 'student',
      isActive: true,
      logoutPending: false,
      forceLogout: false,
    };
    
    mockUserStore.push(userDocument);
    notifyStudentListeners();


    if (isAdminRegistration) {
      userDocument.username = 'VIGNESH0078';
    }

    // Create a corresponding user document in Firestore
    // Fix: Use db.collection().doc().set() for compat mode.
    // FIX: Add a type guard to ensure db is a Firestore instance before using it.
    if (!('collection' in db) || typeof db.collection !== 'function') {
        console.log("Dummy Mode: Registration successful, skipping Firestore document creation.");
    } else {
        await db.collection('users').doc(user.uid).set(userDocument);
    }

    return {
      success: true,
      message: 'Registration successful!'
    };
  } catch (error: any) {
    console.error("Firebase Registration Error:", error.message || error);
    // @ts-ignore
    switch (error.code) {
      case 'auth/email-already-in-use':
        return {
          success: false,
          message: error.message || 'This email is already registered. Please try logging in.'
        };
      case 'auth/weak-password':
        return {
          success: false,
          message: 'Password is too weak. It must be at least 6 characters long.'
        };
      case 'auth/operation-not-allowed':
        return {
          success: false,
          message: 'Email/Password sign-up is not enabled in the Firebase console. Please contact the administrator.'
        };
      default:
        return {
          success: false,
          message: error.message || 'Registration failed. An unexpected error occurred. Please try again.'
        };
    }
  }
};

export const studentSignIn = async (email: string, password: string): Promise < {
  success: boolean;message: string
} > => {
  try {
    // Fix: Use auth.signInWithEmailAndPassword for compat mode.
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (!user) {
        return { success: false, message: 'Authentication failed, no user returned.' };
    }

    // Dummy mode logic
    // FIX: Add a type guard to ensure db is a Firestore instance before using it.
    if (!('collection' in db) || typeof db.collection !== 'function') {
      const loggedInUser = mockUserStore.find(u => u.id === user.uid);
      
      if (!loggedInUser || loggedInUser.role !== 'student') {
        if ('signOut' in auth && typeof auth.signOut === 'function') await auth.signOut();
        return { success: false, message: 'No student account found for this email. (Dummy Mode)' };
      }

      if (!loggedInUser.isActive) {
        if ('signOut' in auth && typeof auth.signOut === 'function') await auth.signOut();
        return { success: false, message: 'This account has been deactivated by an administrator. (Dummy Mode)' };
      }
      
      return { success: true, message: 'Login successful! (Dummy Mode)' };
    }

    // Real mode logic
    // Fix: Use db.collection().doc().get() for compat mode.
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (!userDoc.exists || (userDoc.data() as User).role !== 'student') {
      // Fix: Use auth.signOut() for compat mode.
      await auth.signOut();
      return {
        success: false,
        message: 'No student account found for this email.'
      };
    }
    if (!(userDoc.data() as User).isActive) {
      // Fix: Use auth.signOut() for compat mode.
      await auth.signOut();
      return {
        success: false,
        message: 'This account has been deactivated by an administrator.'
      };
    }
    return {
      success: true,
      message: 'Login successful!'
    };

  } catch (error: any) {
    console.error("Student sign-in error:", error.message || error);
    // @ts-ignore
    if (error.code === 'auth/invalid-api-key' || !auth.app) {
      return {
        success: false,
        message: 'Dummy mode: Real login requires Firebase config.'
      };
    }
    switch (error.code) {
      case 'auth/user-not-found':
        return {
          success: false,
          message: 'No account found with this email address.'
        };
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return {
          success: false,
          message: 'Incorrect password. Please try again.'
        };
      default:
        return {
          success: false,
          message: 'Login failed. An unexpected error occurred.'
        };
    }
  }
};

export const adminSignIn = async (email: string, password: string): Promise <{ success: boolean, message: string }> => {
  try {
    // Fix: Use auth.signInWithEmailAndPassword for compat mode.
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (!user) {
        return { success: false, message: 'Authentication failed, no user returned.' };
    }

    // Dummy mode logic
    // FIX: Add a type guard to ensure db is a Firestore instance before using it.
    if (!('collection' in db) || typeof db.collection !== 'function') {
      const loggedInUser = mockUserStore.find(u => u.id === user.uid);
      
      if (loggedInUser && loggedInUser.role === 'admin') {
        return { success: true, message: 'Login successful! (Dummy Mode)' };
      }

      if ('signOut' in auth && typeof auth.signOut === 'function') await auth.signOut();
      return { success: false, message: 'You are not an administrator. (Dummy Mode)' };
    }

    // Real mode logic
    // Fix: Use db.collection().doc().get() for compat mode.
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists && (userDoc.data() as User).role === 'admin') {
      return { success: true, message: 'Login successful!' };
    }
    // Fix: Use auth.signOut() for compat mode.
    await auth.signOut(); // Sign out if not an admin
    return { success: false, message: 'You are not an administrator.' };
  } catch (error: any) {
    console.error("Admin sign-in error:", error.message || error);
    return { success: false, message: error.message || 'Invalid admin credentials. Please try again.' };
  }
};

export const signOutUser = async (): Promise < void > => {
  try {
    // Fix: Use auth.signOut() for compat mode.
    await auth.signOut();
  } catch (e) {
    console.log("Could not sign out in dummy mode.");
  }
};


// --- User Data Functions ---

export const getUserData = async (uid: string): Promise < User | null > => {
  console.log(`Mock: Fetching user data for uid: ${uid}`);
  const user = mockUserStore.find(u => u.id === uid) || null;
  return Promise.resolve(user);
};

export const listenToUserDocument = (uid: string, callback: (user: User | null) => void): (() => void) => {
  // This function mimics a real-time listener by returning data once.
  console.log(`Mock: Listening to user document for uid: ${uid}`);
  const user = mockUserStore.find(u => u.id === uid) || null;
  callback(user);
  return () => {}; // Return a no-op unsubscribe function
};

// --- Student Management Functions (Admin) ---

export const listenToStudents = (callback: (users: User[]) => void): (() => void) => {
  console.log("Mock: Listening to all students.");
  studentListeners.push(callback);
  // Initial call with current data
  notifyStudentListeners();
  
  // Return an unsubscribe function
  return () => {
      studentListeners = studentListeners.filter(cb => cb !== callback);
  };
};

export const requestLogout = async (userId: string): Promise < void > => {
  console.log(`Mock: Requesting logout for user: ${userId}`);
  const userIndex = mockUserStore.findIndex(u => u.id === userId);
  if (userIndex > -1) {
      mockUserStore[userIndex].logoutPending = true;
      notifyStudentListeners();
  }
  return Promise.resolve();
};

export const approveLogout = async (userId: string): Promise < void > => {
  console.log(`Mock: Approving logout for user: ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const userIndex = mockUserStore.findIndex(u => u.id === userId);
  if (userIndex > -1) {
      mockUserStore[userIndex].logoutPending = false;
      mockUserStore[userIndex].forceLogout = true;
      notifyStudentListeners();
  }
  return Promise.resolve();
};

export const toggleStudentActiveState = async (userId: string, isActive: boolean): Promise < void > => {
  console.log(`Mock: Setting active state for user ${userId} to ${isActive}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const userIndex = mockUserStore.findIndex(u => u.id === userId);
  if (userIndex > -1) {
      mockUserStore[userIndex].isActive = isActive;
      notifyStudentListeners();
  }
  return Promise.resolve();
};


// --- Faculty Functions (Mocked) ---

export const listenToAllFaculty = (callback: (faculty: Faculty[]) => void): (() => void) => {
  console.log("Mock: Listening to all faculty.");
  callback(dummyFaculties);
  return () => {};
};

export const getFacultyData = async (id: string): Promise < Faculty | null > => {
  console.log(`Mock: Fetching faculty data for id: ${id}`);
  const faculty = dummyFaculties.find(f => f.id === id) || null;
  return Promise.resolve(faculty);
}

export const addFaculty = async (facultyData: {
  name: string,
  department: string,
  title: string
}) => {
  const { name, department, title } = facultyData;
  // Generate a consistent avatar using the faculty's name as a seed.
  const avatarUrl = `https://api.dicebear.com/8.x/micah/svg?seed=${name.replace(/\s/g, '')}`;
  
  const fullFacultyData = {
      ...facultyData,
      avatarUrl: avatarUrl,
      bio: `An esteemed member of the ${department} department.`,
      rating: 0,
      reviewCount: 0,
      tags: [],
      likes: 0,
      dislikes: 0,
  };

  // The real implementation would go here, something like:
  // if ('collection' in db && typeof db.collection === 'function') {
  //   await db.collection('faculty').add(fullFacultyData);
  //   return;
  // }
  
  console.log("Mock: Adding new faculty", fullFacultyData);
  return Promise.resolve();
};

export const addFacultyBulk = async (facultyDataArray: Array < {
  name: string,
  department: string,
  title: string
} > ) => {
  console.log("Mock: Bulk adding faculty", facultyDataArray);
  return Promise.resolve();
};


export const deleteFaculty = async (facultyId: string) => {
  console.log(`Mock: Deleting faculty with id: ${facultyId}`);
  return Promise.resolve();
};

export const updateFaculty = async (facultyId: string, data: Partial<Faculty>): Promise<void> => {
    // Real implementation
    if ('collection' in db && typeof db.collection === 'function') {
        return db.collection('faculty').doc(facultyId).update(data);
    }
    // Dummy implementation
    console.log(`Mock: Updating faculty ${facultyId} with`, data);
    const index = dummyFaculties.findIndex(f => f.id === facultyId);
    if (index !== -1) {
        dummyFaculties[index] = { ...dummyFaculties[index], ...data };
    }
    return Promise.resolve();
};

// Generic file upload utility for use with multiple features
const uploadFile = async (filePath: string, file: File): Promise<string> => {
    // Real implementation: check for 'app' property which exists on the real service
    if ('app' in storage) {
        // @ts-ignore - 'storage' is a Firebase Storage instance here
        const fileRef = storage.ref(filePath);
        const snapshot = await fileRef.put(file);
        return snapshot.ref.getDownloadURL();
    }
    // Dummy implementation
    // @ts-ignore - 'storage' is not fully typed as the mock object here, but we know the structure.
    const fileRef = storage.ref().child(filePath);
    // @ts-ignore
    const snapshot = await fileRef.put(file);
    // @ts-ignore
    return snapshot.ref.getDownloadURL();
};


export const uploadFacultyAvatar = async (facultyId: string, file: File): Promise<string> => {
    const filePath = `faculty-avatars/${facultyId}/${Date.now()}_${file.name}`;
    return uploadFile(filePath, file);
};

export const uploadQuestionPaperImage = async (file: File, userId: string): Promise<string> => {
    const filePath = `question-papers/${userId}/${Date.now()}_${file.name}`;
    return uploadFile(filePath, file);
};


// --- Review Functions (Mocked) ---

export const listenToReviews = (status: Review['status'], callback: (reviews: Review[]) => void): (() => void) => {
  console.log(`Mock: Listening to reviews with status: ${status}`);
  const filtered = dummyReviews.filter(r => r.status === status);
  callback(filtered);
  return () => {};
};

export const listenToReviewsForFaculty = (facultyId: string, status: Review['status'], callback: (reviews: Review[]) => void): (() => void) => {
  console.log(`Mock: Listening to reviews for faculty ${facultyId} with status ${status}`);
  const filtered = dummyReviews.filter(r => r.facultyId === facultyId && r.status === status);
  callback(filtered);
  return () => {};
};

export const addReview = async (reviewData: Omit < Review, 'id' | 'date' | 'status' > ): Promise < void > => {
  console.log("Mock: Adding review", reviewData);
  alert('Review submitted for approval (Dummy Mode).');
  return Promise.resolve();
};

export const updateReviewStatus = async (reviewId: string, status: Review['status']): Promise < void > => {
  console.log(`Mock: Updating review ${reviewId} status to ${status}`);
  return Promise.resolve();
};

export const listenToUserPendingReviewForFaculty = (
    userId: string,
    facultyId: string,
    callback: (review: Review | null) => void
): (() => void) => {
    console.log(`Mock: Listening to user ${userId}'s pending review for faculty ${facultyId}`);
    const review = dummyReviews.find(
        (r) => r.userId === userId && r.facultyId === facultyId && r.status === 'pending'
    ) || null;
    callback(review);
    return () => {}; // No-op unsubscribe for mock
};

export const updateReviewContent = async (
    reviewId: string,
    rating: number,
    comment: string
): Promise<void> => {
    console.log(`Mock: Updating review ${reviewId} with rating ${rating} and comment "${comment}"`);
    const reviewIndex = dummyReviews.findIndex((r) => r.id === reviewId);
    if (reviewIndex > -1) {
        dummyReviews[reviewIndex].rating = rating;
        dummyReviews[reviewIndex].comment = comment;
        console.log('Mock review updated successfully in memory.');
    } else {
        console.warn(`Mock: Could not find review with id ${reviewId} to update.`);
    }
    return Promise.resolve();
};


// --- New Faculty Suggestion Functions (Mocked) ---

export const listenToNewFacultySuggestions = (status: NewFacultySuggestion['status'], callback: (suggestions: NewFacultySuggestion[]) => void): (() => void) => {
  console.log(`Mock: Listening to new faculty suggestions with status: ${status}`);
  const filtered = dummySuggestions.filter(s => s.status === status);
  callback(filtered);
  return () => {};
};

export const addNewFacultySuggestion = async (suggestionData: Omit < NewFacultySuggestion, 'id' | 'date' | 'status' > ): Promise < void > => {
  console.log("Mock: Adding new faculty suggestion", suggestionData);
  return Promise.resolve();
};

export const updateNewFacultySuggestionStatus = async (suggestionId: string, status: 'approved' | 'rejected'): Promise < void > => {
  console.log(`Mock: Updating suggestion ${suggestionId} status to ${status}`);
  return Promise.resolve();
};

// --- Site Settings Functions (Mocked) ---

export const listenToSiteSettings = (callback: (settings: SiteSettings) => void): (() => void) => {
    console.log("Mock: Listening to site settings.");
    // To simulate real-time for the admin panel and student view, we can use a simple interval check.
    const interval = setInterval(() => {
        callback(mockSiteSettings);
    }, 1000);
    return () => clearInterval(interval);
};

export const updateSiteSettings = async (updates: Partial<SiteSettings>): Promise<void> => {
    console.log(`Mock: Updating site settings with:`, updates);
    mockSiteSettings = { ...mockSiteSettings, ...updates };
    return Promise.resolve();
};

export const listenToChatMessages = (callback: (messages: ChatMessage[]) => void): (() => void) => {
    console.log("Mock: Listening to chat messages.");
    // Simulate real-time updates
    const interval = setInterval(() => {
        callback([...mockChatMessages].sort((a,b) => a.timestamp.toMillis() - b.timestamp.toMillis()));
    }, 1000);
    return () => clearInterval(interval);
};

export const sendChatMessage = async (userId: string, userEmail: string, text: string): Promise<void> => {
    console.log(`Mock: Sending chat message from ${userEmail}: ${text}`);
    const newMessage: ChatMessage = {
        id: `chat-${Date.now()}`,
        userId,
        userEmail,
        text,
        timestamp: firebase.firestore.Timestamp.now(),
    };
    mockChatMessages.push(newMessage);
    return Promise.resolve();
};

// --- Question Paper Functions ---

export const listenToQuestionPapers = (status: QuestionPaper['status'], callback: (papers: QuestionPaper[]) => void): (() => void) => {
  // Real implementation
  if ('collection' in db && typeof db.collection === 'function') {
    return db.collection('questionPapers')
      .where('status', '==', status)
      .orderBy('date', 'desc')
      .onSnapshot(snapshot => {
        const papers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuestionPaper));
        callback(papers);
      });
  }
  // Dummy implementation
  console.log(`Mock: Listening to question papers with status: ${status}`);
  const filtered = mockQuestionPapers.filter(p => p.status === status);
  callback(filtered);
  return () => {};
};

export const addQuestionPaper = async (data: Omit<QuestionPaper, 'id' | 'status' | 'date'>): Promise<void> => {
  const newPaper: Omit<QuestionPaper, 'id'> = {
    ...data,
    status: 'pending',
    date: firebase.firestore.Timestamp.now(),
  };

  // Real implementation
  if ('collection' in db && typeof db.collection === 'function') {
    await db.collection('questionPapers').add(newPaper);
    return;
  }

  // Dummy implementation
  console.log('Mock: Adding new question paper submission', newPaper);
  const mockPaper: QuestionPaper = {
    ...newPaper,
    id: `qp-mock-${Date.now()}`,
  };
  mockQuestionPapers.push(mockPaper);
  return Promise.resolve();
};

export const updateQuestionPaperStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
  // Real implementation
  if ('collection' in db && typeof db.collection === 'function') {
    await db.collection('questionPapers').doc(id).update({ status });
    return;
  }
  
  // Dummy implementation
  console.log(`Mock: Updating question paper ${id} status to ${status}`);
  const index = mockQuestionPapers.findIndex(p => p.id === id);
  if (index !== -1) {
    mockQuestionPapers[index].status = status;
  }
  return Promise.resolve();
};