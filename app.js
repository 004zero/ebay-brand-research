/* ebay-brand-research app.js
   内蔵の目安データ（data.js）＋ブックマークレットで取り込んだ eBay 実測データから
   ブランド×カテゴリの「売れ行き・回転・売れ筋モデル・仕入上限」を計算して表示する。 */
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = encodeURIComponent;
const DAY = 86400000;
const STORE_KEY = 'ebr_v1';

const CAT_ALL = { id: 'all', ja: 'ブランド全体（カテゴリ指定なし）', kw: '', ship: 3000 };
const CATS_ALL = [CAT_ALL, ...CATS];
const GROUP_JA = { lux: 'ラグジュアリー', affordable: '手頃', jewelry: 'ジュエリー・時計', jp: '日本発', custom: 'カスタム' };
const PRICE_BANDS = [0, 50, 100, 200, 300, 500, 800, 1200, 2000, 5000, Infinity];

const DEFAULT_SETTINGS = {
  rate: 150, feePct: 15, otherPct: 3, tariffPct: 15, tariffMode: 'seller', margin: 20, pack: 200, minN: 8,
  ship: Object.fromEntries(CATS_ALL.map((c) => [c.id, c.ship])),
  w: { v: 35, st: 25, p: 15, j: 15, s: 10 },
  jpOnly: true,
};

let state = { settings: structuredClone(DEFAULT_SETTINGS), datasets: [], customBrands: [], ui: { group: 'all', sort: 'score', sortDir: -1 } };

// ---------- 保存 ----------
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      state.settings = { ...structuredClone(DEFAULT_SETTINGS), ...(d.settings || {}) };
      state.settings.ship = { ...DEFAULT_SETTINGS.ship, ...((d.settings && d.settings.ship) || {}) };
      state.settings.w = { ...DEFAULT_SETTINGS.w, ...((d.settings && d.settings.w) || {}) };
      state.datasets = Array.isArray(d.datasets) ? d.datasets : [];
      state.customBrands = Array.isArray(d.customBrands) ? d.customBrands : [];
      state.ui = { ...state.ui, ...(d.ui || {}) };
    }
  } catch (e) { console.warn('load failed', e); }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ settings: state.settings, datasets: state.datasets, customBrands: state.customBrands, ui: state.ui })); }
  catch (e) { toast('保存に失敗しました（容量超過の可能性）。古いデータを削除してください。'); }
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- ブランド・カテゴリ ----------
const allBrands = () => [...BRANDS, ...state.customBrands];
const brandById = (id) => allBrands().find((b) => b.id === id);
const catById = (id) => CATS_ALL.find((c) => c.id === id);

function benchCell(brand, catId) {
  if (catId === 'all') {
    const vals = Object.values(brand.c || {});
    if (!vals.length) return null;
    return { star: Math.max(...vals.map((v) => v[0])), lo: Math.min(...vals.map((v) => v[1])), hi: Math.max(...vals.map((v) => v[2])) };
  }
  const v = brand.c && brand.c[catId];
  return v ? { star: v[0], lo: v[1], hi: v[2] } : null;
}

function searchKw(brand, catId) {
  const cat = catById(catId);
  return cat && cat.kw ? `${brand.kw} ${cat.kw}` : brand.kw;
}
function ebayUrl(brand, catId, mode, jpOnly) {
  const p = new URLSearchParams({ _nkw: searchKw(brand, catId), _ipg: '240' });
  if (mode === 'sold') { p.set('LH_Sold', '1'); p.set('LH_Complete', '1'); p.set('_sop', '13'); } else { p.set('_sop', '10'); }
  if (jpOnly) { p.set('LH_SALBN', '1'); p.set('_salic', '104'); }
  return 'https://www.ebay.com/sch/i.html?' + p.toString();
}
function sourceLinks(q) {
  return SOURCES.map((s) => `<a href="${s.u.replace('{q}', enc(q))}" target="_blank" rel="noopener">${esc(s.n)}</a>`).join('');
}

// ---------- 日付・数値 ----------
const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
function parseDate(s) {
  if (!s) return null;
  s = String(s).trim();
  let m = s.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (m && MON[m[1].toLowerCase()] !== undefined) return new Date(+m[3], MON[m[1].toLowerCase()], +m[2]);
  m = s.match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/);
  if (m && MON[m[2].toLowerCase()] !== undefined) return new Date(+m[3], MON[m[2].toLowerCase()], +m[1]);
  m = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(+m[3], +m[1] - 1, +m[2]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
function parseCount(s) {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').match(/(\d+)\+?\s*(results?|件)/i) || String(s).replace(/,/g, '').match(/(\d{2,})/);
  return m ? +m[1] : null;
}
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const quantile = (a, q) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const pos = (s.length - 1) * q; const b = Math.floor(pos); const r = pos - b; return s[b + 1] !== undefined ? s[b] + r * (s[b + 1] - s[b]) : s[b]; };
const fmtUsd = (v) => v == null ? '—' : '$' + Math.round(v).toLocaleString();
const fmtYen = (v) => v == null ? '—' : (v < 0 ? '−' : '') + '¥' + Math.abs(Math.round(v)).toLocaleString();
const fmtN = (v, d = 0) => v == null || !isFinite(v) ? '—' : Number(v).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
const fmtPct = (v) => v == null ? '—' : Math.round(v * 100) + '%';
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

// ---------- タイトル解析 ----------
const rxCache = new Map();
function wordRx(name) {
  if (rxCache.has(name)) return rxCache.get(name);
  const e = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
  const rx = new RegExp(`(^|[^A-Za-z0-9])${e}(?=$|[^A-Za-z0-9])`, 'i');
  rxCache.set(name, rx);
  return rx;
}
function pickTags(title, list) { const out = []; for (const n of list) if (wordRx(n).test(title)) out.push(n); return out; }
function primaryModel(title, brand) {
  // 固有モデル名を優先し、種類名（Long Wallet 等）は固有名が無いときだけ。同じ優先度なら長い名前を優先（"Speedy Bandouliere" > "Speedy"）
  if (!brand._sortedModels) {
    const all = [...(brand.models || [])].sort((a, b) => b.length - a.length);
    brand._sortedModels = [...all.filter((n) => !GENERIC.has(n)), ...all.filter((n) => GENERIC.has(n))];
  }
  for (const n of brand._sortedModels) if (wordRx(n).test(title)) return n;
  return null;
}
function primaryLine(title, brand) {
  const list = brand._sortedLines || (brand._sortedLines = [...(brand.lines || [])].sort((a, b) => b.length - a.length));
  for (const n of list) if (wordRx(n).test(title)) return n;
  return null;
}
// eBay がタイトル末尾に付ける読み上げ用の隠し文字などを除去
function cleanTitle(t) {
  return String(t || '').replace(/\s*Opens in a new window or tab\s*/gi, ' ').replace(/^(New Listing|Sponsored)\s*/i, '').replace(/\s+/g, ' ').trim();
}
function condOf(it) {
  const s = `${it.c || ''} ${cleanTitle(it.t)}`;
  if (/brand new|new with|new without|new \(other\)|\bBNWT\b|\bNWT\b|\bNWOT\b|unused|未使用/i.test(s)) return 'new';
  return 'used';
}
function isJapan(it) { return /japan/i.test(it.l || '') || /japan/i.test(it.s || ''); }

// ---------- 利益計算 ----------
function profit(priceUsd, catId) {
  const s = state.settings;
  if (priceUsd == null) return null;
  const rev = priceUsd * s.rate;
  const fees = rev * (s.feePct + s.otherPct) / 100;
  const tariff = s.tariffMode === 'seller' ? rev * s.tariffPct / 100 : 0;
  const ship = s.ship[catId] ?? s.ship.all ?? 3000;
  const net = rev - fees - tariff - ship - s.pack;
  const target = rev * s.margin / 100;
  return { rev, fees, tariff, ship, net, target, maxBuy: net - target };
}

