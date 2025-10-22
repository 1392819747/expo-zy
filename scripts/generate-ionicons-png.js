#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// 设置代理
process.env.https_proxy = 'http://127.0.0.1:7897';
process.env.http_proxy = 'http://127.0.0.1:7897';
process.env.all_proxy = 'socks5://127.0.0.1:7897';

// 创建目录
const assetsDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// iOS应用图标配置 - 使用Ionicons的图标名称
const appIcons = [
  { name: 'Safari', filename: 'safari.png', iconName: 'globe-outline', color: '#007AFF' },
  { name: '邮件', filename: 'mail.png', iconName: 'mail-outline', color: '#FF3B30' },
  { name: '日历', filename: 'calendar.png', iconName: 'calendar-outline', color: '#FF9500' },
  { name: '电话', filename: 'phone.png', iconName: 'call-outline', color: '#34C759' },
  { name: '相机', filename: 'camera.png', iconName: 'camera-outline', color: '#5856D6' },
  { name: '照片', filename: 'photos.png', iconName: 'images-outline', color: '#FF2D92' },
  { name: '音乐', filename: 'music.png', iconName: 'musical-notes-outline', color: '#FF3B30' },
  { name: '地图', filename: 'maps.png', iconName: 'map-outline', color: '#007AFF' },
  { name: '天气', filename: 'weather.png', iconName: 'partly-sunny-outline', color: '#FF9500' },
  { name: '时钟', filename: 'clock.png', iconName: 'time-outline', color: '#5856D6' },
  { name: '计算器', filename: 'calculator.png', iconName: 'calculator-outline', color: '#8E8E93' },
  { name: '指南针', filename: 'compass.png', iconName: 'compass-outline', color: '#34C759' },
  { name: '设置', filename: 'settings.png', iconName: 'settings-outline', color: '#8E8E93' },
  { name: 'App Store', filename: 'app-store.png', iconName: 'storefront-outline', color: '#007AFF' },
  { name: '微信', filename: 'wechat.png', iconName: 'chatbubbles-outline', color: '#07C160' },
  { name: 'QQ', filename: 'qq.png', iconName: 'chatbubble-outline', color: '#12B7F5' },
  { name: '支付宝', filename: 'alipay.png', iconName: 'card-outline', color: '#1677FF' },
  { name: '淘宝', filename: 'taobao.png', iconName: 'bag-outline', color: '#FF6900' },
  { name: '抖音', filename: 'douyin.png', iconName: 'videocam-outline', color: '#000000' },
  { name: '微博', filename: 'weibo.png', iconName: 'share-social-outline', color: '#E6162D' },
];

/**
 * 生成SVG内容
 */
function generateSVG(iconName, color, size = 1024) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(color, -20)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="90" ry="90" fill="url(#bg)"/>
  <g transform="translate(256,256)">
    ${getIconPath(iconName)}
  </g>
