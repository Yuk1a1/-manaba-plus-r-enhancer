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