/**
 * 3種類の課題をまとめて取得・処理するための汎用関数
 */
async function fetchTasks(url, type) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const rows = doc.querySelectorAll('div.contentbody-l table tbody tr');
    const tasks = [];
    rows.forEach((row, index) => {
      if (index === 0) return;
      const titleElement = row.querySelector('td:nth-child(1) a');
      // 締切がない場合も考慮する
      const deadlineElement = row.querySelector('td:nth-child(3)');
      if (titleElement) {
        tasks.push({
          title: titleElement.innerText.trim(),
          deadline: (deadlineElement && deadlineElement.innerText.trim()) ? deadlineElement.innerText.trim() : 'なし',
          url: titleElement.href,
          type: type
        });
      }
    });
    return tasks;
  } catch (error) {
    console.error(`${type}情報の取得エラー:`, error);
    return [];
  }
}

/**
 * 取得した課題データを画面に表示する
 */
function renderTasks(tasks, boxElement) {
  // 古い内容をクリア
  while (boxElement.children.length > 1) {
      boxElement.removeChild(boxElement.lastChild);
  }

  if (tasks.length === 0) {
    const noTaskMessage = document.createElement('p');
    noTaskMessage.textContent = '現在、提出すべき課題はありません。';
    boxElement.appendChild(noTaskMessage);
    return;
  }

  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.style.marginBottom = '12px';
    taskItem.style.paddingBottom = '8px';
    taskItem.style.borderBottom = '1px solid #eee';

    const titleLink = document.createElement('a');
    titleLink.href = task.url;
    titleLink.textContent = `【${task.type}】${task.title}`;
    titleLink.target = '_blank';
    titleLink.style.color = '#005ab3';
    titleLink.style.textDecoration = 'none';
    titleLink.style.fontWeight = 'bold';
    
    // 締切がある場合のみ、締切情報を表示する
    if (task.deadline !== 'なし') {
        const deadlineText = document.createElement('p');
        deadlineText.textContent = `締切: ${task.deadline}`;
        deadlineText.style.margin = '4px 0 0 0';
        deadlineText.style.fontSize = '12px';
        // ハイライト機能は次のステップで追加します
        taskItem.appendChild(deadlineText);
    }

    taskItem.appendChild(titleLink);
    // 順番を変更：タイトルが先、締切が後
    boxElement.appendChild(taskItem);
  });
}

/**
 * メイン処理
 */
window.addEventListener('load', async () => {
  if (document.body.classList.contains('fuyuki-layout-applied')) {
    return;
  }

  const originalContainer = document.getElementById('container');
  if (!originalContainer) { return; }

  // レイアウト構築部分は、安定している今のものを維持
  const mainContainer = document.createElement('div');
  mainContainer.className = 'fuyuki-main-container';
  const contentArea = document.createElement('div');
  contentArea.className = 'fuyuki-content-area';
  const kadaiBox = document.createElement('div');
  kadaiBox.className = 'fuyuki-kadai-box';
  kadaiBox.innerHTML = '<h2>未提出課題BOX</h2>';
  originalContainer.parentNode.insertBefore(mainContainer, originalContainer);
  contentArea.appendChild(originalContainer);
  mainContainer.appendChild(contentArea);
  mainContainer.appendChild(kadaiBox);
  document.body.classList.add('fuyuki-layout-applied');

  // --- 機能追加部分 ---
  // 1. 全ての課題取得処理を並行して実行
  const taskPromises = [
    fetchTasks('/ct/home_summary_report', 'レポート'),
    fetchTasks('/ct/home_summary_query', '小テスト'),
    fetchTasks('/ct/home_summary_survey', 'アンケート')
  ];
  const allTasksRaw = (await Promise.all(taskPromises)).flat();
  
  // 2. 課題を締切日時でソートする
  allTasksRaw.sort((a, b) => {
    if (a.deadline === 'なし') return 1;
    if (b.deadline === 'なし') return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  // 3. 画面に表示する
  renderTasks(allTasksRaw, kadaiBox);
});