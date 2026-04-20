import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import ModeCard from '@/components/game/ModeCard';
import QuestionDisplay from '@/components/game/QuestionDisplay';
import NumberPad from '@/components/game/NumberPad';
import GameTimer from '@/components/game/GameTimer';
import ResultModal from '@/components/game/ResultModal';
import { usePlayer } from '@/hooks/usePlayer';
import { playSound, loadSounds } from '@/lib/audio';
import {
  GAME_MODES,
  DIFFICULTY_CONFIGS,
  generateQuestions,
  calculateStars,
  calculateScore,
  getModeById,
  TOTAL_Q,
} from '@/lib/gameLogic';
import type { Operation, Difficulty, Question } from '@/types/game';

type Screen = 'select' | 'difficulty' | 'game';

export default function PlayScreen() {
  const { player, submitSession } = usePlayer();
  const [screen, setScreen] = useState<Screen>('select');
  const [selectedOp, setSelectedOp] = useState<Operation>('addition');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('easy');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [timeLeft, setTimeLeft] = useState(15);
  const [startTime, setStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCorrect, setFinalCorrect] = useState(0);
  const [finalStars, setFinalStars] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef(false);

  useEffect(() => {
    loadSounds().catch(() => {});
  }, []);

  const diffConfig = DIFFICULTY_CONFIGS.find((d) => d.id === selectedDiff)!;
  const mode = getModeById(selectedOp);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleGameEnd = useCallback(
    (finalQ: Question[], finalIdx: number, finalCorrectAns: number, finalScoreVal: number) => {
      clearTimer();
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const stars = calculateStars(finalCorrectAns, TOTAL_Q);
      setFinalScore(finalScoreVal);
      setFinalCorrect(finalCorrectAns);
      setFinalStars(stars);
      setShowResult(true);
      if (player) {
        submitSession({
          operation: selectedOp,
          difficulty: selectedDiff,
          score: finalScoreVal,
          correctAnswers: finalCorrectAns,
          totalQuestions: TOTAL_Q,
          durationSeconds: duration,
          stars,
        }).catch(() => {});
      }
    },
    [startTime, player, selectedOp, selectedDiff, submitSession]
  );

  const advanceQuestion = useCallback(
    (
      isCorrect: boolean,
      currentQ: Question[],
      idx: number,
      currentScore: number,
      currentCorrect: number
    ) => {
      clearTimer();
      const newScore = isCorrect
        ? currentScore + diffConfig.pointsPerCorrect
        : currentScore;
      const newCorrect = isCorrect ? currentCorrect + 1 : currentCorrect;

      setTimeout(() => {
        setFeedback('none');
        feedbackRef.current = false;
        if (idx + 1 >= TOTAL_Q) {
          setScore(newScore);
          setCorrectCount(newCorrect);
          if (isCorrect) playSound('starEarn').catch(() => {});
          playSound('gameEnd').catch(() => {});
          handleGameEnd(currentQ, idx + 1, newCorrect, newScore);
        } else {
          setCurrentIndex(idx + 1);
          setUserAnswer('');
          setScore(newScore);
          setCorrectCount(newCorrect);
          setTimeLeft(diffConfig.timePerQuestion);
        }
      }, 800);
    },
    [diffConfig, handleGameEnd]
  );

  useEffect(() => {
    if (screen !== 'game' || questions.length === 0 || showResult) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!feedbackRef.current) {
            feedbackRef.current = true;
            setFeedback('incorrect');
            advanceQuestion(false, questions, currentIndex, score, correctCount);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [screen, questions, currentIndex, showResult]);

  const startGame = (op: Operation, diff: Difficulty) => {
    const q = generateQuestions(op, diff);
    setQuestions(q);
    setCurrentIndex(0);
    setUserAnswer('');
    setScore(0);
    setCorrectCount(0);
    setFeedback('none');
    feedbackRef.current = false;
    setTimeLeft(DIFFICULTY_CONFIGS.find((d) => d.id === diff)!.timePerQuestion);
    setStartTime(Date.now());
    setShowResult(false);
    setScreen('game');
    playSound('gameStart').catch(() => {});
  };

  const handleKeyPress = (val: string) => {
    if (feedbackRef.current) return;
    setUserAnswer((prev) => (prev.length < 4 ? prev + val : prev));
  };

  const handleDelete = () => {
    if (feedbackRef.current) return;
    setUserAnswer((prev) => prev.slice(0, -1));
  };

  const handleSubmit = useCallback(() => {
    if (feedbackRef.current || !userAnswer) return;
    const correct = parseInt(userAnswer, 10) === questions[currentIndex]?.answer;
    feedbackRef.current = true;
    setFeedback(correct ? 'correct' : 'incorrect');
    advanceQuestion(correct, questions, currentIndex, score, correctCount);
  }, [userAnswer, questions, currentIndex, score, correctCount, advanceQuestion]);

  const handlePlayAgain = () => {
    setShowResult(false);
    startGame(selectedOp, selectedDiff);
  };

  const handleGoHome = () => {
    setShowResult(false);
    setScreen('select');
  };

  if (screen === 'select') {
    return (
      <SafeAreaView style={styles.safe}>
        <LinearGradient
          colors={['#4ECDC4', '#44B7AF']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Choose a Game</Text>
          <Text style={styles.headerSub}>Pick your math adventure!</Text>
        </LinearGradient>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {GAME_MODES.map((m) => (
            <ModeCard
              key={m.id}
              mode={m}
              onPress={() => {
                setSelectedOp(m.id);
                setScreen('difficulty');
              }}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'difficulty') {
    return (
      <SafeAreaView style={styles.safe}>
        <LinearGradient
          colors={[mode.color, mode.color + 'BB']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => setScreen('select')} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.modeEmoji}>{mode.emoji}</Text>
          <Text style={styles.headerTitle}>{mode.label}</Text>
          <Text style={styles.headerSub}>Choose your difficulty</Text>
        </LinearGradient>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.diffList} showsVerticalScrollIndicator={false}>
          {DIFFICULTY_CONFIGS.map((d) => {
            const selected = selectedDiff === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => setSelectedDiff(d.id)}
                style={[styles.diffCard, selected && { borderColor: mode.color, borderWidth: 3 }]}
              >
                <View style={styles.diffLeft}>
                  <Text style={styles.diffEmoji}>
                    {d.id === 'easy' ? '⭐' : d.id === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                  </Text>
                  <View>
                    <Text style={styles.diffLabel}>{d.label}</Text>
                    <Text style={styles.diffDesc}>Numbers {d.range[0]}–{d.range[1]}</Text>
                    <Text style={styles.diffDesc}>{d.timePerQuestion}s per question</Text>
                  </View>
                </View>
                <View style={[styles.diffPoints, { backgroundColor: mode.color + '22' }]}>
                  <Text style={[styles.diffPointsVal, { color: mode.color }]}>{d.pointsPerCorrect}</Text>
                  <Text style={[styles.diffPointsLabel, { color: mode.color }]}>pts</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: mode.color }]}
            onPress={() => startGame(selectedOp, selectedDiff)}
          >
            <Text style={styles.startBtnText}>Start Game! 🚀</Text>
          </TouchableOpacity>

          {!player && (
            <Text style={styles.guestNote}>💡 Create a profile to save your scores!</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex) / TOTAL_Q) * 100;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: mode.lightColor }]}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={handleGoHome} style={styles.gameBackBtn}>
          <ArrowLeft size={20} color="#2C3E50" />
        </TouchableOpacity>
        <View style={styles.gameProgress}>
          <Text style={styles.gameProgressText}>{currentIndex + 1} / {TOTAL_Q}</Text>
          <View style={styles.gameProgressTrack}>
            <View style={[styles.gameProgressBar, { width: `${progress}%`, backgroundColor: mode.color }]} />
          </View>
        </View>
        <View style={[styles.gameScorePill, { backgroundColor: mode.color + '22' }]}>
          <Text style={[styles.gameScoreText, { color: mode.color }]}>⭐ {score}</Text>
        </View>
      </View>

      {current && (
        <GameTimer
          totalTime={diffConfig.timePerQuestion}
          timeLeft={timeLeft}
          color={mode.color}
        />
      )}

      <View style={styles.gameBody}>
        {current && (
          <QuestionDisplay
            question={current.display}
            userAnswer={userAnswer}
            feedback={feedback}
            questionIndex={currentIndex}
            color={mode.color}
          />
        )}
      </View>

      <NumberPad
        onPress={handleKeyPress}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
        disabled={feedbackRef.current}
      />

      <ResultModal
        visible={showResult}
        score={finalScore}
        correct={finalCorrect}
        total={TOTAL_Q}
        stars={finalStars}
        operation={selectedOp}
        color={mode.color}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeEmoji: { fontSize: 36, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 4 },
  scroll: { flex: 1 },
  list: { padding: 20, paddingTop: 24 },
  diffList: { padding: 20, paddingTop: 24 },
  diffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  diffLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  diffEmoji: { fontSize: 22 },
  diffLabel: { fontSize: 18, fontWeight: '800', color: '#2C3E50' },
  diffDesc: { fontSize: 12, color: '#95A5A6', fontWeight: '500', marginTop: 2 },
  diffPoints: {
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  diffPointsVal: { fontSize: 22, fontWeight: '900' },
  diffPointsLabel: { fontSize: 10, fontWeight: '700' },
  startBtn: {
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtnText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  guestNote: {
    textAlign: 'center',
    fontSize: 13,
    color: '#95A5A6',
    fontWeight: '600',
    marginTop: 14,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  gameBackBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  gameProgress: { flex: 1 },
  gameProgressText: { fontSize: 13, fontWeight: '700', color: '#636E72', marginBottom: 4 },
  gameProgressTrack: { height: 8, backgroundColor: '#E8EDF2', borderRadius: 8, overflow: 'hidden' },
  gameProgressBar: { height: '100%', borderRadius: 8 },
  gameScorePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  gameScoreText: { fontSize: 15, fontWeight: '800' },
  gameBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
