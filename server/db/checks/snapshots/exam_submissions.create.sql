CREATE TABLE `exam_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `exam_id` int NOT NULL,
  `submission_notes` text,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `feedback` text,
  `status` enum('in progress','submitted','graded','revision_required') DEFAULT 'in progress',
  `attempt_number` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_exam_submissions_user` (`user_id`),
  KEY `fk_exam_submissions_exam` (`exam_id`),
  CONSTRAINT `fk_exam_submissions_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exam_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
