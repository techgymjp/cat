# 猫ボール

[English](README.en.md) ／ ゲーム：https://techgymjp.github.io/cat/ ／ 遊び方：https://techgymjp.github.io/cat/howto.html

まるくなったネコが、どこまでも続く家の中をころがっていく 3D 前進スクロールゲーム（Three.js）。

## 遊び方
- 玄関 → 廊下 → 茶の間 → 縁側 → 和室 → 洋室 → 子ども部屋 → 書斎 → 秘密のホビールーム → キッチン → ホームバー → カラオケルーム → ビリヤード室 → 卓球ルーム → 煉瓦の暖炉部屋 → 洋風応接室 → 音楽室 → 室内花壇 → 屋根裏部屋 → アクアリウム室 と場面が変わっていく（20部屋目のアクアリウム室のあとは、廊下から2周目）。
- 部屋のさかいめは **猫用扉** をくぐって次の部屋へ。自分で扉の位置に合わせ、ボールの姿でくぐる（外れたりジャンプ中だと壁にゴツンでアウト）。
- 床の上ではネコはボール。何かにぶつかったら一発アウト（ライフは1つ）。
- タップ／クリック／スペースでジャンプすると、ネコが身体を広げて元の姿にもどる。
- キラキラ✨している **こわせる物**（観葉植物・金魚鉢・食器・花瓶・貯金箱・扇風機・ルンバ・洗濯物 など）は、ボールでもネコでも当たればぶっ壊せる。
- テーブル・タンス・イス・カウンターなどの **据え置き家具はこわせない**。上に乗って歩ける。
- 上がり框・横向きのベッド・キッチンカウンター・バーカウンターなどは部屋の幅いっぱいの「通せんぼ家具」。ジャンプして乗り越える（猫用扉のすぐ手前には置かない）。
- 最初の3枚の猫用扉は広め。
- 部屋ごとの仕掛け
  - 廊下：掃除機が迫ってくる。1周目はまっすぐ来るだけ、2周目からは左右に追いかけてくる（ジャンプで越えられる）
  - 茶の間：座布団で寝ている先輩ネコ。ボールのまま近くを通ると起きて「シャーッ」と毛を逆立て大きくなる
  - キッチン：濡れた床。ボールで通ると横につるーっと滑って操作できない
  - 通せんぼ家具と仕掛けは同じ区画に重ならない
  - 洋風応接室：寝ている大きな犬。上を飛び越えると「ワン！」

| 操作 | PC | スマホ |
| --- | --- | --- |
| 左右移動 | ← → / A D、マウスドラッグ | 左右にドラッグ |
| ジャンプ | スペース / ↑ / クリック | タップ |

スコア = 進んだきょり + こわした物の点数（1こ20点。2.5秒以内に続けて壊すとコンボで ×2〜×5）

到達した部屋（何部屋目・何周目）も記録され、タイトル画面に「最高到達」として表示される。

## Android アプリ
Capacitor 8 でアプリ化している（パッケージ名 `jp.techgym.cat`）。ゲームのファイルはアプリに同梱し、オフラインで遊べる。

- 動作確認用 APK（テスト広告・デバッグ署名）：既定ブランチに push すると GitHub Actions がビルドし、Release `android-latest` に載せる
  - リリース画面：https://github.com/techgymjp/cat/releases/tag/android-latest
  - APK を直接：https://github.com/techgymjp/cat/releases/latest/download/neko-ball.apk
  - スマホで読み取る QR コード：`docs/apk-qr.png`

  ![APK の QR コード](docs/apk-qr.png)

- Google Play 用の署名付き AAB：GitHub Secrets（`ANDROID_KEYSTORE_BASE64` など4つ）があると、Actions の Artifact に `neko-ball-release-aab` ができる（本番広告）
- アプリだけの機能：戻るボタン（プレイ中はポーズ、タイトル・結果画面では終了）、別アプリに切り替えたら自動ポーズ、Android の共有メニュー、
  タイトル画面のビルド番号・プライバシーポリシー・広告の設定（EU など）
- 広告（`js/ads.js`）：バナーはタイトル・あそびかた・ポーズ・結果画面だけ。全画面広告はプレイ開始・もう一回・タイトルへ戻る・ポーズからの再開のたび。
  リワード広告は、ぶつかったあとに「広告を見て続ける」（その場から復活、1ゲーム3回まで。結果画面とシェア文に「復活 N 回」）
- 本番の広告ユニット ID と AdMob のアプリ ID は、AdMob で作ったら `js/ads.js` と `android/app/src/main/res/values/strings.xml` に入れる
- ローカルでビルドするとき：`npm ci` → `npm run android:sync` → `npm run android:open`（Android Studio）
- アイコン・起動画面：`node tools/make-icons.js`（`assets/` を作る）→ `npx @capacitor/assets generate --android`

## 起動
ES モジュールを使うので、ローカルサーバー経由で開く（Three.js は CDN から読み込み）。
```
python3 -m http.server 8000
```

## 腕前別シミュレーション
腕前の違うボットに実際のゲームを遊ばせて、到達部屋・スコア・やられた原因を集計する。
```
python3 -m http.server 8123 &
node tools/simulate.js 25 240   # 1レベル25回、1回最大240秒
```
Playwright（npm の playwright と Chromium）が必要。

## ライセンス
著作権はテックジム株式会社に帰属します（All rights reserved）。許可なく複製・改変・再配布すること、Web サイトやアプリとして公開・販売すること、
名前・アイコン・画像を使うことはできません。テックジムの受講生が学習目的で複製・改変することは許可します（アプリストアでの公開や広告・販売などの商用利用は不可）。
同梱の three.js は MIT ライセンスです。くわしくは `LICENSE` を見てください。

## ファイル構成
- `index.html` … 画面（タイトル・HUD）
- `js/game.js` … ゲーム進行・操作・当たり判定
- `js/scenes.js` … 場面の定義、部屋と猫用扉の組み立て
- `js/furniture.js` … 家具・小物・照明（1ユニット ≒ 30cm）
- `js/furniture2.js` … 追加の部屋（縁側〜屋根裏部屋）の家具・小物・照明
- `js/gimmicks.js` … 部屋ごとの仕掛け
- `js/bgm.js` … BGM（天国と地獄）
- `js/textures.js` … 床・壁などのテクスチャ生成
- `js/cat.js` … ネコのモデル（茶トラ・キジトラ）
- `js/i18n.js` … 日本語・英語の文言
- `howto.html` / `howto-en.html` … 遊び方ページ（日本語・英語）
- `tools/simulate.js` … 腕前別シミュレーション
- `js/ads.js` … AdMob 広告（アプリのときだけ動く）／`js/ads-config.js`・`js/build-info.js` … ビルド時に上書きされる設定
- `vendor/three/` … three.js（アプリに同梱するためリポジトリに入れている）
- `android/` … Android プロジェクト（Capacitor）、`capacitor.config.json`、`scripts/build-web.js`（`www/` を作る）
- `assets/` … アイコン・起動画面の元画像、`tools/make-icons.js` … それを作るスクリプト