// ---------- 実測メトリクス ----------
function latestDataset(brandId, catId, mode) {
  const list = state.datasets.filter((d) => d.brand === brandId && d.cat === catId && d.mode === mode);
  if (!list.length) return null;
  return list.reduce((a, b) => (a.at > b.at ? a : b));
}

function metrics(brand, catId) {
  const sold = latestDataset(brand.id, catId, 'sold');
  const active = latestDataset(brand.id, catId, 'active');
  if (!sold && !active) return null;
  const m = { sold, active, n: 0 };
  if (sold) {
    const items = sold.items.filter((i) => i.p > 0).map((i) => ({ ...i, t: cleanTitle(i.t) }));
    m.n = items.length;
    const prices = items.map((i) => i.p);
    const dated = items.map((i) => ({ ...i, dt: parseDate(i.d) })).filter((i) => i.dt);
    m.datedN = dated.length;
    const total = parseCount(sold.cnt);
    m.total = total && total >= m.n ? total : m.n;
    let span = null, newest = null, oldest = null;
    if (dated.length >= 3) {
      newest = new Date(Math.max(...dated.map((i) => i.dt)));
      oldest = new Date(Math.min(...dated.map((i) => i.dt)));
      span = Math.max(1, Math.round((newest - oldest) / DAY) + 1);
    }
    m.newest = newest; m.oldest = oldest; m.span = span;
    if (span) {
      // 「売れた日が新しい順」で集めた前提：集めた件数 ÷ 期間。
      // 直近30日・90日は、収集期間がその日数以上あれば実数、足りなければ1日あたりから換算
      m.perDay = m.n / span;
      m.sold30 = span >= 30 ? dated.filter((i) => newest - i.dt <= 30 * DAY).length : Math.round(m.perDay * 30);
      m.sold90 = span >= 90 ? dated.filter((i) => newest - i.dt <= 90 * DAY).length : Math.round(m.perDay * 90);
      m.sold90 = Math.max(m.sold90, m.sold30);
      m.sold90Src = span >= 90 ? '売れた日ベース（実数）' : `${span}日分から換算`;
    } else {
      // 日付が取れない場合は eBay の表示件数を約90日分とみなす
      m.sold90 = m.total; m.perDay = m.total / 90; m.sold30 = Math.round(m.perDay * 30); m.sold90Src = 'eBay 表示件数÷90日で代用';
    }
    m.median = median(prices); m.avg = prices.reduce((a, b) => a + b, 0) / (prices.length || 1);
    m.p25 = quantile(prices, 0.25); m.p75 = quantile(prices, 0.75); m.min = Math.min(...prices); m.max = Math.max(...prices);
    // 価格の安定度: 中心帯の幅（P75−P25）÷中央値 が小さいほど高い。0.2→83, 0.5→67, 1.2→45
    m.stability = m.median ? 1 / (1 + (m.p75 - m.p25) / m.median) : 0;
    const locKnown = items.filter((i) => i.l).length;
    m.jpShare = locKnown >= 5 ? items.filter(isJapan).length / locKnown : null;
    m.newShare = items.filter((i) => condOf(i) === 'new').length / (items.length || 1);
    // 価格帯分布
    m.bands = [];
    for (let i = 0; i < PRICE_BANDS.length - 1; i++) {
      const lo = PRICE_BANDS[i], hi = PRICE_BANDS[i + 1];
      const c = prices.filter((p) => p >= lo && p < hi).length;
      if (c || hi !== Infinity) m.bands.push({ lo, hi, n: c });
    }
    while (m.bands.length && !m.bands[m.bands.length - 1].n) m.bands.pop();
    while (m.bands.length && !m.bands[0].n) m.bands.shift();
    // モデル・ライン・色・サイズ
    const agg = (keyFn) => {
      const map = new Map();
      for (const it of items) { const k = keyFn(it.t); if (!k) continue; if (!map.has(k)) map.set(k, []); map.get(k).push(it.p); }
      return [...map.entries()].map(([name, ps]) => ({ name, n: ps.length, share: ps.length / items.length, median: median(ps), perDay: span ? ps.length / span : null })).sort((a, b) => b.n - a.n);
    };
    m.models = agg((t) => primaryModel(t, brand));
    m.lines = agg((t) => primaryLine(t, brand));
    m.colors = agg((t) => pickTags(t, COLORS)[0] || null);
    m.sizes = agg((t) => pickTags(t, SIZES)[0] || null);
    m.unmatched = items.filter((i) => !primaryModel(i.t, brand)).length;
    m.recent = dated.sort((a, b) => b.dt - a.dt).slice(0, 60);
    if (!dated.length) m.recent = items.slice(0, 60).map((i) => ({ ...i, dt: null }));
    // 頻出ワード（モデル未判定の補助）
    const stop = new Set(['the', 'and', 'with', 'for', 'from', 'japan', 'authentic', 'auth', 'used', 'pre', 'owned', 'preowned', 'vintage', 'bag', 'wallet', 'women', 'womens', 'mens', 'men', 'leather', 'rare', 'good', 'excellent', 'condition', 'free', 'shipping', 'brand', 'new', 'size', 'genuine', 'italy', 'france', 'made', ...brand.n.toLowerCase().split(/\s+/), ...(brand.al || []).map((a) => a.toLowerCase())]);
    const wc = new Map();
    for (const it of items) for (const w of it.t.toLowerCase().split(/[^a-z0-9]+/)) { if (w.length < 3 || stop.has(w) || /^\d+$/.test(w)) continue; wc.set(w, (wc.get(w) || 0) + 1); }
    m.words = [...wc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
  }
  if (active) {
    const aitems = active.items.filter((i) => i.p > 0);
    const at = parseCount(active.cnt);
    m.activeN = at && at >= aitems.length ? at : aitems.length;
    m.activeMedian = median(aitems.map((i) => i.p));
    const locKnown = aitems.filter((i) => i.l).length;
    m.activeJpShare = locKnown >= 5 ? aitems.filter(isJapan).length / locKnown : null;
  }
  if (sold && active) {
    m.sellThrough = m.sold90 / (m.sold90 + m.activeN || 1);
    m.daysSupply = m.perDay > 0 ? m.activeN / m.perDay : null;
  }
  if (sold) {
    const pr = profit(m.median, catId);
    m.maxBuy = pr ? pr.maxBuy : null; m.net = pr ? pr.net : null;
    m.score = score(m);
    m.grade = grade(m.score);
    m.lowSample = m.n < state.settings.minN;
  }
  return m;
}

function score(m) {
  const w = state.settings.w;
  const parts = [];
  // 回転: 1日3件で満点（対数）
  parts.push([w.v, Math.min(1, Math.log1p(m.perDay || 0) / Math.log1p(3))]);
  if (m.sellThrough != null) parts.push([w.st, Math.min(1, m.sellThrough / 0.8)]);
  // 単価: $1,500 で満点（対数）
  parts.push([w.p, Math.min(1, Math.log1p((m.median || 0) / 50) / Math.log1p(30))]);
  if (m.jpShare != null) parts.push([w.j, m.jpShare]);
  parts.push([w.s, m.stability || 0]);
  const tw = parts.reduce((a, p) => a + p[0], 0) || 1;
  return Math.round(parts.reduce((a, p) => a + p[0] * p[1], 0) / tw * 100);
}
function grade(s) { return s >= 75 ? 'S' : s >= 60 ? 'A' : s >= 45 ? 'B' : s >= 30 ? 'C' : 'D'; }
const gradeJa = { S: '最優先', A: '有望', B: '普通', C: '慎重', D: '非推奨', N: '未計測' };

// ---------- ランキング ----------
function buildRows() {
  const fb = $('#fBrand').value, fc = $('#fCat').value, g = state.ui.group, onlyM = $('#fMeasured').checked;
  const rows = [];
  for (const b of allBrands()) {
    if (fb !== 'all' && b.id !== fb) continue;
    if (g !== 'all' && b.grp !== g) continue;
    const cats = fc === 'all' ? CATS_ALL : [catById(fc)];
    for (const c of cats) {
      if (!c) continue;
      const bench = benchCell(b, c.id);
      const m = metrics(b, c.id);
      if (!m && (c.id === 'all' || !bench)) continue;
      if (onlyM && !(m && m.sold)) continue;
      rows.push({ b, c, bench, m });
    }
  }
  return rows;
}
function sortRows(rows) {
  const key = state.ui.sort;
  const val = (r) => {
    if (key === 'star') return r.bench ? r.bench.star : -1;
    if (!r.m || !r.m.sold) return null;
    return r.m[key] ?? null;
  };
  const dir = key === 'daysSupply' ? 1 : -1; // 消化日数は少ない順
  rows.sort((a, b) => {
    const va = val(a), vb = val(b);
    const ma = a.m && a.m.sold ? 1 : 0, mb = b.m && b.m.sold ? 1 : 0;
    if (ma !== mb) return mb - ma; // 実測ありを先に
    if (va == null && vb == null) return (b.bench ? b.bench.star : 0) - (a.bench ? a.bench.star : 0) || ((b.bench ? b.bench.hi : 0) - (a.bench ? a.bench.hi : 0));
    if (va == null) return 1; if (vb == null) return -1;
    return (va - vb) * dir * (state.ui.sortDir === 1 ? -1 : 1);
  });
  return rows;
}
const RANK_COLS = [
  ['brand', 'ブランド'], ['cat', 'カテゴリ'], ['grade', '判定'], ['score', 'スコア', 1], ['sold30', '30日売れた数', 1], ['perDay', '1日あたり', 1],
  ['sellThrough', '売切率', 1], ['daysSupply', '消化日数', 1], ['median', '売れた中央値', 1], ['maxBuy', '仕入上限', 1], ['activeN', '出品中', 1], ['jpShare', 'JP比率', 1],
  ['star', '需要★'], ['band', '価格帯目安'], ['ops', ''],
];
function renderRank() {
  const rows = sortRows(buildRows());
  const thead = $('#rankTable thead');
  thead.innerHTML = '<tr>' + RANK_COLS.map(([k, l, num]) => `<th class="${num ? 'num' : ''} ${state.ui.sort === k ? 'sorted' : ''}" data-k="${k}">${l}</th>`).join('') + '</tr>';
  const tb = $('#rankTable tbody');
  const jp = state.settings.jpOnly;
  tb.innerHTML = rows.map(({ b, c, bench, m }) => {
    const has = m && m.sold;
    const g = has ? m.grade : 'N';
    const low = has && m.lowSample ? ' <span class="badge b-C" title="サンプル数が少ないため参考値">少</span>' : '';
    return `<tr class="click ${has ? '' : 'dim'}" data-b="${b.id}" data-c="${c.id}">
      <td><b>${esc(b.n)}</b><div class="muted">${esc(b.ja)}</div></td>
      <td>${esc(c.ja)}</td>
      <td><span class="badge b-${g}">${g === 'N' ? '未計測' : g + ' ' + gradeJa[g]}</span>${low}</td>
      <td class="num">${has ? m.score : '—'}</td>
      <td class="num">${has ? fmtN(m.sold30) : '—'}</td>
      <td class="num">${has ? fmtN(m.perDay, 2) : '—'}</td>
      <td class="num">${has ? fmtPct(m.sellThrough) : '—'}</td>
      <td class="num">${has && m.daysSupply != null ? fmtN(m.daysSupply) + '日' : '—'}</td>
      <td class="num">${has ? fmtUsd(m.median) : '—'}</td>
      <td class="num">${has ? fmtYen(m.maxBuy) : '—'}</td>
      <td class="num">${m && m.active ? fmtN(m.activeN) : '—'}</td>
      <td class="num">${has ? fmtPct(m.jpShare) : '—'}</td>
      <td><span class="stars">${bench ? stars(bench.star) : '—'}</span></td>
      <td class="muted">${bench ? `$${bench.lo}〜$${bench.hi}` : '—'}</td>
      <td><a href="${ebayUrl(b, c.id, 'sold', jp)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Sold</a> · <a href="${ebayUrl(b, c.id, 'active', jp)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">出品中</a></td>
    </tr>`;
  }).join('') || '<tr><td colspan="15" class="muted">該当なし</td></tr>';
  renderRankSummary(rows);
}
function renderRankSummary(rows) {
  const measured = rows.filter((r) => r.m && r.m.sold);
  const el = $('#rankSummary');
  if (!measured.length) {
    el.innerHTML = `<div class="note">まだ実測データがありません。「データ取り込み」タブで eBay の Sold を取り込むと、売れた数・回転・売れ筋モデルが表示されます。いまは内蔵の需要★と価格帯目安で並んでいます（${rows.length} 件）。</div>`;
    return;
  }
  const best = [...measured].sort((a, b) => b.m.score - a.m.score)[0];
  const fastest = measured.filter((r) => r.m.daysSupply != null).sort((a, b) => a.m.daysSupply - b.m.daysSupply)[0];
  const most = [...measured].sort((a, b) => b.m.sold30 - a.m.sold30)[0];
  const sum30 = measured.reduce((a, r) => a + (r.m.sold30 || 0), 0);
  el.innerHTML = `<div class="kpis">
    <div class="kpi"><div class="l">実測済み</div><div class="v">${measured.length}<span class="muted" style="font-size:12px"> / ${rows.length} 組</span></div><div class="s">ブランド×カテゴリ</div></div>
    <div class="kpi"><div class="l">30日の売れた数（合計）</div><div class="v">${fmtN(sum30)}</div><div class="s">表示中の実測分</div></div>
    <div class="kpi hi"><div class="l">総合スコア 1位</div><div class="v">${esc(best.b.n)}</div><div class="s">${esc(best.c.ja)} / ${best.m.score}点 ${best.m.grade}</div></div>
    <div class="kpi"><div class="l">30日で最も売れた</div><div class="v">${esc(most.b.n)}</div><div class="s">${esc(most.c.ja)} / ${fmtN(most.m.sold30)}件</div></div>
    ${fastest ? `<div class="kpi"><div class="l">回転が最も速い</div><div class="v">${esc(fastest.b.n)}</div><div class="s">${esc(fastest.c.ja)} / 消化 ${fmtN(fastest.m.daysSupply)}日</div></div>` : ''}
  </div>`;
}
function exportRankCsv() {
  const rows = sortRows(buildRows());
  const head = ['ブランド', 'カテゴリ', '判定', 'スコア', '30日売れた数', '1日あたり', '90日売れた数', '売切率', '消化日数', '中央値USD', '平均USD', 'P25', 'P75', '仕入上限円', '出品中', 'JP比率', '需要★', '目安下限', '目安上限', 'サンプル数'];
  const q = (v) => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const lines = [head.join(',')];
  for (const { b, c, bench, m } of rows) {
    const h = m && m.sold;
    lines.push([b.n, c.ja, h ? m.grade : '', h ? m.score : '', h ? m.sold30 : '', h ? m.perDay.toFixed(2) : '', h ? m.sold90 : '', h && m.sellThrough != null ? (m.sellThrough * 100).toFixed(0) : '', h && m.daysSupply != null ? m.daysSupply.toFixed(0) : '', h ? m.median : '', h ? m.avg.toFixed(0) : '', h ? m.p25 : '', h ? m.p75 : '', h ? Math.round(m.maxBuy) : '', m && m.active ? m.activeN : '', h && m.jpShare != null ? (m.jpShare * 100).toFixed(0) : '', bench ? bench.star : '', bench ? bench.lo : '', bench ? bench.hi : '', h ? m.n : ''].map(q).join(','));
  }
  download('ebay_brand_ranking_' + today() + '.csv', '﻿' + lines.join('\r\n'), 'text/csv');
}
function download(name, content, type) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const today = () => new Date().toISOString().slice(0, 10);

// ---------- 詳細 ----------
function renderDetail() {
  const b = brandById($('#dBrand').value), cid = $('#dCat').value, c = catById(cid);
  if (!b || !c) return;
  const jp = state.settings.jpOnly;
  $('#dLinks').innerHTML = `<a href="${ebayUrl(b, cid, 'sold', jp)}" target="_blank" rel="noopener">eBay Sold（日本セラー）</a><a href="${ebayUrl(b, cid, 'sold', false)}" target="_blank" rel="noopener">Sold（全セラー）</a><a href="${ebayUrl(b, cid, 'active', jp)}" target="_blank" rel="noopener">出品中（日本セラー）</a><a href="${ebayUrl(b, cid, 'active', false)}" target="_blank" rel="noopener">出品中（全セラー）</a>`;
  const bench = benchCell(b, cid);
  const m = metrics(b, cid);
  const body = $('#detailBody');
  let html = '';
  html += `<div class="card"><h2>${esc(b.n)} <span class="muted">${esc(b.ja)}</span> × ${esc(c.ja)}</h2>
    <div class="row">${bench ? `<span class="badge b-gold">内蔵の目安 需要 ${stars(bench.star)}　$${bench.lo}〜$${bench.hi}</span>` : ''}${m && m.sold ? `<span class="badge b-${m.grade}">${m.grade} ${gradeJa[m.grade]} / ${m.score}点</span>` : '<span class="badge b-N">未計測</span>'}</div>
    ${b.note ? `<p class="note" style="margin-top:10px">${esc(b.note)}</p>` : ''}</div>`;

  if (!m || !m.sold) {
    html += `<div class="card"><div class="warnbox">このブランド×カテゴリの Sold データがまだありません。<br>
      <a href="${ebayUrl(b, cid, 'sold', jp)}" target="_blank" rel="noopener">eBay の Sold ページを開く</a> → ブックマークレットを実行 → 「データ取り込み」タブに貼り付けてください。</div>
      <h3>仕入先で探す（${esc(b.ja)}）</h3><div class="links">${sourceLinks(b.ja + (c.id !== 'all' ? ' ' + c.ja.split('/')[0].replace(/（.*）/, '') : ''))}</div></div>`;
    body.innerHTML = html; return;
  }
  const pr = profit(m.median, cid);
  const s = state.settings;
  html += `<div class="card"><h2>売れ行きと回転 <span class="muted">（Sold 取込 ${m.n} 件 / 日付判定 ${m.datedN} 件 / eBay 表示 ${fmtN(m.total)} 件 / ${m.oldest ? fmtDate(m.oldest) + '〜' + fmtDate(m.newest) + ' の ' + m.span + ' 日間' : '日付なし'}）</span></h2>
    ${m.lowSample ? `<div class="warnbox" style="margin-bottom:8px">サンプル数が ${m.n} 件と少ないため参考値です（設定の最低サンプル数: ${s.minN}）。</div>` : ''}
    <div class="kpis">
      <div class="kpi hi"><div class="l">30日の売れた数</div><div class="v">${fmtN(m.sold30)}</div><div class="s">1日あたり ${fmtN(m.perDay, 2)} 件</div></div>
      <div class="kpi"><div class="l">90日の売れた数</div><div class="v">${fmtN(m.sold90)}</div><div class="s">${esc(m.sold90Src || '')}</div></div>
      <div class="kpi"><div class="l">売切率</div><div class="v">${fmtPct(m.sellThrough)}</div><div class="s">${m.active ? `出品中 ${fmtN(m.activeN)} 件` : '出品中データ未取込'}</div></div>
      <div class="kpi"><div class="l">在庫消化日数</div><div class="v">${m.daysSupply != null ? fmtN(m.daysSupply) + '日' : '—'}</div><div class="s">出品中 ÷ 1日あたり</div></div>
      <div class="kpi"><div class="l">売れた中央値</div><div class="v">${fmtUsd(m.median)}</div><div class="s">平均 ${fmtUsd(m.avg)} / 中心帯 ${fmtUsd(m.p25)}〜${fmtUsd(m.p75)}</div></div>
      <div class="kpi"><div class="l">出品中の中央値</div><div class="v">${fmtUsd(m.activeMedian)}</div><div class="s">${m.activeMedian && m.median ? (m.activeMedian > m.median * 1.15 ? '出品価格が売れた価格より高め＝値付け注意' : '売れた価格と近い') : ''}</div></div>
      <div class="kpi"><div class="l">日本セラー比率</div><div class="v">${fmtPct(m.jpShare)}</div><div class="s">売れた商品の発送元が Japan</div></div>
      <div class="kpi"><div class="l">新品の割合</div><div class="v">${fmtPct(m.newShare)}</div><div class="s">残りは中古</div></div>
      <div class="kpi"><div class="l">価格の安定度</div><div class="v">${Math.round(m.stability * 100)}</div><div class="s">100 に近いほど価格がばらつかない</div></div>
    </div></div>`;

  html += `<div class="card"><h2>利益と仕入上限（売れた中央値 ${fmtUsd(m.median)} で計算）</h2>
    <div class="kpis">
      <div class="kpi"><div class="l">売上（円換算）</div><div class="v">${fmtYen(pr.rev)}</div><div class="s">1USD=${s.rate}円</div></div>
      <div class="kpi"><div class="l">手数料</div><div class="v">${fmtYen(-pr.fees)}</div><div class="s">eBay ${s.feePct}% + その他 ${s.otherPct}%</div></div>
      <div class="kpi"><div class="l">関税</div><div class="v">${fmtYen(-pr.tariff)}</div><div class="s">${s.tariffMode === 'seller' ? `セラー負担 ${s.tariffPct}%` : 'バイヤー負担'}</div></div>
      <div class="kpi"><div class="l">送料＋梱包</div><div class="v">${fmtYen(-(pr.ship + s.pack))}</div><div class="s">${esc(c.ja)} の設定値</div></div>
      <div class="kpi"><div class="l">手取り（仕入前）</div><div class="v">${fmtYen(pr.net)}</div><div class="s">売上 − 費用</div></div>
      <div class="kpi hi"><div class="l">仕入上限</div><div class="v">${fmtYen(pr.maxBuy)}</div><div class="s">目標利益率 ${s.margin}% を確保できる上限</div></div>
    </div>
    <p class="muted" style="margin-top:8px">中心帯の下限 ${fmtUsd(m.p25)} で売れた場合の仕入上限は ${fmtYen(profit(m.p25, cid).maxBuy)}、上限 ${fmtUsd(m.p75)} なら ${fmtYen(profit(m.p75, cid).maxBuy)}。</p>
    <h3>仕入先で探す</h3><div class="links">${sourceLinks(b.ja + (c.id !== 'all' ? ' ' + c.ja.split('/')[0].replace(/（.*）/, '') : ''))}</div></div>`;

  // 価格帯分布
  const maxBand = Math.max(...m.bands.map((x) => x.n), 1);
  html += `<div class="card"><h2>売れた価格帯の分布</h2><div class="bars">${m.bands.map((x) => `<div class="bar"><span>${x.hi === Infinity ? `$${x.lo}〜` : `$${x.lo}〜$${x.hi}`}</span><div class="track"><div class="fill" style="width:${(x.n / maxBand * 100).toFixed(1)}%"></div></div><span class="n">${x.n}件 (${Math.round(x.n / m.n * 100)}%)</span></div>`).join('')}</div></div>`;

  // モデル
  const models = m.models.slice(0, 40);
  html += `<div class="card"><h2>売れ筋モデル <span class="muted">（タイトルから自動判定・モデル未判定 ${m.unmatched} 件）</span></h2>
    <p class="muted">固有のモデル名（Matelasse・Cambon など）を優先して判定し、固有名がないものは「（種類）」＝財布の形などで集計しています。</p>
    <div class="tbl-wrap"><table><thead><tr><th>モデル</th><th class="num">売れた数</th><th class="num">シェア</th><th class="num">30日換算</th><th class="num">中央値</th><th class="num">仕入上限</th><th>仕入先</th><th>eBay</th></tr></thead><tbody>
    ${models.map((x) => {
      const p = profit(x.median, cid);
      const q = `${b.kw} ${x.name}`;
      return `<tr><td><b>${esc(x.name)}</b>${GENERIC.has(x.name) ? ' <span class="muted">（種類）</span>' : ''}</td><td class="num">${x.n}</td><td class="num">${Math.round(x.share * 100)}%</td><td class="num">${x.perDay != null ? fmtN(x.perDay * 30, 1) : '—'}</td><td class="num">${fmtUsd(x.median)}</td><td class="num"><b>${fmtYen(p.maxBuy)}</b></td>
        <td class="links">${SOURCES.slice(0, 4).map((s2) => `<a href="${s2.u.replace('{q}', enc(b.ja + ' ' + x.name))}" target="_blank" rel="noopener">${esc(s2.n)}</a>`).join('')}</td>
        <td><a href="https://www.ebay.com/sch/i.html?_nkw=${enc(q)}&LH_Sold=1&LH_Complete=1&_sop=13${jp ? '&LH_SALBN=1&_salic=104' : ''}" target="_blank" rel="noopener">Sold</a></td></tr>`;
    }).join('') || '<tr><td colspan="8" class="muted">モデル名を判定できませんでした（下の頻出ワードを参考にしてください）</td></tr>'}
    </tbody></table></div>
    <div class="grid2" style="margin-top:12px">
      <div><h3>ライン・素材</h3><div class="tagcloud">${m.lines.slice(0, 20).map((x) => `<span><b>${esc(x.name)}</b> ${x.n}件 / ${fmtUsd(x.median)}</span>`).join('') || '<span class="muted">—</span>'}</div></div>
      <div><h3>色</h3><div class="tagcloud">${m.colors.slice(0, 15).map((x) => `<span><b>${esc(x.name)}</b> ${x.n}件 / ${fmtUsd(x.median)}</span>`).join('') || '<span class="muted">—</span>'}</div>
        <h3>サイズ表記</h3><div class="tagcloud">${m.sizes.slice(0, 15).map((x) => `<span><b>${esc(x.name)}</b> ${x.n}件 / ${fmtUsd(x.median)}</span>`).join('') || '<span class="muted">—</span>'}</div></div>
    </div>
    <h3>頻出ワード</h3><div class="tagcloud">${m.words.map(([w, n]) => `<span>${esc(w)} <b>${n}</b></span>`).join('')}</div></div>`;

  // 直近
  html += `<div class="card"><h2>直近で売れた商品（最新 ${m.recent.length} 件）</h2><div class="tbl-wrap"><table><thead><tr><th>売れた日</th><th class="num">価格</th><th>状態</th><th>発送元</th><th>モデル</th><th>タイトル</th></tr></thead><tbody>
    ${m.recent.map((i) => `<tr><td>${i.dt ? fmtDate(i.dt) : esc(i.d || '—')}</td><td class="num">${fmtUsd(i.p)}</td><td>${condOf(i) === 'new' ? '新品' : '中古'}</td><td>${esc(i.l || '—')}</td><td>${esc(primaryModel(i.t, b) || '—')}</td><td style="white-space:normal;min-width:260px">${esc(i.t)}</td></tr>`).join('')}
    </tbody></table></div></div>`;
  body.innerHTML = html;
}
const fmtDate = (d) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

// ---------- ブックマークレット ----------
// eBay の検索結果ページで実行。Sold なら最大5ページ・出品中なら2ページを同一オリジン fetch で集めて JSON をコピーする。
async function BM_EBAY() {
  const TX = (x) => (x && (x.innerText || x.textContent) || '').trim();
  const S = (el, ss) => { for (const s of ss) { const x = el.querySelector(s); const t = TX(x); if (t) return t; } return ''; };
  const parse = (doc) => {
    const out = [];
    const cards = doc.querySelectorAll('li.s-item, li.s-card, ul.srp-results > li, .srp-results .s-item__wrapper');
    for (const li of cards) {
      const txt = TX(li).replace(/\s+/g, ' ');
      const t = S(li, ['.s-item__title', '.s-card__title', '[role=heading]', 'h3']);
      if (!t || /^Shop on eBay/i.test(t) || /^New Listing$/i.test(t)) continue;
      const ptxt = S(li, ['.s-item__price', '.s-card__price', '[class*=price]']);
      const NUM = '([\\d,]+(?:\\.\\d{1,2})?)';
      let cur = 'USD';
      // 優先順: 「US $」表記（円表示時の approx.）→ 「$」→ 他通貨（JPY/EUR/GBP/CAD/AUD）
      let m = ptxt.match(new RegExp('US\\s?\\$\\s?' + NUM)) || txt.match(new RegExp('(?:approx(?:imately)?\\.?\\s*)US\\s?\\$\\s?' + NUM, 'i'));
      if (!m) { m = ptxt.match(new RegExp('(?<![A-Z])\\$\\s?' + NUM)); if (m && /\bC\s?\$/.test(ptxt)) cur = 'CAD'; if (m && /\bAU?\s?\$/.test(ptxt)) cur = 'AUD'; }
      if (!m) { m = ptxt.match(new RegExp('(?:JPY|¥|￥)\\s?' + NUM)) || txt.match(new RegExp('(?:JPY|¥|￥)\\s?' + NUM)); if (m) cur = 'JPY'; }
      if (!m) { m = ptxt.match(new RegExp('(?:EUR|€)\\s?' + NUM)); if (m) cur = 'EUR'; }
      if (!m) { m = ptxt.match(new RegExp('(?:GBP|£)\\s?' + NUM)); if (m) cur = 'GBP'; }
      if (!m) { m = ptxt.match(new RegExp('C\\s?\\$\\s?' + NUM)); if (m) cur = 'CAD'; }
      if (!m) { m = ptxt.match(new RegExp('AU?\\s?\\$\\s?' + NUM)); if (m) cur = 'AUD'; }
      if (!m) { m = ptxt.match(new RegExp(NUM)); if (m && /円/.test(ptxt)) cur = 'JPY'; }
      if (!m) continue;
      let raw = m[1];
      if (/,\d{2}$/.test(raw)) raw = raw.replace(/\./g, '').replace(',', '.'); // 210,00 / 1.250,00（欧州表記）
      m = [m[0], raw.replace(/,/g, '')];
      const dm = txt.match(/Sold\s+(?:on\s+)?([A-Z][a-z]{2}\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4})/);
      const cm = txt.match(/(Brand New|New with tags|New without tags|New \(Other\)|Open box|Pre-Owned|Pre Owned|Certified Refurbished|Parts only|For parts)/i);
      const lm = txt.match(/(?:from|Located in|Ships from)\s+([A-Z][a-z]+(?: (?:States|Kingdom|Zealand|Kong|Korea|Africa|Arabia|Republic|Emirates|Rico|Rica|Lanka|Zealand))?)/);
      const sm = txt.match(/(Free (?:international )?(?:shipping|delivery)|\+\s?\$\s?[\d,.]+ (?:delivery|shipping))/i);
      out.push({ t: t.replace(/Opens in a new window or tab/gi, '').replace(/^(New Listing|Sponsored)/i, '').replace(/\s+/g, ' ').trim(), p: parseFloat(m[1]), cur, d: dm ? dm[1] : '', c: cm ? cm[1] : '', l: lm ? lm[1].trim() : '', s: sm ? sm[1] : '' });
    }
    return out;
  };
  const u = new URL(location.href);
  const sold = u.searchParams.get('LH_Sold') === '1';
  const cnt = S(document, ['.srp-controls__count-heading', '[class*=count-heading]', '.result-count__count-heading', '.srp-controls__count']);
  const q = u.searchParams.get('_nkw') || (document.querySelector('#gh-ac') || {}).value || '';
  const seen = new Set(); const items = [];
  const add = (arr) => { let n = 0; for (const it of arr) { const k = it.t + '|' + it.p + '|' + it.d; if (seen.has(k)) continue; seen.add(k); items.push(it); n++; } return n; };
  add(parse(document));
  let pages = 1;
  const maxPages = sold ? 5 : 2;
  const cur = parseInt(u.searchParams.get('_pgn') || '1', 10);
  if (items.length >= 40) {
    for (let pg = cur + 1; pg < cur + maxPages; pg++) {
      try {
        u.searchParams.set('_pgn', String(pg)); u.searchParams.set('_ipg', '240');
        const r = await fetch(u.toString(), { credentials: 'include' });
        if (!r.ok) break;
        const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
        const got = parse(doc); const n = add(got); pages++;
        if (got.length < 40 || n === 0) break;
        await new Promise((res) => setTimeout(res, 700));
      } catch (e) { break; }
    }
  }
  const out = JSON.stringify({ site: 'ebay', mode: sold ? 'sold' : 'active', q, cnt, url: location.href, at: new Date().toISOString(), pages, items });
  const msg = 'eBay ' + (sold ? 'Sold' : '出品中') + ' ' + items.length + '件（' + pages + 'ページ）を集めました。';
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483647;background:#1f2a44;color:#fff;padding:12px 14px;border-radius:10px;font:13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.35);width:320px';
  box.innerHTML = '<div style="font-weight:700;margin-bottom:6px">' + msg + '</div><div id="ebrmsg" style="margin-bottom:8px">クリップボードにコピー中…</div><textarea style="width:100%;height:60px;font-size:10px" readonly></textarea><div style="margin-top:8px;display:flex;gap:6px"><button id="ebrcopy" style="flex:1;padding:6px;border:0;border-radius:6px;background:#d9b866;font-weight:700;cursor:pointer">コピー</button><button id="ebrclose" style="padding:6px 10px;border:0;border-radius:6px;cursor:pointer">閉じる</button></div>';
  document.body.appendChild(box);
  const ta = box.querySelector('textarea'); ta.value = out;
  const ok = () => { box.querySelector('#ebrmsg').textContent = 'コピーしました。リサーチツールの「データ取り込み」に貼り付けてください。'; };
  const ng = () => { box.querySelector('#ebrmsg').textContent = '自動コピーできませんでした。「コピー」ボタンを押してください。'; };
  box.querySelector('#ebrcopy').onclick = () => { ta.select(); try { document.execCommand('copy'); } catch (e) {} if (navigator.clipboard) navigator.clipboard.writeText(out).then(ok, ng); else ok(); };
  box.querySelector('#ebrclose').onclick = () => box.remove();
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).then(ok, ng); else ng();
}
function bookmarkletHref() { return 'javascript:' + encodeURIComponent('(' + BM_EBAY.toString() + ')();'); }

