import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useEffect, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import type { SortableGridRenderItem } from 'react-native-sortables';
import Sortable, { useItemContext } from 'react-native-sortables';


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

const homeKeyExtractor = (item: HomeItem) =>
  item.kind === 'app' ? item.label : item.id;

const dockKeyExtractor = (item: AppIconItem) => item.label;

const shakeTimingConfig = {
  duration: 150,
  easing: Easing.inOut(Easing.ease)
};

type IconProps = {
  item: AppIconItem;
  isEditing: SharedValue<boolean>;
  onDelete?: (item: AppIconItem) => void;
  showDelete?: boolean;
};

const Icon = memo(function Icon({ isEditing, item, onDelete, showDelete = true }: IconProps) {
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

  return (
    <Animated.View style={[styles.icon, animatedShakeStyle]}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
      </View>
      <Text style={styles.text}>{item.label}</Text>
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
};

const WeatherWidget = memo(function WeatherWidget({ isEditing, item, onDelete }: WeatherWidgetProps) {
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
    <Animated.View style={[styles.widgetWrapper, animatedShakeStyle]}>
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
  const [homeItems, setHomeItems] = useState<HomeItem[]>([
    WEATHER_WIDGET,
    ...APP_ICONS.slice(4).map(icon => ({ ...icon }))
  ]);
  const [dockItems, setDockItems] = useState<AppIconItem[]>(
    APP_ICONS.slice(0, 4).map(icon => ({ ...icon }))
  );
  const [isEditing, setIsEditing] = useState(false);
  const isEditingValue = useDerivedValue(() => isEditing);

  // 控制状态栏显示/隐藏
  useEffect(() => {
    // 当进入编辑模式时隐藏状态栏
    if (isEditing) {
      // 使用 expo-status-bar 的 hidden 属性
      // StatusBar 组件会自动处理隐藏/显示
    }
  }, [isEditing]);

  const handleHomeItemDelete = useCallback((item: HomeItem) => {
    setHomeItems(prevItems =>
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
      handleHomeItemDelete(item);
    },
    [handleHomeItemDelete]
  );

  const renderHomeItem = useCallback<SortableGridRenderItem<HomeItem>>(
    ({ item }) =>
      item.kind === 'weather' ? (
        <WeatherWidget isEditing={isEditingValue} item={item} onDelete={handleHomeItemDelete} />
      ) : (
        <Icon
          isEditing={isEditingValue}
          item={item}
          onDelete={handleAppIconDelete}
        />
      ),
    [handleAppIconDelete, handleHomeItemDelete, isEditingValue]
  );

  const renderDockItem = useCallback<SortableGridRenderItem<AppIconItem>>(
    ({ item }) => <Icon isEditing={isEditingValue} item={item} showDelete={false} />,
    [isEditingValue]
  );

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
        <Sortable.Grid
          columnGap={24}
          columns={4}
          data={homeItems}
          inactiveItemOpacity={1}
          keyExtractor={homeKeyExtractor}
          overflow='visible'
          renderItem={renderHomeItem}
          rowGap={24}
          snapOffsetX='70%'
          onDragEnd={({ data }) => {
            setHomeItems(data);
          }}
          onDragStart={() => {
            if (!isEditing) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setIsEditing(true);
            }
          }}
        />
      </View>
      <View style={styles.dockArea}>
        <View style={styles.dockBackground}>
          <Sortable.Grid
            columnGap={24}
            data={dockItems}
            inactiveItemOpacity={1}
            keyExtractor={dockKeyExtractor}
            renderItem={renderDockItem}
            rowGap={0}
            rowHeight={110}
            rows={1}
            onDragEnd={({ data }) => {
              setDockItems(data);
            }}
            onDragStart={() => {
              if (!isEditing) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setIsEditing(true);
              }
            }}
          />
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
    paddingBottom: 20,
    paddingHorizontal: 30,
    paddingTop: 10,
    width: '100%'
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
  image: {
    resizeMode: 'contain',
    width: '100%'
  },
  imageContainer: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderCurve: 'continuous',
    borderRadius: '30%',
    justifyContent: 'center',
    // For some reason this is needed as gesture handler goes crazy
    // when overflow is not set to hidden because the image is likely
    // overflowing the container (the transparent part of the image
    // and gesture handler recognizes press events on wrong items)
    overflow: 'hidden',
    padding: 8
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 5
  },
  widgetWrapper: {
    position: 'relative'
  },
  widgetContainer: {
    aspectRatio: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderCurve: 'continuous',
    borderRadius: 26,
    gap: 16,
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
    justifyContent: 'space-between'
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
  dockArea: {
    paddingBottom: 24,
    paddingHorizontal: 30,
    width: '100%'
  },
  dockBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderCurve: 'continuous',
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 16
  }
});
