/* ============================================================
   state.js: filtros y cálculo de la selección
   ============================================================ */

/* Filtros por dimensión (se pueden cruzar: cada gráfica ignora su propio filtro) */
const DIMS = {
  cat: {label:"Procedimiento", of: i => i.cat},
  alc: {label:"Alcaldía",     of: i => i.code,    show: v => ALC_NAME[v] || v},
  esp: {label:"Intervención",  of: i => i.intT.label},
  jz:  {label:"Juzgado",      of: i => i.juzgado},
  col: {label:"Colonia",      of: i => i.colKey,  show: v => v.split("|")[0]}
};
const F = {
  sel: Object.fromEntries(Object.keys(DIMS).map(d => [d, new Set()])),
  q:"", folMin:null, folMax:null, dMin:null, dMax:null
};
const UI = {alcSort:"code", colMode:"rep", sortKey:"folio", sortDir:1, page:0, tq:"", warnHidden:false};

function toggleFilter(dim, value){ const s = F.sel[dim]; s.has(value) ? s.delete(value) : s.add(value); UI.page = 0; }
function setOnly(dim, value){ const s = F.sel[dim]; const on = s.size === 1 && s.has(value); s.clear(); if (!on) s.add(value); UI.page = 0; }
function clearFilters(){
  Object.values(F.sel).forEach(s => s.clear());
  Object.assign(F, {q:"", folMin:null, folMax:null, dMin:null, dMax:null});
  UI.page = 0;
}

/* Filtros que no se cruzan (se aplican siempre) */
function baseOk(i){
  if (F.folMin !== null && i.folio < F.folMin) return false;
  if (F.folMax !== null && i.folio > F.folMax) return false;
  if (F.dMin && (!i.fecha || isoDate(i.fecha) < F.dMin)) return false;
  if (F.dMax && (!i.fecha || isoDate(i.fecha) > F.dMax)) return false;
  if (F.q && !i.hay.includes(F.q)) return false;
  return true;
}

/* Recorre las intervenciones una sola vez y arma todo lo que necesitan las tarjetas.
   except[d] = intervenciones que pasan todos los filtros salvo el de la dimensión d. */
function compute(){
  const dims = Object.keys(DIMS);
  const cur = [], except = Object.fromEntries(dims.map(d => [d, []]));
  for (const i of DB.all){
    if (!baseOk(i)) continue;
    let failed = null, n = 0;
    for (const d of dims){
      const s = F.sel[d];
      if (s.size && !s.has(DIMS[d].of(i))){ failed = d; if (++n > 1) break; }
    }
    if (n === 0){ cur.push(i); dims.forEach(d => except[d].push(i)); }
    else if (n === 1) except[failed].push(i);
  }
  const pids = new Set(cur.map(i => i.pid));
  const veh = DB.veh.filter(v => pids.has(v.pid));
  const bienes = DB.bienes.filter(b => pids.has(b.pid));
  const own = new Map(); bienes.forEach(b => own.set(b.prop, (own.get(b.prop)||0) + b.monto));
  const gen = countBy(veh, v => v.genero);
  return {
    cur, except, pids, veh, bienes,
    totBien: sumBy(bienes, b => b.monto),
    owners: [...own].sort((a,b) => b[1] - a[1]),
    fem: gen.get("Femenino") || 0, mas: gen.get("Masculino") || 0,
    issues: DB.issues || []
  };
}

/* Filtros activos como lista (para chips, contador del panel y resumen) */
function activeFilters(){
  const out = [];
  for (const [d, def] of Object.entries(DIMS))
    for (const v of F.sel[d]) out.push({label:def.label, value:(def.show || String)(v), clear: () => F.sel[d].delete(v)});
  if (F.q) out.push({label:"Búsqueda", value:$("#q").value, clear: () => { F.q = ""; $("#q").value = ""; }});
  if (F.folMin !== null || F.folMax !== null) out.push({label:"Folio", value:`${F.folMin ?? "…"} a ${F.folMax ?? "…"}`,
    clear: () => { F.folMin = F.folMax = null; $("#folMin").value = $("#folMax").value = ""; }});
  if (F.dMin || F.dMax) out.push({label:"Fecha", value:`${F.dMin || "…"} a ${F.dMax || "…"}`,
    clear: () => { F.dMin = F.dMax = null; $("#dMin").value = $("#dMax").value = ""; }});
  return out;
}