// ---------- 取り込み ----------
function guessBrand(text) {
  const t = (text || '').toLowerCase();
  let best = null;
  for (const b of allBrands()) {
    const names = [b.kw, b.n, b.ja, ...(b.al || [])].filter(Boolean);
    for (const n of names) {
      const nl = n.toLowerCase();
      if (nl.length < 2) continue;
      if (t.includes(nl) && (!best || nl.length > best.len)) best = { id: b.id, len: nl.length };
    }
  }
  return best ? best.id : '';
}
const CAT_HINTS = [
  ['shoulder', /shoulder|crossbody|cross body/i], ['tote', /\btote/i], ['backpack', /backpack|rucksack/i], ['wallet', /wallet|purse(?!.*coin)/i],
  ['small', /pouch|card case|card holder|coin|key case|key holder|cosmetic/i], ['acc', /charm|keyring|key ring|key chain|keychain/i], ['belt', /\bbelt(?! bag)/i],
  ['scarf', /scarf|stole|shawl|muffler/i], ['shoes', /shoes|sneaker|loafer|pumps|boots|sandal|heel/i], ['apparel', /jacket|coat|shirt|dress|sweater|cardigan|hoodie|pants|skirt|tee/i],
  ['watch', /\bwatch/i], ['jewelry', /necklace|\bring\b|bracelet|earring|pendant|bangle|brooch/i], ['sunglasses', /sunglass|eyeglass/i], ['bag', /handbag|\bbag\b/i],
];
function guessCat(q) { for (const [id, rx] of CAT_HINTS) if (rx.test(q || '')) return id; return 'all'; }

