/* common.js - shared screens, sample data and micro-interactions for the three portal design samples.
   DESIGN PREVIEW ONLY: every number, invoice and UTR below is sample data typed by hand.
   Nothing is sent or saved anywhere. */
(function () {
  'use strict';

  // ---------- small helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ico = (n, cls = '') => `<svg class="ico ${cls}" aria-hidden="true"><use href="#i-${n}"></use></svg>`;
  const inr = n => '₹ ' + Math.round(n).toLocaleString('en-IN');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dmy = iso => iso.split('-').reverse().join('/');

  // Add a feedback class (is-success / is-error), remove it again when the animation ends.
  function flash(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // restart the animation
    el.classList.add(cls);
    const off = () => el.classList.remove(cls);
    el.addEventListener('animationend', off, { once: true });
    setTimeout(off, 900); // fallback when motion is reduced
  }

  function toast(title, text, kind = 'ok') {
    const box = $('#toasts');
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.innerHTML = `<span class="t-ico">${ico(kind === 'ok' ? 'check' : kind === 'err' ? 'x' : 'info')}</span>
      <div><b>${esc(title)}</b>${text ? esc(text) : ''}</div>`;
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 220); }, 3400);
  }

  // Put a spinner on a button for ms milliseconds.
  async function busy(btn, ms, label = 'Please wait…') {
    const html = btn.innerHTML;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>${label}</span>`;
    await wait(ms);
    btn.removeAttribute('aria-busy');
    btn.innerHTML = html;
  }

  // ---------- icons (inline SVG sprite, no icon library needed) ----------
  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    checkc: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    rupee: '<path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    chev: '<polyline points="6 9 12 15 18 9"/>',
    alertTri: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  };
  function injectSprite() {
    const syms = Object.entries(ICONS).map(([k, v]) =>
      `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('');
    document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${syms}</svg>`);
  }

  // ---------- sample data ----------
  const ORG = {
    name: 'U P SLDC Limited', sub: 'A U.P. Govt. Undertaking',
    addr: 'UPSLDC Complex, Vibhuti Khand, Gomti Nagar, Lucknow - 226010',
    cin: 'U40106UP2022SGC169330', pan: 'AADCU1676Q', gstin: '09AADCU1676QIZK',
    mail: 'eeldcbilling@upsldc.org', web: 'www.upsldc.org',
  };
  // Entity types: only the first is taken from the current portal; the others are placeholders for the sample.
  const TYPES = ['Thermal/Hydro/Cogen/CPP', 'Solar (sample type)', 'Open Access (sample type)'];
  const CONSUMERS = [
    { code: '110000421', name: 'Simbholi Power Pvt Ltd Chilwaria Distt Bahraich', short: 'SimbholiChilwaria', type: 0, base: 22162 },
    { code: '110000452', name: 'Triveni Engineering & Industries Ltd Chandanpur', short: 'TriveniChandanpur', type: 0, base: 1862 },
    { code: '110000487', name: 'Nirosha Solar Power Pvt Ltd Distt Mahoba', short: 'NiroshaMahoba', type: 1, base: 18815 },
    { code: '110000651', name: 'Balrampur Chini Mills Ltd Unit Gularia SLOP', short: 'BalrampurGulariaSlop', type: 0, base: 2218 },
    { code: '110000820', name: 'Balrampur Chini Mills Ltd Unit Gularia', short: 'BalrampurGularia', type: 0, base: 12671 },
    { code: '110000831', name: 'Balrampur Chini Mills Ltd Unit Rauzagaon', short: 'BalrampurRauzagaon', type: 0, base: 14572 },
    { code: '110000446', name: 'Superior Food Grains Pvt Ltd Shamli', short: 'SuperiorShamli', type: 2, base: 17919 },
    { code: '110000894', name: 'SIALSBEC Bio Energy Baraut', short: 'SialsbecBaraut', type: 0, base: 9757 },
    { code: '110000671', name: 'MEIL ANPARA ENERGY LIMITED', short: 'MeilAnpara', type: 0, base: 689888 },
    { code: '110001590', name: 'Bharat Petroleum Corporation Limited', short: 'BpclLucknow', type: 2, base: 5760 },
  ];
  const MONTHS = [ // latest first
    { label: 'Aug-26', mmm: 'aug', yy: '26', date: '05/09/2026' },
    { label: 'Jul-26', mmm: 'jul', yy: '26', date: '05/08/2026' },
    { label: 'Jun-26', mmm: 'jun', yy: '26', date: '04/07/2026' },
    { label: 'May-26', mmm: 'may', yy: '26', date: '05/06/2026' },
    { label: 'Apr-26', mmm: 'apr', yy: '26', date: '06/05/2026' },
  ];
  const rnd = s => { const x = Math.sin(s * 99.13) * 10000; return x - Math.floor(x); };

  // Sample invoices of one consumer: older months paid, latest unpaid.
  function invoicesOf(c) {
    const ci = CONSUMERS.indexOf(c);
    return MONTHS.map((m, mi) => ({
      no: String(6100 - mi * 400 + ci * 3),
      month: m, amount: Math.round(c.base * (0.92 + rnd(ci * 13 + mi) * 0.16)),
      status: mi >= 2 ? 'paid' : mi === 1 ? (ci % 3 === 0 ? 'part' : 'unpaid') : 'unpaid',
    }));
  }

  let RECORDS = [
    { sn: 84, c: 0, inv: '5280', date: '2026-11-05', utr: 'SBIN426131746273', amt: 22162, rem: 'Bill for the month of April.2026' },
    { sn: 83, c: 1, inv: '5703', date: '2026-11-04', utr: 'PUNBH26308114270', amt: 1862, rem: '' },
    { sn: 82, c: 2, inv: '5706', date: '2026-11-03', utr: 'UTIBR52026110300481902', amt: 18815, rem: 'Invoice no-5706 / amount - 18815 rs' },
    { sn: 81, c: 8, inv: '5724', date: '2026-11-02', utr: 'HDFCR52026110254418861', amt: 689888, rem: '' },
    { sn: 80, c: 4, inv: '5712', date: '2026-10-30', utr: 'CNRBH26303447102', amt: 12671, rem: '' },
    { sn: 79, c: 5, inv: '5715', date: '2026-10-29', utr: 'BARBR52026102988219034', amt: 14572, rem: 'July bill' },
    { sn: 78, c: 6, inv: '5718', date: '2026-10-28', utr: 'ICICN52026102811934', amt: 17919, rem: '' },
    { sn: 77, c: 7, inv: '5721', date: '2026-10-27', utr: 'SBIN426100338210', amt: 9757, rem: '' },
    { sn: 76, c: 3, inv: '5709', date: '2026-10-24', utr: 'PUNBH26297004417', amt: 2218, rem: '' },
    { sn: 75, c: 9, inv: '5727', date: '2026-10-22', utr: 'SBIN426095512007', amt: 5760, rem: 'Paid through RTGS' },
  ];

  // ---------- navigation ----------
  const NAV = [
    ['dashboard', 'Dashboard', 'grid'],
    ['download', 'Download Bill', 'download'],
    ['payment', 'Update Payment', 'card'],
    ['history', 'Billing History', 'clock'],
    ['ticket', 'Raise Ticket', 'message'],
  ];
  function renderNav() {
    const nav = $('#nav');
    if (!nav) return;
    nav.innerHTML = NAV.map(([k, label, i]) =>
      `<a class="nav-link" href="#${k}" data-view="${k}">${ico(i)}<span>${label}</span></a>`).join('') +
      `<a class="nav-link admin" href="#admin" data-admin>${ico('shield')}<span>Admin Panel</span></a>`;
  }

  function show(view) {
    if (!NAV.some(n => n[0] === view)) view = 'dashboard';
    $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'v-' + view));
    $$('.nav-link[data-view]').forEach(a => { if (a.dataset.view === view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const title = $('#pageTitle');
    if (title) title.textContent = NAV.find(n => n[0] === view)[1];
    document.body.classList.remove('nav-open');
    const mb = $('#menuBtn'); if (mb) mb.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    if (view === 'dashboard') dashboardEnter();
  }

  // ---------- combobox (searchable entity name) ----------
  function combo(root, getItems, onPick) {
    const input = $('input', root), list = $('ul', root);
    let items = [], active = -1;
    const label = c => `${c.code} - ${c.name}`;
    function render() {
      const q = input.value.trim().toLowerCase();
      items = getItems().filter(c => !q || label(c).toLowerCase().includes(q));
      list.innerHTML = items.length
        ? items.map((c, i) => `<li role="option" id="${list.id}-${i}" data-i="${i}" aria-selected="${i === active}">${esc(c.name)}<small>${c.code} · ${esc(TYPES[c.type])}</small></li>`).join('')
        : '<li class="none">No entity matches this text</li>';
      if (active >= 0) {
        input.setAttribute('aria-activedescendant', `${list.id}-${active}`);
        const li = $(`#${list.id}-${active}`); if (li) li.scrollIntoView({ block: 'nearest' });
      } else input.removeAttribute('aria-activedescendant');
    }
    function open() { if (input.disabled) return; root.classList.add('open'); input.setAttribute('aria-expanded', 'true'); render(); }
    function close() { root.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); active = -1; }
    function pick(i) {
      const c = items[i]; if (!c) return;
      input.value = label(c); close(); onPick(c);
      input.classList.remove('is-picked'); void input.offsetWidth; input.classList.add('is-picked');
    }
    input.addEventListener('focus', () => { input.select(); open(); });
    input.addEventListener('input', () => { active = -1; open(); onPick(null); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); active = Math.min(active + 1, items.length - 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); }
      else if (e.key === 'Enter' && root.classList.contains('open') && active >= 0) { e.preventDefault(); pick(active); }
      else if (e.key === 'Escape') close();
    });
    list.addEventListener('mousedown', e => { const li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); pick(+li.dataset.i); } });
    input.addEventListener('blur', () => setTimeout(close, 120));
    return {
      set(c) { input.value = c ? label(c) : ''; },
      enable(on) { input.disabled = !on; input.placeholder = on ? 'Search by code or name' : 'Select entity type first'; },
    };
  }
  const comboHTML = (id, disabled = true) => `<div class="combo" id="${id}-combo">
      <input id="${id}" class="input" role="combobox" aria-expanded="false" aria-controls="${id}-list" aria-autocomplete="list"
        autocomplete="off" ${disabled ? 'disabled placeholder="Select entity type first"' : 'placeholder="Search by code or name"'}>
      <ul class="combo-list" id="${id}-list" role="listbox"></ul></div>`;
  const typeOptions = () => '<option value="">Choose type of entity</option>' + TYPES.map((t, i) => `<option value="${i}">${esc(t)}</option>`).join('');

  // ---------- screen: dashboard ----------
  const vDashboard = () => `
  <section class="view stack" id="v-dashboard" aria-labelledby="h-dash">
    <div class="panel hero">
      <div class="hero-text">
        <span class="eyebrow">${ico('zap')} LDC Billing Portal</span>
        <h1 id="h-dash">Welcome to the UPSLDC Billing Portal</h1>
        <p>Download your monthly LDC bill instantly, report payments and see your billing history &mdash; no login needed.</p>
        <div class="hero-actions">
          <a class="button" href="#download">${ico('download')} Download a bill</a>
          <a class="button ghost" href="#payment">${ico('card')} Report a payment</a>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="mini-bill">
          <div class="mb-head"><span class="mb-logo">${ico('zap')}</span><span><b>Invoice 6100</b><small>Aug-26 &middot; LDC charges</small></span><span class="badge paid">Ready</span></div>
          <i></i><i></i><i class="short"></i>
          <div class="mb-foot"><span>Total</span><b>&#8377; 22,162</b></div>
        </div>
        <div class="mini-pill">${ico('zap')} Instant download</div>
      </div>
    </div>

    <div class="quick-grid">
      ${[['download', 'download', 'Download Bills', 'Get your monthly LDC bill as a PDF in one click.'],
         ['payment', 'card', 'Update Payment Info', 'Report UTR and amount after paying one or more invoices.'],
         ['history', 'clock', 'Billing History', 'See all your bills with paid / unpaid status.'],
         ['ticket', 'message', 'Raise Ticket', 'Need help? Send a support request to the billing section.']]
        .map(([k, i, h, p]) => `<a class="card quick" href="#${k}"><span class="quick-ico">${ico(i)}</span><h3>${h}</h3><p>${p}</p><span class="go">Open ${ico('arrow')}</span></a>`).join('')}
    </div>

    <div class="stats">
      <div class="card stat"><span class="stat-ico s-indigo">${ico('users')}</span><div><div class="stat-label">Total users</div><div class="stat-value" data-count="455">455</div></div></div>
      <div class="card stat"><span class="stat-ico s-green">${ico('checkc')}</span><div><div class="stat-label">Payments logged</div><div class="stat-value" data-count="98">98</div></div></div>
      <div class="card stat"><span class="stat-ico s-violet">${ico('rupee')}</span><div><div class="stat-label">Total amount paid</div><div class="stat-value" data-count="14267789" data-money>${inr(14267789)}</div></div></div>
    </div>

    <div class="panel">
      <div class="panel-head"><h3>Recent payment activity</h3><span class="muted">Last 30 entries</span></div>
      <ul class="activity-list" id="activity" aria-live="polite"></ul>
    </div>
  </section>`;

  let dashLoaded = false;
  async function dashboardEnter() {
    // count-up of the three numbers
    $$('#v-dashboard [data-count]').forEach(el => {
      const end = +el.dataset.count, money = el.hasAttribute('data-money');
      const out = v => (money ? inr(v) : Math.round(v).toLocaleString('en-IN'));
      if (reduced()) { el.textContent = out(end); return; }
      const t0 = performance.now(), dur = 900;
      const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = out(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    // activity list: short loading spinner on first visit
    const list = $('#activity');
    if (!dashLoaded) {
      list.innerHTML = '<li class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading recent payments…</li>';
      await wait(650);
      dashLoaded = true;
    }
    list.innerHTML = RECORDS.map(r => {
      const c = CONSUMERS[r.c];
      const ini = c.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
      return `<li class="act-row"><span class="act-avatar" aria-hidden="true">${esc(ini)}</span>
        <div class="act-main"><div class="act-name">${c.code} - ${esc(c.name)}</div><div class="act-meta">Invoice ${r.inv} &middot; ${dmy(r.date)}</div></div>
        <span class="act-amt">${inr(r.amt)}</span></li>`;
    }).join('');
  }

  // ---------- screen: download bill ----------
  const vDownload = () => `
  <section class="view stack" id="v-download" aria-labelledby="h-dl">
    <div class="page-head"><h2 id="h-dl">Download your bill</h2><p>Choose the month and your entity &mdash; the PDF is ready at once, no waiting.</p></div>
    <div class="panel pad">
      <div class="form-grid">
        <div class="field"><span class="label" id="lbl-kind">Type</span>
          <div class="seg" role="group" aria-labelledby="lbl-kind">
            <button type="button" aria-pressed="true" data-kind="Bill">Bill</button>
            <button type="button" aria-pressed="false" data-kind="Invoice">Invoice</button>
          </div></div>
        <div class="field"><label for="d-month">Month</label>
          <select id="d-month" class="input select"><option value="">Select month</option>${MONTHS.map((m, i) => `<option value="${i}">${m.label}</option>`).join('')}</select></div>
        <div class="field"><label for="d-type">Entity type</label><select id="d-type" class="input select">${typeOptions()}</select></div>
        <div class="field"><label for="d-name">Entity name</label>${comboHTML('d-name')}</div>
      </div>
      <div class="form-foot"><button type="button" class="button ghost sm" id="d-clear">${ico('x')} Clear selections</button></div>
    </div>
    <div id="d-result" aria-live="polite"></div>
  </section>`;

  function bindDownload() {
    const st = { kind: 'Bill', month: null, type: null, c: null };
    const res = $('#d-result');
    const cb = combo($('#d-name-combo'), () => CONSUMERS.filter(c => st.type === null || c.type === st.type), c => { st.c = c; draw(); });
    $$('#v-download .seg button').forEach(b => b.addEventListener('click', () => {
      $$('#v-download .seg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      st.kind = b.dataset.kind; draw();
    }));
    $('#d-month').addEventListener('change', e => { st.month = e.target.value === '' ? null : +e.target.value; draw(); });
    $('#d-type').addEventListener('change', e => {
      st.type = e.target.value === '' ? null : +e.target.value;
      cb.enable(st.type !== null); cb.set(null); st.c = null; draw();
    });
    $('#d-clear').addEventListener('click', () => {
      $('#d-month').value = ''; $('#d-type').value = ''; cb.set(null); cb.enable(false);
      Object.assign(st, { month: null, type: null, c: null }); draw();
      toast('Selections cleared', '', 'info');
    });
    function draw() {
      if (st.month === null || !st.c) {
        res.innerHTML = `<div class="empty">${ico('search')}<p>Make your selections above to get the download link.</p></div>`;
        return;
      }
      const m = MONTHS[st.month], inv = invoicesOf(st.c)[st.month];
      const fname = `${inv.no}_${st.c.short}_${m.mmm}.${m.yy}.pdf`;
      res.innerHTML = `<div class="card result">
        <span class="file-ico">PDF</span>
        <div class="result-main"><b class="mono">${esc(fname)}</b><small>${st.kind} &middot; ${m.label} &middot; Invoice ${inv.no} &middot; ${inr(inv.amount)} &middot; 2 pages</small></div>
        <button type="button" class="button" id="d-go">${ico('download')} Download</button></div>`;
      $('#d-go').addEventListener('click', async e => {
        const b = e.currentTarget;
        await busy(b, 700, 'Preparing…');
        b.classList.add('is-done'); b.innerHTML = `${ico('check')} Downloaded`;
        flash($('.ico', b), 'is-success');
        toast('Download started', ` ${fname} (sample - no real file)`);
        setTimeout(() => { b.classList.remove('is-done'); b.innerHTML = `${ico('download')} Download`; }, 2200);
      });
    }
    draw();
  }

  // ---------- screen: update payment ----------
  const vPayment = () => `
  <section class="view stack" id="v-payment" aria-labelledby="h-pay">
    <div class="page-head"><h2 id="h-pay">Update payment info</h2><p>Tell us about a payment you made. One UTR can cover several invoices.</p></div>
    <div class="note">${ico('alertTri')}<div>
      <p><b>Please note</b></p>
      <p>Tick every invoice this payment covers &mdash; the breakup (invoice / amount) is filled in for you.</p>
      <p>Paying an older month? Make a new entry for each payment so we can reconcile it.</p>
      <p>Other issues: mail <b>eeldcbilling@upsldc.org</b> with a clear subject.</p></div></div>
    <form class="panel pad" id="payForm" novalidate>
      <div class="form-grid">
        <div class="field" data-f="type"><label for="p-type">Type of entity <span class="req">*</span></label><select id="p-type" class="input select">${typeOptions()}</select></div>
        <div class="field" data-f="c"><label for="p-name">Name of entity <span class="req">*</span></label>${comboHTML('p-name')}</div>
        <div class="field full" data-f="inv"><span class="label" id="lbl-inv">Invoices paid <span class="req">*</span></span>
          <div class="chips" id="p-chips" role="group" aria-labelledby="lbl-inv"><span class="hint">Choose your entity to see its invoices.</span></div></div>
        <div class="field" data-f="date"><label for="p-date">Payment date <span class="req">*</span></label><input id="p-date" type="date" class="input" max="2026-11-02"></div>
        <div class="field" data-f="utr"><label for="p-utr">UTR no. <span class="req">*</span></label>
          <div class="input-wrap"><input id="p-utr" class="input mono" placeholder="e.g. SBIN426131746273" autocomplete="off" aria-describedby="p-utr-hint"><span class="state" id="p-utr-state"></span></div>
          <span class="hint" id="p-utr-hint">Sample rule only: 12&ndash;22 letters or digits.</span></div>
        <div class="field" data-f="amt"><label for="p-amt">Amount paid (&#8377;) <span class="req">*</span></label>
          <input id="p-amt" class="input" inputmode="decimal" placeholder="Amount" aria-describedby="p-amt-hint"><span class="hint" id="p-amt-hint"></span></div>
        <div class="field"><span class="label">Breakup</span><div class="breakup" id="p-breakup"><span class="muted">No invoice ticked yet.</span></div></div>
        <div class="field full"><label for="p-rem">Remarks</label><textarea id="p-rem" class="input" placeholder="Any remarks…"></textarea></div>
      </div>
      <div class="form-foot">
        <button type="reset" class="button ghost">${ico('x')} Clear</button>
        <button type="submit" class="button" id="p-submit">${ico('check')} Submit payment</button>
      </div>
    </form>

    <div class="panel">
      <div class="panel-head"><h3>Submitted payment records</h3>
        <div class="toolbar">
          <label class="muted" for="r-month">Month</label>
          <select id="r-month" class="input select" style="width:auto"><option value="2026-11">November 2026</option><option value="2026-10">October 2026</option><option value="">All months</option></select>
          <div class="search">${ico('search')}<input id="r-search" class="input" placeholder="Search records…" aria-label="Search records"></div>
        </div></div>
      <div class="table-wrap"><table class="tbl" id="r-table">
        <thead><tr>
          <th scope="col" aria-sort="descending"><button class="sort" data-k="sn">S. no ${ico('chev')}</button></th>
          <th scope="col">Type of entity</th>
          <th scope="col" aria-sort="none"><button class="sort" data-k="name">Name of entity ${ico('chev')}</button></th>
          <th scope="col">Invoice no.</th>
          <th scope="col" aria-sort="none"><button class="sort" data-k="date">Payment date ${ico('chev')}</button></th>
          <th scope="col">UTR no.</th>
          <th scope="col" class="num" aria-sort="none"><button class="sort" data-k="amt">Amount paid ${ico('chev')}</button></th>
          <th scope="col">Remarks</th>
        </tr></thead><tbody></tbody></table></div>
      <div class="table-foot"><span id="r-count"></span><span>Sample records only</span></div>
    </div>
  </section>`;

  function bindPayment() {
    const st = { type: null, c: null, picked: new Set(), sortK: 'sn', sortDir: -1, newSn: null };
    const field = f => $(`#v-payment [data-f="${f}"]`);
    const cb = combo($('#p-name-combo'), () => CONSUMERS.filter(c => st.type === null || c.type === st.type), c => { st.c = c; st.picked.clear(); drawChips(); field('c').classList.remove('has-error'); });

    $('#p-type').addEventListener('change', e => {
      st.type = e.target.value === '' ? null : +e.target.value;
      cb.enable(st.type !== null); cb.set(null); st.c = null; st.picked.clear(); drawChips();
      field('type').classList.remove('has-error');
    });

    function drawChips() {
      const box = $('#p-chips');
      if (!st.c) { box.innerHTML = '<span class="hint">Choose your entity to see its invoices.</span>'; drawBreakup(); return; }
      box.innerHTML = invoicesOf(st.c).map(v => {
        const paid = v.status === 'paid';
        return `<button type="button" class="chip${paid ? ' is-paid' : ''}" data-no="${v.no}" aria-pressed="${st.picked.has(v.no)}" ${paid ? 'aria-disabled="true" title="Already paid"' : ''}>
          <span class="tick">${ico('check')}</span><b>${v.no} &middot; ${v.month.label}</b><small>${inr(v.amount)}${paid ? ' &middot; paid' : v.status === 'part' ? ' &middot; part paid' : ''}</small></button>`;
      }).join('');
      $$('.chip', box).forEach(ch => ch.addEventListener('click', () => {
        if (ch.classList.contains('is-paid')) { flash(ch, 'is-error'); toast('Already paid', ` Invoice ${ch.dataset.no} is marked as paid.`, 'err'); return; }
        const on = ch.getAttribute('aria-pressed') !== 'true';
        ch.setAttribute('aria-pressed', String(on));
        on ? st.picked.add(ch.dataset.no) : st.picked.delete(ch.dataset.no);
        field('inv').classList.remove('has-error');
        drawBreakup();
      }));
      drawBreakup();
    }
    const pickedInv = () => st.c ? invoicesOf(st.c).filter(v => st.picked.has(v.no)) : [];
    const pickedTotal = () => pickedInv().reduce((s, v) => s + v.amount, 0);
    function drawBreakup() {
      const list = pickedInv(), box = $('#p-breakup');
      box.innerHTML = list.length
        ? list.map(v => `<div class="breakup-row"><span>Invoice ${v.no} (${v.month.label})</span><span>${inr(v.amount)}</span></div>`).join('') +
          `<div class="breakup-row total"><span>Total</span><span>${inr(pickedTotal())}</span></div>`
        : '<span class="muted">No invoice ticked yet.</span>';
      checkAmount();
    }
    function checkAmount() {
      const h = $('#p-amt-hint'), v = parseFloat($('#p-amt').value), tot = pickedTotal();
      h.className = 'hint'; h.textContent = '';
      if (!$('#p-amt').value || !tot) return;
      if (Math.abs(v - tot) < 0.5) { h.className = 'hint ok'; h.innerHTML = `${ico('check')} Matches the ticked invoices`; }
      else { h.className = 'hint warn'; h.innerHTML = `${ico('alert')} Differs from ticked total by ${inr(Math.abs(v - tot))}`; }
    }
    $('#p-amt').addEventListener('input', () => { field('amt').classList.remove('has-error'); checkAmount(); });

    const utrOk = v => /^[A-Z0-9]{12,22}$/.test(v);
    $('#p-utr').addEventListener('input', e => {
      const v = e.target.value = e.target.value.toUpperCase().replace(/\s/g, '');
      const s = $('#p-utr-state'), h = $('#p-utr-hint');
      field('utr').classList.remove('has-error');
      if (!v) { s.className = 'state'; s.innerHTML = ''; h.className = 'hint'; h.textContent = 'Sample rule only: 12–22 letters or digits.'; return; }
      if (utrOk(v)) { if (!s.classList.contains('ok')) { s.className = 'state ok'; s.innerHTML = ico('checkc'); } h.className = 'hint ok'; h.textContent = 'UTR format looks right'; }
      else { s.className = 'state bad'; s.innerHTML = ico('alert'); h.className = 'hint bad'; h.textContent = `${v.length} characters – need 12 to 22 letters/digits`; }
    });
    $('#p-date').addEventListener('change', () => field('date').classList.remove('has-error'));

    $('#payForm').addEventListener('reset', () => setTimeout(() => {
      st.type = null; st.c = null; st.picked.clear(); cb.enable(false); drawChips();
      $('#p-utr').dispatchEvent(new Event('input'));
      $$('#v-payment .field.has-error').forEach(f => f.classList.remove('has-error'));
    }));

    $('#payForm').addEventListener('submit', async e => {
      e.preventDefault();
      const utr = $('#p-utr').value, amt = parseFloat($('#p-amt').value);
      const bad = [];
      if (st.type === null) bad.push('type');
      if (!st.c) bad.push('c');
      if (!st.picked.size) bad.push('inv');
      if (!$('#p-date').value) bad.push('date');
      if (!utrOk(utr)) bad.push('utr');
      if (!(amt > 0)) bad.push('amt');
      $$('#v-payment .field.has-error').forEach(f => f.classList.remove('has-error'));
      if (bad.length) {
        bad.forEach(f => { field(f).classList.add('has-error'); flash(field(f), 'is-error'); });
        toast('Please complete the form', ` ${bad.length} field${bad.length > 1 ? 's need' : ' needs'} attention.`, 'err');
        return;
      }
      // one record can hold several invoices ("6100, 5700"): block if any of them is ticked again with the same UTR
      const dup = RECORDS.find(r => r.utr === utr && r.inv.split(', ').some(no => st.picked.has(no)));
      if (dup) {
        field('utr').classList.add('has-error'); flash(field('utr'), 'is-error');
        toast('Already reported', ` UTR ${utr} with invoice ${dup.inv} is already in the records.`, 'err');
        return;
      }
      const btn = $('#p-submit');
      await busy(btn, 900, 'Submitting…');
      const sn = Math.max(...RECORDS.map(r => r.sn)) + 1;
      const inv = pickedInv();
      RECORDS.unshift({
        sn, c: CONSUMERS.indexOf(st.c), inv: inv.map(v => v.no).join(', '), date: $('#p-date').value, utr, amt,
        rem: ($('#p-rem').value.trim() ? $('#p-rem').value.trim() + ' | ' : '') + inv.map(v => `Invoice no-${v.no} / amount - ${v.amount} rs`).join('; '),
      });
      st.newSn = sn;
      $('#payForm').reset();
      // show the month of the new entry; months not in the list fall back to "All months"
      $('#r-month').value = RECORDS[0].date.slice(0, 7);
      if ($('#r-month').value !== RECORDS[0].date.slice(0, 7)) $('#r-month').value = '';
      $('#r-search').value = '';
      drawTable();
      toast('Payment recorded', ` Entry no. ${sn} saved (sample - nothing is sent).`);
      $('#r-table').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    });

    // records table
    async function drawTable(withSpinner) {
      const body = $('#r-table tbody');
      if (withSpinner) {
        body.innerHTML = '<tr><td colspan="8"><div class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading records…</div></td></tr>';
        await wait(450);
      }
      const m = $('#r-month').value, q = $('#r-search').value.trim().toLowerCase();
      let rows = RECORDS.filter(r => !m || r.date.startsWith(m)).filter(r => {
        const c = CONSUMERS[r.c];
        return !q || [c.code, c.name, r.inv, r.utr, r.rem, String(r.amt)].join(' ').toLowerCase().includes(q);
      });
      const key = r => st.sortK === 'name' ? CONSUMERS[r.c].name : r[st.sortK];
      rows.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * st.sortDir);
      body.innerHTML = rows.length ? rows.map(r => {
        const c = CONSUMERS[r.c];
        return `<tr${r.sn === st.newSn ? ' class="is-new"' : ''}><td>${r.sn}</td><td>${esc(TYPES[c.type])}</td>
          <td class="name">${esc(c.name)}<small>${c.code}</small></td><td>${esc(r.inv)}</td><td>${dmy(r.date)}</td>
          <td class="mono">${esc(r.utr)}</td><td class="num">${inr(r.amt)}</td><td>${esc(r.rem) || '<span class="muted">&mdash;</span>'}</td></tr>`;
      }).join('') : `<tr><td colspan="8"><div class="empty" style="border:0">${ico('search')}<p>No record matches.</p></div></td></tr>`;
      $('#r-count').textContent = `Showing ${rows.length} of ${RECORDS.length} entries`;
      st.newSn = null;
    }
    $('#r-month').addEventListener('change', () => drawTable(true));
    $('#r-search').addEventListener('input', () => drawTable());
    $$('#r-table .sort').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k;
      st.sortDir = st.sortK === k ? -st.sortDir : (k === 'name' ? 1 : -1);
      st.sortK = k;
      $$('#r-table th[aria-sort]').forEach(th => th.setAttribute('aria-sort', 'none'));
      b.parentElement.setAttribute('aria-sort', st.sortDir > 0 ? 'ascending' : 'descending');
      drawTable();
    }));
    drawTable();
  }

  // ---------- screen: billing history ----------
  const vHistory = () => `
  <section class="view stack" id="v-history" aria-labelledby="h-his">
    <div class="page-head"><h2 id="h-his">Billing history</h2><p>All bills of one entity, with payment status.</p></div>
    <div class="panel pad"><div class="form-grid">
      <div class="field"><label for="h-name">Entity</label>${comboHTML('h-name', false)}</div>
      <div class="field"><span class="label">Status shown</span><div class="hint">Paid / part paid / unpaid comes from the payment records (sample values here).</div></div>
    </div></div>
    <div id="h-body" aria-live="polite"></div>
  </section>`;

  function bindHistory() {
    const body = $('#h-body');
    const cb = combo($('#h-name-combo'), () => CONSUMERS, c => c && draw(c));
    async function draw(c) {
      body.innerHTML = `<div class="panel"><div class="loading-row"><span class="spinner" aria-hidden="true"></span> Loading bills…</div></div>`;
      await wait(450);
      const inv = invoicesOf(c);
      const billed = inv.reduce((s, v) => s + v.amount, 0);
      const paid = inv.reduce((s, v) => s + (v.status === 'paid' ? v.amount : v.status === 'part' ? Math.round(v.amount / 2) : 0), 0);
      body.innerHTML = `<div class="stack">
        <div class="tiles">
          <div class="card stat"><span class="stat-ico s-indigo">${ico('file')}</span><div><div class="stat-label">Total billed</div><div class="stat-value">${inr(billed)}</div></div></div>
          <div class="card stat"><span class="stat-ico s-green">${ico('checkc')}</span><div><div class="stat-label">Paid</div><div class="stat-value">${inr(paid)}</div></div></div>
          <div class="card stat"><span class="stat-ico s-red">${ico('wallet')}</span><div><div class="stat-label">Outstanding</div><div class="stat-value">${inr(billed - paid)}</div></div></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>${esc(c.name)}</h3><span class="muted">${c.code}</span></div>
          <div class="table-wrap"><table class="tbl"><thead><tr>
            <th scope="col">Month</th><th scope="col">Invoice no.</th><th scope="col">Invoice date</th><th scope="col" class="num">Amount</th><th scope="col">Status</th><th scope="col"><span class="sr">Bill PDF</span></th>
          </tr></thead><tbody>
          ${inv.map(v => `<tr><td>${v.month.label}</td><td>${v.no}</td><td>${v.month.date}</td><td class="num">${inr(v.amount)}</td>
            <td><span class="badge ${v.status}">${v.status === 'part' ? 'Part paid' : v.status === 'paid' ? 'Paid' : 'Unpaid'}</span></td>
            <td><button type="button" class="icon-button h-dl" aria-label="Download bill ${v.no} (${v.month.label})" data-f="${v.no}_${c.short}_${v.month.mmm}.${v.month.yy}.pdf">${ico('download')}</button></td></tr>`).join('')}
          </tbody></table></div>
        </div></div>`;
      $$('.h-dl', body).forEach(b => b.addEventListener('click', () => {
        b.setAttribute('aria-pressed', 'true'); flash(b, 'is-success');
        setTimeout(() => b.removeAttribute('aria-pressed'), 400);
        toast('Download started', ` ${b.dataset.f} (sample)`);
      }));
    }
    cb.set(CONSUMERS[0]); draw(CONSUMERS[0]);
  }

  // ---------- screen: raise ticket ----------
  const vTicket = () => `
  <section class="view stack" id="v-ticket" aria-labelledby="h-tk">
    <div class="page-head"><h2 id="h-tk">Raise a ticket</h2><p>Tell the billing section what is wrong; we reply by e-mail.</p></div>
    <form class="panel pad" id="tkForm" novalidate>
      <div class="form-grid">
        <div class="field full"><span class="label" id="lbl-cat">What is it about?</span>
          <div class="seg" role="group" aria-labelledby="lbl-cat">
            ${['Bill not found', 'Wrong amount', 'Payment not shown', 'Other'].map((t, i) => `<button type="button" aria-pressed="${i === 0}">${t}</button>`).join('')}
          </div></div>
        <div class="field" data-t="c"><label for="t-name">Entity <span class="req">*</span></label>${comboHTML('t-name', false)}</div>
        <div class="field" data-t="mail"><label for="t-mail">Your e-mail <span class="req">*</span></label><input id="t-mail" type="email" class="input" placeholder="name@company.com"></div>
        <div class="field full" data-t="msg"><label for="t-msg">Message <span class="req">*</span></label><textarea id="t-msg" class="input" placeholder="Describe the problem, with invoice no. and month…"></textarea></div>
      </div>
      <div class="form-foot"><button type="submit" class="button" id="t-submit">${ico('message')} Send ticket</button></div>
    </form>
  </section>`;

  function bindTicket() {
    let c = null;
    combo($('#t-name-combo'), () => CONSUMERS, x => { c = x; });
    $$('#v-ticket .seg button').forEach(b => b.addEventListener('click', () => $$('#v-ticket .seg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)))));
    $('#tkForm').addEventListener('submit', async e => {
      e.preventDefault();
      const f = k => $(`#v-ticket [data-t="${k}"]`);
      const bad = [];
      if (!c) bad.push('c');
      if (!/^\S+@\S+\.\S+$/.test($('#t-mail').value)) bad.push('mail');
      if ($('#t-msg').value.trim().length < 10) bad.push('msg');
      $$('#v-ticket .has-error').forEach(x => x.classList.remove('has-error'));
      if (bad.length) { bad.forEach(k => { f(k).classList.add('has-error'); flash(f(k), 'is-error'); }); toast('Please complete the form', '', 'err'); return; }
      await busy($('#t-submit'), 900, 'Sending…');
      toast('Ticket sent', ' Reference T-2611-0042 (sample). We reply by e-mail.');
      e.target.reset();
    });
  }

  // ---------- footer, theme, mobile menu, design switcher ----------
  function renderFooter() {
    const f = $('#footer'); if (!f) return;
    f.innerHTML = `<div class="footer-inner">
      <div><h4>${ORG.name}</h4><p>${ico('pin')} ${ORG.addr}</p><p>${ico('globe')} <a href="#dashboard">${ORG.web}</a></p><p>${ico('mail')} <a href="mailto:${ORG.mail}">${ORG.mail}</a></p></div>
      <div><h4>Quick links</h4>${NAV.map(([k, l]) => `<p><a href="#${k}">${l}</a></p>`).join('')}</div>
      <div><h4>Information</h4><p>CIN: ${ORG.cin}</p><p>PAN: ${ORG.pan}</p><p>GSTIN: ${ORG.gstin}</p><p class="muted-f">For technical help with this portal, contact the Establishment Section.</p></div>
    </div>
    <div class="footer-bottom">&copy; 2026 ${ORG.name}. All rights reserved. &middot; Designed &amp; developed by Establishment / LDC Billing Section, UPSLDC</div>`;
  }

  function initTheme() {
    const btn = $('#themeBtn'); if (!btn) return;
    const root = document.documentElement;
    try { const s = localStorage.getItem('portal-theme'); if (s) root.dataset.theme = s; } catch (e) { /* storage blocked */ }
    const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const sync = () => {
      btn.innerHTML = ico(dark() ? 'sun' : 'moon');
      btn.setAttribute('aria-label', dark() ? 'Switch to light theme' : 'Switch to dark theme');
    };
    btn.addEventListener('click', () => {
      root.dataset.theme = dark() ? 'light' : 'dark';
      try { localStorage.setItem('portal-theme', root.dataset.theme); } catch (e) { /* ignore */ }
      sync(); flash(btn, 'is-success');
    });
    sync();
  }

  function initMenu() {
    const mb = $('#menuBtn'); if (!mb) return;
    mb.innerHTML = ico('menu');
    mb.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      mb.setAttribute('aria-expanded', String(open));
    });
    const bd = $('#backdrop'); if (bd) bd.addEventListener('click', () => { document.body.classList.remove('nav-open'); mb.setAttribute('aria-expanded', 'false'); });
  }

  // colour palettes (defined in palettes.css): key, name, main colour, accent colour
  const PALETTES = [
    ['navy', 'Navy & Gold', '#1E3A8A', '#D97706'],
    ['teal', 'Teal & Amber', '#0F766E', '#F59E0B'],
    ['ocean', 'Ocean Blue & Cyan', '#0369A1', '#06B6D4'],
    ['graphite', 'Graphite & Orange', '#C2410C', '#475569'],
    ['indigo', 'Indigo & Violet (first sample)', '#4F46E5', '#8B5CF6'],
  ];
  const palette = () => document.documentElement.dataset.palette || 'teal';

  function renderSwitcher() {
    const here = location.pathname.split('/').pop();
    // a palette given in the address (?p=teal) is remembered for the other designs
    try { const q = new URLSearchParams(location.search).get('p'); if (q) localStorage.setItem('portal-palette', q); } catch (e) { /* ignore */ }
    const d = [['index.html', 'All'], ['design-a-glass.html', 'A Glass'], ['design-b-minimal.html', 'B Minimal'], ['design-c-sidebar.html', 'C Sidebar'], ['palettes.html', 'Colours']];
    const links = () => d.map(([f, l]) => {
      const q = f.startsWith('design') ? `?p=${palette()}${location.hash}` : '';
      return `<a href="${f}${q}"${f === here ? ' aria-current="page"' : ''}>${l}</a>`;
    }).join('');
    const dots = () => PALETTES.map(([k, name, a, b]) =>
      `<button type="button" class="pal-dot" data-pal="${k}" aria-label="Colours: ${name}" title="${name}" aria-pressed="${k === palette()}"
        style="background:linear-gradient(135deg, ${a} 50%, ${b} 50%)"></button>`).join('');
    document.body.insertAdjacentHTML('beforeend', `<nav class="design-switch" aria-label="Design samples"><span class="ds-links">${links()}</span><span class="ds-dots">${dots()}</span></nav>`);
    const bar = $('.design-switch');
    bar.addEventListener('click', e => {
      const b = e.target.closest('.pal-dot'); if (!b) return;
      document.documentElement.dataset.palette = b.dataset.pal;
      try { localStorage.setItem('portal-palette', b.dataset.pal); } catch (err) { /* ignore */ }
      $$('.pal-dot', bar).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $('.ds-links', bar).innerHTML = links();
      history.replaceState(null, '', `?p=${b.dataset.pal}${location.hash}`);
      toast('Colours changed', ` ${PALETTES.find(p => p[0] === b.dataset.pal)[1]}`, 'info');
    });
    window.addEventListener('hashchange', () => { $('.ds-links', bar).innerHTML = links(); });
  }

  // ---------- click ripple on every clickable element (accent colour, see .ripple in base.css) ----------
  const RIPPLE_ON = '.button, .icon-button, .chip, .seg button, .nav-link, .card, .combo-list li, .act-row';
  document.addEventListener('pointerdown', e => {
    if (reduced()) return;
    const el = e.target.closest(RIPPLE_ON);
    if (!el || el.disabled) return;
    const r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2;
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    el.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  });

  // ---------- start ----------
  injectSprite();
  renderNav();
  $('#app').innerHTML = vDashboard() + vDownload() + vPayment() + vHistory() + vTicket();
  document.body.insertAdjacentHTML('beforeend', '<div class="toasts" id="toasts" role="status" aria-live="polite"></div>');
  renderFooter();
  $$('.brand-mark').forEach(b => { b.innerHTML = ico('zap'); });
  bindDownload(); bindPayment(); bindHistory(); bindTicket();
  initTheme(); initMenu();
  if (!document.body.hasAttribute('data-final')) renderSwitcher(); // the final design has no sample bar
  document.addEventListener('click', e => {
    if (e.target.closest('[data-admin]')) { e.preventDefault(); toast('Admin panel', ' Not part of this design sample.', 'info'); }
  });
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1));
})();
