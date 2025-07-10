// ----------------------------------------------------
// 各種課題を取得する非同期関数群 (変更なし)
// ----------------------------------------------------
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

// ----------------------------------------------------
// 課題データを画面に表示する関数 (★変更あり)
// ----------------------------------------------------
function renderTasks(tasks, boxElement) {
  while (boxElement.children.length > 1) {
    boxElement.removeChild(boxElement.lastChild);
  }

  if (tasks.length === 0) {
    const noTaskMessage = document.createElement('p');
    noTaskMessage.textContent = '現在、表示する課題はありません。';
    boxElement.appendChild(noTaskMessage);
    return;
  }
  
  const now = new Date();
  const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;

  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.style.marginBottom = '12px';
    taskItem.style.paddingBottom = '8px';
    taskItem.style.borderBottom = '1px solid #eee';
    taskItem.dataset.taskUrl = task.url; // 要素にURLを紐づけておく

    const hideButton = document.createElement('button');
    hideButton.textContent = '非表示';
    hideButton.className = 'fuyuki-hide-button';
    
    // --- ★非表示ボタンのクリック処理 ---
    hideButton.addEventListener('click', async () => {
      const urlToHide = task.url;
      const result = await chrome.storage.local.get(['hiddenTasks']);
      const hiddenTasks = result.hiddenTasks || [];
      if (!hiddenTasks.includes(urlToHide)) {
        hiddenTasks.push(urlToHide);
        await chrome.storage.local.set({ hiddenTasks: hiddenTasks });
        // 即座に画面から消す
        taskItem.style.display = 'none';
      }
    });
    
    const titleLink = document.createElement('a');
    titleLink.href = task.url;
    titleLink.textContent = `【${task.type}】${task.title}`;
    titleLink.target = '_blank';
    titleLink.style.color = '#005ab3';
    titleLink.style.textDecoration = 'none';
    titleLink.style.fontWeight = 'bold';
    
    taskItem.appendChild(hideButton);
    taskItem.appendChild(titleLink);

    if (task.deadline !== 'なし') {
      const deadlineText = document.createElement('p');
      deadlineText.textContent = `締切: ${task.deadline}`;
      deadlineText.style.margin = '4px 0 0 0';
      deadlineText.style.fontSize = '12px';
      
      const deadlineDate = new Date(task.deadline);
      const diff = deadlineDate - now;
      if (diff > 0 && diff < twentyFourHoursInMillis) {
        deadlineText.classList.add('fuyuki-deadline-urgent');
      }
      taskItem.appendChild(deadlineText);
    }
    boxElement.appendChild(taskItem);
  });
}

// ----------------------------------------------------
// ページの読み込みが完了したときに全体処理を実行 (★変更あり)
// ----------------------------------------------------
async function main() {
  if (document.body.classList.contains('fuyuki-layout-applied')) {
    return;
  }

  const originalContainer = document.getElementById('container');
  if (!originalContainer) { return; }

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

  // --- 機能実装 ---
  const taskPromises = [
    fetchTasks('/ct/home_summary_report', 'レポート'),
    fetchTasks('/ct/home_summary_query', '小テスト'),
    fetchTasks('/ct/home_summary_survey', 'アンケート')
  ];
  const allTasksRaw = (await Promise.all(taskPromises)).flat();
  
  // ★非表示リストを取得してフィルタリング
  const storageResult = await chrome.storage.local.get(['hiddenTasks']);
  const hiddenTasks = storageResult.hiddenTasks || [];
  const visibleTasks = allTasksRaw.filter(task => !hiddenTasks.includes(task.url));
  
  visibleTasks.sort((a, b) => {
    if (a.deadline === 'なし') return 1;
    if (b.deadline === 'なし') return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  renderTasks(visibleTasks, kadaiBox);
  
  const restoreLink = document.createElement('a');
  restoreLink.textContent = '非表示にした課題を全て再表示';
  restoreLink.className = 'fuyuki-restore-link';
  
  // --- ★再表示リンクのクリック処理 ---
  restoreLink.addEventListener('click', async () => {
    await chrome.storage.local.remove('hiddenTasks');
    // 画面をリロードして全てを再描画するのが最も確実
    window.location.reload();
  });
  kadaiBox.appendChild(restoreLink);
}

window.addEventListener('load', main);