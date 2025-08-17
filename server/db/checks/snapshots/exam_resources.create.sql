CREATE TABLE `exam_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `file_name` varchar(200) NOT NULL,
  `file_description` text NOT NULL,
  `file_type` varchar(200) NOT NULL,
  `file_url` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_exam_resources_exam` (`exam_id`),
  CONSTRAINT `fk_exam_resources_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
