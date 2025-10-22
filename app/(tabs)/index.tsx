import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ImageSourcePropType,
  LayoutRectangle,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    type SharedValue,
    useAnimatedStyle,
    useDerivedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sortable, {
  type SortableFlexDragEndParams,
  useItemContext
} from 'react-native-sortables';


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

const APP_ICONS: AppIconItem[] = [
  { image: require('../../assets/images/app-icons/facebook.png'), kind: 'app', label: 'Facebook' },
  { image: require('../../assets/images/app-icons/instagram.png'), kind: 'app', label: 'Instagram' },
  { image: require('../../assets/images/app-icons/twitter.png'), kind: 'app', label: 'Twitter' },
  { image: require('../../assets/images/app-icons/whatsapp.png'), kind: 'app', label: 'WhatsApp' },
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
  condition: 'Mostly Sunny',
  high: '24°',
  hourly: [
    { temperature: '22°', time: 'Now' },
    { temperature: '23°', time: '2 PM' },
    { temperature: '23°', time: '3 PM' },
    { temperature: '21°', time: '4 PM' }
  ],
  id: 'weather-widget',
  kind: 'weather',
  location: 'San Francisco',
  low: '18°',
  temperature: '22°'
};

const shakeTimingConfig = {
  duration: 150,
  easing: Easing.inOut(Easing.ease)
};

const GRID_COLUMNS = 4;
const GRID_COLUMN_GAP = 16;
const GRID_ROW_GAP = 18;
const GRID_HORIZONTAL_PADDING = 22;
const GRID_VERTICAL_PADDING = 14;
const DOCK_BACKGROUND_VERTICAL_PADDING = 14;
const DOCK_BACKGROUND_HORIZONTAL_PADDING = 24;
const DOCK_CAPACITY = 4;

type IconProps = {
  containerStyle?: StyleProp<ViewStyle>;
  isEditing: SharedValue<boolean>;
  item: AppIconItem;
  onDelete?: (item: AppIconItem) => void;
  showDelete?: boolean;
  size: number;
};

