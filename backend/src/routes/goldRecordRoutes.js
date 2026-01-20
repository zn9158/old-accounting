const express = require('express');
const router = express.Router();
const goldRecordController = require('../controllers/goldRecordController');
const authMiddleware = require('../utils/authMiddleware');

// Price API (Public or Protected? PRD says Public price, but User specific actions need auth. Let's protect all for simplicity or verify requirement.)
// PRD: "获取黄金实时价格接口：无需用户ID（公开行情数据）"
router.get('/price', goldRecordController.getGoldPrice);

// Protected Routes
router.use(authMiddleware);

router.post('/', goldRecordController.addRecord);
router.get('/', goldRecordController.getList);
router.get('/:id', goldRecordController.getDetail);
router.put('/:id', goldRecordController.updateRecord);
router.delete('/:id', goldRecordController.deleteRecord);

module.exports = router;