let pending = null;
function parsePaste() {
  const raw = $('#iPaste').value.trim();
  if (!raw) return toast('貼り付け欄が空です');
  let d;
  try { d = JSON.parse(raw); } catch (e) { return showPreview(`<div class="warnbox">JSON として読めませんでした。ブックマークレットでコピーした内容をそのまま貼り付けてください。</div>`); }
  if (!d || !Array.isArray(d.items)) return showPreview(`<div class="warnbox">items がありません。</div>`);
  const items = d.items.filter((i) => i && typeof i.p === 'number' && i.t).map((i) => normalizeItem({ t: String(i.t).slice(0, 200), p: i.p, cur: i.cur || 'USD', d: i.d || '', c: i.c || '', l: i.l || '', s: i.s || '' }));
  const mode = d.mode || (/LH_Sold=1/.test(d.url || '') ? 'sold' : 'active');
  const curs = [...new Set(items.map((i) => i.cur))].filter((c) => c !== 'USD');
  pending = { src: 'ebay', mode, q: d.q || '', cnt: d.cnt || '', url: d.url || '', at: d.at || new Date().toISOString(), pages: d.pages || 1, items, curs };
  showConfirm();
}
// 通貨換算: p は常に USD。他通貨で取れた場合は pr に元の金額を残す
const FX_DEFAULT = { EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.52 }; // 1USD あたり
function usdPerUnit(cur) {
  if (cur === 'JPY') return 1 / state.settings.rate;
  const fx = (state.settings.fx || {})[cur] || FX_DEFAULT[cur];
  return fx ? 1 / fx : 1;
}
function normalizeItem(i) {
  if (!i.cur || i.cur === 'USD') return i;
  return { ...i, pr: i.p, p: Math.round(i.p * usdPerUnit(i.cur) * 100) / 100 };
}
function convertDatasetJpy(id) {
  const ds = state.datasets.find((d) => d.id === id);
  if (!ds) return;
  if (!confirm('この取り込みの価格を「円で取り込まれたもの」とみなし、現在の為替（1USD=' + state.settings.rate + '円）でドルに換算します。よろしいですか？')) return;
  ds.items = ds.items.map((i) => ({ ...i, cur: 'JPY', pr: i.pr ?? i.p, p: Math.round((i.pr ?? i.p) / state.settings.rate * 100) / 100 }));
  ds.curs = ['JPY'];
  save(); refreshAll(); toast('換算しました');
}
function showPreview(html) { $('#iPreview').innerHTML = html; }
function showConfirm() {
  const p = pending;
  const titles = p.items.slice(0, 80).map((i) => i.t).join(' ');
  const gb = guessBrand(p.q) || guessBrand(titles);
  const gc = guessCat(p.q) !== 'all' ? guessCat(p.q) : guessCat(titles.slice(0, 2000));
  const dated = p.items.filter((i) => parseDate(i.d)).length;
  showPreview(`<div class="okbox">解析OK：<b>${p.mode === 'sold' ? 'Sold（売れた商品）' : '出品中'}</b> ${p.items.length} 件（日付あり ${dated} 件）／ 検索語「${esc(p.q)}」／ eBay 表示件数「${esc(p.cnt || '—')}」／ ${p.pages} ページ</div>
    <div class="row" style="margin-top:8px">
      <label>ブランド<select id="cBrand">${brandOptions(gb, true)}</select></label>
      <label>カテゴリ<select id="cCat">${CATS_ALL.map((c) => `<option value="${c.id}" ${c.id === gc ? 'selected' : ''}>${esc(c.ja)}</option>`).join('')}</select></label>
      <label>種別<select id="cMode"><option value="sold" ${p.mode === 'sold' ? 'selected' : ''}>Sold（売れた商品）</option><option value="active" ${p.mode === 'active' ? 'selected' : ''}>出品中</option></select></label>
      <label id="cNewWrap" class="${gb ? 'hidden' : ''}">新しいブランド名（英語）<input type="text" id="cNewBrand" placeholder="例: Marni"></label>
      <button class="btn gold" id="cSave" style="margin-top:14px">この内容で保存</button>
    </div>
    <p class="muted" style="margin-top:6px">${p.curs && p.curs.length ? `通貨 ${p.curs.join('/')} 表示だったため、1USD=${state.settings.rate}円（他通貨は設定の為替）でドルに換算しました。 ` : ''}${p.mode === 'sold' && dated < p.items.length * 0.5 ? '⚠ 売れた日が取れていない行が多いため、1日あたりの計算は eBay 表示件数÷90日で代用します。' : ''}</p>`);
  $('#cBrand').onchange = () => $('#cNewWrap').classList.toggle('hidden', $('#cBrand').value !== '__new');
  $('#cSave').onclick = () => {
    let bid = $('#cBrand').value;
    if (bid === '__new') {
      const name = $('#cNewBrand').value.trim();
      if (!name) return toast('ブランド名を入力してください');
      bid = 'cx_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      if (!brandById(bid)) state.customBrands.push({ id: bid, n: name, ja: name, kw: name, al: [], grp: 'custom', note: '', c: {}, models: [], lines: [] });
    }
    const ds = { id: 'ds_' + Date.now().toString(36), brand: bid, cat: $('#cCat').value, mode: $('#cMode').value, ...pending };
    state.datasets.push(ds);
    save();
    pending = null; $('#iPaste').value = ''; showPreview('');
    toast('保存しました');
    refreshAll();
    $('#dBrand').value = ds.brand; $('#dCat').value = ds.cat; renderDetail();
  };
}
function brandOptions(sel, withNew) {
  const groups = ['lux', 'affordable', 'jewelry', 'jp', 'custom'];
  let h = '<option value="">（選択）</option>';
  for (const g of groups) {
    const bs = allBrands().filter((b) => b.grp === g);
    if (!bs.length) continue;
    h += `<optgroup label="${GROUP_JA[g]}">` + bs.map((b) => `<option value="${b.id}" ${b.id === sel ? 'selected' : ''}>${esc(b.n)}（${esc(b.ja)}）</option>`).join('') + '</optgroup>';
  }
  if (withNew) h += '<option value="__new">＋ 新しいブランドを追加</option>';
  return h;
}

