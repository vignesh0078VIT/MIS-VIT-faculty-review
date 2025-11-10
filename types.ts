// Fix: Import firebase from compat to get the Timestamp type.
import firebase from 'firebase/compat/app';
// The line below is not needed if we use the firebase namespace.
// import { Timestamp } from 'firebase/firestore';
import 'firebase/compat/firestore';

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  username?: string; // For admins
  role: 'student' | 'admin';
  isActive: boolean;
  logoutPending: boolean;
  forceLogout: boolean;
}

export interface Faculty {
  id: string; // Firestore Document ID
  name: string;
  department: string;
  title: string;
  bio: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  likes: number;
  dislikes: number;
}

export interface Review {
  id: string; // Firestore Document ID
  userId: string;
  facultyId: string;
  rating: number; // 1-5
  comment: string;
  // Fix: Use the namespaced Timestamp type.
  date: firebase.firestore.Timestamp;
  status: 'pending' | 'approved' | 'rejected';
}

export interface NewFacultySuggestion {
  id: string;
  userId: string;
  facultyName: string;
  department: string;
  title: string;
  notes: string;
  // Fix: Use the namespaced Timestamp type.
  date: firebase.firestore.Timestamp;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userEmail: string;
  text: string;
  timestamp: firebase.firestore.Timestamp;
}

export interface SiteSettings {
  isChatEnabled: boolean;
  isAboutPageEnabled: boolean;
}

export interface QuestionPaper {
  id: string;
  userId: string;
  userEmail: string; // Denormalized for easy display
  courseName: string;
  slot: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  date: firebase.firestore.Timestamp;
}

export type AdminView =
  | 'dashboard'
  | 'pending-reviews'
  | 'approved-reviews'
  | 'faculty-management'
  | 'student-management'
  | 'new-faculty-suggestions'
  | 'pending-question-papers'
  | 'site-settings';