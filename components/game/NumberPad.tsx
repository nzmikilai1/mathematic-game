import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { playSound } from '@/lib/audio';

interface NumberPadProps {
  onPress: (val: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['DEL', '0', 'OK'],
];

interface KeyButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isSpecial?: boolean;
  isOk?: boolean;
}

function KeyButton({ label, onPress, disabled, isSpecial, isOk }: KeyButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 15 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    if (!disabled) {
      playSound('button').catch(() => {});
      onPress();
    }
  };

  return (
    <Animated.View style={[animStyle, styles.keyWrapper]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.key,
          isOk && styles.keyOk,
          isSpecial && styles.keySpecial,
          disabled && styles.keyDisabled,
        ]}
      >
        <Text style={[
          styles.keyText,
          isOk && styles.keyOkText,
          isSpecial && styles.keySpecialText,
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NumberPad({ onPress, onDelete, onSubmit, disabled }: NumberPadProps) {
  return (
    <View style={styles.container}>
      {KEYS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => {
            const isOk = key === 'OK';
            const isDel = key === 'DEL';
            return (
              <KeyButton
                key={key}
                label={key}
                isOk={isOk}
                isSpecial={isDel}
                disabled={disabled}
                onPress={() => {
                  if (isDel) onDelete();
                  else if (isOk) onSubmit();
                  else onPress(key);
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  keyWrapper: {
    marginHorizontal: 8,
  },
  key: {
    width: 76,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E8EDF2',
  },
  keyOk: {
    backgroundColor: '#6BCB77',
    borderColor: '#52B85E',
  },
  keySpecial: {
    backgroundColor: '#FFE8EE',
    borderColor: '#FFCCD8',
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
  },
  keyOkText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  keySpecialText: {
    color: '#FF85A1',
    fontSize: 16,
  },
});
