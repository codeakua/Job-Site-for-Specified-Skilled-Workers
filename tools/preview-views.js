/* =========================================================
 * 樱聘 YingPin — 単一ファイル版（preview.html）用ルーター＆ビュー
 * 各HTMLページを #home / #jobs / #job/1 ... のハッシュ切替に移植。
 * build-preview.js が本体JS（i18n/data/app）と共に1ファイルへ束ねる。
 * ======================================================= */

/* ---------- 共通ヘルパー ---------- */
const shellEl = document.getElementById('shell');

function renderLangPill() {
  qsa('.lang-pill').forEach(el => {
    el.innerHTML = `${icon('globe')}<span>${getLang() === 'ja' ? '中文' : '日本語'}</span>`;
  });
}

const TOPBAR_BRAND = `
  <header class="topbar">
    <a class="brand" href="#home">
      <span class="brand-mark">🌸</span>
      <span><span class="brand-name">樱聘</span><span class="brand-sub">YINGPIN</span></span>
    </a>
    <div class="spacer"></div>
    <button type="button" class="lang-pill"></button>
    <a class="login-link" id="topbar-login" href="#login" data-i18n="common.login"></a>
  </header>`;

function topbarPage(titleKey, backHash) {
  return `
  <header class="topbar">
    <a class="icon-btn" href="${backHash}"><span class="icon">${ICONS.back}</span></a>
    <div class="topbar-title" ${titleKey ? `data-i18n="${titleKey}"` : 'id="topbar-title"'}></div>
    <div class="spacer"></div>
    <button type="button" class="lang-pill"></button>
  </header>`;
}

/* ---------- ホーム（ランディング） ---------- */
function viewHome() {
  shellEl.innerHTML = `
  ${TOPBAR_BRAND}
  <section class="hero">
    <span class="hero-sticker" style="right:18px; top:74px; animation-delay:.2s">🗼</span>
    <span class="hero-sticker" style="right:64px; top:150px; font-size:20px; animation-delay:1.1s">✈️</span>
    <span class="hero-sticker" style="right:26px; top:196px; font-size:22px; animation-delay:.6s">🌸</span>
    <div class="hero-badge">⛩️ <span data-i18n="landing.badge"></span></div>
    <h1 data-i18n="app.tagline"></h1>
    <p class="hero-sub" data-i18n="landing.heroSub"></p>
    <div class="hero-cta" id="hero-cta"></div>
  </section>
  <div class="stats reveal">
    <div class="stat"><b data-i18n="landing.stats.jobsVal"></b><span data-i18n="landing.stats.jobs"></span></div>
    <div class="stat"><b data-i18n="landing.stats.fieldsVal"></b><span data-i18n="landing.stats.fields"></span></div>
    <div class="stat"><b data-i18n="landing.stats.supportVal"></b><span data-i18n="landing.stats.support"></span></div>
  </div>
  <h2 class="sec-h" data-i18n="trust.title"></h2>
  <div class="trust-card reveal">
    <div class="trust-row" data-i18n="trust.i1"></div>
    <div class="trust-row" data-i18n="trust.i2"></div>
    <div class="trust-row" data-i18n="trust.i3"></div>
    <p class="trust-note" data-i18n="trust.note"></p>
  </div>
  <h2 class="sec-h" data-i18n="features.title"></h2>
  <div class="features">
    <div class="feature reveal"><div class="f-emoji">💬</div><h3 data-i18n="features.f1.title"></h3><p data-i18n="features.f1.desc"></p></div>
    <div class="feature reveal"><div class="f-emoji">🛂</div><h3 data-i18n="features.f2.title"></h3><p data-i18n="features.f2.desc"></p></div>
    <div class="feature reveal"><div class="f-emoji">🏠</div><h3 data-i18n="features.f3.title"></h3><p data-i18n="features.f3.desc"></p></div>
    <div class="feature reveal"><div class="f-emoji">🔒</div><h3 data-i18n="features.f4.title"></h3><p data-i18n="features.f4.desc"></p></div>
  </div>
  <h2 class="sec-h" data-i18n="support.title"></h2>
  <p class="support-desc" data-i18n="support.desc"></p>
  <div class="how">
    <div class="how-step reveal">
      <div class="how-num">🤝</div>
      <div class="how-body">
        <h3 data-i18n="support.s1.title"></h3>
        <div><span class="org-tag" data-i18n="support.s1.org"></span></div>
        <p data-i18n="support.s1.desc"></p>
      </div>
    </div>
    <div class="how-step reveal">
      <div class="how-num">🏠</div>
      <div class="how-body">
        <h3 data-i18n="support.s2.title"></h3>
        <div><span class="org-tag" data-i18n="support.s2.org"></span></div>
        <p data-i18n="support.s2.desc"></p>
      </div>
    </div>
  </div>
  <div class="support-stat reveal"><b data-i18n="support.statVal"></b><span data-i18n="support.stat"></span></div>
  <h2 class="sec-h" data-i18n="how.title"></h2>
  <div class="how">
    <div class="how-step reveal"><div class="how-num">1</div><div class="how-body"><h3 data-i18n="how.s1.title"></h3><p data-i18n="how.s1.desc"></p></div></div>
    <div class="how-step reveal"><div class="how-num">2</div><div class="how-body"><h3 data-i18n="how.s2.title"></h3><p data-i18n="how.s2.desc"></p></div></div>
    <div class="how-step reveal"><div class="how-num">3</div><div class="how-body"><h3 data-i18n="how.s3.title"></h3><p data-i18n="how.s3.desc"></p></div></div>
  </div>
  <h2 class="sec-h" data-i18n="preview.title"></h2>
  <div class="job-list" id="preview-list"></div>
  <div class="note-box" data-i18n="landing.note"></div>
  <div class="op-info">
    <div class="op-title" data-i18n="op.title"></div>
    <div class="op-name" data-i18n="op.name"></div>
    <div class="op-line" data-i18n="op.license"></div>
    <div class="op-line" data-i18n="op.support"></div>
  </div>
  <footer class="footer" data-i18n="footer.copy"></footer>`;

  function render() {
    applyI18n();
    renderLangPill();
    qs('#topbar-login').style.display = isRegistered() ? 'none' : '';

    const cta = qs('#hero-cta');
    if (isRegistered()) {
      cta.innerHTML = `<a class="btn btn-white btn-block" href="#jobs">${icon('search')}${t('reg.done.cta')}</a>`;
    } else {
      cta.innerHTML = `
        <a class="btn btn-white btn-block" href="#register">✨ ${t('common.register')}</a>
        <div class="hero-login">${t('landing.haveAccount')} <a href="#login">${t('common.login')}</a></div>`;
    }

    const locked = !isRegistered();
    const list = qs('#preview-list');
    const jobs = JOBS.filter(j => j.isNew).concat(JOBS).slice(0, 3);
    list.innerHTML =
      jobs.map(j => jobCardHTML(j, { locked })).join('') +
      (locked
        ? `<button type="button" class="btn btn-primary btn-block" id="preview-cta">${icon('lock')}${t('preview.more')}</button>`
        : `<a class="btn btn-outline btn-block" href="#jobs">${t('preview.more')}</a>`);
    bindJobCards(list);
    if (locked) qs('#preview-cta').addEventListener('click', () => { location.hash = '#register'; });

    qsa('.cta-bar, .tabbar').forEach(el => el.remove());
    shellEl.className = 'shell';
    if (locked) {
      const bar = document.createElement('div');
      bar.className = 'cta-bar';
      bar.innerHTML = `<a class="btn btn-primary btn-block" href="#register">✨ ${t('common.register')}</a>`;
      document.body.appendChild(bar);
      shellEl.classList.add('has-ctabar');
    } else {
      renderTabbar('home');
      shellEl.classList.add('has-tabbar');
    }
    initReveal();
  }
  window.onLangChange = render;
  render();
}

