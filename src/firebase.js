import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write'
};

let firebaseApp = null;
let auth = null;
let db = null;
let initPromise = null;

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export async function initFirebase() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const resp = await fetch('/firebase-applet-config.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error('Missing firebase-applet-config.json');
      const config = await resp.json();
      firebaseApp = initializeApp(config);
      auth = getAuth(firebaseApp);
      db = config.firestoreDatabaseId
        ? getFirestore(firebaseApp, config.firestoreDatabaseId)
        : getFirestore(firebaseApp);
      await testConnection();
      return { app: firebaseApp, auth, db, config };
    } catch (err) {
      console.warn('Firebase initialization skipped or offline:', err.message);
      return { app: null, auth: null, db: null, error: err };
    }
  })();
  return initPromise;
}

export function getFirebaseHandles() {
  return { app: firebaseApp, auth, db };
}

export function observeAuth(callback) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  await initFirebase();
  if (!auth) throw new Error('Firebase Auth is not initialized.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signInWithApple() {
  await initFirebase();
  if (!auth) throw new Error('Firebase Auth is not initialized.');
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signInWithEmail(email, password) {
  await initFirebase();
  if (!auth) throw new Error('Firebase Auth is not initialized.');
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function signUpWithEmail(email, password, displayName) {
  await initFirebase();
  if (!auth) throw new Error('Firebase Auth is not initialized.');
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName && displayName.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim().slice(0, 80) });
  }
  try {
    await sendEmailVerification(cred.user);
  } catch (e) {
    console.warn('Could not send verification email:', e.message);
  }
  return cred.user;
}

export async function resendVerificationEmail() {
  if (!auth?.currentUser) throw new Error('No signed-in user');
  await sendEmailVerification(auth.currentUser);
}

