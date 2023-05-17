
SET FOREIGN_KEY_CHECKS=0;

-- Tabla personal_operativo
-- tabla adscripcionespo

/* -- tabla personal_en_funciones
		A(Asistencia), 
		U(No Disponible con asistencia), 
		P(Permiso), 
		F(Falta), 
		L(Licencia Medica), 
		V(Vacaciones) 
 */
INSERT INTO `personal_en_funciones` (`no_empleado`, `dia_asistencia`, `estado_asistencia`,`adscripcion_compuesta`) VALUES
	('904219', '2023-04-13', 'A','AOB-02_T3'),
	('904282', '2023-04-13', 'A','AOB-02_T3'),
	('904302', '2023-04-13', 'A','AOB-02_T3'),
	('904155', '2023-04-13', 'A','BJU-01_T3'),
	('904257', '2023-04-13', 'U','BJU-01_T3'),
	('904259', '2023-04-13', 'A','BJU-01_T3'),
	('904277', '2023-04-13', 'A','BJU-01_T3'),
	('904123', '2023-04-13', 'A','COY-03_T3'),
	('904213', '2023-04-13', 'A','COY-03_T3'),
	('831831', '2023-04-13', 'A','CUH-01_T3'),
	('904194', '2023-04-13', 'A','CUH-01_T3'),
	('904249', '2023-04-13', 'A','CUH-01_T3'),
	('904191', '2023-04-13', 'A','GAM-06_T3'),
	('904235', '2023-04-13', 'F','GAM-06_T3'),
	('904268', '2023-04-13', 'A','GAM-06_T3'),
	('911526', '2023-04-13', 'A','GAM-06_T3'),
	('904144', '2023-04-13', 'A','MIH-01_T3'),
	('904151', '2023-04-13', 'A','MIH-01_T3'),
	('904264', '2023-04-13', 'A','MIH-01_T3'),
	('904110', '2023-04-13', 'A','TLH-01_T3'),
	('904136', '2023-04-13', 'V','TLH-01_T3'),
	('904217', '2023-04-13', 'A','TLH-01_T3'),
	('904258', '2023-04-13', 'A','TLH-01_T3'),
	('831814', '2023-04-13', 'A','DEJC_T3'),
	('904289', '2023-04-13', 'A','DEJC_T3')
    ;

/* -- Tabla procedimiento
	Hay 10 procedimientos, 9 cuentan con al menos una solicitud de intervención
*/
INSERT INTO `procedimiento` (`pyear`, `id`, `juzgado_id`, `procedimiento`, `expediente`, `hecho`, `presentacion`) VALUES
	('2023', 1, 8, 'Daño', 'AZC-04/DSS/T1/B-220843/01/01/2022','2023-04-12 15:01','2023-04-13 05:31'),
	('2023', 2, 71, 'Daño', 'VC5/DSS/T1/B334056-B334057/01-01-2022/067','2023-04-12 15:01','2023-04-13 05:31'),
	('2023', 3, 47, 'Daño', 'IZP6/DSS/T1/B32116-B32116/01/01/2022-043','2023-04-12 15:01','2023-04-13 05:31'),
	('2023', 4, 1, 'Daño', 'AO-1/DSS/T2/B332638/01/01/2022/001','2023-04-12 15:01','2023-04-13 05:31'),
	('2023', 5, 25, 'Carpeta', 'CUH-5/DSS/T3/CI-SICUH/CUH-2/UI-1C/D/02411/09-2022/090','2023-04-12 15:01','2023-04-13 05:31'),
	('2023', 6, 16, 'Patrimonial', 'COY-3/BSS/T3/C436274/10-02-2022','2023-04-12 15:01','2023-04-13 05:31'),
	('2023', 7, 12, 'Patrimonial', 'BJU4/BSS/T1/288/29/07/2022/012','2023-04-12 15:01','2023-04-13 05:31'),
	('2023', 8, 33, 'Valuación', 'GAM-3/BSS/TM/graffiti/1872022/76','2023-04-12 15:01','2023-04-13 05:31'),
	('2023', 9, 53, 'Daño', 'MIH-1/SS/TM/123/2022/76','2023-04-12 15:01','2023-04-13 05:31'),	/* procedimiento sin intervenciones */
	('2023', 10, 12, 'Daño', 'TLH01/BSS/T3/987/29/07/2022/012','2023-04-12 19:01','2023-04-13 03:31')
	;


/* -- tabla property_damage
	Bache (caida en), Coladera (Sin tapa), Rama o árbol (caida), otro evento
*/
INSERT INTO `property_damage` (`id`, `tipo`) VALUES
	(6,'Bache'),
	(7,'Coladera')
	;


