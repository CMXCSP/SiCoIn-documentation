-- PTT por turno y adscripcion
SELECT po.id as noEmpleado, ad.actividad , ad.turno, ad.juzgado   
FROM personal_operativo po 
INNER JOIN adscripciones_po ad  
ON po.id = ad.id
WHERE po.activo = 1 AND (ad.actividad ='perito' OR ad.actividad ='coordinador')
ORDER BY turno, juzgado
;


-- Procedimientos por motivo de transito de vehiculos 
-- incluye conteo de llamados para intervención
SELECT 
	jc.alcaldia, p.id as proc_id, p.expediente, jc.juzgado,
	COUNT(i.procedimiento_id ) AS llamados, p.procedimiento, 
	p.hecho ,p.presentacion, p.pyear
FROM procedimiento p  
	LEFT JOIN intervencion i
	ON p.id = i.procedimiento_id
	INNER JOIN directorio_juzgados jc  
	ON jc.idjc = p.juzgado_id 
GROUP BY i.procedimiento_id
ORDER BY proc_id
;


-- Conteo de vehiculos por procedimiento
SELECT 
	p.id as proc_id, p.expediente ,COUNT(aic.procedimiento_id) AS vehiculos
FROM procedimiento p  
	 LEFT JOIN all_involved_cars aic ON p.id = aic.procedimiento_id 
GROUP BY aic.procedimiento_id 
ORDER BY proc_id
;


-- Vehiculos involucrados por procedimiento
SELECT 
	jc.alcaldia, p.id as proc_id, p.expediente, jc.juzgado,
	COUNT(iv.procedimiento_id) AS vehiculos_involucrados, p.procedimiento, 
	p.hecho ,p.presentacion, p.pyear
FROM procedimiento p  
	LEFT JOIN involucrado_vehiculo iv 
	ON p.id = iv.procedimiento_id
	INNER JOIN directorio_juzgados jc  
	ON jc.idjc = p.juzgado_id 
GROUP BY iv.procedimiento_id
ORDER BY proc_id
;


-- Solicitudes de intervencion (folios)
-- incluye nombre de ptt asignado
-- incluye los procedimientos sin llamado
SELECT 
	p.pyear, p.id AS proc_id, p.procedimiento, 
    i.id AS folio, i.especialidad, i.estado,  
    fdi.nombres, fdi.primer_apellido,
	jc.juzgado , p.expediente,
	i.solicitud AS preventivo, i.intervencion AS definitivo
FROM procedimiento p  
	LEFT JOIN intervencion i 
	ON p.id = i.procedimiento_id
	INNER JOIN directorio_juzgados jc  
	ON jc.idjc = p.juzgado_id 
	LEFT JOIN folios_de_intervencion fdi 
	ON fdi.folio = i.id
ORDER BY proc_id, folio
;



