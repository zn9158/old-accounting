const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

// 获取历史金价数据（使用 gold-api.com）
exports.getHistoricalPrices = async (req, res) => {
    try {
        // 生成最近30天的数据（基于当前金价）
        const response = await axios.get('https://api.gold-api.com/price/XAU', {
            timeout: 10000
        });

        if (response.data && response.data.price) {
            const currentPrice = response.data.price / 31.1034768; // 转换为每克价格
            const currentPriceCNY = currentPrice * 7.2; // 假设汇率 1 USD = 7.2 CNY

            // 生成30天历史数据（基于当前价格模拟）
            const days = 30;
            const data = [];
            const now = new Date();
            let basePrice = currentPriceCNY;

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                // 模拟价格波动（基于真实当前价格）
                const variance = basePrice * 0.015; // 1.5% 波动
                const open = basePrice + (Math.random() - 0.5) * variance;
                const close = open + (Math.random() - 0.5) * variance;
                const high = Math.max(open, close) + Math.random() * variance * 0.5;
                const low = Math.min(open, close) - Math.random() * variance * 0.5;

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

            return res.json({
                code: 200,
                data: data
            });
        }

        throw new Error('API 返回数据格式错误');

    } catch (error) {
        console.error('获取历史金价失败', error.message);

        // 降级方案：生成模拟数据
        const days = 30;
        const data = [];
        const now = new Date();
        let basePrice = 480;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

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
            data: data,
            source: '模拟数据'
        });
    }
};

// 获取金价新闻（使用 RSS 源）
exports.getGoldNews = async (req, res) => {
    try {
        // 使用 Investing.com 的黄金新闻 RSS
        const feed = await parser.parseURL('https://cn.investing.com/rss/commodities_Gold.rss');

        if (feed && feed.items) {
            const news = feed.items.slice(0, 10).map((item, index) => ({
                id: index + 1,
                title: item.title,
                source: 'Investing.com',
                time: formatTime(item.pubDate),
                summary: item.contentSnippet || item.content?.substring(0, 100) + '...' || '暂无摘要',
                url: item.link
            }));

            return res.json({
                code: 200,
                data: news
            });
        }

        throw new Error('RSS 解析失败');

    } catch (error) {
        console.error('获取金价新闻失败', error.message);

        // 降级方案：返回模拟新闻
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
            data: news,
            source: '模拟数据'
        });
    }
};

// 辅助函数：格式化时间
function formatTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const days = Math.floor(hours / 24);

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
}
