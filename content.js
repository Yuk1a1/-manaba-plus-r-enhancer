// manaba-plus-r-enhancer/content.js
console.log("manaba+R Enhancer: content.js is running.");

/**
 * 右カラムを生成し、未提出課題リストとカレンダーのコンテナを配置する
 * @param {HTMLElement} parentElement - 右カラムを追加する親要素
 * @returns {object} - 未提出課題リストを描画するコンテナとカレンダーを描画するコンテナ
 */
function createRightColumn(parentElement) {
    const rightColumn = document.createElement('div');
    rightColumn.id = 'right-column';

    const rightTitle = document.createElement('h2');
    rightTitle.className = 'right-column-title';
    rightTitle.innerHTML = '<span class="toggle-icon">▼</span>';

    const kadaiBox = document.createElement('div');
    kadaiBox.id = 'kadai-box';
    kadaiBox.className = 'content-box';
    const kadaiTitle = document.createElement('h2');
    kadaiTitle.className = 'box-title';
    kadaiTitle.textContent = '未提出課題リスト';
    kadaiBox.appendChild(kadaiTitle);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'kadai-box-controls';
    kadaiBox.appendChild(controlsDiv);

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
    parentElement.appendChild(rightTitle);

    // 右カラム全体のトグル機能
    let rightColumnHidden = false;
    rightTitle.addEventListener('click', () => {
        rightColumnHidden = !rightColumnHidden;
        rightColumn.style.display = rightColumnHidden ? 'none' : '';
        document.body.classList.toggle('right-column-hidden', rightColumnHidden);
        rightTitle.querySelector('.toggle-icon').textContent = rightColumnHidden ? '▶' : '▼';
    });

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

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.dataset.taskId = task.id;

        // 課題内容エリア
        const contentArea = document.createElement('div');
        contentArea.className = 'assignment-content-area';

        const typeSpan = document.createElement('span');
        typeSpan.className = `task-type ${getTaskTypeClass(task.taskType)}`;
        typeSpan.textContent = task.taskType;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'assignment-details';

        const titleLink = document.createElement('a');
        titleLink.href = task.link;
        titleLink.textContent = task.title;
        titleLink.target = '_blank';
        titleLink.className = 'assignment-title';

        const deadlineInfo = document.createElement('div');
        deadlineInfo.className = 'deadline-info';

        if (task.deadlineDate) {
            const dateStr = task.deadlineDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeStr = task.deadlineDate.toTimeString().slice(0, 5); // HH:MM

            const dateSpan = document.createElement('span');
            dateSpan.className = 'deadline-date';
            dateSpan.textContent = dateStr;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'deadline-time';
            timeSpan.textContent = timeStr;

            deadlineInfo.appendChild(dateSpan);
            deadlineInfo.appendChild(timeSpan);

            const daysLeft = (task.deadlineDate - now) / (1000 * 60 * 60 * 24);
            if (daysLeft <= 1) deadlineInfo.classList.add('deadline-red');
            else if (daysLeft <= 3) deadlineInfo.classList.add('deadline-yellow');
            else deadlineInfo.classList.add('deadline-black');
        } else {
            deadlineInfo.classList.add('deadline-black');
            deadlineInfo.textContent = '期限なし';
        }

        detailsDiv.appendChild(titleLink);
        detailsDiv.appendChild(deadlineInfo);
        contentArea.appendChild(typeSpan);
        contentArea.appendChild(detailsDiv);

        const calendarIcon = document.createElement('div');
        calendarIcon.className = 'calendar-icon';
        calendarIcon.title = 'Googleカレンダーに登録';
        if (!task.deadlineDate) {
            calendarIcon.style.opacity = '0.2';
            calendarIcon.style.cursor = 'not-allowed';
            calendarIcon.title = '締切日時がないため登録できません';
        } else {
            calendarIcon.addEventListener('click', async () => {
                if (isAuthenticated) await registerEventToCalendar(task);
                else alert('先にGoogleカレンダーと連携してください。');
            });
        }

        const hideButton = document.createElement('button');
        hideButton.className = 'hide-button';
        hideButton.textContent = '×';
        hideButton.title = 'この課題を非表示にする';
        hideButton.addEventListener('click', (e) => {
            e.stopPropagation();
            hideTask(task.id);
        });
        
        listItem.appendChild(checkbox);
        listItem.appendChild(contentArea);
        listItem.appendChild(calendarIcon);
        listItem.appendChild(hideButton);

        list.appendChild(listItem);
    });
    
    const existingList = container.querySelector('#task-list');
    if (existingList) {
        existingList.remove();
    }
    container.appendChild(list);
}