/* -- tabla intervencion	(NO puede existir intervencion sin procedimiento, id es el folio)
	observe que no hay intervencion para el procedimiento id=9
	Hay 14 solicitudes de intervención para 9 de 10 procedimientos
*/
INSERT INTO `intervencion` (`id`, `procedimiento_id`, `estado`, `especialidad`, `solicitud`, `intervencion`, `entrega`, `extension`, `conclusiones_id`, `documento`) VALUES
	(1, 1, 'Concluido', 'transito', '2023-04-13 15:01', '2023-04-13 16:01', '2023-04-13 20:01', NULL, 1, 'Dictamen'),
	(2, 2, 'Concluido', 'transito', '2023-04-13 15:31', '2023-04-13 16:31', '2023-04-13 20:31', NULL, 2, 'Dictamen'),
	(3, 3, 'Concluido', 'transito', '2023-04-13 15:41', '2023-04-13 16:41', NULL, NULL, 3, 'Dictamen'),
	(4, 1, 'Concluido', 'mecanico', '2023-04-13 15:51', '2023-04-13 16:51', '2023-04-13 20:51', NULL, 1, 'Dictamen'),
	(5, 4, 'Concluido', 'transito', '2023-04-13 16:00', '2023-04-13 17:00', '2023-04-13 21:00', NULL, 5, 'Dictamen'),
	(6, 1, 'Concluido', 'bienes', '2023-04-13 15:01', '2023-04-13 16:01', '2023-04-13 20:01', NULL, 6, 'Dictamen'),
	(7, 5, 'CI Pendiente', 'transito', '2023-04-13 15:01', '2023-04-13 16:01', NULL, NULL, NULL, NULL),
	(8, 6, 'Concluido', 'transito', '2023-04-13 20:09', '2023-04-13 21:09', '2023-04-14 00:09', NULL, 1, 'Dictamen'),
	(9, 7, 'En Proceso', 'transito', '2023-04-13 20:11', '2023-04-13 21:11', NULL, NULL, NULL, NULL),
	(10, 7, 'Agendado', 'bienes', '2023-04-13 20:15', '2023-04-13 21:15', NULL, NULL, NULL, NULL),
	(11, 8, 'En Proceso', 'transito', '2023-04-13 21:30', '2023-04-13 22:30', NULL, NULL, NULL, NULL),
	(12, 1, 'En Proceso', 'ampliacion', '2023-04-13 21:31', '2023-04-13 22:31', NULL, NULL, NULL, NULL),
	(13, 3, 'Agendado', 'mecanico', '2023-04-13 15:01', '2023-04-13 16:01', NULL, NULL, NULL, NULL),
	(14, 10, 'En Proceso', 'transito', '2023-04-13 06:30', '2023-04-13 07:30', NULL, NULL, NULL, NULL)
	;

INSERT INTO `intervencion_personas` (`intervencion_id`, `noempleado_persona`, `papel`) VALUES
	(1, '820957', 'J_Solicita'),
	(1, '904132', 'C_Asigna'),
	(1, '904144', 'Titular'),
	(2, '1099680', 'J_Solicita'),
	(2, '904132', 'C_Asigna'),
	(2, '831831', 'Titular'),
	(3, '886346', 'J_Solicita'),
	(3, '904132', 'C_Asigna'),
    /* OBSERVE que no se asigno a PPT responsable para el folio 3 
        Considere un campo para determinarlo o bien el campo estado (maquina de estado)*/
	(4, '820957', 'J_Solicita'),
	(4, '904132', 'C_Asigna'),
	(4, '831814', 'Titular'),
    (5, '886384', 'J_Solicita'),
	(5, '904132', 'C_Asigna'),
	(5, '904219', 'Titular'),
    (6, '904289', 'Titular'),
    (7, '904194', 'Titular'),
    (8, '904123', 'Titular'),
    (9, '904155', 'Titular'),
    (10, '904259', 'Titular'),
    (11, '904289', 'Titular'),
    (12, '904144', 'Titular'),
    (13, '831814', 'Titular'),
	(1, '904248', 'C_Recolecta')
    ;


