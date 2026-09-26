/* ============================================================
   config.js: catálogos, esquema de columnas y utilidades
   ============================================================ */

const ALCALDIAS = [
  ["AOB","Álvaro Obregón"],["AZC","Azcapotzalco"],["BJU","Benito Juárez"],["COY","Coyoacán"],
  ["CUH","Cuauhtémoc"],["CUJ","Cuajimalpa de Morelos"],["GAM","Gustavo A. Madero"],["IZC","Iztacalco"],
  ["IZP","Iztapalapa"],["MAC","La Magdalena Contreras"],["MIH","Miguel Hidalgo"],["MIL","Milpa Alta"],
  ["TLH","Tláhuac"],["TLP","Tlalpan"],["VCA","Venustiano Carranza"],["XOC","Xochimilco"]
];
const CAT_ORDER = ["Daño","Bache","Mecánico","Bienes","Carpeta de investigación"];
const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const OWN_COLS = ["var(--guinda)","var(--slate)","var(--teal)","var(--amber)","var(--ink-3)"];
const SEV_LABEL = {alta:"Importante", media:"Afecta un dato", baja:"Menor"};

/* ---------- Esquema: única fuente de verdad sobre hojas y columnas ----------
   need: columnas que identifican la hoja aunque tenga otro nombre.
   cols: [clave normalizada, nombre visible, impacto si falta, efecto si falta]
         (sin impacto = la columna es opcional y no genera aviso)
   combos: faltantes que juntos tienen un efecto mayor que por separado.
   missing: impacto y efecto si falta la hoja completa. */
const YEAR_FX = "No se conoce el año de cada procedimiento; si el Registro abarca varios años, algunas fechas podrían cruzarse.";
const LINK_FX = "Tienen el Procedimiento ID vacío o con letras.";
const SCHEMA = {
  proc: { label:"Procedimientos", name:"procedimientos", need:["id","procedimiento"],
    onlyWithRegistro:true, missing:["baja", YEAR_FX],
    cols:[["id","ID"], ["ano","Año","baja",YEAR_FX]] },
  interv: { label:"Intervenciones", name:"intervenciones", need:["intervencionid","folio"],
    cols:[
      ["intervencionid","Intervención ID","alta","No se pudieron cargar las intervenciones de este archivo."],
      ["procedimientoid","Procedimiento ID","alta","No se pueden contar procedimientos ni ligar personas y bienes a las intervenciones."],
      ["especialidad","Especialidad","alta","No se separan Daño, Bache, Mecánico y Bienes; aparecen como «Sin especialidad»."],
      ["folio","Folio","media","No funcionan el filtro de folio ni las fechas por día."],
      ["tipoproc","Tipo Proc","media","El tipo de hecho de tránsito aparece como «Sin tipo»."],
      ["juzgado","Juzgado","media","La alcaldía se toma de la columna Alcaldía y la gráfica de juzgados queda vacía."],
      ["alcaldia","Alcaldía"],
      ["lugarcolonia","Lugar Colonia","media","La tabla de colonias queda vacía."],
      ["lugaralcaldia","Lugar Alcaldía","baja","No se detectan hechos ocurridos en otra alcaldía."]
    ],
    combos:[{all:["juzgado","alcaldia"], label:"Juzgado y Alcaldía", sev:"alta",
      fx:"No se puede ubicar la alcaldía; la incidencia por alcaldía y la gráfica de juzgados quedan vacías."}] },
  veh: { label:"Vehículos", name:"vehiculos", need:["procedimientoid","genero"],
    missing:["alta","Personas atendidas queda en 0."],
    cols:[
      ["procedimientoid","Procedimiento ID","alta","No se pueden ligar las personas a sus procedimientos."],
      ["genero","Género","media","Las personas se cuentan con género «Sin dato»."]
    ] },
  bienes: { label:"Bienes", name:"bienes", need:["procedimientoid","monto"],
    missing:["media","Bienes valuados queda en $0."],
    cols:[
      ["procedimientoid","Procedimiento ID","alta","No se pueden ligar los bienes a sus procedimientos."],
      ["monto","Monto","alta","Los montos de bienes quedan en $0."],
      ["propietario","Propietario","media","La gráfica por propietario muestra todo como «Sin dato»."],
      ["descripcion","Descripción","baja","El detalle de bienes muestra «Sin descripción»."],
      ["juzgado","Juzgado","baja","El detalle de bienes no muestra el juzgado."],
      ["cantidad","Cantidad","baja","Se asume una pieza por bien."]
    ] },
  reg: { label:"Registro", name:"registro", need:["folioinicial","foliofinal"], optional:true,
    cols:[["fecha","Fecha"],["folioinicial","Folio inicial"],["foliofinal","Folio final"]] }
};

