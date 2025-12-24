// options.js - manaba+R Enhancer 設定画面のスクリプト

// チェックボックスの状態に応じてオプションを表示/非表示
function updateServiceOptions() {
  const calendarOptions = document.getElementById("calendarOptions");
  const todoOptions = document.getElementById("todoOptions");
  const useCalendar = document.getElementById("useCalendar").checked;
  const useTodo = document.getElementById("useTodo").checked;

  calendarOptions.classList.toggle("active", useCalendar);
  todoOptions.classList.toggle("active", useTodo);
}

document
  .getElementById("useCalendar")
  .addEventListener("change", updateServiceOptions);
document
  .getElementById("useTodo")
  .addEventListener("change", updateServiceOptions);

document.getElementById("save").addEventListener("click", () => {
  const gasUrl = document.getElementById("gasUrl").value.trim();
  const useCalendar = document.getElementById("useCalendar").checked;
  const useTodo = document.getElementById("useTodo").checked;
  const calendarId =
    document.getElementById("calendarId").value.trim() || "primary";
  const taskListId =
    document.getElementById("taskListId").value.trim() || "@default";

  if (!gasUrl) {
    showMessage("❌ GAS URLは必須です", "error");
    return;
  }

  // URLの形式チェック
  if (!gasUrl.startsWith("https://script.google.com/macros/")) {
    showMessage(
      "❌ 正しいGAS URLを入力してください（https://script.google.com/macros/ で始まる必要があります）",
      "error"
    );
    return;
  }

  // URLが /exec で終わるかチェック
  if (!gasUrl.endsWith("/exec")) {
    showMessage(
      "⚠️ URLが /exec で終わっていません。正しいデプロイURLか確認してください。",
      "error"
    );
    return;
  }

  // 少なくとも1つのサービスが選択されているかチェック
  if (!useCalendar && !useTodo) {
    showMessage(
      "❌ 少なくとも1つのサービス（Calendar または Todo）を選択してください",
      "error"
    );
    return;
  }

  chrome.storage.sync.set(
    {
      gasUrl,
      useCalendar,
      useTodo,
      calendarId,
      taskListId,
    },
    () => {
      showMessage("✅ 設定を保存しました！", "success");
    }
  );
});

document.getElementById("test").addEventListener("click", async () => {
  const gasUrl = document.getElementById("gasUrl").value.trim();
  const useCalendar = document.getElementById("useCalendar").checked;
  const useTodo = document.getElementById("useTodo").checked;
  const calendarId =
    document.getElementById("calendarId").value.trim() || "primary";
  const taskListId =
    document.getElementById("taskListId").value.trim() || "@default";

  if (!gasUrl) {
    showMessage("❌ 先にGAS URLを入力してください", "error");
    return;
  }

  if (!useCalendar && !useTodo) {
    showMessage("❌ 少なくとも1つのサービスを選択してください", "error");
    return;
  }

  const testButton = document.getElementById("test");
  testButton.disabled = true;
  testButton.textContent = "🔄 テスト中...";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const results = [];

  try {
    // カレンダーのテスト
    if (useCalendar) {
      try {
        await fetch(gasUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetService: "calendar",
            calendarId: calendarId,
            title: "manaba+R Enhancer 接続テスト",
            taskType: "テスト",
            deadlineDate: tomorrow.toISOString(),
            description:
              "これは接続テストです。カレンダーから削除しても問題ありません。",
            link: "https://ct.ritsumei.ac.jp/ct/home",
          }),
        });
        results.push("📅 Google Calendar: 成功");
      } catch (error) {
        results.push(`📅 Google Calendar: 失敗 (${error.message})`);
      }
    }

    // Todoのテスト
    if (useTodo) {
      try {
        await fetch(gasUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetService: "todo",
            taskListId: taskListId,
            title: "manaba+R Enhancer 接続テスト",
            taskType: "テスト",
            deadlineDate: tomorrow.toISOString(),
            description:
              "これは接続テストです。Todoから削除しても問題ありません。",
            link: "https://ct.ritsumei.ac.jp/ct/home",
          }),
        });
        results.push("✅ Google Todo: 成功");
      } catch (error) {
        results.push(`✅ Google Todo: 失敗 (${error.message})`);
      }
    }

    // 少し待機してGASの処理が完了するのを待つ
    await new Promise((resolve) => setTimeout(resolve, 500));

    showMessage(
      `接続テスト完了！<br>${results.join(
        "<br>"
      )}<br><br>⚠️ 登録されたテストイベント/タスクは手動で削除してください。`,
      "success"
    );
  } catch (error) {
    console.error("接続テストエラー:", error);
    showMessage(
      `❌ 接続失敗: ${error.message}<br>GAS URLが正しいか、GASプロジェクトが正しくデプロイされているか確認してください。`,
      "error"
    );
  } finally {
    testButton.disabled = false;
    testButton.textContent = "🧪 接続テスト";
  }
});

/**
 * メッセージを表示する
 * @param {string} text - 表示するメッセージ
 * @param {string} type - メッセージタイプ ('success' or 'error')
 */
function showMessage(text, type) {
  const messageEl = document.getElementById("message");
  messageEl.innerHTML = text;
  messageEl.className = `message ${type}`;

  // 10秒後に自動的に非表示（テスト結果表示用に長めに設定）
  setTimeout(() => {
    messageEl.className = "message";
  }, 10000);
}

// ページ読み込み時に保存済みの値を表示
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(
    ["gasUrl", "useCalendar", "useTodo", "calendarId", "taskListId"],
    (result) => {
      if (result.gasUrl) {
        document.getElementById("gasUrl").value = result.gasUrl;
      }

      // デフォルトはCalendarのみ有効
      document.getElementById("useCalendar").checked =
        result.useCalendar !== false;
      document.getElementById("useTodo").checked = result.useTodo === true;

      if (result.calendarId) {
        document.getElementById("calendarId").value = result.calendarId;
      } else {
        document.getElementById("calendarId").value = "primary";
      }

      if (result.taskListId) {
        document.getElementById("taskListId").value = result.taskListId;
      } else {
        document.getElementById("taskListId").value = "@default";
      }

      // オプション表示の初期化
      updateServiceOptions();
    }
  );
});
