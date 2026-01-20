<template>
  <view class="container">
    <view class="profile-header">
      <view class="avatar">👤</view>
      <text class="nickname">{{ userInfo.nickname || '用户' }}</text>
      <text class="phone">{{ userInfo.phone || '未绑定手机号' }}</text>
    </view>
    
    <view class="menu-list">
      <view class="menu-item" @click="handleLogout">
        <text class="menu-icon">🚪</text>
        <text class="menu-text">退出登录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const userInfo = ref<any>({});

onMounted(() => {
  const info = uni.getStorageSync('userInfo');
  if (info) {
    userInfo.value = info;
  }
});

const handleLogout = () => {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  uni.showToast({ title: '已退出登录', icon: 'success', duration: 1500 });
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/login' });
  }, 1500);
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
}

.profile-header {
  background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
  padding: 40px 20px;
  text-align: center;
  color: #FFF;
  
  .avatar {
    width: 80px;
    height: 80px;
    background: rgba(212, 175, 55, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin: 0 auto 16px;
  }
  
  .nickname {
    display: block;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .phone {
    display: block;
    font-size: 14px;
    opacity: 0.6;
  }
}

.menu-list {
  margin-top: 12px;
  background: #FFF;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F5F5F7;
  
  .menu-icon {
    font-size: 24px;
    margin-right: 12px;
  }
  
  .menu-text {
    flex: 1;
    font-size: 15px;
    color: #333;
  }
  
  .menu-arrow {
    font-size: 20px;
    color: #999;
  }
  
  &:active {
    background: #F5F5F7;
  }
}
</style>
