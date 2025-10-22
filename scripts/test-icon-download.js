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

/**
 * 测试不同的图标API
 */
const testUrls = [
  'https://icon.horse/icon/com.apple.mobilesafari',
  'https://apps.apple.com/app/safari/id1147396723',
  'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/91/97/a4/9197a45d-0518-47d5-7c58-8422d3654b9f/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp',
  'https://via.placeholder.com/1024x1024/007AFF/FFFFFF?text=Safari'
];

/**
 * 下载文件
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`正在测试: ${url}`);
    
    const file = fs.createWriteStream(filepath);
    
    const request = https.get(url, (response) => {
      console.log(`响应状态码: ${response.statusCode}`);
      console.log(`响应头:`, response.headers);
      
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
      console.log(`❌ 请求失败: ${err.message}`);
      fs.unlink(filepath, () => {}); // 删除空文件
      reject(err);
    });
    
    file.on('error', (err) => {
      console.log(`❌ 文件写入失败: ${err.message}`);
      fs.unlink(filepath, () => {}); // 删除空文件
      reject(err);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🧪 开始测试图标下载...');
  console.log(`📁 保存目录: ${assetsDir}\n`);

  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    const filename = `test-${i + 1}.png`;
    const filepath = path.join(assetsDir, filename);
    
    console.log(`\n[测试 ${i + 1}/${testUrls.length}]`);
    
    try {
      await downloadFile(url, filepath);
      console.log(`✅ 测试 ${i + 1} 成功！`);
      break; // 找到一个可用的就停止
    } catch (error) {
      console.log(`❌ 测试 ${i + 1} 失败: ${error.message}`);
    }
    
    // 添加延迟
    if (i < testUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// 运行主函数
main().catch(console.error);
