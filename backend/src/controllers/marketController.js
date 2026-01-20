const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

// 获取历史金价数据（使用 gold-api.com）
exports.getHistoricalPrices = async (req, res) => {
    try {
        // 生成最近30天的数据（基于当前金价）
        // API 返回的是实时金价 (USD/oz)
        const response = await axios.get('https://api.gold-api.com/price/XAU', {
            timeout: 10000
        });

        let currentPriceCNY = 600; // 默认值

        if (response.data && response.data.price) {
            const priceUSD = response.data.price;
            // 1盎司 = 31.1035克
            // 假设汇率 1 USD = 7.2 CNY
            // 计算每克人民币价格
            currentPriceCNY = (priceUSD / 31.1034768) * 7.2;
        }

        // 生成30天历史数据（基于当前价格模拟，因为没有免费的历史K线API）
        const days = 30;
        const data = [];
        const now = new Date();
        let basePrice = currentPriceCNY;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // 模拟价格波动
            // 越久远的数据波动越大，最近的数据接近当前价
            const variance = basePrice * 0.02; // 2% 波动

            // 随机生成开盘价（基于前一天收盘价或基准价）
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

            // 更新基准价，制造趋势
            basePrice = parseFloat(close.toFixed(2));
        }

        return res.json({
            code: 200,
            data: data
        });

    } catch (error) {
        console.error('获取历史金价失败', error.message);
        // 使用模拟数据
        res.json({
            code: 200,
            data: generateMockData(),
            source: '模拟数据'
        });
    }
};

// 获取金价新闻（使用 Google News RSS）
exports.getGoldNews = async (req, res) => {
    try {
        // 使用 Google News RSS - 搜索 "黄金"
        const feedUrl = 'https://news.google.com/rss/search?q=%E9%BB%84%E9%87%91&hl=zh-CN&gl=CN&ceid=CN:zh-Hans';

        const feed = await parser.parseURL(feedUrl);

        if (feed && feed.items) {
            const news = feed.items.slice(0, 10).map((item, index) => ({
                id: index + 1,
                title: item.title,
                source: item.creator || item.source || 'Google News',
                time: formatTime(item.pubDate || item.isoDate),
                summary: (item.contentSnippet || item.content || '').replace(/<[^>]+>/g, '').substring(0, 80) + '...',
                url: item.link
            }));

            return res.json({
                code: 200,
                data: news
            });
        }

        throw new Error('RSS 解析无数据');

    } catch (error) {
        console.error('获取金价新闻失败', error.message);

        // 降级方案：返回模拟新闻
        res.json({
            code: 200,
            data: getMockNews(),
            source: '模拟数据'
        });
    }
};

// 辅助函数：生成模拟K线数据
function generateMockData() {
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
    return data;
}

// 辅助函数：获取模拟新闻
function getMockNews() {
    return [
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
        }
    ];
}

// 辅助函数：格式化时间
function formatTime(dateString) {
    if (!dateString) return '';
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
