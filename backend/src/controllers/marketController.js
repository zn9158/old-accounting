const axios = require('axios');

// 获取历史金价数据（模拟数据，实际应该从数据库或第三方API获取）
exports.getHistoricalPrices = async (req, res) => {
    try {
        // 生成最近30天的模拟K线数据
        const days = 30;
        const data = [];
        const now = new Date();
        let basePrice = 480;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // 模拟价格波动
            const open = basePrice + (Math.random() - 0.5) * 10;
            const close = open + (Math.random() - 0.5) * 15;
            const high = Math.max(open, close) + Math.random() * 5;
            const low = Math.min(open, close) - Math.random() * 5;

            data.push({
                date: dateStr,
                open: open.toFixed(2),
                high: high.toFixed(2),
                low: low.toFixed(2),
                close: close.toFixed(2),
                volume: Math.floor(Math.random() * 1000 + 500)
            });

            basePrice = parseFloat(close.toFixed(2));
        }

        res.json({
            code: 200,
            data: data
        });
    } catch (error) {
        console.error('获取历史金价失败', error);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
};

// 获取金价新闻
exports.getGoldNews = async (req, res) => {
    try {
        // 模拟新闻数据（实际应该爬取或调用新闻API）
        const news = [
            {
                id: 1,
                title: '高盛：预计2026年金价将突破3000美元/盎司',
                source: '高盛集团',
                time: '2小时前',
                summary: '高盛分析师表示，受全球央行持续购金和地缘政治不确定性影响，黄金将继续保持强劲走势。',
                url: '#'
            },
            {
                id: 2,
                title: '摩根士丹利上调黄金目标价至2800美元',
                source: '摩根士丹利',
                time: '5小时前',
                summary: '大摩认为美联储降息预期和避险需求将推动金价上涨，建议投资者增持黄金资产。',
                url: '#'
            },
            {
                id: 3,
                title: '瑞银：黄金仍是最佳避险资产',
                source: '瑞银集团',
                time: '1天前',
                summary: '瑞银财富管理部门建议客户将投资组合中黄金配置比例提高至10-15%。',
                url: '#'
            },
            {
                id: 4,
                title: '花旗银行：金价短期或面临回调压力',
                source: '花旗银行',
                time: '1天前',
                summary: '花旗分析师警告称，技术指标显示金价短期可能回调至2600美元附近。',
                url: '#'
            },
            {
                id: 5,
                title: '世界黄金协会：2025年全球央行购金量创新高',
                source: '世界黄金协会',
                time: '2天前',
                summary: '报告显示，全球央行2025年购金量达1200吨，连续第三年创历史新高。',
                url: '#'
            }
        ];

        res.json({
            code: 200,
            data: news
        });
    } catch (error) {
        console.error('获取金价新闻失败', error);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
};
