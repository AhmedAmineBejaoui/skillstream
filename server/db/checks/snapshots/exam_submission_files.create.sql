CREATE TABLE `exam_submission_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `file_name` varchar(100) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_url` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_exam_submission_files_submission` (`submission_id`),
  CONSTRAINT `fk_exam_submission_files_submission` FOREIGN KEY (`submission_id`) REFERENCES `exam_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
