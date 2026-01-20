-- Database Schema for Gold Accounting App

CREATE DATABASE IF NOT EXISTS gold_accounting;
USE gold_accounting;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    userID VARCHAR(64) PRIMARY KEY COMMENT 'User ID (UUID)',
    phone VARCHAR(20) COMMENT 'Phone Number',
    password VARCHAR(64) COMMENT 'Hashed Password (MD5)',
    nickname VARCHAR(64) DEFAULT 'User' COMMENT 'Nickname',
    avatar VARCHAR(255) DEFAULT '' COMMENT 'Avatar URL',
    openid VARCHAR(64) COMMENT 'WeChat OpenID',
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation Time',
    UNIQUE KEY unique_phone (phone),
    UNIQUE KEY unique_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User Information';

-- Gold Records Table
CREATE TABLE IF NOT EXISTS gold_records (
    recordID VARCHAR(64) PRIMARY KEY COMMENT 'Record ID (UUID)',
    userID VARCHAR(64) NOT NULL COMMENT 'User ID',
    tradeType VARCHAR(20) NOT NULL COMMENT 'Trade Type: buy/sell',
    category VARCHAR(50) COMMENT 'Category (e.g., Gold Bar, ETF)',
    weight DECIMAL(10, 2) NOT NULL COMMENT 'Weight (g)',
    unitPrice DECIMAL(10, 2) NOT NULL COMMENT 'Unit Price (CNY/g)',
    totalPrice DECIMAL(10, 2) NOT NULL COMMENT 'Total Price (CNY)',
    tradeTime DATETIME NOT NULL COMMENT 'Trade Time',
    channel VARCHAR(50) COMMENT 'Purchase Channel',
    remark TEXT COMMENT 'Remarks',
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record Creation Time',
    INDEX idx_userid (userID),
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Gold Transaction Records';
