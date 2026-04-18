import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, withDelay } from 'react-native-reanimated';
import { Star } from 'lucide-react-native';
import { useEffect } from 'react';

interface StarRatingProps {
  stars: number;
  size?: number;
  animate?: boolean;
}

export default function StarRating({ stars, size = 40, animate = false }: StarRatingProps) {
  const scales = [
    useSharedValue(animate ? 0 : 1),
    useSharedValue(animate ? 0 : 1),
    useSharedValue(animate ? 0 : 1),
  ];

  useEffect(() => {
    if (animate) {
      scales.forEach((s, i) => {
        s.value = withDelay(i * 200, withSpring(1, { damping: 8, stiffness: 200 }));
      });
    }
  }, [animate]);

  const styles0 = useAnimatedStyle(() => ({ transform: [{ scale: scales[0].value }] }));
  const styles1 = useAnimatedStyle(() => ({ transform: [{ scale: scales[1].value }] }));
  const styles2 = useAnimatedStyle(() => ({ transform: [{ scale: scales[2].value }] }));
  const animStyles = [styles0, styles1, styles2];

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={[animStyles[i], { marginHorizontal: 4 }]}>
          <Star
            size={size}
            color={i < stars ? '#FFD93D' : '#DFE6E9'}
            fill={i < stars ? '#FFD93D' : '#DFE6E9'}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
