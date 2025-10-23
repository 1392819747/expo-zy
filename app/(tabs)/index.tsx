import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Sortable, {
  type SortableFlexDragEndParams,
  useItemContext
} from 'react-native-sortables';

import WeChatApp, { type WeChatTabKey } from '../../components/wechat-app';
import { fetchWeatherByLocation, fetchWeatherData, getUserLocation, WeatherData } from '../../services/weatherService';


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AppIconItem = {
  image: ImageSourcePropType;
  kind: 'app';
  label: string;
};

type WeatherWidgetItem = {
  condition: string;
  high: string;
  hourly: {
    temperature: string;
    time: string;
  }[];
  id: string;
  kind: 'weather';
  location: string;
  low: string;
  temperature: string;
};

type HomeItem = AppIconItem | WeatherWidgetItem;

type BoardItem = HomeItem & { id: string };

type DragOrigin = 'dock' | 'grid';

type DropZone = DragOrigin;

const createBoardItemFromApp = (item: AppIconItem): BoardItem => ({
  ...item,
  id: item.label
});

const createDockItemFromBoard = (item: BoardItem): AppIconItem => ({
  image: item.image,
  kind: 'app',
  label: item.label
});

const APP_ICONS: AppIconItem[] = [
  { image: require('../../assets/images/app-icons/facebook.png'), kind: 'app', label: 'Facebook' },
  { image: require('../../assets/images/app-icons/instagram.png'), kind: 'app', label: 'Instagram' },
  { image: require('../../assets/images/app-icons/twitter.png'), kind: 'app', label: 'Twitter' },
  { image: require('../../assets/images/app-icons/whatsapp.png'), kind: 'app', label: 'WhatsApp' },
  { image: require('../../assets/images/app-icons/wechat.png'), kind: 'app', label: 'WeChat' },
  { image: require('../../assets/images/app-icons/gmail.png'), kind: 'app', label: 'Gmail' },
  { image: require('../../assets/images/app-icons/google.png'), kind: 'app', label: 'Google' },
  { image: require('../../assets/images/app-icons/youtube.png'), kind: 'app', label: 'YouTube' },
  { image: require('../../assets/images/app-icons/spotify.png'), kind: 'app', label: 'Spotify' },
  { image: require('../../assets/images/app-icons/paypal.png'), kind: 'app', label: 'PayPal' },
  { image: require('../../assets/images/app-icons/amazon.png'), kind: 'app', label: 'Amazon' },
  { image: require('../../assets/images/app-icons/github.png'), kind: 'app', label: 'GitHub' },
  { image: require('../../assets/images/app-icons/telegram.png'), kind: 'app', label: 'Telegram' }
];

const WEATHER_WIDGET: WeatherWidgetItem = {
  condition: '加载中...',
  high: '--°',
  hourly: [
    { temperature: '--°', time: '加载中1' },
    { temperature: '--°', time: '加载中2' },
    { temperature: '--°', time: '加载中3' },
    { temperature: '--°', time: '加载中4' }
  ],
  id: 'weather-widget',
  kind: 'weather',
  location: '获取位置中...',
  low: '--°',
  temperature: '--°'
};

const shakeTimingConfig = {
  duration: 150,
  easing: Easing.inOut(Easing.ease)
};

const GRID_COLUMNS = 4;
const GRID_COLUMN_GAP = 16;
const GRID_ROW_GAP = 18;
const GRID_HORIZONTAL_PADDING = 18;
const GRID_VERTICAL_PADDING = 14;
const DOCK_CAPACITY = 4;
const GRID_ITEM_LIMIT = 20; // 设置桌面最大应用数量
const MAX_BOARD_WIDTH = 430;
const GRID_CELL_MIN_SIZE = 70;
const GRID_CELL_MAX_SIZE = 82;
const GRID_LABEL_HEIGHT = 22;
const ICON_FRAME_INSET = 8;
const ICON_IMAGE_INSET = 6;
const DOCK_TOP_GAP = 4;
const DOCK_VERTICAL_PADDING = 12;
const DOCK_BACKGROUND_OVERFLOW = 12;
const DOCK_BOTTOM_EXTRA_PADDING = 8;
const DOCK_COLUMN_GAP = 14;

const getBoardItemKey = (item: BoardItem) =>
  item.kind === 'weather' ? item.id : item.label;

type IconProps = {
  containerStyle?: StyleProp<ViewStyle>;
  isEditing: SharedValue<boolean>;
  item: AppIconItem;
  onDelete?: (item: AppIconItem) => void;
  onPress?: (item: AppIconItem) => void;
  showDelete?: boolean;
  showLabel?: boolean;
  size: number;
};