export async function resetUserPassword(email) {
  await initFirebase();
  if (!auth) throw new Error('Firebase Auth is not initialized.');
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser() {
  if (!auth) return;
  await signOut(auth);
}

export async function checkIsAdmin(user) {
  if (!user || !user.emailVerified) return false;
  if (user.email === 'banheruka@gmail.com') return true;
  if (!db) return false;
  const path = `admins/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch (err) {
    return false;
  }
}

export async function loadUserProgressFromCloud(user) {
  if (!db || !user) return null;
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return null;
    return snap.data();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function syncUserProgressToCloud(user, snapshot) {
  if (!db || !user || !user.emailVerified) return false;
  const path = `users/${user.uid}`;
  const docRef = doc(db, 'users', user.uid);
  try {
    const existingSnap = await getDoc(docRef);
    const displayName = (user.displayName || (user.email ? user.email.split('@')[0] : 'Learner')).slice(0, 80);
    const sanitizedReviewed = Array.isArray(snapshot.reviewedCards)
      ? snapshot.reviewedCards.filter(x => typeof x === 'string' && x.length <= 160).slice(0, 200)
      : [];
    const sanitizedListened = Array.isArray(snapshot.listenedWords)
      ? snapshot.listenedWords.filter(x => typeof x === 'string' && x.length <= 160).slice(0, 200)
      : [];
    const sanitizedVisited = Array.isArray(snapshot.visitedSites)
      ? snapshot.visitedSites.filter(x => typeof x === 'string' && x.length <= 160).slice(0, 60)
      : [];

    if (!existingSnap.exists()) {
      const payload = {
        uid: user.uid,
        displayName,
        email: (user.email || '').slice(0, 160),
        role: 'learner',
        xp: Math.max(0, Math.min(1000000, Math.round(Number(snapshot.xp || 0)))),
        streak: Math.max(0, Math.min(10000, Math.round(Number(snapshot.streak || 1)))),
        collectionPoints: Math.max(0, Math.min(1000000, Math.round(Number(snapshot.collectionPoints || 0)))),
        modules: snapshot.modules || { module1: false, module2: false, module3: false },
        quizzes: snapshot.quizzes || { quiz1: false, quiz2: false, quiz3: false },
        reviewedCards: sanitizedReviewed,
        listenedWords: sanitizedListened,
        visitedSites: sanitizedVisited,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(docRef, payload);
    } else {
      const prev = existingSnap.data();
      const payload = {
        uid: prev.uid,
        displayName,
        email: (user.email || prev.email || '').slice(0, 160),
        role: prev.role || 'learner',
        xp: Math.max(0, Math.min(1000000, Math.round(Number(snapshot.xp || 0)))),
        streak: Math.max(0, Math.min(10000, Math.round(Number(snapshot.streak || 1)))),
        collectionPoints: Math.max(0, Math.min(1000000, Math.round(Number(snapshot.collectionPoints || 0)))),
        modules: snapshot.modules || prev.modules || { module1: false, module2: false, module3: false },
        quizzes: snapshot.quizzes || prev.quizzes || { quiz1: false, quiz2: false, quiz3: false },
        reviewedCards: sanitizedReviewed,
        listenedWords: sanitizedListened,
        visitedSites: sanitizedVisited,
        createdAt: prev.createdAt,
        updatedAt: serverTimestamp()
      };
      await updateDoc(docRef, payload);
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export function subscribeLessons(onData) {
  if (!db) return () => {};
  const path = 'lessons';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(40));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createLessonArticle(data, user) {
  if (!db || !user) throw new Error('Authentication required');
  const path = 'lessons';
  try {
    const payload = {
      title: String(data.title || '').trim().slice(0, 140),
      level: ['beginner', 'intermediate', 'advanced', 'master'].includes(data.level) ? data.level : 'beginner',
      creoleSummary: String(data.creoleSummary || '').trim().slice(0, 400),
      bodyHtml: String(data.bodyHtml || '').trim().slice(0, 40000),
      funFact: String(data.funFact || '').trim().slice(0, 600),
      imageUrl: String(data.imageUrl || '').trim().slice(0, 200000),
      attachmentName: String(data.attachmentName || '').trim().slice(0, 160),
      attachmentUrl: String(data.attachmentUrl || '').trim().slice(0, 200000),
      authorId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const res = await addDoc(collection(db, path), payload);
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteLessonArticle(lessonId) {
  if (!db) return;
  const path = `lessons/${lessonId}`;
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeDictionary(onData) {
  if (!db) return () => {};
  const path = 'dictionary';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(80));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createDictionaryEntry(data, user) {
  if (!db || !user) throw new Error('Authentication required');
  const path = 'dictionary';
  try {
    const payload = {
      word: String(data.word || '').trim().slice(0, 120),
      pos: String(data.pos || 'Noun').trim().slice(0, 40),
      pronounce: String(data.pronounce || '').trim().slice(0, 120),
      en: String(data.en || '').trim().slice(0, 200),
      fr: String(data.fr || '').trim().slice(0, 200),
      level: ['beginner', 'intermediate', 'advanced', 'master'].includes(data.level) ? data.level : 'beginner',
      explanation: String(data.explanation || '').trim().slice(0, 600),
      funFact: String(data.funFact || '').trim().slice(0, 400),
      example: String(data.example || '').trim().slice(0, 300),
      imageUrl: String(data.imageUrl || '').trim().slice(0, 200000),
      authorId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const res = await addDoc(collection(db, path), payload);
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteDictionaryEntry(entryId) {
  if (!db) return;
  const path = `dictionary/${entryId}`;
  try {
    await deleteDoc(doc(db, 'dictionary', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeKoudmen(onData) {
  if (!db) return () => {};
  const path = 'koudmen';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(40));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createKoudmenPost(data, user) {
  if (!db || !user || !user.emailVerified) {
    throw new Error('Verified sign-in required to publish to cloud Koudmen');
  }
  const path = 'koudmen';
  try {
    const allowedTopics = ['grammar', 'culture', 'pronunciation', 'history'];
    const payload = {
      authorId: user.uid,
      authorName: String(data.authorName || user.displayName || 'Learner').trim().slice(0, 80),
      topic: allowedTopics.includes(data.topic) ? data.topic : 'grammar',
      title: String(data.title || '').trim().slice(0, 160),
      body: String(data.body || '').trim().slice(0, 2000),
      upvotes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const res = await addDoc(collection(db, path), payload);
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function upvoteKoudmenPost(postId, currentUpvotes) {
  if (!db) return;
  const path = `koudmen/${postId}`;
  try {
    await updateDoc(doc(db, 'koudmen', postId), {
      upvotes: Number(currentUpvotes || 0) + 1,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteKoudmenPost(postId) {
  if (!db) return;
  const path = `koudmen/${postId}`;
  try {
    await deleteDoc(doc(db, 'koudmen', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