// CSV（Terapeak 等）
function parseCsv(text) {
  const rows = []; let row = [], cell = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false; } else cell += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}
function importCsv(file) {
  const rd = new FileReader();
  rd.onload = () => {
    const rows = parseCsv(String(rd.result).replace(/^﻿/, ''));
    if (rows.length < 2) return showPreview('<div class="warnbox">CSV に行がありません。</div>');
    const head = rows[0].map((h) => h.toLowerCase());
    const find = (rx) => head.findIndex((h) => rx.test(h));
    const iT = find(/title|item name|商品名|listing/), iP = find(/sold price|sale price|avg.*price|price|価格|金額/), iD = find(/date|日付|sold on|end/), iQ = find(/quantity|qty|数量|sold/), iC = find(/condition|状態/), iL = find(/location|country|所在|from/);
    if (iT < 0 || iP < 0) return showPreview(`<div class="warnbox">タイトル列と価格列を見つけられませんでした。ヘッダー: ${esc(rows[0].join(' | '))}</div>`);
    const items = [];
    for (const r of rows.slice(1)) {
      const p = parseFloat(String(r[iP] || '').replace(/[^0-9.]/g, ''));
      if (!r[iT] || !(p > 0)) continue;
      const qty = iQ >= 0 && iQ !== iP ? Math.max(1, parseInt(r[iQ], 10) || 1) : 1;
      for (let k = 0; k < Math.min(qty, 50); k++) items.push({ t: r[iT].slice(0, 200), p, d: iD >= 0 ? r[iD] : '', c: iC >= 0 ? r[iC] : '', l: iL >= 0 ? r[iL] : '', s: '' });
    }
    pending = { src: 'csv', mode: 'sold', q: file.name, cnt: String(items.length), url: '', at: new Date().toISOString(), pages: 1, items };
    showConfirm();
  };
  rd.readAsText(file, 'utf-8');
}

