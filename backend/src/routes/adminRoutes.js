const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 简单的权限校验中间件
const adminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    // 简单硬编码 Key，实际应放在 ENV 或数据库
    if (adminKey === 'gold-admin-2026') {
        next();
    } else {
        res.status(403).json({ code: 403, message: '无权访问' });
    }
};

router.use(adminAuth);

router.get('/users', adminController.getUsers);
router.get('/users/:userID/records', adminController.getUserRecords);

module.exports = router;