/* ---------- 新規登録 ---------- */
function viewRegister() {
  shellEl.innerHTML = `
  ${topbarPage('reg.title', '#home')}
  <div id="wizard">
    <div class="steps" id="steps">
      <div class="step" data-step="1"><div class="step-dot">1</div><span data-i18n="reg.step1"></span></div>
      <div class="step" data-step="2"><div class="step-dot">2</div><span data-i18n="reg.step2"></span></div>
      <div class="step" data-step="3"><div class="step-dot">3</div><span data-i18n="reg.step3"></span></div>
      <div class="step" data-step="4"><div class="step-dot">4</div><span data-i18n="reg.step4"></span></div>
    </div>
    <section class="step-panel" data-panel="1">
      <div class="step-head"><h2 data-i18n="reg.step1.title"></h2><p data-i18n="reg.step1.sub"></p></div>
      <div class="row2">
        <div class="field">
          <label class="label" for="f-last"><span data-i18n="reg.lastName"></span><span class="req" data-i18n="common.required"></span></label>
          <input class="input" id="f-last" type="text" data-i18n-ph="reg.lastName.ph">
        </div>
        <div class="field">
          <label class="label" for="f-first"><span data-i18n="reg.firstName"></span><span class="req" data-i18n="common.required"></span></label>
          <input class="input" id="f-first" type="text" data-i18n-ph="reg.firstName.ph">
        </div>
      </div>
      <div class="field">
        <label class="label" for="f-pinyin"><span data-i18n="reg.pinyin"></span><span class="req" data-i18n="common.required"></span></label>
        <input class="input" id="f-pinyin" type="text" style="text-transform:uppercase" data-i18n-ph="reg.pinyin.ph">
      </div>
      <div class="field">
        <label class="label" for="f-birth"><span data-i18n="reg.birth"></span><span class="req" data-i18n="common.required"></span></label>
        <input class="input" id="f-birth" type="date"><!-- min/max は applyBirthRange() が設定（18歳以上） -->
      </div>
      <div class="field">
        <div class="label"><span data-i18n="reg.gender"></span><span class="req" data-i18n="common.required"></span></div>
        <div class="opt-chips" id="f-gender">
          <label class="opt-chip"><input type="radio" name="gender" value="male"><span data-i18n="reg.gender.male"></span></label>
          <label class="opt-chip"><input type="radio" name="gender" value="female"><span data-i18n="reg.gender.female"></span></label>
          <label class="opt-chip"><input type="radio" name="gender" value="other"><span data-i18n="reg.gender.other"></span></label>
        </div>
      </div>
      <div class="field">
        <label class="label" for="f-nationality"><span data-i18n="reg.nationality"></span><span class="req" data-i18n="common.required"></span></label>
        <select class="input" id="f-nationality"><option value="cn" selected></option><option value="other"></option></select>
      </div>
      <div class="field">
        <div class="label"><span data-i18n="reg.residence"></span><span class="req" data-i18n="common.required"></span></div>
        <div class="opt-chips" id="f-residence">
          <label class="opt-chip"><input type="radio" name="residence" value="jp" checked><span>🇯🇵 <span data-i18n="reg.residence.jp"></span></span></label>
          <label class="opt-chip"><input type="radio" name="residence" value="cn"><span>🇨🇳 <span data-i18n="reg.residence.cn"></span></span></label>
        </div>
      </div>
      <div class="field">
        <label class="label" for="f-address"><span data-i18n="reg.address"></span><span class="req" data-i18n="common.required"></span></label>
        <input class="input" id="f-address" type="text">
      </div>
      <div class="step-nav">
        <button type="button" class="btn btn-primary btn-block" data-next><span data-i18n="common.next"></span></button>
      </div>
    </section>
    <section class="step-panel" data-panel="2" hidden>
      <div class="step-head"><h2 data-i18n="reg.step2.title"></h2><p data-i18n="reg.step2.sub"></p></div>
      <div class="field">
        <label class="label" for="f-phone"><span data-i18n="reg.phone"></span><span class="req" data-i18n="common.required"></span></label>
        <div class="input-row">
          <select class="input code" id="f-phone-code"><option value="+81">🇯🇵 +81</option><option value="+86">🇨🇳 +86</option></select>
          <input class="input" id="f-phone" type="tel" data-i18n-ph="reg.phone.ph">
        </div>
      </div>
      <div class="field">
        <label class="label" for="f-wechat"><span data-i18n="reg.wechat"></span><span class="req" data-i18n="common.required"></span></label>
        <input class="input" id="f-wechat" type="text" data-i18n-ph="reg.wechat.ph">
        <p class="hint">💬 <span data-i18n="reg.wechat.note"></span></p>
      </div>
      <div class="field">
        <label class="label" for="f-email"><span data-i18n="reg.email"></span><span class="opt" data-i18n="common.optional"></span></label>
        <input class="input" id="f-email" type="email" data-i18n-ph="reg.email.ph">
      </div>
      <div class="step-nav">
        <button type="button" class="btn btn-back" data-back data-i18n="common.back"></button>
        <button type="button" class="btn btn-primary" data-next><span data-i18n="common.next"></span></button>
      </div>
    </section>
    <section class="step-panel" data-panel="3" hidden>
      <div class="step-head"><h2 data-i18n="reg.step3.title"></h2><p data-i18n="reg.step3.sub"></p></div>
      <div class="field">
        <div class="label"><span data-i18n="reg.jlpt"></span><span class="req" data-i18n="common.required"></span></div>
        <div class="opt-chips" id="f-jlpt">
          <label class="opt-chip"><input type="radio" name="jlpt" value="N1"><span>N1</span></label>
          <label class="opt-chip"><input type="radio" name="jlpt" value="N2"><span>N2</span></label>
          <label class="opt-chip"><input type="radio" name="jlpt" value="N3"><span>N3</span></label>
          <label class="opt-chip"><input type="radio" name="jlpt" value="N4"><span>N4</span></label>
          <label class="opt-chip"><input type="radio" name="jlpt" value="N5"><span>N5</span></label>
          <label class="opt-chip"><input type="radio" name="jlpt" value="none" checked><span data-i18n="reg.jlpt.none"></span></label>
        </div>
      </div>
      <div class="field">
        <div class="label"><span data-i18n="reg.ssw"></span></div>
        <p class="hint" style="margin:0 0 10px" data-i18n="reg.ssw.note"></p>
        <div class="opt-chips" id="f-ssw"></div>
      </div>
      <div class="field">
        <label class="label" for="f-other"><span data-i18n="reg.otherQual"></span><span class="opt" data-i18n="common.optional"></span></label>
        <textarea class="input" id="f-other" rows="3" data-i18n-ph="reg.otherQual.ph"></textarea>
      </div>
      <div class="step-nav">
        <button type="button" class="btn btn-back" data-back data-i18n="common.back"></button>
        <button type="button" class="btn btn-primary" data-next><span data-i18n="common.next"></span></button>
      </div>
    </section>
    <section class="step-panel" data-panel="4" hidden>
      <div class="step-head"><h2 data-i18n="reg.step4.title"></h2><p data-i18n="reg.step4.sub"></p></div>
      <dl class="confirm-list" id="confirm-list"></dl>
      <label class="agree-row">
        <input type="checkbox" id="f-agree">
        <span class="agree-box"><span class="icon">${ICONS.check}</span></span>
        <span class="agree-text" data-i18n="reg.agree"></span>
      </label>
      <div class="step-nav">
        <button type="button" class="btn btn-back" data-back data-i18n="common.back"></button>
        <button type="button" class="btn btn-primary" id="submit-btn" data-i18n="reg.submit"></button>
      </div>
    </section>
  </div>
  <section class="done-wrap" id="done" hidden>
    <div class="done-ring"><div class="done-check"><span class="icon">${ICONS.check}</span></div></div>
    <h1 data-i18n="reg.done.title"></h1>
    <p class="done-sub" data-i18n="reg.done.sub"></p>
    <div class="member-card"><span data-i18n="reg.done.accountId"></span><b id="member-id"></b></div>
    <a class="btn btn-primary btn-block" href="#jobs" data-i18n="reg.done.cta"></a>
  </section>`;

  let step = 1;
  const TOTAL = 4;

  function renderSswChips() {
    const box = qs('#f-ssw');
    const checked = new Set(qsa('input:checked', box).map(i => i.value));
    if (!box.dataset.init) checked.add('none');
    box.innerHTML =
      FIELDS.map(f => `
        <label class="opt-chip"><input type="checkbox" name="ssw" value="${f.id}" ${checked.has(f.id) ? 'checked' : ''}>
          <span>${f.emoji} ${pick(f.name)}</span></label>`).join('') +
      `<label class="opt-chip"><input type="checkbox" name="ssw" value="none" ${checked.has('none') ? 'checked' : ''}>
        <span>${t('reg.ssw.none')}</span></label>`;
    box.dataset.init = '1';
    qsa('input', box).forEach(input => input.addEventListener('change', () => {
      if (input.value === 'none' && input.checked) {
        qsa('input', box).forEach(i => { if (i.value !== 'none') i.checked = false; });
      } else if (input.value !== 'none' && input.checked) {
        const none = qsa('input', box).find(i => i.value === 'none');
        if (none) none.checked = false;
      }
    }));
  }

  function renderNationality() {
    const sel = qs('#f-nationality');
    sel.options[0].textContent = t('reg.nationality.cn');
    sel.options[1].textContent = t('reg.nationality.other');
  }

  function syncAddressPh() {
    const residence = qsa('#f-residence input').find(i => i.checked)?.value || 'jp';
    qs('#f-address').placeholder = t(residence === 'jp' ? 'reg.address.phJp' : 'reg.address.phCn');
  }

  function showStep(n) {
    step = n;
    qsa('.step-panel').forEach(p => p.hidden = Number(p.dataset.panel) !== n);
    qsa('#steps .step').forEach(s => {
      const sn = Number(s.dataset.step);
      s.classList.toggle('done', sn < n);
      s.classList.toggle('current', sn === n);
      qs('.step-dot', s).innerHTML = sn < n ? `<span class="icon">${ICONS.check}</span>` : sn;
    });
    qs('#steps').style.setProperty('--p', (n - 1) / (TOTAL - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (n === 4) renderConfirm();
  }

  function collect() {
    const val = id => qs('#' + id).value.trim();
    const radio = boxId => qsa(`#${boxId} input`).find(i => i.checked)?.value || '';
    return {
      lastName: val('f-last'), firstName: val('f-first'),
      pinyin: val('f-pinyin').toUpperCase(), birth: val('f-birth'),
      gender: radio('f-gender'), nationality: qs('#f-nationality').value,
      residence: radio('f-residence'), address: val('f-address'),
      phoneCode: qs('#f-phone-code').value, phone: val('f-phone'),
      wechat: val('f-wechat'), email: val('f-email'),
      jlpt: radio('f-jlpt'),
      ssw: qsa('#f-ssw input:checked').map(i => i.value).filter(v => v !== 'none'),
      otherQual: val('f-other'),
    };
  }

  function validate(n) {
    const d = collect();
    if (n === 1) return d.lastName && d.firstName && d.pinyin && d.birth && d.gender && d.address;
    if (n === 2) return d.phone && d.wechat;
    return true;
  }

  function renderConfirm() {
    const d = collect();
    const dash = '—';
    const sswText = d.ssw.length ? d.ssw.map(id => pick(fieldOf(id).name)).join('、') : t('reg.ssw.none');
    const rows = [
      [t('reg.lastName').replace(/（.+）/, '') + '・' + t('reg.firstName').replace(/（.+）/, ''), `${esc(d.lastName)} ${esc(d.firstName)}<br><small style="color:var(--text-sub)">${esc(d.pinyin)}</small>`],
      [t('reg.birth'), esc(d.birth) || dash],
      [t('reg.gender'), d.gender ? t('reg.gender.' + d.gender) : dash],
      [t('reg.nationality'), t(d.nationality === 'cn' ? 'reg.nationality.cn' : 'reg.nationality.other')],
      [t('reg.residence'), `${t(d.residence === 'jp' ? 'reg.residence.jp' : 'reg.residence.cn')}<br><small style="color:var(--text-sub)">${esc(d.address)}</small>`],
      [t('reg.phone'), `${esc(d.phoneCode)} ${esc(d.phone)}`],
      [t('reg.wechat'), esc(d.wechat) || dash],
      [t('reg.email'), esc(d.email) || dash],
      [t('reg.jlpt'), d.jlpt === 'none' ? t('reg.jlpt.none') : esc(d.jlpt)],
      [t('reg.ssw'), sswText],
      [t('reg.otherQual'), esc(d.otherQual) || dash],
    ];
    qs('#confirm-list').innerHTML = rows.map(([k, v]) =>
      `<div class="confirm-row"><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  }

  qsa('[data-next]').forEach(b => b.addEventListener('click', () => {
    if (!validate(step)) { showToast(t('reg.err.required')); return; }
    showStep(step + 1);
  }));
  qsa('[data-back]').forEach(b => b.addEventListener('click', () => showStep(step - 1)));

  qs('#submit-btn').addEventListener('click', () => {
    if (!qs('#f-agree').checked) { showToast(t('reg.err.agree')); return; }
    const profile = collect();
    profile.memberId = genMemberId();
    setProfile(profile);
    setRegistered(true);
    qs('#wizard').hidden = true;
    qs('#member-id').textContent = profile.memberId;
    qs('#done').hidden = false;
    window.scrollTo(0, 0);
    celebrate();
  });

  qs('#f-residence').addEventListener('change', syncAddressPh);

  window.onLangChange = () => {
    renderLangPill();
    renderSswChips();
    renderNationality();
    syncAddressPh();
    if (step === 4) renderConfirm();
  };

  applyI18n();
  renderLangPill();
  renderSswChips();
  renderNationality();
  syncAddressPh();
  showStep(1);
}

/* ---------- ログイン ---------- */
function viewLogin() {
  shellEl.innerHTML = `
  ${topbarPage('', '#home')}
  <div class="auth-wrap">
    <div class="auth-logo">
      <span class="brand-mark">🌸</span>
      <div><h1 data-i18n="login.title"></h1><p data-i18n="login.sub"></p></div>
    </div>
    <div class="field">
      <label class="label" for="l-phone"><span data-i18n="login.phone"></span></label>
      <div class="input-row">
        <select class="input code" id="l-code"><option value="+81">🇯🇵 +81</option><option value="+86">🇨🇳 +86</option></select>
        <input class="input" id="l-phone" type="tel" data-i18n-ph="reg.phone.ph">
      </div>
    </div>
    <div class="field">
      <label class="label" for="l-pass"><span data-i18n="login.password"></span></label>
      <input class="input" id="l-pass" type="password" data-i18n-ph="login.password.ph">
    </div>
    <button type="button" class="btn btn-primary btn-block" id="login-btn" data-i18n="login.btn"></button>
    <div class="auth-links">
      <a href="#" id="forgot" class="sub" data-i18n="login.forgot"></a>
      <a href="#register" data-i18n="login.toRegister"></a>
    </div>
    <p class="demo-hint" data-i18n="login.demoNote"></p>
  </div>`;

  qs('#login-btn').addEventListener('click', () => {
    setRegistered(true);
    if (!getProfile()) setProfile(demoProfile());
    showToast(t('login.success'), 'check');
    setTimeout(() => { location.hash = '#jobs'; }, 650);
  });
  qs('#forgot').addEventListener('click', e => { e.preventDefault(); showToast(t('login.demoNote')); });

  window.onLangChange = () => { renderLangPill(); };
  applyI18n();
  renderLangPill();
}

/* ---------- 求人一覧 ---------- */
const jobsState = { field: 'all', region: 'all', tags: [], q: '' };

function viewJobs() {
  shellEl.className = 'shell has-tabbar';
  shellEl.innerHTML = `
  <div class="jobs-head">
    <div class="jobs-title-row">
      <h1 data-i18n="jobs.title"></h1>
      <button type="button" class="lang-pill"></button>
    </div>
    <div class="search-box"><span class="icon">${ICONS.search}</span><input type="search" id="q" data-i18n-ph="jobs.search.ph"></div>
    <div class="filter-row" id="field-chips"></div>
    <div class="filter-row" id="sub-filters"></div>
  </div>
  <div class="count-row"><span class="count" id="count"></span><span class="count" data-i18n="jobs.sort.new"></span></div>
  <div class="locked-note" id="locked-note" hidden></div>
  <div class="job-list" id="list"></div>
  <div class="empty" id="empty" hidden>
    <div class="e-emoji">🔍</div>
    <h3 data-i18n="jobs.empty.title"></h3>
    <p data-i18n="jobs.empty.sub"></p>
  </div>`;

  const state = jobsState;

  function renderFilters() {
    const fc = qs('#field-chips');
    fc.innerHTML =
      `<button type="button" class="chip ${state.field === 'all' ? 'on' : ''}" data-field="all">${t('common.all')}</button>` +
      FIELDS.map(f => `
        <button type="button" class="chip ${state.field === f.id ? 'on' : ''}" data-field="${f.id}">
          <span class="emoji">${f.emoji}</span>${pick(f.name)}
        </button>`).join('');
    qsa('button', fc).forEach(b => b.addEventListener('click', () => {
      state.field = b.dataset.field;
      renderFilters(); renderList();
    }));

    const sf = qs('#sub-filters');
    const regionLabel = state.region === 'all' ? t('jobs.area') : t('region.' + state.region);
    sf.innerHTML =
      `<button type="button" class="chip ${state.region !== 'all' ? 'on' : ''}" id="area-chip">${icon('pin')}${regionLabel}</button>` +
      QUICK_TAGS.map(tag => `
        <button type="button" class="chip ${state.tags.includes(tag) ? 'on' : ''}" data-tag="${tag}">${t('tag.' + tag)}</button>`).join('');
    qs('#area-chip').addEventListener('click', openAreaSheet);
    qsa('[data-tag]', sf).forEach(b => b.addEventListener('click', () => {
      const tag = b.dataset.tag;
      const i = state.tags.indexOf(tag);
      if (i >= 0) state.tags.splice(i, 1); else state.tags.push(tag);
      renderFilters(); renderList();
    }));
  }

  function openAreaSheet() {
    const opts = ['all', ...REGIONS];
    const { el, close } = openSheet(
      opts.map(r => `
        <button type="button" class="list-opt ${state.region === r ? 'on' : ''}" data-region="${r}">
          ${r === 'all' ? '🗾' : '📍'} ${t('region.' + r)}
          <span class="icon">${ICONS.check}</span>
        </button>`).join(''),
      'area.sheetTitle');
    qsa('[data-region]', el).forEach(b => b.addEventListener('click', () => {
      state.region = b.dataset.region;
      close(); renderFilters(); renderList();
    }));
  }

  function filteredJobs() {
    const q = state.q.trim().toLowerCase();
    return JOBS
      .filter(j => state.field === 'all' || j.field === state.field)
      .filter(j => state.region === 'all' || j.region === state.region)
      .filter(j => state.tags.every(tag => j.tags.includes(tag)))
      .filter(j => {
        if (!q) return true;
        const hay = [pick(j.title), pick(j.area), pick(j.desc), pick(fieldOf(j.field).name)].join(' ').toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (b.isNew - a.isNew) || (a.id - b.id));
  }

  function renderList() {
    const jobs = filteredJobs();
    const locked = !isRegistered();
    qs('#count').innerHTML = t('jobs.count', { n: `<b>${jobs.length}</b>` });
    const note = qs('#locked-note');
    note.hidden = !locked;
    if (locked) note.innerHTML = `${icon('lock')}<span>${t('jobs.lockedNote')}</span>`;
    const list = qs('#list');
    list.innerHTML = jobs.map(j => jobCardHTML(j, { locked })).join('');
    bindJobCards(list);
    qs('#empty').hidden = jobs.length > 0;
    initReveal();
  }

  qs('#q').value = state.q;
  qs('#q').addEventListener('input', e => { state.q = e.target.value; renderList(); });

  window.onLangChange = () => { applyI18n(); renderLangPill(); renderFilters(); renderList(); };
  applyI18n();
  renderLangPill();
  renderFilters();
  renderList();
  renderTabbar('jobs');
}

/* ---------- 求人詳細 ---------- */
function viewJob(param) {
  const job = jobOf(param);
  shellEl.innerHTML = `${topbarPage('', '#jobs')}<main id="main"></main>`;

  function infoRow(label, value) {
    return `<div class="info-row"><dt>${label}</dt><dd>${value}</dd></div>`;
  }

  function render() {
    renderLangPill();
    const main = qs('#main');
    qsa('.job-actions').forEach(el => el.remove());

    if (!job) {
      qs('#topbar-title').textContent = '';
      main.innerHTML = `
        <div class="empty">
          <div class="e-emoji">😢</div>
          <h3>${t('job.notFound')}</h3>
          <a class="btn btn-primary" href="#jobs">${t('favs.browse')}</a>
        </div>`;
      return;
    }

    if (!isRegistered()) {
      qs('#topbar-title').textContent = t('lock.badge');
      main.innerHTML = `
        <div class="empty">
          <div class="e-emoji">🔒</div>
          <h3>${t('lock.title')}</h3>
          <p>${t('lock.desc')}</p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:22px">
            <a class="btn btn-primary btn-block" href="#register">${t('lock.register')}</a>
            <a class="btn btn-ghost btn-block" href="#login">${t('lock.login')}</a>
          </div>
        </div>`;
      return;
    }

    const f = fieldOf(job.field);
    qs('#topbar-title').textContent = pick(f.name);
    shellEl.classList.add('has-ctabar');

    const benefits = job.benefits.map(b => `<div class="ben-item">${icon('check')}<span>${t('ben.' + b)}</span></div>`).join('');
    const duties = pick(job.duties).map(d => `<li>${icon('check')}<span>${esc(d)}</span></li>`).join('');

    const related = JOBS.filter(j => j.field === job.field && j.id !== job.id).slice(0, 4);
    const relatedHTML = related.length ? `
      <h2 class="sec-h">${t('related.title')}</h2>
      <div class="related-scroll">
        ${related.map(j => `
          <div class="related-card" data-id="${j.id}" style="--f-color:${fieldOf(j.field).color}">
            <div class="rc-head">
              <span class="rc-emoji">${fieldOf(j.field).emoji}</span>
              <span class="rc-field">${pick(fieldOf(j.field).name)}</span>
            </div>
            <h3>${pick(j.title)}</h3>
            <div class="rc-bottom">
              <span class="rc-area">${pick(j.area)}</span>
              <span class="salary"><b>${j.salaryMin}〜${j.salaryMax}</b><span class="salary-unit">${getLang() === 'zh' ? '万日元' : '万円'}</span></span>
            </div>
          </div>`).join('')}
      </div>` : '';

    main.innerHTML = `
      <div class="job-hero" style="--f-color:${f.color}">
        <div class="job-hero-icon">${f.emoji}</div>
        <div class="badges">
          <span class="badge-soft">${pick(f.name)}</span>
          ${job.isNew ? `<span class="badge-new">${t('jobs.new')}</span>` : ''}
          ${job.tags.map(tag => `<span class="tag">${t('tag.' + tag)}</span>`).join('')}
        </div>
        <h1>${pick(job.title)}</h1>
        <div class="job-meta">${icon('pin')}<span>${pick(job.area)}（${t('region.' + job.region)}）</span></div>
      </div>
      <div class="salary-band reveal">
        <div class="big">
          <span>${t('job.monthly')}</span>
          <b>${job.salaryMin}〜${job.salaryMax}</b><small>${getLang() === 'zh' ? '万日元' : '万円'}</small>
        </div>
        <div class="annual"><span>${t('job.annual')}</span><b>${annualText(job)}</b></div>
      </div>
      ${job.chineseSupport ? `
        <div class="cn-support reveal">
          ${icon('chat')}
          <div>${t('tag.chinese')}${job.chineseStaff ? `<small>${pick(job.chineseStaff)}</small>` : ''}</div>
        </div>` : ''}
      <div class="card-sec reveal"><h2>${t('sec.desc')}</h2><p class="desc">${pick(job.desc)}</p></div>
      <div class="card-sec reveal"><h2>${t('sec.duties')}</h2><ul class="duty-list">${duties}</ul></div>
      <div class="card-sec reveal">
        <h2>${t('sec.salary')}</h2>
        <dl>
          ${infoRow(t('job.monthly'), `<b style="color:var(--primary)">${salaryText(job).replace(t('job.monthly') + ' ', '')}</b>`)}
          ${infoRow(t('job.annual'), annualText(job))}
          ${infoRow(t('job.bonusRaise'), pick(job.bonus))}
        </dl>
      </div>
      <div class="card-sec reveal">
        <h2>${t('sec.time')}</h2>
        <dl>${infoRow(t('sec.time'), pick(job.hours))}${infoRow(t('job.overtime'), pick(job.overtime))}</dl>
      </div>
      <div class="card-sec reveal"><h2>${t('sec.holiday')}</h2><dl>${infoRow(t('job.holidays'), pick(job.holidays))}</dl></div>
      <div class="card-sec reveal">
        <h2>${t('sec.location')}</h2>
        <dl>${infoRow(t('sec.location'), pick(job.area))}${infoRow(t('job.housing'), pick(job.housing))}</dl>
      </div>
      <div class="card-sec reveal"><h2>${t('sec.benefits')}</h2><div class="ben-grid">${benefits}</div></div>
      <div class="card-sec reveal"><h2>${t('sec.requirements')}</h2><p class="desc">${pick(job.requirements)}</p></div>
      <div class="card-sec reveal">
        <h2>${t('sec.company')}</h2>
        <p class="desc">${pick(job.company)}</p>
        ${job.chineseStaff ? `<p class="desc" style="margin-top:6px">🇨🇳 ${pick(job.chineseStaff)}</p>` : ''}
        <p class="company-note">${t('job.companyNote')}</p>
      </div>
      ${relatedHTML}`;

    qsa('.related-card', main).forEach(c =>
      c.addEventListener('click', () => { location.hash = '#job/' + c.dataset.id; }));

    renderActions();
    initReveal();
  }

  function renderActions() {
    qsa('.job-actions').forEach(el => el.remove());
    const bar = document.createElement('div');
    bar.className = 'job-actions';
    const faved = getFavs().includes(job.id);
    const applied = hasApplied(job.id);
    bar.innerHTML = `
      <button type="button" class="fav-btn fav-square ${faved ? 'on' : ''}" id="act-fav">
        <span class="ic-off">${ICONS.heart}</span><span class="ic-on">${ICONS.heartFill}</span>
      </button>
      <button type="button" class="btn-wechat" id="act-wechat">${icon('chat')}${t('job.wechatBtn')}</button>
      <button type="button" class="btn btn-primary btn-apply" id="act-apply" ${applied ? 'disabled' : ''}>
        ${applied ? '✓ ' + t('job.applied') : t('job.apply')}
      </button>`;
    document.body.appendChild(bar);

    qs('#act-fav').addEventListener('click', () => {
      const on = toggleFav(job.id);
      const btn = qs('#act-fav');
      btn.classList.toggle('on', on);
      btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
      showToast(t(on ? 'job.favAdd' : 'job.favRemove'), on ? 'heartFill' : 'heart');
    });
    qs('#act-wechat').addEventListener('click', openWechatDialog);
    qs('#act-apply').addEventListener('click', openApplyDialog);
  }

  function openApplyDialog() {
    const { el, close } = openDialog(`
      <div class="gate">
        <div class="gate-icon">${icon('briefcase')}</div>
        <h3>${t('apply.title')}</h3>
        <p>${t('apply.desc')}</p>
        <button type="button" class="btn btn-primary btn-block" id="apply-confirm">${t('apply.confirm')}</button>
        <button type="button" class="btn btn-ghost btn-block" data-close>${t('common.cancel')}</button>
      </div>`);
    qs('#apply-confirm', el).addEventListener('click', () => {
      addApp(job.id);
      close();
      celebrate();
      openDialog(`
        <div class="gate">
          <div class="gate-icon" style="background:#E8FBF0; color:#07A050">${icon('check')}</div>
          <h3>${t('apply.done.title')}</h3>
          <p>${t('apply.done.desc')}</p>
          <button type="button" class="btn btn-primary btn-block" data-close>${t('common.ok')}</button>
        </div>`);
      renderActions();
    });
  }

  window.onLangChange = render;
  render();
}

/* ---------- お気に入り ---------- */
function viewFavs() {
  shellEl.className = 'shell has-tabbar';
  shellEl.innerHTML = `
  <div class="page-head jobs-title-row" style="display:flex; align-items:center; gap:10px">
    <h1 data-i18n="favs.title" style="flex:1"></h1>
    <button type="button" class="lang-pill"></button>
  </div>
  <div id="content"></div>`;

  function render() {
    applyI18n();
    renderLangPill();
    const box = qs('#content');
    if (!isRegistered()) {
      box.innerHTML = `
        <div class="empty">
          <div class="e-emoji">🔒</div>
          <h3>${t('lock.title')}</h3>
          <p>${t('lock.desc')}</p>
          <a class="btn btn-primary" href="#register">${t('lock.register')}</a>
        </div>`;
      return;
    }
    const favJobs = getFavs().map(jobOf).filter(Boolean);
    if (!favJobs.length) {
      box.innerHTML = `
        <div class="empty">
          <div class="e-emoji">🤍</div>
          <h3>${t('favs.empty.title')}</h3>
          <p>${t('favs.empty.sub')}</p>
          <a class="btn btn-primary" href="#jobs">${t('favs.browse')}</a>
        </div>`;
      return;
    }
    box.innerHTML = `<div class="job-list">${favJobs.map(j => jobCardHTML(j)).join('')}</div>`;
    bindJobCards(box, { onFavChange: render });
    initReveal();
  }

  window.onLangChange = render;
  render();
  renderTabbar('favs');
}

/* ---------- マイページ ---------- */
function viewMypage() {
  shellEl.className = 'shell has-tabbar';
  shellEl.innerHTML = `
  <div class="page-head jobs-title-row" style="display:flex; align-items:center; gap:10px">
    <h1 data-i18n="my.title" style="flex:1"></h1>
    <button type="button" class="lang-pill"></button>
  </div>
  <div id="content"></div>`;

  function settingsHTML() {
    const langName = getLang() === 'ja' ? '日本語' : '简体中文';
    const themeName = t(getTheme() === 'red' ? 'demo.theme.red' : 'demo.theme.blue');
    return `
      <h2 class="sec-h">${t('my.settings')}</h2>
      <div class="menu-card reveal">
        <button type="button" class="menu-item" id="set-lang">
          <span class="m-icon">${icon('globe')}</span>${t('my.lang')}
          <span class="m-value">${langName}</span><span class="icon chev">${ICONS.chevron}</span>
        </button>
        <button type="button" class="menu-item" id="set-theme">
          <span class="m-icon">${icon('sparkle')}</span>${t('my.theme')}
          <span class="m-value">${themeName}</span><span class="icon chev">${ICONS.chevron}</span>
        </button>
        ${isRegistered() ? `
        <button type="button" class="menu-item danger" id="set-logout">
          <span class="m-icon">${icon('close')}</span>${t('my.logout')}
          <span class="icon chev">${ICONS.chevron}</span>
        </button>` : ''}
      </div>`;
  }

  function bindSettings() {
    qs('#set-lang')?.addEventListener('click', () => {
      const { el, close } = openSheet(
        [['ja', '日本語'], ['zh', '简体中文']].map(([v, label]) => `
          <button type="button" class="list-opt ${getLang() === v ? 'on' : ''}" data-v="${v}">
            🌐 ${label}<span class="icon">${ICONS.check}</span>
          </button>`).join(''),
        'my.lang');
      qsa('[data-v]', el).forEach(b => b.addEventListener('click', () => { close(); setLang(b.dataset.v); }));
    });

    qs('#set-theme')?.addEventListener('click', () => {
      const { el, close } = openSheet(
        [['blue', '🌊 ' + t('demo.theme.blue')], ['red', '🌸 ' + t('demo.theme.red')]].map(([v, label]) => `
          <button type="button" class="list-opt ${getTheme() === v ? 'on' : ''}" data-v="${v}">
            ${label}<span class="icon">${ICONS.check}</span>
          </button>`).join(''),
        'my.theme');
      qsa('[data-v]', el).forEach(b => b.addEventListener('click', () => { close(); setTheme(b.dataset.v); render(); }));
    });

    qs('#set-logout')?.addEventListener('click', () => {
      const { el, close } = openDialog(`
        <div class="gate">
          <div class="gate-icon">${icon('user')}</div>
          <p style="margin-top:4px">${t('my.logoutConfirm')}</p>
          <button type="button" class="btn btn-primary btn-block" id="logout-yes">${t('my.logout')}</button>
          <button type="button" class="btn btn-ghost btn-block" data-close>${t('common.cancel')}</button>
        </div>`);
      qs('#logout-yes', el).addEventListener('click', () => {
        setRegistered(false);
        close();
        showToast(t('my.logoutDone'), 'check');
        setTimeout(() => { location.hash = '#home'; }, 650);
      });
    });
  }

  function render() {
    applyI18n();
    renderLangPill();
    const box = qs('#content');

    if (!isRegistered()) {
      box.innerHTML = `
        <div class="profile-card reveal">
          <div class="profile-row">
            <div class="avatar">👤</div>
            <div>
              <div class="profile-name">${t('my.guest')}</div>
              <div class="profile-id">${t('my.notRegistered')}</div>
            </div>
          </div>
          <p style="position:relative; z-index:1; font-size:12px; margin-top:14px; opacity:.94; line-height:1.7">${t('my.guest.desc')}</p>
          <div style="position:relative; z-index:1; display:flex; gap:9px; margin-top:14px">
            <a class="btn btn-white btn-sm" style="flex:1" href="#register">✨ ${t('common.register')}</a>
            <a class="btn btn-sm" style="flex:1; border:1.6px solid rgba(255,255,255,.65); color:#fff" href="#login">${t('common.login')}</a>
          </div>
        </div>
        ${settingsHTML()}`;
      bindSettings();
      initReveal();
      return;
    }

    const p = getProfile() || demoProfile();
    const name = `${p.lastName || ''} ${p.firstName || ''}`.trim() || p.pinyin || 'User';
    const initial = (p.lastName || p.pinyin || 'U').charAt(0);

    const badges = [];
    badges.push(p.jlpt && p.jlpt !== 'none' ? `${t('my.jlptPrefix')} ${p.jlpt}` : t('my.jlptNone'));
    if (p.ssw && p.ssw.length) p.ssw.forEach(id => {
      const f = fieldOf(id);
      if (f) badges.push(`${t('my.sswPrefix')}：${pick(f.name)}`);
    });
    else badges.push(t('my.sswNone'));

    const apps = getApps();
    const appsHTML = apps.length
      ? apps.map(a => {
          const j = jobOf(a.id);
          if (!j) return '';
          const f = fieldOf(j.field);
          return `
            <div class="app-row" data-id="${j.id}" style="--f-color:${f.color}; cursor:pointer">
              <span class="a-emoji">${f.emoji}</span>
              <div class="a-main">
                <div class="a-title">${pick(j.title)}</div>
                <div class="a-date">${a.date}</div>
              </div>
              <span class="status-chip">${t('my.appStatus')}</span>
            </div>`;
        }).join('')
      : `<div class="app-row"><div class="a-main" style="text-align:center; color:var(--text-sub); font-size:12.5px">${t('my.appEmpty')}</div></div>`;

    const dash = '—';
    const profileRows = [
      [t('reg.pinyin'), esc(p.pinyin) || dash],
      [t('reg.birth'), esc(p.birth) || dash],
      [t('reg.gender'), p.gender ? t('reg.gender.' + p.gender) : dash],
      [t('reg.residence'), `${t(p.residence === 'jp' ? 'reg.residence.jp' : 'reg.residence.cn')}<br><small style="color:var(--text-sub)">${esc(p.address)}</small>`],
      [t('reg.phone'), `${esc(p.phoneCode || '')} ${esc(p.phone) || dash}`],
      [t('reg.wechat'), esc(p.wechat) || dash],
      [t('reg.otherQual'), esc(p.otherQual) || dash],
    ];

    box.innerHTML = `
      <div class="profile-card reveal">
        <div class="profile-row">
          <div class="avatar">${esc(initial)}</div>
          <div>
            <div class="profile-name">${esc(name)}</div>
            <div class="profile-id">${t('my.memberId')}：${esc(p.memberId || '')}</div>
          </div>
        </div>
        <div class="qual-badges">${badges.map(b => `<span class="qual-badge">${b}</span>`).join('')}</div>
      </div>
      <h2 class="sec-h">${t('my.applications')}</h2>
      <div class="menu-card reveal">${appsHTML}</div>
      <h2 class="sec-h">${t('my.profile')}</h2>
      <dl class="confirm-list reveal" style="margin:0 16px 14px">${profileRows.map(([k, v]) =>
        `<div class="confirm-row"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
      ${settingsHTML()}
      <div class="op-info">
        <div class="op-title">${t('op.title')}</div>
        <div class="op-name">${t('op.name')}</div>
        <div class="op-line">${t('op.license')}</div>
        <div class="op-line">${t('op.support')}</div>
      </div>
      <div class="footer">${t('footer.copy')}</div>`;

    qsa('.app-row[data-id]', box).forEach(r =>
      r.addEventListener('click', () => { location.hash = '#job/' + r.dataset.id; }));
    bindSettings();
    initReveal();
  }

  window.onLangChange = render;
  render();
  renderTabbar('mypage');
}

/* ---------- ルーター ---------- */
const VIEWS = {
  home: viewHome, register: viewRegister, login: viewLogin,
  jobs: viewJobs, job: viewJob, favs: viewFavs, mypage: viewMypage,
};

function clearChrome() {
  qsa('.tabbar, .cta-bar, .job-actions, .overlay, .petals').forEach(el => el.remove());
  document.body.classList.remove('no-scroll');
  window.onLangChange = null;
  shellEl.className = 'shell';
}

function route() {
  clearChrome();
  const [name, param] = (location.hash || '#home').slice(1).split('/');
  (VIEWS[name] || viewHome)(param);
  window.scrollTo(0, 0);
}

/* ---------- 起動 ---------- */
applyPrefs();
renderDemoBar();
document.addEventListener('click', e => {
  if (e.target.closest('.lang-pill')) setLang(getLang() === 'ja' ? 'zh' : 'ja');
});
window.addEventListener('hashchange', route);
route();