function renderDatasets() {
  const tb = $('#dsTable tbody');
  const list = [...state.datasets].sort((a, b) => (a.at < b.at ? 1 : -1));
  tb.innerHTML = list.map((d) => {
    const b = brandById(d.brand), c = catById(d.cat);
    const curs = d.curs && d.curs.length ? d.curs.join('/') + '→USD' : (d.items.some((i) => i.cur && i.cur !== 'USD') ? '換算済' : 'USD');
    const med = median(d.items.map((i) => i.p));
    const suspicious = !d.curs?.length && !d.items.some((i) => i.cur && i.cur !== 'USD') && med > 3000;
    return `<tr><td>${esc(d.at.replace('T', ' ').slice(0, 16))}</td><td>${esc(b ? b.n : d.brand)}</td><td>${esc(c ? c.ja : d.cat)}</td><td><span class="badge ${d.mode === 'sold' ? 'b-A' : 'b-B'}">${d.mode === 'sold' ? 'Sold' : '出品中'}</span></td><td class="muted">${esc(d.q)}</td><td class="num">${d.items.length}</td><td class="num">${esc(d.cnt || '—')}</td><td>${d.pages || 1}</td>
      <td>${esc(curs)}${suspicious ? ` <span class="badge b-C" title="中央値 $${Math.round(med)}。円の数字をドルとして取り込んだ可能性">要確認</span>` : ''}</td>
      <td><button class="btn ghost sm" data-jpy="${d.id}" title="円で取り込まれていた場合にドルへ換算">円→$換算</button> <button class="btn danger sm" data-del="${d.id}">削除</button></td></tr>`;
  }).join('') || '<tr><td colspan="10" class="muted">まだありません</td></tr>';
  $$('button[data-del]', tb).forEach((btn) => btn.onclick = () => { if (!confirm('このデータを削除しますか？')) return; state.datasets = state.datasets.filter((d) => d.id !== btn.dataset.del); save(); refreshAll(); });
  $$('button[data-jpy]', tb).forEach((btn) => btn.onclick = () => convertDatasetJpy(btn.dataset.jpy));
}
function renderQueue() {
  // 実測がまだない、需要★の高い組み合わせを提案
  const done = new Set(state.datasets.filter((d) => d.mode === 'sold').map((d) => d.brand + '|' + d.cat));
  const cands = [];
  for (const b of BRANDS) for (const c of CATS) { const v = b.c[c.id]; if (v && v[0] >= 4 && !done.has(b.id + '|' + c.id)) cands.push({ b, c, star: v[0], hi: v[2] }); }
  cands.sort((a, b) => b.star - a.star || b.hi - a.hi);
  const jp = state.settings.jpOnly;
  $('#iQueue').innerHTML = cands.length ? `<h3>まだ計測していない有望な組み合わせ（需要★4以上）</h3><div class="links">${cands.slice(0, 24).map((x) => `<a href="${ebayUrl(x.b, x.c.id, 'sold', jp)}" target="_blank" rel="noopener" title="Sold を開く">${esc(x.b.n)} × ${esc(x.c.ja.split('/')[0].replace(/（.*）/, ''))} ${stars(x.star).slice(0, x.star)}</a>`).join('')}</div>` : '';
}

