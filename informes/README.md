# Tablero de hechos de tránsito: guía rápida

Archivo: `diario.html`. Es un solo archivo que se abre con doble clic en el navegador y funciona sin internet para determinar los datos para el informe diario.

## Funcionamiento general

- **Carga:** arrastra el Excel sobre la página o haz clic en la zona de carga. Acepta `.xlsx` y varios archivos a la vez.
- **Privacidad:** el archivo se lee dentro del navegador. La página tiene una política de seguridad que bloquea cualquier conexión de red, así que los datos no salen del equipo.
- **Agregar archivo:** combina el nuevo Excel con los datos ya cargados. Sirve, por ejemplo, para sumar la exportación de folios con el informe diario y así obtener las fechas.
- **Cargar otro Excel:** borra lo cargado y empieza de cero.
- **Filtros:**
  - Panel lateral: tipo de procedimiento, alcaldía, tipo de intervención, folio, fecha y búsqueda libre.
  - Clic en cualquier barra, colonia o juzgado para filtrar. Otro clic quita el filtro.
  - Todos los filtros se aplican a todo el tablero.
- **Tarjetas y panel:** se pueden contraer. El navegador recuerda cuáles quedaron cerradas. Las tarjetas contraídas no se imprimen.

## Cómo se calculan las cifras

| Dato | Cálculo |
|---|---|
| Intervenciones | Filas de la hoja Intervenciones. Es la base de todo el tablero. |
| Procedimientos | Valores distintos de *Procedimiento ID* entre las intervenciones filtradas. |
| Tipo de procedimiento | Columna *Tipo Proc* de cada intervención: Daño, Bache, Carpeta de Investigación, Remisión Ordinaria o Queja. |
| Personas atendidas | Filas de la hoja Vehículos cuyos procedimientos están en la selección. |
| Bienes valuados | Suma de *Monto* de la hoja Bienes para los procedimientos de la selección, agrupada por propietario. |
| Alcaldía | Clave del juzgado. Si no hay juzgado, se usa la columna Alcaldía. |
| Fechas | Cada folio se busca dentro de los rangos *Folio inicial* y *Folio final* de la hoja Registro, respetando el año del procedimiento. |

## Cómo encuentra hojas y columnas

- **Hojas:** se reconocen por su nombre: Procedimientos, Intervenciones, Vehículos, Bienes y Registro. Si una hoja tiene otro nombre pero contiene las columnas clave de alguno de esos tipos, también se reconoce. Las demás hojas, como Estadística, se ignoran.
- **Encabezado:** de las primeras 10 filas, se toma la que tiene más celdas con texto. Un título de una sola celda arriba de la tabla no afecta.
- **Nombres de columna:** se comparan sin acentos, mayúsculas, espacios ni signos. «Intervención ID», «INTERVENCION ID» e «intervencion_id» son equivalentes.
- **Orden y columnas extra:** el orden no importa y las columnas que no se usan se ignoran.
- **Precauciones:**
  - Si hay dos columnas con el mismo nombre, se usa la de más a la derecha.
  - Los IDs de procedimiento e intervención deben ser números. Las filas con letras se omiten.
  - Los montos aceptan formato con `$` y comas.

## Combinación de archivos

- Procedimientos e intervenciones repetidos no se duplican, porque se identifican por su ID. Si un registro aparece en dos archivos, se queda la versión del último archivo cargado.
- En Vehículos y Bienes, si un procedimiento ya tenía registros de un archivo anterior, se conservan esos y se ignoran los del archivo nuevo.

## Si faltan hojas o columnas

El tablero carga lo que encuentra y muestra la tarjeta **«Faltan datos en el archivo»** con cada faltante y su efecto. Sin la hoja Intervenciones, o sin la columna *Intervención ID*, no se puede cargar nada.

| Hoja | Falta | Impacto | Qué se afecta |
|---|---|---|---|
| Intervenciones | Procedimiento ID | Importante | No se cuentan procedimientos ni se ligan personas y bienes. |
| Intervenciones | Especialidad | Importante | Todo aparece como «Sin especialidad». |
| Intervenciones | Juzgado y Alcaldía | Importante | No se puede ubicar la alcaldía. |
| Intervenciones | Folio | Afecta un dato | Sin filtro de folio ni fechas. |
| Intervenciones | Tipo Proc | Afecta un dato | El tipo de procedimiento aparece como «Sin tipo». |
| Intervenciones | Juzgado | Afecta un dato | Se usa Alcaldía y la gráfica de juzgados queda vacía. |
| Intervenciones | Lugar Colonia | Afecta un dato | La tabla de colonias queda vacía. |
| Intervenciones | Lugar Alcaldía | Menor | No se detectan hechos en otra alcaldía. |
| Vehículos | Hoja completa | Importante | Personas atendidas en 0. |
| Vehículos | Género | Afecta un dato | Las personas aparecen como «Sin dato». |
| Bienes | Hoja completa | Afecta un dato | Bienes valuados en $0. |
| Bienes | Monto | Importante | Montos en $0. |
| Bienes | Propietario | Afecta un dato | Todo aparece como «Sin dato». |
| Bienes | Descripción, Juzgado, Cantidad | Menor | Se muestran vacíos o se asume 1 pieza. |
| Procedimientos | Hoja o Año | Menor | Con un Registro de varios años, algunas fechas podrían cruzarse. |
| Registro | Hoja completa | Sin aviso | Es opcional; sin ella no hay fechas ni gráfica por día. |

El aviso también reporta:

- Filas omitidas porque el ID está vacío o tiene letras.
- Personas o bienes cuyo *Procedimiento ID* no aparece en Intervenciones. Esos registros no se cuentan.

## Categorías nuevas

Una especialidad o un tipo de procedimiento que no se conoce, por ejemplo «Revisión técnica» o «Queja», se agrega automáticamente como una categoría más, con su nombre original.
