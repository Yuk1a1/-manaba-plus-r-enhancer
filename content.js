/**
 * 右カラムを生成し、未提出課題リストとカレンダーのコンテナを配置する
 * @param {HTMLElement} parentElement - 右カラムを追加する親要素
 * @returns {object} - 未提出課題リストを描画するコンテナとカレンダーを描画するコンテナ
 */
function createRightColumn(parentElement) {
    const rightColumn = document.createElement('div');
    rightColumn.id = 'right-column';

    const kadaiBox = document.createElement('div');
    kadaiBox.id = 'kadai-box';
    kadaiBox.className = 'content-box';
    const kadaiTitle = document.createElement('h2');
    kadaiTitle.className = 'box-title';
    kadaiTitle.textContent = '未提出課題リスト';
    kadaiBox.appendChild(kadaiTitle);

    const calendarBox = document.createElement('div');
    calendarBox.id = 'calendar-box';
    calendarBox.className = 'content-box';
    const calendarTitle = document.createElement('h2');
    calendarTitle.className = 'box-title';
    calendarTitle.textContent = '締切カレンダー';
    calendarBox.appendChild(calendarTitle);

    const calendarElement = document.createElement('div');
    calendarElement.id = 'vanilla-calendar';
    calendarBox.appendChild(calendarElement);

    rightColumn.appendChild(kadaiBox);
    rightColumn.appendChild(calendarBox);
    parentElement.appendChild(rightColumn);

    return { kadaiContainer: kadaiBox, calendarContainer: calendarBox };
}


/**
 * 課題の種類に応じてCSSクラスを返す
 * @param {string} taskType - 課題の種類（レポート, 小テスト, アンケート）
 * @returns {string} - 対応するCSSクラス名
 */
function getTaskTypeClass(taskType) {
    switch (taskType) {
        case 'レポート':
            return 'task-report';
        case '小テスト':
            return 'task-quiz';
        case 'アンケート':
            return 'task-survey';
        default:
            return 'task-other';
    }
}

/**
 * 課題データをHTMLに変換してリスト表示する
 * @param {Array<object>} tasks - 表示する課題の配列
 * @param {HTMLElement} container - 課題リストを追加するコンテナ要素
 */
function displayTasks(tasks, container) {
    const list = document.createElement('ul');
    list.id = 'task-list';

    tasks.forEach(task => {
        if (hiddenTasks.includes(task.id)) {
            return;
        }

        const listItem = document.createElement('li');
        listItem.dataset.taskId = task.id;

        const now = new Date();
        const deadline = task.deadlineDate;
        const isUrgent = deadline && (deadline.getTime() - now.getTime()) < 24 * 60 * 60 * 1000;
        if (isUrgent) {
            listItem.classList.add('urgent');
        }

        const typeSpan = document.createElement('span');
        typeSpan.className = `task-type ${getTaskTypeClass(task.taskType)}`;
        typeSpan.textContent = task.taskType;

        const titleLink = document.createElement('a');
        titleLink.href = task.link;
        titleLink.textContent = task.title;
        titleLink.target = '_blank';

        const deadlineSpan = document.createElement('span');
        deadlineSpan.className = 'deadline';
        deadlineSpan.textContent = task.deadline;

        const hideButton = document.createElement('button');
        hideButton.className = 'hide-button';
        hideButton.textContent = '×';
        hideButton.title = 'この課題を非表示にする';
        hideButton.addEventListener('click', (e) => {
            e.stopPropagation();
            hideTask(task.id);
        });
        
        listItem.appendChild(typeSpan);
        listItem.appendChild(titleLink);
        listItem.appendChild(deadlineSpan);
        listItem.appendChild(hideButton);

        list.appendChild(listItem);
    });
    
    const existingList = container.querySelector('#task-list');
    if (existingList) {
        existingList.remove();
    }
    container.appendChild(list);
}


/**
 * 指定されたURLからHTMLを取得し、DOMとしてパースする
 * @param {string} url - 取得先のURL
 * @returns {Promise<Document>} - パースされたHTMLドキュメント
 */
async function fetchAndParse(url) {
    const response = await fetch(url);
    const text = await response.text();
    return new DOMParser().parseFromString(text, 'text/html');
}

/**
 * 3種類の課題（レポート・小テスト・アンケート）をすべて取得する
 * @returns {Promise<Array<object>>} - 全ての未提出課題の配列
 */
