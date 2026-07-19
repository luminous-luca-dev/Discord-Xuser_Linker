document.getElementById('extractBtn').addEventListener('click', () => {
    const text = document.getElementById('inputText').value;
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = ''; // 結果エリアをリセット

    // 正規表現: @ または 全角＠ から始まり、半角英数字とアンダースコアが1〜15文字続く文字列を抽出
    const regex = /[@＠]([A-Za-z0-9_]{1,15})/g;
    const matches = text.match(regex);

    if (!matches) {
        resultArea.innerHTML = '<div class="empty-message">ユーザー名が見つかりませんでした。</div>';
        return;
    }

    // 重複を削除し、全角「＠」を半角「@」に統一する
    const uniqueUsernames = [...new Set(matches.map(m => '@' + m.slice(1)))];

    uniqueUsernames.forEach(username => {
        // 行のコンテナ
        const itemDiv = document.createElement('div');
        itemDiv.className = 'result-item';

        // ユーザー情報エリア
        const infoDiv = document.createElement('div');
        infoDiv.className = 'user-info';

        // @なしのID（リンク用）
        const idWithoutAt = username.slice(1);
        
        // ユーザー名のリンク（クリックでXのプロフィールを別タブで開く機能も付けました）
        const link = document.createElement('a');
        link.href = `https://x.com/${idWithoutAt}`;
        link.target = '_blank';
        link.className = 'username';
        link.textContent = username;
        link.title = 'クリックでXのプロフィールを開く';

        infoDiv.appendChild(link);

        // コピーボタン
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'コピー';

        // コピー機能の実装
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(username).then(() => {
                // コピー成功時の視覚的フィードバック
                copyBtn.textContent = 'コピー完了!';
                copyBtn.classList.add('copied');
                
                // 2秒後に元の見た目に戻す
                setTimeout(() => {
                    copyBtn.textContent = 'コピー';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('クリップボードのコピーに失敗しました', err);
                alert('コピーに失敗しました。');
            });
        });

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(copyBtn);
        resultArea.appendChild(itemDiv);
    });
});