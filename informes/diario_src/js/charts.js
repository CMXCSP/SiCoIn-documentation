/* ============================================================
   charts.js: gráficas reutilizables (sin librerías externas)
   Cada item: {key, label, value, title?, note?, selected?, color?}
   ============================================================ */

const EMPTY = `<p class="empty">Sin datos para la selección.</p>`;

/* ---------- Tooltip ---------- */
const tip = $("#tip");
function showTip(html, x, y){
  tip.innerHTML = html; tip.style.opacity = 1;
  const r = tip.getBoundingClientRect();
  let L = x + 14, T = y - r.height - 10;
  if (L + r.width > innerWidth - 8) L = x - r.width - 14;
  if (T < 8) T = y + 16;
  tip.style.left = L + "px"; tip.style.top = T + "px";
}
const hideTip = () => tip.style.opacity = 0;

/* ---------- Barras verticales (SVG). o: {label, unit, height, rotate, showZero, labelEvery, avg, onClick} ---------- */
function vbars(el, items, o = {}){
  if (!items.length){ el.innerHTML = EMPTY; return; }
  const W = Math.max(300, el.clientWidth || 600), H = o.height || 240;
  const m = {t:22, r:6, b: o.rotate ? 44 : 28, l:6};
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = Math.max(1, ...items.map(d => d.value));
  const step = iw / items.length, bw = Math.max(2, Math.min(46, step * .68));
  const anySel = items.some(d => d.selected), showVals = step >= 14, base = m.t + ih;
  const click = !!o.onClick;

  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}">
    <line x1="${m.l}" x2="${W - m.r}" y1="${base}" y2="${base}" stroke="var(--rule)"/>`;
  items.forEach((d, k) => {
    const x = m.l + step*k + (step - bw)/2, h = d.value / max * ih, y = base - h, cx = x + bw/2;
    const fill = d.selected ? "var(--guinda)" : (d.value ? "var(--amber)" : "var(--rule)");
    const op = anySel && !d.selected ? .35 : 1;
    s += `<g class="bar" data-k="${k}" tabindex="${click ? 0 : -1}" role="${click ? "button" : "img"}" aria-pressed="${!!d.selected}" aria-label="${esc(d.title || d.label)}: ${d.value}">
      <rect class="hit" x="${m.l + step*k}" y="${m.t}" width="${step}" height="${ih}"/>
      <rect class="v" x="${x}" y="${d.value ? y : base - 2}" width="${bw}" height="${d.value ? Math.max(h,1) : 2}" rx="2" fill="${fill}" opacity="${op}"/>`;
    if (showVals && (d.value || o.showZero))
      s += `<text x="${cx}" y="${y - 6}" text-anchor="middle" font-size="12" font-weight="600" opacity="${op}">${d.value}</text>`;
    if (!o.labelEvery || k % o.labelEvery === 0)
      s += o.rotate
        ? `<text x="${cx}" y="${base + 12}" font-size="11" text-anchor="end" transform="rotate(-40 ${cx} ${base + 12})">${esc(d.label)}</text>`
        : `<text x="${cx}" y="${base + 17}" text-anchor="middle" font-size="12" font-weight="${d.selected ? 700 : 400}">${esc(d.label)}</text>`;
    s += `</g>`;
  });
  if (o.avg){
    const y = base - o.avg / max * ih;
    s += `<line x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}" stroke="var(--guinda)" stroke-dasharray="4 4" stroke-width="1.5"/>
      <text x="${W - m.r}" y="${y - 5}" text-anchor="end" font-size="12" style="fill:var(--guinda)">Promedio ${o.avg.toFixed(1)}</text>`;
  }
  el.innerHTML = s + `</svg>`;

  $$(".bar", el).forEach(g => {
    const d = items[+g.dataset.k];
    g.addEventListener("mousemove", e => showTip(`<b>${d.value}</b> ${esc(o.unit || "")}<br>${esc(d.title || d.label)}`, e.clientX, e.clientY));
    g.addEventListener("mouseleave", hideTip);
    if (click){
      g.addEventListener("click", () => o.onClick(d));
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); o.onClick(d); } });
    }
  });
}

/* ---------- Barras horizontales (HTML). o: {money, onClick} ---------- */
function hbars(el, items, o = {}){
  if (!items.length){ el.innerHTML = EMPTY; return; }
  const max = Math.max(1, ...items.map(d => d.value));
  el.classList.toggle("dimmed", items.some(d => d.selected));
  el.innerHTML = items.map((d, k) => `
    <button class="hbar${o.onClick ? "" : " static"}" data-k="${k}" aria-pressed="${!!d.selected}" ${o.onClick ? "" : "tabindex=-1"} title="${esc(d.title || d.label)}">
      <span class="lab">${esc(d.label)}</span>
      <span class="track"><span class="fill" style="width:${d.value / max * 100}%${d.color ? `;background:${d.color}` : ""}"></span></span>
      <span class="val">${o.money ? fmtM0(d.value) : fmtN(d.value)}${d.note ? `<small>${esc(d.note)}</small>` : ""}</span>
    </button>`).join("");
  if (o.onClick) $$(".hbar", el).forEach(b => b.addEventListener("click", () => o.onClick(items[+b.dataset.k])));
}

/* ---------- Pastel (devuelve HTML). parts: [[nombre, valor], ...] ordenados ---------- */
function pie(parts, total, ariaLabel){
  const R = 38, C = 38;
  let a0 = -Math.PI/2, paths = "";
  parts.forEach(([k, v], i) => {
    const col = OWN_COLS[i % OWN_COLS.length], frac = v / total;
    const title = `<title>${esc(k)}: ${fmtM(v)} (${pct(v,total)}%)</title>`;
    if (frac >= .9999){ paths += `<circle cx="${C}" cy="${C}" r="${R}" fill="${col}">${title}</circle>`; return; }
    if (frac <= 0) return;
    const a1 = a0 + frac * 2 * Math.PI;
    const p = a => `${(C + R*Math.cos(a)).toFixed(2)},${(C + R*Math.sin(a)).toFixed(2)}`;
    paths += `<path d="M${C},${C} L${p(a0)} A${R},${R} 0 ${frac > .5 ? 1 : 0} 1 ${p(a1)} Z" fill="${col}">${title}</path>`;
    a0 = a1;
  });
  return `<div class="pie-wrap"><svg viewBox="0 0 76 76" role="img" aria-label="${esc(ariaLabel)}">${paths}</svg>
    <ul class="pie-leg">${parts.map(([k, v], i) => `<li><i style="background:${OWN_COLS[i % OWN_COLS.length]}"></i><span title="${esc(k)}">${esc(k)}</span><b>${fmtM0(v)}<em>${pct(v,total)}%</em></b></li>`).join("")}</ul></div>`;
}
