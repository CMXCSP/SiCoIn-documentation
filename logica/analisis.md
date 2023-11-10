## Procedimiento

- Checar en registro de procedimiento 'Patrimonial' y 'Valuación' si el daño por grafiti se puede incluir en patrimonial.

||__Daño__|__Carpeta__|__Patrimonial__|__Valuación__||
|-|-|-|-|-|-|
|_Generales_|✔️|✔️|✔️|✔️||
|_Lugar_|✔️|✔️|✔️|✔️||
|_Obj Bienes_|Puede|Puede|❌|✔️||
|_Vehículo Inv_|✔️|✔️|✔️|❌||
|_Involucr SinV_|Puede|Puede|❌|Puede||
|_Llamados_|✔️|✔️|✔️|✔️||
|||||||
|||||||
|||||||
|||||||

✔️ Necesario
❌ NO debe 

### Flujo de procedimiento intervenciones PTT
:::mermaid
flowchart LR

subgraph Daño 
direction TB
    dt("`**Tránsito**`") -- "sugiere" --> dm{{"`Mecánico`"}}
    dt("`**Tránsito**`") -- "sugiere" --> db{{"`Bienes`"}}
end

subgraph Carpeta 
direction TB
    ct("`**Tránsito**`") -- "sugiere" --> cm{{"`Mecánico`"}}
    ct("`**Tránsito**`") -- "sugiere" --> cb{{"`Bienes`"}}
end

subgraph Patrimonial 
direction TB
    pt("`**Tránsito**`") -- "sugiere" --> pm{{"`Mecánico`"}}
    ptb["No deberia existir Tránsito - Bienes pero ha pasado"]
end

subgraph Valuación 
direction TB
    vm["NO debe haber mecánico"]
    vb{{"`Bienes`"}} --> vg["Hay grafitis"]
end

:::


## Vehiculos asegurados
Un vehiculo tiene dos campos (< asegurado>, < insurancecompany_id>) con dos opciones para indicar el seguro.
  - Cuenta con seguro. (true , '< nombreCompañia>') no puede ser (true, null)
  - Sin seguro. (false, null) no puede ser (false, '< vacio> o < nombreCompañia>')
        podria ser (false, 'Sin seguro') pero hay que modificar los valores de la tabla de seguros inutilizando el campo < asegurado>, si no se selecciona opción queda (false, null)



