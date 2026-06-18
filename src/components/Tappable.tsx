import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale to shrink to while pressed. */
  activeScale?: number;
  haptic?: boolean;
}

/** A press target that gives a subtle spring-scale + optional haptic tap. */
export function Tappable({
  children,
  style,
  activeScale = 0.96,
  haptic = true,
  onPressIn,
  onPress,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 50,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      onPressIn={(e) => {
        animateTo(activeScale);
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPressIn?.(e);
      }}
      onPressOut={() => animateTo(1)}
      onPress={onPress}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
