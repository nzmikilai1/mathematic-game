import { useState, useEffect, useCallback } from 'react';
import { createPlayer, getPlayer, updatePlayerStats, saveGameSession, getPlayerSessions } from '@/lib/supabase';
import type { Player, GameSession } from '@/types/game';

let globalPlayerId: string | null = null;
let globalPlayer: Player | null = null;
const listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function usePlayer() {
  const [player, setPlayer] = useState<Player | null>(globalPlayer);
  const [loading, setLoading] = useState(!globalPlayer);

  useEffect(() => {
    const update = () => {
      setPlayer(globalPlayer);
      setLoading(false);
    };
    listeners.push(update);
    if (!globalPlayer && !globalPlayerId) {
      setLoading(false);
    }
    return () => {
      const idx = listeners.indexOf(update);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const registerPlayer = useCallback(async (name: string, avatarColor: string) => {
    setLoading(true);
    try {
      const data = await createPlayer(name, avatarColor);
      const p: Player = {
        id: data.id,
        name: data.name,
        avatarColor: data.avatar_color,
        totalScore: data.total_score,
        gamesPlayed: data.games_played,
        currentStreak: data.current_streak,
      };
      globalPlayerId = p.id;
      globalPlayer = p;
      notifyListeners();
      return p;
    } catch (err) {
      console.error('Failed to register player:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPlayer = useCallback(async () => {
    if (!globalPlayerId) return;
    try {
      const data = await getPlayer(globalPlayerId);
      if (data) {
        const p: Player = {
          id: data.id,
          name: data.name,
          avatarColor: data.avatar_color,
          totalScore: data.total_score,
          gamesPlayed: data.games_played,
          currentStreak: data.current_streak,
          lastPlayedDate: data.last_played_date,
        };
        globalPlayer = p;
        notifyListeners();
      }
    } catch (err) {
      console.error('Failed to refresh player:', err);
    }
  }, []);

  const submitSession = useCallback(async (session: Omit<GameSession, 'playerId'>) => {
    if (!globalPlayerId) return;
    try {
      await saveGameSession({
        player_id: globalPlayerId,
        operation: session.operation,
        difficulty: session.difficulty,
        score: session.score,
        correct_answers: session.correctAnswers,
        total_questions: session.totalQuestions,
        duration_seconds: session.durationSeconds,
        stars: session.stars,
      });
      await updatePlayerStats(globalPlayerId, session.score);
      await refreshPlayer();
    } catch (err) {
      console.error('Failed to submit game session:', err);
    }
  }, [refreshPlayer]);

  const fetchSessions = useCallback(async () => {
    if (!globalPlayerId) return [];
    try {
      return await getPlayerSessions(globalPlayerId);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      return [];
    }
  }, []);

  return { player, loading, registerPlayer, refreshPlayer, submitSession, fetchSessions };
}
