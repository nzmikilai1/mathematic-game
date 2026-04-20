import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Star, Zap, Volume2, VolumeX } from 'lucide-react-native';
import { usePlayer } from '@/hooks/usePlayer';
import { areSoundsEnabled, setSoundsEnabled, loadSounds, initializeAudio } from '@/lib/audio';
import { AVATAR_COLORS } from '@/lib/gameLogic';

export default function HomeScreen() {
  const { player, loading, registerPlayer } = usePlayer();
  const [showSetup, setShowSetup] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(areSoundsEnabled());

  const headerScale = useSharedValue(1);
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  useEffect(() => {
    initializeAudio().catch(() => {});
    loadSounds().catch(() => {});
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setSoundEnabledState(newState);
  };

  const handleCreate = async () => {
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      await registerPlayer(name.trim(), selectedColor);
      setShowSetup(false);
    } catch {
      setError('Something went wrong. Try again!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FF9A3C', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.soundBtn} onPress={toggleSound}>
            {soundEnabled ? (
              <Volume2 size={20} color="#FFF" />
            ) : (
              <VolumeX size={20} color="#FFF" />
            )}
          </TouchableOpacity>
          <Animated.View style={[styles.heroInner, headerStyle]}>
            <Text style={styles.heroEmoji}>🧮</Text>
            <Text style={styles.heroTitle}>MathQuest</Text>
            <Text style={styles.heroSubtitle}>Learn Math the Fun Way!</Text>
          </Animated.View>
        </LinearGradient>

        {player ? (
          <View style={styles.playerCard}>
            <View style={[styles.avatar, { backgroundColor: player.avatarColor }]}>
              <Text style={styles.avatarText}>{player.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerGreeting}>Hello, {player.name}! 👋</Text>
              <Text style={styles.playerSub}>Ready to practice math today?</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.setupBanner} onPress={() => setShowSetup(true)}>
            <Text style={styles.setupEmoji}>✏️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.setupTitle}>Set Up Your Profile</Text>
              <Text style={styles.setupSub}>Create your player profile to save progress</Text>
            </View>
            <Text style={styles.setupArrow}>→</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFF0E0' }]}>
            <Star size={22} color="#FF9A3C" fill="#FF9A3C" />
            <Text style={[styles.statValue, { color: '#FF9A3C' }]}>{player?.totalScore ?? 0}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F7EA' }]}>
            <Zap size={22} color="#6BCB77" fill="#6BCB77" />
            <Text style={[styles.statValue, { color: '#6BCB77' }]}>{player?.currentStreak ?? 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F4FF' }]}>
            <BookOpen size={22} color="#74B9FF" />
            <Text style={[styles.statValue, { color: '#74B9FF' }]}>{player?.gamesPlayed ?? 0}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Did You Know?</Text>
          <Text style={styles.tipsText}>
            Practicing math every day helps your brain grow stronger! Try to answer quickly for bonus points!
          </Text>
        </View>

        <View style={styles.howToPlay}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          {[
            { icon: '1️⃣', text: 'Choose a math operation from the Play tab' },
            { icon: '2️⃣', text: 'Select your difficulty level' },
            { icon: '3️⃣', text: 'Answer 10 questions as fast as you can' },
            { icon: '4️⃣', text: 'Earn stars and beat your high score!' },
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showSetup} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.setupModal}>
            <Text style={styles.setupModalTitle}>Create Your Profile</Text>
            <Text style={styles.setupModalSub}>What should we call you?</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              maxLength={20}
              autoFocus
            />
            {error ? <Text style={styles.inputError}>{error}</Text> : null}

            <Text style={styles.colorLabel}>Pick your color:</Text>
            <View style={styles.colorRow}>
              {AVATAR_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotSelected]}
                />
              ))}
            </View>

            <View style={styles.previewRow}>
              <View style={[styles.previewAvatar, { backgroundColor: selectedColor }]}>
                <Text style={styles.previewAvatarText}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
              </View>
              <Text style={styles.previewName}>{name || 'Your Name'}</Text>
            </View>

            <TouchableOpacity
              style={[styles.createBtn, saving && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={saving}
            >
              <Text style={styles.createBtnText}>{saving ? 'Creating...' : "Let's Go! 🚀"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  scroll: { flex: 1 },
  content: { paddingBottom: 32 },
  hero: {
    marginHorizontal: 0,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroInner: { alignItems: 'center' },
  heroEmoji: { fontSize: 64, marginBottom: 8 },
  heroTitle: { fontSize: 42, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  heroSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 4 },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  playerInfo: { flex: 1 },
  playerGreeting: { fontSize: 18, fontWeight: '800', color: '#2C3E50' },
  playerSub: { fontSize: 13, color: '#95A5A6', fontWeight: '500', marginTop: 2 },
  setupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFD93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  setupEmoji: { fontSize: 28, marginRight: 12 },
  setupTitle: { fontSize: 16, fontWeight: '800', color: '#2C3E50' },
  setupSub: { fontSize: 12, color: '#95A5A6', fontWeight: '500', marginTop: 2 },
  setupArrow: { fontSize: 20, color: '#FF9A3C', fontWeight: '700' },
  soundBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#95A5A6', fontWeight: '600', textAlign: 'center' },
  tipsCard: {
    backgroundColor: '#FFF9E8',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  tipsTitle: { fontSize: 15, fontWeight: '800', color: '#2C3E50', marginBottom: 6 },
  tipsText: { fontSize: 13, color: '#636E72', lineHeight: 20, fontWeight: '500' },
  howToPlay: { marginHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#2C3E50', marginBottom: 14 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepIcon: { fontSize: 22, marginRight: 12 },
  stepText: { fontSize: 14, color: '#2C3E50', fontWeight: '600', flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  setupModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: 40,
  },
  setupModalTitle: { fontSize: 26, fontWeight: '900', color: '#2C3E50', marginBottom: 4 },
  setupModalSub: { fontSize: 15, color: '#95A5A6', fontWeight: '500', marginBottom: 20 },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 2,
    borderColor: '#E8EDF2',
    color: '#2C3E50',
  },
  inputError: { color: '#FF6B6B', fontSize: 13, fontWeight: '600', marginTop: 6 },
  colorLabel: { fontSize: 15, fontWeight: '700', color: '#2C3E50', marginTop: 18, marginBottom: 10 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#2C3E50',
    transform: [{ scale: 1.15 }],
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  previewAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarText: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  previewName: { fontSize: 20, fontWeight: '800', color: '#2C3E50' },
  createBtn: {
    backgroundColor: '#FF6B6B',
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  createBtnText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
});
