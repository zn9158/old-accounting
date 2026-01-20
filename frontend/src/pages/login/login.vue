<template>
  <view class="container">
    <view class="header">
      <text class="title">黄金记账</text>
      <text class="subtitle">{{ isRegister ? '注册新账号' : '欢迎回来' }}</text>
    </view>

    <view class="form-box">
      <view class="input-group">
        <text class="label">手机号</text>
        <input class="input" type="number" v-model="form.phone" placeholder="请输入手机号" />
      </view>
      
      <view class="input-group">
        <text class="label">密码</text>
        <input class="input" type="password" v-model="form.password" placeholder="请输入密码" />
      </view>

      <button class="btn-primary" @click="handleSubmit">{{ isRegister ? '注册' : '登录' }}</button>
      
      <view class="toggle-box" @click="toggleMode">
        <text class="toggle-text">{{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import request from '../../utils/request';

const isRegister = ref(false);
const form = reactive({
  phone: '',
  password: ''
});

const toggleMode = () => {
  isRegister.value = !isRegister.value;
};

const handleSubmit = async () => {
  if (!form.phone || !form.password) {
    uni.showToast({ title: '请填写完整', icon: 'none' });
    return;
  }

  const url = isRegister.value ? '/users/register' : '/users/login';
  
  try {
    const res: any = await request({
      url,
      method: 'POST',
      data: {
        phone: form.phone,
        password: form.password,
        type: 'phone' // 显式指定手机号登录/注册
      }
    });

    if (res.code === 200 || res.code === 201) {
      uni.showToast({ title: isRegister.value ? '注册成功' : '登录成功', icon: 'success' });
      
      if (isRegister.value) {
        // 注册成功后切换到登录或直接登录？这里简单处理切换到登录模式
        isRegister.value = false;
      } else {
        // 登录成功，保存 token
        if (res.data && res.data.token) {
          uni.setStorageSync('token', res.data.token);
          uni.setStorageSync('userInfo', res.data.userInfo);
          
          // 跳转到首页
          uni.reLaunch({ url: '/pages/index/index' });
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};
</script>

<style lang="scss">
.container {
  padding: 40px 20px;
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header {
  margin-bottom: 40px;
  text-align: center;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  color: #666;
}

.form-box {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.input-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  height: 44px;
  .input-item {
    margin-bottom: 30px;
    border-bottom: 1px solid #E0E0E0;
    padding-bottom: 8px;
    
    .label {
      font-size: 14px;
      color: $text-light;
      margin-bottom: 10px;
      display: block;
    }
    
    .input {
        font-size: 16px;
        color: $text-main;
        height: 40px;
    }
  }
}

.btn-login {
  background: $gradient-gold;
  color: #fff;
  border-radius: 30px;
  height: 50px;
  line-height: 50px;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 8px 16px rgba(212, 175, 55, 0.2);
  margin-top: 20px;
  
  &::after { border: none; }
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.toggle-type {
  text-align: center;
  margin-top: 20px;
  
  .text {
    font-size: 14px;
    color: $primary-gold;
  }
}
</style>
