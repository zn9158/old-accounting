const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// 获取历史金价数据
router.get('/historical-prices', marketController.getHistoricalPrices);

// 获取金价新闻
router.get('/news', marketController.getGoldNews);

module.exports = router;
