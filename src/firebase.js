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
  getDocs,
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

export function sanitizeSafeUrl(rawUrl, options = {}) {
  const { allowDataImages = true, allowDataDocs = false } = options;
  const val = String(rawUrl || '').trim();
  if (!val) return '';
  if (val.startsWith('./') || val.startsWith('/')) {
    if (val.startsWith('//')) return '';
    return val;
  }
  const lower = val.toLowerCase();
  if (lower.startsWith('https://') || lower.startsWith('http://')) {
    return val;
  }
  if (allowDataImages && /^data:image\/(jpeg|jpg|png|webp|gif);base64,[a-z0-9+/=]+$/i.test(val)) {
    return val;
  }
  if (allowDataDocs && /^data:(application\/pdf|text\/plain|audio\/mpeg|audio\/wav|audio\/webm);base64,[a-z0-9+/=]+$/i.test(val)) {
    return val;
  }
  return '';
}

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
      const configUrl = new URL('../firebase-applet-config.json', import.meta.url).href;
      let resp = await fetch(configUrl, { cache: 'no-store' });
      if (!resp.ok) {
        resp = await fetch('./firebase-applet-config.json', { cache: 'no-store' });
      }
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

export async function verifyAdminAccess(user) {
  const base = {
    authorized: false,
    role: user ? 'learner' : 'guest',
    emailVerified: Boolean(user?.emailVerified),
    uid: user?.uid || '',
    email: user?.email || '',
    source: 'none',
    checkedAt: Date.now(),
    reason: ''
  };
  if (!user) {
    return { ...base, reason: 'No active Firebase Auth session.' };
  }
  if (!user.emailVerified) {
    return { ...base, reason: 'Email verification is required before Admin Studio access.' };
  }
  try {
    if (typeof user.getIdTokenResult === 'function') {
      await user.getIdTokenResult(false);
    }
  } catch (_err) {
    // Ignore transient offline token refresh failures; rules still enforce token validity
  }
  if (user.email === 'banheruka@gmail.com') {
    return {
      ...base,
      authorized: true,
      role: 'admin',
      source: 'verified-owner-email',
      reason: 'Verified primary heritage administrator.'
    };
  }
  if (!db) {
    return { ...base, reason: 'Firestore database handle unavailable.' };
  }
  try {
    let snap = null;
    try {
      snap = await getDocFromServer(doc(db, 'admins', user.uid));
    } catch (_offlineErr) {
      snap = await getDoc(doc(db, 'admins', user.uid));
    }
    if (snap && snap.exists()) {
      return {
        ...base,
        authorized: true,
        role: 'admin',
        source: 'admins-collection',
        reason: 'Verified against Firestore /admins registry.'
      };
    }
    return { ...base, reason: 'Signed-in account does not hold Admin RBAC clearance.' };
  } catch (err) {
    return { ...base, reason: err?.message || 'RBAC verification denied.' };
  }
}

export async function checkIsAdmin(user) {
  const verdict = await verifyAdminAccess(user);
  return verdict.authorized;
}

async function assertVerifiedAdmin(user) {
  const verdict = await verifyAdminAccess(user);
  if (!verdict.authorized) {
    throw new Error(verdict.reason || 'Admin privileges required.');
  }
  return verdict;
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
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user);
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