async function fetchAllTasks() {
    const taskDefinitions = [
        { type: 'レポート', url: '/ct/home_summary_report' },
        { type: '小テスト', url: '/ct/home_summary_query' },
        { type: 'アンケート', url: '/ct/home_summary_survey' } 
    ];

    let allTasks = [];

    for (const def of taskDefinitions) {
        try {
            const doc = await fetchAndParse(def.url);
            const rows = doc.querySelectorAll('.contentbody-l tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 3) return; 

                const titleElement = cells[0].querySelector('a');
                if (!titleElement) return;

                const title = titleElement.innerText.trim();
                const link = titleElement.href;
                const deadline = cells[2].innerText.trim();
                
                let deadlineDate = null;
                if (deadline && deadline !== '締切なし') {
                    const match = deadline.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
                    if (match) {
                        deadlineDate = new Date(match[1], match[2] - 1, match[3], match[4], match[5]);
                    }
                }

                allTasks.push({
                    id: `${def.type}-${link}-${title}`,
                    taskType: def.type,
                    title,
                    link,
                    deadline,
                    deadlineDate
                });
            });
        } catch (error) {
            console.error(`${def.type}の取得に失敗しました:`, error);
        }
    }
    return allTasks;
}

/**
 * 課題を締切日時でソートする（締切なしは最後尾）
 * @param {Array<object>} tasks - ソート対象の課題配列
 */
function sortTasks(tasks) {
    tasks.sort((a, b) => {
        if (!a.deadlineDate && !b.deadlineDate) return 0;
        if (!a.deadlineDate) return 1;
        if (!b.deadlineDate) return -1;
        return a.deadlineDate - b.deadlineDate;
    });
}

/**
 * 課題を非表示にし、その状態を永続化する
 * @param {string} taskId - 非表示にする課題のID
 */
function hideTask(taskId) {
    if (!hiddenTasks.includes(taskId)) {
        hiddenTasks.push(taskId);
        chrome.storage.local.set({ hiddenTasks: hiddenTasks }, () => {
            const taskElement = document.querySelector(`li[data-task-id="${CSS.escape(taskId)}"]`);
            if (taskElement) {
                taskElement.remove();
            }
        });
    }
}

/**
 * 全ての非表示設定を解除し、リストを再描画する
 */
async function resetHiddenTasks() {
    await chrome.storage.local.remove('hiddenTasks');
    location.reload();
}

/**
 * 課題リストからカレンダー用のポップアップ情報を作成する
 * @param {Array<object>} tasks - 全ての課題の配列
 * @returns {object} - VanillaCalendarライブラリのpopupsオプション用のオブジェクト
 */
function createCalendarPopups(tasks) {
    const popups = {};

    tasks.forEach(task => {
        if (!task.deadlineDate) {
            return;
        }

        const year = task.deadlineDate.getFullYear();
        const month = String(task.deadlineDate.getMonth() + 1).padStart(2, '0');
        const day = String(task.deadlineDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // ★★★ 変更点: 課題全体をリンク(<a>タグ)で囲む ★★★
        const popupHtml = `
            <a href="${task.link}" target="_blank" class="task-popup">
                <span class="task-type-popup ${getTaskTypeClass(task.taskType)}">${task.taskType}</span>
                <span class="task-title-popup">${task.title}</span>
            </a>
        `;

        if (popups[dateStr]) {
            popups[dateStr].html += popupHtml;
        } else {
            popups[dateStr] = {
                modifier: 'task-day',
                html: popupHtml
            };
        }
    });
    return popups;
}

// グローバル変数として非表示タスクIDのリストを保持
let hiddenTasks = [];

/**
 * 課題取得から表示までの一連の処理
 * @param {HTMLElement} kadaiContainer - 課題リストを表示するコンテナ
 * @param {Array<object>} allTasks - 取得済みの全課題データ
 */
function mainProcess(kadaiContainer, allTasks) {
    displayTasks(allTasks, kadaiContainer);

    if (!kadaiContainer.querySelector('#reset-hidden-tasks')) {
        const resetButton = document.createElement('button');
        resetButton.id = 'reset-hidden-tasks';
        resetButton.textContent = '非表示の課題を全て再表示';
        resetButton.addEventListener('click', resetHiddenTasks);
        kadaiContainer.appendChild(resetButton);
    }
}


/**
 * メインの初期化処理
 */
async function initialize() {
    if (document.body.classList.contains('layout-initialized')) return;
    document.body.classList.add('layout-initialized');

    const body = document.body;
    body.classList.add('custom-layout');
    
    const { kadaiContainer } = createRightColumn(body);

    const data = await chrome.storage.local.get('hiddenTasks');
    hiddenTasks = data.hiddenTasks || [];
    
    const allTasks = await fetchAllTasks();
    sortTasks(allTasks);

    mainProcess(kadaiContainer, allTasks);
    
    const calendarPopups = createCalendarPopups(allTasks);

    const calendar = new window.VanillaCalendarPro.Calendar('#vanilla-calendar', {
        selectedTheme: 'light',
        popups: calendarPopups
    });
    calendar.init();
}

window.addEventListener('load', initialize);