/* ---------- Utilidades ---------- */
const $ = s => document.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const norm = s => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const clean = s => (s === null || s === undefined) ? "" : String(s).trim();
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtN = n => new Intl.NumberFormat("es-MX").format(n);
const fmtM = n => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2}).format(n);
const fmtM0 = n => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(n);
const pct = (a,b) => b ? Math.round(a*1000/b)/10 : 0;
const toNum = v => { if (typeof v === "number") return v; const n = parseFloat(String(v ?? "").replace(/[$,\s]/g,"")); return isNaN(n) ? 0 : n; };
const sentence = s => { s = clean(s).toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };
const plural = (n, one, many) => `${fmtN(n)} ${n === 1 ? one : many}`;
const fmtDate = d => d ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : "";
const isoDate = d => d ? d.toISOString().slice(0,10) : "";
const countBy = (arr, fn) => { const m = new Map(); for (const x of arr){ const k = fn(x); m.set(k, (m.get(k)||0) + 1); } return m; };
const sumBy = (arr, fn) => arr.reduce((s,x) => s + fn(x), 0);
const catSort = (a,b) => { const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b); return (ia<0?99:ia) - (ib<0?99:ib) || a.localeCompare(b,"es"); };
const ALC_NAME = Object.fromEntries(ALCALDIAS);
const NAME_TO_CODE = Object.fromEntries(ALCALDIAS.map(([c,n]) => [norm(n), c]));
const codeOfJuzgado = jz => clean(jz).split("-")[0].toUpperCase();

function espShort(e){
  const n = norm(e);
  if (n.includes("transito")) return "Tránsito";
  if (n.includes("bien")) return "Bienes";
  if (n.includes("mecanic")) return "Mecánico";
  const s = clean(e).replace(/^PTT\s*/i,"").replace(/^val\.?\s*/i,"").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Sin especialidad";
}
function tipoShort(t){
  const n = norm(t);
  if (n.includes("bache")) return "Bache";
  if (n.includes("carpeta")) return "Carpeta de investigación";
  return clean(t) || "Sin tipo";
}

/* Nombres visibles y color de badge de los tipos de procedimiento e intervención.
   [texto que se busca en el valor normalizado, nombre visible, color]; el orden importa
   («Bache (Daño por Vía Pública)» debe reconocerse como Bache antes que como Daño). */
const PROC_TYPES = [
  ["bache","Bache","var(--amber)"], ["carpeta","Carpeta de Investigación","var(--slate)"],
  ["dano","Daño","var(--guinda)"], ["ordinaria","Remisión Ordinaria","var(--teal)"], ["queja","Queja","var(--violet)"]
];
const INTERV_TYPES = [
  ["transito","PTT en tránsito","var(--slate)"], ["bien","PTT valuación de bienes","var(--teal)"],
  ["mecanic","PTT valuación daño mecánico","var(--amber)"], ["ampliacion","Ampliación de dictamen","var(--guinda)"],
  ["revision","Revisión Técnica","var(--violet)"]
];
const typeOf = (list, v, empty) => {
  const n = norm(v), hit = list.find(([k]) => n.includes(k));
  return hit ? {label:hit[1], color:hit[2]} : {label:clean(v) || empty, color:"var(--ink-3)"};
};
const pill = t => `<span class="pill" style="--c:${t.color}">${esc(t.label)}</span>`;

/* Preferencias en el navegador (qué está contraído). Nunca guarda datos del Excel. */
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
