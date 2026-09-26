/* ============================================================
   cards.js: registro de tarjetas
   Para agregar, quitar o mover una tarjeta basta con editar esta lista.
   Campos: id, span (columnas de 12), zone ("pre" = antes de los indicadores),
   title, desc, tools (botones del encabezado), body (HTML inicial),
   visible(ctx), setup(card) una vez, render(ctx, card) en cada cambio.
   ============================================================ */

const seg = (attr, label, opts, current) =>
  `<div class="seg" role="group" aria-label="${label}">${opts.map(([v,t]) =>
    `<button data-${attr}="${v}" aria-pressed="${v === current}">${t}</button>`).join("")}</div>`;
function bindSeg(card, attr, key){
  $$(`[data-${attr}]`, card).forEach(b => b.addEventListener("click", () => {
    UI[key] = b.dataset[attr];
    $$(`[data-${attr}]`, card).forEach(x => x.setAttribute("aria-pressed", x === b));
    renderCard(card.dataset.card);
  }));
}
const pick = (card, s) => card.querySelector(s);
const PEND = "Pendiente de datos";
const bienesPend = r => r.esp === "Bienes" && DB.montoHolder.get(r.pid) === r.iid && !DB.bienesByPid.get(r.pid);
const filterAndRefresh = (dim, key) => { toggleFilter(dim, key); refresh(); };