const Icon = memo(function Icon({
  containerStyle,
  isEditing,
  item,
  onDelete,
  showDelete = true,
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

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shakeProgress.value}deg` }]
  }));

  const animatedDeleteButtonStyle = useAnimatedStyle(() =>
    isEditing.value && !isActive.value && showDelete
      ? { opacity: withTiming(1), pointerEvents: 'auto' }
      : { opacity: withTiming(0), pointerEvents: 'none' }
  );

  const iconCornerRadius = Math.round(size * 0.23);
  const imageSize = size - 12;

  return (
    <Animated.View
      style={[
        styles.icon,
        animatedShakeStyle,
        { width: size },
        containerStyle
      ]}>
      <View
        style={[
          styles.imageContainer,
          {
            borderRadius: iconCornerRadius,
            height: size,
            width: size
          }
        ]}>
        <Image
          resizeMode='contain'
          source={item.image}
          style={{ height: imageSize, width: imageSize }}
        />
      </View>
      <Text numberOfLines={1} style={styles.text}>
        {item.label}
      </Text>
      {showDelete && onDelete && (
        <AnimatedPressable
          style={[styles.deleteButton, animatedDeleteButtonStyle]}
          onPress={() => onDelete(item)}>
          <Text style={styles.deleteButtonText}>-</Text>
        </AnimatedPressable>
      )}
    </Animated.View>
  );
});

type WeatherWidgetProps = {
  isEditing: SharedValue<boolean>;
  item: WeatherWidgetItem;
  onDelete: (item: WeatherWidgetItem) => void;
  size: { height: number; width: number };
};

const WeatherWidget = memo(function WeatherWidget({
  isEditing,
  item,
  onDelete,
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
      <View style={styles.widgetContainer}>
        <View style={styles.widgetHeader}>
          <View>
            <Text style={styles.widgetLocation}>{item.location}</Text>
            <Text style={styles.widgetCondition}>{item.condition}</Text>
          </View>
          <View style={styles.widgetTemperatureGroup}>
            <Text style={styles.widgetTemperature}>{item.temperature}</Text>
            <Text style={styles.widgetRange}>{`H: ${item.high}   L: ${item.low}`}</Text>
          </View>
        </View>
        <View style={styles.widgetDivider} />
        <View style={styles.widgetForecastRow}>
          {item.hourly.map(forecastPoint => (
            <View key={forecastPoint.time} style={styles.widgetForecastItem}>
              <Text style={styles.widgetForecastTime}>{forecastPoint.time}</Text>
              <Text style={styles.widgetForecastTemp}>{forecastPoint.temperature}</Text>
            </View>
          ))}
        </View>
      </View>
      <AnimatedPressable
        style={[styles.deleteButton, animatedDeleteButtonStyle]}
        onPress={() => onDelete(item)}>
        <Text style={styles.deleteButtonText}>-</Text>
      </AnimatedPressable>
    </Animated.View>
  );
});

export default function AppleIconSort() {
  const [boardItems, setBoardItems] = useState<BoardItem[]>([
    { ...WEATHER_WIDGET, id: WEATHER_WIDGET.id },
    ...APP_ICONS.slice(4).map(icon => ({ ...icon, id: icon.label })),
    ...APP_ICONS.slice(0, 4).map(icon => ({ ...icon, id: icon.label }))
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const isEditingValue = useDerivedValue(() => isEditing);

  const { width: screenWidth } = useWindowDimensions();

  const boardContentWidth = useMemo(
    () => screenWidth - GRID_HORIZONTAL_PADDING * 2,
    [screenWidth]
  );

  const cellSize = useMemo(() => {
    const computedCellSize =
      (boardContentWidth - GRID_COLUMN_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

    return Math.max(58, Math.min(78, computedCellSize));
  }, [boardContentWidth]);

  const widgetSize = useMemo(
    () => ({
      height: cellSize * 2 + GRID_ROW_GAP,
      width: boardContentWidth
    }),
    [boardContentWidth, cellSize]
  );

  const dockStartIndex = useMemo(
    () => Math.max(0, boardItems.length - DOCK_CAPACITY),
    [boardItems.length]
  );

  const dockAnchorKey = boardItems[dockStartIndex]?.id ?? null;

  const [dockBackgroundLayout, setDockBackgroundLayout] = useState<
    LayoutRectangle | null
  >(null);

  useEffect(() => {
    setDockBackgroundLayout(null);
  }, [dockStartIndex, dockAnchorKey, cellSize]);

  // 控制状态栏显示/隐藏
  useEffect(() => {
    if (isEditing) {
      // StatusBar hidden is managed by component prop
    }
  }, [isEditing]);

  const handleBoardItemDelete = useCallback((item: HomeItem) => {
    setBoardItems(prevItems =>
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

  const handleBoardDragEnd = useCallback(
    ({ order }: SortableFlexDragEndParams) => {
      setBoardItems(prevItems => {
        const reordered = order<BoardItem>(prevItems);
        const next = reordered.map(item => ({ ...item }));
        const dockStart = Math.max(0, reordered.length - DOCK_CAPACITY);
        const weatherIndex = reordered.findIndex(
          item => item.kind === 'weather'
        );

        if (weatherIndex >= dockStart && dockStart > 0) {
          const [weather] = next.splice(weatherIndex, 1);
          next.splice(dockStart - 1, 0, weather);
        }

        return next;
      });
    },
    []
  );

  const handleDockLayout = useCallback((layout: LayoutRectangle | null) => {
    setDockBackgroundLayout(layout);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={isEditing} style="light" />
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
      <View style={styles.gridSection}>
        <View
          style={[
            styles.boardContainer,
            {
              paddingHorizontal: GRID_HORIZONTAL_PADDING,
              paddingTop: GRID_VERTICAL_PADDING
            }
          ]}>
          {dockBackgroundLayout && (
            <View
              pointerEvents='none'
              style={[
                styles.dockBackground,
                {
                  left:
                    GRID_HORIZONTAL_PADDING - DOCK_BACKGROUND_HORIZONTAL_PADDING,
                  top:
                    dockBackgroundLayout.y - DOCK_BACKGROUND_VERTICAL_PADDING,
                  width:
                    boardContentWidth + DOCK_BACKGROUND_HORIZONTAL_PADDING * 2,
                  height:
                    dockBackgroundLayout.height +
                    DOCK_BACKGROUND_VERTICAL_PADDING * 2
                }
              ]}
            />
          )}
          <Sortable.Flex
            columnGap={GRID_COLUMN_GAP}
            flexDirection='row'
            flexWrap='wrap'
            inactiveItemOpacity={1}
            onDragEnd={handleBoardDragEnd}
            rowGap={GRID_ROW_GAP}
            onDragStart={() => {
              if (!isEditing) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setIsEditing(true);
              }
            }}>
            {boardItems.map((item, index) => {
              const key = item.kind === 'app' ? item.label : item.id;
              const isDock = index >= dockStartIndex;
              const isFirstDock = isDock && index === dockStartIndex;

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
                      size={widgetSize}
                    />
                  </View>
                );
              }

              return (
                <View
                  key={key}
                  onLayout={event => {
                    if (isFirstDock) {
                      handleDockLayout(event.nativeEvent.layout);
                    }
                  }}
                  style={{ width: cellSize }}>
                  <Icon
                    containerStyle={
                      isDock ? { marginBottom: 0 } : undefined
                    }
                    isEditing={isEditingValue}
                    item={item}
                    onDelete={handleAppIconDelete}
                    showDelete={!isDock}
                    size={cellSize}
                  />
                </View>
              );
            })}
          </Sortable.Flex>
        </View>
      </View>
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
    alignItems: 'center',
    backgroundColor: '#3498db',
    flex: 1
  },
  gridSection: {
    flex: 1,
    paddingBottom: 24,
    width: '100%'
  },
  boardContainer: {
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
    gap: 8
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderCurve: 'continuous',
    boxShadow: '0px 8px 16px rgba(0,0,0,0.18)',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center'
  },
  widgetWrapper: {
    position: 'relative'
  },
  widgetContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderCurve: 'continuous',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    flex: 1,
    gap: 20,
    justifyContent: 'space-between',
    padding: 18
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  widgetLocation: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '600'
  },
  widgetCondition: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4
  },
  widgetTemperatureGroup: {
    alignItems: 'flex-end'
  },
  widgetTemperature: {
    color: 'white',
    fontSize: 42,
    fontWeight: '700'
  },
  widgetRange: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4
  },
  widgetDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    height: StyleSheet.hairlineWidth
  },
  widgetForecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },
  widgetForecastItem: {
    alignItems: 'center',
    gap: 6
  },
  widgetForecastTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12
  },
  widgetForecastTemp: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  dockBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderCurve: 'continuous',
    borderRadius: 44,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 18
  }
});
