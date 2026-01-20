# 配置 NewsAPI Key

为了获取真实的金价新闻，需要配置 NewsAPI 的 API Key。

## 步骤

### 1. 注册 NewsAPI
访问 [https://newsapi.org/register](https://newsapi.org/register) 注册免费账号

### 2. 获取 API Key
注册后，在控制台页面可以看到您的 API Key

### 3. 配置环境变量

在 Zeabur 后端服务中添加环境变量：
- 变量名：`NEWS_API_KEY`
- 变量值：您的 NewsAPI Key

### 4. 重新部署
保存环境变量后，重新部署后端服务

## 注意事项

- NewsAPI 免费版每天限制 100 次请求
- 如果不配置 API Key，系统会自动使用模拟新闻数据
- FreeGoldAPI 无需配置，开箱即用
