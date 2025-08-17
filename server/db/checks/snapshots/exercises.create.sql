CREATE TABLE `exercises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `instructions` json DEFAULT NULL,
  `is_complete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_exercises_lesson` (`lesson_id`),
  CONSTRAINT `fk_exercises_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
