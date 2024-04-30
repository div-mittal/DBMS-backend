-- This file is used to create the tables in the database

CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `State` varchar(45) NOT NULL,
  `District` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `FirstName` varchar(45) NOT NULL,
  `LastName` varchar(45) NOT NULL,
  `Password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `donors` (
  `ID` int NOT NULL,
  `State` varchar(45) NOT NULL,
  `District` varchar(45) NOT NULL,
  `Mobile` double NOT NULL,
  `BloodGroup` varchar(10) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `bloodbank` (
  `id` int NOT NULL,
  `A+` int DEFAULT '0',
  `A-` int DEFAULT '0',
  `B+` int DEFAULT '0',
  `B-` int DEFAULT '0',
  `O+` int DEFAULT '0',
  `O-` int DEFAULT '0',
  `AB+` int DEFAULT '0',
  `AB-` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ID_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Path: server/config/tables.sql