
const BASE_URL = 'https://crazy-cameras-grab.loca.lt/api';

interface RequestOptions {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    header?: any;
}

const request = <T = any>(options: RequestOptions): Promise<T> => {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');

        uni.request({
            url: `${BASE_URL}${options.url}`,
            method: options.method,
            data: options.data,
            header: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                'Bypass-Tunnel-Reminder': 'true', // 跳过 localtunnel 提醒页
                ...options.header
            },
            success: (res: any) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // 假设后端返回格式 { code: 200, data: ..., message: ... }
                    // 如果直接返回 data，或者根据 code 判断
                    if (res.data.code === 200 || res.data.code === 201) {
                        resolve(res.data);
                    } else {
                        uni.showToast({
                            title: res.data.message || '请求失败',
                            icon: 'none'
                        });
                        reject(res.data);
                    }
                } else if (res.statusCode === 401) {
                    uni.showToast({
                        title: '请先登录',
                        icon: 'none'
                    });
                    uni.removeStorageSync('token');
                    uni.reLaunch({
                        url: '/pages/login/login'
                    });
                    reject(res.data);
                } else {
                    uni.showToast({
                        title: res.data.message || '服务器错误',
                        icon: 'none'
                    });
                    reject(res.data);
                }
            },
            fail: (err) => {
                uni.showToast({
                    title: '网络连接失败',
                    icon: 'none'
                });
                reject(err);
            }
        });
    });
};

export default request;
