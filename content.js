// ページの読み込みが完了したときに処理を実行する
window.addEventListener('load', () => {
  // この拡張機能が既にレイアウト変更を実行済みか確認
  if (document.body.classList.contains('fuyuki-layout-applied')) {
    return;
  }

  // ----------------------------------------------------
  // 1. 新しいレイアウト要素を作成
  // ----------------------------------------------------
  const mainContainer = document.createElement('div');
  mainContainer.className = 'fuyuki-main-container';

  const contentArea = document.createElement('div');
  contentArea.className = 'fuyuki-content-area';

  const kadaiBox = document.createElement('div');
  kadaiBox.className = 'fuyuki-kadai-box';
  kadaiBox.innerHTML = '<h2>未提出課題BOX</h2>';

  // ----------------------------------------------------
  // 2. 既存の全コンテンツを contentArea に移動
  // ----------------------------------------------------
  // body直下にある全要素を安全に移動するため、一度配列に変換
  const allNodes = Array.from(document.body.childNodes);
  allNodes.forEach(node => {
    // このスクリプト自体は移動しないように除外
    if (node.nodeName !== 'SCRIPT') {
      contentArea.appendChild(node);
    }
  });

  // ----------------------------------------------------
  // 3. 新しいレイアウトをページに適用
  // ----------------------------------------------------
  mainContainer.appendChild(contentArea);
  mainContainer.appendChild(kadaiBox);

  document.body.appendChild(mainContainer);

  // 処理が完了したことを示す目印をbodyに追加
  document.body.classList.add('fuyuki-layout-applied');

}, false);