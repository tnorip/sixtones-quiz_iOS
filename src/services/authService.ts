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

export async function deleteCurrentAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const references = [
    ...(await getDocs(collection(db, 'history', user.uid, 'items'))).docs.map((snapshot) => snapshot.ref),
    ...(await getDocs(query(collection(db, 'proposals'), where('uid', '==', user.uid), limit(450)))).docs.map(
      (snapshot) => snapshot.ref,
    ),
    ...(await getDocs(query(collection(db, 'reports'), where('uid', '==', user.uid), limit(450)))).docs.map(
      (snapshot) => snapshot.ref,
    ),
  ];

  for (let start = 0; start < references.length; start += 450) {
    const batch = writeBatch(db);
    references.slice(start, start + 450).forEach((reference) => batch.delete(reference));
    await batch.commit();
  }

  await deleteDoc(doc(db, 'users', user.uid));
  if (Platform.OS !== 'web' && GoogleSignin.getCurrentUser()) {
    await GoogleSignin.revokeAccess();
  }
  await deleteUser(user);
}
