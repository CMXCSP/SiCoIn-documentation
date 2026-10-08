# Documento de Concepto y Planeación
## Control Operativo de Jornadas y Asignación de Actividades

| | |
|---|---|
| **Estado** | Propuesta conceptual (v 1.0.0) |
| **Fecha** | 2026-10-08 |
| **Fase actual** | Planeación. **No se implementa nada todavía.** |

---

## 1. Introducción

Actualmente el control operativo se realiza en una hoja de cálculo que sirve como herramienta de seguimiento diario del personal. Permite registrar:

- Asistencia y disponibilidad operativa continua (servicio 24/7, sin periodos muertos).
- Folios numéricos de intervención asignados (un folio es una unidad de trabajo).
- Actividades especiales, comisiones textuales y notas breves (ej. *notificaciones*, *apoyo*, *evento*).
- Incidencias administrativas programadas o del día: vacaciones, licencias médicas, permisos, descansos.
- Historial visual inmediato para balancear la carga de trabajo entre turnos consecutivos.


### 1.1 Diagnóstico del archivo actual

Del análisis de la plantilla de la hoja de calculo (pestaña `Asignacion`):

- Una sola hoja que crece hacia la derecha: ~Xn columnas por ~Ym filas. Cada jornada es un bloque de ~6 columnas (turno, fecha, asistencia y celdas libres).
- Cobertura histórica de un mes-año inicial a un mes-año final (anterior o en curso), ~n bloques de jornada.
- Contenido mezclado en las mismas celdas: códigos (`A`, `F`, `V`, `LM`, `P`), folios de 4 dígitos, números cortos (`1`, `2`, `3`) para indicar el orden de asignación, notas libres y marcadores `---`.
- Filtros por turno y adscripción; colores por adscripción; columnas de identificación congeladas.
- Hay personal sin turno asignado (filas de coordinación, adscripción `COORD`) y una adscripción especial (`.DIRECCION`).
- Riesgos: crecimiento sin límite, riesgo de corrupción del archivo, búsqueda histórica manual, sin detección de folios duplicados.

La migración a una aplicación local dedicada sustituye el modelo de hojas infinitas, reduce el riesgo de corrupción y permite una gestión multianual, portable y sin dependencias externas.

---

## 2. Objetivos

### 2.1 Objetivo general

Desarrollar una aplicación local y portable para el control diario de actividades del personal, manteniendo la interfaz tabular que los operadores ya dominan, organizando la información en un archivo de datos local recuperable y facilitando la planeación futura de turnos y ausencias.

### 2.2 Objetivos específicos

1. **Continuidad de interfaz.** Replicar la cuadrícula editable por turno, adscripción (con sus colores identificadores) y lista de personal.
2. **Cero dependencias.** Entregar un único ejecutable (`.exe`) que funcione en cualquier PC con Windows (incluso desde una memoria USB) sin instalar software de terceros ni servidores.
3. **Base de datos única y ruta configurable.** Un solo archivo de datos (`.db`) que contiene **todo el histórico, sin separarlo por año**. Reside por defecto junto al ejecutable, pero su ruta puede configurarse o reubicarse.
4. **Motor de esquemas de turnos y vigencias.** Administrar cambios de esquema (24x48, 24x72, 12 h, 8 h, etc.) con fechas de vigencia para proyectar el calendario operativo a futuro.
5. **Contexto histórico en pantalla.** Mostrar las actividades y folios de la(s) jornada(s) anterior(es) de cada elemento para conservar orden y equidad en la asignación.
6. **Coberturas y excepciones.** Incorporar elementos de otros turnos por única ocasión con cambio temporal de adscripción.
7. **Marcado no restrictivo de ausencias.** Precargar vacaciones individuales con marcas visuales (`---`) sin bloquear la captura.
8. **Exportación nativa.** Generar reportes directos a Excel (`.xlsx`) sin requerir Office instalado.

---

## 3. Principios de diseño

### 3.1 Continuidad y familiaridad operativa
El usuario final no debe experimentar una curva de aprendizaje pronunciada: disposición de columnas, navegación con teclado (Enter, Tab, flechas) y agrupaciones visuales equivalentes al Excel actual.

### 3.2 Rigor sin rigidez
El sistema informa y asiste (prellena vacaciones, señala inasistencias, avisa de folios repetidos), pero **nunca bloquea** la captura de folios o notas ante contingencias o cambios de última hora.

### 3.3 Portabilidad y soberanía del archivo
Todos los datos residen en un archivo físico SQLite estándar. Si el usuario necesita abrirlo por fuera, puede usar visores universales de base de datos o exportarlo a Excel en segundos.

