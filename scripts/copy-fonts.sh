#!/bin/bash

# 字体文件复制脚本
# 从用户提供的目录复制阿里巴巴普惠体字体文件到项目assets/fonts目录

echo "请手动将以下字体文件复制到 /Volumes/64G/expo-zy/assets/fonts/ 目录："
echo "1. 从 /Volumes/64G/ipa/AlibabaPuHuiTi-3/ 目录中选择合适的字体文件"
echo "2. 推荐复制以下文件（如果存在）："
echo "   - AlibabaPuHuiTi-3-Regular.otf"
echo "   - AlibabaPuHuiTi-3-Medium.otf"
echo "   - AlibabaPuHuiTi-3-Bold.otf"
echo ""
echo "或者，如果您有其他阿里巴巴普惠体字体文件，也可以复制到该目录。"
echo ""
echo "复制完成后，项目将使用这些字体文件。"

# 创建一个占位符文件，表示字体目录已准备好
touch /Volumes/64G/expo-zy/assets/fonts/.font-ready

echo "字体目录已准备就绪。"