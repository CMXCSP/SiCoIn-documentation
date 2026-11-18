/* ============================================================
   app.js: construcción de tarjetas, render general y eventos
   ============================================================ */

let CTX = null;                    // última selección calculada
const CARD = {};                   // id → {def, el}
const collapsed = new Set(store.get("tablero.contraidos", []));
const isOn = () => $("#app").classList.contains("on");
const isMobile = () => matchMedia("(max-width:820px)").matches;

/* ---------- Tarjetas ---------- */
const CHEVRON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
function buildCards(){
  for (const def of CARDS){
    const el = document.createElement("section");
    el.className = `card${def.span ? " s" + def.span : ""}${def.cls ? " " + def.cls : ""}`;
    el.dataset.card = def.id;
    el.setAttribute("aria-labelledby", "h-" + def.id);
    el.innerHTML = `<header>
        <div><h3 id="h-${def.id}"><button type="button" class="cbtn" aria-controls="b-${def.id}">${CHEVRON}<span>${def.title}</span></button></h3>
          <p class="desc">${def.desc || ""}</p></div>
        ${def.tools ? `<div class="tools">${def.tools}</div>` : ""}
      </header>
      <div class="card-body" id="b-${def.id}">${def.body}</div>`;
    $(def.zone === "pre" ? "#zonePre" : "#zoneGrid").appendChild(el);
    CARD[def.id] = {def, el};
    pick(el, ".cbtn").addEventListener("click", () => setCollapsed(def.id, !el.classList.contains("collapsed")));
    setCollapsed(def.id, collapsed.has("h-" + def.id), true);
    if (def.setup) def.setup(el);
  }
}
function setCollapsed(id, value, silent){
  const {el} = CARD[id];
  el.classList.toggle("collapsed", value);
  pick(el, ".cbtn").setAttribute("aria-expanded", !value);
  value ? collapsed.add("h-" + id) : collapsed.delete("h-" + id);
  store.set("tablero.contraidos", [...collapsed]);
  if (!value && !silent && CTX) renderCard(id);   // las gráficas se miden al abrirse
}
function renderCard(id){
  const {def, el} = CARD[id];
  const show = !def.visible || def.visible(CTX);
  el.hidden = !show;
  if (show && !el.classList.contains("collapsed")) def.render(CTX, el);   // las contraídas no se dibujan
}

/* ---------- Render general ---------- */
function refresh(){
  CTX = compute();
  renderMeta(); renderChips(); renderRail(); renderKpis(CTX);
  CARDS.forEach(d => renderCard(d.id));
}

function renderMeta(){
  const folios = DB.all.map(i => i.folio).filter(Boolean);
  const years = [...new Set([...DB.proc.values()].map(p => p.anio).filter(Boolean))].sort();
  const fechas = DB.all.map(i => i.fecha).filter(Boolean).sort((a,b) => a - b);
  let t = folios.length ? `Folios ${Math.min(...folios)} a ${Math.max(...folios)}` : "Sin folios";
  if (years.length) t += ` de ${years.join(" y ")}`;
  if (fechas.length){ const a = fmtDate(fechas[0]), b = fmtDate(fechas.at(-1)); t += a === b ? `, registrados el ${a}` : `, del ${a} al ${b}`; }
  $("#meta").textContent = `${t}. Fuente: ${DB.files.map(f => f.name).join(", ")}.`;
}