---

## 4. Contexto de operación (decisiones confirmadas)

| Decisión | Valor |
|---|---|
| Usuarios de captura | **Una sola persona, en una sola PC** |
| Base de datos | **Única**, todo el histórico en un solo archivo (sin separar por año) |
| Tecnología del ejecutable | **Python**, empaquetado en un `.exe` |
| Acceso | Local (`127.0.0.1`), sin exposición a la red |
| Interfaz | Pantalla web local abierta en el navegador predeterminado |

Consecuencia: al ser un único usuario, no se requieren cuentas, roles ni resolución de concurrencia. La complejidad se concentra en el modelo de datos, la rejilla de captura y el respaldo.

---

## 5. Alcance funcional

### 5.1 Gestión de personal y plantilla

- Campos base: identificador, nombre completo, turno habitual, adscripción habitual, estatus (activo/inactivo).
- Mantenimiento dinámico: alta ágil de ingresos y **bajas lógicas** (no se borran, para conservar el histórico).
- Personal sin turno fijo (coordinación): se soporta como caso válido.
- Al abrir una jornada se muestra la totalidad del personal de ese turno, con su estatus de asistencia obligatorio.

### 5.2 Esquemas de turnos y calendario proyectado

- **Catálogo de turnos:** identificador (T1, T2, T3, T4…), nombre, duración en horas, hora de inicio.
- **Líneas de tiempo / vigencias:** registro de cuándo entra en vigor un modelo operativo. Ejemplos:
  - Histórico: del 2023-05-01 al 2024-05-24 → esquema 24x48 (T1, T2, T3).
  - Actual: a partir de cierta fecha → esquema 24x72 (T1, T2, T3, T4).
- **Cálculo automático de guardias:** con una fecha semilla y la secuencia del esquema, el sistema sabe qué turno cubre cada día, permitiendo planear meses y años sin crear archivos separados.
- **Traslapes y continuidad 24/7:** soporte para turnos que arrancan a distintas horas o cruzan hacia la madrugada siguiente. **La jornada se identifica por su fecha y turno de inicio**; los folios pertenecen a la jornada, no al día calendario.

### 5.3 Registro diario y coberturas

- **Asistencia / disponibilidad obligatoria:** código de presencia (`A`, `V`, `LM`, `F`, `P`, `D`…). Todo el personal tiene un estado, incluso sin folio. Los códigos viven en un **catálogo editable** (código, descripción, color), no en el código fuente.
- **Celdas de folios y texto:** cinco celdas base por persona, expandibles con un botón contextual. Admiten número o texto corto.
- **Cobertura por única ocasión:**
  - Botón *Agregar cobertura / Personal de otro turno*.
  - Permite elegir a un elemento de otro turno y fijar la adscripción temporal que cubrirá en esa jornada.
  - Al concluir la jornada regresa automáticamente a su adscripción y turno habituales (no se modifica su ficha).

---

## 6. Planeación futura y ausencias

- **Registro individual por jornada:** debido a la rotación, las vacaciones se programan seleccionando las jornadas específicas que le corresponde trabajar al elemento (ej. 1/ene, 5/ene, 9/ene). Opcionalmente, un asistente que acepte un rango de fechas y marque solo las jornadas que le tocan.
- **Comportamiento en pantalla:** al abrir esa jornada, el personal programado muestra `V` o `LM`, y sus celdas de actividad muestran por defecto `---` como señal de indisponibilidad.
- **No restrictivo:** las celdas no se bloquean; el supervisor puede escribir encima ante una nota extraordinaria.

---

## 7. Organización visual y ayuda de asignación

### 7.1 Barra superior de control
- Selector de fecha y turno.
- Filtro interactivo por adscripción.
- Botones: Agregar cobertura, Expandir columnas, Guardar jornada, Exportar a Excel.

### 7.2 Cuadrícula principal
`Turno | Adscripción (fondo cromático) | Nombre | Asistencia | Folio 1 … Folio 5 (+)`

### 7.3 Contexto histórico
Columna o tooltip que muestra qué folios o actividades realizó cada elemento en su **guardia anterior**, para balancear la carga sin abrir archivos pasados.

### 7.4 Avisos no bloqueantes (propuesta)
- Folio ya registrado en otra jornada o persona: aviso informativo con enlace al registro previo; se puede guardar igualmente.
- Persona con `F`/`V`/`LM` que recibe folio: marca visual discreta.
- Folios guardados como texto, con una versión normalizada para búsqueda, de modo que `4039`, ` 4039` y `4039 ` se traten igual.

