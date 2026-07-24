-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: rental_ps
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int unsigned DEFAULT NULL,
  `detail_json` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_user` (`user_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commissions`
--

DROP TABLE IF EXISTS `commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int unsigned NOT NULL,
  `unit_id` int unsigned NOT NULL,
  `owner_id` int unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('unpaid','paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `unit_id` (`unit_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `rental_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commissions_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commissions_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commissions`
--

LOCK TABLES `commissions` WRITE;
/*!40000 ALTER TABLE `commissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `console_types`
--

DROP TABLE IF EXISTS `console_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `console_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `console_types`
--

LOCK TABLES `console_types` WRITE;
/*!40000 ALTER TABLE `console_types` DISABLE KEYS */;
INSERT INTO `console_types` VALUES (1,'PS3','PlayStation 3','2026-07-22 16:41:53'),(2,'PS4','PlayStation 4','2026-07-22 16:41:53'),(3,'PS2','PlayStation 2','2026-07-22 16:41:53'),(4,'PC','Personal Computer','2026-07-22 16:41:53'),(5,'XBOX','Xbox Series X/S','2026-07-22 16:41:53'),(6,'NINTENDO','Nintendo Switch','2026-07-22 16:41:53');
/*!40000 ALTER TABLE `console_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `debts`
--

DROP TABLE IF EXISTS `debts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('utang','piutang') NOT NULL,
  `person_name` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` text,
  `due_date` date DEFAULT NULL,
  `status` enum('pending','paid') NOT NULL DEFAULT 'pending',
  `kasir_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_debt_kasir` (`kasir_id`),
  CONSTRAINT `fk_debt_kasir` FOREIGN KEY (`kasir_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `debts`
--

LOCK TABLES `debts` WRITE;
/*!40000 ALTER TABLE `debts` DISABLE KEYS */;
INSERT INTO `debts` VALUES (3,'piutang','Bapak',15000.00,'',NULL,'pending',1,'2026-07-23 06:17:27','2026-07-23 06:17:27'),(7,'piutang','Aku',12500.00,'',NULL,'pending',1,'2026-07-23 13:39:45','2026-07-23 13:39:45'),(8,'piutang','Aku',5000.00,'',NULL,'pending',1,'2026-07-24 07:32:04','2026-07-24 07:32:04'),(9,'piutang','Deven',3000.00,'',NULL,'pending',1,'2026-07-24 08:15:27','2026-07-24 08:15:27');
/*!40000 ALTER TABLE `debts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `shift_id` int unsigned DEFAULT NULL,
  `kasir_id` int unsigned NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_expense_shift` (`shift_id`),
  KEY `fk_expense_user` (`kasir_id`),
  CONSTRAINT `fk_expense_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`),
  CONSTRAINT `fk_expense_user` FOREIGN KEY (`kasir_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (1,1,1,'Piutang / Pinjaman','Piutang: Bapak',15000.00,'2026-07-23 06:17:27'),(3,1,1,'Pembelian Sparepart TV','Bayar Kurir',48000.00,'2026-07-23 13:28:42'),(6,1,1,'Piutang / Pinjaman','Piutang: Aku',12500.00,'2026-07-23 13:39:45'),(7,2,1,'Piutang / Pinjaman','Piutang: Aku',5000.00,'2026-07-24 07:32:04');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fixed_expenses`
--

DROP TABLE IF EXISTS `fixed_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fixed_expenses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `expense_date` date NOT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fixed_expenses`
--

LOCK TABLES `fixed_expenses` WRITE;
/*!40000 ALTER TABLE `fixed_expenses` DISABLE KEYS */;
INSERT INTO `fixed_expenses` VALUES (2,'2026-07-20','Air',150000.00,'',1,'2026-07-23 14:09:25','2026-07-23 14:09:25'),(3,'2026-07-20','Listrik',100000.00,'',1,'2026-07-23 14:09:54','2026-07-23 14:09:54');
/*!40000 ALTER TABLE `fixed_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_points_history`
--

DROP TABLE IF EXISTS `member_points_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member_points_history` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `member_id` int unsigned NOT NULL,
  `session_id` int unsigned DEFAULT NULL,
  `points_change` int NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_points_member` (`member_id`),
  KEY `fk_points_session` (`session_id`),
  CONSTRAINT `fk_points_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `fk_points_session` FOREIGN KEY (`session_id`) REFERENCES `rental_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_points_history`
--

LOCK TABLES `member_points_history` WRITE;
/*!40000 ALTER TABLE `member_points_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `member_points_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `tier` enum('reguler','silver','gold') NOT NULL DEFAULT 'reguler',
  `points` int NOT NULL DEFAULT '0',
  `time_balance` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,'Deven','','reguler',0,0,'2026-07-23 06:01:39'),(5,'Rama',NULL,'reguler',0,32,'2026-07-24 05:30:42'),(6,'Wafa',NULL,'reguler',0,19,'2026-07-24 07:09:29'),(7,'Ken',NULL,'reguler',0,0,'2026-07-24 08:27:29');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owners`
--

DROP TABLE IF EXISTS `owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owners` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owners`
--

LOCK TABLES `owners` WRITE;
/*!40000 ALTER TABLE `owners` DISABLE KEYS */;
INSERT INTO `owners` VALUES (1,'Farel','','',NULL,'2026-07-22 16:49:58','2026-07-22 16:49:58');
/*!40000 ALTER TABLE `owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `duration_minutes` int unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `console_type` varchar(50) DEFAULT 'Semua',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'1 Jam',60,4000.00,1,'2026-07-22 16:41:37','PS3',0.00),(2,'2 Jam',120,8000.00,1,'2026-07-22 16:41:37','PS3',0.00),(3,'3 Jam',180,12000.00,1,'2026-07-22 16:41:37','PS3',0.00),(4,'1 Jam - Bocil',60,3000.00,1,'2026-07-23 06:02:19','PS3',0.00),(5,'2 Jam - Bocil',120,6000.00,1,'2026-07-23 06:02:40','PS3',0.00),(6,'3 Jam - Bocil',180,9000.00,1,'2026-07-23 06:03:09','PS3',0.00),(7,'1 Jam',60,2000.00,1,'2026-07-23 14:17:30','PS2',0.00),(8,'2 Jam',120,4000.00,1,'2026-07-23 14:17:54','PS2',0.00),(9,'3 Jam',180,6000.00,1,'2026-07-23 14:18:25','PS2',0.00),(10,'30 Menit',30,2000.00,1,'2026-07-24 08:17:04','PS3',0.00),(11,'30 Menit',30,1500.00,1,'2026-07-24 08:17:21','PS2',0.00);
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Makanan','2026-07-22 18:14:56'),(2,'Minuman','2026-07-22 18:14:56'),(3,'Rokok','2026-07-22 18:14:56'),(4,'Lainnya','2026-07-22 18:14:56');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category_id` int unsigned DEFAULT NULL,
  `cost_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Mie Goreng',1,1500.00,4000.00,14,1,'2026-07-22 17:16:43'),(2,'Telor',1,1500.00,2000.00,3,1,'2026-07-23 03:10:47'),(3,'Power F',2,916.00,1000.00,1,1,'2026-07-23 03:25:13'),(4,'Es Teh',2,200.00,2500.00,18,1,'2026-07-23 03:31:32');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promos`
--

DROP TABLE IF EXISTS `promos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valid_from` datetime DEFAULT NULL,
  `valid_until` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promos`
--

LOCK TABLES `promos` WRITE;
/*!40000 ALTER TABLE `promos` DISABLE KEYS */;
/*!40000 ALTER TABLE `promos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rental_sessions`
--

DROP TABLE IF EXISTS `rental_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rental_sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` int unsigned NOT NULL,
  `package_id` int unsigned DEFAULT NULL,
  `member_id` int unsigned DEFAULT NULL,
  `promo_id` int unsigned DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `session_type` enum('walkin','booking') NOT NULL DEFAULT 'walkin',
  `start_time` datetime NOT NULL,
  `planned_end_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int unsigned NOT NULL,
  `extra_minutes` int unsigned NOT NULL DEFAULT '0',
  `deposit_time_used` int unsigned NOT NULL DEFAULT '0',
  `status` enum('ongoing','completed','cancelled') NOT NULL DEFAULT 'ongoing',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `created_by` int unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_session_package` (`package_id`),
  KEY `fk_session_member` (`member_id`),
  KEY `fk_session_promo` (`promo_id`),
  KEY `fk_session_user` (`created_by`),
  KEY `idx_session_status` (`status`),
  KEY `idx_session_unit` (`unit_id`),
  CONSTRAINT `fk_session_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `fk_session_package` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`),
  CONSTRAINT `fk_session_promo` FOREIGN KEY (`promo_id`) REFERENCES `promos` (`id`),
  CONSTRAINT `fk_session_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rental_sessions`
--

LOCK TABLES `rental_sessions` WRITE;
/*!40000 ALTER TABLE `rental_sessions` DISABLE KEYS */;
INSERT INTO `rental_sessions` VALUES (1,2,5,1,NULL,NULL,'walkin','2026-07-23 13:08:24','2026-07-23 15:08:24','2026-07-23 17:37:13',120,0,0,'completed',6000.00,1,'2026-07-23 06:08:24','2026-07-23 10:37:13'),(2,2,5,5,NULL,'Walk-in','walkin','2026-07-24 11:02:53','2026-07-24 13:02:53','2026-07-24 12:30:50',120,0,0,'completed',6000.00,1,'2026-07-24 04:02:53','2026-07-24 05:30:50'),(3,2,5,1,NULL,NULL,'walkin','2026-07-24 13:11:04','2026-07-24 15:11:04','2026-07-24 15:11:23',120,0,0,'completed',6000.00,1,'2026-07-24 06:11:04','2026-07-24 08:11:23'),(4,3,7,6,NULL,NULL,'walkin','2026-07-24 14:11:08','2026-07-24 15:11:08','2026-07-24 14:52:03',60,0,0,'completed',2000.00,1,'2026-07-24 07:11:08','2026-07-24 07:52:03'),(5,1,4,7,NULL,NULL,'walkin','2026-07-24 15:28:50','2026-07-24 16:28:50',NULL,60,0,0,'ongoing',NULL,1,'2026-07-24 08:28:50','2026-07-24 08:28:50'),(6,2,4,1,NULL,NULL,'walkin','2026-07-24 15:49:36','2026-07-24 16:49:36',NULL,60,0,0,'ongoing',NULL,1,'2026-07-24 08:49:36','2026-07-24 08:49:36');
/*!40000 ALTER TABLE `rental_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_orders`
--

DROP TABLE IF EXISTS `session_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int unsigned NOT NULL,
  `product_id` int unsigned DEFAULT NULL,
  `item_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` int unsigned NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `session_orders_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `rental_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_orders`
--

LOCK TABLES `session_orders` WRITE;
/*!40000 ALTER TABLE `session_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `session_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('shift_end_time','23:00','Jam auto-close kasir (HH:MM)','2026-07-24 04:44:20'),('shift_start_time','09:00','Jam peringatan buka kasir (HH:MM)','2026-07-24 04:44:20');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shifts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `kasir_id` int unsigned NOT NULL,
  `opening_balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `opening_digital_balance` decimal(12,2) NOT NULL DEFAULT '0.00',
  `closing_balance` decimal(12,2) DEFAULT NULL,
  `closing_digital_balance` decimal(12,2) DEFAULT NULL,
  `expected_balance` decimal(12,2) DEFAULT NULL,
  `expected_digital_balance` decimal(12,2) DEFAULT NULL,
  `difference` decimal(12,2) DEFAULT NULL,
  `digital_difference` decimal(12,2) DEFAULT NULL,
  `status` enum('open','closed') NOT NULL DEFAULT 'open',
  `opened_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_shift_user` (`kasir_id`),
  CONSTRAINT `fk_shift_user` FOREIGN KEY (`kasir_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shifts`
--

LOCK TABLES `shifts` WRITE;
/*!40000 ALTER TABLE `shifts` DISABLE KEYS */;
INSERT INTO `shifts` VALUES (1,1,85000.00,0.00,24500.00,0.00,24500.00,0.00,0.00,0.00,'closed','2026-07-23 03:26:19','2026-07-23 16:00:00'),(2,1,31500.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,'open','2026-07-24 05:27:58',NULL);
/*!40000 ALTER TABLE `shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_adjustments`
--

DROP TABLE IF EXISTS `stock_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_adjustments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `type` enum('in','out','loss','return') COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` int NOT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `stock_adjustments_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_adjustments`
--

LOCK TABLES `stock_adjustments` WRITE;
/*!40000 ALTER TABLE `stock_adjustments` DISABLE KEYS */;
INSERT INTO `stock_adjustments` VALUES (1,1,'in',15,'Stok Awal (Input Baru)',1,'2026-07-22 17:16:43'),(2,2,'in',3,'Stok Awal (Input Baru)',1,'2026-07-23 03:10:47'),(3,3,'in',6,'Stok Awal (Input Baru)',1,'2026-07-23 03:25:13'),(4,4,'in',19,'Stok Awal (Input Baru)',1,'2026-07-23 03:31:32'),(5,3,'out',1,'Penjualan Langsung (Kasir)',1,'2026-07-23 06:03:54'),(6,1,'out',1,'Penjualan Langsung (Kasir)',1,'2026-07-24 04:04:51'),(7,3,'out',4,'Penjualan Langsung (Kasir)',1,'2026-07-24 04:04:51'),(8,4,'out',1,'Penjualan Langsung (Kasir)',1,'2026-07-24 07:17:27');
/*!40000 ALTER TABLE `stock_adjustments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_items`
--

DROP TABLE IF EXISTS `transaction_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` int unsigned NOT NULL,
  `product_id` int unsigned DEFAULT NULL,
  `item_name` varchar(100) NOT NULL,
  `qty` int unsigned NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_item_trx` (`transaction_id`),
  KEY `fk_item_product` (`product_id`),
  CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_item_trx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_items`
--

LOCK TABLES `transaction_items` WRITE;
/*!40000 ALTER TABLE `transaction_items` DISABLE KEYS */;
INSERT INTO `transaction_items` VALUES (1,1,3,'Power F',1,1000.00,1000.00),(2,3,1,'Mie Goreng',1,4000.00,4000.00),(3,3,3,'Power F',4,1000.00,4000.00),(4,5,4,'Es Teh',1,2500.00,2500.00);
/*!40000 ALTER TABLE `transaction_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int unsigned DEFAULT NULL,
  `shift_id` int unsigned DEFAULT NULL,
  `kasir_id` int unsigned NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'sewa',
  `payment_method` enum('cash','qris','transfer','lainnya','deposit') NOT NULL DEFAULT 'cash',
  `amount` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_trx_session` (`session_id`),
  KEY `fk_trx_shift` (`shift_id`),
  KEY `fk_trx_user` (`kasir_id`),
  KEY `idx_trx_created` (`created_at`),
  CONSTRAINT `fk_trx_session` FOREIGN KEY (`session_id`) REFERENCES `rental_sessions` (`id`),
  CONSTRAINT `fk_trx_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`),
  CONSTRAINT `fk_trx_user` FOREIGN KEY (`kasir_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,NULL,1,1,'produk','cash',1000.00,0.00,NULL,'2026-07-23 06:03:54'),(2,1,1,1,'sewa','cash',6000.00,0.00,'','2026-07-23 10:37:13'),(3,NULL,1,1,'produk','cash',8000.00,0.00,NULL,'2026-07-24 04:04:51'),(4,2,2,1,'sewa','cash',6000.00,0.00,'','2026-07-24 05:30:50'),(5,NULL,2,1,'produk','cash',2500.00,0.00,NULL,'2026-07-24 07:17:27'),(6,4,2,1,'sewa','cash',2000.00,0.00,'','2026-07-24 07:52:03'),(7,3,2,1,'sewa','cash',6000.00,0.00,'','2026-07-24 08:11:23');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `units` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `console_type` varchar(30) NOT NULL DEFAULT 'PS4',
  `hourly_rate` decimal(10,2) NOT NULL DEFAULT '0.00',
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `status` enum('kosong','dipakai','maintenance') NOT NULL DEFAULT 'kosong',
  `notes` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `owner_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `units_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES (1,'PS3 - Unit 1','PS3',10000.00,30.00,'dipakai','',1,1,'2026-07-22 16:41:37','2026-07-24 08:28:50'),(2,'PS3 - Unit 2','PS3',10000.00,0.00,'dipakai','',1,NULL,'2026-07-22 16:41:37','2026-07-24 08:49:36'),(3,'PS2 - Unit 1','PS2',15000.00,0.00,'kosong','',1,NULL,'2026-07-22 16:41:37','2026-07-24 07:52:03');
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','kasir','mitra') NOT NULL DEFAULT 'kasir',
  `owner_id` int unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_user_owner` (`owner_id`),
  CONSTRAINT `fk_user_owner` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2y$10$PcnGvDr3wGOjRbM6F537qOu8zc9Ea459/NCnLENAo7p/BQXSgd3jG','Administrator','admin',NULL,1,'2026-07-22 16:41:37','2026-07-22 16:41:37'),(2,'Farel','$2y$10$gLVjbhRGITG3rQN/lE0.2OI3zASPAVjA9l/hYiLAvQZGKUYt7LPV.','Farel','mitra',1,1,'2026-07-23 11:07:41','2026-07-23 11:07:41');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-24 16:14:40
