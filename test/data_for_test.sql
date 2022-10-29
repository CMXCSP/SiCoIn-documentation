
-- /*!40000 ALTER TABLE * DISABLE KEYS */;
SET FOREIGN_KEY_CHECKS=0;

-- Tabla personal_operativo
INSERT INTO `personal_operativo` (`no_empleado`, `nombres`, `primer_apellido`, `segundo_apellido`, `nombramiento`, `CURP`, `activo`) VALUES
	('10244100', 'Alberto', 'B', NULL, 'PTT', 'ALBE2000HMX', 1),
	('10244199', 'Alexandro', 'Al', NULL, 'PTT', 'ALEX200000HMX', 1),
    ('900156', 'Pitagoras', 'de Grecia', NULL, 'PTT', 'PETE150601HEU', 0),
	('1034123', 'Christina', 'S', NULL, 'JC', 'CRIS20050830MMX', 1),
	('10348555', 'Ana', 'H', NULL, 'JC', 'ANAS2000MMX', 1),
	('10358628', 'Roberta', 'M', NULL, 'JC', 'ROBE200510MMX', 1),
    ('10478554', 'Laura', 'R', NULL, 'PTT', 'LARA2000MMX', 1),
	('11968636', 'Marvin', 'P', NULL, 'PTT', 'MAVY202310UMX', 1),
    ('11868663', 'Miguel', 'P', NULL, 'PTT', 'MIKE202310HMX', 1),
	('10068663', 'Miguel', 'P', NULL, 'PTT', 'MICE200310HMX', 1),
	('10778692', 'Yoss', 'P', NULL, 'PTT', 'YOSS202310HMX', 1),
    ('11768692', 'Josep', 'P', NULL, 'PTT', 'JOSE202310HMX', 1),
	('10968682', 'Jose', 'P', NULL, 'PTT', 'JOSH202310HMX', 1),
    ('17678641', 'Fernanda', 'P', NULL, 'PTT', 'FERN202210MMX', 1),
	('11668641', 'Marco', 'V', NULL, 'PTT', 'MARC202310HMX', 1)
	;

-- tabla personal_en_funciones
INSERT INTO `personal_en_funciones` (`no_empleado`, `dia_asistencia`, `turno`, `id_juzgado_adscrito`, `estado_asistencia`, `actividad`) VALUES
	('10068663', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'perito'),
	('10244100', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'coordinador'),
	('10244199', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'coordinador'),
	('1034123555', '2022-02-13', '24x48_T3_08-08', 11, 'E', 'juzgador'),
	('1034855555', '2022-02-13', '24x48_T3_08-08', 11, 'E', 'juzgador'),
	('1035862855', '2022-02-13', '24x48_T3_08-08', 11, 'E', 'juzgador'),
	('10478554', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'perito'),
	('10778692', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'perito'),
	('10968682', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'valuador'),
	('11668641', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'mecanico'),
	('11768692', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'valuador'),
	('11868663', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'perito'),
	('11968636', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'perito'),
	('17678641', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'mecanico'),
	('900156', '2022-02-13', '24x48_T3_08-08', 11, 'A', 'coordinador')
    ;

-- Tabla procedimiento
INSERT INTO `procedimiento` (`pyear`, `id`, `id_juzgado`, `procedimiento`, `expediente`) VALUES
	('2022', 1, 8, 'Daño', 'AZC-04/DSS/T1/B-220843/01/01/2022'),
	('2022', 2, 71, 'Daño', 'VC5/DSS/T1/B334056-B334057/01-01-2022/067'),
	('2022', 3, 47, 'Daño', 'IZP6/DSS/T1/B32116-B32116/01/01/2022-043'),
	('2022', 4, 1, 'Daño', 'AO-1/DSS/T2/B332638/01/01/2022/001'),
	('2022', 5, 25, 'Carpeta', 'CUH-5/DSS/T3/CI-SICUH/CUH-2/UI-1C/D/02411/09-2022/090'),
	('2022', 6, 16, 'Patrimonial', 'COY-3/BSS/T3/C436274/10-02-2022'),
	('2022', 7, 12, 'Patrimonial', 'BJU4/BSS/T1/288/29/07/2022/012'),
	('2022', 8, 33, 'Valuación', 'GAM-3/BSS/TM/graffiti/1872022/76')
	;

