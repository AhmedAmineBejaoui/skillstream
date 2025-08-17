CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chapter_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `type` enum('video','project') NOT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `presentation_url` varchar(500) DEFAULT NULL,
  `overview` longtext NOT NULL,
  `sort_order` int NOT NULL,
  `is_preview` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_lessons_chapter` (`chapter_id`),
  CONSTRAINT `fk_lessons_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
