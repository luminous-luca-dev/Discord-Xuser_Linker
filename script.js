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


// タブ切り替えロジック
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

// カード生成ロジック
function generateCards() {
    const text = document.getElementById('discordText').value;
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';

    // Discordの1人分ずつの塊に分割（空行で区切られていると仮定）
    const blocks = text.split(/\n\s*\n/);

    blocks.forEach(block => {
        if (!block.trim()) return;

        // Xのユーザー名を抽出
        const match = block.match(/@([A-Za-z0-9_]{1,15})/);
        const username = match ? match[1] : null;
        
        // 簡易パース：行ごとに「名前：〜」などをオブジェクト化
        const data = {};
        block.split('\n').forEach(line => {
            const parts = line.split(/：|:/);
            if(parts.length > 1) data[parts[0].trim()] = parts[1].trim();
        });

        // カード作成
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `
            ${username ? `<img src="https://unavatar.io/twitter/${username}" onerror="this.src='default_icon.png'">` : ''}
            <h3>${data['名前'] || '名前なし'}</h3>
            <p><strong>分野:</strong> ${data['分野'] || '-'}</p>
            <p><strong>資格:</strong> ${data['資格'] || '-'}</p>
            <p><strong>X:</strong> ${username ? `@${username}` : '-'}</p>
        `;
        container.appendChild(card);
    });
}