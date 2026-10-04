import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  db,
  auth,
  googleProvider,
  storage,
  handleFirestoreError,
  OperationType,
  testConnection,
} from '../firebase';
import { Project } from '../data/projects';

export interface NetworkLink {
  name: string;
  href: string;
  label?: string;
}

export interface SiteSettings {
  aboutStatement: string;
  bioParagraphs: string[];
  email: string;
  location: string;
  socials: NetworkLink[];
  upcomingExhibitions: { date: string; title: string; location: string }[];
  installationSynopsis?: string;
  performanceSynopsis?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  aboutStatement: '',
  bioParagraphs: [],
  email: '',
  location: '',
  socials: [],
  upcomingExhibitions: [],
  installationSynopsis: '',
  performanceSynopsis: '',
};

interface DataContextType {
  projects: Project[];
  siteSettings: SiteSettings;
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  saveSiteSettings: (settings: SiteSettings) => Promise<void>;
  uploadMedia: (file: File, folder?: string) => Promise<string>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Hardcoded owner email matching metadata
  const OWNER_EMAIL = 'tedomakharadze95@gmail.com';
  const isAdmin = Boolean(user && user.email === OWNER_EMAIL);

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Projects directly from Firestore (All data comes from Firebase)
  useEffect(() => {
    const projectsCol = collection(db, 'projects');
    const unsubscribe = onSnapshot(
      projectsCol,
      (snapshot) => {
        const loaded: Project[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Project;
          loaded.push({ ...data, id: docSnap.id });
        });
        setProjects(loaded);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Firestore projects error:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Subscribe to Site Settings from Firestore
  useEffect(() => {
    const settingsDoc = doc(db, 'siteSettings', 'general');
    const unsubscribe = onSnapshot(
      settingsDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SiteSettings;
          setSiteSettings(data);
        } else {
          setSiteSettings(DEFAULT_SITE_SETTINGS);
        }
      },
      (error) => {
        console.error('Firebase site settings snapshot error:', error);
        setSiteSettings(DEFAULT_SITE_SETTINGS);
      }
    );
    return () => unsubscribe();
  }, []);

  // Auth actions
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Email sign-in failed:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Email registration failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Upload Media directly to Firebase Storage
  const uploadMedia = async (file: File, folder = 'portfolio-media'): Promise<string> => {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${folder}/${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw error;
    }
  };

  // Save Project to Firestore
  const saveProject = async (project: Project) => {
    const projectPath = `projects/${project.id}`;
    try {
      const projectRef = doc(db, 'projects', project.id);
      await setDoc(projectRef, project, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, projectPath);
    }
  };

  // Delete Project from Firestore
  const deleteProject = async (projectId: string) => {
    const projectPath = `projects/${projectId}`;
    try {
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, projectPath);
    }
  };

  // Save Site Settings to Firestore
  const saveSiteSettings = async (settings: SiteSettings) => {
    const settingsPath = 'siteSettings/general';
    try {
      const settingsRef = doc(db, 'siteSettings', 'general');
      await setDoc(settingsRef, settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, settingsPath);
    }
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        siteSettings,
        loading,
        user,
        isAdmin,
        authLoading,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        saveProject,
        deleteProject,
        saveSiteSettings,
        uploadMedia,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
