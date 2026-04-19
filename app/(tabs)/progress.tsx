import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Target, Flame, BookOpen } from 'lucide-react-native';
import { usePlayer } from '@/hooks/usePlayer';
import StarRating from '@/components/ui/StarRating';
import { getModeById } from '@/lib/gameLogic';
import { getLeaderboard } from '@/lib/supabase';

interface Session {
  id: string;
  operation: string;
  difficulty: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  stars: number;
  played_at: string;
}

interface LeaderEntry {
  id: string;
  name: string;
  avatar_color: string;
  total_score: number;
  games_played: number;
}

export default function ProgressScreen() {
  const { player, fetchSessions } = usePlayer();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, l] = await Promise.all([
        fetchSessions(),
        getLeaderboard(10),
      ]);
      setSessions(s as Session[]);
      setLeaderboard(l as LeaderEntry[]);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchSessions]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const totalCorrect = sessions.reduce((s, g) => s + g.correct_answers, 0);
  const totalQuestions = sessions.reduce((s, g) => s + g.total_questions, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.score)) : 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#FF85A1', '#FF6B6B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Progress</Text>
        {player ? (
          <View style={styles.headerPlayer}>
            <View style={[styles.headerAvatar, { backgroundColor: player.avatarColor }]}>
              <Text style={styles.headerAvatarText}>{player.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.headerPlayerName}>{player.name}</Text>
          </View>
        ) : (
          <Text style={styles.headerSub}>Play a game to see your stats!</Text>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {player && (
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: '#FFF0E0' }]}>
              <Trophy size={24} color="#FF9A3C" />
              <Text style={[styles.statVal, { color: '#FF9A3C' }]}>{player.totalScore}</Text>
              <Text style={styles.statLbl}>Total Score</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#FFE8EE' }]}>
              <Target size={24} color="#FF85A1" />
              <Text style={[styles.statVal, { color: '#FF85A1' }]}>{accuracy}%</Text>
              <Text style={styles.statLbl}>Accuracy</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#E8F7EA' }]}>
              <Flame size={24} color="#6BCB77" />
              <Text style={[styles.statVal, { color: '#6BCB77' }]}>{player.currentStreak}</Text>
              <Text style={styles.statLbl}>Day Streak</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#E8F4FF' }]}>
              <BookOpen size={24} color="#74B9FF" />
              <Text style={[styles.statVal, { color: '#74B9FF' }]}>{player.gamesPlayed}</Text>
              <Text style={styles.statLbl}>Games</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
        <View style={styles.leaderCard}>
          {loading ? (
            <ActivityIndicator color="#FF85A1" size="small" style={{ padding: 20 }} />
          ) : leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>No players yet. Be the first!</Text>
          ) : (
            leaderboard.map((entry, i) => {
              const isMe = player?.id === entry.id;
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
              return (
                <View key={entry.id} style={[styles.leaderRow, isMe && styles.leaderRowMe]}>
                  <Text style={styles.leaderMedal}>{medal}</Text>
                  <View style={[styles.leaderAvatar, { backgroundColor: entry.avatar_color }]}>
                    <Text style={styles.leaderAvatarText}>{entry.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={[styles.leaderName, isMe && { color: '#FF85A1' }]}>
                      {entry.name}{isMe ? ' (You)' : ''}
                    </Text>
                    <Text style={styles.leaderGames}>{entry.games_played} games</Text>
                  </View>
                  <Text style={styles.leaderScore}>{entry.total_score}</Text>
                </View>
              );
            })
          )}
        </View>

        <Text style={styles.sectionTitle}>📊 Recent Games</Text>
        {loading ? (
          <ActivityIndicator color="#FF85A1" size="small" style={{ padding: 20 }} />
        ) : sessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎮</Text>
            <Text style={styles.emptyTitle}>No games yet!</Text>
            <Text style={styles.emptySubtitle}>Head to the Play tab to start your first game</Text>
          </View>
        ) : (
          sessions.map((s) => {
            const m = getModeById(s.operation as any);
            const pct = Math.round((s.correct_answers / s.total_questions) * 100);
            return (
              <View key={s.id} style={styles.sessionCard}>
                <View style={[styles.sessionIcon, { backgroundColor: m.lightColor }]}>
                  <Text style={styles.sessionEmoji}>{m.emoji}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{m.label}</Text>
                  <View style={styles.sessionMeta}>
                    <Text style={[styles.sessionDiff, { color: m.color }]}>
                      {s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1)}
                    </Text>
                    <Text style={styles.sessionDot}>·</Text>
                    <Text style={styles.sessionAcc}>{pct}% accuracy</Text>
                  </View>
                  <Text style={styles.sessionDate}>{formatDate(s.played_at)}</Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={[styles.sessionScore, { color: m.color }]}>{s.score}</Text>
                  <StarRating stars={s.stars} size={14} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  headerPlayer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerPlayerName: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.95)' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    width: '47%',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  statVal: { fontSize: 28, fontWeight: '900' },
  statLbl: { fontSize: 12, color: '#95A5A6', fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#2C3E50', marginBottom: 12 },
  leaderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  leaderRowMe: { backgroundColor: '#FFF0F4' },
  leaderMedal: { fontSize: 18, width: 36, textAlign: 'center' },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  leaderAvatarText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
  leaderGames: { fontSize: 12, color: '#95A5A6', fontWeight: '500' },
  leaderScore: { fontSize: 18, fontWeight: '800', color: '#FF85A1' },
  emptyText: { textAlign: 'center', color: '#95A5A6', padding: 20, fontWeight: '500' },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#2C3E50', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#95A5A6', fontWeight: '500', textAlign: 'center' },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionEmoji: { fontSize: 24 },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  sessionDiff: { fontSize: 12, fontWeight: '700' },
  sessionDot: { color: '#BDC3C7', marginHorizontal: 4, fontSize: 12 },
  sessionAcc: { fontSize: 12, color: '#95A5A6', fontWeight: '500' },
  sessionDate: { fontSize: 11, color: '#BDC3C7', fontWeight: '500', marginTop: 2 },
  sessionRight: { alignItems: 'flex-end', gap: 4 },
  sessionScore: { fontSize: 18, fontWeight: '900' },
});
