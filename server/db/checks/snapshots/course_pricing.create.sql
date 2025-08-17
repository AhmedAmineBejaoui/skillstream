CREATE TABLE `course_pricing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `tier` enum('basic','pro','premium') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `features` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_course_tier` (`course_id`,`tier`),
  CONSTRAINT `fk_course_pricing_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
