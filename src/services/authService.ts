import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, writeBatch, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../services/firebase.ts';
import { User as AppUser } from '@/lib/store';

// Generic Register function to handle all roles
export const registerUser = async (email: string, password: string, additionalData: any) => {
  if (additionalData.role === 'student') {
    return registerStudent(additionalData.fullName, additionalData.studentId, email, password);
  } else if (additionalData.role === 'employer') {
    return registerEmployer(additionalData.fullName, additionalData.company, email, password);
  }
  return { success: false, error: "Invalid role specified" };
};

export const registerEmployer = async (
  fullName: string,
  company: string,
  email: string,
  password: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create User Profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      fullName,
      name: fullName,
      company,
      email,
      role: 'employer',
      createdAt: new Date().toISOString(),
    });
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const registerStudent = async (
  fullName: string,
  studentId: string,
  studentEmail: string,
  password: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, studentEmail, password);
    const user = userCredential.user;

    const batch = writeBatch(db);

    // 1. Create User Profile
    const userRef = doc(db, 'users', user.uid);
    batch.set(userRef, {
      uid: user.uid,
      fullName,
      name: fullName,
      studentId,
      email: studentEmail,
      role: 'student',
      status: 'applied',
      createdAt: new Date().toISOString(),
    });

    // 2. Create Application Record
    const appRef = doc(db, 'applications', user.uid);
    batch.set(appRef, {
      studentId,
      studentName: fullName,
      studentEmail,
      status: 'Applied',
      createdAt: new Date().toISOString(),
      userId: user.uid
    });

    await batch.commit();
    
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: AppUser; error?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { 
        success: true, 
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: userData.role,
          fullName: userData.fullName,
          name: userData.fullName || userData.name,
          company: userData.company, // Ensure company flows to the store
          studentId: userData.studentId,
        } as AppUser
      };
    } else {
      return { success: false, error: 'User data not found in database.' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};