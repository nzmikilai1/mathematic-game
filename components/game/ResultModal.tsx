import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import StarRating from '@/components/ui/StarRating';
import { Trophy, RotateCcw, Hop as Home } from 'lucide-react-native';

interface ResultModalProps {
  visible: boolean;
  score: number;
  correct: number;
  total: number;
  stars: number;
  operation: string;
  color: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function ResultModal({
  visible,
  score,
  correct,
  total,
  stars,
  operation,
  color,
  onPlayAgain,
  onGoHome,
}: ResultModalProps) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 14, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = 0.6;
      opacity.value = 0;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const message =
    stars === 3 ? 'Amazing! Perfect Score!' :
    stars === 2 ? 'Great Job! Well done!' :
    stars === 1 ? 'Good Try! Keep going!' :
    'Keep Practicing!';

  const emoji =
    stars === 3 ? '🏆' : stars === 2 ? '🎉' : stars === 1 ? '💪' : '📚';

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, containerStyle]}>
          <View style={[styles.header, { backgroundColor: color }]}>
            <Text style={styles.headerEmoji}>{emoji}</Text>
            <Text style={styles.headerTitle}>{message}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <StarRating stars={stars} size={44} animate={visible} />

            <View style={styles.scoreRow}>
              <View style={[styles.scoreBox, { backgroundColor: color + '18' }]}>
                <Trophy size={22} color={color} />
                <Text style={[styles.scoreValue, { color }]}>{score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.bigEmoji}>✅</Text>
                <Text style={styles.scoreValue}>{correct}/{total}</Text>
                <Text style={styles.scoreLabel}>Correct</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.bigEmoji}>📊</Text>
                <Text style={styles.scoreValue}>{pct}%</Text>
                <Text style={styles.scoreLabel}>Accuracy</Text>
              </View>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { backgroundColor: color }]}
                onPress={onPlayAgain}
              >
                <RotateCcw size={20} color="#FFF" />
                <Text style={styles.btnPrimaryText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onGoHome}>
                <Home size={20} color="#636E72" />
                <Text style={styles.btnSecondaryText}>Home</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  body: {
    padding: 24,
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 8,
    gap: 12,
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  bigEmoji: {
    fontSize: 22,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#95A5A6',
    fontWeight: '600',
    marginTop: 2,
  },
  buttons: {
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 18,
    gap: 10,
  },
  btnPrimary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  btnSecondary: {
    backgroundColor: '#F0F4F8',
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  btnSecondaryText: {
    color: '#636E72',
    fontSize: 17,
    fontWeight: '600',
  },
});
