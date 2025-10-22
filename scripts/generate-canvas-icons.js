#!/usr/bin/env node

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// 创建目录
const assetsDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// iOS应用图标配置
const appIcons = [
  { name: 'Safari', filename: 'safari.png', color: '#007AFF', symbol: '🌐' },
  { name: '邮件', filename: 'mail.png', color: '#FF3B30', symbol: '✉️' },
  { name: '日历', filename: 'calendar.png', color: '#FF9500', symbol: '📅' },
  { name: '电话', filename: 'phone.png', color: '#34C759', symbol: '📞' },
  { name: '相机', filename: 'camera.png', color: '#5856D6', symbol: '📷' },
  { name: '照片', filename: 'photos.png', color: '#FF2D92', symbol: '📸' },
  { name: '音乐', filename: 'music.png', color: '#FF3B30', symbol: '🎵' },
  { name: '地图', filename: 'maps.png', color: '#007AFF', symbol: '🗺️' },
  { name: '天气', filename: 'weather.png', color: '#FF9500', symbol: '☀️' },
  { name: '时钟', filename: 'clock.png', color: '#5856D6', symbol: '🕐' },
  { name: '计算器', filename: 'calculator.png', color: '#8E8E93', symbol: '🧮' },
  { name: '指南针', filename: 'compass.png', color: '#34C759', symbol: '🧭' },
  { name: '设置', filename: 'settings.png', color: '#8E8E93', symbol: '⚙️' },
  { name: 'App Store', filename: 'app-store.png', color: '#007AFF', symbol: '📱' },
  { name: '微信', filename: 'wechat.png', color: '#07C160', symbol: '💬' },
  { name: 'QQ', filename: 'qq.png', color: '#12B7F5', symbol: '🐧' },
  { name: '支付宝', filename: 'alipay.png', color: '#1677FF', symbol: '💰' },
  { name: '淘宝', filename: 'taobao.png', color: '#FF6900', symbol: '🛒' },
  { name: '抖音', filename: 'douyin.png', color: '#000000', symbol: '🎬' },
  { name: '微博', filename: 'weibo.png', color: '#E6162D', symbol: '📢' },
];

/**
 * 创建iOS风格的图标
 */
function createIOSIcon(name, color, symbol, size = 1024) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 设置背景
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustColor(color, -30));
  
  // 绘制圆角矩形背景
  const cornerRadius = size * 0.2;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, cornerRadius);
  ctx.fill();
  
  // 绘制阴影效果
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  
  // 绘制图标
  ctx.fillStyle = 'white';
  ctx.font = `${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, size / 2, size / 2);
  
  return canvas;
}

/**
 * 调整颜色亮度
 */
function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 保存图标
 */
async function saveIcon(canvas, filepath) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
}

/**
 * 主函数
 */
async function main() {
  console.log('🎨 开始生成真实的iOS风格PNG图标...');
  console.log(`📁 保存目录: ${assetsDir}`);
  console.log(`📊 总共需要生成: ${appIcons.length} 个图标\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < appIcons.length; i++) {
    const app = appIcons[i];
    const filepath = path.join(assetsDir, app.filename);
    
    console.log(`[${i + 1}/${appIcons.length}] 正在生成 ${app.name}...`);
    
    try {
      // 创建图标
      const canvas = createIOSIcon(app.name, app.color, app.symbol);
      
      // 保存图标
      await saveIcon(canvas, filepath);
      
      console.log(`✅ 生成成功: ${app.filename}`);
      successCount++;
    } catch (error) {
      failCount++;
      console.log(`❌ 生成失败: ${app.filename} (错误: ${error.message})`);
    }
  }

  console.log('\n📊 生成完成统计:');
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failCount} 个`);
  console.log(`📁 图标保存在: ${assetsDir}`);
  
  if (successCount > 0) {
    console.log('\n🎉 真实的iOS风格PNG图标生成完成！');
    console.log('📝 这些图标使用了Canvas API生成，具有真实的视觉效果。');
  }
}

// 运行主函数
main().catch(console.error);
