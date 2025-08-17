# Database Schema Check — Evidence

## 3.1 User Management Tables

Users table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\users.create.sql (L1-L19)
- Artefacts : server\db\checks\snapshots\users.columns.json ; server\db\checks\snapshots\users.constraints.json

User profiles table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : OK
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\user_profiles.create.sql (L1-L12)
- Artefacts : server\db\checks\snapshots\user_profiles.columns.json ; server\db\checks\snapshots\user_profiles.constraints.json

## 3.2 Course Management Tables

Categories table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\categories.create.sql (L1-L12)
- Artefacts : server\db\checks\snapshots\categories.columns.json ; server\db\checks\snapshots\categories.constraints.json

Instructors table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\instructors.create.sql (L1-L15)
- Artefacts : server\db\checks\snapshots\instructors.columns.json ; server\db\checks\snapshots\instructors.constraints.json

Courses table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\courses.create.sql (L1-L29)
- Artefacts : server\db\checks\snapshots\courses.columns.json ; server\db\checks\snapshots\courses.constraints.json

Course pricing table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\course_pricing.create.sql (L1-L12)
- Artefacts : server\db\checks\snapshots\course_pricing.columns.json ; server\db\checks\snapshots\course_pricing.constraints.json

Chapters table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\chapters.create.sql (L1-L13)
- Artefacts : server\db\checks\snapshots\chapters.columns.json ; server\db\checks\snapshots\chapters.constraints.json

Lessons table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\lessons.create.sql (L1-L16)
- Artefacts : server\db\checks\snapshots\lessons.columns.json ; server\db\checks\snapshots\lessons.constraints.json

Exercises table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\exercises.create.sql (L1-L11)
- Artefacts : server\db\checks\snapshots\exercises.columns.json ; server\db\checks\snapshots\exercises.constraints.json

## 3.3 Assessment & Progress Tables

Quizzes table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\quizzes.create.sql (L1-L13)
- Artefacts : server\db\checks\snapshots\quizzes.columns.json ; server\db\checks\snapshots\quizzes.constraints.json

User course progress table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\user_course_progress.create.sql (L1-L16)
- Artefacts : server\db\checks\snapshots\user_course_progress.columns.json ; server\db\checks\snapshots\user_course_progress.constraints.json

User lesson progress table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\user_lesson_progress.create.sql (L1-L15)
- Artefacts : server\db\checks\snapshots\user_lesson_progress.columns.json ; server\db\checks\snapshots\user_lesson_progress.constraints.json

Quiz attempts table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\quiz_attempts.create.sql (L1-L17)
- Artefacts : server\db\checks\snapshots\quiz_attempts.columns.json ; server\db\checks\snapshots\quiz_attempts.constraints.json

Exams table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\exams.create.sql (L1-L16)
- Artefacts : server\db\checks\snapshots\exams.columns.json ; server\db\checks\snapshots\exams.constraints.json

Exam resources table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : OK
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\exam_resources.create.sql (L1-L11)
- Artefacts : server\db\checks\snapshots\exam_resources.columns.json ; server\db\checks\snapshots\exam_resources.constraints.json

Exam submissions table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\exam_submissions.create.sql (L1-L18)
- Artefacts : server\db\checks\snapshots\exam_submissions.columns.json ; server\db\checks\snapshots\exam_submissions.constraints.json

Exam submission files table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : OK
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\exam_submission_files.create.sql (L1-L10)
- Artefacts : server\db\checks\snapshots\exam_submission_files.columns.json ; server\db\checks\snapshots\exam_submission_files.constraints.json

## 3.4 E-commerce Tables

Cart items table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\cart_items.create.sql (L1-L13)
- Artefacts : server\db\checks\snapshots\cart_items.columns.json ; server\db\checks\snapshots\cart_items.constraints.json

Orders table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\orders.create.sql (L1-L15)
- Artefacts : server\db\checks\snapshots\orders.columns.json ; server\db\checks\snapshots\orders.constraints.json

Order items table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : OK
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\order_items.create.sql (L1-L12)
- Artefacts : server\db\checks\snapshots\order_items.columns.json ; server\db\checks\snapshots\order_items.constraints.json

Coupons table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\coupons.create.sql (L1-L15)
- Artefacts : server\db\checks\snapshots\coupons.columns.json ; server\db\checks\snapshots\coupons.constraints.json

Coupon usage table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\coupon_usage.create.sql (L1-L15)
- Artefacts : server\db\checks\snapshots\coupon_usage.columns.json ; server\db\checks\snapshots\coupon_usage.constraints.json

## 3.5 Content Management Tables

Blog posts table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\blog_posts.create.sql (L1-L19)
- Artefacts : server\db\checks\snapshots\blog_posts.columns.json ; server\db\checks\snapshots\blog_posts.constraints.json

Testimonials table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\testimonials.create.sql (L1-L18)
- Artefacts : server\db\checks\snapshots\testimonials.columns.json ; server\db\checks\snapshots\testimonials.constraints.json

Newsletter subscribers table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\newsletter_subscribers.create.sql (L1-L12)
- Artefacts : server\db\checks\snapshots\newsletter_subscribers.columns.json ; server\db\checks\snapshots\newsletter_subscribers.constraints.json

Course reviews table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\course_reviews.create.sql (L1-L15)
- Artefacts : server\db\checks\snapshots\course_reviews.columns.json ; server\db\checks\snapshots\course_reviews.constraints.json

## 3.6 Certificates and Notifications

Certificates table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\certificates.create.sql (L1-L18)
- Artefacts : server\db\checks\snapshots\certificates.columns.json ; server\db\checks\snapshots\certificates.constraints.json

Notifications table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\notifications.create.sql (L1-L14)
- Artefacts : server\db\checks\snapshots\notifications.columns.json ; server\db\checks\snapshots\notifications.constraints.json

Email logs table
EXIGENCE : "Schéma conforme au cahier de charges"
STATUT : PARTIEL
PREUVES :
- Fichiers/Lignes : server\db\checks\snapshots\email_logs.create.sql (L1-L10)
- Artefacts : server\db\checks\snapshots\email_logs.columns.json ; server\db\checks\snapshots\email_logs.constraints.json

Récapitulatif

OK : 4
PARTIEL : 25
NON : 0