
const BASE_URL = 'https://fox5858.zeabur.app/api';

interface RequestOptions {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    header?: any;
}

const request = <T = any>(options: RequestOptions): Promise<T> => {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');

        console.log('发起请求:', `${BASE_URL}${options.url}`, options);

        uni.request({
            url: `${BASE_URL}${options.url}`,
            method: options.method,
            data: options.data,
            header: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                ...options.header
            },
            success: (res: any) => {
                console.log('请求成功:', res);

                if (res.statusCode >= 200 && res.statusCode < 300) {
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
                console.log('请求失败:', err);
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
