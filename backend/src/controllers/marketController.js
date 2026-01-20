const axios = require('axios');

// 获取历史金价数据（使用 FreeGoldAPI）
exports.getHistoricalPrices = async (req, res) => {
    try {
        // 使用 FreeGoldAPI.com - 免费，无需 API key
        const response = await axios.get('https://www.freegoldapi.com/api/gold/historical', {
            timeout: 10000
        });

        if (response.data && response.data.prices) {
            // 获取最近30天的数据
            const prices = response.data.prices.slice(-30);

            // 转换数据格式为 K 线需要的格式
            const data = prices.map(item => {
                const price = parseFloat(item.price);
                // 模拟开盘、收盘、最高、最低价（基于当日价格）
                const variance = price * 0.02; // 2% 波动
                return {
                    date: item.date,
                    open: (price - variance * Math.random()).toFixed(2),
                    high: (price + variance * Math.random()).toFixed(2),
                    low: (price - variance * Math.random()).toFixed(2),
                    close: price.toFixed(2),
                    volume: Math.floor(Math.random() * 1000 + 500)
                };
            });

            return res.json({
                code: 200,
                data: data
            });
        }

        // 如果 API 失败，使用降级数据
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

// 获取金价新闻（使用 NewsAPI）
exports.getGoldNews = async (req, res) => {
    try {
        // 使用 NewsAPI.org 搜索金价相关新闻
        // 注意：需要在环境变量中配置 NEWS_API_KEY
        const apiKey = process.env.NEWS_API_KEY || 'demo'; // 演示用

        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'gold price OR 黄金价格 OR 金价',
                language: 'zh',
                sortBy: 'publishedAt',
                pageSize: 10,
                apiKey: apiKey
            },
            timeout: 10000
        });

        if (response.data && response.data.articles) {
            const news = response.data.articles.map((article, index) => ({
                id: index + 1,
                title: article.title,
                source: article.source.name,
                time: formatTime(article.publishedAt),
                summary: article.description || article.content?.substring(0, 100) + '...' || '暂无摘要',
                url: article.url
            }));

            return res.json({
                code: 200,
                data: news
            });
        }

        throw new Error('NewsAPI 返回数据格式错误');

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
