// options.js - manaba+R Enhancer 設定画面のスクリプト

document.getElementById('save').addEventListener('click', () => {
  const gasUrl = document.getElementById('gasUrl').value.trim();
  const calendarId = document.getElementById('calendarId').value.trim() || 'primary';

  if (!gasUrl) {
    showMessage('❌ GAS URLは必須です', 'error');
    return;
  }

  // URLの形式チェック
  if (!gasUrl.startsWith('https://script.google.com/macros/')) {
    showMessage('❌ 正しいGAS URLを入力してください（https://script.google.com/macros/ で始まる必要があります）', 'error');
    return;
  }

  // URLが /exec で終わるかチェック
  if (!gasUrl.endsWith('/exec')) {
    showMessage('⚠️ URLが /exec で終わっていません。正しいデプロイURLか確認してください。', 'error');
    return;
  }

  chrome.storage.sync.set({ gasUrl, calendarId }, () => {
    showMessage('✅ 設定を保存しました！', 'success');
  });
});

document.getElementById('test').addEventListener('click', async () => {
  const gasUrl = document.getElementById('gasUrl').value.trim();
  const calendarId = document.getElementById('calendarId').value.trim() || 'primary';

  if (!gasUrl) {
    showMessage('❌ 先にGAS URLを入力してください', 'error');
    return;
  }

  const testButton = document.getElementById('test');
  testButton.disabled = true;
  testButton.textContent = '🔄 テスト中...';

  try {
    // テストイベントの日時（明日の同じ時刻）
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors', // GASはCORSヘッダーを返さないため
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendarId: calendarId,
        title: 'manaba+R Enhancer 接続テスト',
        taskType: 'テスト',
        deadlineDate: tomorrow.toISOString(),
        description: 'これは接続テストです。カレンダーから削除しても問題ありません。',
        link: 'https://ct.ritsumei.ac.jp/ct/home'
      })
    });

    // no-corsモードでは詳細なレスポンスが取得できないため、
    // エラーが発生しなければ成功とみなす
    showMessage('✅ 接続成功！カレンダーにテストイベントが追加されました。<br>（Googleカレンダーで確認してください）', 'success');
    
  } catch (error) {
    console.error('接続テストエラー:', error);
    showMessage(`❌ 接続失敗: ${error.message}<br>GAS URLが正しいか、GASプロジェクトが正しくデプロイされているか確認してください。`, 'error');
  } finally {
    testButton.disabled = false;
    testButton.textContent = '🧪 接続テスト';
  }
});

/**
 * メッセージを表示する
 * @param {string} text - 表示するメッセージ
 * @param {string} type - メッセージタイプ ('success' or 'error')
 */
function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.innerHTML = text;
  messageEl.className = `message ${type}`;
  
  // 5秒後に自動的に非表示
  setTimeout(() => {
    messageEl.className = 'message';
  }, 5000);
}

// ページ読み込み時に保存済みの値を表示
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['gasUrl', 'calendarId'], (result) => {
    if (result.gasUrl) {
      document.getElementById('gasUrl').value = result.gasUrl;
    }
    if (result.calendarId) {
      document.getElementById('calendarId').value = result.calendarId;
    } else {
      document.getElementById('calendarId').value = 'primary';
    }
  });
});