const Icon = memo(function Icon({
  containerStyle,
  isEditing,
  item,
  onDelete,
  onPress,
  showDelete = true,
  showLabel = true,
  size
}: IconProps) {
  const { isActive } = useItemContext();

  const shakeProgress = useDerivedValue(() =>
    isEditing.value
      ? withDelay(
          Math.random() * 300,
          withRepeat(
            withSequence(
              withTiming(-2, shakeTimingConfig),
              withTiming(2, shakeTimingConfig)
            ),
            -1
          )
        )
      : withTiming(0, shakeTimingConfig)
  );

  const pressScale = useSharedValue(1);

  useDerivedValue(() => {
    if (isEditing.value || isActive.value) {
      pressScale.value = withTiming(1, shakeTimingConfig);
    }
  });

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${shakeProgress.value}deg` },
      { scale: isActive.value ? 1 : pressScale.value }
    ]
  }));

  const animatedDeleteButtonStyle = useAnimatedStyle(() =>
    isEditing.value && !isActive.value && showDelete
      ? { opacity: withTiming(1), pointerEvents: 'auto' }
      : { opacity: withTiming(0), pointerEvents: 'none' }
  );

  const frameInset = Math.min(size / 2, ICON_FRAME_INSET);
  const iconContainerSize = Math.max(0, size - frameInset * 2);
  const iconCornerRadius = Math.round(iconContainerSize * 0.23);
  const imagePadding = Math.min(iconContainerSize / 2, ICON_IMAGE_INSET);
  const imageSize = Math.max(0, iconContainerSize - imagePadding * 2);

  const handlePressIn = () => {
    if (isEditing.value || isActive.value) {
      return;
    }
    pressScale.value = withTiming(0.92, { duration: 120, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.ease) });
  };

  const handlePress = () => {
    if (isEditing.value || !onPress) {
      return;
    }
    onPress(item);
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.icon,
        animatedIconStyle,
        {
          paddingBottom: showLabel ? 0 : frameInset,
          paddingHorizontal: frameInset,
          paddingTop: frameInset,
          width: size
        },
        containerStyle
      ]}>
      <View
        style={[
          styles.imageContainer,
          {
            borderRadius: iconCornerRadius,
            height: iconContainerSize,
            padding: imagePadding,
            width: iconContainerSize
          }
        ]}>
        <Image
          resizeMode='contain'
          source={item.image}
          style={{ height: imageSize, width: imageSize }}
        />
      </View>
      {showLabel && (
        <Text numberOfLines={1} style={styles.text}>
          {item.label}
        </Text>
      )}
      {showDelete && onDelete && (
        <AnimatedPressable
          style={[styles.deleteButton, animatedDeleteButtonStyle]}
          onPress={() => onDelete(item)}>
          <Text style={styles.deleteButtonText}>-</Text>
        </AnimatedPressable>
      )}
    </AnimatedPressable>
  );
});

type WeatherWidgetProps = {
  isEditing: SharedValue<boolean>;
  item: WeatherWidgetItem;
  onDelete: (item: WeatherWidgetItem) => void;
  onPress?: () => void;
  size: { height: number; width: number };
};

const WeatherWidget = memo(function WeatherWidget({
  isEditing,
  item,
  onDelete,
  onPress,
  size
}: WeatherWidgetProps) {
  const { isActive } = useItemContext();

  const shakeProgress = useDerivedValue(() =>
    isEditing.value
      ? withDelay(
          Math.random() * 300,
          withRepeat(
            withSequence(withTiming(-1.4, shakeTimingConfig), withTiming(1.4, shakeTimingConfig)),
            -1
          )
        )
      : withTiming(0, shakeTimingConfig)
  );

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shakeProgress.value}deg` }]
  }));

  const animatedDeleteButtonStyle = useAnimatedStyle(() =>
    isEditing.value && !isActive.value
      ? { opacity: withTiming(1), pointerEvents: 'auto' }
      : { opacity: withTiming(0), pointerEvents: 'none' }
  );

  return (
    <Animated.View
      style={[
        styles.widgetWrapper,
        animatedShakeStyle,
        { height: size.height, width: size.width }
      ]}>
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        <LinearGradient
          colors={['#1a1f38', '#1f2c5c', '#274782']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={[styles.widgetContainer, { height: size.height, width: size.width }]}>
        <View style={styles.widgetHeader}>
          <View>
            <Text style={styles.widgetLocation}>{item.location}</Text>
            <Text style={styles.widgetCondition}>{`今天 · ${item.condition}`}</Text>
          </View>
          <View style={styles.widgetBadge}>
            <Text style={styles.widgetBadgeText}>🌤️</Text>
          </View>
        </View>
        <View style={styles.widgetTemperatureRow}>
          <Text style={styles.widgetTemperature}>{item.temperature}</Text>
        </View>
        <View style={styles.widgetRangeSection}>
          <View style={styles.widgetRangeCard}>
            <View style={styles.widgetRangeRow}>
              <Text style={styles.widgetRangeLabel}>最高</Text>
              <Text style={styles.widgetRangeValue}>{item.high}</Text>
            </View>
            <View style={styles.widgetRangeDivider} />
            <View style={styles.widgetRangeRow}>
              <Text style={styles.widgetRangeLabel}>最低</Text>
              <Text style={styles.widgetRangeValue}>{item.low}</Text>
            </View>
          </View>
        </View>
        <View style={styles.widgetForecastRow}>
          {item.hourly.map((forecastPoint, index) => (
            <LinearGradient
              colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.05)']}
              end={{ x: 1, y: 1 }}
              key={`${forecastPoint.time}-${index}`}
              start={{ x: 0, y: 0 }}
              style={styles.widgetForecastItem}>
              <Text style={styles.widgetForecastTime}>{forecastPoint.time}</Text>
              <Text style={styles.widgetForecastTemp}>{forecastPoint.temperature}</Text>
            </LinearGradient>
          ))}
        </View>
      </LinearGradient>
      </Pressable>
      <AnimatedPressable
        style={[styles.deleteButton, animatedDeleteButtonStyle]}
        onPress={() => onDelete(item)}>
        <Text style={styles.deleteButtonText}>-</Text>
      </AnimatedPressable>
    </Animated.View>
  );
});

