// 初期状態で最初のタブをアクティブにする
window.onload = () => showTab('extractor', document.querySelector('.tabs button'));

// タブ切り替えロジック
function showTab(tabId, btnElement) {
    // コンテンツの切り替え
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';

    // もしボタン要素が渡されていれば、アクティブ状態の見た目を変える
    if (btnElement) {
        document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }
}

// （HTML側で onclick="showTab('extractor', this)" と書かなくても動くようにイベントリスナーを追加）
document.querySelectorAll('.tabs button')[0].addEventListener('click', function() { showTab('extractor', this); });
document.querySelectorAll('.tabs button')[1].addEventListener('click', function() { showTab('viewer', this); });


// ====== 1. ユーザー名抽出機能 ======
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


// ====== 2. カード一覧生成機能 ======
function generateCards() {
    const text = document.getElementById('discordText').value;
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';

    // 【改善点】空行ではなく「名前：」または「名前:」の前で分割する
    const blocks = text.split(/(?=名前[：:])/);

    blocks.forEach(block => {
        if (!block.trim()) return;

        // Xのユーザー名を抽出 (全角＠にも対応)
        const match = block.match(/[@＠]([A-Za-z0-9_]{1,15})/);
        const username = match ? match[1] : null;
        
        // パース処理
        const data = {};
        block.split('\n').forEach(line => {
            const parts = line.split(/：|:/);
            if(parts.length > 1) {
                // キーと値の前後の空白を取り除いて保存
                data[parts[0].trim()] = parts[1].trim();
            }
        });

        // 「名前」がないブロック（Discordの日付だけが入ったゴミデータなど）はスキップ
        if (!data['名前']) return;

        // カード作成
        const card = document.createElement('div');
        card.className = 'profile-card';
        
        // アイコン画像（エラー時はグレーの丸を表示）
        const imgTag = username 
            ? `<img src="https://unavatar.io/twitter/${username}" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%23eff3f4%22/%3E%3C/svg%3E'">` 
            : `<img src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%23eff3f4%22/%3E%3C/svg%3E">`;

        // ユーザー名のリンク生成
        const twitterLink = username 
            ? `<a href="https://x.com/${username}" target="_blank" style="color:#1d9bf0; text-decoration:none;">@${username}</a>` 
            : '-';

        card.innerHTML = `
            ${imgTag}
            <h3>${data['名前']}</h3>
            <p><strong>分野:</strong> ${data['分野'] || '-'}</p>
            <p><strong>資格:</strong> ${data['資格'] || '-'}</p>
            <p><strong>X:</strong> ${twitterLink}</p>
        `;
        container.appendChild(card);
    });
}

// HTML側で onclick を書かなくても動くようにボタンにイベントを紐付け
document.querySelector('#viewer button').addEventListener('click', generateCards);