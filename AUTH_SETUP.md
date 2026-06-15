# 認証設定

ストQでは、Web・iOS・Androidで同じデータを利用できるよう、Googleログインを推奨ログインとして使用します。
iOS版ではApp Store審査要件に対応するため、Appleログインも提供します。

## 現在の実装状況

- Firebase Authのログイン状態を端末へ永続化
- Web版Googleログイン
- iOS版Appleログイン
- ゲスト利用
- ログアウト
- アカウントと関連Firestoreデータの削除

ネイティブ版Googleログインは、以下のFirebase設定ファイルを追加した後に有効化します。

## Firebase Console

1. Firebase Consoleで`quiz-sixtones`プロジェクトを開く
2. Authenticationのログイン方法でGoogleを有効化
3. Apple Developer Program加入後、Appleも有効化

## iOSアプリの登録

1. Firebase Consoleのプロジェクト設定を開く
2. iOSアプリを追加
3. Bundle IDに`com.tnorip.stq`を指定
4. `GoogleService-Info.plist`をダウンロード
5. ファイルをプロジェクト直下へ配置

設定ファイルを追加した後、`@react-native-google-signin/google-signin`を導入してEAS Development Buildを作成します。

## Androidアプリの登録

Android版を開始するときに、FirebaseへAndroidアプリを追加して`google-services.json`を取得します。
EAS BuildとGoogle Play App Signingで使用するSHA-1証明書もFirebaseへ登録します。

## 注意

- Googleの設定ファイルはAPIキーを含みますが、Firebase公式ではアプリへの同梱を前提としています。
- `.env`はGitへコミットしません。
- AppleログインはApple Developer Program加入とEAS Build後に実機確認します。
- 同じ人がGoogleとAppleを別々に使用すると、別Firebase UIDになる場合があります。アカウント連携は将来のプロフィール機能で追加します。
