import { db } from "@/utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const getUserHobbies = async (uid: string): Promise<string[]> => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().hobbies || [] : [];
};

export const setUserHobbies = async (uid: string, list: string[]): Promise<void> => {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { hobbies: list }, { merge: true });
};