import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { collection, deleteDoc, doc, getDocs, limit, query, where, writeBatch } from 'firebase/firestore';
import {
  deleteUser,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { auth, db } from './firebase';

const DELETE_ACCOUNT_RECENT_LOGIN_MS = 5 * 60 * 1000;
const DELETE_BATCH_SIZE = 450;

if (Platform.OS !== 'web') {
  GoogleSignin.configure();
}

export async function signInWithGoogle(): Promise<void> {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    return;
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (isCancelledResponse(response)) return;
  if (!isSuccessResponse(response)) {
    throw new Error('Googleから認証情報を取得できませんでした。');
  }

  const { accessToken } = await GoogleSignin.getTokens();
  if (!accessToken) {
    throw new Error('Googleアクセストークンを取得できませんでした。');
  }

  const credential = GoogleAuthProvider.credential(null, accessToken);
  await signInWithCredential(auth, credential);
}

export async function signInWithApple(): Promise<void> {
  if (Platform.OS !== 'ios') {
    throw new Error('AppleログインはiOS端末でのみ利用できます。');
  }

  const rawNonce = Crypto.randomUUID();
  const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce,
  });

  if (!appleCredential.identityToken) {
    throw new Error('Appleから認証情報を取得できませんでした。');
  }

  const provider = new OAuthProvider('apple.com');
  const firebaseCredential = provider.credential({
    idToken: appleCredential.identityToken,
    rawNonce,
  });
  await signInWithCredential(auth, firebaseCredential);
}

export async function logout(): Promise<void> {
  if (Platform.OS !== 'web' && GoogleSignin.getCurrentUser()) {
    await GoogleSignin.signOut();
  }
  await signOut(auth);
}

function assertRecentlySignedIn(): void {
  const lastSignInTime = auth.currentUser?.metadata.lastSignInTime;
  if (!lastSignInTime) return;

  const lastSignInAt = new Date(lastSignInTime).getTime();
  if (Number.isNaN(lastSignInAt)) return;

  if (Date.now() - lastSignInAt > DELETE_ACCOUNT_RECENT_LOGIN_MS) {
    throw new Error('アカウント削除には再ログインが必要です。一度ログアウトしてログインし直してください。');
  }
}

async function deleteMatchingDocuments(collectionName: string, uid: string): Promise<void> {
  while (true) {
    const snapshot = await getDocs(query(collection(db, collectionName), where('uid', '==', uid), limit(DELETE_BATCH_SIZE)));
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
}

async function removeUserFromRankings(uid: string, username: string): Promise<void> {
  const snapshot = await getDocs(collection(db, 'rankings'));
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  let hasChanges = false;

  snapshot.docs.forEach((rankingDocument) => {
    const value = rankingDocument.data();
    if (!Array.isArray(value.data)) return;

    const nextRanking = value.data.filter((item) => {
      if (!item || typeof item !== 'object') return true;
      const entry = item as { uid?: unknown; username?: unknown };
      return entry.uid === uid ? false : entry.uid ? true : entry.username !== username;
    });

    if (nextRanking.length !== value.data.length) {
      hasChanges = true;
      batch.set(rankingDocument.ref, { data: nextRanking }, { merge: true });
    }
  });

  if (hasChanges) await batch.commit();
}

export async function deleteCurrentAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  assertRecentlySignedIn();

  const historyReferences = (await getDocs(collection(db, 'history', user.uid, 'items'))).docs.map(
    (snapshot) => snapshot.ref,
  );

  for (let start = 0; start < historyReferences.length; start += DELETE_BATCH_SIZE) {
    const batch = writeBatch(db);
    historyReferences.slice(start, start + DELETE_BATCH_SIZE).forEach((reference) => batch.delete(reference));
    await batch.commit();
  }

  await deleteMatchingDocuments('proposals', user.uid);
  await deleteMatchingDocuments('reports', user.uid);
  await removeUserFromRankings(user.uid, user.displayName || user.email?.split('@')[0] || '');
  await deleteDoc(doc(db, 'users', user.uid));

  if (Platform.OS !== 'web' && GoogleSignin.getCurrentUser()) {
    await GoogleSignin.revokeAccess();
  }
  await deleteUser(user);
}
