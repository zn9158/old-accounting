const db = require('../config/db');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// 注册
exports.register = async (req, res) => {
    const { phone, password, type, openid } = req.body;

    // 简单验证
    if (!password && type !== 'wechat') {
        return res.status(400).json({ code: 400, message: '密码不能为空' });
    }

    try {
        // 检查手机号是否已存在
        if (phone) {
            const [rows] = await db.query('SELECT userID FROM users WHERE phone = ?', [phone]);
            if (rows.length > 0) {
                return res.status(400).json({ code: 400, message: '该手机号已注册' });
            }
        }

        const userID = uuidv4().replace(/-/g, '');
        const hashedPassword = password ? md5(password) : null;
        const nickname = '用户_' + Math.random().toString(36).substr(2, 6);

        // 插入用户
        // 注意：这里为了简化，支持手机号注册或微信注册。
        // 如果是微信注册，password为null，openid必填。
        // 如果是手机注册，openid可选。

        const query = 'INSERT INTO users (userID, phone, password, nickname, openid) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [userID, phone, hashedPassword, nickname, openid || null]);

        res.status(201).json({ code: 200, message: '注册成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
};

// 登录
exports.login = async (req, res) => {
    const { phone, password, openid, type } = req.body;

    try {
        let user = null;

        if (type === 'wechat') {
            // 微信登录逻辑
            const [rows] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
            user = rows[0];
            if (!user) {
                return res.status(404).json({ code: 404, message: '用户不存在，请先注册' });
            }
        } else {
            // 账号密码登录
            const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
            user = rows[0];

            // 用户不存在
            if (!user) {
                return res.status(404).json({ code: 404, message: '该手机号未注册，请先注册' });
            }

            // 密码错误
            if (user.password !== md5(password)) {
                return res.status(401).json({ code: 401, message: '密码错误，请重试' });
            }
        }

        // 生成 Token
        const token = jwt.sign(
            { userID: user.userID },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            code: 200,
            message: '登录成功',
            data: {
                token,
                userInfo: {
                    userID: user.userID,
                    nickname: user.nickname,
                    avatar: user.avatar,
                    phone: user.phone
                }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
};

// 获取用户信息
exports.getProfile = async (req, res) => {
    // 从中间件获取的 userID
    const userID = req.user.userID;
    try {
        const [rows] = await db.query('SELECT userID, nickname, avatar, phone, createTime FROM users WHERE userID = ?', [userID]);
        if (rows.length === 0) return res.status(404).json({ code: 404, message: '用户未找到' });
        res.json({ code: 200, data: rows[0] });
    } catch (error) {
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
};
