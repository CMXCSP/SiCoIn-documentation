/* ============================================================
   data.js: lectura del Excel, datos en memoria y diagnóstico
   ============================================================ */

/* Convierte una hoja en {cols, rows}. El encabezado es, de las primeras
   10 filas, la que tiene más celdas con texto (la primera si hay empate). */
function readSheet(ws){
  const raw = XLSX.utils.sheet_to_json(ws, {header:1, defval:null, raw:true});
  const texts = r => r ? r.filter(v => typeof v === "string" && v.trim()).length : 0;
  let h = -1, best = 0;
  raw.slice(0,10).forEach((r,k) => { const n = texts(r); if (n > best){ best = n; h = k; } });
  if (h < 0) return {cols:[], rows:[]};
  const cols = raw[h].map(norm);
  const rows = raw.slice(h+1)
    .filter(r => r && r.some(v => v !== null && v !== ""))
    .map(r => { const o = {}; cols.forEach((c,i) => { if (c) o[c] = r[i]; }); return o; });
  return {cols, rows};
}

/* Asigna cada hoja del libro a un tipo del esquema: por nombre
   (con al menos una columna clave) o por tener todas sus columnas clave. */
function classify(wb){
  const out = {};
  for (const sheetName of wb.SheetNames){
    const nsn = norm(sheetName), table = readSheet(wb.Sheets[sheetName]);
    for (const [key, def] of Object.entries(SCHEMA)){
      if (out[key]) continue;
      const byName = nsn.startsWith(def.name) && def.need.some(c => table.cols.includes(c));
      const byCols = def.need.every(c => table.cols.includes(c));
      if (key === "proc" && table.cols.includes("intervencionid")) continue;
      if (byName || byCols){ out[key] = table; break; }
    }
  }
  return out;
}

const DB = {};
function resetDB(){
  Object.assign(DB, {
    proc:new Map(),    // id → {id, anio}
    interv:new Map(),  // intervencionId → registro
    veh:[], bienes:[], reg:[], files:[],
    // precalculados en prepare()
    all:[], vehByPid:new Map(), bienesByPid:new Map(), montoHolder:new Map(), hasDates:false
  });
}
resetDB();

function ingest(wb, fname){
  const t = classify(wb);
  if (!t.interv && !t.proc && !t.reg)
    throw new Error(`«${fname}» no tiene las hojas Procedimientos o Intervenciones. Revisa que sea la exportación del sistema.`);
  const skipped = {interv:0, veh:0, bienes:0};

  for (const r of t.proc?.rows || []){
    const id = toNum(r.id);
    if (id) DB.proc.set(id, {id, anio: toNum(r.ano) || null});
  }

  for (const r of t.interv?.rows || []){
    const iid = toNum(r.intervencionid);
    if (!iid){ if (t.interv.cols.includes("intervencionid")) skipped.interv++; continue; }
    const juzgado = clean(r.juzgado);
    const code = codeOfJuzgado(juzgado) || NAME_TO_CODE[norm(r.alcaldia)] || "";
    const esp = espShort(r.especialidad), tipo = tipoShort(r.tipoproc);
    const lugarA = clean(r.lugaralcaldia), colonia = clean(r.lugarcolonia);
    const i = {
      pid: toNum(r.procedimientoid), iid, folio: toNum(r.folio),
      tipoRaw: clean(r.tipoproc), tipo, espRaw: clean(r.especialidad), esp,
      cat: esp === "Tránsito" ? tipo : esp,         // tipo de hecho como en el Guion de peritos
      code, juzgado, alcaldia: clean(r.alcaldia) || ALC_NAME[code] || "",
      lugarA, lugarCode: NAME_TO_CODE[norm(lugarA)] || "", colonia,
      colKey: colonia ? colonia + "|" + lugarA : "",
      fecha: null
    };
    i.otraAlcaldia = !!(i.lugarCode && i.code && i.lugarCode !== i.code);
    i.hay = norm([i.folio, i.pid, juzgado, colonia, lugarA, i.alcaldia, i.tipoRaw, i.espRaw].join(" "));
    DB.interv.set(iid, i);
  }

  // Vehículos y Bienes no tienen llave propia: si un procedimiento ya venía de otro archivo, se conserva el primero
  const seenV = new Set(DB.veh.map(v => v.pid)), seenB = new Set(DB.bienes.map(b => b.pid));
  for (const r of t.veh?.rows || []){
    const pid = toNum(r.procedimientoid);
    if (!pid){ skipped.veh++; continue; }
    if (!seenV.has(pid)) DB.veh.push({pid, genero: sentence(r.genero) || "Sin dato"});
  }
  for (const r of t.bienes?.rows || []){
    const pid = toNum(r.procedimientoid);
    if (!pid){ skipped.bienes++; continue; }
    if (!seenB.has(pid)) DB.bienes.push({pid, cant: toNum(r.cantidad) || 1, prop: clean(r.propietario) || "Sin dato",
      desc: clean(r.descripcion) || "Sin descripción", monto: toNum(r.monto), juzgado: clean(r.juzgado)});
  }

  for (const r of t.reg?.rows || []){
    let f = r.fecha;
    if (!(f instanceof Date)){ const d = new Date(f); f = isNaN(d) ? null : d; }
    const a = toNum(r.folioinicial), b = toNum(r.foliofinal);
    if (f && a && b) DB.reg.push({fecha: new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate())), a, b});
  }

  DB.files.push({name:fname, cols: Object.fromEntries(Object.entries(t).map(([k,v]) => [k, new Set(v.cols)])), skipped});
}