function renderKpis(ctx){
  const {cur, pids, veh, mas, fem, bienes, totBien, owners} = ctx;
  const otros = veh.length - mas - fem;
  const multi = [...countBy(cur, i => i.pid).values()].filter(n => n > 1).length;
  const alcN = new Set(cur.map(i => i.code).filter(c => ALC_NAME[c])).size;
  const conCol = cur.filter(i => i.colKey);
  const colN = new Set(conCol.map(i => i.colKey)).size;
  const kpi = (label, value, foot, cls = "") => `<div class="kpi ${cls}"><div class="label">${label}</div><div class="value">${value}</div><div class="foot">${foot}</div></div>`;
  const bienesHtml = !bienes.length || !totBien
    ? `<div class="foot" style="margin-top:8px">${bienes.length ? `${bienes.length} objetos sin monto registrado` : "Sin bienes valuados en la selección"}</div>`
    : pie(owners, totBien, "Monto valuado por propietario: " + owners.map(([k,v]) => `${k} ${fmtM0(v)}`).join(", "));
  $("#kpis").innerHTML =
    kpi("Procedimientos", fmtN(pids.size), `${fmtN(multi)} con más de una intervención`) +
    kpi("Intervenciones periciales", fmtN(cur.length), `${pids.size ? (cur.length / pids.size).toFixed(2) : "0"} por procedimiento en promedio`) +
    `<div class="kpi"><div class="label">Personas atendidas</div><div class="value">${fmtN(veh.length)}</div>
      <div class="split" aria-hidden="true"><span style="width:${pct(mas,veh.length)}%;background:var(--slate)"></span><span style="width:${pct(fem,veh.length)}%;background:var(--amber)"></span></div>
      <div class="foot">${fmtN(mas)} masculinos y ${fmtN(fem)} femeninas${otros ? `, ${otros} sin dato` : ""}</div></div>` +
    `<div class="kpi bienes"><div class="label">Bienes valuados <span class="num">${fmtM0(totBien)}</span></div>${bienesHtml}</div>` +
    kpi("Alcaldías con incidencia", `${alcN} <span style="font-size:18px;color:var(--ink-3);font-weight:400">de 16</span>`, `${fmtN(new Set(cur.map(i => i.juzgado)).size)} juzgados involucrados`) +
    kpi("Colonias distintas", fmtN(colN), conCol.length ? `${pct(conCol.length - colN, conCol.length)}% de las intervenciones repiten colonia` : "Sin datos de colonia", "colonias");
}

function renderChips(){
  const list = activeFilters(), el = $("#chips");
  el.innerHTML = list.map((f,i) => `<button class="chip" data-i="${i}" aria-label="Quitar filtro ${esc(f.label)}: ${esc(f.value)}">${esc(f.label)}: <b>${esc(f.value)}</b><i aria-hidden="true">×</i></button>`).join("");
  $$(".chip", el).forEach(b => b.addEventListener("click", () => { list[+b.dataset.i].clear(); UI.page = 0; refresh(); }));
  const badge = $("#railBadge");
  badge.hidden = !list.length; badge.textContent = list.length;
  $("#railOpen").setAttribute("aria-label", list.length ? `Mostrar panel de filtros, ${list.length} activos` : "Mostrar panel de filtros");
}

function renderRail(){
  const counts = {cat: F.sel.cat.size, alc: F.sel.alc.size, esp: F.sel.esp.size,
    fol: (F.folMin !== null) + (F.folMax !== null), fecha: !!F.dMin + !!F.dMax};
  $$(".fgroup").forEach(d => pick(d, ".cnt").textContent = counts[d.dataset.g] || "");

  const options = {
    cat: () => [...new Set(DB.all.map(i => i.cat))].sort(catSort).map(k => [k, k]),
    alc: () => ALCALDIAS,
    esp: () => [...new Set(DB.all.map(i => i.esp))].sort().map(k => [k, k])
  };
  for (const box of $$(".checks[data-dim]")){
    const dim = box.dataset.dim, withCode = dim === "alc", sel = F.sel[dim];
    const n = countBy(CTX.except[dim], DIMS[dim].of);
    box.innerHTML = options[dim]().map(([k, label]) => { const c = n.get(k) || 0;
      return `<label class="check${withCode ? "" : " nocode"}${c ? "" : " zero"}"><input type="checkbox" value="${esc(k)}" ${sel.has(k) ? "checked" : ""}>${withCode ? `<span class="code">${esc(k)}</span>` : ""}<span>${esc(label)}</span><span class="n">${c}</span></label>`; }).join("");
    $$("input", box).forEach(inp => inp.addEventListener("change", () => { toggleFilter(dim, inp.value); refresh(); }));
  }
}

function setDateRange(min, max = min){
  F.dMin = min; F.dMax = max;
  $("#dMin").value = min || ""; $("#dMax").value = max || "";
}

