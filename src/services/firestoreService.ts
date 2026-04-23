import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  getDoc,
  setDoc,
  getDocFromServer,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}

export async function getCollection<T>(path: string, ...queryConstraints: QueryConstraint[]) {
  try {
    const q = query(collection(db, path), ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeToCollection<T>(
  path: string, 
  callback: (data: T[]) => void, 
  ...args: any[]
) {
  let onError: ((error: any) => void) | undefined;
  let constraints: QueryConstraint[] = [];
  
  if (args.length > 0 && typeof args[0] === 'function') {
    onError = args[0];
    constraints = args.slice(1);
  } else {
    constraints = args;
  }

  const q = query(collection(db, path), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    console.log(`Firestore Subscription [${path}]: Received ${data.length} items`);
    callback(data);
  }, (error) => {
    console.error(`Error subscribing to ${path}:`, error);
    if (onError) {
      onError(error);
    } else {
      handleFirestoreError(error, OperationType.GET, path);
    }
  });
}

export async function addDocument(path: string, data: DocumentData) {
  try {
    return await addDoc(collection(db, path), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateDocument(path: string, id: string, data: Partial<DocumentData>) {
  try {
    return await updateDoc(doc(db, path, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function deleteDocument(path: string, id: string) {
  try {
    return await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}

export async function getSingleDocument<T>(path: string, id: string) {
  try {
    const docRef = doc(db, path, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${path}/${id}`);
  }
}

export async function setSingleDocument(path: string, id: string, data: any) {
  try {
    const docRef = doc(db, path, id);
    // Remove id from data if it exists and filter out undefined values
    const { id: _, ...rest } = data;
    const cleanData = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== undefined)
    );
    return await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${id}`);
  }
}

export function subscribeToDocument<T>(
  path: string, 
  id: string, 
  callback: (data: T | null) => void,
  onError?: (error: any) => void
) {
  const docRef = doc(db, path, id);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as T);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to ${path}/${id}:`, error);
    if (onError) {
      onError(error);
    } else {
      handleFirestoreError(error, OperationType.GET, `${path}/${id}`);
    }
  });
}
