chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
  console.log("--- onDeterminingFilename triggered ---"); // ★ 変更点: デバッグログ追加 ★
  console.log("downloadItem.referrer:", downloadItem.referrer); // ★ 変更点: デバッグログ追加 ★

  const referrerUrl = downloadItem.referrer;
  let courseId = "unknown_course";
  const courseIdMatch = referrerUrl.match(/(?:course|page)_[a-f0-9]*?(\d+)/);
  if (courseIdMatch && courseIdMatch[1]) {
    courseId = `course_${courseIdMatch[1]}`;
  }
  console.log("Extracted courseId:", courseId); // ★ 変更点: デバッグログ追加 ★

  // ★ 変更点: chrome.storage.localから授業名を取得する ★
  chrome.storage.local.get(['currentCourseName'], function(result) {
    let courseName = "Manaba Files"; // デフォルトの授業名
    if (result.currentCourseName) {
      courseName = result.currentCourseName;
    }
    console.log("Retrieved courseName from storage:", courseName); // ★ 変更点: デバッグログ追加 ★

    const sanitizedCourseName = courseName.replace(/[/\\?%*:|"<>.\\]/g, '-');
    const sanitizedCourseId = courseId.replace(/[/\\?%*:|"<>.\\]/g, '-');

    const originalFilename = downloadItem.filename;
    const newFilename = `Manaba/${sanitizedCourseName}_${sanitizedCourseId}/${originalFilename}`;
    console.log("Suggested newFilename:", newFilename); // ★ 変更点: デバッグログ追加 ★

    suggest({ filename: newFilename });
  });

  return true;
});