---

## 8. Modelo de datos (propuesta conceptual)

Una sola base SQLite. Tablas principales:

| Tabla | Propósito | Campos clave |
|---|---|---|
| `personal` | Plantilla | id, nombre, turno_habitual, adscripcion_habitual, activo |
| `adscripcion` | Catálogo con color | codigo, nombre, color, orden |
| `turno` | Catálogo de turnos | codigo, nombre, hora_inicio, duracion_h |
| `esquema` | Modelo operativo | id, nombre (24x48, 24x72…), secuencia de turnos |
| `esquema_vigencia` | Línea de tiempo | esquema_id, fecha_inicio, fecha_fin, fecha_semilla |
| `jornada` | Una guardia concreta | id, turno, fecha_inicio, inicio_real, fin_real |
| `registro` | Persona en una jornada | id, jornada_id, persona_id, codigo_estatus, adscripcion_efectiva, es_cobertura |
| `folio` | Folios y notas | id, registro_id, posicion, valor_texto, valor_normalizado, creado_en, modificado_en |
| `catalogo_estatus` | A, F, V, LM, P, D… | codigo, descripcion, color, marca_celdas (`---`) |
| `ausencia_programada` | Vacaciones/licencias | persona_id, jornada o fecha, codigo_estatus |

Índices relevantes: `folio(valor_normalizado)` para la búsqueda global, `registro(persona_id, jornada_id)` para el kardex y el contexto histórico, `jornada(fecha_inicio, turno)` único.

Notas de diseño:
- Con un único usuario y volumen de ~90 personas por ~3-4 jornadas diarias, una sola base aguanta décadas sin problemas de rendimiento.
- `adscripcion_efectiva` en `registro` resuelve las coberturas sin tocar la ficha del personal.
- Control de versión del esquema de la base (`PRAGMA user_version`) para poder actualizar la aplicación sin perder datos.

---

## 9. Almacenamiento, portabilidad y rutas

- **Modo standalone:** un ejecutable `ControlOperativo.exe` que levanta el servidor local y abre el navegador predeterminado.
- **Ruta de base de datos configurable:**
  - Por defecto, `control_actividades.db` en la carpeta del ejecutable.
  - Ruta alternativa en `config.ini` (ej. `D:\Respaldos\control_actividades.db`).
- **Abrible por medios externos:** DB Browser for SQLite, scripting o herramientas de BI.
- **Advertencia técnica:** SQLite funciona bien en disco local o USB. Colocar el `.db` en una carpeta compartida de red no es recomendable (bloqueos y riesgo de corrupción). Para este caso de un solo usuario se recomienda disco local con respaldo a la red/USB, no el archivo vivo en red.

---

## 10. Consultas, reportes y auditoría

- **Búsqueda global de folio:** ingresar un número y obtener fecha, turno, jornada y elemento que lo atendió, con todas las coincidencias.
- **Kardex por elemento:** histórico de folios y asistencias en un año o periodo.
- **Exportación `.xlsx`:** replica colores y columnas (por jornada, por mes o por periodo) para informes. Además, exportación a `.csv`.
- **Trazabilidad:** marca de tiempo de creación y modificación en cada asignación.
- **Importación del histórico:** migración única desde el Excel actual (oct-2023 en adelante) para no perder el historial. Los textos libres se conservan tal cual.

---

## 11. Respaldo y seguridad

- **Respaldo en un clic:** copia íntegra con nombre fechado (ej. `respaldo_2026-10-08.db`).
- **Consistencia:** el respaldo debe hacerse con la **API de respaldo de SQLite** (no copiando el archivo en uso), para evitar copias inconsistentes.
- **Respaldo automático opcional:** al cerrar la aplicación o una vez al día, conservando las últimas *N* copias.
- **Respaldo físico:** al ser un único archivo, puede copiarse a USB en cualquier momento.
- **Seguridad local:** el servidor escucha solo en `127.0.0.1`. Sin cuentas de usuario por ser monousuario. Opcionalmente, cifrado del respaldo si contiene datos sensibles del personal.
- **Datos personales:** el archivo contiene nombres y datos de ausencias (incluidas licencias médicas); conviene definir dónde se almacenan los respaldos y quién tiene acceso a ellos.

---

## 12. Consideraciones técnicas (Python)

