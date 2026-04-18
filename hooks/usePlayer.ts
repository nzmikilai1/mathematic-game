import { useState, useEffect, useCallback } from 'react';
import { createPlayer, getPlayer, updatePlayerStats, saveGameSession, getPlayerSessions } from '@/lib/supabase';
import type { Player, GameSession } from '@/types/game';

const STORAGE_KEY = 'mathquest_player_id';

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
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPlayer = useCallback(async () => {
    if (!globalPlayerId) return;
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
  }, []);

  const submitSession = useCallback(async (session: Omit<GameSession, 'playerId'>) => {
    if (!globalPlayerId) return;
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
  }, [refreshPlayer]);

  const fetchSessions = useCallback(async () => {
    if (!globalPlayerId) return [];
    return getPlayerSessions(globalPlayerId);
  }, []);

  return { player, loading, registerPlayer, refreshPlayer, submitSession, fetchSessions };
}
