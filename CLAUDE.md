# このリポジトリでの作業ルール

## 言語
- ユーザーへの返答・説明・質問・まとめは **必ず日本語** で書くこと。英語での返答は禁止。
- コミットメッセージ、README、コード中のコメントも日本語で書く。

## プロジェクト
- 「猫ボール」：Three.js で作る 3D 前進スクロールゲーム。構成は README.md を参照。
- `main` に push すると GitHub Actions で GitHub Pages（https://techgymjp.github.io/cat/）に自動公開される。
- Android アプリは Capacitor 8（パッケージ名 `jp.techgym.cat`）。構成は techgymjp/jet-fighter の `docs/ANDROID_PORTING.md` に合わせている。
  クラウドの環境では Android SDK を入れられないので、APK / AAB のビルドは GitHub Actions（`.github/workflows/android.yml`）に任せる。
