const charData = {
  'mario': { name: 'Mario', img: 'assets/images/mario.png', color: '#FF0000' },
  'luigi': { name: 'Luigi', img: 'assets/images/luigi.png', color: '#00AA00' },
  'peach': { name: 'Peach', img: 'assets/images/peach.png', color: '#FF69B4' },
  'toad':  { name: 'Toad',  img: 'assets/images/toad.png',  color: '#0000FF' }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// アニメーションを途中で中断するためのフラグ
let abortAnimation = false; 

async function showResults(results) {
  abortAnimation = false; // 実行時にフラグをリセット

  const resultsArea = document.getElementById('results-area');
  resultsArea.innerHTML = ''; 
  
  const oldExitMessage = document.getElementById('exit-message');
  if (oldExitMessage) {
    oldExitMessage.remove();
  }
    
  document.getElementById('title').classList.remove('hidden');
  document.getElementById('bgm').currentTime = 0;
  document.getElementById('bgm').play(); 

  for (let i = 3; i >= 0; i--) {
    // 中断フラグがtrueなら、以降の処理をキャンセルして関数を抜ける
    if (abortAnimation) return; 

    const charKey = results[i];
    const rank = i + 1;

    const row = document.createElement('div');
    row.className = 'character-row';
    row.style.background = charData[charKey].color; 
    row.innerHTML = `
      <div class="rank">${rank}</div>
      <img class="char-img" src="${charData[charKey].img}" alt="${charData[charKey].name}">
      <div class="char-name">${charData[charKey].name}</div>
    `;
    resultsArea.prepend(row); 

    await sleep(50);
    if (abortAnimation) return; // 待機後にも確認
    row.classList.add('show');
      
    const se = document.getElementById('se');
    se.currentTime = 0;
    se.play();

    await sleep(1500);
  }

  await sleep(3000);
  if (abortAnimation) return; // 待機後にも確認

  const exitMessage = document.createElement('div');
  exitMessage.id = 'exit-message';
  exitMessage.innerHTML = `
    <h1 style="font-size: 3em; margin: 0 0 20px 0;">🏁 おしまい 🏁</h1>
    <p style="font-size: 2em; margin: 0;">忘れ物のないよう、出口へお進みください。</p>
  `;
  
  Object.assign(exitMessage.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    padding: '40px 60px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 1s ease'
  });
  
  document.body.appendChild(exitMessage);
  exitMessage.getBoundingClientRect(); 
  exitMessage.style.opacity = '1';
}

// 画面を初期状態に戻す関数
function resetDisplay() {
  abortAnimation = true; // 進行中のアニメーションをストップ

  // BGMを停止して先頭に戻す
  const bgm = document.getElementById('bgm');
  bgm.pause();
  bgm.currentTime = 0;

  // 画面の表示をクリア
  document.getElementById('results-area').innerHTML = '';
  document.getElementById('title').classList.add('hidden');
  
  const oldExitMessage = document.getElementById('exit-message');
  if (oldExitMessage) {
    oldExitMessage.remove();
  }
}

// ストレージのイベントリスナーにリセットの検知を追加
window.addEventListener('storage', (e) => {
  if (e.key === 'mk_trigger') {
    const results = JSON.parse(localStorage.getItem('mk_results'));
    if (results) {
      showResults(results);
    }
  } else if (e.key === 'mk_reset_trigger') {
    // リセットボタンが押された時の処理
    resetDisplay();
  }
});
