/* =========================================================
 * 樱聘 YingPin — 共通ロジック
 * テーマ切替（小紅書風レッド / トラストブルー）
 * 言語切替（日本語 / 简体中文）
 * 登録状態のシミュレーション（localStorage）
 * 共通UI（タブバー・デモバー・モーダル・トースト・求人カード）
 * ======================================================= */

const LS = {
  theme: 'yp_theme',
  lang: 'yp_lang',
  registered: 'yp_registered',
  profile: 'yp_profile',
  favs: 'yp_favs',
  apps: 'yp_apps',
};

/* ---------- 基本状態 ---------- */
function getTheme() { return localStorage.getItem(LS.theme) === 'red' ? 'red' : 'blue'; }
function getLang() { return localStorage.getItem(LS.lang) === 'zh' ? 'zh' : 'ja'; }
function isRegistered() { return localStorage.getItem(LS.registered) === '1'; }

function setTheme(theme) {
  localStorage.setItem(LS.theme, theme);
  document.documentElement.classList.add('theme-anim');
  applyPrefs();
  setTimeout(() => document.documentElement.classList.remove('theme-anim'), 400);
}

function setLang(lang) {
  localStorage.setItem(LS.lang, lang);
  applyPrefs();
  applyI18n();
  if (typeof window.onLangChange === 'function') window.onLangChange();
}

function setRegistered(v) {
  if (v) localStorage.setItem(LS.registered, '1');
  else localStorage.removeItem(LS.registered);
}

function getProfile() {
  try { return JSON.parse(localStorage.getItem(LS.profile) || 'null'); } catch (e) { return null; }
}
function setProfile(p) { localStorage.setItem(LS.profile, JSON.stringify(p)); }

function getFavs() {
  try { return JSON.parse(localStorage.getItem(LS.favs) || '[]'); } catch (e) { return []; }
}
function toggleFav(id) {
  const favs = getFavs();
  const i = favs.indexOf(id);
  if (i >= 0) favs.splice(i, 1); else favs.push(id);
  localStorage.setItem(LS.favs, JSON.stringify(favs));
  return favs.includes(id);
}

function getApps() {
  try { return JSON.parse(localStorage.getItem(LS.apps) || '[]'); } catch (e) { return []; }
}
function addApp(id) {
  const apps = getApps();
  if (!apps.some(a => a.id === id)) {
    apps.unshift({ id, date: new Date().toISOString().slice(0, 10) });
    localStorage.setItem(LS.apps, JSON.stringify(apps));
  }
}
function hasApplied(id) { return getApps().some(a => a.id === id); }

