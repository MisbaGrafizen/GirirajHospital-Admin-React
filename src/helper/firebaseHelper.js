import { auth, db } from "../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// --- AUTH FUNCTIONS ---
export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

// --- FIRESTORE CRUD ---
export const addData = async (collectionName, data) => {
  return await addDoc(collection(db, collectionName), data);
};

export const getData = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateData = async (collectionName, id, data) => {
  return await updateDoc(doc(db, collectionName, id), data);
};

export const deleteData = async (collectionName, id) => {
  return await deleteDoc(doc(db, collectionName, id));
};