/* ---------- Panel lateral ---------- */
function setRail(closed){
  $("#app").classList.toggle("railclosed", closed);
  $("#railCollapse").setAttribute("aria-expanded", !closed);
  $("#railOpen").setAttribute("aria-expanded", !closed);
  store.set("tablero.panelOculto", closed);
  if (CTX) refresh();
}

/* ---------- Carga de archivos ---------- */
async function openFiles(files, append){
  const err = $("#err"); err.style.display = "none";
  try {
    await loadFiles(files, append);
    UI.warnHidden = false;
    $("#drop").style.display = "none";
    $("#app").classList.add("on");
    ["#addBtn","#newBtn","#railToggle"].forEach(s => $(s).hidden = false);
    $("#dateBox").hidden = !DB.hasDates;
    refresh();
  } catch (e){
    console.error(e);
    const msg = e.message || "No se pudo leer el archivo. Verifica que sea un .xlsx válido.";
    if (isOn()) alert(msg); else { err.textContent = msg; err.style.display = "block"; }
  }
}

/* ---------- Eventos ---------- */
function bindEvents(){
  const input = $("#fileInput"); let append = false;
  const pickFiles = mode => { append = mode; input.click(); };
  input.addEventListener("change", () => { if (input.files.length) openFiles([...input.files], append); input.value = ""; });
  $("#zone").addEventListener("click", () => pickFiles(false));
  $("#zone").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); pickFiles(false); } });
  $("#addBtn").addEventListener("click", () => pickFiles(true));
  $("#newBtn").addEventListener("click", () => pickFiles(false));

  ["dragenter","dragover"].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); $("#zone").classList.add("over"); }));
  ["dragleave","drop"].forEach(ev => document.addEventListener(ev, e => { e.preventDefault();
    if (ev === "drop" || e.target === document.documentElement) $("#zone").classList.remove("over"); }));
  document.addEventListener("drop", e => {
    const files = [...(e.dataTransfer?.files || [])];
    if (files.length) openFiles(files, isOn() && confirm("¿Agregar este archivo a los datos actuales?\nAceptar: combinar. Cancelar: reemplazar."));
  });

  let qT;
  $("#q").addEventListener("input", e => { clearTimeout(qT); qT = setTimeout(() => { F.q = norm(e.target.value); UI.page = 0; refresh(); }, 180); });
  const numOrNull = v => v === "" ? null : +v;
  $("#folMin").addEventListener("change", e => { F.folMin = numOrNull(e.target.value); refresh(); });
  $("#folMax").addEventListener("change", e => { F.folMax = numOrNull(e.target.value); refresh(); });
  $("#dMin").addEventListener("change", e => { F.dMin = e.target.value || null; refresh(); });
  $("#dMax").addEventListener("change", e => { F.dMax = e.target.value || null; refresh(); });
  $("#clearBtn").addEventListener("click", () => { clearFilters(); ["#q","#folMin","#folMax","#dMin","#dMax"].forEach(s => $(s).value = ""); refresh(); });

  $("#railToggle").addEventListener("click", e => { const o = $("#rail").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", o); });
  $("#railCollapse").addEventListener("click", () => {
    if (isMobile()){ $("#rail").classList.remove("open"); $("#railToggle").setAttribute("aria-expanded", false); }
    else setRail(true);
  });
  $("#railOpen").addEventListener("click", () => { setRail(false); $("#railCollapse").focus(); });

  const setAll = value => { CARDS.forEach(d => setCollapsed(d.id, value, true)); if (!value && CTX) refresh(); };
  $("#collapseAll").addEventListener("click", () => setAll(true));
  $("#expandAll").addEventListener("click", () => setAll(false));
  $("#printBtn").addEventListener("click", () => print());
  $("#themeBtn").addEventListener("click", () => {
    const r = document.documentElement;
    const dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    r.dataset.theme = dark ? "light" : "dark";
  });
  let rT;
  addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { if (CTX) refresh(); }, 150); });
}

/* ---------- Inicio ---------- */
buildCards();
bindEvents();
if (store.get("tablero.panelOculto", false)) setRail(true);
if (typeof XLSX === "undefined"){ $("#err").textContent = "No se cargó el lector de Excel incluido en la página."; $("#err").style.display = "block"; }
