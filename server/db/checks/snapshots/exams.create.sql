CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `instructions` json DEFAULT NULL,
  `requirements` json DEFAULT NULL,
  `duration_hours` int NOT NULL,
  `total_marks` int DEFAULT '100',
  `passing_marks` int DEFAULT '70',
  `attempts_limit` int DEFAULT '3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_exams_course` (`course_id`),
  CONSTRAINT `fk_exams_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