async function registerEventToCalendar(task) {
    if (!authToken) {
        alert('認証トークンがありません。ページをリロードして再試行してください。');
        return;
    }
    const icon = document.querySelector(`li[data-task-id="${CSS.escape(task.id)}"] .calendar-icon`);
    chrome.runtime.sendMessage({ action: 'createCalendarEvent', token: authToken, task: task }, (response) => {
        if (response && response.success) {
            console.log('イベント登録成功:', response.event);
            if (icon) icon.classList.add('registered');
        } else {
            alert(`カレンダー登録に失敗しました: ${response.error}`);
        }
    });
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
let isAuthenticated = false;
let authToken = null;
let allTasks = [];

/**
 * 課題取得から表示までの一連の処理
 * @param {HTMLElement} kadaiContainer - 課題リストを表示するコンテナ
 * @param {Array<object>} allTasks - 取得済みの全課題データ
 */
function mainProcess(kadaiContainer, allTasks) {
    updateUIBasedOnAuth(kadaiContainer); 
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
 * 認証状態に基づいてUIを更新する
 * @param {HTMLElement} kadaiContainer - 課題ボックスのコンテナ
 */
function updateUIBasedOnAuth(kadaiContainer) {
    const controlsDiv = kadaiContainer.querySelector('.kadai-box-controls');
    if (!controlsDiv) {
        console.log('controlsDiv not found');
        return;
    }
    controlsDiv.innerHTML = ''; 
    console.log('isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
        setupBulkRegisterControls(kadaiContainer);
    } else {
        setupAuthButton(controlsDiv);
    }
}

/**
 * Google認証ボタンをセットアップする
 * @param {HTMLElement} container - ボタンを追加するコンテナ
 */
function setupAuthButton(container) {
    const authButton = document.createElement('button');
    authButton.id = 'auth-btn';
    authButton.className = 'kadai-box-btn';
    authButton.textContent = 'Googleカレンダーと連携する';
    authButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'requestAuth', interactive: true }, (response) => {
            if (response && response.success) {
                alert('連携に成功しました。');
                isAuthenticated = true;
                authToken = response.token;
                updateUIBasedOnAuth(document.getElementById('kadai-box'));
            } else {
                alert(`連携に失敗しました:\n${response.error}`);
            }
        });
    });
    container.appendChild(authButton);
}

/**
 * 一括登録コントロールをセットアップする
 * @param {HTMLElement} container - 課題ボックスのコンテナ
 */
function setupBulkRegisterControls(container) {
    const controlsDiv = container.querySelector('.kadai-box-controls');
    const bulkRegisterBtn = document.createElement('button');
    bulkRegisterBtn.id = 'bulk-register-btn';
    bulkRegisterBtn.className = 'kadai-box-btn';
    bulkRegisterBtn.textContent = 'カレンダーに一括登録';
    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'bulk-register-confirm-btn';
    confirmBtn.className = 'kadai-box-btn';
    confirmBtn.textContent = '選択した0件を登録';
    confirmBtn.style.display = 'none';
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'bulk-register-cancel-btn';
    cancelBtn.className = 'kadai-box-btn';
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.style.display = 'none';
    
    controlsDiv.appendChild(cancelBtn);
    controlsDiv.appendChild(confirmBtn);
    controlsDiv.appendChild(bulkRegisterBtn);
    
    bulkRegisterBtn.addEventListener('click', () => {
        document.body.classList.add('bulk-register-mode');
        bulkRegisterBtn.style.display = 'none';
        confirmBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        updateSelectedCount(); 
    });
    cancelBtn.addEventListener('click', () => {
        document.body.classList.remove('bulk-register-mode');
        bulkRegisterBtn.style.display = 'inline-block';
        confirmBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        document.querySelectorAll('.task-checkbox').forEach(cb => cb.checked = false);
    });
    confirmBtn.addEventListener('click', async () => {
        const selectedCheckboxes = document.querySelectorAll('.task-checkbox:checked');
        if (selectedCheckboxes.length === 0) return;
        const tasksToRegister = [];
        selectedCheckboxes.forEach(checkbox => {
            const taskId = checkbox.dataset.taskId;
            const task = allTasks.find(t => t.id === taskId);
            if (task) tasksToRegister.push(task);
        });

        for (const task of tasksToRegister) {
            await registerEventToCalendar(task);
        }
        alert(`${tasksToRegister.length}件の課題をカレンダーに登録しました。`);
        cancelBtn.click();
    });

    container.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            updateSelectedCount();
        }
    });

    function updateSelectedCount() {
        const count = document.querySelectorAll('.task-checkbox:checked').length;
        confirmBtn.textContent = `選択した${count}件を登録`;
    }
}


/**
 * メインの初期化処理
 */
async function initialize() {
    if (document.body.classList.contains('layout-initialized')) return;
    chrome.runtime.sendMessage({ action: 'requestAuth', interactive: false }, async (response) => {
        console.log('Auth response:', response);
        if (response && response.success) {
            isAuthenticated = true;
            authToken = response.token;
        } else {
            isAuthenticated = false;
        }
        document.body.classList.add('layout-initialized');
        document.body.classList.add('custom-layout');
        
        const { kadaiContainer } = createRightColumn(document.body);

        const data = await chrome.storage.local.get('hiddenTasks');
        hiddenTasks = data.hiddenTasks || [];
        
        allTasks = await fetchAllTasks();
        sortTasks(allTasks);

        mainProcess(kadaiContainer, allTasks);
        
        const calendarPopups = createCalendarPopups(allTasks);

        const calendar = new window.VanillaCalendarPro.Calendar('#vanilla-calendar', {
            selectedTheme: 'light',
            popups: calendarPopups
        });
        calendar.init();

        const courseNameElement = document.querySelector("#coursename"); 
        if (courseNameElement) {
            let courseName = courseNameElement.innerText.trim();
            
            const separatorIndex = courseName.indexOf('§');
            if (separatorIndex !== -1) {
                courseName = courseName.substring(0, separatorIndex).trim();
            }

            // ★ 変更点: 正規表現を使って、先頭の「数字 + コロン + 空白」のパターンを削除する
            // これにより、空白の種類（半角、全角、特殊な空白）に影響されずにコース番号を削除できる
            courseName = courseName.replace(/^\d+:\s*/, '').trim();

            chrome.storage.local.set({ currentCourseName: courseName });
        }
    });
}

window.addEventListener('load', initialize);