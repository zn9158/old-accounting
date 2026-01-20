const db = require('../config/db');

// 获取所有用户列表 (含资产汇总)
exports.getUsers = async (req, res) => {
    try {
        // 1. 获取所有用户
        const [users] = await db.query('SELECT userID, phone, nickname, createTime FROM users ORDER BY createTime DESC');

        // 2. 获取所有交易记录
        const [records] = await db.query('SELECT userID, tradeType, weight, totalPrice FROM gold_records');

        // 3. 内存聚合计算每个用户的资产
        // 也可以用复杂 SQL，但内存计算对于小规模数据更清晰
        const userAssets = {};

        records.forEach(r => {
            if (!userAssets[r.userID]) {
                userAssets[r.userID] = { weight: 0, cost: 0 };
            }
            const w = parseFloat(r.weight || 0);
            const p = parseFloat(r.totalPrice || 0);

            if (r.tradeType === 'buy' || r.tradeType === '买入') {
                userAssets[r.userID].weight += w;
                userAssets[r.userID].cost += p;
            } else if (r.tradeType === 'sell' || r.tradeType === '卖出') {
                userAssets[r.userID].weight -= w;
                userAssets[r.userID].cost -= p;
            }
        });

        // 4. 合并数据
        const result = users.map(u => {
            const asset = userAssets[u.userID] || { weight: 0, cost: 0 };
            return {
                ...u,
                totalWeight: parseFloat(asset.weight.toFixed(2)),
                totalCost: parseFloat(asset.cost.toFixed(2))
            };
        });

        res.json({ code: 200, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '获取用户列表失败' });
    }
};

// 获取特定用户的交易记录
exports.getUserRecords = async (req, res) => {
    const { userID } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM gold_records WHERE userID = ? ORDER BY tradeTime DESC', [userID]);
        res.json({ code: 200, data: rows });
    } catch (error) {
        res.status(500).json({ code: 500, message: '获取记录失败' });
    }
};