export default function AppleIconSort() {
  // 天气数据状态
  const [weatherData, setWeatherData] = useState<WeatherWidgetItem>(WEATHER_WIDGET);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  // 获取天气数据
  const loadWeatherData = useCallback(async () => {
    try {
      setIsLoadingWeather(true);
      
      // 首先尝试获取用户位置
      const location = await getUserLocation();
      
      let weatherInfo: WeatherData;
      if (location) {
        // 根据位置获取天气
        weatherInfo = await fetchWeatherByLocation(location.latitude, location.longitude);
      } else {
        // 使用默认天气数据
        weatherInfo = await fetchWeatherData();
      }
      
      // 更新天气小组件数据
      setWeatherData({
        id: 'weather-widget',
        kind: 'weather',
        location: weatherInfo.location,
        condition: weatherInfo.condition,
        temperature: weatherInfo.temperature,
        high: weatherInfo.high,
        low: weatherInfo.low,
        hourly: weatherInfo.hourly
      });
    } catch (error) {
      console.error('加载天气数据失败:', error);
      // 保持默认的加载状态
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // 组件挂载时加载天气数据
  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  // 当天气数据更新时，同步更新gridItems中的天气小组件
  useEffect(() => {
    setGridItems(prevItems => 
      prevItems.map(item => 
        item.kind === 'weather' 
          ? { ...weatherData, id: weatherData.id }
          : item
      )
    );
  }, [weatherData]);

  const initialDockIcons = useMemo(
    () => APP_ICONS.slice(0, DOCK_CAPACITY).map(icon => ({ ...icon })),
    []
  );
  const initialGridItems = useMemo(
    () =>
      [
        { ...weatherData, id: weatherData.id },
        ...APP_ICONS.slice(DOCK_CAPACITY).map(icon => ({ ...icon, id: icon.label }))
      ],
    [weatherData]
  );

  const [gridItems, setGridItems] = useState<BoardItem[]>(initialGridItems);
  const [dockItems, setDockItems] = useState<AppIconItem[]>(initialDockIcons);
  const [isEditing, setIsEditing] = useState(false);
  const [isWeChatOpen, setIsWeChatOpen] = useState(false);
  const [activeWeChatTab, setActiveWeChatTab] = useState<WeChatTabKey>('chats');
  const isEditingValue = useDerivedValue(() => isEditing);

  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const availableBoardWidth = useMemo(
    () => Math.min(screenWidth, MAX_BOARD_WIDTH),
    [screenWidth]
  );

  const cellSize = useMemo(() => {
    const computedCellSize =
      (availableBoardWidth - GRID_HORIZONTAL_PADDING * 2 - GRID_COLUMN_GAP * (GRID_COLUMNS - 1)) /
      GRID_COLUMNS;

    const clamped = Math.max(
      GRID_CELL_MIN_SIZE,
      Math.min(GRID_CELL_MAX_SIZE, computedCellSize)
    );

    return Math.round(clamped * 10) / 10;
  }, [availableBoardWidth]);

  const boardContentWidth = useMemo(
    () => Math.round(cellSize * GRID_COLUMNS + GRID_COLUMN_GAP * (GRID_COLUMNS - 1)),
    [cellSize]
  );

  const boardWidth = useMemo(
    () => boardContentWidth + GRID_HORIZONTAL_PADDING * 2,
    [boardContentWidth]
  );

  const widgetSize = useMemo(
    () => ({
      height: cellSize * 2 + GRID_ROW_GAP,
      width: boardContentWidth
    }),
    [boardContentWidth, cellSize]
  );

  const dockHeight = useMemo(
    () => cellSize + DOCK_VERTICAL_PADDING * 2,
    [cellSize]
  );

  const dockContentWidth = useMemo(() => {
    const minimumWidth = cellSize * DOCK_CAPACITY + DOCK_COLUMN_GAP * (DOCK_CAPACITY - 1);
    const targetWidth = Math.round(boardContentWidth - DOCK_BACKGROUND_OVERFLOW * 2);

    return Math.max(targetWidth, minimumWidth);
  }, [boardContentWidth, cellSize]);

  const dockHorizontalInset = useMemo(() => {
    const inset = (boardWidth - (dockContentWidth + DOCK_BACKGROUND_OVERFLOW * 2)) / 2;

    return Math.max(0, Math.round(inset));
  }, [boardWidth, dockContentWidth]);

  const gridCellStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      alignItems: 'center',
      flexBasis: cellSize,
      flexGrow: 0,
      flexShrink: 0,
      height: cellSize + GRID_LABEL_HEIGHT,
      width: cellSize
    }),
    [cellSize]
  );

  const dockCellStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      alignItems: 'center',
      flexBasis: cellSize,
      flexGrow: 0,
      flexShrink: 0,
      height: cellSize,
      width: cellSize
    }),
    [cellSize]
  );

  const dockBackgroundStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      height: dockHeight,
      left: dockHorizontalInset,
      right: dockHorizontalInset
    }),
    [dockHeight, dockHorizontalInset]
  );

  const dockZoneStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      height: dockHeight,
      paddingHorizontal: dockHorizontalInset + DOCK_BACKGROUND_OVERFLOW,
      paddingVertical: DOCK_VERTICAL_PADDING,
      width: boardWidth
    }),
    [boardWidth, dockHeight, dockHorizontalInset]
  );

  const handleBoardItemDelete = useCallback((item: HomeItem) => {
    setGridItems(prevItems =>
      prevItems.filter(candidate => {
        if (candidate.kind === 'weather' && item.kind === 'weather') {
          return candidate.id !== item.id;
        }
        if (candidate.kind === 'app' && item.kind === 'app') {
          return candidate.label !== item.label;
        }
        return true;
      })
    );
  }, []);

  const handleAppIconDelete = useCallback(
    (item: AppIconItem) => {
      handleBoardItemDelete(item);
    },
    [handleBoardItemDelete]
  );

  const handleDockItemDelete = useCallback((item: AppIconItem) => {
    setDockItems(prevItems => prevItems.filter(candidate => candidate.label !== item.label));
  }, []);

  const handleIconPress = useCallback(
    (item: AppIconItem) => {
      if (isEditing) {
        return;
      }
      void Haptics.selectionAsync();
      if (item.label === 'WeChat') {
        setActiveWeChatTab('chats');
        setIsWeChatOpen(true);
        return;
      }
      Alert.alert(item.label, '该应用稍后提供完整体验。');
    },
    [isEditing, setActiveWeChatTab, setIsWeChatOpen]
  );

  // 处理天气小组件点击
  const handleWeatherWidgetPress = useCallback(() => {
    if (isEditing) {
      return;
    }
    void Haptics.selectionAsync();
    // 刷新天气数据
    loadWeatherData();
  }, [isEditing, loadWeatherData]);

  const activeItemRef = useRef<BoardItem | null>(null);
  const activeOriginRef = useRef<DragOrigin | null>(null);
  const dropZoneRef = useRef<DropZone | null>(null);
  const activeIndexRef = useRef<number | null>(null);

  const resetActiveTracking = useCallback(() => {
    activeItemRef.current = null;
    activeOriginRef.current = null;
    activeIndexRef.current = null;
    dropZoneRef.current = null;
  }, []);

  const captureActiveItem = useCallback(
    (origin: DragOrigin, key: string) => {
      console.log('captureActiveItem called with origin:', origin, 'key:', key);
      activeOriginRef.current = origin;
      const sourceItems = origin === 'grid' ? gridItems : dockItems;
      console.log('Source items:', sourceItems.map(item => item.label || item.id));
      
      // 去掉key前面的点，这是拖拽库添加的前缀
      const cleanKey = key.startsWith('.$') ? key.substring(2) : key;
      console.log('Clean key:', cleanKey);
      
      const foundIndex = sourceItems.findIndex(
        item => getBoardItemKey(item as BoardItem) === cleanKey
      );
      console.log('Found index:', foundIndex);
      
      activeIndexRef.current = foundIndex >= 0 ? foundIndex : null;
      const foundItem = foundIndex >= 0 ? (sourceItems[foundIndex] as BoardItem) : null;
      
      if (!foundItem) {
        console.log('No item found, setting activeItemRef to null');
        activeItemRef.current = null;
        return;
      }
      
      if (origin === 'dock') {
        console.log('Creating board item from dock item:', foundItem.label);
        const boardItem = createBoardItemFromApp(foundItem as AppIconItem);
        console.log('Created board item:', boardItem);
        activeItemRef.current = boardItem;
        return;
      }
      
      console.log('Using grid item directly:', foundItem.label || foundItem.id);
      activeItemRef.current = { ...(foundItem as BoardItem) };
    },
    [dockItems, gridItems]
  );

  const handleZoneEnter = useCallback((zone: DropZone) => {
    dropZoneRef.current = zone;
  }, []);

  const handleZoneLeave = useCallback((zone: DropZone) => {
    if (dropZoneRef.current === zone) {
      dropZoneRef.current = null;
    }
  }, []);

  const handleZoneDrop = useCallback((zone: DropZone) => {
    console.log('handleZoneDrop called with zone:', zone);
    console.log('activeItem:', activeItemRef.current?.label || activeItemRef.current?.id);
    console.log('activeOrigin:', activeOriginRef.current);
    
    // 设置dropZoneRef，以便handleGridDragEnd和handleDockDragEnd可以使用
    dropZoneRef.current = zone;
    
    // 如果有活跃的拖拽项，直接处理区域间的拖拽
    if (activeItemRef.current && activeOriginRef.current) {
      const activeItem = activeItemRef.current;
      const activeOrigin = activeOriginRef.current;
      console.log('处理跨区域拖拽:', activeOrigin, '->', zone);
      
      // 如果从dock拖拽到grid
      if (activeOrigin === 'dock' && zone === 'grid' && activeItem.kind === 'app') {
        console.log('处理从dock到grid的拖拽');
        
        // 检查grid是否已满
        if (gridItems.length >= GRID_ITEM_LIMIT) {
          console.log('Grid已满，无法添加');
          resetActiveTracking();
          return;
        }
        
        // 从dock中移除该项
        setDockItems(prev => prev.filter(item => item.label !== activeItem.label));
        
        // 添加到grid中
        setGridItems(prev => [...prev, createBoardItemFromApp(activeItem)]);
        
        // 重置拖拽状态
        resetActiveTracking();
        return;
      }
      
      // 如果从grid拖拽到dock
      if (activeOrigin === 'grid' && zone === 'dock' && activeItem.kind === 'app') {
        console.log('处理从grid到dock的拖拽');
        console.log('activeItem详情:', activeItem);
        
        // 先从grid中移除该项
        setGridItems(prev => {
          console.log('从grid移除应用前:', prev.map(item => item.label || item.id));
          console.log('要移除的应用:', activeItem.label || activeItem.id);
          const nextGrid = prev.filter(item => {
            const itemKey = getBoardItemKey(item);
            const activeKey = getBoardItemKey(activeItem);
            const shouldRemove = itemKey === activeKey;
            console.log(`比较 ${itemKey} 与 ${activeKey}, 应该移除: ${shouldRemove}`);
            return !shouldRemove;
          });
          console.log('从grid移除应用后:', nextGrid.map(item => item.label || item.id));
          return nextGrid;
        });
        
        // 使用setTimeout确保grid更新完成后再更新dock
        setTimeout(() => {
          console.log('开始更新dock');
          // 使用函数形式获取最新的dockItems状态
          setDockItems(prevDockItems => {
            console.log('Dock当前数量:', prevDockItems.length, '最大容量:', DOCK_CAPACITY);
            console.log('Dock当前应用:', prevDockItems.map(item => item.label));
            
            if (prevDockItems.length >= DOCK_CAPACITY) {
              console.log('Dock已满，替换最后一个应用');
              
              // 获取最后一个应用
              const lastDockItem = prevDockItems[prevDockItems.length - 1];
              console.log('被替换的应用:', lastDockItem.label);
              
              // 将新应用添加到dock
              const nextDock = [...prevDockItems];
              nextDock[nextDock.length - 1] = createDockItemFromBoard(activeItem);
              console.log('Dock更新前:', prevDockItems.map(item => item.label));
              console.log('Dock更新后:', nextDock.map(item => item.label));
              
              // 将被替换的应用添加到grid最后
              if (lastDockItem) {
                setGridItems(prevGridItems => {
                  console.log('Grid添加应用前:', prevGridItems.map(item => item.label || item.id));
                  const nextGrid = [...prevGridItems, createBoardItemFromApp(lastDockItem)];
                  console.log('Grid添加应用后:', nextGrid.map(item => item.label || item.id));
                  return nextGrid;
                });
              }
              
              return nextDock;
            } else {
              console.log('Dock未满，直接添加');
              // dock未满，直接添加
              const nextDock = [...prevDockItems, createDockItemFromBoard(activeItem)];
              console.log('Dock添加应用前:', prevDockItems.map(item => item.label));
              console.log('Dock添加应用后:', nextDock.map(item => item.label));
              return nextDock;
            }
          });
        }, 100);
        
        // 重置拖拽状态
        resetActiveTracking();
        return;
      }
    } else {
      console.log('没有活跃的拖拽项或来源');
    }
  }, [gridItems.length, resetActiveTracking]);

  const handleGridDragStart = useCallback(
    ({ key }: { key: string }) => {
      captureActiveItem('grid', key);
      if (!isEditing) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsEditing(true);
      }
    },
    [captureActiveItem, isEditing]
  );

  const handleDockDragStart = useCallback(
    ({ key }: { key: string }) => {
      captureActiveItem('dock', key);
      if (!isEditing) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsEditing(true);
      }
    },
    [captureActiveItem, isEditing]
  );

  const handleGridDragEnd = useCallback(
    ({ order, toIndex }: SortableFlexDragEndParams) => {
      console.log('handleGridDragEnd called');
      const activeItem = activeItemRef.current;
      const activeOrigin = activeOriginRef.current;
      const originIndex = activeIndexRef.current;
      const rawDropZone = dropZoneRef.current;
      
      console.log('activeItem:', activeItem?.label || activeItem?.id);
      console.log('activeOrigin:', activeOrigin);
      console.log('rawDropZone:', rawDropZone);
      
      // 如果已经在handleZoneDrop中处理了跨区域拖拽，这里就不需要再处理
      if (rawDropZone && activeOrigin && activeOrigin !== rawDropZone) {
        console.log('跨区域拖拽已在handleZoneDrop中处理，跳过handleGridDragEnd');
        return;
      }
      
      const resolvedDropZone =
        rawDropZone ??
        (activeOrigin === 'dock' && Number.isFinite(toIndex) ? 'grid' : rawDropZone);
      let displacedDockItem: AppIconItem | null = null;

      setGridItems(prevItems => {
        const reordered = order<BoardItem>(prevItems);

        if (resolvedDropZone !== 'grid') {
          return reordered;
        }

        if (!activeItem) {
          return reordered;
        }

        if (activeOrigin === 'grid') {
          return reordered;
        }

        if (activeOrigin === 'dock' && activeItem.kind === 'app') {
          const alreadyInGrid = prevItems.some(
            candidate => getBoardItemKey(candidate) === getBoardItemKey(activeItem)
          );

          if (alreadyInGrid) {
            return reordered;
          }

          const safeIndex = Number.isFinite(toIndex) ? Math.max(0, Math.floor(toIndex)) : 0;
          const clampedInsertionIndex = Math.min(safeIndex, prevItems.length);
          let workingItems = [...prevItems];

          if (clampedInsertionIndex < prevItems.length) {
            const targetItem = prevItems[clampedInsertionIndex];
            if (targetItem?.kind === 'app') {
              displacedDockItem = createDockItemFromBoard(targetItem);
              workingItems = prevItems.filter((_, index) => index !== clampedInsertionIndex);
            }
          }

          const insertAt = Math.min(clampedInsertionIndex, workingItems.length);
          const nextItems = [...workingItems];
          nextItems.splice(insertAt, 0, createBoardItemFromApp(activeItem));
          return nextItems;
        }

        return reordered;
      });

      if (
        resolvedDropZone === 'grid' &&
        activeItem &&
        activeOrigin === 'dock' &&
        activeItem.kind === 'app'
      ) {
        setDockItems(prevDock => {
          let nextDock = prevDock.filter(item => item.label !== activeItem.label);
          if (displacedDockItem) {
            const desiredIndex =
              originIndex != null
                ? Math.max(0, Math.min(originIndex, nextDock.length))
                : nextDock.length;
            if (nextDock.length < DOCK_CAPACITY) {
              const insertAt = Math.min(desiredIndex, nextDock.length);
              nextDock = [
                ...nextDock.slice(0, insertAt),
                displacedDockItem,
                ...nextDock.slice(insertAt)
              ];
            } else if (nextDock.length > 0) {
              const targetIndex = Math.min(desiredIndex, nextDock.length - 1);
              const updated = [...nextDock];
              updated[targetIndex] = displacedDockItem;
              nextDock = updated;
            }
          }
          return nextDock.slice(0, DOCK_CAPACITY);
        });

        resetActiveTracking();
        return;
      }

      // 处理从grid到dock的拖拽，如果还没有被处理
      if (
        activeItem &&
        activeOrigin === 'grid' &&
        activeItem.kind === 'app' &&
        (rawDropZone === 'dock' || (!rawDropZone && Number.isFinite(toIndex)))
      ) {
        console.log('在handleGridDragEnd中处理从grid到dock的拖拽');
        
        // 使用函数形式获取最新的dockItems状态
        setDockItems(prevDockItems => {
          console.log('Dock当前数量:', prevDockItems.length, '最大容量:', DOCK_CAPACITY);
          console.log('Dock当前应用:', prevDockItems.map(item => item.label));
          
          if (prevDockItems.length >= DOCK_CAPACITY) {
            console.log('Dock已满，替换最后一个应用');
            
            // 获取最后一个应用
            const lastDockItem = prevDockItems[prevDockItems.length - 1];
            console.log('被替换的应用:', lastDockItem.label);
            
            // 将新应用添加到dock
            const nextDock = [...prevDockItems];
            nextDock[nextDock.length - 1] = createDockItemFromBoard(activeItem);
            console.log('Dock更新前:', prevDockItems.map(item => item.label));
            console.log('Dock更新后:', nextDock.map(item => item.label));
            
            // 将被替换的应用添加到grid最后
            if (lastDockItem) {
              setGridItems(prevGridItems => {
                console.log('Grid添加应用前:', prevGridItems.map(item => item.label || item.id));
                const nextGrid = [...prevGridItems, createBoardItemFromApp(lastDockItem)];
                console.log('Grid添加应用后:', nextGrid.map(item => item.label || item.id));
                return nextGrid;
              });
            }
            
            return nextDock;
          } else {
            console.log('Dock未满，直接添加');
            // dock未满，直接添加
            const nextDock = [...prevDockItems, createDockItemFromBoard(activeItem)];
            console.log('Dock添加应用前:', prevDockItems.map(item => item.label));
            console.log('Dock添加应用后:', nextDock.map(item => item.label));
            return nextDock;
          }
        });
        
        // 从grid中移除该项
        setGridItems(prev => {
          console.log('从grid移除应用前:', prev.map(item => item.label || item.id));
          console.log('要移除的应用:', activeItem.label || activeItem.id);
          const nextGrid = prev.filter(item => {
            const itemKey = getBoardItemKey(item);
            const activeKey = getBoardItemKey(activeItem);
            const shouldRemove = itemKey === activeKey;
            console.log(`比较 ${itemKey} 与 ${activeKey}, 应该移除: ${shouldRemove}`);
            return !shouldRemove;
          });
          console.log('从grid移除应用后:', nextGrid.map(item => item.label || item.id));
          return nextGrid;
        });
        
        resetActiveTracking();
        return;
      }

      if (resolvedDropZone === 'grid') {
        resetActiveTracking();
      } else if (!resolvedDropZone) {
        resetActiveTracking();
      }
    },
    [resetActiveTracking]
  );

  const handleDockDragEnd = useCallback(
    ({ order, toIndex }: SortableFlexDragEndParams) => {
      console.log('handleDockDragEnd called');
      const activeItem = activeItemRef.current;
      const activeOrigin = activeOriginRef.current;
      const originIndex = activeIndexRef.current;
      const rawDropZone = dropZoneRef.current;
      
      console.log('activeItem:', activeItem?.label || activeItem?.id);
      console.log('activeOrigin:', activeOrigin);
      console.log('rawDropZone:', rawDropZone);
      
      // 如果已经在handleZoneDrop中处理了跨区域拖拽，这里就不需要再处理
      if (rawDropZone && activeOrigin && activeOrigin !== rawDropZone) {
        console.log('跨区域拖拽已在handleZoneDrop中处理，跳过handleDockDragEnd');
        return;
      }
      
      const resolvedDropZone =
        rawDropZone ??
        (activeOrigin === 'grid' && Number.isFinite(toIndex)
          ? 'dock'
          : activeOrigin === 'dock' && Number.isFinite(toIndex)
            ? 'grid'
            : rawDropZone);

      if (
        resolvedDropZone === 'grid' &&
        activeItem &&
        activeOrigin === 'dock' &&
        activeItem.kind === 'app'
      ) {
        let displacedDockItem: AppIconItem | null = null;

        setGridItems(prevGrid => {
          const alreadyInGrid = prevGrid.some(
            candidate => getBoardItemKey(candidate) === getBoardItemKey(activeItem)
          );
          if (alreadyInGrid) {
            return prevGrid;
          }

          const safeIndex = Number.isFinite(toIndex) ? Math.max(0, Math.floor(toIndex)) : prevGrid.length;
          const clampedIndex = Math.min(safeIndex, prevGrid.length);
          const nextGrid = [...prevGrid];

          if (clampedIndex < nextGrid.length) {
            const targetItem = nextGrid[clampedIndex];
            if (targetItem?.kind === 'app') {
              displacedDockItem = createDockItemFromBoard(targetItem);
              nextGrid.splice(clampedIndex, 1);
            }
          }

          const insertAt = Math.min(clampedIndex, nextGrid.length);
          nextGrid.splice(insertAt, 0, createBoardItemFromApp(activeItem));
          return nextGrid;
        });

        setDockItems(prevDock => {
          let nextDock = prevDock.filter(item => item.label !== activeItem.label);

          if (displacedDockItem) {
            const desiredIndex =
              originIndex != null
                ? Math.max(0, Math.min(originIndex, nextDock.length))
                : nextDock.length;

            if (nextDock.length < DOCK_CAPACITY) {
              nextDock = [
                ...nextDock.slice(0, desiredIndex),
                displacedDockItem,
                ...nextDock.slice(desiredIndex)
              ];
            } else if (nextDock.length > 0) {
              const targetIndex = Math.min(desiredIndex, nextDock.length - 1);
              const updated = [...nextDock];
              updated[targetIndex] = displacedDockItem;
              nextDock = updated;
            }
          }

          return nextDock.slice(0, DOCK_CAPACITY);
        });

        resetActiveTracking();
        return;
      }

      let displacedGridItem: AppIconItem | null = null;

      setDockItems(prevItems => {
        const reordered = order<AppIconItem>(prevItems);

        if (resolvedDropZone !== 'dock') {
          return reordered;
        }

        if (!activeItem) {
          return reordered;
        }

        if (activeOrigin === 'dock') {
          return reordered;
        }

        if (activeOrigin === 'grid' && activeItem.kind === 'app') {
          const existingIndex = reordered.findIndex(item => item.label === activeItem.label);
          if (existingIndex !== -1) {
            return reordered;
          }

          const safeIndex = Number.isFinite(toIndex) ? Math.max(0, Math.floor(toIndex)) : 0;
          const maxTargetIndex = Math.max(0, Math.min(safeIndex, DOCK_CAPACITY - 1));
          const next = [...reordered];

          if (next.length < DOCK_CAPACITY) {
            const insertAt = Math.min(maxTargetIndex, next.length);
            next.splice(insertAt, 0, createDockItemFromBoard(activeItem));
            return next;
          }

          if (next.length > 0) {
            // 替换目标位置的应用
            const targetIndex = Math.min(maxTargetIndex, next.length - 1);
            displacedGridItem = { ...next[targetIndex] };
            next[targetIndex] = createDockItemFromBoard(activeItem);
            return next;
          }
        }

        return reordered;
      });

      if (
        resolvedDropZone === 'dock' &&
        activeItem &&
        activeOrigin === 'grid' &&
        activeItem.kind === 'app'
      ) {
        setGridItems(prevGrid => {
          let nextGrid = prevGrid.filter(
            candidate => getBoardItemKey(candidate) !== getBoardItemKey(activeItem)
          );
          if (displacedGridItem) {
            // 将挤出的应用添加到grid的最后面
            const insertAt = nextGrid.length;
            nextGrid = [
              ...nextGrid.slice(0, insertAt),
              createBoardItemFromApp(displacedGridItem),
              ...nextGrid.slice(insertAt)
            ];
          }
          return nextGrid;
        });
        resetActiveTracking();
        return;
      }

      if (resolvedDropZone === 'dock') {
        resetActiveTracking();
      } else if (!resolvedDropZone) {
        resetActiveTracking();
      }
    },
    [resetActiveTracking]
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <StatusBar hidden={isEditing || isWeChatOpen} style="light" />
      {/* Done按钮放在状态栏右上角 */}
      {isEditing && (
        <AnimatedPressable
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.doneButton}
          onPress={() => setIsEditing(false)}>
          <Text style={styles.buttonText}>Done</Text>
        </AnimatedPressable>
      )}
      <Sortable.MultiZoneProvider>
        <View style={styles.boardRoot}>
          <View style={styles.gridSection}>
            <Sortable.BaseZone
              onItemDrop={() => handleZoneDrop('grid')}
              onItemEnter={() => handleZoneEnter('grid')}
              onItemLeave={() => handleZoneLeave('grid')}
              style={styles.zoneContainer}>
              <View
                style={[
                  styles.boardContainer,
                  {
                    paddingHorizontal: GRID_HORIZONTAL_PADDING,
                    paddingTop: GRID_VERTICAL_PADDING,
                    width: boardWidth
                  }
                ]}>
                <Sortable.Flex
                  columnGap={GRID_COLUMN_GAP}
                  flexDirection='row'
                  flexWrap='wrap'
                  inactiveItemOpacity={1}
                  onDragEnd={handleGridDragEnd}
                  onDragStart={handleGridDragStart}
                  rowGap={GRID_ROW_GAP}
                  style={{ paddingBottom: GRID_VERTICAL_PADDING, width: boardContentWidth }}>
                  {gridItems.map(item => {
                    const key = getBoardItemKey(item);

                    if (item.kind === 'weather') {
                      return (
                        <View
                          key={key}
                          pointerEvents='box-none'
                          style={{ width: boardContentWidth }}>
                          <WeatherWidget
                            isEditing={isEditingValue}
                            item={item}
                            onDelete={handleBoardItemDelete}
                            onPress={handleWeatherWidgetPress}
                            size={widgetSize}
                          />
                        </View>
                      );
                    }

                    return (
                      <View key={key} style={gridCellStyle}>
                        <Icon
                          isEditing={isEditingValue}
                          item={item}
                          onDelete={handleAppIconDelete}
                          onPress={handleIconPress}
                          showDelete
                          size={cellSize}
                        />
                      </View>
                    );
                  })}
                </Sortable.Flex>
              </View>
            </Sortable.BaseZone>
          </View>
          <View
            pointerEvents='box-none'
            style={[
              styles.dockSection,
              {
                paddingBottom: insets.bottom + DOCK_BOTTOM_EXTRA_PADDING,
                paddingTop: DOCK_TOP_GAP
              }
            ]}>
            <View style={{ width: boardWidth }}>
              <View
                pointerEvents='none'
                style={[
                  styles.dockBackground,
                  dockBackgroundStyle
                ]}
              />
              <Sortable.BaseZone
                onItemDrop={() => handleZoneDrop('dock')}
                onItemEnter={() => handleZoneEnter('dock')}
                onItemLeave={() => handleZoneLeave('dock')}
                style={[
                  styles.dockZone,
                  dockZoneStyle
                ]}>
                <Sortable.Flex
                  alignItems='center'
                  columnGap={DOCK_COLUMN_GAP}
                  flexDirection='row'
                  inactiveItemOpacity={1}
                  onDragEnd={handleDockDragEnd}
                  onDragStart={handleDockDragStart}
                  rowGap={0}
                  style={{ width: dockContentWidth }}>
                  {dockItems.map(item => (
                    <View key={item.label} style={dockCellStyle}>
                      <Icon
                        isEditing={isEditingValue}
                        item={item}
                        onDelete={handleDockItemDelete}
                        onPress={handleIconPress}
                        showLabel={false}
                        size={cellSize}
                      />
                    </View>
                  ))}
                </Sortable.Flex>
              </Sortable.BaseZone>
            </View>
          </View>
        </View>
      </Sortable.MultiZoneProvider>
      {isWeChatOpen && (
        <WeChatApp
          activeTab={activeWeChatTab}
          onClose={() => setIsWeChatOpen(false)}
          onTabChange={setActiveWeChatTab}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(180, 180, 180, 0.6)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  doneButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: 'rgba(180, 180, 180, 0.8)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1000
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold'
  },
  container: {
    backgroundColor: '#3498db',
    flex: 1
  },
  boardRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    width: '100%'
  },
  gridSection: {
    flex: 1,
    position: 'relative',
    width: '100%'
  },
  boardContainer: {
    alignSelf: 'center',
    flex: 1,
    position: 'relative'
  },

  deleteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(180, 180, 180, 0.8)',
    borderRadius: 20,
    height: 25,
    justifyContent: 'center',
    left: -10,
    position: 'absolute',
    top: -10,
    width: 25
  },
  deleteButtonText: {
    color: 'black',
    fontSize: 28,
    lineHeight: 28
  },
  icon: {
    alignItems: 'center',
    gap: 6
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderCurve: 'continuous',
    boxShadow: '0px 8px 16px rgba(0,0,0,0.18)',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 6
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center'
  },
  widgetWrapper: {
    borderRadius: 28,
    elevation: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24
  },
  widgetContainer: {
    borderCurve: 'continuous',
    borderRadius: 28,
    flex: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 20,
    // Android兼容性修复
    elevation: 0
  },
  widgetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  widgetLocation: {
    color: '#f6f7fb',
    fontSize: 20,
    fontWeight: '700'
  },
  widgetCondition: {
    color: 'rgba(235, 239, 255, 0.7)',
    fontSize: 14,
    marginTop: 4
  },
  widgetBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  widgetBadgeText: {
    fontSize: 26
  },
  widgetTemperatureRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 2
  },
  widgetRangeSection: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 25 : 20,
    right: Platform.OS === 'android' ? 85 : 80,
    bottom: Platform.OS === 'android' ? 65 : 60,
    width: Platform.OS === 'android' ? 95 : 100,
    justifyContent: 'center',
    alignItems: 'center',
    // Android兼容性修复
    elevation: 0,
    zIndex: 1
  },
  widgetTemperature: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 16
  },
  widgetRangeCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(12, 16, 34, 0.4)',
    borderRadius: 16,
    gap: 3,
    paddingHorizontal: 16,
    paddingVertical: 20,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    // Android兼容性修复
    elevation: 0,
    overflow: 'hidden'
  },
  widgetRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8
  },
  widgetRangeLabel: {
    color: 'rgba(226, 232, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600'
  },
  widgetRangeValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20
  },
  widgetRangeDivider: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    height: StyleSheet.hairlineWidth,
    marginVertical: 4
  },
  widgetDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    height: StyleSheet.hairlineWidth,
    marginTop: 16
  },
  widgetForecastRow: {
    columnGap: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0
  },
  widgetForecastItem: {
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 2
  },
  widgetForecastTime: {
    color: 'rgba(226, 232, 255, 0.75)',
    fontSize: 12,
    marginBottom: 6
  },
  widgetForecastTemp: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700'
  },
  dockBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderCurve: 'continuous',
    borderRadius: 44,
    bottom: 0,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 18
  },
  dockSection: {
    alignItems: 'center',
    flexShrink: 0,
    width: '100%'
  },
  dockZone: {
    justifyContent: 'center',
    paddingVertical: 0
  },
  zoneContainer: {
    flex: 1
  }
});