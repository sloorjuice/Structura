import { auth, db } from '@/utils/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Format date as YYYY-MM-DD for Firestore document ID
const formatDateForFirestore = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Ensure parent documents exist
const ensureParentDocuments = async (userId: string, dateStr: string): Promise<void> => {
  // Create user document if it doesn't exist
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      createdAt: Timestamp.now(),
    });
  }

  // Create date document if it doesn't exist
  const dateDocRef = doc(db, 'users', userId, 'dailyChecks', dateStr);
  const dateDoc = await getDoc(dateDocRef);
  if (!dateDoc.exists()) {
    await setDoc(dateDocRef, {
      createdAt: Timestamp.now(),
    });
  }
};

// Check if an objective is completed for a specific date
export const getObjectiveStatus = async (
  objectiveId: string,
  date: Date
): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be logged in');

  const dateStr = formatDateForFirestore(date);
  const docRef = doc(
    db,
    'users',
    user.uid,
    'dailyChecks',
    dateStr,
    'objectives',
    objectiveId
  );

  try {
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().checked : false;
  } catch (error) {
    console.error('Error getting objective status:', error);
    return false;
  }
};

// Update the checked status of an objective for a specific date
export const updateObjectiveStatus = async (
  objectiveId: string,
  date: Date,
  checked: boolean
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be logged in');

  const dateStr = formatDateForFirestore(date);
  
  try {
    // Ensure parent documents exist before writing to the subcollection
    await ensureParentDocuments(user.uid, dateStr);
    
    // Now it's safe to write to the objective document
    const objectiveDocRef = doc(
      db,
      'users',
      user.uid,
      'dailyChecks',
      dateStr,
      'objectives',
      objectiveId
    );
    
    await setDoc(objectiveDocRef, {
      checked,
      updatedAt: Timestamp.now(),
    });
    
  } catch (error) {
    console.error('Error updating objective status:', error);
    throw error;
  }
};