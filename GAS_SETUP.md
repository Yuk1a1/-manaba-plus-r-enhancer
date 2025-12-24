# GAS_SETUP.md - Google Apps Script セットアップガイド

## 概要

バージョン 3.4.0 以降、manaba+R Enhancer は**Google カレンダーと Google Todo 両方**への課題登録に対応しています。Google Apps Script (GAS)を使用することで、**誰でも自分の Google アカウントで自由に登録が可能**です。

## 初回セットアップ（必須）

### 1. Google Apps Script プロジェクトの作成

1. [https://script.google.com/](https://script.google.com/) にアクセス
2. Google アカウントでログイン
3. 「新しいプロジェクト」をクリック
4. プロジェクト名を「manaba Task Sync」などに変更（任意）

### 2. Tasks API を有効化（Google Todo 使用時のみ）

Google Todo を使用する場合は、以下の手順で Tasks API を有効化してください：

1. GAS エディタの左側メニューで「サービス」の横にある「+」をクリック
2. 「Tasks API」を検索して選択
3. 「追加」をクリック

> ⚠️ **注意**: Google Calendar のみ使用する場合はこの手順は不要です。

### 3. GAS コードの貼り付け

以下のコードを `Code.gs` に貼り付けてください：

```javascript
/**
 * POSTリクエストを受け取り、指定されたサービスにイベント/タスクを追加する
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (!data.title || !data.deadlineDate) {
      return createResponse(false, "タイトルと締切日時は必須です");
    }

    const targetService = data.targetService || "calendar";

    if (targetService === "calendar") {
      return addToCalendar(data);
    } else if (targetService === "todo") {
      return addToTasks(data);
    } else {
      return createResponse(false, "不明なサービスです");
    }
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return createResponse(false, error.toString());
  }
}

/**
 * Googleカレンダーにイベントを追加
 */
function addToCalendar(data) {
  const calendarId = data.calendarId || "primary";
  const calendar = CalendarApp.getCalendarById(calendarId);

  if (!calendar) {
    return createResponse(false, "指定されたカレンダーが見つかりません");
  }

  const startTime = new Date(data.deadlineDate);
  const endTime = new Date(data.deadlineDate);

  const event = calendar.createEvent(
    `【${data.taskType || "課題"}】${data.title}`,
    startTime,
    endTime,
    {
      description:
        data.description || `manaba+Rの課題です。\n詳細: ${data.link || ""}`,
    }
  );

  event.removeAllReminders();
  event.addPopupReminder(24 * 60); // 24時間前
  event.addPopupReminder(12 * 60); // 12時間前
  event.addPopupReminder(3 * 60); // 3時間前
  event.addPopupReminder(60); // 1時間前

  return createResponse(true, "カレンダー登録成功", {
    eventId: event.getId(),
    eventLink: event.getHtmlLink(),
  });
}

/**
 * Google Tasksにタスクを追加
 */
function addToTasks(data) {
  const taskListId = data.taskListId || "@default";

  const task = {
    title: `【${data.taskType || "課題"}】${data.title}`,
    notes: data.description || `manaba+Rの課題です。\n詳細: ${data.link || ""}`,
    due: new Date(data.deadlineDate).toISOString(),
  };

  try {
    const createdTask = Tasks.Tasks.insert(task, taskListId);
    return createResponse(true, "タスク登録成功", {
      taskId: createdTask.id,
    });
  } catch (error) {
    return createResponse(false, "Tasks API エラー: " + error.toString());
  }
}

/**
 * レスポンスを作成する共通関数
 */
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
  };

  if (data) {
    response.data = data;
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * カレンダー登録テスト用関数（GASエディタで実行可能）
 */
function testAddEvent() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        targetService: "calendar",
        calendarId: "primary",
        title: "テスト課題",
        taskType: "レポート",
        deadlineDate: new Date(Date.now() + 86400000).toISOString(),
        description: "これはテストです",
        link: "https://ct.ritsumei.ac.jp/ct/home",
      }),
    },
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}

/**
 * タスク登録テスト用関数（GASエディタで実行可能）
 */
function testAddTask() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        targetService: "todo",
        taskListId: "@default",
        title: "テスト課題",
        taskType: "レポート",
        deadlineDate: new Date(Date.now() + 86400000).toISOString(),
        description: "これはテストです",
        link: "https://ct.ritsumei.ac.jp/ct/home",
      }),
    },
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
```

### 4. ウェブアプリとしてデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」（歯車アイコン）→「ウェブアプリ」を選択
3. 以下のように設定：
   - **説明**: 「manaba 課題同期 v2」など（任意）
   - **次のユーザーとして実行**: **自分** ← 重要！
   - **アクセスできるユーザー**: **全員** ← 重要！
4. 「デプロイ」をクリック
5. 初回は権限の承認が求められます：
   - 「アクセスを承認」をクリック
   - 自分の Google アカウントを選択
   - 「詳細」→「（プロジェクト名）に移動」をクリック
   - 「許可」をクリック
6. **ウェブアプリの URL**をコピー
   - 形式: `https://script.google.com/macros/s/AKfycby.../exec`

### 5. Chrome 拡張機能の設定

1. Chrome 拡張機能のアイコンを右クリック →「オプション」
2. コピーした GAS URL を貼り付け
3. 使用するサービスにチェック（カレンダー、Todo、または両方）
4. カレンダー ID（任意）:
   - 空欄または `primary` でデフォルトカレンダー
5. タスクリスト ID（任意、Todo 使用時）:
   - 空欄または `@default` でデフォルトリスト
6. 「設定を保存」をクリック
7. 「接続テスト」をクリックして動作確認

## 使い方

### 個別登録

1. manaba のホーム画面で、課題の右側にあるアイコンをクリック
   - 📅: Google カレンダーに登録
   - ✅: Google Todo に登録
2. 自動的に登録されます
3. アイコンが緑色（カレンダー）または青色（Todo）に変わります

### 一括登録

1. 「一括登録」ボタンをクリック
2. 登録したい課題のチェックボックスをオン
3. 「選択した ○ 件を登録」ボタンをクリック
4. 設定で有効にしたサービス（カレンダー、Todo、または両方）に登録されます

## 既存ユーザー向け：v3.2.0/v3.3.0 からのアップグレード

v3.4.0 にアップグレードする場合：

1. **GAS コードを更新**: 上記の新しいコードに置き換え
2. **Tasks API を有効化**（Todo 使用時のみ）: 「サービス」→「Tasks API」を追加
3. **再デプロイ**: 「デプロイ」→「デプロイを管理」→「新しいデプロイ」
4. **新しい URL をコピー**: 拡張機能の設定に貼り付け

> ⚠️ **重要**: 再デプロイ後は URL が変わります。必ず新しい URL を設定してください。

## トラブルシューティング

### エラー: 「GAS URL が設定されていません」

→ オプション画面で GAS URL を設定してください。

### エラー: 「指定されたカレンダーが見つかりません」

→ カレンダー ID が正しいか確認してください。デフォルトは `primary` です。

### エラー: 「Tasks API エラー」

以下を確認してください：

1. GAS プロジェクトで「サービス」から「Tasks API」を追加しているか
2. 権限の承認が完了しているか

### カレンダー/Todo に登録されない

1. GAS URL が正しいか確認
2. GAS プロジェクトが正しくデプロイされているか確認
3. GAS エディタで「実行ログ」を確認してエラーがないかチェック

### 権限エラー

GAS プロジェクトの権限設定を確認：

- 「次のユーザーとして実行」: **自分**
- 「アクセスできるユーザー」: **全員**

## セキュリティ上の注意

- GAS URL は他人に知られないよう管理してください
- 万が一 URL が漏れた場合は、GAS プロジェクトを再デプロイして新しい URL を発行してください

## バージョン履歴

### v3.4.0 (2025-12-24)

- Google Todo 連携機能を追加
- カレンダーと Todo の両方、または片方のみを選択可能に
- GAS コードを Calendar/Todo 両対応に更新

### v3.2.0 - v3.3.0

- GAS 統合により、誰でも自分の Google アカウントでカレンダー登録が可能に
- OAuth2.0 の手動設定が不要に
- 設定画面の追加（GAS URL・カレンダー ID）

### v3.1.0 以前

- 開発者の OAuth2.0 設定が必要で、一般ユーザーは利用不可
