<template>
  <view class="container">
    <!-- 顶部资产卡片 -->
    <view class="asset-card">
      <view class="card-header">
        <text class="card-title">持有总资产 (元)</text>
        <view class="header-actions">
          <view class="eye-icon">👁</view>
          <text class="logout-btn" @click="handleLogout">退出</text>
        </view>
      </view>
      <view class="total-assets">
        <text class="currency">¥</text>
        <text class="amount">{{ totalAssets }}</text>
      </view>
      <view class="asset-details">
        <view class="detail-item">
          <text class="label">持有黄金</text>
          <text class="value">{{ totalWeight }} <text class="unit">g</text></text>
        </view>
        <view class="line"></view>
        <view class="detail-item">
          <text class="label">累计收益</text>
          <text class="value" :class="{ 'profit': parseFloat(totalProfit) > 0, 'loss': parseFloat(totalProfit) < 0 }">
            {{ parseFloat(totalProfit) > 0 ? '+' : '' }}{{ totalProfit }}
          </text>
        </view>
      </view>
    </view>

    <!-- 实时金价显示 -->
    <view class="price-board">
        <view class="price-header">
            <text class="title">实时金价 (CNY/g)</text>
            <view class="refresh" @click="fetchGoldPrice">
                <text class="refresh-text">{{ priceUpdateStatus }}</text>
            </view>
        </view>
        <view class="price-content">
             <text class="current-price">{{ currentPrice }}</text>
             <view class="price-meta">
                 <text class="source-tag" v-if="priceSource">{{ priceSource }}</text>
                 <text class="update-time" v-if="priceUpdateTime">更新于 {{ priceUpdateTime }}</text>
             </view>
        </view>
    </view>
    
    <!-- 最近记录 Header -->
    <view class="section-header">
      <text class="section-title">最近明细</text>
      <text class="more" @click="goToHistory">全部 ></text>
    </view>

    <!-- 记录列表 -->
    <view class="history-list">
      <view class="history-item" v-for="(item, index) in recentRecords" :key="index">
        <view class="item-left">
          <view class="icon-circle" :class="item.tradeType === 'buy' || item.tradeType === '买入' ? 'buy-icon' : 'sell-icon'">
             {{ (item.tradeType === 'buy' || item.tradeType === '买入') ? '买' : '卖' }}
          </view>
          <view class="item-info">
            <text class="item-category">{{ item.category }}</text>
            <text class="item-date">{{ formatDate(item.tradeTime) }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-weight" :class="item.tradeType === 'buy' || item.tradeType === '买入' ? 'add' : 'minus'">
            {{ (item.tradeType === 'buy' || item.tradeType === '买入') ? '+' : '-' }}{{ item.weight }}g
          </text>
          <text class="item-price">¥{{ item.totalPrice }}</text>
        </view>
      </view>
      <view v-if="recentRecords.length === 0" class="empty-tip">
          暂无记录，快去记一笔吧
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-btn" @click="goToAdd">
      <text class="plus">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import request from '../../utils/request';

// State
const currentPrice = ref('0.00'); // 实时金价
const priceSource = ref('');
const priceUpdateTime = ref('');
const priceUpdateStatus = ref('点击刷新');

const totalWeight = ref('0.00');
const totalCost = ref('0.00'); // 总投入成本
const records = ref<any[]>([]);

// Computed
const totalAssets = computed(() => {
  const w = parseFloat(totalWeight.value);
  const p = parseFloat(currentPrice.value);
  if (!isNaN(w) && !isNaN(p)) {
    return (w * p).toFixed(2);
  }
  return '0.00';
});

const totalProfit = computed(() => {
  const assets = parseFloat(totalAssets.value);
  const cost = parseFloat(totalCost.value);
  return (assets - cost).toFixed(2);
});

const recentRecords = computed(() => {
  return records.value.slice(0, 5); // 只显示最近5条
});

// Methods
const fetchGoldPrice = async () => {
    priceUpdateStatus.value = '刷新中...';
    try {
        const res: any = await request({ url: '/gold-records/price', method: 'GET' });
        if (res.code === 200) {
            currentPrice.value = Number(res.data.price).toFixed(2);
            priceSource.value = res.data.source;
            const d = new Date(res.data.updateTime);
            priceUpdateTime.value = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            if (res.data.warning) {
                 uni.showToast({ title: '使用缓存数据', icon: 'none' });
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        priceUpdateStatus.value = '刷新';
        uni.stopPullDownRefresh();
    }
};

const fetchRecords = async () => {
  try {
    const res: any = await request({ url: '/gold-records', method: 'GET' });
    if (res.code === 200) {
      totalWeight.value = res.data.summary.totalWeight;
      totalCost.value = res.data.summary.totalCost;
      records.value = res.data.list;
    }
  } catch (e) {
    console.error(e);
  }
};

const formatDate = (str: string) => {
  if (!str) return '';
  const d = new Date(str);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const goToAdd = () => {
  uni.navigateTo({ url: '/pages/add/add' });
};

const goToHistory = () => {
  uni.showToast({ title: '更多记录页面待开发', icon: 'none' });
};

const handleLogout = () => {
  // H5 环境使用原生 confirm
  // #ifdef H5
  if (confirm('确定要退出登录吗？')) {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    uni.reLaunch({ url: '/pages/login/login' });
  }
  // #endif
  
  // 小程序环境使用 uni.showModal
  // #ifndef H5
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        uni.reLaunch({ url: '/pages/login/login' });
      }
    }
  });
  // #endif
};

