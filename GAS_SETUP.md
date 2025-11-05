# GAS_SETUP.md - Google Apps Script セットアップガイド

## 概要

バージョン3.2.0以降、manaba+R EnhancerはGoogle Apps Script (GAS)を使用してGoogleカレンダーに課題を登録します。これにより、**誰でも自分のGoogleアカウントで自由にカレンダー登録が可能**になりました。

## 初回セットアップ（必須）

### 1. Google Apps Scriptプロジェクトの作成

1. [https://script.google.com/](https://script.google.com/) にアクセス
2. Googleアカウントでログイン
3. 「新しいプロジェクト」をクリック
4. プロジェクト名を「manaba Calendar Sync」などに変更（任意）

### 2. GASコードの貼り付け

以下のコードを `Code.gs` に貼り付けてください：

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

### 3. ウェブアプリとしてデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」（歯車アイコン）→「ウェブアプリ」を選択
3. 以下のように設定：
   - **説明**: 「manaba課題同期 v1」など（任意）
   - **次のユーザーとして実行**: **自分** ← 重要！
   - **アクセスできるユーザー**: **全員** ← 重要！
4. 「デプロイ」をクリック
5. 初回は権限の承認が求められます：
   - 「アクセスを承認」をクリック
   - 自分のGoogleアカウントを選択
   - 「詳細」→「（プロジェクト名）に移動」をクリック
   - 「許可」をクリック
6. **ウェブアプリのURL**をコピー
   - 形式: `https://script.google.com/macros/s/AKfycby.../exec`

### 4. Chrome拡張機能の設定

1. Chrome拡張機能のアイコンを右クリック→「オプション」
2. コピーしたGAS URLを貼り付け
3. カレンダーID（任意）:
   - 空欄または `primary` でデフォルトカレンダー
   - 別のカレンダーを使う場合は、そのカレンダーIDを入力
4. 「設定を保存」をクリック
5. 「接続テスト」をクリックして動作確認

## 使い方

### 個別登録

1. manabaのホーム画面で、課題の右側にあるカレンダーアイコンをクリック
2. 自動的にGoogleカレンダーに登録されます
3. アイコンが緑色のチェックマーク付きに変わります

### 一括登録

1. 「カレンダーに一括登録」ボタンをクリック
2. 登録したい課題のチェックボックスをオン
3. 「選択した○件を登録」ボタンをクリック

## トラブルシューティング

### エラー: 「GAS URLが設定されていません」

→ オプション画面でGAS URLを設定してください。

### エラー: 「指定されたカレンダーが見つかりません」

→ カレンダーIDが正しいか確認してください。デフォルトは `primary` です。

### カレンダーに登録されない

1. GAS URLが正しいか確認
2. GASプロジェクトが正しくデプロイされているか確認
3. GASエディタで「実行ログ」を確認してエラーがないかチェック

### 権限エラー

GASプロジェクトの権限設定を確認：
- 「次のユーザーとして実行」: **自分**
- 「アクセスできるユーザー」: **全員**

## セキュリティ上の注意

- GAS URLは他人に知られないよう管理してください
- 万が一URLが漏れた場合は、GASプロジェクトを再デプロイして新しいURLを発行してください

## バージョン履歴

### v3.2.0 (2025-11-05)
- GAS統合により、誰でも自分のGoogleアカウントでカレンダー登録が可能に
- OAuth2.0の手動設定が不要に
- 設定画面の追加（GAS URL・カレンダーID）

### v3.1.0 以前
- 開発者のOAuth2.0設定が必要で、一般ユーザーは利用不可