export async function updateLessonArticle(lessonId, data, user) {
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user);
  const id = sanitizeLocationSlug(lessonId) || String(lessonId || '').trim();
  const path = `lessons/${id}`;
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
      updatedAt: serverTimestamp()
    };
    await updateDoc(doc(db, 'lessons', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLessonArticle(lessonId, user = null) {
  if (!db) return;
  await assertVerifiedAdmin(user || auth?.currentUser);
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
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user || auth?.currentUser);
  const actor = user || auth?.currentUser;
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
      authorId: actor.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const res = await addDoc(collection(db, path), payload);
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteDictionaryEntry(entryId, user = null) {
  if (!db) return;
  await assertVerifiedAdmin(user || auth?.currentUser);
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

export function sanitizeLocationSlug(raw) {
  const clean = String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return clean || `site-${Date.now()}`;
}

export function subscribeMapLocations(onData) {
  if (!db) return () => {};
  const path = 'mapLocations';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(80));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data(), isCloud: true }));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createMapLocation(data, user) {
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user);
  const id = sanitizeLocationSlug(data.id || data.name);
  const path = `mapLocations/${id}`;
  const allowedCats = ['commune', 'historical', 'offbeat'];
  try {
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error('Valid latitude (-90 to 90) is required');
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error('Valid longitude (-180 to 180) is required');

    const docRef = doc(db, 'mapLocations', id);
    const existingSnap = await getDoc(docRef).catch(() => null);
    const editableFields = {
      name: String(data.name || '').trim().slice(0, 140),
      creoleName: String(data.creoleName || data.name || '').trim().slice(0, 180),
      category: allowedCats.includes(data.category) ? data.category : 'historical',
      region: String(data.region || 'Martinique').trim().slice(0, 120),
      lat,
      lng,
      audioPhrase: String(data.audioPhrase || data.creoleName || data.name || '').trim().slice(0, 240),
      fact: String(data.fact || '').trim().slice(0, 1200),
      tradition: String(data.tradition || '').trim().slice(0, 800),
      proverb: String(data.proverb || '').trim().slice(0, 400),
      imageUrl: String(data.imageUrl || '').trim().slice(0, 200000),
      updatedAt: serverTimestamp()
    };

    if (existingSnap && existingSnap.exists()) {
      await updateDoc(docRef, editableFields);
    } else {
      await setDoc(docRef, {
        id,
        ...editableFields,
        authorId: user.uid,
        createdAt: serverTimestamp()
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMapLocation(locationId, user = null) {
  if (!db) return;
  await assertVerifiedAdmin(user || auth?.currentUser);
  const path = `mapLocations/${locationId}`;
  try {
    await deleteDoc(doc(db, 'mapLocations', locationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedCuratedMapLocations(locationsMap, user) {
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user || auth?.currentUser);
  const actor = user || auth?.currentUser;
  const entries = Object.values(locationsMap || {});
  let synced = 0;
  for (const loc of entries) {
    const id = sanitizeLocationSlug(loc.id || loc.name);
    const payload = {
      id,
      name: String(loc.name || '').trim().slice(0, 140),
      creoleName: String(loc.creoleName || loc.name || '').trim().slice(0, 180),
      category: ['commune', 'historical', 'offbeat'].includes(loc.category) ? loc.category : 'commune',
      region: String(loc.region || 'Martinique').trim().slice(0, 120),
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      audioPhrase: String(loc.audioPhrase || loc.name || '').trim().slice(0, 240),
      fact: String(loc.fact || '').trim().slice(0, 1200),
      tradition: String(loc.tradition || '').trim().slice(0, 800),
      proverb: String(loc.proverb || '').trim().slice(0, 400),
      imageUrl: String(loc.gallery?.[0]?.src || '').trim().slice(0, 200000),
      authorId: actor.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, 'mapLocations', id), payload);
      synced += 1;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `mapLocations/${id}`);
    }
  }
  return synced;
}

export async function fetchRandomProverbFromFirestore() {
  if (!db) return null;
  const path = 'proverbs';
  try {
    const q = query(collection(db, path), limit(50));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data(), isCloud: true }));
    return docs[Math.floor(Math.random() * docs.length)] || null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
}

export function subscribeProverbs(onData) {
  if (!db) return () => {};
  const path = 'proverbs';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), isCloud: true }));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createProverbEntry(data, user) {
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user || auth?.currentUser);
  const actor = user || auth?.currentUser;
  const id = sanitizeLocationSlug(data.id || data.creole);
  const path = `proverbs/${id}`;
  try {
    const payload = {
      creole: String(data.creole || '').trim().slice(0, 320),
      phonetic: String(data.phonetic || '').trim().slice(0, 320),
      en: String(data.en || '').trim().slice(0, 360),
      fr: String(data.fr || '').trim().slice(0, 360),
      meaning: String(data.meaning || '').trim().slice(0, 600),
      origin: String(data.origin || 'Martinican Oral Heritage').trim().slice(0, 140),
      authorId: actor.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, 'proverbs', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function seedCuratedProverbs(proverbsList, user) {
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user || auth?.currentUser);
  const actor = user || auth?.currentUser;
  let synced = 0;
  for (const p of (proverbsList || [])) {
    const id = sanitizeLocationSlug(p.id || p.creole);
    try {
      await setDoc(doc(db, 'proverbs', id), {
        creole: String(p.creole || '').trim().slice(0, 320),
        phonetic: String(p.phonetic || '').trim().slice(0, 320),
        en: String(p.en || '').trim().slice(0, 360),
        fr: String(p.fr || '').trim().slice(0, 360),
        meaning: String(p.meaning || '').trim().slice(0, 600),
        origin: String(p.origin || 'Martinican Oral Heritage').trim().slice(0, 140),
        authorId: actor.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      synced += 1;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `proverbs/${id}`);
    }
  }
  return synced;
}

export function subscribeVocabSets(onData) {
  if (!db) return () => {};
  const path = 'vocabSets';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(60));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), isCloud: true }));
    onData(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

function normalizeVocabCards(rawCards) {
  if (!Array.isArray(rawCards)) return [];
  return rawCards
    .map((c) => {
      const word = String(c?.word || '').trim().slice(0, 120);
      const en = String(c?.en || '').trim().slice(0, 200);
      const fr = String(c?.fr || c?.en || '').trim().slice(0, 200);
      if (!word || !en || !fr) return null;
      return {
        word,
        pronounce: String(c?.pronounce || '').trim().slice(0, 120),
        pos: String(c?.pos || 'Phrase').trim().slice(0, 40),
        en,
        fr,
        ex: String(c?.ex || '').trim().slice(0, 300),
        definition: String(c?.definition || '').trim().slice(0, 400),
        funFact: String(c?.funFact || '').trim().slice(0, 400)
      };
    })
    .filter(Boolean)
    .slice(0, 30);
}

export async function saveVocabSet(data, user) {
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user);
  const id = sanitizeLocationSlug(data.id || data.title).slice(0, 64);
  const path = `vocabSets/${id}`;
  try {
    const cards = normalizeVocabCards(data.cards);
    if (!cards.length) {
      throw new Error('Add at least one valid vocabulary card (Creole word, English, and French).');
    }
    const unlockStep = Math.max(1, Math.min(6, Math.round(Number(data.unlockStep || 1))));
    const editableFields = {
      title: String(data.title || '').trim().slice(0, 140),
      level: ['beginner', 'intermediate', 'advanced', 'master'].includes(data.level) ? data.level : 'beginner',
      unlockStep,
      imageUrl: String(data.imageUrl || '').trim().slice(0, 200000),
      cards,
      cardCount: cards.length,
      updatedAt: serverTimestamp()
    };
    const docRef = doc(db, 'vocabSets', id);
    const existingSnap = await getDoc(docRef).catch(() => null);
    if (existingSnap && existingSnap.exists()) {
      await updateDoc(docRef, editableFields);
    } else {
      await setDoc(docRef, {
        id,
        ...editableFields,
        authorId: user.uid,
        createdAt: serverTimestamp()
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteVocabSet(setId, user) {
  if (!db) return;
  await assertVerifiedAdmin(user);
  const path = `vocabSets/${setId}`;
  try {
    await deleteDoc(doc(db, 'vocabSets', setId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedCuratedVocabSets(decksObj, milestones, user) {
  if (!db) throw new Error('Firestore not initialized');
  await assertVerifiedAdmin(user);
  let synced = 0;
  for (const [key, deck] of Object.entries(decksObj || {})) {
    const ms = (milestones || []).find((m) => Array.isArray(m.unlocksDecks) && m.unlocksDecks.includes(key));
    const cards = normalizeVocabCards(deck.cards);
    if (!cards.length) continue;
    const id = sanitizeLocationSlug(key).slice(0, 64);
    try {
      const docRef = doc(db, 'vocabSets', id);
      const existingSnap = await getDoc(docRef).catch(() => null);
      const editable = {
        title: String(deck.title || key).trim().slice(0, 140),
        level: ['beginner', 'intermediate', 'advanced', 'master'].includes(deck.level) ? deck.level : 'beginner',
        unlockStep: ms ? Math.max(1, Math.min(6, Number(ms.step))) : 1,
        imageUrl: String(deck.image || '').trim().slice(0, 200000),
        cards,
        cardCount: cards.length,
        updatedAt: serverTimestamp()
      };
      if (existingSnap && existingSnap.exists()) {
        await updateDoc(docRef, editable);
      } else {
        await setDoc(docRef, {
          id,
          ...editable,
          authorId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      synced += 1;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `vocabSets/${id}`);
    }
  }
  return synced;
}



