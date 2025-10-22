#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// 设置代理
const httpsProxy = 'http://127.0.0.1:7897';
const httpProxy = 'http://127.0.0.1:7897';

// iOS应用图标信息
const appIcons = [
  { name: 'Safari', bundleId: 'com.apple.mobilesafari', filename: 'safari.png' },
  { name: '邮件', bundleId: 'com.apple.mobilemail', filename: 'mail.png' },
  { name: '日历', bundleId: 'com.apple.mobilecal', filename: 'calendar.png' },
  { name: '电话', bundleId: 'com.apple.mobilephone', filename: 'phone.png' },
  { name: '相机', bundleId: 'com.apple.mobilecamera', filename: 'camera.png' },
  { name: '照片', bundleId: 'com.apple.mobilephotos', filename: 'photos.png' },
  { name: '音乐', bundleId: 'com.apple.mobilemusic', filename: 'music.png' },
  { name: '地图', bundleId: 'com.apple.mobilemaps', filename: 'maps.png' },
  { name: '天气', bundleId: 'com.apple.mobileweather', filename: 'weather.png' },
  { name: '时钟', bundleId: 'com.apple.mobileclock', filename: 'clock.png' },
  { name: '计算器', bundleId: 'com.apple.mobilecalculator', filename: 'calculator.png' },
  { name: '指南针', bundleId: 'com.apple.mobilecompass', filename: 'compass.png' },
  { name: '测距仪', bundleId: 'com.apple.mobilemeasure', filename: 'measure.png' },
  { name: '语音备忘录', bundleId: 'com.apple.mobilevoice-memos', filename: 'voice-memos.png' },
  { name: '钱包', bundleId: 'com.apple.mobilewallet', filename: 'wallet.png' },
  { name: '健康', bundleId: 'com.apple.mobilehealth', filename: 'health.png' },
  { name: '家庭', bundleId: 'com.apple.mobilehome', filename: 'home.png' },
  { name: '设置', bundleId: 'com.apple.mobilesettings', filename: 'settings.png' },
  { name: 'App Store', bundleId: 'com.apple.mobileapp-store', filename: 'app-store.png' },
  { name: '微信', bundleId: 'com.tencent.xin', filename: 'wechat.png' },
  { name: 'QQ', bundleId: 'com.tencent.mqq', filename: 'qq.png' },
  { name: '支付宝', bundleId: 'com.alipay.iphoneclient', filename: 'alipay.png' },
  { name: '淘宝', bundleId: 'com.taobao.taobao4iphone', filename: 'taobao.png' },
  { name: '抖音', bundleId: 'com.ss.iphone.ugc.Aweme', filename: 'douyin.png' },
  { name: '微博', bundleId: 'com.sina.weibo', filename: 'weibo.png' },
];

// 创建目录
const assetsDir = path.join(__dirname, 'assets', 'images');
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
 * 生成图标URL
 */
function generateIconUrl(bundleId) {
  // 使用icon.horse API服务
  return `https://icon.horse/icon/${bundleId}`;
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
    const url = generateIconUrl(app.bundleId);
    const filepath = path.join(assetsDir, app.filename);
    
    console.log(`[${i + 1}/${appIcons.length}] 正在下载 ${app.name}...`);
    
    try {
      await downloadFile(url, filepath);
      successCount++;
    } catch (error) {
      failCount++;
      console.log(`   失败原因: ${error.message}`);
    }
    
    // 添加延迟避免请求过于频繁
    if (i < appIcons.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n📊 下载完成统计:');
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log(`📁 图标保存在: ${assetsDir}`);
  
  if (successCount > 0) {
    console.log('\n🎉 图标下载完成！现在可以在应用中使用这些图标了。');
  }
}

// 运行主函数
main().catch(console.error);
