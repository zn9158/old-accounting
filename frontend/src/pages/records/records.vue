<template>
  <view class="container">
    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view 
        class="tab-item" 
        :class="{ 'active': filterType === 'all' }"
        @click="filterType = 'all'"
      >
        全部
      </view>
      <view 
        class="tab-item" 
        :class="{ 'active': filterType === 'buy' }"
        @click="filterType = 'buy'"
      >
        买入
      </view>
      <view 
        class="tab-item" 
        :class="{ 'active': filterType === 'sell' }"
        @click="filterType = 'sell'"
      >
        卖出
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="records-list">
      <view class="record-item" v-for="(item, index) in filteredRecords" :key="index">
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
      
      <view v-if="filteredRecords.length === 0" class="empty-tip">
        暂无{{ filterType === 'all' ? '' : filterType === 'buy' ? '买入' : '卖出' }}记录
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '../../utils/request';

const filterType = ref('all');
const records = ref<any[]>([]);

const filteredRecords = computed(() => {
  if (filterType.value === 'all') {
    return records.value;
  }
  return records.value.filter(item => {
    const type = item.tradeType === 'buy' || item.tradeType === '买入' ? 'buy' : 'sell';
    return type === filterType.value;
  });
});

const fetchRecords = async () => {
  try {
    const res: any = await request({ url: '/gold-records', method: 'GET' });
    if (res.code === 200) {
      records.value = res.data.list;
    }
  } catch (e) {
    console.error(e);
  }
};

const formatDate = (str: string) => {
  if (!str) return '';
  const d = new Date(str);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

onShow(() => {
  fetchRecords();
});
</script>

<style lang="scss" scoped>
$primary-gold: #D4AF37;
$bg-color: #F5F5F7;
$card-bg: #FFFFFF;
$text-main: #333333;
$text-sub: #999999;

.container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 20px;
}

.filter-tabs {
  display: flex;
  background: $card-bg;
  padding: 12px 20px;
  margin-bottom: 12px;
  gap: 12px;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    border-radius: 8px;
    font-size: 14px;
    color: $text-sub;
    background: $bg-color;
    transition: all 0.3s;
    
    &.active {
      background: linear-gradient(135deg, #EEDC82 0%, #D4AF37 100%);
      color: #FFF;
      font-weight: bold;
    }
  }
}

.records-list {
  padding: 0 20px;
}

.record-item {
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
      
      &.buy-icon { color: #AA8A2E; background: #FFF9E6; }
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
      
      &.add { color: #AA8A2E; }
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
  padding: 60px 0;
  font-size: 14px;
}
</style>
