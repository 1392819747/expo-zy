import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image'; // Use expo-image for better performance and caching
import * as Location from 'expo-location';
import { IconSymbol } from '@/components/ui/icon-symbol';

// --- 数据 --- //
const apps = [
    { id: '1', name: '日历', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/4c/a3/9a/4ca39a73-62c6-5f75-3435-23c21c60f214/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '2', name: '照片', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/99/36/43/993643c7-185d-85f5-b6d4-83ef4a24c5c2/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '3', name: '相机', icon: 'https://is5-ssl.mzstatic.com/image/thumb/Purple116/v4/fc/29/51/fc2951ab-1768-3563-71f6-a362e55123a6/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '4', name: '微信', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/13/a6/22/13a6225b-5e69-0a6f-a583-11354f8c6b3e/AppIcon-0-1x_U007emarketing-0-5-0-sRGB-85-220.png/230x0w.webp' },
    { id: '5', name: '时钟', icon: 'https://is4-ssl.mzstatic.com/image/thumb/Purple116/v4/e8/06/61/e8066113-2178-5775-2983-f09b578c7a6e/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '6', name: '地图', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/79/1c/64/791c64eb-991f-2851-af76-5784a8677a94/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '7', name: '天气', icon: 'https://is5-ssl.mzstatic.com/image/thumb/Purple116/v4/33/f6/32/33f632d4-3130-681b-8f15-99ff26d17333/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '8', name: '新闻', icon: 'https://is5-ssl.mzstatic.com/image/thumb/Purple126/v4/8e/3c/65/8e3c6565-d04c-a337-37a5-b38023c94d3f/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
];
const dockApps = [
    { id: '1', name: '电话', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/83/87/42/83874223-28f4-9f79-99e7-550307c89a71/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '2', name: '浏览器', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/91/97/a4/9197a45d-0518-47d5-7c58-8422d3654b9f/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '3', name: '信息', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/21/53/10/215310ac-0847-a4a3-7649-8a3911c75908/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
    { id: '4', name: '音乐', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/55/07/68/550768c8-f86a-7448-8de1-689387a2a7f5/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/230x0w.webp' },
];

// --- 辅助函数 --- //
const weatherCodeToCondition = (code) => {
    const conditions = {
        0: '晴天',
        1: '基本晴朗', 2: '局部多云', 3: '阴天',
        45: '有雾', 48: '霜雾',
        51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
        61: '小雨', 63: '中雨', 65: '大雨',
        80: '小阵雨', 81: '阵雨', 82: '强阵雨',
    };
    return conditions[code] || '未知';
};

// --- 组件 --- //
const WeatherWidget = ({ weatherData }) => {
    if (!weatherData) {
        return (
            <View style={styles.weatherWidget}>
                <ActivityIndicator color="white" />
                <Text style={styles.weatherLocation}>正在加载天气...</Text>
            </View>
        );
    }

    return (
        <View style={styles.weatherWidget}>
            <View style={styles.weatherHeader}>
                <IconSymbol name="location.fill" size={16} color="white" />
                <Text style={styles.weatherLocation}>{weatherData.city}</Text>
            </View>
            <View style={styles.weatherBody}>
                <IconSymbol name="cloud.sun.fill" size={48} color="white" style={styles.weatherIcon} />
                <Text style={styles.weatherTemp}>{Math.round(weatherData.temp)}°</Text>
            </View>
            <View style={styles.weatherFooter}>
                <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
                <Text style={styles.weatherHighLow}>高:{Math.round(weatherData.temp + 3)}° 低:{Math.round(weatherData.temp - 2)}°</Text>
            </View>
        </View>
    );
};

const AppIcon = ({ name, icon }) => (
    <TouchableOpacity style={styles.app}>
        <Image source={{ uri: icon }} style={styles.icon} cachePolicy="memory-disk" />
        <Text style={styles.appName}>{name}</Text>
    </TouchableOpacity>
);

// --- 主屏幕 --- //
export default function HomeScreen() {
    const [weatherData, setWeatherData] = useState(null);
    
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('位置权限被拒绝');
                // 可以设置一个默认地点
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            let address = await Location.reverseGeocodeAsync({ latitude, longitude });
            const city = address[0]?.city || '未知地点';

            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
            try {
                const response = await fetch(weatherUrl);
                const data = await response.json();
                const { temperature, weathercode } = data.current_weather;
                setWeatherData({
                    temp: temperature,
                    condition: weatherCodeToCondition(weathercode),
                    city: city,
                });
            } catch (error) {
                console.error("获取天气失败", error);
            }
        })();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={apps}
                renderItem={({ item }) => <AppIcon name={item.name} icon={item.icon} />}
                keyExtractor={item => item.id}
                numColumns={4}
                contentContainerStyle={styles.grid}
                ListHeaderComponent={<WeatherWidget weatherData={weatherData} />}
            />
            <View style={styles.dock}>
                {dockApps.map(app => (
                    <AppIcon key={app.id} name={app.name} icon={app.icon} />
                ))}
            </View>
        </SafeAreaView>
    );
}

// --- 样式 --- //
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#3498db' },
    grid: { padding: 16, paddingTop: 20 },
    app: { width: '25%', alignItems: 'center', marginBottom: 20 },
    icon: { width: 60, height: 60, borderRadius: 15, marginBottom: 5 },
    appName: { color: 'white', fontSize: 12, textAlign: 'center', marginTop: 4 },
    dock: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(0, 0, 0, 0.2)', paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)' },
    weatherWidget: { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 20, padding: 16, marginBottom: 20, minHeight: 150, justifyContent: 'center' },
    weatherHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    weatherLocation: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
    weatherBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    weatherIcon: {},
    weatherTemp: { color: 'white', fontSize: 48, fontWeight: '100' },
    weatherFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    weatherCondition: { color: 'white', fontSize: 16 },
    weatherHighLow: { color: 'white', fontSize: 16 },
});