| Aspecto | Opción sugerida |
|---|---|
| Servidor local | Flask o FastAPI + servidor WSGI/ASGI embebido (waitress / uvicorn) |
| Base de datos | `sqlite3` de la biblioteca estándar (o SQLAlchemy si se desea ORM) |
| Interfaz | HTML + JavaScript ligero, sin necesidad de internet; cuadrícula editable con teclado propio o una librería de rejilla ligera |
| Exportación Excel | `openpyxl` o `XlsxWriter` (no requieren Office) |
| Empaquetado | PyInstaller (modo *onefile* o *onedir*) |
| Recursos locales | Todos los archivos estáticos (JS/CSS) incluidos dentro del paquete; nada que dependa de CDN |

Riesgos conocidos del empaquetado:
- **Antivirus / SmartScreen:** los ejecutables de PyInstaller suelen dar falsos positivos, sobre todo en entornos institucionales. Mitigación: firmar el ejecutable si es posible, usar *onedir* (suele dar menos alertas que *onefile*), o solicitar excepción a TI.
- **Arranque más lento en *onefile***, porque se descomprime en cada ejecución.
- **Rutas:** al estar empaquetado, usar rutas relativas a la ubicación del ejecutable (no al directorio de trabajo) para localizar `config.ini` y la base de datos.
- **Puerto:** elegir un puerto libre automáticamente y controlar que no se abra más de una instancia.
- **Navegador:** definir navegadores soportados (Edge/Chrome/Firefox) y probar la navegación con teclado.

---

## 13. Puntos por definir antes de implementar

1. **Códigos de asistencia definitivos:** confirmar el catálogo (`A`, `F`, `V`, `LM`, `P`, `D`…) y qué significan exactamente `*`, `0` y los distintos marcadores `---`.
2. **Valores numéricos cortos** (`1`, `2`, `3`, `4` en el Excel actual): ¿son folios, conteo de actividades u otra cosa? Determina cómo se importan.
3. **Personal sin turno** (coordinación): ¿aparece en todas las jornadas, en ninguna, o se selecciona manualmente?
4. **Esquemas y fechas semilla reales:** fechas exactas de cambio de esquema (24x48 → 24x72) y secuencia de turnos, incluyendo T4.
5. **Contexto histórico:** ¿se muestra solo la guardia inmediata anterior o las últimas *N*? ¿Se muestra el contenido completo o un resumen?
6. **Importación:** ¿se migra todo el histórico desde 2023 o solo desde una fecha? ¿Qué hacer con celdas ambiguas?
7. **Formato de exportación:** ¿se requiere idéntico al Excel actual (una hoja horizontal por periodo) o es aceptable un formato vertical más legible?
8. **Expansión de folios:** límite máximo de celdas por persona por jornada.
9. **Política de respaldo:** frecuencia, cantidad de copias y destino.

---

## 14. Plan de trabajo sugerido (cuando se autorice implementar)

| Fase | Contenido | Resultado |
|---|---|---|
| **0. Definición** | Resolver los puntos de la sección 13 | Catálogos y reglas cerradas |
| **1. Datos** | Esquema SQLite, catálogos, script de importación del Excel actual | Base con el histórico migrado y verificado |
| **2. Captura** | Pantalla de jornada: selector fecha/turno, filtros, cuadrícula con teclado, folios expandibles | Operación diaria equivalente al Excel |
| **3. Calendario** | Esquemas, vigencias, proyección de guardias, vacaciones/licencias | Planeación futura |
| **4. Consulta** | Búsqueda global de folio, kardex, contexto histórico, avisos de duplicado | Valor adicional sobre el Excel |
| **5. Salida** | Exportación a `.xlsx`/`.csv`, respaldo, `config.ini` | Recuperación y reportes |
| **6. Empaquetado** | Ejecutable, pruebas en la PC real y en USB, prueba con antivirus | Entregable portable |

Criterio de aceptación general: el operador puede capturar una jornada completa solo con teclado, cerrar la aplicación, copiar el `.db` a otra PC, abrirlo y encontrar toda la información; y el histórico actual de Excel está consultable por folio y por persona.

---

## 15. Resumen ejecutivo

- Sustituir el Excel horizontal por una **app local en Python** con **una sola base SQLite** que concentra todo el histórico.
- Interfaz **idéntica en lógica** a la actual: cuadrícula por turno y adscripción con colores y teclado.
- Una jornada es una guardia por turno que puede cruzar al día siguiente; **los folios cuelgan de la jornada**.
- **Esquemas de turnos con vigencias** para proyectar guardias, vacaciones y licencias a futuro, sin bloquear nunca la captura.
- **Búsqueda de folios, kardex y contexto de guardia anterior** para balancear la carga.
- **Recuperabilidad total:** archivo `.db` abrible con herramientas estándar, respaldo en un clic y exportación a Excel.

