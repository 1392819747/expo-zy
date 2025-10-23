// 天气数据获取服务
import * as Location from 'expo-location';

// 动态导入AsyncStorage
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.warn('AsyncStorage not available, caching will be disabled');
  AsyncStorage = null;
}

export interface WeatherData {
  location: string;
  condition: string;
  temperature: string;
  high: string;
  low: string;
  hourly: {
    time: string;
    temperature: string;
  }[];
}

// 缓存相关常量
const WEATHER_CACHE_KEY = 'weather_cache_data';
const WEATHER_CACHE_TIMESTAMP_KEY = 'weather_cache_timestamp';
const CACHE_EXPIRY_HOURS = 4; // 缓存4小时

// 检查缓存是否过期
function isCacheExpired(timestamp: number): boolean {
  const now = Date.now();
  const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // 转换为毫秒
  return now - timestamp > expiryTime;
}

// 从缓存获取天气数据
async function getCachedWeatherData(): Promise<WeatherData | null> {
  // 如果AsyncStorage不可用，直接返回null
  if (!AsyncStorage) {
    console.log('AsyncStorage不可用，跳过缓存');
    return null;
  }
  
  try {
    const cachedData = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    const cachedTimestamp = await AsyncStorage.getItem(WEATHER_CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !cachedTimestamp) {
      return null;
    }
    
    const timestamp = parseInt(cachedTimestamp, 10);
    if (isNaN(timestamp) || isCacheExpired(timestamp)) {
      // 缓存过期，清除缓存
      await AsyncStorage.removeItem(WEATHER_CACHE_KEY);
      await AsyncStorage.removeItem(WEATHER_CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cachedData) as WeatherData;
  } catch (error) {
    console.error('获取缓存天气数据失败:', error);
    return null;
  }
}

// 保存天气数据到缓存
async function saveWeatherDataToCache(data: WeatherData): Promise<void> {
  // 如果AsyncStorage不可用，直接返回
  if (!AsyncStorage) {
    console.log('AsyncStorage不可用，跳过缓存保存');
    return;
  }
  
  try {
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(WEATHER_CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('保存天气数据到缓存失败:', error);
  }
}

// 请求定位权限
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('请求定位权限失败:', error);
    return false;
  }
}

// 获取用户当前位置
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number; address?: string } | null> {
  try {
    // 检查权限
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('用户拒绝了定位权限');
      return null;
    }

    // 获取当前位置
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    // 获取地址信息
    let address = '';
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        address = `${addr.city || addr.district || ''}${addr.subregion || ''}`.trim();
      }
    } catch (error) {
      console.log('获取地址信息失败:', error);
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address: address || '当前位置'
    };
  } catch (error) {
    console.error('获取位置失败:', error);
    return null;
  }
}

// 模拟爬虫获取腾讯天气数据
export async function fetchTencentWeatherData(cityName?: string): Promise<WeatherData> {
  try {
    // 这里模拟从腾讯天气网站爬取数据
    // 实际实现中，你需要使用适当的爬虫库或API
    
    console.log('正在从腾讯天气获取数据...', cityName || '默认城市');
    
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟爬取到的真实数据
    const mockWeatherData: WeatherData = {
      location: cityName || '北京',
      condition: '晴转多云',
      temperature: '18°',
      high: '22°',
      low: '12°',
      hourly: [
        { time: '现在', temperature: '18°' },
        { time: '15时', temperature: '20°' },
        { time: '16时', temperature: '21°' },
        { time: '17时', temperature: '19°' }
      ]
    };
    
    console.log('腾讯天气数据获取成功:', mockWeatherData);
    return mockWeatherData;
  } catch (error) {
    console.error('从腾讯天气获取数据失败:', error);
    throw error;
  }
}

// 根据坐标获取城市名称（用于腾讯天气查询）
export async function getCityNameFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng
    });
    
    if (reverseGeocode.length > 0) {
      const addr = reverseGeocode[0];
      return addr.city || addr.district || '当前位置';
    }
    
    return '当前位置';
  } catch (error) {
    console.error('根据坐标获取城市名称失败:', error);
    return '当前位置';
  }
}

// 主要的天气数据获取函数
export async function fetchWeatherData(): Promise<WeatherData> {
  try {
    // 首先尝试从缓存获取数据
    const cachedData = await getCachedWeatherData();
    if (cachedData) {
      console.log('使用缓存的天气数据:', cachedData.location);
      return cachedData;
    }
    
    console.log('缓存未命中或已过期，重新获取天气数据');
    
    // 1. 获取用户位置
    const location = await getCurrentLocation();
    
    let weatherData: WeatherData;
    if (location) {
      // 2. 根据位置获取城市名称
      const cityName = await getCityNameFromCoordinates(location.latitude, location.longitude);
      
      // 3. 从腾讯天气爬取数据
      weatherData = await fetchTencentWeatherData(cityName);
    } else {
      // 如果没有位置权限，使用默认城市
      console.log('无法获取位置，使用默认城市数据');
      weatherData = await fetchTencentWeatherData('北京');
    }
    
    // 保存到缓存
    await saveWeatherDataToCache(weatherData);
    
    return weatherData;
  } catch (error) {
    console.error('获取天气数据失败:', error);
    
    // 如果获取新数据失败，尝试返回过期的缓存数据
    const cachedData = await getCachedWeatherData();
    if (cachedData) {
      console.log('获取新数据失败，返回过期的缓存数据');
      return cachedData;
    }
    
    // 返回默认数据
    return {
      location: '北京',
      condition: '多云',
      temperature: '20°',
      high: '25°',
      low: '15°',
      hourly: [
        { time: '现在', temperature: '20°' },
        { time: '15时', temperature: '22°' },
        { time: '16时', temperature: '23°' },
        { time: '17时', temperature: '21°' }
      ]
    };
  }
}

// 兼容性函数（保持向后兼容）
export async function getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
  const location = await getCurrentLocation();
  return location ? { latitude: location.latitude, longitude: location.longitude } : null;
}

export async function fetchWeatherByLocation(lat: number, lng: number): Promise<WeatherData> {
  try {
    // 首先尝试从缓存获取数据
    const cachedData = await getCachedWeatherData();
    if (cachedData) {
      console.log('使用缓存的天气数据:', cachedData.location);
      return cachedData;
    }
    
    console.log('缓存未命中或已过期，重新获取天气数据');
    
    const cityName = await getCityNameFromCoordinates(lat, lng);
    const weatherData = await fetchTencentWeatherData(cityName);
    
    // 保存到缓存
    await saveWeatherDataToCache(weatherData);
    
    return weatherData;
  } catch (error) {
    console.error('根据位置获取天气数据失败:', error);
    
    // 如果获取新数据失败，尝试返回过期的缓存数据
    const cachedData = await getCachedWeatherData();
    if (cachedData) {
      console.log('获取新数据失败，返回过期的缓存数据');
      return cachedData;
    }
    
    // 返回默认数据
    return {
      location: '当前位置',
      condition: '多云',
      temperature: '20°',
      high: '25°',
      low: '15°',
      hourly: [
        { time: '现在', temperature: '20°' },
        { time: '15时', temperature: '22°' },
        { time: '16时', temperature: '23°' },
        { time: '17时', temperature: '21°' }
      ]
    };
  }
}
