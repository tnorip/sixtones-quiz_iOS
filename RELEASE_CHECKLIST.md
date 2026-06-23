# ストQ iOS/Android リリースチェックリスト

## 前提

- Expoアカウントにログイン済みであること
- Firebaseに iOS アプリ `com.noristudio.stq` を追加済みであること
- `GoogleService-Info.plist` がプロジェクト直下にあること
- Apple Developer Program加入完了後に、App Store Connectでアプリを作成すること
- Android版を出す前に、FirebaseへAndroidアプリ `com.noristudio.stq` を追加すること

## ローカル確認

```bash
npm run typecheck
```

メモリ不足が出やすいPCでは、ExpoのローカルexportよりEAS Buildを優先する。
過去に `JavaScript heap out of memory` とページファイル不足が発生しているため、ローカルで重いビルドを繰り返さない。

## iOS ビルド

Apple Developer Program加入完了後に実行する。

```bash
eas login
eas build:configure
npm run build:ios:preview
```

実機確認で問題がなければ本番ビルドを作成する。

```bash
npm run build:ios:production
```

## Android ビルド

Firebase ConsoleでAndroidアプリを追加し、`google-services.json` を取得してから進める。

```bash
npm run build:android:preview
```

Google Play Console提出用はAABで作成する。

```bash
npm run build:android:production
```

## Firebase 確認

- AuthenticationでGoogleログインが有効
- iOSではAppleログインも有効
- Firestoreの以下コレクションがアプリ仕様と一致
  - `users`
  - `history/{uid}/items`
  - `rankings`
  - `proposals`
  - `reports`
- iOSから送信した提案/報告がWeb管理画面で確認できる

## App Store Connect

- アプリ名: `ストQ`
- Bundle ID: `com.noristudio.stq`
- サポートURL: `https://st-fanquiz.web.app/`
- プライバシーポリシーURL: `https://st-fanquiz.web.app/privacy.html`
- 利用規約URL: `https://st-fanquiz.web.app/terms.html`
- カテゴリ、年齢制限、プライバシー回答を入力
- iPhoneスクリーンショットを登録
- TestFlightでログイン、クイズ、検定、ストーン、提案、報告、共有を確認

## 審査前の実機チェック

- Googleログインできる
- Appleログインできる
- ゲスト利用でクイズを開始できる
- フリープレイ結果が保存される
- 検定でストーンが消費される
- ストーン画面で履歴表示件数を拡張できる
- クイズ提案が送信される
- 間違い報告が送信される
- ランキングが表示される
- 結果共有が開く
- プライバシーポリシー/利用規約リンクが開く
