# USER_GUIDE.md - ユーザー向け利用ガイド

## 友人や他のユーザーへの共有方法

このChrome拡張機能を友人に使ってもらうには、以下の手順を実施してください。

---

## 📦 拡張機能のインストール（友人が行う作業）

### 方法1: GitHubから直接ダウンロード（推奨）

1. **リポジトリをダウンロード**
   - [https://github.com/Yuk1a1/-manaba-plus-r-enhancer](https://github.com/Yuk1a1/-manaba-plus-r-enhancer) にアクセス
   - 緑色の「Code」ボタン→「Download ZIP」をクリック
   - ZIPファイルをダウンロードして解凍

2. **Chromeに拡張機能を読み込む**
   - Chromeを開き、`chrome://extensions/` にアクセス
   - 右上の「デベロッパーモード」をON
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - 解凍したフォルダ（`manifest.json`があるフォルダ）を選択

### 方法2: Gitクローン（開発者向け）

```bash
git clone https://github.com/Yuk1a1/-manaba-plus-r-enhancer.git
cd -manaba-plus-r-enhancer
```

その後、上記の「Chromeに拡張機能を読み込む」手順を実施。

---

## 🔧 Googleカレンダー統合の設定（友人が行う作業）

**重要**: カレンダー機能を使うには、**各ユーザーが自分のGoogleアカウントでGoogle Apps Scriptプロジェクトを作成**する必要があります。

### ステップ1: Google Apps Scriptプロジェクトを作成

1. **GASエディタを開く**
   - [https://script.google.com/](https://script.google.com/) にアクセス
   - 自分のGoogleアカウントでログイン

2. **新しいプロジェクトを作成**
   - 「新しいプロジェクト」をクリック
   - プロジェクト名を「manaba Calendar Sync」などに変更（任意）

3. **以下のコードをコピー&ペースト**

   `Code.gs` に以下のコードを貼り付けてください：

   ```javascript
   /**
    * POSTリクエストを受け取り、カレンダーにイベントを追加する
    */
   function doPost(e) {
     try {
       // リクエストボディからデータを取得
       const data = JSON.parse(e.postData.contents);
       
       // 必須パラメータのチェック
       if (!data.title || !data.deadlineDate) {
         return createResponse(false, 'タイトルと締切日時は必須です');
       }

       // カレンダーIDの取得（ユーザーが指定、なければprimary）
       const calendarId = data.calendarId || 'primary';
       
       // カレンダーを取得
       const calendar = CalendarApp.getCalendarById(calendarId);
       if (!calendar) {
         return createResponse(false, '指定されたカレンダーが見つかりません');
       }

       // イベントの作成
       const startTime = new Date(data.deadlineDate);
       const endTime = new Date(data.deadlineDate);
       
       const event = calendar.createEvent(
         `【${data.taskType || '課題'}】${data.title}`,
         startTime,
         endTime,
         {
           description: data.description || `manaba+Rの課題です。\n詳細: ${data.link || ''}`
         }
       );

       // リマインダーの設定
       event.removeAllReminders();
       event.addPopupReminder(24 * 60); // 24時間前
       event.addPopupReminder(12 * 60); // 12時間前
       event.addPopupReminder(3 * 60);  // 3時間前
       event.addPopupReminder(60);      // 1時間前

       return createResponse(true, 'イベント作成成功', {
         eventId: event.getId(),
         eventLink: event.getHtmlLink()
       });

     } catch (error) {
       Logger.log('Error: ' + error.toString());
       return createResponse(false, error.toString());
     }
   }

   /**
    * レスポンスを作成する共通関数
    */
   function createResponse(success, message, data = null) {
     const response = {
       success: success,
       message: message
     };
     
     if (data) {
       response.data = data;
     }
     
     return ContentService
       .createTextOutput(JSON.stringify(response))
       .setMimeType(ContentService.MimeType.JSON);
   }

   /**
    * テスト用関数（GASエディタで実行可能）
    */
   function testAddEvent() {
     const testData = {
       postData: {
         contents: JSON.stringify({
           calendarId: 'primary',
           title: 'テスト課題',
           taskType: 'レポート',
           deadlineDate: new Date(Date.now() + 86400000).toISOString(), // 明日
           description: 'これはテストです',
           link: 'https://ct.ritsumei.ac.jp/ct/home'
         })
       }
     };
     
     const result = doPost(testData);
     Logger.log(result.getContent());
   }
   ```

### ステップ2: ウェブアプリとしてデプロイ

1. **デプロイを開始**
   - 画面右上の「デプロイ」→「新しいデプロイ」をクリック

2. **ウェブアプリを選択**
   - 「種類の選択」（⚙️歯車アイコン）→「ウェブアプリ」を選択

3. **重要な設定**
   - **説明**: 「manaba課題同期 v1」など（任意）
   - **次のユーザーとして実行**: **自分** ← 必ず選択！
   - **アクセスできるユーザー**: **全員** ← 必ず選択！

4. **権限を承認**
   - 「デプロイ」をクリック
   - 初回は権限の承認が必要です：
     - 「アクセスを承認」をクリック
     - 自分のGoogleアカウントを選択
     - 「このアプリは確認されていません」と表示される場合：
       - 「詳細」をクリック
       - 「（プロジェクト名）に移動」をクリック
     - 「許可」をクリック

5. **デプロイURLをコピー**
   - デプロイが完了すると、URLが表示されます
   - 形式: `https://script.google.com/macros/s/AKfycby.../exec`
   - このURLをコピーしてください（後で使います）

### ステップ3: Chrome拡張機能を設定

1. **設定画面を開く**
   - Chrome拡張機能のアイコンを右クリック
   - 「オプション」を選択

2. **GAS URLを設定**
   - 「Google Apps Script ウェブアプリURL」欄に、先ほどコピーしたURLを貼り付け
   - 「カレンダーID」は空欄または `primary` のままでOK
     - 別のカレンダーに登録したい場合のみ、そのカレンダーIDを入力

3. **設定を保存してテスト**
   - 「設定を保存」をクリック
   - 「接続テスト」をクリックして動作確認
   - 成功すると、Googleカレンダーにテストイベントが追加されます

---

## 🎯 使い方

### 基本機能

1. **未提出課題リスト**
   - manabaのホーム画面にアクセスすると、右側に課題リストが表示されます
   - レポート、小テスト、アンケートが自動的に収集されます

2. **締切カレンダー**
   - 課題の締切日がカレンダーに表示されます
   - 日付をクリックすると、その日の課題が表示されます

### カレンダー登録

#### 個別登録
1. 課題の右側にある📅アイコンをクリック
2. 自動的にGoogleカレンダーに登録されます
3. アイコンが緑色のチェックマーク✅に変わります

#### 一括登録
1. 「カレンダーに一括登録」ボタンをクリック
2. 登録したい課題のチェックボックスをオン
3. 「選択した○件を登録」ボタンをクリック

### その他の機能

- **課題の非表示**: 課題の右端の「×」ボタンで非表示
- **非表示の解除**: 「非表示の課題を全て再表示」ボタンで復元
- **ファイルの自動整理**: manabaからダウンロードしたファイルが自動的に `Manaba/[授業名]/[ファイル名]` に保存されます

---

## ❓ よくある質問

### Q1: カレンダー機能を使うのに料金はかかりますか？
**A**: いいえ、完全無料です。Google Apps Scriptは無料で利用できます。

### Q2: 友人と同じGASプロジェクトを共有できますか？
**A**: 技術的には可能ですが、**推奨しません**。各ユーザーが自分のGASプロジェクトを作成することで、以下のメリットがあります：
- プライバシーの保護（他人のカレンダーにアクセスされない）
- 独立した動作（誰かがプロジェクトを削除しても影響を受けない）
- 個別のカスタマイズが可能

### Q3: GAS URLを他人に知られるとどうなりますか？
**A**: 他人があなたのカレンダーにイベントを追加できる可能性があります。URLは秘密にしておいてください。万が一漏れた場合は、GASプロジェクトを再デプロイして新しいURLを発行してください。

### Q4: エラーが出た場合はどうすればいいですか？
**A**: 以下を確認してください：
1. GAS URLが正しいか
2. GASプロジェクトのデプロイ設定が正しいか
   - 「次のユーザーとして実行」: **自分**
   - 「アクセスできるユーザー」: **全員**
3. Googleカレンダーの権限を承認したか

詳しくは `GAS_SETUP.md` のトラブルシューティングを参照してください。

---

## 📝 まとめ

友人に共有する際は、以下を伝えてください：

1. ✅ **拡張機能のインストール**: GitHubからダウンロードしてChromeに読み込む
2. ✅ **GASプロジェクトの作成**: 各自が自分のGoogleアカウントで作成
3. ✅ **デプロイとURL設定**: GAS URLを拡張機能の設定画面に貼り付け

**各ユーザーが自分のGASプロジェクトを持つことが重要です！**

---

## 🔗 参考リンク

- [GAS_SETUP.md](./GAS_SETUP.md) - 詳細なセットアップガイド
- [GEMINI.md](./GEMINI.md) - 開発者向けドキュメント
- [GitHub Repository](https://github.com/Yuk1a1/-manaba-plus-r-enhancer)