-- tabla intervencion
INSERT INTO `intervencion` (`folioDictamen`, `id_procedimiento`, `estado`, `especialidad`, `solicitud`, `intervencion`, `entrega`, `extension`, `id_tipo_hecho`, `documento`) VALUES
	(1, 1, 'Concluido', 'transito', '2022-02-13 15:01', '2022-02-13 16:01', '2022-02-13 20:01', NULL, 1, 'Dictamen'),
	(2, 2, 'Concluido', 'transito', '2022-02-13 15:31', '2022-02-13 16:31', '2022-02-13 20:31', NULL, 2, 'Dictamen'),
	(3, 3, 'Pendiente', 'transito', '2022-02-13 15:41', '2022-02-13 16:41', NULL, NULL, 3, 'Dictamen'),
	(4, 1, 'Concluido', 'mecanico', '2022-02-13 15:51', '2022-02-13 16:51', '2022-02-13 20:51', NULL, 1, 'Dictamen'),
	(5, 4, 'Concluido', 'transito', '2022-02-13 16:00', '2022-02-13 17:00', '2022-02-13 21:00', NULL, 5, 'Dictamen'),
	(6, 1, 'Concluido', 'bienes', '2022-02-13 15:01', '2022-02-13 16:01', '2022-02-13 20:01', NULL, 6, 'Dictamen'),
	(7, 5, 'CI Pendiente', 'transito', '2022-02-13 15:01', '2022-02-13 16:01', NULL, NULL, NULL, NULL),
	(8, 6, 'Concluido', 'transito', '2022-02-13 20:09', '2022-02-13 21:09', '2022-02-14 00:09', NULL, 1, 'Dictamen'),
	(9, 7, 'En Proceso', 'transito', '2022-02-13 20:11', '2022-02-13 21:11', NULL, NULL, NULL, NULL),
	(10, 7, 'En Proceso', 'bienes', '2022-02-13 20:15', '2022-02-13 21:15', NULL, NULL, NULL, NULL),
	(11, 8, 'En Proceso', 'transito', '2022-02-13 21:30', '2022-02-13 22:30', NULL, NULL, NULL, NULL),
	(12, 1, 'En Proceso', 'ampliacion', '2022-02-13 21:31', '2022-02-13 22:31', NULL, NULL, NULL, NULL),
	(13, 3, 'Agendado', 'mecanico', '2022-02-13 15:01', '2022-02-13 16:01', NULL, NULL, NULL, NULL)
	;

INSERT INTO `intervencion_personas` (`id`, `idfolioDictamen`, `noempleado_persona`, `papel`) VALUES
	(1, 1, '1034123555', 'J_Solicita'),
	(2, 1, '900156', 'C_Asigna'),
	(3, 1, '10068663', 'Titular'),
	(4, 2, '1034855555', 'J_Solicita'),
	(5, 2, '10244100', 'C_Asigna'),
    (23, 1, '900156', 'C_Recolecta'),
	(6, 2, '10478554', 'Titular'),
	(7, 3, '1034855555', 'J_Solicita'),
	(8, 3, '10244199', 'C_Asigna'),
    /* OBSERVE que no se asigno a PPT responsable para el folio 3 
        Considere un campo para determinarlo o bien el campo estado (maquina de estado)*/
	(9, 4, '1034855555', 'J_Solicita'),
	(10, 4, '10244100', 'C_Asigna'),
	(11, 4, '11668641', 'Titular'),
    (12, 5, '1034855555', 'J_Solicita'),
	(13, 5, '10244100', 'C_Asigna'),
	(14, 5, '11868663', 'Titular'),

    (15, 6, '11768692', 'Titular'),
    (16, 7, '11968636', 'Titular'),
    (17, 8, '10778692', 'Titular'),
    (18, 9, '10068663', 'Titular'),
    (19, 10, '10968682', 'Titular'),
    (20, 11, '10478554', 'Titular'),
    (21, 12, '11868663', 'Titular'),
    (22, 13, '17678641', 'Titular')
    ;

SET FOREIGN_KEY_CHECKS=1;
-- /*!40000 ALTER TABLE * ENABLE KEYS */;
