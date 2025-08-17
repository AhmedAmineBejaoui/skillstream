CREATE TABLE `email_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_email` varchar(100) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `template_name` varchar(100) DEFAULT NULL,
  `status` enum('sent','failed','bounced') DEFAULT 'sent',
  `error_message` text,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
