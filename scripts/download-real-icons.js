#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// 设置代理
process.env.https_proxy = 'http://127.0.0.1:7897';
process.env.http_proxy = 'http://127.0.0.1:7897';
process.env.all_proxy = 'socks5://127.0.0.1:7897';

// iOS应用图标信息 - 使用Apple官方的App Store图标URL
const appIcons = [
  { name: 'Safari', filename: 'safari.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/91/97/a4/9197a45d-0518-47d5-7c58-8422d3654b9f/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '邮件', filename: 'mail.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/21/53/10/215310ac-0847-a4a3-7649-8a3911c75908/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '日历', filename: 'calendar.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/4c/a3/9a/4ca39a73-62c6-5f75-3435-23c21c60f214/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '电话', filename: 'phone.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/83/87/42/83874223-28f4-9f79-99e7-550307c89a71/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '相机', filename: 'camera.png', url: 'https://is5-ssl.mzstatic.com/image/thumb/Purple116/v4/fc/29/51/fc2951ab-1768-3563-71f6-a362e55123a6/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '照片', filename: 'photos.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/99/36/43/993643c7-185d-85f5-b6d4-83ef4a24c5c2/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '音乐', filename: 'music.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/55/07/68/550768c8-f86a-7448-8de1-689387a2a7f5/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '地图', filename: 'maps.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/79/1c/64/791c64eb-991f-2851-af76-5784a8677a94/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '天气', filename: 'weather.png', url: 'https://is5-ssl.mzstatic.com/image/thumb/Purple116/v4/33/f6/32/33f632d4-3130-681b-8f15-99ff26d17333/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '时钟', filename: 'clock.png', url: 'https://is4-ssl.mzstatic.com/image/thumb/Purple116/v4/e8/06/61/e8066113-2178-5775-2983-f09b578c7a6e/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '计算器', filename: 'calculator.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/8e/3c/65/8e3c6565-d04c-a337-37a5-b38023c94d3f/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '指南针', filename: 'compass.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/13/a6/22/13a6225b-5e69-0a6f-a583-11354f8c6b3e/AppIcon-0-1x_U007emarketing-0-5-0-sRGB-85-220.png/230x0w.webp' },
  { name: '设置', filename: 'settings.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/21/53/10/215310ac-0847-a4a3-7649-8a3911c75908/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: 'App Store', filename: 'app-store.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/8e/3c/65/8e3c6565-d04c-a337-37a5-b38023c94d3f/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
  { name: '微信', filename: 'wechat.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/13/a6/22/13a6225b-5e69-0a6f-a583-11354f8c6b3e/AppIcon-0-1x_U007emarketing-0-5-0-sRGB-85-220.png/230x0w.webp' },
  { name: 'QQ', filename: 'qq.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/13/a6/22/13a6225b-5e69-0a6f-a583-11354f8c6b3e/AppIcon-0-1x_U007emarketing-0-5-0-sRGB-85-220.png/230x0w.webp' },
  { name: '支付宝', filename: 'alipay.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/13/a6/22/13a6225b-5e69-0a6f-a583-11354f8c6b3e/AppIcon-0-1x_U007emarketing-0-5-0-sRGB-85-220.png/230x0w.webp' },
  { name: '淘宝', filename: 'taobao.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/13/a6/22/13a6225b-5e69-0a6f-a583-11354f8c6b3e/AppIcon-0-1x_U007emarketing-0-5-0-sRGB-85-220.png/230x0w.webp' },
  { name: '抖音', filename: 'douyin.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/13/a6/22/13a6225b-5e69-0a6f-a583-11354f8c6b3e/AppIcon-0-1x_U007emarketing-0-5-0-sRGB-85-220.png/230x0w.webp' },
  { name: '微博', filename: 'weibo.png', url: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/13/a6/22/13a6225b-5e69-0a6f-a583-11354f8c6b3e/AppIcon-0-1x_U007emarketing-0-5-0-sRGB-85-220.png/230x0w.webp' },
];

// 创建目录
const assetsDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

/**
 * 下载文件
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ 下载成功: ${path.basename(filepath)}`);
          resolve();
        });
      } else {
        console.log(`❌ 下载失败: ${path.basename(filepath)} (状态码: ${response.statusCode})`);
        fs.unlink(filepath, () => {}); // 删除空文件
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });
    
    request.on('error', (err) => {
      console.log(`❌ 下载失败: ${path.basename(filepath)} (错误: ${err.message})`);
      fs.unlink(filepath, () => {}); // 删除空文件
      reject(err);
    });
    
    file.on('error', (err) => {
      console.log(`❌ 文件写入失败: ${path.basename(filepath)} (错误: ${err.message})`);
      fs.unlink(filepath, () => {}); // 删除空文件
      reject(err);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始下载iOS应用图标...');
  console.log(`📁 保存目录: ${assetsDir}`);
  console.log(`📊 总共需要下载: ${appIcons.length} 个图标\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < appIcons.length; i++) {
    const app = appIcons[i];
    const filepath = path.join(assetsDir, app.filename);
    
    console.log(`[${i + 1}/${appIcons.length}] 正在下载 ${app.name}...`);
    
    try {
      await downloadFile(app.url, filepath);
      successCount++;
    } catch (error) {
      failCount++;
      console.log(`   失败原因: ${error.message}`);
    }
    
    // 添加延迟避免请求过于频繁
    if (i < appIcons.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n📊 下载完成统计:');
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log(`📁 图标保存在: ${assetsDir}`);
  
  if (successCount > 0) {
    console.log('\n🎉 图标下载完成！现在可以在应用中使用这些图标了。');
    console.log('\n📝 使用方法:');
    console.log('在React Native组件中引用图标:');
    console.log('import { Image } from "expo-image";');
    console.log('<Image source={require("../assets/images/safari.png")} style={{width: 60, height: 60}} />');
  }
}

// 运行主函数
main().catch(console.error);
