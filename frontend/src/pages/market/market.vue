<template>
  <view class="container">
    <!-- 实时金价卡片 -->
    <view class="price-card">
      <text class="title">实时金价</text>
      <text class="price">¥{{ currentPrice }}/克</text>
      <text class="source">{{ priceSource }}</text>
      <text class="update-time">更新时间: {{ priceUpdateTime }}</text>
      <button class="refresh-btn" @click="fetchGoldPrice">刷新</button>
    </view>
    
    <!-- K线图 -->
    <view class="chart-container">
      <view class="chart-header">
        <text class="chart-title">30日K线走势</text>
      </view>
      <canvas 
        id="klineChart" 
        canvas-id="klineChart"
        class="chart-canvas"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      ></canvas>
    </view>
    
    <!-- 金价新闻 -->
    <view class="news-section">
      <view class="news-header">
        <text class="news-title">📰 投行观点</text>
        <text class="news-subtitle">最新金价预测</text>
      </view>
      <view class="news-list">
        <view class="news-item" v-for="item in newsList" :key="item.id">
          <view class="news-content">
            <text class="news-item-title">{{ item.title }}</text>
            <text class="news-summary">{{ item.summary }}</text>
            <view class="news-meta">
              <text class="news-source">{{ item.source }}</text>
              <text class="news-time">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '../../utils/request';
import * as echarts from 'echarts/core';
import { CandlestickChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([CandlestickChart, LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

const currentPrice = ref('0.00');
const priceSource = ref('');
const priceUpdateTime = ref('');
const newsList = ref<any[]>([]);
let chartInstance: any = null;

const fetchGoldPrice = async () => {
  try {
    const res: any = await request({ url: '/gold-records/price', method: 'GET' });
    if (res.code === 200) {
      currentPrice.value = Number(res.data.price).toFixed(2);
      priceSource.value = res.data.source;
      const d = new Date(res.data.updateTime);
      priceUpdateTime.value = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    }
  } catch (e) {
    console.error(e);
  }
};

const fetchHistoricalData = async () => {
  try {
    const res: any = await request({ url: '/market/historical-prices', method: 'GET' });
    if (res.code === 200) {
      initChart(res.data);
    }
  } catch (e) {
    console.error(e);
  }
};

const fetchNews = async () => {
  try {
    const res: any = await request({ url: '/market/news', method: 'GET' });
    if (res.code === 200) {
      newsList.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
};

const initChart = (data: any[]) => {
  nextTick(() => {
    // H5环境使用DOM canvas
    // #ifdef H5
    const canvas = document.getElementById('klineChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    chartInstance = echarts.init(canvas);
    
    const dates = data.map(item => item.date);
    const values = data.map(item => [item.open, item.close, item.low, item.high]);
    
    const option = {
      title: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function(params: any) {
          const data = params[0].data;
          return `日期: ${params[0].name}<br/>
                  开盘: ${data[0]}<br/>
                  收盘: ${data[1]}<br/>
                  最低: ${data[2]}<br/>
                  最高: ${data[3]}`;
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: dates,
        scale: true,
        boundaryGap: true,
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { show: false },
        axisLabel: {
          formatter: function(value: string) {
            return value.split('-')[2];
          }
        }
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        },
        axisLine: { lineStyle: { color: '#999' } }
      },
      series: [
        {
          type: 'candlestick',
          data: values,
          itemStyle: {
            color: '#ef5350',
            color0: '#26a69a',
            borderColor: '#ef5350',
            borderColor0: '#26a69a'
          }
        }
      ]
    };
    
    chartInstance.setOption(option);
    // #endif
  });
};

const touchStart = (e: any) => {
  // 处理触摸事件
};

const touchMove = (e: any) => {
  // 处理触摸移动
};

const touchEnd = (e: any) => {
  // 处理触摸结束
};

onMounted(() => {
  fetchGoldPrice();
  fetchHistoricalData();
  fetchNews();
});

onShow(() => {
  // 每次显示页面时刷新新闻
  fetchNews();
});
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
  padding-bottom: 20px;
}

.price-card {
  background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
  border-radius: 16px;
  padding: 24px;
  margin: 20px;
  text-align: center;
  color: #D4AF37;
  
  .title {
    display: block;
    font-size: 14px;
    opacity: 0.8;
    margin-bottom: 12px;
  }
  
  .price {
    display: block;
    font-size: 40px;
    font-weight: bold;
    color: #FFF;
    margin-bottom: 8px;
  }
  
  .source {
    display: block;
    font-size: 12px;
    opacity: 0.6;
    margin-bottom: 6px;
  }
  
  .update-time {
    display: block;
    font-size: 12px;
    opacity: 0.5;
    margin-bottom: 16px;
  }
  
  .refresh-btn {
    background: rgba(212, 175, 55, 0.2);
    color: #D4AF37;
    border: 1px solid #D4AF37;
    border-radius: 20px;
    padding: 6px 20px;
    font-size: 13px;
    
    &::after {
      border: none;
    }
  }
}

.chart-container {
  background: #FFF;
  border-radius: 16px;
  margin: 0 20px 20px;
  padding: 16px;
  
  .chart-header {
    margin-bottom: 12px;
    
    .chart-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }
  
  .chart-canvas {
    width: 100%;
    height: 300px;
  }
}

.news-section {
  margin: 0 20px;
  
  .news-header {
    margin-bottom: 12px;
    
    .news-title {
      display: block;
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }
    
    .news-subtitle {
      display: block;
      font-size: 12px;
      color: #999;
    }
  }
}

.news-list {
  .news-item {
    background: #FFF;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    
    .news-content {
      .news-item-title {
        display: block;
        font-size: 15px;
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .news-summary {
        display: block;
        font-size: 13px;
        color: #666;
        line-height: 1.5;
        margin-bottom: 12px;
      }
      
      .news-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .news-source {
          font-size: 12px;
          color: #D4AF37;
          font-weight: 500;
        }
        
        .news-time {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}
</style>
