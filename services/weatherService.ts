// 天气数据获取服务
import * as Location from 'expo-location';

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
      accuracy: Location.Accuracy.High,
      maximumAge: 4 * 60 * 60 * 1000 // 4小时缓存
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
    // 1. 获取用户位置
    const location = await getCurrentLocation();
    
    if (location) {
      // 2. 根据位置获取城市名称
      const cityName = await getCityNameFromCoordinates(location.latitude, location.longitude);
      
      // 3. 从腾讯天气爬取数据
      const weatherData = await fetchTencentWeatherData(cityName);
      
      return weatherData;
    } else {
      // 如果没有位置权限，使用默认城市
      console.log('无法获取位置，使用默认城市数据');
      return await fetchTencentWeatherData('北京');
    }
  } catch (error) {
    console.error('获取天气数据失败:', error);
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
  const cityName = await getCityNameFromCoordinates(lat, lng);
  return await fetchTencentWeatherData(cityName);
}
