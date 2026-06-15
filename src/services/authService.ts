import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
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

export async function signInWithGoogle(): Promise<void> {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    return;
  }

  throw new Error('GoogleログインはiOS用Firebase設定ファイルの追加後に有効になります。');
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
  await signOut(auth);
}

export async function deleteCurrentAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const references = [
    ...(await getDocs(collection(db, 'history', user.uid, 'items'))).docs.map(
      (snapshot) => snapshot.ref,
    ),
    ...(await getDocs(query(collection(db, 'proposals'), where('uid', '==', user.uid), limit(450))))
      .docs.map((snapshot) => snapshot.ref),
    ...(await getDocs(query(collection(db, 'reports'), where('uid', '==', user.uid), limit(450))))
      .docs.map((snapshot) => snapshot.ref),
  ];

  for (let start = 0; start < references.length; start += 450) {
    const batch = writeBatch(db);
    references.slice(start, start + 450).forEach((reference) => batch.delete(reference));
    await batch.commit();
  }

  await deleteDoc(doc(db, 'users', user.uid));
  await deleteUser(user);
}