// ---------- 設定 ----------
function renderSettings() {
  const s = state.settings;
  $('#sRate').value = s.rate; $('#sFee').value = s.feePct; $('#sOther').value = s.otherPct; $('#sTariff').value = s.tariffPct; $('#sTariffMode').value = s.tariffMode;
  $('#sMargin').value = s.margin; $('#sPack').value = s.pack; $('#sMinN').value = s.minN;
  $('#wV').value = s.w.v; $('#wST').value = s.w.st; $('#wP').value = s.w.p; $('#wJ').value = s.w.j; $('#wS').value = s.w.s;
  $('#sShip').innerHTML = CATS_ALL.map((c) => `<label>${esc(c.ja)}<input type="number" step="100" data-ship="${c.id}" value="${s.ship[c.id] ?? c.ship}"></label>`).join('');
}
function readSettings() {
  const s = state.settings;
  const num = (id, d) => { const v = parseFloat($(id).value); return isFinite(v) ? v : d; };
  s.rate = num('#sRate', 150); s.feePct = num('#sFee', 15); s.otherPct = num('#sOther', 3); s.tariffPct = num('#sTariff', 15); s.tariffMode = $('#sTariffMode').value;
  s.margin = num('#sMargin', 20); s.pack = num('#sPack', 200); s.minN = num('#sMinN', 8);
  s.w = { v: num('#wV', 35), st: num('#wST', 25), p: num('#wP', 15), j: num('#wJ', 15), s: num('#wS', 10) };
  $$('#sShip input').forEach((i) => { s.ship[i.dataset.ship] = parseFloat(i.value) || 0; });
  s.jpOnly = $('#iJpOnly').checked;
  save();
}
async function fetchRate() {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const d = await r.json();
    if (d && d.rates && d.rates.JPY) {
      $('#sRate').value = Math.round(d.rates.JPY * 100) / 100;
      state.settings.fx = { EUR: d.rates.EUR, GBP: d.rates.GBP, CAD: d.rates.CAD, AUD: d.rates.AUD };
      toast('為替を取得しました: 1USD=' + $('#sRate').value + '円');
    }
    else throw new Error('no JPY');
  } catch (e) { toast('為替の取得に失敗しました。手入力してください。'); }
}

