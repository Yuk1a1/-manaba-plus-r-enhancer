# manaba+R Enhancer

[![Version](https://img.shields.io/badge/version-3.4.0-blue.svg)](https://github.com/Yuk1a1/-manaba-plus-r-enhancer)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

立命館大学の manaba+R 学習管理システムを便利にする Chrome 拡張機能です。

## ✨ 主な機能

### 📋 1. 未提出課題の一覧表示

- レポート、小テスト、アンケートを自動収集
- 締切日順に並び替え
- コース名と締切日時が一目で分かる

### 📅 2. Google カレンダー統合

- 課題を個別または一括で Google カレンダーに登録
- リマインダー自動設定（24 時間前、12 時間前、3 時間前、1 時間前）
- **誰でも自分の Google アカウントで利用可能**

### ✅ 3. Google Todo 統合（v3.4.0+）

- 課題を Google Todo に登録可能
- Calendar と Todo の**どちらか、または両方**を選択可能
- 一括登録時は選択したサービス全てに登録

### 📁 4. ファイル自動整理

- ダウンロードしたファイルを自動的に整理
- `Manaba/[授業名]/[ファイル名]` の形式で保存

### 📆 5. 締切カレンダー

- 課題の締切日をカレンダー表示
- 日付をクリックすると当日の課題を表示

## 🚀 インストール方法

### 1. 拡張機能をダウンロード

```bash
# Gitを使う場合
git clone https://github.com/Yuk1a1/-manaba-plus-r-enhancer.git

# または、GitHubからZIPをダウンロード
# 「Code」ボタン → 「Download ZIP」→ 解凍
```

### 2. Chrome に拡張機能を読み込む

1. Chrome を開き、`chrome://extensions/` にアクセス
2. 右上の「デベロッパーモード」を ON
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. ダウンロードした/解凍したフォルダを選択

### 3. Google カレンダー連携を設定（任意）

カレンダー機能を使う場合のみ、以下の設定が必要です：

1. 拡張機能のアイコンを右クリック → 「オプション」
2. 「⚙️ カレンダー設定」の手順に従って Google Apps Script を設定

**詳しい手順は [📘 USER_GUIDE.md](./USER_GUIDE.md) をご覧ください。**

## 📖 使い方

### 基本的な使い方

1. manaba のホーム画面 (`https://ct.ritsumei.ac.jp/ct/home`) にアクセス
2. 右側に未提出課題リストとカレンダーが自動表示されます

### カレンダーに課題を登録

#### 個別登録

- 課題の右にある 📅 アイコンをクリック

#### 一括登録

1. 「カレンダーに一括登録」ボタンをクリック
2. 登録したい課題にチェック
3. 「選択した ○ 件を登録」をクリック

### その他の機能

- **課題を非表示**: 課題の右端の `×` ボタンをクリック
- **非表示を解除**: 「非表示の課題を全て再表示」ボタン

## 📚 ドキュメント

- **[USER_GUIDE.md](./USER_GUIDE.md)** - 詳しい使い方と友人への共有方法
- **[GAS_SETUP.md](./GAS_SETUP.md)** - Google カレンダー連携の詳細設定
- **[GEMINI.md](./GEMINI.md)** - 開発者向け技術ドキュメント

## ❓ よくある質問

<details>
<summary><strong>Q: カレンダー機能は無料ですか？</strong></summary>

はい、完全無料です。Google Apps Script は無料で利用できます。

</details>

<details>
<summary><strong>Q: 友人と共有できますか？</strong></summary>

できます！各ユーザーが自分の Google Apps Script プロジェクトを作成する必要があります。詳しくは [USER_GUIDE.md](./USER_GUIDE.md) をご覧ください。

</details>

<details>
<summary><strong>Q: カレンダー設定が面倒です...</strong></summary>

カレンダー連携は任意です。設定しなくても、課題リストとカレンダー表示は使えます！

</details>

<details>
<summary><strong>Q: エラーが出ました</strong></summary>

[GAS_SETUP.md](./GAS_SETUP.md) のトラブルシューティングセクションを確認してください。解決しない場合は [Issues](https://github.com/Yuk1a1/-manaba-plus-r-enhancer/issues) で報告してください。

</details>

## 🛠️ 開発

### 技術スタック

- JavaScript (ES6+)
- Chrome Extensions Manifest V3
- Google Apps Script
- Vanilla Calendar Pro

### ローカルでの開発

```bash
# リポジトリをクローン
git clone https://github.com/Yuk1a1/-manaba-plus-r-enhancer.git
cd -manaba-plus-r-enhancer

# ブランチを作成
git checkout -b feature/your-feature

# 変更を加えた後
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

## 📝 変更履歴

### v3.4.0 (2025-12-24)

- ✨ Google Todo 連携機能を追加
- 🎯 Calendar と Todo の両方、または片方のみを選択可能に
- 📅 アイコン表示がサービス設定に応じて動的に変化
- 🔄 一括登録で選択した全サービスに同時登録
- 📝 GAS コードを Calendar/Todo 両対応に更新

### v3.3.0 (2025-11-12)

- 🚀 一括登録の大幅な高速化（並列処理により 5 倍以上高速に）
- 🔒 ボタン連打による重複登録を防止
- 📊 一括登録時の進捗表示を追加
- 🎨 ボタンの無効化状態を視覚的に表示
- 🐛 個別登録での連打防止も実装

### v3.2.0 (2025-11-06)

- ✨ Google Apps Script 統合により、誰でも自分のアカウントでカレンダー登録可能に
- ✨ オプション画面を追加（GAS URL・カレンダー ID 設定）
- 🗑️ OAuth2.0 の手動設定が不要に
- 📚 ユーザーガイドとセットアップガイドを追加

### v3.1.0

- ✨ Google カレンダー連携機能（開発者専用）
- ✨ 一括登録機能
- 🐛 バグ修正とパフォーマンス改善

### v3.0.0

- ✨ 初回リリース
- 📋 未提出課題リスト表示
- 📁 ファイル自動整理
- 📆 締切カレンダー

## 🤝 コントリビューション

バグ報告や機能提案は [Issues](https://github.com/Yuk1a1/-manaba-plus-r-enhancer/issues) からお願いします。

プルリクエストも歓迎します！

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 👤 作者

- GitHub: [@Yuk1a1](https://github.com/Yuk1a1)

## 🙏 謝辞

- [Vanilla Calendar Pro](https://github.com/uvarov-frontend/vanilla-calendar-pro) - カレンダーライブラリ

---

⭐ 気に入ったらスターをお願いします！