const CARDS = [
  /* ---------- Aviso de datos faltantes ---------- */
  { id:"warn", zone:"pre", cls:"warn",
    title:`Faltan datos en el archivo <span class="warn-n"></span>`,
    desc:"El tablero cargó lo que encontró, pero estas hojas o columnas no están. Las partes indicadas se muestran en cero o como «Sin dato».",
    tools:`<button class="btn small" data-act="hide">Ocultar aviso</button>`,
    body:`<div class="tbl-wrap" style="max-height:300px"></div>`,
    visible: ctx => ctx.issues.length > 0 && !UI.warnHidden,
    setup(card){ pick(card,"[data-act=hide]").addEventListener("click", () => { UI.warnHidden = true; card.hidden = true; }); },
    render(ctx, card){
      const multi = DB.files.length > 1;
      pick(card,".warn-n").textContent = `(${ctx.issues.length})`;
      pick(card,".tbl-wrap").innerHTML = `<table><thead><tr><th>Impacto</th><th>Hoja</th><th>Falta</th><th>Qué se afecta</th></tr></thead><tbody>
        ${ctx.issues.map(i => `<tr><td><span class="sev ${i.sev}">${SEV_LABEL[i.sev]}</span></td>
          <td>${esc(i.sheet)}${multi ? `<div class="file">${esc(i.file)}</div>` : ""}</td><td>${esc(i.what)}</td><td>${esc(i.fx)}</td></tr>`).join("")}
      </tbody></table>`;
    } },

  /* ---------- Incidencia por alcaldía ---------- */
  { id:"alc", span:8, title:"Incidencia por alcaldía",
    desc:"Intervenciones según la alcaldía del juzgado. Se muestran las 16 alcaldías, incluidas las que no tienen registros.",
    tools: seg("sort", "Orden de las alcaldías", [["code","Por clave"],["val","Por total"]], "code"),
    body:`<div class="vchart"></div><p class="note" hidden></p>`,
    setup: card => bindSeg(card, "sort", "alcSort"),
    render(ctx, card){
      const counts = countBy(ctx.except.alc, i => i.code), sel = F.sel.alc;
      const items = ALCALDIAS.map(([c,n]) => ({key:c, label:c, title:n, value:counts.get(c) || 0, selected:sel.has(c)}));
      for (const [c,v] of counts) if (!ALC_NAME[c]) items.push({key:c, label:c || "—", title:c || "Sin juzgado", value:v, selected:sel.has(c)});
      if (UI.alcSort === "val") items.sort((a,b) => b.value - a.value || a.key.localeCompare(b.key));
      const chart = pick(card,".vchart");
      vbars(chart, items, {label:"Intervenciones por alcaldía", unit:"intervenciones", showZero:true,
        rotate: chart.clientWidth < 520, onClick: d => filterAndRefresh("alc", d.key)});

      const cruz = ctx.cur.filter(i => i.otraAlcaldia), note = pick(card,".note");
      note.hidden = !cruz.length;
      if (cruz.length){
        const ex = [...countBy(cruz, i => `${i.code} atendió en ${ALC_NAME[i.lugarCode] || i.lugarA}`)].sort((a,b) => b[1] - a[1]);
        note.textContent = `${cruz.length === 1 ? "1 intervención ocurrió" : `${cruz.length} intervenciones ocurrieron`} en una alcaldía distinta a la del juzgado. `
          + `${ex.length > 1 ? "Casos más frecuentes" : "Caso"}: ${ex.slice(0,2).map(([k,v]) => `${k} (${v})`).join("; ")}.`;
      }
    } },

  /* ---------- Tipo de procedimiento ---------- */
  { id:"cat", span:4, title:"Incidencia por tipo de Procedimiento",
    desc:"Procedimientos según su tipo en la hoja Procedimientos.",
    body:`<div class="hbars"></div>`,
    render(ctx, card){
      const {counts, total: tot} = procByType(ctx.except.cat);
      hbars(pick(card,".hbars"), [...counts.keys()].sort(procSort).map(k =>
        ({key:k, label:k, value:counts.get(k), note:pct(counts.get(k), tot) + "%", selected:F.sel.cat.has(k)})),
        {onClick: d => filterAndRefresh("cat", d.key)});
    } },

  /* ---------- Matriz tipo de intervención × tipo de procedimiento ---------- */
  { id:"mx", span:6, title:"Especialidad de intervención por tipo de Procedimiento",
    desc:"Conteo de intervenciones, como la tabla dinámica del informe diario.",
    body:`<div class="scroll"></div>`,
    render(ctx, card){
      const el = pick(card,".scroll"), cur = ctx.cur;
      const rowKey = i => i.intT.label, colKey = i => i.procT.label;
      const rows = [...new Set(cur.map(rowKey))].sort(intSort);
      const cols = [...new Set(cur.map(colKey))].sort(procSort);
      if (!rows.length){ el.innerHTML = EMPTY; return; }
      const m = countBy(cur, i => rowKey(i) + "¦" + colKey(i)), max = Math.max(1, ...m.values());
      const cell = v => `<td class="cell" style="background:${v ? `color-mix(in srgb, var(--amber) ${Math.round((.12 + .7*v/max)*100)}%, transparent)` : "transparent"};color:${v ? "var(--ink)" : "var(--ink-3)"}">${v || "·"}</td>`;
      el.innerHTML = `<table class="matrix"><thead><tr><th>Tipo de intervención</th>${cols.map(c => `<th class="r">${esc(c)}</th>`).join("")}<th class="r">Total</th></tr></thead><tbody>
        ${rows.map(r => { const vals = cols.map(c => m.get(r + "¦" + c) || 0);
          return `<tr><td>${esc(r)}</td>${vals.map(cell).join("")}<td class="r tot">${sumBy(vals, v => v)}</td></tr>`; }).join("")}
        <tr class="tot"><td>Total</td>${cols.map(c => `<td class="cell">${sumBy(rows, r => m.get(r + "¦" + c) || 0)}</td>`).join("")}<td class="r">${cur.length}</td></tr>
      </tbody></table>`;
    } },

  /* ---------- Personas atendidas ---------- */
  { id:"ppl", span:6, title:"Personas atendidas",
    desc:"Conductores registrados en la hoja Vehículos para los procedimientos filtrados.",
    body:`<div class="people"></div>`,
    render(ctx, card){
      const {veh, pids, mas, fem} = ctx, n = veh.length, otros = n - mas - fem;
      const seg = (v, c) => v ? `<span style="width:${pct(v,n)}%;background:${c}">${v}</span>` : "";
      const el = pick(card,".people");
      el.innerHTML = `
        <div class="pbig">${fmtN(n)}<small>personas en ${fmtN(pids.size)} procedimientos</small></div>
        <div class="gsplit">
          <div class="split" role="img" aria-label="${mas} masculinos, ${fem} femeninas">${seg(mas,"var(--slate)")}${seg(fem,"var(--amber)")}${seg(otros,"var(--ink-3)")}</div>
          <div class="legend"><span style="--c:var(--slate)">Masculino ${pct(mas,n)}%</span><span style="--c:var(--amber)">Femenino ${pct(fem,n)}%</span></div>
        </div>
        <div style="grid-column:1/-1">
          <p class="desc" style="margin:0 0 6px">Procedimientos según el número de personas involucradas</p>
          <div class="hbars"></div>
        </div>`;
      const dist = countBy([...pids], p => DB.vehByPid.get(p) || 0);
      hbars(pick(el,".hbars"), [...dist.keys()].sort((a,b) => a - b).map(k => ({
        label: k === 0 ? "Sin registro" : (k === 1 ? "1 persona" : `${k} personas`),
        value: dist.get(k), note: pct(dist.get(k), pids.size) + "%"})));
    } },

  /* ---------- Por día (solo con hoja Registro) ---------- */
  { id:"day", span:12, title:"Intervenciones por día",
    desc:"Fecha asignada a cada folio con la hoja Registro. La línea marca el promedio diario.",
    body:`<div class="vchart"></div>`,
    visible: () => DB.hasDates,
    render(ctx, card){
      const withDate = ctx.cur.filter(i => i.fecha);
      const byDay = countBy(withDate, i => isoDate(i.fecha));
      const items = [...byDay.keys()].sort().map(k => { const d = new Date(k + "T00:00:00Z");
        return {key:k, label:`${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`, title:fmtDate(d), value:byDay.get(k),
          selected: F.dMin === k && F.dMax === k}; });
      const chart = pick(card,".vchart");
      vbars(chart, items, {label:"Intervenciones por día", unit:"intervenciones", height:220,
        avg: items.length ? withDate.length / items.length : 0,
        labelEvery: Math.max(1, Math.ceil(items.length / ((chart.clientWidth || 800) / 48))),
        onClick: d => { setDateRange(F.dMin === d.key && F.dMax === d.key ? null : d.key); refresh(); }});
    } },

  /* ---------- Detalle de bienes ---------- */
  { id:"bt", span:6, title:"Detalle de bienes", desc:"",
    body:`<p class="bsum"></p><div class="tbl-wrap"></div>`,
    render(ctx, card){
      const {bienes, totBien: tot, owners} = ctx;
      pick(card,".desc").textContent = bienes.length
        ? `${fmtM(tot)} en ${bienes.length} objetos de ${new Set(bienes.map(b => b.pid)).size} procedimientos.`
        : "Sin bienes valuados en la selección.";
      const sum = pick(card,".bsum");
      sum.hidden = !bienes.length;
      sum.innerHTML = owners.map(([k,v]) => `${esc(k)} <b>${fmtM0(v)}</b> (${pct(v,tot)}%)`).join(", ") + ".";
      const rows = [...bienes].sort((a,b) => b.monto - a.monto);
      pick(card,".tbl-wrap").innerHTML = rows.length
        ? `<table><thead><tr><th>Juzgado</th><th>Objeto</th><th>Propietario</th><th class="r">Monto</th></tr></thead><tbody>
          ${rows.map(b => `<tr><td>${esc(b.juzgado)}</td><td>${esc(sentence(b.desc))}${b.cant > 1 ? ` <span class="tag">×${b.cant}</span>` : ""}</td><td>${esc(b.prop)}</td><td class="r num">${fmtM(b.monto)}</td></tr>`).join("")}
          <tr><td colspan="3"><b>Total</b></td><td class="r num"><b>${fmtM(tot)}</b></td></tr></tbody></table>`
        : `<p class="empty" style="padding:14px">Sin bienes.</p>`;
    } },

  /* ---------- Juzgados ---------- */
  { id:"jz", span:6, title:"Juzgados con más intervenciones",
    desc:"Los 12 con mayor carga en la selección actual.",
    body:`<div class="hbars"></div>`,
    render(ctx, card){
      const counts = [...countBy(ctx.except.jz, i => i.juzgado)].filter(([k]) => k)
        .sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0,12);
      hbars(pick(card,".hbars"), counts.map(([k,v]) => ({key:k, label:`${k}  ${ALC_NAME[codeOfJuzgado(k)] || ""}`, value:v, selected:F.sel.jz.has(k)})),
        {onClick: d => filterAndRefresh("jz", d.key)});
    } },

  /* ---------- Colonias ---------- */
  { id:"col", span:12, title:"Colonias con más intervenciones",
    desc:"Lugar del hecho. Marca las que se repiten para detectar puntos de concentración.",
    tools: seg("col", "Colonias a mostrar", [["rep","Repetidas"],["all","Todas"]], "rep"),
    body:`<div class="tbl-wrap"></div>`,
    setup: card => bindSeg(card, "col", "colMode"),
    render(ctx, card){
      const g = new Map();
      for (const i of ctx.except.col){
        if (!i.colKey) continue;
        const o = g.get(i.colKey) || {k:i.colKey, col:i.colonia, alc:i.lugarA, n:0, p:new Set()};
        o.n++; o.p.add(i.pid); g.set(i.colKey, o);
      }
      let list = [...g.values()].sort((a,b) => b.n - a.n || a.col.localeCompare(b.col,"es"));
      if (UI.colMode === "rep") list = list.filter(o => o.n > 1);
      const max = Math.max(1, ...list.map(o => o.n)), el = pick(card,".tbl-wrap");
      if (!list.length){ el.innerHTML = `<p class="empty" style="padding:14px">Ninguna colonia se repite en la selección. Cambia a «Todas» para ver el listado completo.</p>`; return; }
      el.innerHTML = `<table><thead><tr><th>Alcaldía</th><th>Colonia</th><th class="r">Procedimientos</th><th>Intervenciones</th></tr></thead><tbody>
        ${list.map(o => { const on = F.sel.col.has(o.k);
          return `<tr data-k="${esc(o.k)}" style="cursor:pointer;${on ? "background:var(--guinda-soft)" : ""}" title="Filtrar por esta colonia">
            <td>${esc(o.alc)}</td><td>${esc(o.col)}</td><td class="r num">${o.p.size}</td>
            <td><span class="inbar" style="width:${o.n/max*90}px;${on ? "background:var(--guinda)" : ""}"></span><span class="num">${o.n}</span></td></tr>`; }).join("")}
      </tbody></table>`;
      $$("tr[data-k]", el).forEach(tr => tr.addEventListener("click", () => { setOnly("col", tr.dataset.k); refresh(); }));
    } },

  /* ---------- Tabla de intervenciones ---------- */
  { id:"det", span:12, title:"Intervenciones",
    desc:"Registro completo de la selección. Ordena con los encabezados y descarga lo que ves.",
    body:`<div class="toolbar">
        <input type="search" placeholder="Filtrar esta tabla…" aria-label="Filtrar tabla de intervenciones">
        <button class="btn" data-act="csv">Descargar CSV</button>
      </div>
      <div class="tbl-wrap" style="max-height:560px"></div>
      <div class="pager"></div>`,
    columns: [
      {k:"folio", l:"Folio", num:true},
      {k:"fecha", l:"Fecha", num:true, when: () => DB.hasDates, html: r => fmtDate(r.fecha), csv: r => isoDate(r.fecha), sort: r => r.fecha ? +r.fecha : 0},
      {k:"pid", l:"Proc.", num:true},
      {k:"proc", l:"Tipo de procedimiento", get: r => r.procT.label, html: r => pill(r.procT)},
      {k:"interv", l:"Tipo de intervención", get: r => r.intT.label, html: r => pill(r.intT)},
      {k:"juzgado", l:"Juzgado"},
      {k:"lugarA", l:"Alcaldía del hecho", html: r => esc(r.lugarA) + (r.otraAlcaldia ? `<span class="flag" title="Distinta a la alcaldía del juzgado">otra alcaldía</span>` : "")},
      {k:"colonia", l:"Colonia"},
      {k:"personas", l:"Personas", num:true, get: r => DB.vehByPid.get(r.pid) || 0},
      // Una valuación de bienes sin monto en la hoja Bienes se marca como pendiente
      {k:"monto", l:"Bienes", num:true, get: r => DB.montoHolder.get(r.pid) === r.iid ? (DB.bienesByPid.get(r.pid) || 0) : 0,
        html: r => r._monto ? fmtM0(r._monto) : bienesPend(r) ? `<span class="pend">${PEND}</span>` : "",
        csv: r => r._monto || (bienesPend(r) ? PEND : "")}
    ],
    setup(card){
      let t;
      pick(card,".toolbar input").addEventListener("input", e => { clearTimeout(t);
        t = setTimeout(() => { UI.tq = norm(e.target.value); UI.page = 0; renderCard("det"); }, 180); });
      pick(card,"[data-act=csv]").addEventListener("click", () => {
        const cols = this.cols, q = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
        const lines = [cols.map(c => q(c.l)).join(",")].concat(this.rows.map(r => cols.map(c => q(c.csv ? c.csv(r) : r["_" + c.k] ?? r[c.k])).join(",")));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\r\n")], {type:"text/csv;charset=utf-8"}));
        a.download = "intervenciones_filtradas.csv"; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      });
    },
    render(ctx, card){
      const cols = this.cols = this.columns.filter(c => !c.when || c.when());
      let rows = ctx.cur.map(r => { const o = {...r}; cols.forEach(c => { if (c.get) o["_" + c.k] = c.get(r); }); return o; });
      const val = (c, r) => c.sort ? c.sort(r) : (c.get ? r["_" + c.k] : r[c.k]);
      if (UI.tq) rows = rows.filter(r => norm(cols.map(c => c.csv ? c.csv(r) : val(c, r)).join(" ")).includes(UI.tq));
      const sc = cols.find(c => c.k === UI.sortKey) || cols[0], dir = UI.sortDir;
      rows.sort((a,b) => { const x = val(sc,a), y = val(sc,b);
        return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y),"es")) * dir || a.folio - b.folio; });
      this.rows = rows;

      const PS = 50, pages = Math.max(1, Math.ceil(rows.length / PS));
      UI.page = Math.min(UI.page, pages - 1);
      const view = rows.slice(UI.page * PS, (UI.page + 1) * PS);
      const cellHtml = (c, r) => c.html ? c.html(r) : esc(c.get ? r["_" + c.k] : r[c.k]);
      pick(card,".tbl-wrap").innerHTML = `<table><thead><tr>${cols.map(c =>
        `<th class="sortable${c.num ? " r" : ""}" data-k="${c.k}" tabindex="0" aria-sort="${UI.sortKey === c.k ? (dir > 0 ? "ascending" : "descending") : "none"}">${c.l}</th>`).join("")}</tr></thead>
        <tbody>${view.map(r => `<tr>${cols.map(c => `<td class="${c.num ? "r num" : ""}">${cellHtml(c, r)}</td>`).join("")}</tr>`).join("")
          || `<tr><td colspan="${cols.length}" class="empty">Sin intervenciones que coincidan.</td></tr>`}</tbody></table>`;
      $$("th.sortable", card).forEach(th => {
        const go = () => { UI.sortDir = UI.sortKey === th.dataset.k ? -UI.sortDir : 1; UI.sortKey = th.dataset.k; renderCard("det"); };
        th.addEventListener("click", go);
        th.addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); go(); } });
      });

      const pager = pick(card,".pager");
      pager.innerHTML = `<span>${rows.length ? `${UI.page*PS + 1} a ${Math.min(rows.length, (UI.page+1)*PS)} de ${fmtN(rows.length)}` : "0 registros"}</span>
        <button class="btn small" data-p="-1" ${UI.page ? "" : "disabled"}>Anterior</button>
        <button class="btn small" data-p="1" ${UI.page < pages - 1 ? "" : "disabled"}>Siguiente</button>`;
      $$("[data-p]", pager).forEach(b => b.addEventListener("click", () => { UI.page += +b.dataset.p; renderCard("det"); }));
    } },

  /* ---------- Resumen para el informe ---------- */
  { id:"sum", span:12, title:"Resumen para el informe",
    desc:"Texto con las cifras de la selección, listo para pegar en el guion o el informe de peritos.",
    tools:`<button class="btn small" data-act="copy">Copiar resumen</button>`,
    body:`<pre class="summary"></pre>`,
    setup(card){
      const btn = pick(card,"[data-act=copy]"), pre = pick(card,".summary");
      btn.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(pre.textContent); }
        catch { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); s.removeAllRanges(); }
        btn.textContent = "Resumen copiado"; setTimeout(() => btn.textContent = "Copiar resumen", 1600);
      });
    },
    render(ctx, card){
      const {cur, pids, veh, mas, fem, bienes, totBien, owners} = ctx;
      const cats = procByType(cur).counts;
      const topA = [...countBy(cur, i => i.code)].filter(([c]) => ALC_NAME[c]).sort((a,b) => b[1] - a[1]).slice(0,3).map(([c,v]) => `${ALC_NAME[c]} (${v})`);
      const cols = [...countBy(cur.filter(i => i.colonia), i => `${i.colonia}, ${i.lugarA}`)].filter(([,v]) => v > 1).sort((a,b) => b[1] - a[1]).slice(0,3);
      const gob = owners.find(([k]) => norm(k) === "gobierno")?.[1] || 0;
      const lines = [
        `Procedimientos de daño culposo por tránsito de vehículos: ${pids.size}, con ${cur.length} intervenciones periciales.`,
        `Por tipo de procedimiento: ${[...cats.keys()].sort(procSort).map(k => `${k} ${cats.get(k)}`).join(", ")}.`,
        `Personas atendidas: ${veh.length} (${mas} masculinos y ${fem} femeninas).`,
        `Bienes valuados: ${fmtM(totBien)}${bienes.length ? `, de los cuales ${fmtM(gob)} corresponden a infraestructura del Gobierno de la Ciudad de México` : ""}.`
      ];
      if (topA.length) lines.push(`Alcaldías con mayor incidencia: ${topA.join(", ")}.`);
      if (cols.length) lines.push(`Colonias con más intervenciones: ${cols.map(([k,v]) => `${k} (${v})`).join("; ")}.`);
      pick(card,".summary").textContent = lines.join("\n");
    } }
];
