<template>
  <view class="container">
    <view class="form-group">
      <view class="form-item">
        <text class="label">交易类型</text>
        <view class="radio-group">
          <view 
            class="radio-item" 
            :class="{ active: form.tradeType === 'buy' }"
            @click="form.tradeType = 'buy'"
          >买入</view>
          <view 
            class="radio-item" 
            :class="{ active: form.tradeType === 'sell' }"
            @click="form.tradeType = 'sell'"
          >卖出</view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">品类</text>
        <picker :range="categories" @change="onCategoryChange">
           <view class="picker-value">{{ form.category || '请选择品类' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">重量 (g)</text>
        <input class="input" type="digit" v-model="form.weight" placeholder="0.00" />
      </view>

      <view class="form-item">
        <text class="label">单价 (元/g)</text>
        <input class="input" type="digit" v-model="form.unitPrice" placeholder="0.00" />
      </view>

      <view class="form-item">
        <text class="label">总价 (元)</text>
        <view class="input disabled">{{ totalPrice }}</view>
      </view>

      <view class="form-item">
        <text class="label">交易时间</text>
        <picker mode="date" @change="onDateChange">
          <view class="picker-value">{{ form.tradeTime }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">渠道</text>
        <input class="input" type="text" v-model="form.channel" placeholder="如：周大福、支付宝" />
      </view>
      
      <view class="form-item">
        <text class="label">备注</text>
        <input class="input" type="text" v-model="form.remark" placeholder="选填" />
      </view>
    </view>

    <button class="btn-submit" @click="submit">保存记录</button>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import request from '../../utils/request';

const categories = ['金条', '金饰', '黄金ETF', '纸黄金', '其他'];

const form = reactive({
  tradeType: 'buy',
  category: '',
  weight: '',
  unitPrice: '',
  tradeTime: new Date().toISOString().split('T')[0],
  channel: '',
  remark: ''
});

const totalPrice = computed(() => {
  const w = parseFloat(form.weight);
  const p = parseFloat(form.unitPrice);
  if (!isNaN(w) && !isNaN(p)) {
    return (w * p).toFixed(2);
  }
  return '0.00';
});

const onCategoryChange = (e: any) => {
  form.category = categories[e.detail.value];
};

const onDateChange = (e: any) => {
  form.tradeTime = e.detail.value;
};

const submit = async () => {
  if (!form.weight || !form.unitPrice || !form.category) {
    uni.showToast({ title: '请填写完整', icon: 'none' });
    return;
  }

  try {
    const res: any = await request({
      url: '/gold-records',
      method: 'POST',
      data: {
        ...form,
        tradeTime: form.tradeTime + ' 00:00:00' // Simple time append
      }
    });

    if (res.code === 200 || res.code === 201) {
      uni.showToast({ title: '添加成功' });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  } catch (error) {
    console.error(error);
  }
};
</script>

<style lang="scss">
/* 轻奢金色风 - 变量 */
$primary-gold: #D4AF37;
$bg-color: #F5F5F7;
$gradient-gold: linear-gradient(135deg, #EEDC82 0%, #D4AF37 100%);

.container {
  padding: 20px;
  background-color: $bg-color;
  min-height: 100vh;
}

.form-group {
  background: white;
  border-radius: 16px;
  padding: 0 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  font-size: 15px;
  color: #333;
  width: 100px;
  font-weight: 500;
}

.input, .picker-value {
  flex: 1;
  text-align: right;
  font-size: 15px;
  color: #333;
  
  &.disabled {
    color: #999;
  }
}

.radio-group {
  display: flex;
  background: #F7F7F7;
  border-radius: 8px;
  padding: 4px;
}

.radio-item {
  padding: 6px 20px;
  font-size: 14px;
  border-radius: 6px;
  color: #999;
  transition: all 0.2s;
  
  &.active {
    background: #FFFFFF;
    color: $primary-gold;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
}

.btn-submit {
  background: $gradient-gold;
  color: #fff; /* White text for contrast on gold */
  font-weight: bold;
  border-radius: 28px;
  margin-top: 30px;
  height: 50px;
  line-height: 50px;
  font-size: 16px;
  box-shadow: 0 8px 16px rgba(212, 175, 55, 0.25);
  
  &::after {
      border: none;
  }
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
</style>
