const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// 简单的内存缓存用于金价
let goldPriceCache = {
    price: 0,
    time: 0,
    source: 'Mock Data'
};

// 获取实时金价
exports.getGoldPrice = async (req, res) => {
    const now = Date.now();
    // 缓存 1 分钟 (60000ms) - 实时性要求高一些
    if (now - goldPriceCache.time < 60000 && goldPriceCache.price > 0) {
        return res.json({
            code: 200,
            data: {
                price: goldPriceCache.price,
                source: goldPriceCache.source,
                updateTime: new Date(goldPriceCache.time)
            }
        });
    }

    try {
        // 使用新浪财经接口获取 国际金价(hf_XAU) 和 离岸人民币汇率(USDCNY)
        // hf_XAU: 伦敦金 (USD/oz)
        // USDCNY: 美元兑人民币
        const response = await axios.get('http://hq.sinajs.cn/list=hf_XAU,USDCNY', {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            }
        });

        const data = response.data;
        // 解析数据
        // var hq_str_hf_XAU="price,..."
        // var hq_str_USDCNY="time,price,..." -- 注意 USDCNY 格式可能不同

        let xauPrice = 0;
        let usdcny = 0;

        // 解析 hf_XAU
        const xauMatch = data.match(/hq_str_hf_XAU="([^"]+)"/);
        if (xauMatch && xauMatch[1]) {
            const parts = xauMatch[1].split(',');
            // 第0位是当前价格
            xauPrice = parseFloat(parts[0]);
        }

        // 解析 USDCNY
        const rateMatch = data.match(/hq_str_USDCNY="([^"]+)"/);
        if (rateMatch && rateMatch[1]) {
            const parts = rateMatch[1].split(',');
            // USDCNY 格式: 时间, ?, ?, ?, ?, 报价? 
            // 刚才curl结果: "16:57:02,6.9590,6.9591,6.9638,46,6.9608..."
            // 通常第1位或第8位是现价? 让我们保守一点取第1位(6.9590)或第8位(6.9594)。
            // 常见新浪汇率: 时间, 现汇买入, 现钞买入, 现汇卖出, 现钞卖出, 中行折算价... 
            // 但 USDCNY 可能是外汇频道: "时间, 最新价, ..." ?
            // 根据刚才日志: "16:57:02,6.9590,..." -> 看起来第1位是价格
            usdcny = parseFloat(parts[1]);
        }

        if (xauPrice > 0 && usdcny > 0) {
            // 计算人民币金价 (元/克)
            // 1 金衡盎司 = 31.1034768 克
            const priceCNY = (xauPrice * usdcny / 31.1034768).toFixed(2);

            goldPriceCache = {
                price: priceCNY,
                time: now,
                source: '新浪财经 (国际金价折算)'
            };
        } else {
            // Fallback if parsing fails but we have old cache? No, just throw to catch or use mock
            throw new Error("Data parsing failed");
        }

        res.json({
            code: 200,
            data: {
                price: goldPriceCache.price,
                source: goldPriceCache.source,
                updateTime: new Date(goldPriceCache.time)
            }
        });
    } catch (error) {
        console.error('新浪财经获取金价失败', error.message);

        // 备用方案1: 尝试金十数据
        try {
            const jin10Response = await axios.get('https://api.jin10.com/data_center/market/au9999', {
                timeout: 3000
            });
            if (jin10Response.data && jin10Response.data.values && jin10Response.data.values.length > 0) {
                const latestPrice = jin10Response.data.values[0][1]; // 获取最新价格
                goldPriceCache = {
                    price: parseFloat(latestPrice).toFixed(2),
                    time: now,
                    source: '金十数据'
                };
                return res.json({
                    code: 200,
                    data: {
                        price: goldPriceCache.price,
                        source: goldPriceCache.source,
                        updateTime: new Date(goldPriceCache.time)
                    }
                });
            }
        } catch (jin10Error) {
            console.error('金十数据获取失败', jin10Error.message);
        }

        // 备用方案2: 使用缓存数据
        if (goldPriceCache.price > 0) {
            return res.json({
                code: 200,
                data: {
                    price: goldPriceCache.price,
                    source: goldPriceCache.source + ' (缓存)',
                    updateTime: new Date(goldPriceCache.time),
                    warning: '接口异常，使用缓存数据'
                }
            });
        }

        // 最后降级: 使用模拟数据
        const mockPrice = (480 + Math.random() * 10).toFixed(2);
        res.json({
            code: 200,
            data: {
                price: mockPrice,
                source: '模拟数据 (接口故障)',
                updateTime: new Date()
            }
        });
    }
};

