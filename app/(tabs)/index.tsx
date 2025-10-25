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
import { useRouter } from 'expo-router';


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconData = {
  image: ImageSourcePropType;
  label: string;
  route?: string;
};

const ICONS: Array<IconData> = [
  { image: require('../../assets/images/app-icons/zhizhihu.png'), label: '知之乎', route: '/zhizhihu/chats' },
  { image: require('../../assets/images/app-icons/facebook.png'), label: 'Facebook' },
  { image: require('../../assets/images/app-icons/instagram.png'), label: 'Instagram' },
  { image: require('../../assets/images/app-icons/twitter.png'), label: 'Twitter' },
  { image: require('../../assets/images/app-icons/whatsapp.png'), label: 'WhatsApp' },
  { image: require('../../assets/images/app-icons/gmail.png'), label: 'Gmail' },
  { image: require('../../assets/images/app-icons/google.png'), label: 'Google' },
  { image: require('../../assets/images/app-icons/youtube.png'), label: 'YouTube' },
  { image: require('../../assets/images/app-icons/spotify.png'), label: 'Spotify' },
  { image: require('../../assets/images/app-icons/paypal.png'), label: 'PayPal' },
  { image: require('../../assets/images/app-icons/amazon.png'), label: 'Amazon' },
  { image: require('../../assets/images/app-icons/github.png'), label: 'GitHub' },
  { image: require('../../assets/images/app-icons/telegram.png'), label: 'Telegram' }
];

const keyExtractor = (item: IconData) => item.label;

const shakeTimingConfig = {
  duration: 150,
  easing: Easing.inOut(Easing.ease)
};

type IconProps = {
  item: IconData;
  isEditing: SharedValue<boolean>;
  onDelete: (item: IconData) => void;
  onPress: (item: IconData) => void;
};

const Icon = memo(function Icon({ isEditing, item, onDelete, onPress }: IconProps) {
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
    isEditing.value && !isActive.value
      ? { opacity: withTiming(1), pointerEvents: 'auto' }
      : { opacity: withTiming(0), pointerEvents: 'none' }
  );

  return (
    <Animated.View style={[styles.icon, animatedShakeStyle]}>
      <Pressable onPress={() => onPress(item)} style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
      </Pressable>
      <Text style={styles.text}>{item.label}</Text>
      <AnimatedPressable
        style={[styles.deleteButton, animatedDeleteButtonStyle]}
        onPress={onDelete.bind(null, item)}>
        <Text style={styles.deleteButtonText}>-</Text>
      </AnimatedPressable>
    </Animated.View>
  );
});

export default function AppleIconSort() {
  const [icons, setIcons] = useState(ICONS);
  const [isEditing, setIsEditing] = useState(false);
  const isEditingValue = useDerivedValue(() => isEditing);
  const router = useRouter();

  // 控制状态栏显示/隐藏
  useEffect(() => {
    // 当进入编辑模式时隐藏状态栏
    if (isEditing) {
      // 使用 expo-status-bar 的 hidden 属性
      // StatusBar 组件会自动处理隐藏/显示
    }
  }, [isEditing]);

  const handleIconDelete = useCallback((item: IconData) => {
    setIcons(prevIcons => prevIcons.filter(icon => icon.label !== item.label));
  }, []);

  const handleIconPress = useCallback((item: IconData) => {
    if (!isEditing && item.route) {
      router.push(item.route);
    }
  }, [isEditing, router]);

  const renderItem = useCallback<SortableGridRenderItem<IconData>>(
    ({ item }) => (
      <Icon
        isEditing={isEditingValue}
        item={item}
        onDelete={handleIconDelete}
        onPress={handleIconPress}
      />
    ),
    [isEditingValue, handleIconDelete, handleIconPress]
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
      <View style={styles.contentWrapper}>
        <Sortable.Grid
          columnGap={24}
          columns={4}
          data={icons}
          inactiveItemOpacity={1}
          keyExtractor={keyExtractor}
          overflow='visible'
          renderItem={renderItem}
          rowGap={24}
          snapOffsetX='70%'
          onDragEnd={({ data }) => {
            setIcons(data);
          }}
          onDragStart={() => {
            if (!isEditing) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setIsEditing(true);
            }
          }}
        />
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
  contentWrapper: {
    alignContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 10
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
  }
});