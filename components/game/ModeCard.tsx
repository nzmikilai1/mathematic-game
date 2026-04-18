import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import type { GameMode } from '@/types/game';

interface ModeCardProps {
  mode: GameMode;
  onPress: () => void;
  bestScore?: number;
}

export default function ModeCard({ mode, onPress, bestScore }: ModeCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); onPress(); }}
        style={[styles.card, { borderLeftColor: mode.color }]}
      >
        <View style={[styles.iconBox, { backgroundColor: mode.lightColor }]}>
          <Text style={styles.emoji}>{mode.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{mode.label}</Text>
          <Text style={styles.desc}>{mode.description}</Text>
          {bestScore !== undefined && (
            <Text style={[styles.best, { color: mode.color }]}>Best: {bestScore} pts</Text>
          )}
        </View>
        <ChevronRight size={20} color={mode.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    color: '#95A5A6',
    fontWeight: '500',
  },
  best: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