// ---------- 初期化 ----------
function fillSelects() {
  const catOpts = (sel, all) => (all ? `<option value="all">すべてのカテゴリ</option>` : '') + CATS_ALL.map((c) => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.ja)}</option>`).join('');
  $('#fBrand').innerHTML = '<option value="all">すべてのブランド</option>' + brandOptions('', false).replace('<option value="">（選択）</option>', '');
  $('#fCat').innerHTML = catOpts('', true).replace('<option value="all" >', '<option value="all">');
  // ランキングの「すべて」はカテゴリ全体、詳細・取込は個別カテゴリ（all = ブランド全体）
  $('#dBrand').innerHTML = brandOptions('lv', false).replace('<option value="">（選択）</option>', '');
  $('#dCat').innerHTML = CATS_ALL.map((c) => `<option value="${c.id}" ${c.id === 'bag' ? 'selected' : ''}>${esc(c.ja)}</option>`).join('');
  $('#iBrand').innerHTML = brandOptions('lv', false).replace('<option value="">（選択）</option>', '');
  $('#iCat').innerHTML = CATS_ALL.map((c) => `<option value="${c.id}" ${c.id === 'bag' ? 'selected' : ''}>${esc(c.ja)}</option>`).join('');
}
function refreshAll() { fillSelectsKeep(); renderRank(); renderDatasets(); renderQueue(); }
function fillSelectsKeep() {
  const keep = ['#fBrand', '#fCat', '#dBrand', '#dCat', '#iBrand', '#iCat'].map((id) => [id, $(id).value]);
  fillSelects();
  for (const [id, v] of keep) if (v && $(id).querySelector(`option[value="${v}"]`)) $(id).value = v;
}
function showTab(id) {
  $$('nav.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
  $$('.pane').forEach((p) => p.classList.toggle('active', p.id === 'pane-' + id));
  if (id === 'detail') renderDetail();
  if (id === 'rank') renderRank();
  window.scrollTo({ top: 0 });
}

function init() {
  load();
  fillSelects();
  renderSettings();
  $('#iJpOnly').checked = state.settings.jpOnly;
  $('#fSort').value = state.ui.sort;
  $$('#fGroups .chip').forEach((c) => c.classList.toggle('on', c.dataset.g === state.ui.group));
  $('#bmEbay').href = bookmarkletHref();
  $('#bmEbay').onclick = (e) => { e.preventDefault(); toast('このボタンをブックマークバーへドラッグしてください'); };

  $$('nav.tabs button').forEach((b) => b.onclick = () => showTab(b.dataset.tab));
  $('#btnGoImport').onclick = () => showTab('import');
  $('#btnExportRank').onclick = exportRankCsv;
  ['#fBrand', '#fCat', '#fMeasured'].forEach((id) => $(id).onchange = renderRank);
  $('#fSort').onchange = () => { state.ui.sort = $('#fSort').value; state.ui.sortDir = -1; save(); renderRank(); };
  $$('#fGroups .chip').forEach((c) => c.onclick = () => { state.ui.group = c.dataset.g; $$('#fGroups .chip').forEach((x) => x.classList.toggle('on', x === c)); save(); renderRank(); });
  $('#rankTable').addEventListener('click', (e) => {
    const th = e.target.closest('th');
    if (th && th.dataset.k) {
      const k = th.dataset.k;
      const sortable = ['score', 'sold30', 'perDay', 'sellThrough', 'daysSupply', 'median', 'maxBuy', 'star'];
      if (sortable.includes(k)) { if (state.ui.sort === k) state.ui.sortDir *= -1; else { state.ui.sort = k; state.ui.sortDir = -1; } $('#fSort').value = k; save(); renderRank(); }
      return;
    }
    const tr = e.target.closest('tr[data-b]');
    if (!tr) return;
    $('#dBrand').value = tr.dataset.b; $('#dCat').value = tr.dataset.c; showTab('detail');
  });
  $('#dBrand').onchange = renderDetail; $('#dCat').onchange = renderDetail;
  $('#iOpenSold').onclick = () => { readSettings(); window.open(ebayUrl(brandById($('#iBrand').value), $('#iCat').value, 'sold', $('#iJpOnly').checked), '_blank'); };
  $('#iOpenActive').onclick = () => { readSettings(); window.open(ebayUrl(brandById($('#iBrand').value), $('#iCat').value, 'active', $('#iJpOnly').checked), '_blank'); };
  $('#iJpOnly').onchange = () => { state.settings.jpOnly = $('#iJpOnly').checked; save(); renderQueue(); };
  $('#iParse').onclick = parsePaste;
  $('#iPaste').addEventListener('paste', () => setTimeout(parsePaste, 50));
  $('#iCsv').onchange = (e) => { if (e.target.files[0]) importCsv(e.target.files[0]); e.target.value = ''; };
  $('#iBackup').onclick = () => download('ebay_brand_research_backup_' + today() + '.json', JSON.stringify({ datasets: state.datasets, customBrands: state.customBrands, settings: state.settings }), 'application/json');
  $('#iRestore').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { const d = JSON.parse(rd.result); if (!Array.isArray(d.datasets)) throw 0; const ids = new Set(state.datasets.map((x) => x.id)); for (const ds of d.datasets) if (!ids.has(ds.id)) state.datasets.push(ds); for (const cb of d.customBrands || []) if (!brandById(cb.id)) state.customBrands.push(cb); save(); refreshAll(); toast('復元しました（追加マージ）'); } catch { toast('バックアップファイルを読めませんでした'); } };
    rd.readAsText(f); e.target.value = '';
  };
  $('#sSave').onclick = () => { readSettings(); toast('設定を保存しました'); renderRank(); };
  $('#sReset').onclick = () => { state.settings = { ...structuredClone(DEFAULT_SETTINGS), jpOnly: state.settings.jpOnly }; renderSettings(); save(); toast('初期値に戻しました'); renderRank(); };
  $('#sRateFetch').onclick = fetchRate;
  $('#sWipe').onclick = () => { if (confirm('取り込んだ実測データをすべて削除します。よろしいですか？')) { state.datasets = []; save(); refreshAll(); toast('削除しました'); } };

  refreshAll();
}
document.addEventListener('DOMContentLoaded', init);