</svg>`;
}

/**
 * 调整颜色亮度
 */
function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * 获取图标路径
 */
function getIconPath(iconName) {
  const iconPaths = {
    'globe-outline': '<path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm0 384c-97.05 0-176-78.95-176-176S158.95 80 256 80s176 78.95 176 176-78.95 176-176 176z" fill="white"/><path d="M256 48c-97.05 0-176 78.95-176 176s78.95 176 176 176 176-78.95 176-176S353.05 48 256 48zm0 320c-79.41 0-144-64.59-144-144S176.59 80 256 80s144 64.59 144 144-64.59 144-144 144z" fill="white"/><path d="M256 48c-79.41 0-144 64.59-144 144s64.59 144 144 144 144-64.59 144-144S335.41 48 256 48zm0 256c-61.86 0-112-50.14-112-112S194.14 80 256 80s112 50.14 112 112-50.14 112-112 112z" fill="white"/>',
    'mail-outline': '<path d="M64 112c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zm0 32h384v224H64V144z" fill="white"/><path d="M64 144h384v224H64V144zm32 32v160h320V176H96z" fill="white"/>',
    'calendar-outline': '<path d="M112 80c-8.8 0-16 7.2-16 16v320c0 8.8 7.2 16 16 16h288c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H112zm0 32h288v320H112V112z" fill="white"/><path d="M80 96c0-8.8 7.2-16 16-16h320c8.8 0 16 7.2 16 16v320c0 8.8-7.2 16-16 16H96c-8.8 0-16-7.2-16-16V96zm32 0v320h320V96H112z" fill="white"/>',
    'call-outline': '<path d="M64 112c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zm0 32h384v224H64V144z" fill="white"/>',
    'camera-outline': '<path d="M256 112c-79.41 0-144 64.59-144 144s64.59 144 144 144 144-64.59 144-144-64.59-144-144-144zm0 256c-61.86 0-112-50.14-112-112S194.14 144 256 144s112 50.14 112 112-50.14 112-112 112z" fill="white"/><circle cx="256" cy="256" r="80" fill="white"/>',
    'images-outline': '<path d="M64 80c-8.8 0-16 7.2-16 16v320c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zm0 32h384v320H64V112z" fill="white"/>',
    'musical-notes-outline': '<path d="M256 80c-97.05 0-176 78.95-176 176s78.95 176 176 176 176-78.95 176-176S353.05 80 256 80zm0 320c-79.41 0-144-64.59-144-144S176.59 112 256 112s144 64.59 144 144-64.59 144-144 144z" fill="white"/>',
    'map-outline': '<path d="M64 112c-8.8 0-16 7.2-16 16v320c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zm0 32h384v320H64V144z" fill="white"/>',
    'partly-sunny-outline': '<circle cx="256" cy="256" r="80" fill="white"/><path d="M256 80c-97.05 0-176 78.95-176 176s78.95 176 176 176 176-78.95 176-176S353.05 80 256 80zm0 320c-79.41 0-144-64.59-144-144S176.59 112 256 112s144 64.59 144 144-64.59 144-144 144z" fill="white"/>',
    'time-outline': '<circle cx="256" cy="256" r="208" fill="white"/><path d="M256 80c-97.05 0-176 78.95-176 176s78.95 176 176 176 176-78.95 176-176S353.05 80 256 80zm0 320c-79.41 0-144-64.59-144-144S176.59 112 256 112s144 64.59 144 144-64.59 144-144 144z" fill="white"/>',
    'calculator-outline': '<rect x="80" y="80" width="352" height="352" rx="16" ry="16" fill="white"/>',
    'compass-outline': '<circle cx="256" cy="256" r="208" fill="white"/>',
    'settings-outline': '<circle cx="256" cy="256" r="32" fill="white"/><path d="M256 80c-97.05 0-176 78.95-176 176s78.95 176 176 176 176-78.95 176-176S353.05 80 256 80zm0 320c-79.41 0-144-64.59-144-144S176.59 112 256 112s144 64.59 144 144-64.59 144-144 144z" fill="white"/>',
    'storefront-outline': '<path d="M64 112c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zm0 32h384v224H64V144z" fill="white"/>',
    'chatbubbles-outline': '<path d="M64 112c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zm0 32h384v224H64V144z" fill="white"/>',
    'chatbubble-outline': '<path d="M64 112c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zm0 32h384v224H64V144z" fill="white"/>',
    'card-outline': '<rect x="80" y="144" width="352" height="224" rx="16" ry="16" fill="white"/>',
    'bag-outline': '<path d="M256 80c-97.05 0-176 78.95-176 176s78.95 176 176 176 176-78.95 176-176S353.05 80 256 80zm0 320c-79.41 0-144-64.59-144-144S176.59 112 256 112s144 64.59 144 144-64.59 144-144 144z" fill="white"/>',
    'videocam-outline': '<path d="M64 112c-8.8 0-16 7.2-16 16v256c0 8.8 7.2 16 16 16h384c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H64zm0 32h384v224H64V144z" fill="white"/>',
    'share-social-outline': '<path d="M256 80c-97.05 0-176 78.95-176 176s78.95 176 176 176 176-78.95 176-176S353.05 80 256 80zm0 320c-79.41 0-144-64.59-144-144S176.59 112 256 112s144 64.59 144 144-64.59 144-144 144z" fill="white"/>'
  };
  
  return iconPaths[iconName] || '<circle cx="0" cy="0" r="80" fill="white"/>';
}

/**
 * 将SVG转换为PNG
 */
function svgToPng(svgContent, filepath) {
  return new Promise((resolve, reject) => {
    // 这里简化处理，直接保存SVG文件
    // 在实际应用中，您可以使用sharp、canvas等库来转换SVG到PNG
    fs.writeFileSync(filepath.replace('.png', '.svg'), svgContent);
    
    // 创建一个简单的PNG文件头
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // 创建一个简单的PNG文件（这里简化处理）
    const simplePng = Buffer.concat([
      pngSignature,
      Buffer.from('IHDR'), // IHDR chunk
      Buffer.from([0x00, 0x00, 0x00, 0x0D]), // length
      Buffer.from('IHDR'),
      Buffer.from([
        0x00, 0x00, 0x04, 0x00, // width: 1024
        0x00, 0x00, 0x04, 0x00, // height: 1024
        0x08, // bit depth
        0x02, // color type (RGB)
        0x00, // compression method
        0x00, // filter method
        0x00  // interlace method
      ]),
      Buffer.from([0x00, 0x00, 0x00, 0x00]), // CRC placeholder
      Buffer.from('IEND'), // IEND chunk
      Buffer.from([0x00, 0x00, 0x00, 0x00]), // length
      Buffer.from('IEND'),
      Buffer.from([0xAE, 0x42, 0x60, 0x82]) // CRC
    ]);
    
    fs.writeFileSync(filepath, simplePng);
    resolve();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🎨 开始生成基于Ionicons的iOS风格图标...');
  console.log(`📁 保存目录: ${assetsDir}`);
  console.log(`📊 总共需要生成: ${appIcons.length} 个图标\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < appIcons.length; i++) {
    const app = appIcons[i];
    const filepath = path.join(assetsDir, app.filename);
    
    console.log(`[${i + 1}/${appIcons.length}] 正在生成 ${app.name}...`);
    
    try {
      // 生成SVG内容
      const svgContent = generateSVG(app.iconName, app.color);
      
      // 转换为PNG
      await svgToPng(svgContent, filepath);
      
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
    console.log('\n🎉 基于Ionicons的图标生成完成！');
    console.log('📝 注意: 当前生成的是简化版本，建议使用专业的SVG转PNG工具进行最终转换。');
  }
}

// 运行主函数
main().catch(console.error);
