# Tablero de hechos de tránsito: código fuente

El tablero se entrega como un solo HTML (`dist/tablero_peritos.html`), pero se edita en estos archivos.
*Generado con IA.

## Construir

```
python build.py
```

Genera `dist/tablero_peritos.html` con estilos, código y el lector de Excel incluidos. No requiere instalar nada.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura fija de la página: barra superior, zona de carga, panel de filtros y zonas donde se insertan las tarjetas. |
| `styles.css` | Estilos, tema claro/oscuro, diseño adaptable e impresión. |
| `js/config.js` | Catálogo de alcaldías, **esquema de hojas y columnas** y utilidades. |
| `js/data.js` | Lectura del Excel, combinación de archivos, cálculos fijos y diagnóstico de faltantes. |
| `js/state.js` | Filtros y cálculo de la selección en una sola pasada. |
| `js/charts.js` | Gráficas: barras verticales, horizontales y pastel. |
| `js/cards.js` | **Registro de tarjetas.** |
| `js/app.js` | Arranque, indicadores, filtros, panel lateral y eventos. |
| `vendor/xlsx.mini.min.js` | SheetJS 0.18.5 (licencia Apache 2.0). |

## Cambios frecuentes

**Agregar, quitar o mover una tarjeta.** Edita la lista `CARDS` en `js/cards.js`. Cada tarjeta define:

- `id`, `title`, `desc` y `span` (ancho en columnas de 12);
- `body`, el HTML inicial;
- `render(ctx, card)`, que la dibuja.

Opcionalmente puede definir:

- `tools`, botones del encabezado;
- `setup(card)`, que se ejecuta una vez;
- `visible(ctx)`, para mostrarla solo en ciertos casos.

El orden de la lista es el orden en pantalla. Colapsar, recordar el estado e imprimir funcionan sin código adicional.

`ctx` contiene la selección actual:

- `cur`: intervenciones filtradas.
- `pids`: procedimientos.
- `veh`: personas.
- `bienes`, `totBien` y `owners`.
- `mas` y `fem`.
- `except[dim]`: la selección sin el filtro de esa dimensión. Sirve para gráficas que filtran al hacer clic.

**Reconocer una columna nueva o cambiar el aviso de faltantes.** Edita `SCHEMA` en `js/config.js`. Ahí están el nombre visible de cada columna, su impacto y el efecto que se muestra si falta. Los nombres se comparan normalizados: sin acentos, mayúsculas, espacios ni signos.

**Agregar un filtro por clic.** Agrega la dimensión en `DIMS` (`js/state.js`) y usa `toggleFilter(dim, valor)` seguido de `refresh()`.

