-- 生产环境 Schema (不包含 CREATE DATABASE，直接在当前库建表)

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    userID VARCHAR(32) PRIMARY KEY COMMENT '用户唯一标识',
    openid VARCHAR(64) COMMENT '微信openid',
    phone VARCHAR(11) UNIQUE COMMENT '手机号',
    password VARCHAR(32) COMMENT 'MD5加密后的密码',
    nickname VARCHAR(32) DEFAULT '微信用户' COMMENT '用户昵称',
    avatar VARCHAR(255) DEFAULT '' COMMENT '用户头像URL',
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 黄金记录表
CREATE TABLE IF NOT EXISTS gold_records (
    recordID VARCHAR(32) PRIMARY KEY COMMENT '记录唯一标识',
    userID VARCHAR(32) NOT NULL COMMENT '关联用户ID',
    tradeType VARCHAR(10) NOT NULL COMMENT '交易类型：买入/赎回',
    category VARCHAR(50) COMMENT '黄金品类',
    weight DECIMAL(10,2) NOT NULL COMMENT '黄金重量(克)',
    unitPrice DECIMAL(10,2) NOT NULL COMMENT '购买单价(元/克)',
    totalPrice DECIMAL(10,2) NOT NULL COMMENT '交易总价(元)',
    tradeTime DATE NOT NULL COMMENT '交易时间',
    channel VARCHAR(50) COMMENT '交易渠道',
    remark VARCHAR(255) COMMENT '备注',
    createTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);