-- vehiculos involucrados
INSERT INTO `involucrado_vehiculo`(`procedimiento_id`, `no_vi`, `deposito_id`, `resguardo_date`, `resguardo_no`, `submarcas_id`, 
				`class_all_involved_id`, `modelo`, `color`, `placas`, `asegurado`, `insurancecompany_id`, `nombre_conductor`, 
				`genero`, `edad`, `lesionado`, `responsable`, `request_val_mecanica`) 
	VALUES 
	(1, 1, 9, '2023-04-13 12:38', '123456', 8, 3, 2015, 'Negro', 'ASD1235', 1, 7, 'Filomeno Mata', 'Masculino', 32, 0, 1, 0),
	(1, 2, 17, '2023-04-13 11:00', '123457', 91, 3, 2010, 'Azul', 'ZZZ0000', 0, NULL, 'Hermenejildo Galeana', 'Masculino', 30, 0, 0, 1),
	(1, 3, 9, '2023-04-13 12:30', '128458', 173, 3, 2012, 'Verde', 'RRR5679', 1, 12, 'Macaria Sifuentes', 'Femenino', 30, 0, 0, 1),
	(1, 4, 9, '2023-04-13 12:30', '148488', 174, 3, 2000, 'Gris', 'POD098', 1, 12, 'Mario Bros', '', 30, 0, 0, 1),
	(2, 1, 15, '2023-04-13 12:20', '987654', 311, 19, 2020, 'Blanco', 'DFG852', 1, 19, 'Elsa Ice', 'Femenino', 22, 0, 1, 0),
	(3, 1, 17, '2023-04-13 11:00', '153657', 350, 3, 2015, 'Azul', 'S/P', 0, NULL, 'Leonardo Diaz', 'Masculino', 20, 0, 0, 1),
	(3, 2, 9, '2023-04-13 12:30', '223458', 350, 3, 2014, 'Verde', 'RSD9', 0, NULL, 'Brad Perez', 'Masculino', 22, 0, 1, 0),
	(4, 1, 24, '2023-04-13 12:30', '125458', 350, 3, 2014, 'Verde', 'RSD9', 0, NULL, 'Brad Perez', 'Masculino', 22, 0, 1, 0),
	(5, 1, NULL, '2023-04-13 11:00', NULL, 94, 3, 2015, 'Rosa/Blanco', 'S/P', NULL, NULL, 'Leo Dan', 'Masculino', 30, 0, 0, 0),
	(6, 1, 15, '2023-04-13 12:20', '987654', 311, 19, 2020, 'Blanco', 'DFG852', 1, 19, 'Elsa Ice', 'Femenino', 22, 0, 1, 0),
	(7, 1, 17, '2023-04-13 11:00', '153657', 350, 3, 2015, 'Azul', 'S/P', 0, NULL, 'Leonardo Diaz', 'Masculino', 20, 0, 0, 1),
	-- El procedimiento 8 no tiene vehiculos al ser valuación
	(9, 1, 9, '2023-04-13 12:30', '223458', 350, 3, 2014, 'Verde', 'RSD9', 0, NULL, 'Brad Perez', 'Masculino', 22, 0, 1, 0),
	(9, 2, 9, '2023-04-13 12:38', '123456', 8, 3, 2015, 'Negro', 'ASD1235', 1, 7, 'Filomeno Mata', 'Masculino', 32, 0, 1, 0),
	(10, 1, 17, '2023-04-13 11:00', '123457', 91, 3, 2010, 'Azul', 'ZZZ0000', 0, NULL, 'Hermenejildo Galeana', 'Masculino', 30, 0, 0, 1),
	(10, 2, 9, '2023-04-13 12:30', '128458', 173, 3, 2012, 'Verde', 'RRR5679', 1, 12, 'Macaria Sifuentes', 'Femenino', 30, 0, 0, 1),
	(10, 3, 9, '2023-04-13 12:30', '148488', 174, 3, 2000, 'Gris', 'POD098', 1, 12, 'Mario Bros', '', 30, 0, 0, 1)
	;


-- Lugar de los hechos
INSERT INTO `lugar_hechos` (`procedimiento_id`, `alcaldia_id`, `colonia_id`, `via1`, `via2`, `referencia`) VALUES
	(1, 2, 289, 'Calle X','Calle Y',''),
	(2, 15, 1387, 'Av. Conocida','Cerrada',''),
	(3, 9, 837, 'Blvrd. Lejano','En algun lugar',''),
	(4, 1, 3, '40','veinte',''),
	(5, 6, 540, 'Mar','Montaña',''),
	(6, 4, 425, 'Dulce','Sweet',''),
	(7, 3, 343, 'Maria','Eva',''),
	(8, 11, 1057, 'Xochitl','152','a lado del metro'),
	(9, 7, 566, 'Adan','Jesus',''),
	(10, 13, 1153, 'Periferico','Circuito','En algun lugar')
	;


-- Bienes dañados
INSERT INTO `other_damaged_goods` (`procedimiento_id`, `cantidad`, `propietario`, `descripcion`, `monto`) VALUES
	(1, '1', 'Gobierno', 'Carpeta asfaltica', 1100.50),
	(1, '2', 'Gobierno', 'arboles', 1500.00),
	(1, '1', 'Gobierno', 'luminaria', 5100.50),
	(1, '3', 'Gobierno', 'bolardos', 6100.00),
	(1, '1', 'Gobierno', 'guarnicion', 11100.00),
	(7, '1', 'Gobierno', 'guarnicion', 9100.50),
	(7, '1', 'Gobierno', 'banqueta', 1000.00)
	;


SET FOREIGN_KEY_CHECKS=1;
