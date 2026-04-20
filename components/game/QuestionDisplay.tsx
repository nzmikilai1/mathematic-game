import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { playSound } from '@/lib/audio';

interface QuestionDisplayProps {
  question: string;
  userAnswer: string;
  feedback: 'none' | 'correct' | 'incorrect';
  questionIndex: number;
  color: string;
}

export default function QuestionDisplay({
  question,
  userAnswer,
  feedback,
  questionIndex,
  color,
}: QuestionDisplayProps) {
  const translateX = useSharedValue(80);
  const opacity = useSharedValue(0);
  const shake = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = 80;
    opacity.value = 0;
    translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 250 });
  }, [questionIndex]);

  useEffect(() => {
    if (feedback === 'incorrect') {
      shake.value = withSpring(10, { damping: 3 }, () => {
        shake.value = withSpring(0, { damping: 3 });
      });
      bgOpacity.value = withTiming(1, { duration: 150 }, () => {
        bgOpacity.value = withTiming(0, { duration: 400 });
      });
      playSound('incorrect').catch(() => {});
    } else if (feedback === 'correct') {
      bgOpacity.value = withTiming(1, { duration: 150 }, () => {
        bgOpacity.value = withTiming(0, { duration: 400 });
      });
      playSound('correct').catch(() => {});
    }
  }, [feedback]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateX: shake.value }],
    opacity: opacity.value,
  }));

  const feedbackBgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    backgroundColor:
      feedback === 'correct' ? 'rgba(107, 203, 119, 0.15)' : 'rgba(255, 107, 107, 0.15)',
  }));

  const answerColor =
    feedback === 'correct' ? '#6BCB77' : feedback === 'incorrect' ? '#FF6B6B' : '#2C3E50';

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.feedbackBg, feedbackBgStyle]} />

      <View style={[styles.operationTag, { backgroundColor: color + '22' }]}>
        <Text style={[styles.operationTagText, { color }]}>Question {questionIndex + 1}</Text>
      </View>

      <Text style={styles.questionText}>{question}</Text>

      <Text style={styles.equalsText}>=</Text>

      <View style={[styles.answerBox, { borderColor: answerColor + '66' }]}>
        <Text style={[styles.answerText, { color: answerColor }]}>
          {userAnswer || '?'}
        </Text>
      </View>

      {feedback !== 'none' && (
        <Text style={[styles.feedbackEmoji]}>
          {feedback === 'correct' ? '🎉' : '💪'}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    minHeight: 220,
  },
  feedbackBg: {
    borderRadius: 28,
  },
  operationTag: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  operationTagText: {
    fontSize: 14,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 52,
    fontWeight: '800',
    color: '#2C3E50',
    letterSpacing: 2,
  },
  equalsText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#95A5A6',
    marginVertical: 8,
  },
  answerBox: {
    minWidth: 100,
    height: 56,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  answerText: {
    fontSize: 32,
    fontWeight: '800',
  },
  feedbackEmoji: {
    position: 'absolute',
    top: 12,
    right: 16,
    fontSize: 28,
  },
});
