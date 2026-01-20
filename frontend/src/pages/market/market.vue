<template>
  <view class="container">
    <view class="price-card">
      <text class="title">实时金价</text>
      <text class="price">¥{{ currentPrice }}/克</text>
      <text class="source">{{ priceSource }}</text>
      <text class="update-time">更新时间: {{ priceUpdateTime }}</text>
      <button class="refresh-btn" @click="fetchGoldPrice">刷新</button>
    </view>
    
    <view class="chart-placeholder">
      <text class="placeholder-text">📈</text>
      <text class="placeholder-desc">K线图功能开发中...</text>
      <text class="placeholder-hint">即将支持查看历史金价走势</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '../../utils/request';

const currentPrice = ref('0.00');
const priceSource = ref('');
const priceUpdateTime = ref('');

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

onMounted(() => {
  fetchGoldPrice();
});
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
  padding: 20px;
}

.price-card {
  background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  color: #D4AF37;
  margin-bottom: 20px;
  
  .title {
    display: block;
    font-size: 14px;
    opacity: 0.8;
    margin-bottom: 16px;
  }
  
  .price {
    display: block;
    font-size: 48px;
    font-weight: bold;
    color: #FFF;
    margin-bottom: 12px;
  }
  
  .source {
    display: block;
    font-size: 12px;
    opacity: 0.6;
    margin-bottom: 8px;
  }
  
  .update-time {
    display: block;
    font-size: 12px;
    opacity: 0.5;
    margin-bottom: 20px;
  }
  
  .refresh-btn {
    background: rgba(212, 175, 55, 0.2);
    color: #D4AF37;
    border: 1px solid #D4AF37;
    border-radius: 20px;
    padding: 8px 24px;
    font-size: 14px;
    
    &::after {
      border: none;
    }
  }
}

.chart-placeholder {
  background: #FFF;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  
  .placeholder-text {
    display: block;
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  .placeholder-desc {
    display: block;
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
  }
  
  .placeholder-hint {
    display: block;
    font-size: 12px;
    color: #999;
  }
}
</style>
