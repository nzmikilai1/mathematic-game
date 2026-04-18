import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

interface GameTimerProps {
  totalTime: number;
  timeLeft: number;
  color: string;
}

export default function GameTimer({ totalTime, timeLeft, color }: GameTimerProps) {
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(timeLeft / totalTime, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [timeLeft]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
    backgroundColor: progress.value > 0.4 ? color : progress.value > 0.2 ? '#FF9A3C' : '#FF6B6B',
  }));

  const isUrgent = timeLeft <= 5;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, isUrgent && styles.urgentLabel]}>⏱</Text>
        <Text style={[styles.time, isUrgent && styles.urgentTime, { color: isUrgent ? '#FF6B6B' : '#2C3E50' }]}>
          {timeLeft}s
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: 16,
    marginRight: 4,
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
  },
  urgentLabel: {},
  urgentTime: {},
  track: {
    height: 10,
    backgroundColor: '#E8EDF2',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
});