/* Cálculos que no dependen de los filtros: se hacen una vez al cargar. */
function prepare(){
  DB.all = [...DB.interv.values()].sort((a,b) => a.folio - b.folio);
  for (const i of DB.all){
    const yr = DB.proc.get(i.pid)?.anio;
    const hit = DB.reg.find(r => i.folio >= r.a && i.folio <= r.b && (!yr || r.fecha.getUTCFullYear() === yr));
    i.fecha = hit ? hit.fecha : null;
  }
  DB.hasDates = DB.all.some(i => i.fecha);
  DB.vehByPid = countBy(DB.veh, v => v.pid);
  DB.bienesByPid = new Map();
  for (const b of DB.bienes) DB.bienesByPid.set(b.pid, (DB.bienesByPid.get(b.pid)||0) + b.monto);
  // En la tabla de intervenciones, el monto de bienes se muestra una sola vez por procedimiento:
  // en su intervención de valuación de bienes o, si no tiene, en la primera.
  const conBienes = new Set(DB.all.filter(i => i.esp === "Bienes").map(i => i.pid));
  DB.montoHolder = new Map();
  for (const i of DB.all)
    if (!DB.montoHolder.has(i.pid) && (!conBienes.has(i.pid) || i.esp === "Bienes")) DB.montoHolder.set(i.pid, i.iid);
}

/* Lista de hojas o columnas faltantes y registros que no se pudieron usar. */
function buildIssues(){
  const out = [], add = (file, sheet, what, sev, fx) => out.push({file, sheet, what, sev, fx});
  const hasReg = DB.reg.length > 0;
  for (const f of DB.files){
    if (!f.cols.interv) continue; // un archivo solo con Registro no se revisa
    for (const [key, def] of Object.entries(SCHEMA)){
      if (def.optional || (def.onlyWithRegistro && !hasReg)) continue;
      const cols = f.cols[key];
      if (!cols){ if (def.missing) add(f.name, def.label, "Hoja completa", ...def.missing); continue; }
      const covered = new Set();
      for (const c of def.combos || [])
        if (c.all.every(k => !cols.has(k))){ add(f.name, def.label, c.label, c.sev, c.fx); c.all.forEach(k => covered.add(k)); }
      for (const [k, label, sev, fx] of def.cols)
        if (sev && !cols.has(k) && !covered.has(k)) add(f.name, def.label, label, sev, fx);
    }
    const sk = f.skipped;
    if (sk.interv) add(f.name, "Intervenciones", plural(sk.interv, "fila omitida", "filas omitidas"), "media", "Tienen el Intervención ID vacío o con letras.");
    if (sk.veh)    add(f.name, "Vehículos", plural(sk.veh, "fila omitida", "filas omitidas"), "media", LINK_FX);
    if (sk.bienes) add(f.name, "Bienes", plural(sk.bienes, "fila omitida", "filas omitidas"), "media", LINK_FX);
  }
  const pids = new Set(DB.all.map(i => i.pid));
  const src = DB.files.length > 1 ? "Varios archivos" : DB.files[0]?.name;
  const ov = DB.veh.filter(v => !pids.has(v.pid)).length;
  const ob = DB.bienes.filter(b => !pids.has(b.pid));
  if (ov) add(src, "Vehículos", plural(ov, "persona sin intervención", "personas sin intervención"), "media",
    "Su Procedimiento ID no aparece en Intervenciones, así que no se cuentan.");
  if (ob.length) add(src, "Bienes", plural(ob.length, "bien sin intervención", "bienes sin intervención"), "media",
    `Su Procedimiento ID no aparece en Intervenciones; ${fmtM(sumBy(ob, b => b.monto))} no se cuentan.`);
  const order = {alta:0, media:1, baja:2};
  return out.sort((a,b) => order[a.sev] - order[b.sev]);
}

/* Lee uno o varios archivos. append = combinar con lo ya cargado. */
async function loadFiles(files, append){
  if (!append) resetDB();
  for (const f of files){
    const wb = XLSX.read(await f.arrayBuffer(), {type:"array", cellDates:true});
    ingest(wb, f.name);
  }
  if (!DB.interv.size) throw new Error("No se encontraron intervenciones. El tablero necesita al menos la hoja Intervenciones.");
  prepare();
  DB.issues = buildIssues();
}