// Lifecycle
onMounted(() => {
  fetchGoldPrice();
});

onShow(() => {
  // Check login
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }
  fetchRecords();
});

onPullDownRefresh(() => {
    Promise.all([fetchGoldPrice(), fetchRecords()]);
});
</script>

<style lang="scss">
/* 轻奢金色风 - 变量 */
$primary-gold: #D4AF37;
$light-gold: #F3E5AB;
$dark-gold: #AA8A2E;
$bg-color: #F5F5F7;
$card-bg: #FFFFFF;
$text-main: #333333;
$text-sub: #999999;
$gradient-gold: linear-gradient(135deg, #EEDC82 0%, #D4AF37 100%);
$gradient-black: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);

.container {
  padding: 20px;
  background-color: $bg-color;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 顶部资产卡片 - 黑金风格 */
.asset-card {
  background: $gradient-black;
  border-radius: 16px;
  padding: 24px;
  color: $primary-gold;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;

  /* 装饰纹理 */
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .card-title {
    font-size: 14px;
    opacity: 0.8;
    color: #E0E0E0;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .eye-icon {
    font-size: 16px;
  }
  
  .logout-btn {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    padding: 4px 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    transition: all 0.2s;
    
    &:active {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.total-assets {
  margin-bottom: 24px;
  display: flex;
  align-items: baseline;

  .currency {
    font-size: 20px;
    margin-right: 4px;
    font-weight: bold;
  }
  .amount {
    font-size: 36px;
    font-weight: bold;
    color: #FFFFFF;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
}

.asset-details {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .detail-item {
    display: flex;
    flex-direction: column;
    
    .label {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }
    .value {
      font-size: 16px;
      font-weight: bold;
      color: #FFF;
      
      .unit {
        font-size: 12px;
        margin-left: 2px;
        font-weight: normal;
      }
      
      &.profit { color: #FF6B6B; }
      &.loss { color: #4CD964; }
    }
  }

  .line {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
  }
}

/* 实时金价板 */
.price-board {
    background: $card-bg;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    border: 1px solid rgba(212, 175, 55, 0.1);
    
    .price-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .title {
            font-size: 14px;
            color: $text-main;
            font-weight: bold;
        }
        .refresh-text {
            font-size: 12px;
            color: $primary-gold;
        }
    }
    
    .price-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        
        .current-price {
            font-size: 28px;
            font-weight: bold;
            color: $primary-gold;
        }
        
        .price-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        
        .source-tag {
             font-size: 10px;
             background: #FFF9E6;
             color: #D4AF37;
             padding: 2px 6px;
             border-radius: 4px;
             margin-bottom: 2px;
        }

        .update-time {
            font-size: 10px;
            color: #ccc;
        }
    }
}

/* 列表 Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: $text-main;
    position: relative;
    padding-left: 10px;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 4px;
        bottom: 4px;
        width: 3px;
        background: $primary-gold;
        border-radius: 2px;
    }
  }

  .more {
    font-size: 12px;
    color: $text-sub;
  }
}

/* 列表项 */
.history-list {
  padding-bottom: 80px;
}

.history-item {
  background: $card-bg;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);

  .item-left {
    display: flex;
    align-items: center;

    .icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #F5F5F7;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: bold;
      margin-right: 12px;
      
      &.buy-icon { color: $dark-gold; background: #FFF9E6; }
      &.sell-icon { color: #666; background: #F0F0F0; }
    }

    .item-info {
        display: flex;
        flex-direction: column;
        
        .item-category {
            font-size: 15px;
            color: $text-main;
            font-weight: 500;
            margin-bottom: 4px;
        }
        .item-date {
            font-size: 12px;
            color: $text-sub;
        }
    }
  }

  .item-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .item-weight {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
      
      &.add { color: $dark-gold; }
      &.minus { color: $text-main; }
    }
    
    .item-price {
        font-size: 12px;
        color: $text-sub;
    }
  }
}

.empty-tip {
    text-align: center;
    color: #999;
    padding: 40px 0;
    font-size: 14px;
}

/* 悬浮按钮 */
.fab-btn {
  position: fixed;
  right: 20px;
  bottom: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: $gradient-gold;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.95);
  }

  .plus {
    font-size: 32px;
    color: #FFF;
    margin-top: -4px;
  }
}
</style>
