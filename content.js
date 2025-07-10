// ----------------------------------------------------
// 1. 未提出レポートを取得する非同期関数（修正版）
// ----------------------------------------------------
async function fetchReports() {
  console.log('レポート情報の取得を開始します。');
  try {
    // 調査結果に基づき、URLを修正
    const reportListURL = '/ct/home_summary_report'; 
    const response = await fetch(reportListURL);
    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // 調査結果に基づき、セレクタを修正
    // contentbody-lクラス内のテーブルにある、tbody内の全てのtr要素を取得
    const reportRows = doc.querySelectorAll('div.contentbody-l table tbody tr');
    
    const reports = [];
    reportRows.forEach((row, index) => {
      // 1行目はヘッダーなので無視する
      if (index === 0) {
        return;
      }

      // 調査結果に基づき、列の番号を修正
      const titleElement = row.querySelector('td:nth-child(1) a');
      const deadlineElement = row.querySelector('td:nth-child(3)');

      if (titleElement && deadlineElement) {
        reports.push({
          title: titleElement.innerText.trim(),
          deadline: deadlineElement.innerText.trim(),
          url: titleElement.href,
          type: 'レポート'
        });
      }
    });

    console.log('取得したレポート情報:', reports);
    return reports;

  } catch (error) {
    console.error('レポート情報の取得中にエラーが発生しました:', error);
    return [];
  }
}

// ----------------------------------------------------
// 2. 課題データを画面に表示する関数（変更なし）
// ----------------------------------------------------
function renderTasks(tasks, boxElement) {
  if (tasks.length === 0) {
    const noTaskMessage = document.createElement('p');
    noTaskMessage.textContent = '現在、提出すべき課題はありません。'; // メッセージを汎用的に変更
    noTaskMessage.style.fontSize = '14px';
    noTaskMessage.style.color = '#555';
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
    titleLink.style.textDecoration = 'none';
    titleLink.style.fontWeight = 'bold';
    titleLink.style.color = '#005ab3';

    const deadlineText = document.createElement('p');
    deadlineText.textContent = `締切: ${task.deadline}`;
    deadlineText.style.margin = '4px 0 0 0';
    deadlineText.style.fontSize = '12px';
    deadlineText.style.color = '#e74c3c';

    taskItem.appendChild(titleLink);
    taskItem.appendChild(deadlineText);
    boxElement.appendChild(taskItem);
  });
}


// ----------------------------------------------------
// 3. ページの読み込みが完了したときに全体処理を実行（変更なし）
// ----------------------------------------------------
window.addEventListener('load', async () => {
  if (document.body.classList.contains('fuyuki-layout-applied')) {
    return;
  }
  
  const mainContainer = document.createElement('div');
  mainContainer.className = 'fuyuki-main-container';
  const contentArea = document.createElement('div');
  contentArea.className = 'fuyuki-content-area';
  const kadaiBox = document.createElement('div');
  kadaiBox.className = 'fuyuki-kadai-box';
  kadaiBox.innerHTML = '<h2>未提出課題BOX</h2>';
  
  const allNodes = Array.from(document.body.childNodes);
  allNodes.forEach(node => {
    if (node.nodeName !== 'SCRIPT') {
      contentArea.appendChild(node);
    }
  });

  mainContainer.appendChild(contentArea);
  mainContainer.appendChild(kadaiBox);
  document.body.appendChild(mainContainer);
  document.body.classList.add('fuyuki-layout-applied');

  const reports = await fetchReports();
  renderTasks(reports, kadaiBox);
});