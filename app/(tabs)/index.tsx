import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
const GRID_HORIZONTAL_PADDING = 18;
const GRID_VERTICAL_PADDING = 14;
const DOCK_CAPACITY = 4;
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
  showDelete?: boolean;
  showLabel?: boolean;
  size: number;
};

const Icon = memo(function Icon({
  containerStyle,
  isEditing,
  item,
  onDelete,
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

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shakeProgress.value}deg` }]
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

  return (
    <Animated.View
      style={[
        styles.icon,
        animatedShakeStyle,
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
  const initialDockIcons = useMemo(
    () => APP_ICONS.slice(0, DOCK_CAPACITY).map(icon => ({ ...icon })),
    []
  );
  const initialGridItems = useMemo(
    () =>
      [
        { ...WEATHER_WIDGET, id: WEATHER_WIDGET.id },
        ...APP_ICONS.slice(DOCK_CAPACITY).map(icon => ({ ...icon, id: icon.label }))
      ],
    []
  );

  const [gridItems, setGridItems] = useState<BoardItem[]>(initialGridItems);
  const [dockItems, setDockItems] = useState<AppIconItem[]>(initialDockIcons);
  const [isEditing, setIsEditing] = useState(false);
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
      activeOriginRef.current = origin;
      const sourceItems = origin === 'grid' ? gridItems : dockItems;
      const foundIndex = sourceItems.findIndex(
        item => getBoardItemKey(item as BoardItem) === key
      );
      activeIndexRef.current = foundIndex >= 0 ? foundIndex : null;
      const foundItem = foundIndex >= 0 ? (sourceItems[foundIndex] as BoardItem) : null;
      if (!foundItem) {
        activeItemRef.current = null;
        return;
      }
      if (origin === 'dock') {
        activeItemRef.current = { ...createBoardItemFromApp(foundItem as AppIconItem) };
        return;
      }
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
    dropZoneRef.current = zone;
  }, []);

  const handleGridDragStart = useCallback(
    ({ key }: { key: string }) => {
      captureActiveItem('grid', key);
      if (!isEditing) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsEditing(true);
      }
    },
    [captureActiveItem, isEditing]
  );

  const handleDockDragStart = useCallback(
    ({ key }: { key: string }) => {
      captureActiveItem('dock', key);
      if (!isEditing) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsEditing(true);
      }
    },
    [captureActiveItem, isEditing]
  );

  const handleGridDragEnd = useCallback(
    ({ order, toIndex }: SortableFlexDragEndParams) => {
      const dropZone = dropZoneRef.current;
      const activeItem = activeItemRef.current;
      const activeOrigin = activeOriginRef.current;
      const originIndex = activeIndexRef.current;
      let displacedDockItem: AppIconItem | null = null;

      setGridItems(prevItems => {
        const reordered = order<BoardItem>(prevItems);

        if (dropZone !== 'grid') {
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

      if (dropZone === 'grid' && activeItem && activeOrigin === 'dock' && activeItem.kind === 'app') {
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

      if (dropZone === 'grid') {
        resetActiveTracking();
      } else if (!dropZone) {
        resetActiveTracking();
      }
    },
    [resetActiveTracking]
  );

  const handleDockDragEnd = useCallback(
    ({ order, toIndex }: SortableFlexDragEndParams) => {
      const dropZone = dropZoneRef.current;
      const activeItem = activeItemRef.current;
      const activeOrigin = activeOriginRef.current;
      const originIndex = activeIndexRef.current;
      let displacedGridItem: AppIconItem | null = null;

      setDockItems(prevItems => {
        const reordered = order<AppIconItem>(prevItems);

        if (dropZone !== 'dock') {
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
            const targetIndex = Math.min(maxTargetIndex, next.length - 1);
            displacedGridItem = { ...next[targetIndex] };
            next[targetIndex] = createDockItemFromBoard(activeItem);
            return next;
          }
        }

        return reordered;
      });

      if (dropZone === 'dock' && activeItem && activeOrigin === 'grid' && activeItem.kind === 'app') {
        setGridItems(prevGrid => {
          let nextGrid = prevGrid.filter(
            candidate => getBoardItemKey(candidate) !== getBoardItemKey(activeItem)
          );
          if (displacedGridItem) {
            const insertAt =
              originIndex != null
                ? Math.max(0, Math.min(originIndex, nextGrid.length))
                : nextGrid.length;
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

      if (dropZone === 'dock') {
        resetActiveTracking();
      } else if (!dropZone) {
        resetActiveTracking();
      }
    },
    [resetActiveTracking]
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
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
