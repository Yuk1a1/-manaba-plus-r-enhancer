// manaba-plus-r-enhancer/background.js
chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
  // ★ 変更点: URLをチェックし、manabaドメインでなければ処理を中断
  const manabaUrlPattern = "https://ct.ritsumei.ac.jp/ct/";
  if (!downloadItem.referrer || !downloadItem.referrer.startsWith(manabaUrlPattern)) {
    // manabaからのダウンロードではないため、何もしない
    // suggestを呼ばずに終了することで、ブラウザのデフォルトのダウンロード処理に任せる
    return;
  }

  // ★ 変更点: 授業名取得ロジックを使い、ファイルパスを生成する
  chrome.storage.local.get(['currentCourseName'], function(result) {
    // content_scriptから保存された授業名を使用する。なければデフォルト名。
    let courseName = result.currentCourseName || "manaba-files";

    // ファイル名として不適切な文字を置換する
    const sanitizedCourseName = courseName.replace(/[\\/:*?"<>|]/g, '－');
    const originalFilename = downloadItem.filename;

    // 新しいファイルパスを構築する (Manaba/[授業名]/[元のファイル名])
    const newFilename = `Manaba/${sanitizedCourseName}/${originalFilename}`;

    console.log("Suggesting new filename:", newFilename);

    suggest({
      filename: newFilename,
      conflictAction: 'uniquify' // ファイル名が競合した場合、(1), (2)のように連番を付ける
    });
  });

  return true; // 非同期処理のためtrueを返す
});

function getAuthToken(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: interactive }, (token) => {
      if (chrome.runtime.lastError) {
        // ★ 変更点: lastErrorオブジェクトをそのままrejectに渡す
        console.error('getAuthToken Error Object:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'requestAuth') {
    getAuthToken(request.interactive)
      .then(token => {
        sendResponse({ success: true, token: token });
      })
      .catch(error => {
        // ★ 変更点: エラーオブジェクトをJSON文字列に変換して返す
        sendResponse({ success: false, error: JSON.stringify(error, Object.getOwnPropertyNames(error)) });
      });
    return true; 
  }

  if (request.action === 'createCalendarEvent') {
    const { token, task } = request;
    const event = {
      'summary': `【${task.taskType}】${task.title}`,
      'description': `manaba+Rの課題です。\n詳細は以下のURLから確認してください。\n\n${task.link}`,
      'start': { 'dateTime': task.deadlineDate, 'timeZone': 'Asia/Tokyo' },
      'end': { 'dateTime': task.deadlineDate, 'timeZone': 'Asia/Tokyo' },
      'reminders': {
        'useDefault': false,
        'overrides': [
          { 'method': 'popup', 'minutes': 24 * 60 },
          { 'method': 'popup', 'minutes': 12 * 60 },
          { 'method': 'popup', 'minutes': 3 * 60 },
          { 'method': 'popup', 'minutes': 60 },
        ],
      },
    };

    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(JSON.stringify(data.error));
      }
      sendResponse({ success: true, event: data });
    })
    .catch(error => {
      console.error('API Error:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
});