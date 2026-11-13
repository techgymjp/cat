// 日本語・英語の切り替え。
// 決め方：URL の ?lang=en / ?lang=ja ＞ 前回選んだ言語 ＞ ブラウザの言語（日本語以外は英語）

const DICT = {
  ja: {
    pageTitle: '猫ボール',
    title: '猫ボール',
    intro: 'ころがるネコで、家の奥までどこまで行ける？',
    rules: '<span class="spark">✨キラキラ✨</span>している物はぶっ壊してOK！続けて壊すとコンボで点数アップ！<br>それ以外の家具・動物・壁にぶつかったら一発アウト！<br>タップでジャンプ。テーブルやイスの上は歩けるよ。<br>部屋のさかいめは猫用扉にねらいを定めて、ボールのままくぐろう！',
    keys: '<span class="k-pc">← → / A D で左右　クリック / スペースでジャンプ</span><span class="k-touch">左右にドラッグで移動　タップでジャンプ</span>',
    loading: 'じゅんび中…',
    start: 'スタート',
    howtoMore: '遊び方をくわしく見る',
    howto: '遊び方',
    howtoUrl: 'howto.html',
    overTitle: 'ニャーン…',
    retry: 'もう一回',
    mute: 'BGMのオン・オフ',
    langBtn: 'English',
    result: (place, cause, dist, smash, score) => `${place}で${cause}<br>きょり ${dist}m ／ こわした物 ${smash}こ<br>スコア ${score}`,
    reached: (txt) => `到達：${txt}`,
    roomTxt: (n, lap, name) => `${lap > 1 ? lap + '周目の' : ''}${name}（${n}部屋目）`,
    maxCombo: (n) => `最大コンボ ${n}`,
    newRecord: '🎉 新記録！',
    // web-only:start（Web 版だけの文言。アプリ用のビルドでは取り除く）
    playLink: '▶ Android アプリ版（Google Play）',
    playTm: 'Google Play および Google Play ロゴは Google LLC の商標です。',
    // web-only:end
    shareBtn: '結果をシェア',
    pause: 'ポーズ', pauseTitle: 'ポーズ', resume: 'つづける', toTitle: 'タイトルへ', back: 'もどる', play: 'プレイ',
    privacy: 'プライバシーポリシー', privacyUrl: 'https://techgym.jp/privacy-policy/', adSettings: '広告の設定',
    reviveMsg: '広告を見て、ここから続ける？',
    reviveWatch: '▶ 広告を見て続ける',
    reviveLoading: '広告を読み込み中…',
    reviveFail: '広告を読み込めませんでした',
    reviveNote: (n) => `このゲームで あと ${n} 回`,
    reviveSkip: (s) => `やめる（${s}）`,
    revived: (n) => `復活 ${n} 回`,
    shareDialog: '結果をシェア',
    copyLink: 'リンクをコピー',
    copied: 'コピーしました！',
    shareText: (place, n, score, combo, revives = 0) => `猫ボールで${place}（${n}部屋目）まで到達！スコア${score}${combo >= 2 ? `・最大${combo}コンボ` : ''}${revives ? `（復活${revives}回）` : ''}🐈`,
    hashtags: '猫ボール',
    farthest: (txt) => `最高到達：${txt}`,
    combo: (n, m) => `${n}コンボ！ ×${m}`,
    best: (n) => `ベスト ${n}`,
    banner: (name) => `〜 ${name} 〜`,
    cause: {
      bump: 'ゴツン！',
      vacuum: '掃除機に吸いこまれた！',
      cat: '先輩ネコに「シャーッ」とされた！',
      dog: '犬にぶつかって起こしてしまった！',
      doorTop: '猫用扉の上の壁にゴツン！',
      doorMiss: '壁にゴツン！猫用扉をくぐれなかった',
    },
    scene: {
      genkan: '玄関', rouka: '廊下', chanoma: '茶の間', engawa: '縁側', washitsu: '和室', yoshitsu: '洋室', kids: '子ども部屋',
      study: '書斎', hobby: '秘密のホビールーム', kitchen: 'キッチン', bar: 'ホームバー', karaoke: 'カラオケルーム', billiard: 'ビリヤード室',
      pingpong: '卓球ルーム', brick: '煉瓦の暖炉部屋', oosetsu: '洋風応接室', music: '音楽室', sunroom: '室内花壇', attic: '屋根裏部屋', aquarium: 'アクアリウム室',
    },
  },
  en: {
    pageTitle: 'Neko Ball',
    title: 'Neko Ball',
    intro: 'How far into the house can a rolling cat get?',
    rules: 'Things that <span class="spark">✨sparkle✨</span> are fair game — smash them! Smash several in a row for a combo bonus!<br>Bump into any other furniture, animal or wall and you’re out!<br>Tap to jump. You can walk on tables and chairs.<br>At the end of each room, line up with the cat flap and roll through it as a ball!',
    keys: '<span class="k-pc">← → / A D to move　Click / Space to jump</span><span class="k-touch">Drag left or right to move　Tap to jump</span>',
    loading: 'Loading…',
    start: 'Start',
    howtoMore: 'How to play',
    howto: 'How to play',
    howtoUrl: 'howto-en.html',
    overTitle: 'Meow…',
    retry: 'Play again',
    mute: 'Music on/off',
    langBtn: '日本語',
    result: (place, cause, dist, smash, score) => `${cause} (${place})<br>Distance ${dist} m ／ Smashed ${smash}<br>Score ${score}`,
    reached: (txt) => `Reached: ${txt}`,
    roomTxt: (n, lap, name) => `${name} (room ${n}${lap > 1 ? `, lap ${lap}` : ''})`,
    maxCombo: (n) => `Best combo ${n}`,
    newRecord: '🎉 New record!',
    // web-only:start
    playLink: '▶ Get the Android app (Google Play)',
    playTm: 'Google Play and the Google Play logo are trademarks of Google LLC.',
    // web-only:end
    shareBtn: 'Share your result',
    pause: 'Pause', pauseTitle: 'Paused', resume: 'Resume', toTitle: 'Title', back: 'Back', play: 'Play',
    privacy: 'Privacy Policy', privacyUrl: 'https://techgym.jp/privacy-policy-en/', adSettings: 'Ad settings',
    reviveMsg: 'Watch an ad to keep going from here?',
    reviveWatch: '▶ Watch ad & continue',
    reviveLoading: 'Loading ad…',
    reviveFail: 'Could not load an ad',
    reviveNote: (n) => `${n} left this game`,
    reviveSkip: (s) => `No thanks (${s})`,
    revived: (n) => `Revived ${n}×`,
    shareDialog: 'Share your result',
    copyLink: 'Copy link',
    copied: 'Copied!',
    shareText: (place, n, score, combo, revives = 0) => `I rolled all the way to the ${place} (room ${n}) in Neko Ball! Score ${score}${combo >= 2 ? `, best combo ${combo}` : ''}${revives ? ` (revived ${revives}×)` : ''} 🐈`,
    hashtags: 'NekoBall',
    farthest: (txt) => `Farthest: ${txt}`,
    combo: (n, m) => `${n} COMBO! ×${m}`,
    best: (n) => `Best ${n}`,
    banner: (name) => `~ ${name} ~`,
    cause: {
      bump: 'Bonk!',
      vacuum: 'Sucked up by the vacuum cleaner!',
      cat: 'The big cat hissed at you!',
      dog: 'You bumped into the dog and woke it up!',
      doorTop: 'Bonk! Hit the wall above the cat flap',
      doorMiss: 'Bonk! Missed the cat flap',
    },
    scene: {
      genkan: 'Entrance Hall', rouka: 'Hallway', chanoma: 'Living Room (Japanese)', engawa: 'Veranda', washitsu: 'Tatami Room', yoshitsu: 'Bedroom',
      kids: 'Kids’ Room', study: 'Study', hobby: 'Secret Hobby Room', kitchen: 'Kitchen', bar: 'Home Bar', karaoke: 'Karaoke Room',
      billiard: 'Billiard Room', pingpong: 'Table Tennis Room', brick: 'Brick Fireplace Room', oosetsu: 'Drawing Room', music: 'Music Room',
      sunroom: 'Indoor Garden', attic: 'Attic', aquarium: 'Aquarium Room',
    },
  },
};

function detect() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'ja' || q === 'en') return q;
  } catch {}
  try {
    const s = localStorage.getItem('catball-lang');
    if (s === 'ja' || s === 'en') return s;
  } catch {}
  const nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'ja';
  return nav.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export let lang = detect();
export const t = () => DICT[lang];
export const sceneName = (id) => DICT[lang].scene[id] || id;

export function setLang(l) {
  lang = l;
  try { localStorage.setItem('catball-lang', l); } catch {}
  applyStatic();
}

// HTML の data-i18n / data-i18n-html を書きかえる
export function applyStatic() {
  const d = DICT[lang];
  document.documentElement.lang = lang;
  document.title = d.pageTitle;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = d[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = d[el.dataset.i18nHtml]; });
  document.querySelectorAll('[data-i18n-href]').forEach(el => { el.href = d[el.dataset.i18nHref]; });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', d[el.dataset.i18nAria]); });
}