function genMemberId() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `YP-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ログインモック用のデモプロフィール */
function demoProfile() {
  return {
    lastName: '王', firstName: '小美', pinyin: 'WANG XIAOMEI',
    birth: '1998-05-12', gender: 'female', nationality: 'cn',
    residence: 'jp', address: '東京都新宿区西新宿2-8-1',
    phoneCode: '+81', phone: '90-1234-5678', wechat: 'xiaomei_2026', email: '',
    jlpt: 'N3', ssw: ['restaurant'], otherQual: '普通運転免許',
    memberId: genMemberId(),
  };
}

/* ---------- i18n ---------- */
function t(key, vars) {
  const lang = getLang();
  let s = (I18N[lang] && I18N[lang][key]) ?? I18N.ja[key] ?? key;
  if (vars) for (const k of Object.keys(vars)) s = s.replaceAll(`{${k}}`, vars[k]);
  return s;
}
function pick(obj) {
  if (obj == null) return '';
  const lang = getLang();
  return obj[lang] ?? obj.ja ?? '';
}

function applyPrefs() {
  const html = document.documentElement;
  html.dataset.theme = getTheme();
  html.dataset.lang = getLang();
  html.lang = getLang() === 'zh' ? 'zh-CN' : 'ja';
}

function applyI18n(root) {
  const scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  scope.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}

/* ---------- ユーティリティ ---------- */
const qs = (sel, root) => (root || document).querySelector(sel);
const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fieldOf(id) { return FIELDS.find(f => f.id === id); }
function jobOf(id) { return JOBS.find(j => j.id === Number(id)); }

function salaryText(job) {
  return getLang() === 'zh'
    ? `月薪 ${job.salaryMin}〜${job.salaryMax}万日元`
    : `月給 ${job.salaryMin}〜${job.salaryMax}万円`;
}
function salaryHTML(job) {
  const unit = getLang() === 'zh' ? '万日元' : '万円';
  const label = getLang() === 'zh' ? '月薪' : '月給';
  return `<span class="salary"><span class="salary-label">${label}</span><b>${job.salaryMin}〜${job.salaryMax}</b><span class="salary-unit">${unit}</span></span>`;
}
function annualText(job) {
  return getLang() === 'zh'
    ? `${job.annualMin}〜${job.annualMax}万日元`
    : `${job.annualMin}〜${job.annualMax}万円`;
}

/* ---------- SVGアイコン ---------- */
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.7-10-9.3C.6 8.6 2.6 4.5 6.7 4.5c2.2 0 3.9 1.2 5.3 3 1.4-1.8 3.1-3 5.3-3 4.1 0 6.1 4.1 4.7 7.2C19.5 16.3 12 21 12 21Z"/></svg>',
  heartFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.7-10-9.3C.6 8.6 2.6 4.5 6.7 4.5c2.2 0 3.9 1.2 5.3 3 1.4-1.8 3.1-3 5.3-3 4.1 0 6.1 4.1 4.7 7.2C19.5 16.3 12 21 12 21Z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-3.5 4.5-5.5 8-5.5s6.5 2 8 5.5"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 4 5.8 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.8-4-9s1.2-6.4 4-9Z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-2-1.2L14 3h-4l-.5 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 2 1.2L10 21h4l.5-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.06-.4.1-.8.1-1.2Z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H4l2-3.2A8 8 0 1 1 21 12Z"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="17" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>',
  yen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l6 8 6-8M12 12v8M8 14h8M8 17.5h8"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2Z"/><path d="M19 15l1 2.8L22.8 19 20 20l-1 2.8L18 20l-2.8-1 2.8-1.2L19 15Z" opacity=".7"/></svg>',
};
function icon(name, cls) { return `<span class="icon ${cls || ''}">${ICONS[name] || ''}</span>`; }

/* ---------- トースト ---------- */
let toastTimer = null;
function showToast(msg, iconName) {
  let box = qs('#yp-toast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'yp-toast';
    document.body.appendChild(box);
  }
  box.innerHTML = `${iconName ? icon(iconName) : ''}<span>${esc(msg)}</span>`;
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 2200);
}

/* ---------- モーダル / ボトムシート ---------- */
function openOverlay(inner, kind) {
  const wrap = document.createElement('div');
  wrap.className = `overlay ${kind}`;
  wrap.innerHTML = `<div class="overlay-backdrop"></div>${inner}`;
  document.body.appendChild(wrap);
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => wrap.classList.add('open'));
  const close = () => {
    wrap.classList.remove('open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => wrap.remove(), 280);
  };
  qs('.overlay-backdrop', wrap).addEventListener('click', close);
  qsa('[data-close]', wrap).forEach(b => b.addEventListener('click', close));
  return { el: wrap, close };
}

function openDialog(html) { return openOverlay(`<div class="dialog">${html}</div>`, 'is-dialog'); }
function openSheet(html, titleKey) {
  return openOverlay(
    `<div class="sheet">
       <div class="sheet-handle"></div>
       ${titleKey ? `<div class="sheet-title">${t(titleKey)}</div>` : ''}
       <div class="sheet-body">${html}</div>
     </div>`, 'is-sheet');
}

/* 未登録ユーザー向け：登録誘導モーダル */
function openRegisterGate() {
  openDialog(`
    <div class="gate">
      <div class="gate-icon">${icon('lock')}</div>
      <h3>${t('lock.title')}</h3>
      <p>${t('lock.desc')}</p>
      <a class="btn btn-primary btn-block" href="register.html">${t('lock.register')}</a>
      <a class="btn btn-ghost btn-block" href="login.html">${t('lock.login')}</a>
    </div>`);
}

/* ---------- デモバー（モック確認用） ---------- */
function renderDemoBar() {
  const handle = document.createElement('button');
  handle.id = 'demo-handle';
  handle.type = 'button';
  handle.setAttribute('aria-label', t('demo.open'));
  handle.innerHTML = icon('settings');
  handle.addEventListener('click', openDemoSheet);
  document.body.appendChild(handle);
}

function openDemoSheet() {
  const theme = getTheme();
  const lang = getLang();
  const { el, close } = openSheet(`
    <p class="demo-note">${t('demo.note')}</p>
    <div class="demo-group">
      <div class="demo-label">${t('demo.theme')}</div>
      <div class="seg" id="demo-theme">
        <button type="button" data-v="blue" class="${theme === 'blue' ? 'on' : ''}">🌊 ${t('demo.theme.blue')}</button>
        <button type="button" data-v="red" class="${theme === 'red' ? 'on' : ''}">🌸 ${t('demo.theme.red')}</button>
      </div>
    </div>
    <div class="demo-group">
      <div class="demo-label">${t('demo.lang')}</div>
      <div class="seg" id="demo-lang">
        <button type="button" data-v="ja" class="${lang === 'ja' ? 'on' : ''}">日本語</button>
        <button type="button" data-v="zh" class="${lang === 'zh' ? 'on' : ''}">简体中文</button>
      </div>
    </div>
    <button type="button" class="btn btn-outline btn-block" id="demo-reset">${t('demo.reset')}</button>
  `, 'demo.title');

  qsa('#demo-theme button', el).forEach(b => b.addEventListener('click', () => {
    setTheme(b.dataset.v);
    qsa('#demo-theme button', el).forEach(x => x.classList.toggle('on', x === b));
  }));
  qsa('#demo-lang button', el).forEach(b => b.addEventListener('click', () => {
    setLang(b.dataset.v);
    close();
  }));
  qs('#demo-reset', el).addEventListener('click', () => {
    [LS.registered, LS.profile, LS.favs, LS.apps].forEach(k => localStorage.removeItem(k));
    close();
    showToast(t('demo.resetDone'), 'check');
    setTimeout(() => location.href = 'index.html', 700);
  });
}

/* ---------- 下部タブバー ---------- */
function renderTabbar(active) {
  const tabs = [
    { id: 'home', href: 'index.html', icon: 'home', key: 'nav.home' },
    { id: 'jobs', href: 'jobs.html', icon: 'search', key: 'nav.jobs' },
    { id: 'favs', href: 'favs.html', icon: 'heart', key: 'nav.favs' },
    { id: 'mypage', href: 'mypage.html', icon: 'user', key: 'nav.mypage' },
  ];
  const nav = document.createElement('nav');
  nav.className = 'tabbar';
  nav.innerHTML = tabs.map(tb => `
    <a href="${tb.href}" class="tab ${tb.id === active ? 'active' : ''}">
      ${icon(tb.icon)}<span data-i18n="${tb.key}">${t(tb.key)}</span>
    </a>`).join('');
  document.body.appendChild(nav);
}

/* ---------- 求人カード ---------- */
function jobCardHTML(job, opts) {
  const o = opts || {};
  const f = fieldOf(job.field);
  const faved = getFavs().includes(job.id);
  const tags = job.tags.slice(0, 3).map(tag => `<span class="tag">${t('tag.' + tag)}</span>`).join('');
  const lockedCls = o.locked ? ' is-locked' : '';
  const newBadge = job.isNew ? `<span class="badge-new">${t('jobs.new')}</span>` : '';
  return `
  <article class="job-card reveal${lockedCls}" data-id="${job.id}">
    <div class="job-card-inner">
      <div class="job-icon" style="--f-color:${f.color}"><span>${f.emoji}</span></div>
      <div class="job-main">
        <div class="job-head">
          <span class="job-field" style="--f-color:${f.color}">${pick(f.name)}</span>
          ${newBadge}
        </div>
        <h3 class="job-title">${pick(job.title)}</h3>
        <div class="job-meta">${icon('pin')}<span>${pick(job.area)}</span></div>
        <div class="job-tags">${tags}</div>
        <div class="job-bottom">${salaryHTML(job)}</div>
      </div>
      <button type="button" class="fav-btn ${faved ? 'on' : ''}" data-fav="${job.id}" aria-label="favorite">
        <span class="ic-off">${ICONS.heart}</span><span class="ic-on">${ICONS.heartFill}</span>
      </button>
    </div>
    ${o.locked ? `
      <div class="job-lock">
        ${icon('lock')}<span>${t('lock.cardNote')}</span>
      </div>` : ''}
  </article>`;
}

/* カード挿入後のイベント付与（お気に入り・遷移） */
function bindJobCards(container, opts) {
  const o = opts || {};
  qsa('.job-card', container).forEach(card => {
    const id = Number(card.dataset.id);
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn')) return;
      if (card.classList.contains('is-locked')) { openRegisterGate(); return; }
      location.href = `job.html?id=${id}`;
    });
    const favBtn = qs('.fav-btn', card);
    if (favBtn) favBtn.addEventListener('click', () => {
      if (!isRegistered()) { openRegisterGate(); return; }
      const on = toggleFav(id);
      favBtn.classList.toggle('on', on);
      favBtn.classList.remove('pop');
      void favBtn.offsetWidth; /* reflow でアニメ再発火 */
      favBtn.classList.add('pop');
      showToast(t(on ? 'job.favAdd' : 'job.favRemove'), on ? 'heartFill' : 'heart');
      if (typeof o.onFavChange === 'function') o.onFavChange();
    });
  });
}

/* WeChat相談モーダル

   ⚠️ 以前ここには qrSVG() というダミーQRの生成関数があり、乱数で並べた黒い四角を
   「QRコード」として表示していた。読み取っても何も起きず、中国の利用者にとっては
   悪質業者の目印になるため撤去した。**QRを自前で作り直さないこと。**
   友だち追加QRはWeChatがアカウントごとに発行するデータを持ち、IDからは計算できない。
   出せるのは公式アプリから書き出した画像だけ（詳細は app/src/lib/contact/wechat.ts）。

   QRと微信号はそれぞれ独立して有る／無いので、両方に対応する。
   検索できない微信号を見せるのはダミーQRと同じ行き止まりなので、無いときは出さない。 */
function openWechatDialog() {
  const descKey = WECHAT_QR_SRC ? (WECHAT_ID ? 'wechat.descQr' : 'wechat.descQrOnly') : 'wechat.desc';
  const { el } = openDialog(`
    <div class="wechat-dialog">
      <div class="wechat-head">${icon('chat')}<h3>${t('wechat.title')}</h3></div>
      <p>${t(descKey)}</p>
      ${WECHAT_QR_SRC ? `<div class="qr-wrap"><img class="qr" src="${WECHAT_QR_SRC}" alt="${t('wechat.title')}" width="158" height="158"></div>` : ''}
      ${WECHAT_ID ? `
      <div class="wechat-id"><span>${t('wechat.idLabel')}</span><b>${WECHAT_ID}</b></div>
      <p>${t('wechat.searchHint')}</p>
      <button type="button" class="btn btn-primary btn-block" id="copy-wechat">${t('common.copy')}</button>` : ''}
      <button type="button" class="btn btn-ghost btn-block" data-close>${t('common.close')}</button>
    </div>`);
  const copyBtn = qs('#copy-wechat', el);
  if (copyBtn) copyBtn.addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText(WECHAT_ID).catch(() => {});
    showToast(t('common.copied'), 'check');
  });
}

/* ---------- スクロールリビール ---------- */
function initReveal() {
  const els = qsa('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

/* ---------- 桜吹雪（登録完了などのお祝い演出） ---------- */
function celebrate() {
  const wrap = document.createElement('div');
  wrap.className = 'petals';
  const colors = getTheme() === 'blue'
    ? ['#7cc0ff', '#a5d8ff', '#4d9fff', '#cfe8ff', '#ffd166']
    : ['#ffb7c5', '#ff8fab', '#ff2442', '#ffd166', '#ffe3e8'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 1.2) + 's';
    p.style.animationDuration = (2.6 + Math.random() * 2) + 's';
    p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    p.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 5200);
}

/* ---------- ページ初期化 ---------- */
/* 生年月日の入力範囲（18歳以上）を、開いた日から求めて設定する。
   以前は登録画面のHTMLに max="2008-12-31" と直書きしていたため、年が変わるにつれ
   意味がズレ、2026年時点では17歳が選べる状態になっていた。
   ※ 本番アプリ側の実装は app/src/lib/auth/birth-policy.ts。規則を変えるときは両方直すこと。 */
function applyBirthRange() {
  const el = qs('#f-birth');
  if (!el) return;
  // 端末のタイムゾーンに左右されないよう、UTCに+9時間して「日本時間の今日」を使う。
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const p = n => String(n).padStart(2, '0');
  const md = `-${p(jst.getUTCMonth() + 1)}-${p(jst.getUTCDate())}`;
  el.max = `${jst.getUTCFullYear() - 18}${md}`;   // 満18歳の誕生日
  el.min = `${jst.getUTCFullYear() - 100}${md}`;  // 西暦の打ち間違い避け
}

function initPage(opts) {
  const o = opts || {};
  applyPrefs();
  applyI18n();
  renderDemoBar();
  applyBirthRange();
  if (o.tab) renderTabbar(o.tab);
  requestAnimationFrame(initReveal);
}
