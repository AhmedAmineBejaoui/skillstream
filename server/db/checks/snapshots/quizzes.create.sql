CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chapter_id` int DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `questions` json NOT NULL,
  `passing_score` int DEFAULT '80',
  `time_limit_minutes` int DEFAULT '15',
  `attempts_allowed` int DEFAULT '3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_quizzes_chapter` (`chapter_id`),
  CONSTRAINT `fk_quizzes_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