// 添加记录
exports.addRecord = async (req, res) => {
    const userID = req.user.userID;
    const { tradeType, category, weight, unitPrice, tradeTime, channel, remark } = req.body;

    if (!weight || !unitPrice || !tradeTime) {
        return res.status(400).json({ code: 400, message: '必填项缺失' });
    }

    const recordID = uuidv4().replace(/-/g, '');
    const totalPrice = (parseFloat(weight) * parseFloat(unitPrice)).toFixed(2);
    const type = tradeType || 'buy'; // 默认买入

    try {
        const query = `
      INSERT INTO gold_records 
      (recordID, userID, tradeType, category, weight, unitPrice, totalPrice, tradeTime, channel, remark) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await db.query(query, [
            recordID, userID, type, category, weight, unitPrice, totalPrice, tradeTime, channel, remark
        ]);

        res.status(201).json({ code: 200, message: '添加成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '添加失败' });
    }
};

// 获取记录列表 (含资产汇总)
exports.getList = async (req, res) => {
    const userID = req.user.userID;

    try {
        // 查询所有记录
        const [records] = await db.query(
            'SELECT * FROM gold_records WHERE userID = ? ORDER BY tradeTime DESC, createTime DESC',
            [userID]
        );

        // 计算资产汇总
        let totalWeight = 0;
        let totalCost = 0;

        records.forEach(record => {
            const w = parseFloat(record.weight);
            const p = parseFloat(record.totalPrice);

            if (record.tradeType === 'buy' || record.tradeType === '买入') {
                totalWeight += w;
                totalCost += p;
            } else if (record.tradeType === 'sell' || record.tradeType === '赎回') {
                totalWeight -= w;
                // 赎回时成本怎么算？通常简单减去对应比例成本，或者不减成本只减重量（导致持仓成本变高），或者这只是流水账。
                // PRD: "赎回记录自动扣减对应数据"
                // 简单处理：按比例扣减总成本，或者直接减去 赎回时的 "总价" (这其实是卖出金额，不是成本)。
                // 修正：PRD说 "自动统计所有买入记录的重量总和与总价总和，赎回记录自动扣减对应数据"。
                // 这里的 "扣减对应数据" 有歧义。
                // 解释A: 卖出 10g，总重量-10。总成本减多少？如果总成本是"投入的本金"，卖出是"收回资金"。
                // 这里为了简单，我们假设：总成本 = 买入总金额 - 卖出总金额 (如果卖出赚钱了，成本可能变成负数，即盈利)。
                // 或者：总成本仅统计 "当前持仓的成本"。这需要加权平均算法。
                // 为了符合 "轻量化流水账" 逻辑，我暂时按：总重量 = 买入重 - 卖出重；总成本 = 买入总额 - 卖出总额。
                // 这样 "Total Cost" 其实是 "Net Investment" (净投入)。
                totalCost -= p;
            }
        });

        res.json({
            code: 200,
            data: {
                summary: {
                    totalWeight: parseFloat(totalWeight.toFixed(2)),
                    totalCost: parseFloat(totalCost.toFixed(2))
                },
                list: records
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '获取列表失败' });
    }
};

// 获取详情
exports.getDetail = async (req, res) => {
    const userID = req.user.userID;
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM gold_records WHERE recordID = ? AND userID = ?', [id, userID]);
        if (rows.length === 0) return res.status(404).json({ code: 404, message: '记录未找到' });
        res.json({ code: 200, data: rows[0] });
    } catch (error) {
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
};

// 更新记录
exports.updateRecord = async (req, res) => {
    const userID = req.user.userID;
    const { id } = req.params;
    const { tradeType, category, weight, unitPrice, tradeTime, channel, remark } = req.body;

    const totalPrice = (parseFloat(weight) * parseFloat(unitPrice)).toFixed(2);

    try {
        const query = `
            UPDATE gold_records 
            SET tradeType=?, category=?, weight=?, unitPrice=?, totalPrice=?, tradeTime=?, channel=?, remark=?
            WHERE recordID=? AND userID=?
        `;
        const [result] = await db.query(query, [
            tradeType, category, weight, unitPrice, totalPrice, tradeTime, channel, remark, id, userID
        ]);

        if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '记录未找到或无权修改' });
        res.json({ code: 200, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ code: 500, message: '更新失败' });
    }
};

// 删除记录
exports.deleteRecord = async (req, res) => {
    const userID = req.user.userID;
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM gold_records WHERE recordID=? AND userID=?', [id, userID]);
        if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '记录未找到' });
        res.json({ code: 200, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: 500, message: '删除失败' });
    }
};
