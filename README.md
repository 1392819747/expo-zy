# iOS应用图标管理器 📱

这是一个基于Expo的React Native应用，专门用于管理和展示iOS应用图标。应用提供了本地PNG图标生成、图标展示和管理功能。

## ✨ 功能特性

### 🎨 本地图标生成
- 自动生成20个高质量的iOS风格PNG图标
- 包含常用应用：Safari、邮件、日历、电话、相机、照片、音乐、地图、天气、时钟等
- 包含热门应用：微信、QQ、支付宝、淘宝、抖音、微博等
- 所有图标都是本地PNG文件，无需网络下载

### 📱 图标展示
- 美观的网格布局展示所有图标
- 支持点击交互
- 实时显示图标统计信息
- 响应式设计，适配不同屏幕尺寸

### 🛠️ 开发工具
- 图标下载器组件（支持在线下载）
- 图标展示组件（支持本地图标）
- 图标管理功能（增删改查）

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Expo CLI
- iOS/Android模拟器或真机

### 安装依赖
```bash
npm install
```

### 生成图标
```bash
node scripts/generate-png-icons.js
```

### 启动应用
```bash
npm start
```

## 📁 项目结构

```
expo-zy/
├── app/                    # 应用页面
│   ├── (tabs)/
│   │   └── index.tsx      # 主页面
│   ├── _layout.tsx        # 布局组件
│   └── modal.tsx          # 模态页面
├── assets/                # 静态资源
│   └── images/           # 图标文件
│       ├── safari.png
│       ├── mail.png
│       ├── calendar.png
│       └── ...
├── components/           # 组件
│   ├── icon-downloader.tsx    # 图标下载器
│   ├── icon-gallery.tsx       # 图标展示
│   ├── icon-showcase.tsx      # 图标展示示例
│   └── ui/                    # UI组件
├── scripts/             # 脚本
│   ├── generate-png-icons.js  # 生成PNG图标
│   └── download-icons.js      # 下载图标
└── README.md
```

## 🎯 使用方法

### 在组件中使用图标
```tsx
import { Image } from 'expo-image';

// 使用本地图标
<Image 
  source={require('../assets/images/safari.png')} 
  style={{width: 60, height: 60}} 
/>
```

### 图标组件
```tsx
import IconShowcase from '@/components/icon-showcase';

// 展示所有图标
<IconShowcase />
```

## 🎨 图标列表

| 应用名称 | 文件名 | 颜色 | 描述 |
|---------|--------|------|------|
| Safari | safari.png | #007AFF | 苹果浏览器 |
| 邮件 | mail.png | #FF3B30 | 邮件应用 |
| 日历 | calendar.png | #FF9500 | 日历应用 |
| 电话 | phone.png | #34C759 | 电话应用 |
| 相机 | camera.png | #5856D6 | 相机应用 |
| 照片 | photos.png | #FF2D92 | 照片应用 |
| 音乐 | music.png | #FF3B30 | 音乐应用 |
| 地图 | maps.png | #007AFF | 地图应用 |
| 天气 | weather.png | #FF9500 | 天气应用 |
| 时钟 | clock.png | #5856D6 | 时钟应用 |
| 计算器 | calculator.png | #8E8E93 | 计算器应用 |
| 指南针 | compass.png | #34C759 | 指南针应用 |
| 设置 | settings.png | #8E8E93 | 设置应用 |
| App Store | app-store.png | #007AFF | 应用商店 |
| 微信 | wechat.png | #07C160 | 微信应用 |
| QQ | qq.png | #12B7F5 | QQ应用 |
| 支付宝 | alipay.png | #1677FF | 支付宝应用 |
| 淘宝 | taobao.png | #FF6900 | 淘宝应用 |
| 抖音 | douyin.png | #000000 | 抖音应用 |
| 微博 | weibo.png | #E6162D | 微博应用 |

## 🔧 开发说明

### 生成新图标
1. 修改 `scripts/generate-png-icons.js` 中的 `appIcons` 数组
2. 运行 `node scripts/generate-png-icons.js`
3. 图标将自动保存到 `assets/images/` 目录

### 自定义图标
```javascript
const newIcon = {
  name: '新应用',
  filename: 'new-app.png',
  color: '#FF0000'
};
```

## 📱 平台支持

- ✅ iOS - 完全支持，优化的iOS风格界面
- ✅ Android - 完全支持，针对Android平台优化的界面布局
- ✅ Web - 完全支持

### 平台特定优化

#### iOS平台
- 使用iOS原生的圆角和阴影效果
- 优化的dock栏间距和对齐
- iOS风格的动画和交互效果

#### Android平台
- 针对Android Material Design的优化
- 修复了dock栏第四个应用显示位置问题
- Android特定的阴影和elevation效果
- 优化的触摸交互和布局间距

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License

---

**注意**: 本项目仅用于学习和演示目的，生成的图标仅供开发使用。
