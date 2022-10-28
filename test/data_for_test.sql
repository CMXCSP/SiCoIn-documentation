
/*!40000 ALTER TABLE `personal_operativo` DISABLE KEYS */;

-- Tabla personal_operativo
INSERT INTO `personal_operativo` (`no_empleado`, `actividad`, `nombres`, `primer_apellido`, `segundo_apellido`, `nombramiento`, `CURP`, `activo`) VALUES
	('10244100', 'coordinador', 'Alberto', 'B', NULL, 'PTT', 'ALBE2000HMX', 1),
	('10244199', 'coordinador', 'Alexandro', 'A', NULL, 'PTT', 'ALEX200000HMX', 1),
    ('900156', 'coordinador', 'Pitagoras', 'de Grecia', NULL, 'PTT', 'PETE150601HEU', 0),
	('1034123', 'juzgador', 'Christina', 'S', NULL, 'JC', 'CRIS20050830MMX', 1),
	('10348555', 'juzgador', 'Ana', 'H', NULL, 'JC', 'ANAS2000MMX', 1),
	('10358628', 'juzgador', 'Roberta', 'M', NULL, 'JC', 'ROBE200510MMX', 1),
    ('10478554', 'perito', 'Laura', 'R', NULL, 'PTT', 'LARA2000MMX', 1),
	('11968636', 'perito', 'Marvin', 'P', NULL, 'PTT', 'MAVY202310UMX', 1),
    ('11868663', 'perito', 'Miguel', 'P', NULL, 'PTT', 'MIKE202310HMX', 1),
	('10068663', 'perito', 'Miguel', 'P', NULL, 'PTT', 'MICE200310HMX', 1),
	('10778692', 'perito', 'Joss', 'P', NULL, 'PTT', 'JOSS202310HMX', 1),
    ('11768692', 'valuador', 'Josep', 'P', NULL, 'PTT', 'JOSE202310HMX', 1),
	('10968682', 'valuador', 'Jose', 'P', NULL, 'PTT', 'JOSH202310HMX', 1),
    ('17678641', 'mecanico', 'Fernanda', 'P', NULL, 'PTT', 'FERN202210MMX', 1),
	('11668641', 'mecanico', 'Marco', 'V', NULL, 'PTT', 'MARC202310HMX', 1)
	;

-- Tabla baseperitosprueba.procedimiento
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

-- tabla baseperitosprueba.intervencion
INSERT INTO `intervencion` (`folioDictamen`, `id_procedimiento`, `estado`, `especialidad`, `solicitud`, `intervencion`, `entrega`, `extension`, `id_tipo_hecho`, `documento`, `entrega_digital`, `ne_coordinador_asigna`, `ne_juzgador_solicita`, `ne_perito_asignado`, `ne_coordinador_recibe`, `ne_juzgador_recibe`) VALUES
	(1, 1, 'Concluido', 'transito', '2022-02-13 15:01', '2022-02-13 16:01', '2022-02-13 20:01', NULL, 1, 'Dictamen', NULL, '10244100', '1034123', '10478554', '10244199', NULL),
	(2, 2, 'Concluido', 'transito', '2022-02-13 15:31', '2022-02-13 16:31', '2022-02-13 20:31', NULL, 2, 'Dictamen', NULL, '10244100', '1034123', '11968636', '10244199', NULL),
	(3, 3, 'Concluido', 'transito', '2022-02-13 15:41', '2022-02-13 16:41', '2022-02-13 20:41', NULL, 3, 'Dictamen', NULL, '10244100', '1034123', '11868663', '10244199', NULL),
	(4, 1, 'Concluido', 'mecanico', '2022-02-13 15:51', '2022-02-13 16:51', '2022-02-13 20:51', NULL, 1, 'Dictamen', NULL, '10244100', '1034123', '17678641', '10244199', NULL),
	(5, 4, 'Concluido', 'transito', '2022-02-13 16:00', '2022-02-13 17:00', '2022-02-13 21:00', NULL, 5, 'Dictamen', NULL, '10244100', '1034123', '10068663', '10244199', NULL),
	(6, 1, 'Concluido', 'bienes', '2022-02-13 15:01', '2022-02-13 16:01', '2022-02-13 20:01', NULL, 6, 'Dictamen', NULL, '10244100', '1034123', '11768692', '10244199', NULL),
	(7, 5, 'CI Pendiente', 'transito', '2022-02-13 15:01', '2022-02-13 16:01', NULL, NULL, 8, NULL, NULL, '10244100', '1034123', '10478554', '10244199', NULL),
	(8, 6, 'Concluido', 'transito', '2022-02-13 20:09', '2022-02-13 21:09', '2022-02-14 00:09', NULL, 1, 'Dictamen', NULL, '10244100', '1034123', '10068663', '10244199', NULL),
	(9, 7, 'En Proceso', 'transito', '2022-02-13 20:11', '2022-02-13 21:11', NULL, NULL, 9, NULL, NULL, '10244100', '1034123', '10778692', '10244199', NULL),
	(10, 7, 'En Proceso', 'bienes', '2022-02-13 20:15', '2022-02-13 21:15', NULL, NULL, 10, NULL, NULL, '10244100', '1034123', '10968682', '10244199', NULL),
	(11, 8, 'En Proceso', 'transito', '2022-02-13 21:30', '2022-02-13 22:30', NULL, NULL, 11, NULL, NULL, '10244100', '1034123', '11968636', '10244199', NULL),
	(12, 1, 'En Proceso', 'ampliacion', '2022-02-13 21:31', '2022-02-13 22:31', NULL, NULL, 12, NULL, NULL, '10244100', '1034123', '10778692', '10244199', NULL),
	(13, 3, 'Agendado', 'mecanico', '2022-02-13 15:01', '2022-02-13 16:01', NULL, NULL, 7, NULL, NULL, '10244100', '1034123', '11668641', '10244199', NULL)
	;








/*!40000 ALTER TABLE `procedimiento` ENABLE KEYS */;
